'use client';

import React from 'react';
import { useAuth, Role } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Wallet,
  Store,
  Truck,
  Shield,
  User as UserIcon,
  Package,
  TrendingUp,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Users,
  ShoppingBag,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { user, isLoading, updateActiveRole } = useAuth();

  const handleQuickRoleChange = async (role: Role) => {
    try {
      await updateActiveRole(role);
      toast.success(`Role aktif diubah ke ${role}`);
    } catch (error) {
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

  // Render Section depending on activeRole
  const renderDashboardContent = () => {
    switch (user.activeRole) {
      case 'BUYER':
        return (
          <div className="space-y-6">
            {/* Buyer Wallet & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase">Dompet Saya</span>
                  <h3 className="text-3xl font-black text-white">{formatRupiah(500000)}</h3>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6" />
                </div>
              </Card>

              <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase">Total Pembelian</span>
                  <h3 className="text-3xl font-black text-white">12 Transaksi</h3>
                </div>
                <div className="h-12 w-12 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <Package className="h-6 w-6" />
                </div>
              </Card>

              <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase">Voucher Aktif</span>
                  <h3 className="text-3xl font-black text-white">3 Kupon</h3>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </Card>
            </div>

            {/* Buyer Active Deliveries */}
            <Card className="border-zinc-800 bg-zinc-900/30">
              <CardHeader className="border-b border-zinc-800/40 p-5">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-indigo-400" /> Riwayat Belanja Terbaru (Simulasi)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="space-y-4">
                  {[
                    { id: 'TRX-9821', product: 'Mechanical Keyboard RGB', store: 'Tech Gadget Store', price: 450000, status: 'Dalam Pengiriman' },
                    { id: 'TRX-9762', product: 'Stainless Steel Tumbler 500ml', store: 'Eco Bottle Co', price: 150000, status: 'Selesai' }
                  ].map((trx) => (
                    <div key={trx.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/60">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">{trx.id}</span>
                        <h4 className="text-sm font-semibold text-white mt-0.5">{trx.product}</h4>
                        <span className="text-xs text-zinc-400">{trx.store} • {formatRupiah(trx.price)}</span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                        trx.status === 'Selesai' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                          : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                      }`}>
                        {trx.status}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'SELLER':
        return (
          <div className="space-y-6">
            {/* Seller Balance & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase">Pendapatan Toko</span>
                  <h3 className="text-3xl font-black text-white">{formatRupiah(12500000)}</h3>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <Store className="h-6 w-6" />
                </div>
              </Card>

              <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase">Produk Aktif</span>
                  <h3 className="text-3xl font-black text-white">5 Produk</h3>
                </div>
                <div className="h-12 w-12 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
                  <Package className="h-6 w-6" />
                </div>
              </Card>

              <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase">Pesanan Baru</span>
                  <h3 className="text-3xl font-black text-white">2 Pesanan</h3>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
              </Card>
            </div>

            {/* Shop Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-zinc-800 bg-zinc-900/30">
                <CardHeader className="p-5 border-b border-zinc-800/40">
                  <CardTitle className="text-base font-bold text-white">Informasi Toko Saya</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-3 text-sm">
                  <div className="flex justify-between py-1.5 border-b border-zinc-850">
                    <span className="text-zinc-500">Nama Toko</span>
                    <span className="text-white font-semibold capitalize">Toko {user.username}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-zinc-850">
                    <span className="text-zinc-500">Status Toko</span>
                    <span className="text-emerald-400 font-bold">Aktif & Terverifikasi</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-zinc-500">Pengiriman Dukungan</span>
                    <span className="text-zinc-300">Kurir Internal SEAPEDIA</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-zinc-800 bg-zinc-900/30">
                <CardHeader className="p-5 border-b border-zinc-800/40">
                  <CardTitle className="text-base font-bold text-white">Penjualan Terbaru (Simulasi)</CardTitle>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  {[
                    { id: 'ORD-12', product: 'Wireless Gaming Mouse', buyer: 'Budisanto', date: 'Hari ini', total: 320000 },
                    { id: 'ORD-10', product: 'Ergonomic Office Chair', buyer: 'Citra', date: 'Kemarin', total: 1200000 }
                  ].map((ord) => (
                    <div key={ord.id} className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800/60">
                      <div>
                        <span className="text-[10px] text-zinc-500 font-semibold uppercase">{ord.id}</span>
                        <h4 className="text-sm font-semibold text-white mt-0.5">{ord.product}</h4>
                        <span className="text-xs text-zinc-400">Pembeli: {ord.buyer} • {ord.date}</span>
                      </div>
                      <span className="text-sm font-bold text-emerald-400">{formatRupiah(ord.total)}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 'DRIVER':
        return (
          <div className="space-y-6">
            {/* Driver Earnings & Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase">Pendapatan Driver</span>
                  <h3 className="text-3xl font-black text-white">{formatRupiah(1200000)}</h3>
                </div>
                <div className="h-12 w-12 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Truck className="h-6 w-6" />
                </div>
              </Card>

              <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase">Pengiriman Selesai</span>
                  <h3 className="text-3xl font-black text-white">45 Job</h3>
                </div>
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6" />
                </div>
              </Card>

              <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-xs text-zinc-500 font-semibold uppercase">Rating Driver</span>
                  <h3 className="text-3xl font-black text-white">4.9 / 5.0</h3>
                </div>
                <div className="h-12 w-12 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
                  <UserIcon className="h-6 w-6" />
                </div>
              </Card>
            </div>

            {/* Active Delivery Job */}
            <Card className="border-zinc-800 bg-zinc-900/30">
              <CardHeader className="p-5 border-b border-zinc-800/40">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-amber-400 animate-bounce" /> Pekerjaan Aktif Saat Ini (Simulasi)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/15 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                        JOB #98231
                      </span>
                      <h4 className="text-base font-bold text-white mt-1.5">Mechanical Keyboard RGB</h4>
                      <p className="text-xs text-zinc-400">Dari: Tech Gadget Store (Tangerang)</p>
                      <p className="text-xs text-zinc-400">Ke: Jln. Sudirman No. 12 (Jakarta Pusat)</p>
                    </div>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20">
                      Menuju Lokasi Tujuan
                    </span>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <Button size="sm" variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white" onClick={() => toast.info('Navigasi peta dimulai')}>
                      Lihat Rute
                    </Button>
                    <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold" onClick={() => toast.success('Pekerjaan ditandai selesai!')}>
                      Selesaikan Pengiriman
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 'ADMIN':
        return (
          <div className="space-y-6">
            {/* Admin Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-zinc-800 bg-zinc-900/30 p-6 space-y-2">
                <span className="text-xs text-zinc-500 font-semibold uppercase">Total Pengguna</span>
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-white">1.250</h3>
                  <Users className="h-5 w-5 text-indigo-400" />
                </div>
              </Card>

              <Card className="border-zinc-800 bg-zinc-900/30 p-6 space-y-2">
                <span className="text-xs text-zinc-500 font-semibold uppercase">Total Toko</span>
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-white">180</h3>
                  <Store className="h-5 w-5 text-blue-400" />
                </div>
              </Card>

              <Card className="border-zinc-800 bg-zinc-900/30 p-6 space-y-2">
                <span className="text-xs text-zinc-500 font-semibold uppercase">Penjualan Platform</span>
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white">{formatRupiah(120000000)}</h3>
                  <ShoppingBag className="h-5 w-5 text-emerald-400" />
                </div>
              </Card>

              <Card className="border-zinc-800 bg-zinc-900/30 p-6 space-y-2">
                <span className="text-xs text-zinc-500 font-semibold uppercase">Selesai Pengiriman</span>
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-black text-white">98.2%</h3>
                  <Truck className="h-5 w-5 text-amber-400" />
                </div>
              </Card>
            </div>

            {/* Admin Quick Control Panel */}
            <Card className="border-zinc-800 bg-zinc-900/30">
              <CardHeader className="p-5 border-b border-zinc-800/40">
                <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-rose-400" /> Panel Manajemen Administrator
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5">
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  Sebagai Administrator platform, Anda memiliki akses penuh untuk melakukan monitoring aktivitas transaksi, verifikasi pendaftaran Seller baru, pemantauan status antrean Driver, serta kontrol kebijakan system SEAPEDIA.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button size="sm" variant="outline" className="border-zinc-800 hover:bg-zinc-800" onClick={() => toast.info('Buka log transaksi')}>
                    Pantau Log Transaksi
                  </Button>
                  <Button size="sm" variant="outline" className="border-zinc-800 hover:bg-zinc-800" onClick={() => toast.info('Buka daftar verifikasi seller')}>
                    Verifikasi Pendaftaran Seller ({3})
                  </Button>
                </div>
              </CardContent>
            </Card>
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
                <Button key={role} onClick={() => handleQuickRoleChange(role)}>
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
