'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Wallet, Package, TrendingUp, Clock } from 'lucide-react';

interface BuyerDashboardProps {
  formatRupiah: (amount: number) => string;
}

export function BuyerDashboard({ formatRupiah }: BuyerDashboardProps) {
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
}
