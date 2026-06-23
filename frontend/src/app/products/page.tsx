'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { ShoppingBag, ArrowUpRight, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  store?: {
    name: string;
  };
}

export default function ProductsPage() {
  const { data: products = [], isLoading, error } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await api.get<Product[]>('/products');
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

  return (
    <div className="flex-1 w-full bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ShoppingBag className="h-7 w-7 text-indigo-400" /> Katalog Produk
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Temukan barang berkualitas dari toko-toko terpercaya di SEAPEDIA.
          </p>
        </div>
      </div>

      {/* Loading state */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Memuat katalog produk...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20 border border-zinc-800 rounded-xl bg-zinc-900/10">
          <p className="text-rose-400 font-medium">Gagal memuat katalog produk.</p>
          <p className="text-xs text-zinc-500 mt-1">Silakan periksa koneksi backend Anda.</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/10 text-zinc-500">
          <p className="font-semibold">Belum ada produk terdaftar</p>
          <p className="text-xs text-zinc-600 mt-1">Silakan coba lagi nanti.</p>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-zinc-700 transition-all flex flex-col group h-full justify-between overflow-hidden"
            >
              {/* Product Image */}
              <div className="aspect-video w-full overflow-hidden bg-zinc-950 border-b border-zinc-800/50 relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';
                  }}
                />
              </div>

              <CardHeader className="p-5">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20 truncate max-w-[150px]">
                    {product.store?.name || 'Toko SEAPEDIA'}
                  </span>
                  <span className="text-xs text-zinc-500 font-medium whitespace-nowrap">Stok: {product.stock}</span>
                </div>
                <CardTitle className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mt-3 line-clamp-1">
                  {product.name}
                </CardTitle>
                <p className="text-2xl font-black text-white mt-2 tracking-tight">
                  {formatRupiah(product.price)}
                </p>
              </CardHeader>

              <CardContent className="px-5 pb-4 pt-0">
                <CardDescription className="text-zinc-400 text-sm line-clamp-3 leading-relaxed">
                  {product.description}
                </CardDescription>
              </CardContent>

              <CardFooter className="p-5 border-t border-zinc-800/40 bg-zinc-900/10">
                <Link
                  href={`/products/${product.id}`}
                  className={cn(
                    buttonVariants({ size: 'sm', variant: 'outline' }),
                    "w-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center gap-1.5"
                  )}
                >
                  Lihat Detail <ArrowUpRight className="h-4 w-4" />
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
