'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  product: {
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: string;
  deliveryMethod: string;
  total: number;
  status: string;
  createdAt: string;
  orderItem: OrderItem[];
}

interface OrderCardProps {
  order: Order;
  formatRupiah: (price: number) => string;
}

export function OrderCard({ order, formatRupiah }: OrderCardProps) {
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
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/20 hover:border-zinc-700 transition-all overflow-hidden flex flex-col justify-between">
      {/* Order Card Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-zinc-850/60 bg-zinc-900/10 gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded">
              ID: {order.id.slice(0, 8)}...
            </span>
            <span className={cn("text-[9px] font-black border px-2 py-0.5 rounded-full uppercase tracking-wide", getStatusBadgeClass(order.status))}>
              {getStatusLabel(order.status)}
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Transaksi: {new Date(order.createdAt).toLocaleDateString('id-ID', {
              day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
        <div className="text-right sm:text-right w-full sm:w-auto">
          <span className="text-[10px] text-zinc-500 font-semibold block uppercase">Total Tagihan</span>
          <span className="text-base font-black text-white">{formatRupiah(order.total)}</span>
        </div>
      </div>

      {/* Order Card Items List */}
      <CardContent className="p-5 space-y-4">
        {order.orderItem.map((item) => (
          <div key={item.id} className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-zinc-950 rounded border border-zinc-850 overflow-hidden shrink-0">
                <img src={item.product?.imageUrl} alt={item.product?.name} className="object-cover h-full w-full" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{item.product?.name}</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">{item.quantity} Unit x {formatRupiah(item.price)}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-zinc-400">{formatRupiah(item.price * item.quantity)}</span>
          </div>
        ))}
      </CardContent>

      {/* Order Card Footer */}
      <CardFooter className="p-5 pt-3 border-t border-zinc-850/50 bg-zinc-900/10 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <span className="text-[10px] text-zinc-550 font-semibold">
          Kurir: <span className="font-bold text-white capitalize">{order.deliveryMethod.replace(/_/g, ' ').toLowerCase()}</span>
        </span>
        <Link
          href={`/orders/${order.id}`}
          className={cn(
            buttonVariants({ size: 'xs', variant: 'outline' }),
            "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 h-8 px-4 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          )}
        >
          Detail Penerimaan <ArrowRight className="h-4 w-4" />
        </Link>
      </CardFooter>
    </Card>
  );
}
