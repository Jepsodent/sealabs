'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { Loader2, ShoppingCart, Store, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { CartResponse } from '@/types';

export default function CartPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const isBuyer = user?.activeRole === 'BUYER';

  // 1. Fetch Cart Data
  const { data: cart, isLoading: isLoadingCart } = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data;
    },
    enabled: isBuyer,
  });

  // 2. Update Quantity Mutation
  const updateQtyMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: string; quantity: number }) => {
      const response = await api.put(`/cart/${productId}`, { quantity });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal mengubah kuantitas.');
    },
  });

  // 3. Delete Item Mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await api.delete(`/cart/${productId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Produk dihapus dari keranjang.');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal menghapus produk.');
    },
  });

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoadingAuth || isLoadingCart) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-950 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-zinc-550">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Memuat keranjang belanja...</p>
        </div>
      </div>
    );
  }

  if (!user || !isBuyer) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 bg-zinc-950 min-h-[60vh]">
        <Card className="max-w-md border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <ShoppingCart className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Akses Ditolak</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Anda harus masuk sebagai Pembeli (Buyer) untuk mengakses halaman keranjang belanja ini.
          </p>
          <div className="mt-4">
            <Link href="/login" className="text-indigo-400 font-semibold hover:underline text-sm">
              Masuk Sekarang
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  const items = cart?.items ?? [];
  const subTotal = cart?.subTotal ?? 0;

  return (
    <div className="flex-1 w-full bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <ShoppingCart className="h-7 w-7 text-indigo-400" /> Keranjang Belanja
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Periksa dan atur produk pilihan Anda sebelum melakukan checkout pembayaran.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/10 text-zinc-550 max-w-2xl mx-auto">
          <ShoppingCart className="h-14 w-14 mx-auto mb-3 opacity-30" />
          <h3 className="text-lg font-bold text-white">Keranjang Belanja Anda Kosong</h3>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Belum ada produk yang ditambahkan. Silakan telusuri katalog produk kami untuk mulai berbelanja.
          </p>
          <Link
            href="/products"
            className={cn(
              buttonVariants({ variant: 'default' }),
              "mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            )}
          >
            Lihat Katalog Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center gap-2 text-xs text-zinc-400 px-1">
              <Store className="h-4 w-4 text-indigo-400" />
              <span>Membeli dari toko:</span>
              <span className="font-bold text-white capitalize bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 rounded">
                {cart?.store?.name}
              </span>
            </div>

            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-zinc-900/20 border border-zinc-800/80 rounded-xl gap-4 hover:bg-zinc-900/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    {/* Image */}
                    <div className="h-16 w-16 rounded-lg bg-zinc-950 overflow-hidden shrink-0 border border-zinc-850">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="object-cover h-full w-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';
                        }}
                      />
                    </div>

                    {/* Meta */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white line-clamp-1">{item.name}</h4>
                      <p className="text-xs text-zinc-400 font-semibold">{formatRupiah(item.price)}</p>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 border-zinc-850/60 pt-3 sm:pt-0">
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 border-zinc-800 bg-zinc-950 text-white"
                        onClick={() => updateQtyMutation.mutate({ productId: item.productId, quantity: Math.max(1, item.quantity - 1) })}
                        disabled={item.quantity <= 1 || updateQtyMutation.isPending}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7 border-zinc-800 bg-zinc-950 text-white"
                        onClick={() => updateQtyMutation.mutate({ productId: item.productId, quantity: item.quantity + 1 })}
                        disabled={updateQtyMutation.isPending}
                      >
                        +
                      </Button>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-white whitespace-nowrap min-w-[80px] text-right">
                        {formatRupiah(item.price * item.quantity)}
                      </span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10"
                        onClick={() => deleteItemMutation.mutate(item.productId)}
                        disabled={deleteItemMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout Summary Card */}
          <div className="lg:col-span-4">
            <Card className="border-zinc-800 bg-zinc-900/30 p-6 space-y-6 sticky top-24">
              <h3 className="text-base font-bold text-white border-b border-zinc-800/60 pb-3">Ringkasan Belanja</h3>
              
              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Total Barang</span>
                  <span className="font-bold text-white">{cart?.totalQuantity} Pcs</span>
                </div>
                <div className="flex justify-between text-zinc-450 border-t border-zinc-850/60 pt-3">
                  <span className="text-sm font-bold text-white">Subtotal</span>
                  <span className="text-lg font-black text-indigo-400">{formatRupiah(subTotal)}</span>
                </div>
              </div>

              <Button
                onClick={() => router.push('/checkout')}
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-755 text-white font-bold h-11 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10"
              >
                Lanjut ke Checkout <ArrowRight className="h-4.5 w-4.5" />
              </Button>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
