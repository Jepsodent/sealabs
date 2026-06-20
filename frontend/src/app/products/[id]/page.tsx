'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShoppingCart, Store, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  storeName: string;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();

  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
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

  const handleCheckout = () => {
    toast.success('Simulasi Pembelian Berhasil!');
  };

  // Logic: checkout is only allowed if user is logged in AND their activeRole is BUYER
  const isBuyer = user?.activeRole === 'BUYER';

  return (
    <div className="flex-1 w-full bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-6">
      {/* Back Link */}
      <Link href="/products" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Katalog
      </Link>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 text-zinc-500 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Memuat detail produk...</p>
        </div>
      ) : error || !product ? (
        <Card className="border-zinc-800 bg-zinc-900/20 p-8 text-center">
          <h2 className="text-xl font-bold text-rose-500">Produk Tidak Ditemukan</h2>
          <p className="text-zinc-500 text-xs mt-1">Produk mungkin telah dihapus atau URL tidak valid.</p>
        </Card>
      ) : (
        /* Main Product Card */
        <Card className="border-zinc-800 bg-zinc-900/20 backdrop-blur-md overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-12">
            {/* Product Metadata Info (Left side/top on mobile) */}
            <div className="md:col-span-7 p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded">
                    Produk SEAPEDIA
                  </span>
                  <span className="text-zinc-500 text-xs flex items-center gap-1">
                    <Store className="h-3.5 w-3.5" /> {product.storeName}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {product.name}
                </h1>
              </div>

              <div className="space-y-2 border-t border-zinc-800/60 pt-4">
                <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-widest">Deskripsi Produk</h3>
                <p className="text-sm text-zinc-300 leading-relaxed break-words whitespace-pre-wrap">
                  {product.description}
                </p>
              </div>
            </div>

            {/* Price & Checkout Section (Right side/bottom on mobile) */}
            <div className="md:col-span-5 p-6 sm:p-8 bg-zinc-900/40 border-t md:border-t-0 md:border-l border-zinc-800/80 flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div>
                  <span className="text-xs text-zinc-500 font-semibold block">Harga Jual</span>
                  <p className="text-3xl sm:text-4xl font-black text-white tracking-tight mt-1">
                    {formatRupiah(product.price)}
                  </p>
                </div>

                <div className="flex justify-between items-center text-sm py-2 border-y border-zinc-800/40">
                  <span className="text-zinc-500">Ketersediaan Stok</span>
                  <span className={`font-bold ${product.stock > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {product.stock > 0 ? `${product.stock} Unit Ready` : 'Habis'}
                  </span>
                </div>
              </div>

              {/* Purchase restriction display */}
              <div className="space-y-4">
                {isBuyer ? (
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium h-12 shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-5 w-5" /> Beli Sekarang
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <Button
                      disabled
                      className="w-full bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed h-12 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-5 w-5" /> Beli Sekarang
                    </Button>
                    <div className="flex gap-2 p-3 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 text-xs leading-relaxed">
                      <ShieldAlert className="h-5 w-5 text-indigo-400 shrink-0" />
                      <div>
                        {user ? (
                          <p>
                            Tombol pembelian dinonaktifkan. Ganti peran aktif Anda ke{' '}
                            <span className="font-bold text-indigo-400">BUYER</span> melalui Navbar untuk membeli.
                          </p>
                        ) : (
                          <p>
                            Anda harus{' '}
                            <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
                              Masuk
                            </Link>{' '}
                            sebagai Pembeli (Buyer) untuk dapat membeli produk ini.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
