'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Shield,
  Play,
  Ticket,
  Loader2,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

// Subcomponents
import { AdminStats } from './_components/admin-stats';
import { TimeSimulator } from './_components/time-simulator';
import { RecentOrders } from './_components/recent-orders';
import { ActiveJobs } from './_components/active-jobs';
import { VoucherList } from './_components/voucher-list';
import { PromoList } from './_components/promo-list';
import { VoucherModal } from './_components/voucher-modal';
import { PromoModal } from './_components/promo-modal';

export default function AdminDashboardPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'monitoring' | 'discounts'>('monitoring');

  // Modal States
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  // Currency & Date Formatter
  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string | Date) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAdmin = user?.activeRole === 'ADMIN';

  // 1. Fetch Virtual System Time
  const { data: systemTimeData, isLoading: isLoadingTime } = useQuery({
    queryKey: ['admin-system-time'],
    queryFn: async () => {
      const response = await api.get('/admin/system-time');
      return response.data;
    },
    enabled: isAdmin,
  });

  // 2. Fetch Dashboard Analytics & Monitoring
  const { data: monitoringData, isLoading: isLoadingMonitoring } = useQuery({
    queryKey: ['admin-monitoring'],
    queryFn: async () => {
      const response = await api.get('/admin/monitoring');
      return response.data;
    },
    enabled: isAdmin,
  });

  // Mutations
  const advanceTimeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/admin/advance-time', { days: 1 });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Waktu virtual berhasil dimajukan 1 Hari (+24 Jam)');
      queryClient.invalidateQueries({ queryKey: ['admin-system-time'] });
      queryClient.invalidateQueries({ queryKey: ['admin-monitoring'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal memajukan waktu.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal memajukan waktu.');
    },
  });

  const resetTimeMutation = useMutation({
    mutationFn: async () => {
      const response = await api.put('/admin/reset');
      return response.data;
    },
    onSuccess: () => {
      toast.success('Offset waktu virtual disetel kembali ke 0');
      queryClient.invalidateQueries({ queryKey: ['admin-system-time'] });
      queryClient.invalidateQueries({ queryKey: ['admin-monitoring'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal mereset waktu.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal mereset waktu.');
    },
  });

  const checkOverdueMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/admin/check-overdue');
      return response.data;
    },
    onSuccess: (data) => {
      if (data.processedCount > 0) {
        toast.success(`Scanning SLA Selesai: Berhasil memproses refund untuk ${data.processedCount} pesanan overdue!`, {
          duration: 5000,
        });
      } else {
        toast.info('Scanning SLA Selesai: Tidak ada pesanan overdue yang terdeteksi saat ini.');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-monitoring'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal memeriksa SLA overdue.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal memeriksa SLA overdue.');
    },
  });

  const createVoucherMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post('/discounts/vouchers', payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Voucher diskon baru berhasil diterbitkan!');
      setIsVoucherModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-monitoring'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal membuat voucher.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal membuat voucher.');
    },
  });

  const createPromoMutation = useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post('/discounts/promos', payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Promo diskon baru berhasil diterbitkan!');
      setIsPromoModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-monitoring'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal membuat promo.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal membuat promo.');
    },
  });

  if (isLoadingAuth) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-zinc-400 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <span className="text-sm font-medium">Memverifikasi kredensial admin...</span>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-zinc-900 border border-zinc-800 rounded-2xl text-center space-y-4 shadow-xl">
        <div className="h-14 w-14 rounded-full bg-rose-500/10 text-rose-455 border border-rose-500/20 flex items-center justify-center mx-auto">
          <Shield className="h-7 w-7" />
        </div>
        <h2 className="text-xl font-black text-white">403 - Akses Ditolak</h2>
        <p className="text-zinc-400 text-xs leading-relaxed">
          Halaman ini khusus dilindungi dan hanya dapat diakses oleh administrator sistem SEAPEDIA.
        </p>
        <div className="pt-2">
          <Button
            onClick={() => window.location.href = '/dashboard'}
            className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs cursor-pointer"
          >
            Kembali ke Dasbor Saya
          </Button>
        </div>
      </div>
    );
  }

  // Aggregate Helpers
  const getUserCountByRole = (role: string) => {
    if (!monitoringData?.totalUser) return 0;
    const entry = monitoringData.totalUser.find((item: any) => item.roles.includes(role));
    return entry?._count?.id ?? 0;
  };

  const getOrderCountByStatus = (status: string) => {
    if (!monitoringData?.totalOrder) return 0;
    const entry = monitoringData.totalOrder.find((item: any) => item.status === status);
    return entry?._count?.id ?? 0;
  };

  const totalUsersCount = monitoringData?.totalUser?.reduce((sum: number, item: any) => sum + (item._count?.id ?? 0), 0) ?? 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Simulator Widget */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2 tracking-tight">
            <Shield className="h-8 w-8 text-rose-500" /> Admin Control Room
          </h1>
          <p className="text-zinc-500 text-xs mt-1">
            Pusat monitoring ekosistem platform, bursa simulasi SLA overdue, dan manajemen diskon SEAPEDIA.
          </p>
        </div>

        <TimeSimulator
          systemTimeData={systemTimeData}
          onAdvanceTime={() => advanceTimeMutation.mutate()}
          onResetTime={() => resetTimeMutation.mutate()}
          isAdvancing={advanceTimeMutation.isPending}
          isResetting={resetTimeMutation.isPending}
          formatDate={formatDate}
          isLoadingTime={isLoadingTime}
        />
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
            activeTab === 'monitoring' ? 'text-white font-black' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Monitoring & SLA
          {activeTab === 'monitoring' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('discounts')}
          className={`px-5 py-3 text-xs font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
            activeTab === 'discounts' ? 'text-white font-black' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Manajemen Diskon
          {activeTab === 'discounts' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500" />
          )}
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'monitoring' && (
        <div className="space-y-6">
          {/* Aggregate Metrics Grid */}
          <AdminStats
            totalUsersCount={totalUsersCount}
            buyersCount={getUserCountByRole('BUYER')}
            sellersCount={getUserCountByRole('SELLER')}
            driversCount={getUserCountByRole('DRIVER')}
            totalStore={monitoringData?.totalStore ?? 0}
            totalProduct={monitoringData?.totalProduct ?? 0}
            overdueOrdersCount={getOrderCountByStatus('DIKEMBALIKAN')}
            isLoading={isLoadingMonitoring}
          />

          {/* SLA Scanning Manual Panel */}
          <Card className="border-rose-900/40 bg-rose-950/5 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border rounded-2xl">
            <div className="space-y-1">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                <AlertTriangle className="h-4.5 w-4.5 text-amber-550 animate-pulse" /> Pemicu Simulasi Overdue SLA Pengantaran
              </h3>
              <p className="text-zinc-450 text-xs leading-relaxed max-w-2xl">
                Men-scan database untuk menemukan pesanan aktif (`Sedang Dikemas`, `Menunggu Pengirim`, `Sedang Dikirim`) 
                yang umurnya melampaui batas SLA (Instant: 1 hari, Next Day: 2 hari, Regular: 4 hari) berdasarkan jam virtual saat ini. 
                Sistem akan membatalkan order (`DIKEMBALIKAN`), me-refund dana 100%, memulihkan stok, dan menghentikan pengiriman kurir.
              </p>
            </div>
            <Button
              size="lg"
              disabled={checkOverdueMutation.isPending}
              onClick={() => checkOverdueMutation.mutate()}
              className="bg-rose-600 hover:bg-rose-700 text-white font-black flex items-center gap-1.5 cursor-pointer shadow-lg shadow-rose-950 w-full md:w-auto text-xs py-5"
            >
              {checkOverdueMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Jalankan Cek Overdue
            </Button>
          </Card>

          {/* Platform Recent Orders feed */}
          <RecentOrders
            orders={monitoringData?.recentOrders ?? []}
            formatRupiah={formatRupiah}
            formatDate={formatDate}
            isLoading={isLoadingMonitoring}
          />

          {/* Active Courier Jobs */}
          <ActiveJobs
            jobs={monitoringData?.activeDeliveryJob ?? []}
            formatRupiah={formatRupiah}
            isLoading={isLoadingMonitoring}
          />
        </div>
      )}

      {activeTab === 'discounts' && (
        <div className="space-y-6">
          {/* Header Action */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-1.5">
                <Ticket className="h-5 w-5 text-indigo-400" /> Katalog Voucher & Promo Sistem
              </h2>
              <p className="text-zinc-500 text-xs">
                Menerbitkan voucher diskon (kuota terbatas) atau kode promo diskon global untuk pembeli.
              </p>
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                onClick={() => setIsVoucherModalOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1 cursor-pointer text-xs flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4" /> Buat Voucher baru
              </Button>
              <Button
                onClick={() => setIsPromoModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 cursor-pointer text-xs flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4" /> Buat Promo baru
              </Button>
            </div>
          </div>

          {/* Voucher List */}
          <VoucherList
            vouchers={monitoringData?.vouchers ?? []}
            formatRupiah={formatRupiah}
            formatDate={formatDate}
            isLoading={isLoadingMonitoring}
          />

          {/* Promo List */}
          <PromoList
            promos={monitoringData?.promos ?? []}
            formatRupiah={formatRupiah}
            formatDate={formatDate}
            isLoading={isLoadingMonitoring}
          />
        </div>
      )}

      {/* Form Modals */}
      <VoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onSubmit={(payload) => createVoucherMutation.mutate(payload)}
        isPending={createVoucherMutation.isPending}
      />

      <PromoModal
        isOpen={isPromoModalOpen}
        onClose={() => setIsPromoModalOpen(false)}
        onSubmit={(payload) => createPromoMutation.mutate(payload)}
        isPending={createPromoMutation.isPending}
      />
    </div>
  );
}
