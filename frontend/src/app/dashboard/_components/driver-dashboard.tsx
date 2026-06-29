'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Search } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';

// Subcomponents
import { DriverStats } from './driver/driver-stats';
import { ActiveJobCard } from './driver/active-job-card';
import { CompletedJobsList } from './driver/completed-jobs-list';
import { JobDetailDialog } from './driver/job-detail-dialog';

interface DriverDashboardProps {
  formatRupiah: (amount: number) => string;
}

export function DriverDashboard({ formatRupiah }: DriverDashboardProps) {
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // 1. Fetch Driver Wallet Balance
  const { data: wallet, isLoading: isLoadingWallet } = useQuery({
    queryKey: ['wallet'],
    queryFn: async () => {
      const response = await api.get('/wallet');
      return response.data;
    },
  });

  // 2. Fetch Driver Jobs (active and completed)
  const { data: myJobs = [], isLoading: isLoadingJobs } = useQuery<any[]>({
    queryKey: ['deliveries-my-jobs'],
    queryFn: async () => {
      const response = await api.get('/deliveries/my-jobs');
      return response.data;
    },
  });

  // 3. Mutation to complete delivery job
  const completeJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.put(`/deliveries/${jobId}/complete`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Pekerjaan berhasil diselesaikan! Pendapatan telah ditambahkan ke dompet.');
      queryClient.invalidateQueries({ queryKey: ['deliveries-my-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menyelesaikan pekerjaan.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal menyelesaikan pekerjaan.');
    },
  });

  // Filter jobs
  const activeJob = myJobs.find((job) => job.status === 'TAKEN');
  const completedJobs = myJobs.filter((job) => job.status === 'COMPLETED');

  // Calculations
  const totalEarnings = completedJobs.reduce((sum, job) => sum + (job.order?.deliveryFee ?? 0), 0);
  const completedCount = completedJobs.length;

  if (isLoadingWallet || isLoadingJobs) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-550 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Memuat dasbor pengemudi...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Driver Earnings & Stats */}
      <DriverStats
        balance={wallet?.balance ?? 0}
        totalEarnings={totalEarnings}
        completedCount={completedCount}
        formatRupiah={formatRupiah}
      />

      {/* Button to Available Jobs */}
      <div className="flex justify-end">
        <Link href="/deliveries/available">
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/10 cursor-pointer text-xs">
            <Search className="h-4.5 w-4.5" /> Cari Pekerjaan Pengiriman Baru
          </Button>
        </Link>
      </div>

      {/* Active Delivery Job */}
      <ActiveJobCard
        activeJob={activeJob}
        formatRupiah={formatRupiah}
        onViewDetails={(jobId) => setSelectedJobId(jobId)}
        onCompleteJob={(jobId) => completeJobMutation.mutate(jobId)}
        isCompleting={completeJobMutation.isPending}
      />

      {/* Finished Jobs History */}
      <CompletedJobsList
        completedJobs={completedJobs}
        formatRupiah={formatRupiah}
        onViewDetails={(jobId) => setSelectedJobId(jobId)}
      />

      {/* JOB DETAIL DIALOG */}
      <JobDetailDialog
        selectedJobId={selectedJobId}
        onClose={() => setSelectedJobId(null)}
        formatRupiah={formatRupiah}
      />
    </div>
  );
}
