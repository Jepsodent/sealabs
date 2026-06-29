'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Users, Store as StoreIcon, ShoppingBag, TrendingUp } from 'lucide-react';

interface AdminStatsProps {
  totalUsersCount: number;
  buyersCount: number;
  sellersCount: number;
  driversCount: number;
  totalStore: number;
  totalProduct: number;
  overdueOrdersCount: number;
  isLoading: boolean;
}

export function AdminStats({
  totalUsersCount,
  buyersCount,
  sellersCount,
  driversCount,
  totalStore,
  totalProduct,
  overdueOrdersCount,
  isLoading,
}: AdminStatsProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-zinc-800 bg-zinc-900/30 p-5 h-24 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Users */}
      <Card className="border-zinc-800 bg-zinc-900/30 p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
          <Users className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Total Pengguna</span>
          <h3 className="text-2xl font-black text-white">{totalUsersCount}</h3>
          <p className="text-[9px] text-zinc-500">
            {buyersCount} Buyer • {sellersCount} Seller • {driversCount} Driver
          </p>
        </div>
      </Card>

      {/* Stores */}
      <Card className="border-zinc-800 bg-zinc-900/30 p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
          <StoreIcon className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Toko Terdaftar</span>
          <h3 className="text-2xl font-black text-white">{totalStore} Toko</h3>
          <p className="text-[9px] text-zinc-500">Ekosistem toko merchant</p>
        </div>
      </Card>

      {/* Products */}
      <Card className="border-zinc-800 bg-zinc-900/30 p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
          <ShoppingBag className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Katalog Produk</span>
          <h3 className="text-2xl font-black text-white">{totalProduct} Item</h3>
          <p className="text-[9px] text-zinc-500">Katalog barang aktif platform</p>
        </div>
      </Card>

      {/* Overdue (Refunded) */}
      <Card className="border-zinc-800 bg-zinc-900/30 p-5 flex items-center gap-4">
        <div className="h-10 w-10 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 flex items-center justify-center shrink-0">
          <TrendingUp className="h-5 w-5" />
        </div>
        <div className="space-y-0.5">
          <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Transaksi Overdue</span>
          <h3 className="text-2xl font-black text-rose-400">{overdueOrdersCount} Pesanan</h3>
          <p className="text-[9px] text-zinc-550 block">Dibatalkan otomatis & direfund</p>
        </div>
      </Card>
    </div>
  );
}
