'use client';

import { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Loader2, CheckCircle, Package, Truck, Calendar, MapPin, Receipt, ShieldAlert, User } from 'lucide-react';

import { Order } from '@/types';

const ALL_STATUSES = [
  { status: 'SEDANG_DIKEMAS', label: 'Sedang Dikemas' },
  { status: 'MENUNGGU_PENGIRIM', label: 'Menunggu Pengirim' },
  { status: 'SEDANG_DIKIRIM', label: 'Sedang Dikirim' },
  { status: 'PESANAN_SELESAI', label: 'Pesanan Selesai' },
];

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const activeRole = user?.activeRole;
  const isBuyerOrSeller = activeRole === 'BUYER' || activeRole === 'SELLER';

  // Fetch all orders for buyer or seller and find the matching one
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['orders', activeRole],
    queryFn: async () => {
      const endpoint = activeRole === 'SELLER' ? '/orders/seller' : '/orders/buyer';
      const response = await api.get(endpoint);
      return response.data;
    },
    enabled: isBuyerOrSeller,
  });

  const order = orders.find((o) => o.id === id);

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-950 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-zinc-550">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Memuat rincian pesanan...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 w-full bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">
        <Link href="/orders" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
          <ArrowLeft className="h-4 w-4" /> Kembali ke Transaksi
        </Link>
        <Card className="border-zinc-800 bg-zinc-900/20 p-8 text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-white">Pesanan Tidak Ditemukan</h2>
          <p className="text-zinc-500 text-xs mt-1">Sesi pesanan tidak terdaftar atau telah dihapus.</p>
        </Card>
      </div>
    );
  }



  return (
    <div className="flex-1 w-full bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link href={activeRole === 'SELLER' ? '/dashboard' : '/orders'} className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Transaksi
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Order details & Invoice */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Main Invoice Card */}
          <Card className="border-zinc-800 bg-zinc-900/20 backdrop-blur-md overflow-hidden">
            <div className="p-6 border-b border-zinc-850/60 bg-zinc-900/10 flex justify-between items-center flex-wrap gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded">
                  Struk Transaksi
                </span>
                <h2 className="text-sm font-bold text-zinc-400 mt-1">ID Pesanan: {order.id}</h2>
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-1">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Tanggal: {new Date(order.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                <Receipt className="h-5 w-5" />
              </div>
            </div>

            {/* Address Snapshot */}
            <div className="p-6 border-b border-zinc-850/45 space-y-2">
              <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider flex items-center gap-1">
                <MapPin className="h-4 w-4 text-indigo-400" /> Alamat Pengiriman (Snapshot)
              </span>
              <p className="text-xs text-zinc-300 leading-relaxed pl-5 whitespace-pre-line font-medium capitalize">
                {order.deliveryAddress}
              </p>
            </div>

            {/* Kurir Snapshot */}
            <div className="p-6 border-b border-zinc-850/45 space-y-2">
              <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider flex items-center gap-1">
                <Truck className="h-4 w-4 text-indigo-400" /> Metode Pengiriman
              </span>
              <p className="text-xs text-zinc-300 pl-5 font-bold uppercase">
                {order.deliveryMethod.replace(/_/g, ' ')} — {formatRupiah(order.deliveryFee)}
              </p>
            </div>

            {/* Driver Info Display */}
            {order.deliveryJob?.driver?.username && (
              <div className="p-6 border-b border-zinc-850/45 bg-zinc-950/20 flex items-center justify-between">
                <div className="space-y-1">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">
                    Kurir Pengantar
                  </span>
                  <p className="text-xs text-zinc-200 font-bold capitalize flex items-center gap-1.5">
                    <User className="h-4 w-4 text-indigo-400" />
                    {order.deliveryJob.driver.username}
                  </p>
                </div>
                <span className="text-[9px] font-black text-emerald-450 border border-emerald-500/10 bg-emerald-500/5 px-2.5 py-0.5 rounded-full uppercase tracking-wide">
                  Aktif Mengantar
                </span>
              </div>
            )}

            {/* Items List */}
            <div className="p-6 space-y-4">
              <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider flex items-center gap-1 mb-2">
                <Package className="h-4 w-4 text-indigo-400" /> Rincian Barang Pembelian
              </span>
              
              <div className="space-y-4">
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
                    <span className="text-xs font-black text-white">{formatRupiah(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Status history tracking & Invoice summary */}
        <div className="md:col-span-4 space-y-6">
          
          {/* Status Timeline */}
          <Card className="border-zinc-800 bg-zinc-900/30 p-5">
            <h3 className="text-sm font-bold text-white border-b border-zinc-800/60 pb-3 mb-4">Lini Masa Pelacakan</h3>
            
            <div className="relative pl-6 space-y-6 border-l border-zinc-800">
              {ALL_STATUSES.map((step) => {
                const hist = order.orderStatusHistory.find((h) => h.status === step.status);
                const isActive = !!hist;
                const isCurrent = order.status === step.status;
                
                return (
                  <div key={step.status} className="relative">
                    {/* Circle marker */}
                    <span className={`absolute -left-[30px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border transition-colors duration-200 ${
                      isCurrent
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : isActive
                          ? 'bg-zinc-900 border-emerald-650 text-emerald-400'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-700'
                    }`}>
                      <CheckCircle className={`h-2.5 w-2.5 ${isActive ? 'opacity-100' : 'opacity-20'}`} />
                    </span>
                    
                    <div className="space-y-1">
                      <h4 className={`text-xs font-bold ${
                        isCurrent
                          ? 'text-emerald-400 font-extrabold'
                          : isActive
                            ? 'text-zinc-300'
                            : 'text-zinc-500'
                      }`}>
                        {step.label}
                      </h4>
                      {hist ? (
                        <p className="text-[9px] text-zinc-500 font-medium">
                          {new Date(hist.timestamp).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      ) : (
                        <p className="text-[9px] text-zinc-650 italic">Belum tercapai</p>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Special check for DIKEMBALIKAN status */}
              {order.status === 'DIKEMBALIKAN' && (
                <div className="relative">
                  <span className="absolute -left-[30px] top-0.5 flex h-4 w-4 items-center justify-center rounded-full border bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-500/20">
                    <CheckCircle className="h-2.5 w-2.5 text-white" />
                  </span>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-rose-400 font-extrabold">Pesanan Dikembalikan</h4>
                    {order.orderStatusHistory.find((h) => h.status === 'DIKEMBALIKAN') && (
                      <p className="text-[9px] text-zinc-500 font-medium">
                        {new Date(order.orderStatusHistory.find((h) => h.status === 'DIKEMBALIKAN')!.timestamp).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Pricing Breakdown Summary */}
          <Card className="border-zinc-800 bg-zinc-900/30 p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-zinc-800/60 pb-2.5">
              Rincian Pembayaran
            </h3>
            
            <div className="space-y-2.5 text-[11px] text-zinc-450">
              <div className="flex justify-between">
                <span>Subtotal Barang</span>
                <span className="font-semibold text-white">{formatRupiah(order.subTotal)}</span>
              </div>
              {order.discount && order.discount > 0 ? (
                <div className="flex justify-between text-emerald-400">
                  <span>Diskon {order.discountCode ? `(${order.discountCode})` : ''}</span>
                  <span className="font-semibold">-{formatRupiah(order.discount)}</span>
                </div>
              ) : null}
              <div className="flex justify-between">
                <span>Ongkos Kirim</span>
                <span className="font-semibold text-white">{formatRupiah(order.deliveryFee)}</span>
              </div>
              <div className="flex justify-between">
                <span>PPN (12%)</span>
                <span className="font-semibold text-white">{formatRupiah(order.tax)}</span>
              </div>
              
              <div className="border-t border-zinc-800/60 pt-3 flex justify-between items-baseline">
                <span className="text-xs font-bold text-white">Total Tagihan</span>
                <span className="text-base font-black text-indigo-400">{formatRupiah(order.total)}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
