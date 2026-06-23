'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Users, Store, ShoppingBag, Truck } from 'lucide-react';
import { toast } from 'sonner';

interface AdminDashboardProps {
  formatRupiah: (amount: number) => string;
}

export function AdminDashboard({ formatRupiah }: AdminDashboardProps) {
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
              Verifikasi Pendaftaran Seller (3)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
