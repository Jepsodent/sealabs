'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Truck, ShieldCheck, DollarSign } from 'lucide-react';

interface DriverStatsProps {
  balance: number;
  totalEarnings: number;
  completedCount: number;
  formatRupiah: (amount: number) => string;
}

export function DriverStats({ balance, totalEarnings, completedCount, formatRupiah }: DriverStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Wallet Balance Card */}
      <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Saldo Dompet</span>
          <h3 className="text-3xl font-black text-white">{formatRupiah(balance)}</h3>
          <p className="text-[10px] text-zinc-500 mt-1">Saldo hasil jasa pengiriman</p>
        </div>
        <div className="h-12 w-12 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
          <DollarSign className="h-6 w-6" />
        </div>
      </Card>

      {/* Total Earning Card */}
      <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Total Pendapatan</span>
          <h3 className="text-3xl font-black text-emerald-400">{formatRupiah(totalEarnings)}</h3>
          <p className="text-[10px] text-zinc-500 mt-1">Total akumulasi ongkir cair</p>
        </div>
        <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
          <Truck className="h-6 w-6" />
        </div>
      </Card>

      {/* Finished Jobs Card */}
      <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider block">Pengiriman Selesai</span>
          <h3 className="text-3xl font-black text-indigo-400">{completedCount} Job</h3>
          <p className="text-[10px] text-zinc-500 mt-1">Pesanan sukses diantar</p>
        </div>
        <div className="h-12 w-12 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
          <ShieldCheck className="h-6 w-6" />
        </div>
      </Card>
    </div>
  );
}
