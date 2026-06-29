'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShoppingBag, Loader2 } from 'lucide-react';
import { Order } from '@/types';

interface RecentOrdersProps {
  orders: Order[];
  formatRupiah: (amount: number) => string;
  formatDate: (date: string | Date) => string;
  isLoading: boolean;
}

export function RecentOrders({ orders, formatRupiah, formatDate, isLoading }: RecentOrdersProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/30">
      <CardHeader className="p-5 border-b border-zinc-800/40">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-indigo-400" /> Pemantauan Transaksi Pesanan Terbaru (Platform Feed)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : !orders || orders.length === 0 ? (
          <p className="text-zinc-550 text-center py-8 text-xs">Belum ada transaksi pesanan yang terekam.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 bg-zinc-950/20 font-bold">
                  <th className="p-4">ID Pesanan</th>
                  <th className="p-4">Pembeli (Buyer)</th>
                  <th className="p-4">Toko (Seller)</th>
                  <th className="p-4">Total Bayar</th>
                  <th className="p-4">Metode Kirim</th>
                  <th className="p-4">Tanggal Checkout</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-zinc-850/20 transition-all">
                    <td className="p-4 font-mono font-bold text-indigo-400">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="p-4 font-semibold text-white capitalize">{order.buyer?.username}</td>
                    <td className="p-4 font-semibold text-zinc-300 capitalize">{order.store?.name}</td>
                    <td className="p-4 font-black text-emerald-400">{formatRupiah(order.total)}</td>
                    <td className="p-4 font-mono uppercase text-zinc-400 text-[10px]">{order.deliveryMethod}</td>
                    <td className="p-4 text-zinc-500">{formatDate(order.createdAt)}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                          order.status === 'PESANAN_SELESAI'
                            ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                            : order.status === 'DIKEMBALIKAN'
                            ? 'bg-rose-500/10 text-rose-455 border-rose-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        }`}
                      >
                        {order.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
