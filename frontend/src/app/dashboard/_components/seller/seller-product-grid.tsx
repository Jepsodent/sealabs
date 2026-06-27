'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Package, Plus, Edit, Trash2 } from 'lucide-react';
import { Product } from '@/types';

interface SellerProductGridProps {
  products: Product[];
  isLoadingProducts: boolean;
  openEditProduct: (product: Product) => void;
  openDeleteConfirm: (product: Product) => void;
  openAddProduct: () => void;
  formatRupiah: (amount: number) => string;
}

export function SellerProductGrid({
  products,
  isLoadingProducts,
  openEditProduct,
  openDeleteConfirm,
  openAddProduct,
  formatRupiah,
}: SellerProductGridProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/60 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Package className="h-5.5 w-5.5 text-indigo-400" /> Katalog Inventaris
          </h2>
          <p className="text-xs text-zinc-550">Kelola produk jualan yang Anda pasang ke katalog publik.</p>
        </div>
        <Button
          onClick={openAddProduct}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" /> Tambah Produk Baru
        </Button>
      </div>

      {/* Product Table Grid */}
      {isLoadingProducts ? (
        <div className="flex items-center justify-center py-20 text-zinc-500 gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          <span className="text-xs">Memuat produk Anda...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/10 text-zinc-500">
          <Package className="h-10 w-10 mx-auto mb-2 opacity-40 text-zinc-650" />
          <p className="text-sm font-semibold">Toko Anda belum memiliki produk</p>
          <p className="text-xs text-zinc-600 mt-1">Klik tombol "Tambah Produk Baru" untuk mulai memajang barang jualan Anda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40 hover:border-zinc-700/80 transition-all flex flex-col group h-full justify-between overflow-hidden"
            >
              {/* Product Image */}
              <div className="aspect-video w-full overflow-hidden bg-zinc-950 border-b border-zinc-850 relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';
                  }}
                />
                {/* Stock tag */}
                <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded border ${
                  product.stock > 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-455 border-rose-500/20'
                }`}>
                  Stok: {product.stock}
                </span>
              </div>

              <CardHeader className="p-4">
                <CardTitle className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                  {product.name}
                </CardTitle>
                <p className="text-xl font-black text-white mt-1.5 tracking-tight">
                  {formatRupiah(product.price)}
                </p>
              </CardHeader>

              <CardContent className="px-4 pb-4 pt-0">
                <CardDescription className="text-zinc-400 text-xs line-clamp-2 leading-relaxed">
                  {product.description || 'Tidak ada deskripsi.'}
                </CardDescription>
              </CardContent>

              <CardFooter className="p-4 border-t border-zinc-850/50 bg-zinc-900/10 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEditProduct(product)}
                  className="flex-1 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 h-8 text-xs cursor-pointer"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => openDeleteConfirm(product)}
                  className="flex-1 bg-rose-950/20 hover:bg-rose-950 border border-rose-900/30 hover:border-rose-900/60 text-rose-400 h-8 text-xs font-semibold cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
