'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import {
  Loader2,
  ClipboardList,
  Calendar,
  MapPin,
  User as UserIcon,
} from 'lucide-react';
import { Order } from '@/types';

interface SellerOrdersListProps {
  incomingOrders: Order[];
  isLoadingOrders: boolean;
  formatRupiah: (amount: number) => string;
}

export function SellerOrdersList({
  incomingOrders,
  isLoadingOrders,
  formatRupiah,
}: SellerOrdersListProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PESANAN_SELESAI':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'SEDANG_DIKEMAS':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'MENUNGGU_PENGIRIM':
      case 'SEDANG_DIKIRIM':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DIKEMBALIKAN':
        return 'bg-rose-500/10 text-rose-450 border-rose-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-zinc-800/60 pb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <ClipboardList className="h-5.5 w-5.5 text-indigo-400" /> Pesanan Masuk Pelanggan
        </h2>
        <p className="text-xs text-zinc-550 mt-1">Daftar pesanan dari pembeli yang masuk ke toko Anda.</p>
      </div>

      {isLoadingOrders ? (
        <div className="flex items-center justify-center py-20 text-zinc-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="text-xs">Memuat daftar pesanan...</span>
        </div>
      ) : incomingOrders.length === 0 ? (
        <div className="text-center py-16 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/10 text-zinc-550">
          <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-40 text-zinc-650" />
          <p className="text-sm font-semibold text-white">Belum ada pesanan masuk</p>
          <p className="text-xs text-zinc-600 mt-1">Ketika ada Buyer memesan barang Anda, pesanan akan muncul di sini.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {incomingOrders.map((order) => (
            <Card key={order.id} className="border-zinc-800 bg-zinc-900/20 overflow-hidden flex flex-col justify-between">
              {/* Order header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-zinc-850/60 bg-zinc-900/10 gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded">
                      ID: {order.id.slice(0, 8)}...
                    </span>
                    <span className={`text-[9px] font-black border px-2.5 py-0.5 rounded-full uppercase tracking-wide ${getStatusBadgeClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      Dipesan: {new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-400 bg-zinc-950/60 border border-zinc-850 px-3 py-1 rounded-lg">
                  <UserIcon className="h-4 w-4 text-indigo-400" />
                  <span>Pembeli: </span>
                  <span className="text-white capitalize">{order.buyer?.username}</span>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-5 border-b border-zinc-850/40 space-y-3">
                {order.orderItem.map((item) => (
                  <div key={item.id} className="flex justify-between items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-500">•</span>
                      <span className="text-white">{item.product?.name}</span>
                      <span className="text-zinc-550">({item.quantity} Pcs)</span>
                    </div>
                    <span className="font-bold text-zinc-400">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Order Footer summary info */}
              <div className="p-5 pt-3 pb-3 bg-zinc-900/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                <div className="flex items-start gap-1 text-zinc-550">
                  <MapPin className="h-4 w-4 text-zinc-600 shrink-0 mt-0.5" />
                  <span className="capitalize text-[10px] max-w-sm line-clamp-1">Kirim ke: {order.deliveryAddress}</span>
                </div>
                <div className="flex justify-between items-baseline gap-2 shrink-0 self-end sm:self-auto">
                  <span className="text-zinc-500 text-[10px] uppercase font-bold">Total Pendapatan (Snapshot)</span>
                  <span className="text-sm font-black text-indigo-400">{formatRupiah(order.total)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
