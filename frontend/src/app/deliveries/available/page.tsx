'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ArrowLeft,
  Truck,
  MapPin,
  ShieldAlert,
  User as UserIcon,
  Store,
} from 'lucide-react';
import { toast } from 'sonner';
import { JobDetailDialog } from '@/app/dashboard/_components/driver/job-detail-dialog';

interface AvailableJob {
  id: string;
  orderId: string;
  driverId: string | null;
  status: string;
  order?: {
    deliveryAddress: string;
    deliveryMethod: string;
    deliveryFee: number;
    store?: {
      name: string;
    } | null;
    buyer?: {
      username: string;
    } | null;
  } | null;
}

export default function AvailableJobsPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedJobId, setSelectedJobId] = React.useState<string | null>(null);

  const isDriver = user?.activeRole === 'DRIVER';

  // 1. Fetch available jobs
  const { data: availableJobs = [], isLoading: isLoadingJobs } = useQuery<AvailableJob[]>({
    queryKey: ['deliveries-available'],
    queryFn: async () => {
      const response = await api.get('/deliveries/available');
      return response.data;
    },
    enabled: isDriver,
  });

  // 2. Mutation to take a job
  const takeJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const response = await api.put(`/deliveries/${jobId}/take`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Pekerjaan berhasil diambil! Menuju lokasi pengantaran.');
      queryClient.invalidateQueries({ queryKey: ['deliveries-available'] });
      queryClient.invalidateQueries({ queryKey: ['deliveries-my-jobs'] });
      router.push('/dashboard');
    },
    onError: (error: unknown) => {
      const err = error as { response?: { data?: { message?: string } } };
      const msg = err.response?.data?.message || 'Gagal mengambil pekerjaan.';
      toast.error(typeof msg === 'string' ? msg : 'Pekerjaan gagal diambil.');
    },
  });

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoadingAuth || isLoadingJobs) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-950 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-zinc-550">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Memuat lowongan pengiriman...</p>
        </div>
      </div>
    );
  }

  if (!user || !isDriver) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 bg-zinc-950 min-h-[60vh]">
        <Card className="max-w-md border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Akses Ditolak</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Anda harus masuk sebagai Driver (Kurir) untuk mengakses halaman ini.
          </p>
          <div className="mt-4">
            <Link href="/dashboard">
              <Button className="bg-zinc-800 hover:bg-zinc-750 text-white text-xs">
                Kembali ke Dasbor
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Back Link */}
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Dasbor
      </Link>

      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <Truck className="h-7 w-7 text-indigo-400" /> Lowongan Pengiriman
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Daftar pesanan pelanggan berstatus &quot;Menunggu Pengirim&quot; yang siap untuk diantar.
        </p>
      </div>

      {/* Available Jobs list */}
      {availableJobs.length === 0 ? (
        <div className="text-center py-20 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/10 text-zinc-550 space-y-3">
          <Truck className="h-12 w-12 mx-auto opacity-30 text-zinc-650" />
          <p className="text-lg font-semibold text-white">Belum ada lowongan pekerjaan</p>
          <p className="text-sm text-zinc-600 max-w-sm mx-auto">
            Semua pesanan telah diambil oleh driver lain atau belum ada pesanan baru yang diproses oleh Seller.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableJobs.map((job) => (
            <Card
              key={job.id}
              className="border-zinc-800 bg-zinc-900/20 hover:border-zinc-700/60 transition-all flex flex-col justify-between overflow-hidden shadow-lg"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-zinc-850 bg-zinc-900/10 flex items-center justify-between">
                <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded font-mono">
                  ID: {job.id.slice(0, 8)}...
                </span>
                <span className="text-[9px] font-black text-indigo-455 border border-indigo-500/10 bg-indigo-500/5 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  Tersedia
                </span>
              </div>

              {/* Card Content */}
              <CardContent className="p-5 space-y-3 flex-1 text-xs">
                {/* Store Name */}
                <div className="flex gap-2">
                  <Store className="h-4.5 w-4.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold block">Toko Asal</span>
                    <span className="text-zinc-200 font-semibold capitalize">
                      {job.order?.store?.name || 'Toko Seapedia'}
                    </span>
                  </div>
                </div>

                {/* Buyer Name */}
                <div className="flex gap-2">
                  <UserIcon className="h-4.5 w-4.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold block">Penerima (Buyer)</span>
                    <span className="text-zinc-200 font-semibold capitalize">
                      {job.order?.buyer?.username || 'Pelanggan'}
                    </span>
                  </div>
                </div>

                {/* Alamat Tujuan */}
                <div className="flex gap-2">
                  <MapPin className="h-4.5 w-4.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold block">Alamat Tujuan</span>
                    <span className="text-zinc-300 capitalize leading-relaxed">
                      {job.order?.deliveryAddress}
                    </span>
                  </div>
                </div>

                {/* Metode Kirim */}
                <div className="flex gap-2">
                  <Truck className="h-4.5 w-4.5 text-zinc-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 text-[10px] uppercase font-bold block">Metode Pengiriman</span>
                    <span className="text-zinc-300 font-medium uppercase font-mono">
                      {job.order?.deliveryMethod?.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </CardContent>

              {/* Card Footer Summary & Actions */}
              <div className="p-5 border-t border-zinc-850 bg-zinc-900/10 flex justify-between items-center gap-4">
                <div className="space-y-0.5">
                  <span className="text-[9px] text-zinc-550 uppercase font-bold block">Jasa Kurir (Ongkir)</span>
                  <span className="text-base font-black text-emerald-450 flex items-center">
                    {formatRupiah(job.order?.deliveryFee ?? 0)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-800 text-zinc-400 hover:text-white h-9 px-3 text-xs cursor-pointer"
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    Detail
                  </Button>
                  <Button
                    size="sm"
                    disabled={takeJobMutation.isPending}
                    onClick={() => takeJobMutation.mutate(job.id)}
                    className="bg-indigo-650 bg-indigo-700 hover:bg-indigo-600 text-white font-bold h-9 px-4 text-xs flex items-center gap-1 cursor-pointer"
                  >
                    {takeJobMutation.isPending ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      'Ambil Pekerjaan'
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* JOB DETAIL DIALOG */}
      <JobDetailDialog
        selectedJobId={selectedJobId}
        onClose={() => setSelectedJobId(null)}
        formatRupiah={formatRupiah}
      />
    </div>
  );
}
