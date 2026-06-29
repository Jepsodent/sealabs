'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Role } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// Sub-dashboards
import { BuyerDashboard } from './_components/buyer-dashboard';
import { SellerDashboard } from './_components/seller-dashboard';
import { DriverDashboard } from './_components/driver-dashboard';

export default function DashboardPage() {
  const { user, isLoading, updateActiveRole } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user && user.activeRole === 'ADMIN') {
      router.push('/admin');
    }
  }, [user, router]);

  const handleQuickRoleChange = async (role: Role) => {
    try {
      await updateActiveRole(role);
      toast.success(`Role aktif diubah ke ${role}`);
    } catch {
      toast.error('Gagal mengubah role aktif');
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-950 min-h-[50vh]">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Memuat profil Anda...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 bg-zinc-950 min-h-[50vh]">
        <Card className="max-w-md border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <Shield className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Sesi Tidak Ditemukan</h2>
          <p className="text-sm text-zinc-400 mt-1">Silakan masuk kembali untuk mengakses halaman dasbor.</p>
        </Card>
      </div>
    );
  }

  const renderDashboardContent = () => {
    switch (user.activeRole) {
      case 'BUYER':
        return <BuyerDashboard formatRupiah={formatRupiah} />;
      case 'SELLER':
        return <SellerDashboard formatRupiah={formatRupiah} />;
      case 'DRIVER':
        return <DriverDashboard formatRupiah={formatRupiah} />;
      case 'ADMIN':
        return (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-550 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <span className="text-sm font-medium">Mengarahkan ke Admin Panel...</span>
          </div>
        );
      default:
        return (
          <Card className="border-zinc-800 bg-zinc-900/20 p-8 text-center">
            <h2 className="text-xl font-bold text-white">Belum Ada Peran Aktif</h2>
            <p className="text-sm text-zinc-400 mt-2">
              Akun Anda belum memiliki peran aktif. Pilih salah satu peran di bawah atau di Navbar untuk mengaktifkannya.
            </p>
            <div className="flex justify-center gap-3 mt-4">
              {user.roles.map((role) => (
                <Button key={role} onClick={() => handleQuickRoleChange(role)} className="bg-zinc-850 hover:bg-zinc-800 text-white border border-zinc-800">
                  Aktifkan {role}
                </Button>
              ))}
            </div>
          </Card>
        );
    }
  };

  return (
    <div className="flex-1 w-full bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-zinc-800 pb-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Dasbor Utama
          </h1>
          <p className="text-zinc-400 text-sm">
            Selamat datang, <span className="font-semibold text-white">{user.username}</span>. Peran aktif Anda saat ini:{' '}
            <span className="font-bold text-indigo-400 uppercase">{user.activeRole || 'Belum dipilih'}</span>
          </p>
        </div>

        {/* Quick Role Switcher Button Group */}
        {user.roles.length > 1 && (
          <div className="flex items-center gap-2 p-1 border border-zinc-800 bg-zinc-900/40 rounded-lg">
            <span className="text-[10px] uppercase font-bold text-zinc-500 px-2">Ganti Peran:</span>
            {user.roles.map((role) => (
              <Button
                key={role}
                size="sm"
                variant={user.activeRole === role ? 'default' : 'ghost'}
                onClick={() => handleQuickRoleChange(role)}
                className={`text-xs capitalize h-7 ${
                  user.activeRole === role
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
                }`}
              >
                {role.toLowerCase()}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Main Panel Content depending on activeRole */}
      {renderDashboardContent()}
    </div>
  );
}
