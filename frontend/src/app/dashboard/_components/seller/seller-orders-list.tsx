'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  ClipboardList,
  Calendar,
  MapPin,
  User as UserIcon,
  PackageCheck,
  Eye,
} from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import Link from 'next/link';
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
  const [activeFilter, setActiveFilter] = useState<'baru' | 'diproses'>('baru');
  const queryClient = useQueryClient();

  const processOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      const response = await api.put(`/orders/${orderId}/process`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Pesanan berhasil diproses!');
      queryClient.invalidateQueries({ queryKey: ['orders-seller'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal memproses pesanan.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal memproses pesanan.');
    },
  });

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PESANAN_SELESAI':
        return 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20';
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

  const newOrdersCount = incomingOrders.filter((o) => o.status === 'SEDANG_DIKEMAS').length;
  const processedOrdersCount = incomingOrders.length - newOrdersCount;

  const filteredOrders = incomingOrders.filter((order) => {
    if (activeFilter === 'baru') {
      return order.status === 'SEDANG_DIKEMAS';
    } else {
      return order.status !== 'SEDANG_DIKEMAS';
    }
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ClipboardList className="h-5.5 w-5.5 text-indigo-400" /> Pesanan Masuk Pelanggan
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Daftar pesanan dari pembeli yang masuk ke toko Anda.</p>
        </div>

        {/* Filters Tab */}
        <div className="flex items-center gap-2 p-1 border border-zinc-800 bg-zinc-900/40 rounded-lg">
          <Button
            size="sm"
            variant={activeFilter === 'baru' ? 'default' : 'ghost'}
            onClick={() => setActiveFilter('baru')}
            className={`text-xs h-7 px-3 ${
              activeFilter === 'baru'
                ? 'bg-indigo-650 text-white hover:bg-indigo-700 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            Pesanan Baru ({newOrdersCount})
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'diproses' ? 'default' : 'ghost'}
            onClick={() => setActiveFilter('diproses')}
            className={`text-xs h-7 px-3 ${
              activeFilter === 'diproses'
                ? 'bg-indigo-650 text-white hover:bg-indigo-700 shadow-md font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
            }`}
          >
            Telah Diproses ({processedOrdersCount})
          </Button>
        </div>
      </div>

      {isLoadingOrders ? (
        <div className="flex items-center justify-center py-20 text-zinc-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="text-xs">Memuat daftar pesanan...</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-16 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/10 text-zinc-500">
          <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-40 text-zinc-650" />
          <p className="text-sm font-semibold text-white">Belum ada pesanan di kategori ini</p>
          <p className="text-xs text-zinc-600 mt-1">
            {activeFilter === 'baru'
              ? 'Ketika ada Buyer memesan barang Anda, pesanan baru akan muncul di sini.'
              : 'Pesanan yang telah Anda proses atau dikirim akan muncul di sini.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="border-zinc-800 bg-zinc-900/20 overflow-hidden flex flex-col justify-between">
              {/* Order header */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 border-b border-zinc-850/60 bg-zinc-900/10 gap-3">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded font-mono">
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
                      <span className="text-zinc-555">({item.quantity} Pcs)</span>
                    </div>
                    <span className="font-bold text-zinc-400">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              {/* Order Footer summary info & Actions */}
              <div className="p-5 pt-3 pb-3 bg-zinc-900/10 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                <div className="flex flex-col gap-1 text-zinc-550">
                  <div className="flex items-start gap-1">
                    <MapPin className="h-4 w-4 text-zinc-650 shrink-0 mt-0.5" />
                    <span className="capitalize text-[10px] max-w-sm line-clamp-1">Kirim ke: {order.deliveryAddress}</span>
                  </div>
                  {order.discount && order.discount > 0 ? (
                    <p className="text-[10px] text-emerald-450 font-medium pl-5">
                      Potongan Diskon: -{formatRupiah(order.discount)} {order.discountCode ? `(${order.discountCode})` : ''}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                  <div className="text-right mr-1">
                    <span className="text-zinc-500 text-[9px] uppercase font-bold block">Total Pendapatan</span>
                    <span className="text-sm font-black text-indigo-400">{formatRupiah(order.total)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 border-l border-zinc-800 pl-3">
                    <Link href={`/orders/${order.id}`}>
                      <Button
                        size="sm" 
                        variant="outline"
                        className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 h-8 px-2.5 text-xs font-medium cursor-pointer"
                        title="Lihat Detail Pesanan"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </Link>

                    {order.status === 'SEDANG_DIKEMAS' && (
                      <Button
                        size="sm"
                        disabled={processOrderMutation.isPending && processOrderMutation.variables === order.id}
                        onClick={() => processOrderMutation.mutate(order.id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-8 px-3 text-xs flex items-center gap-1 cursor-pointer"
                      >
                        {processOrderMutation.isPending && processOrderMutation.variables === order.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <PackageCheck className="h-3.5 w-3.5" />
                        )}
                        Proses Pesanan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
