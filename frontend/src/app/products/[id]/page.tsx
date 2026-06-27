'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { ArrowLeft, ShoppingCart, Store, ShieldAlert, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Product, StoreInfo } from '@/types';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [quantity, setQuantity] = useState(1);
  const [isConflictOpen, setIsConflictOpen] = useState(false);

  // 1. Fetch Product Detail
  const { data: product, isLoading, error } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: async () => {
      const response = await api.get<Product>(`/products/${id}`);
      return response.data;
    },
  });

  // 2. Fetch Store Info once product.storeId is loaded (REQ-2C.4)
  const { data: storeInfo, isLoading: isLoadingStore } = useQuery<StoreInfo>({
    queryKey: ['store', product?.storeId],
    queryFn: async () => {
      const response = await api.get<StoreInfo>(`/stores/${product?.storeId}`);
      return response.data;
    },
    enabled: !!product?.storeId,
  });

  // 3. Fetch Cart summary for conflict clearing
  const isBuyer = user?.activeRole === 'BUYER';
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data;
    },
    enabled: isBuyer,
  });

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Mutations
  const addCartMutation = useMutation({
    mutationFn: async ({ productId, qty }: { productId: string; qty: number }) => {
      const response = await api.post('/cart', { productId, quantity: qty });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Produk berhasil ditambahkan ke keranjang!');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('toko lain')) {
        setIsConflictOpen(true);
      } else {
        toast.error(error.response?.data?.message || 'Gagal menambahkan ke keranjang');
      }
    },
  });

  const resetCartAndAddMutation = useMutation({
    mutationFn: async () => {
      // 1. Delete all current items in cart
      if (cartData && cartData.items) {
        await Promise.all(
          cartData.items.map((item: any) => api.delete(`/cart/${item.productId}`))
        );
      }
      // 2. Add new item
      const response = await api.post('/cart', { productId: id, quantity });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Keranjang direset dan produk berhasil ditambahkan!');
      setIsConflictOpen(false);
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Gagal meriset keranjang.');
    },
  });

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
              {/* Product Image */}
              <div className="aspect-video w-full overflow-hidden bg-zinc-950 border border-zinc-850 rounded-lg relative">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="object-cover w-full h-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60';
                  }}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded">
                    Produk SEAPEDIA
                  </span>
                  <span className="text-zinc-500 text-xs flex items-center gap-1">
                    <Store className="h-3.5 w-3.5" /> {product.store?.name || 'Toko SEAPEDIA'}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                  {product.name}
                </h1>
              </div>

              <div className="space-y-2 border-t border-zinc-800/60 pt-4">
                <h3 className="text-xs uppercase font-bold text-zinc-400 tracking-widest">Deskripsi Produk</h3>
                <p className="text-sm text-zinc-300 leading-relaxed warp-break-words whitespace-pre-wrap">
                  {product.description || 'Tidak ada deskripsi produk.'}
                </p>
              </div>

              {/* Store Detail Card (REQ-2C.4) */}
              {isLoadingStore ? (
                <div className="flex items-center gap-2 text-xs text-zinc-650 p-4 border border-zinc-900 rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
                  <span>Memuat informasi toko...</span>
                </div>
              ) : storeInfo ? (
                <Card className="border-zinc-800 bg-zinc-900/30 p-5 mt-6">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
                      <Store className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white capitalize">{storeInfo.name}</h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">
                        {storeInfo.description || 'Tidak ada deskripsi toko.'}
                      </p>
                      <p className="text-[10px] text-zinc-500 font-semibold pt-1">
                        Pemilik Toko: <span className="text-zinc-400 capitalize">{storeInfo.owner?.username}</span>
                      </p>
                    </div>
                  </div>
                </Card>
              ) : null}
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
                  <div className="space-y-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                      <span className="text-sm text-zinc-400">Kuantitas</span>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 border-zinc-800 bg-zinc-950 text-white"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          disabled={quantity <= 1 || product.stock <= 0}
                        >
                          -
                        </Button>
                        <span className="w-10 text-center text-sm font-bold text-white">
                          {product.stock > 0 ? quantity : 0}
                        </span>
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-8 w-8 border-zinc-800 bg-zinc-950 text-white"
                          onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                          disabled={quantity >= product.stock || product.stock <= 0}
                        >
                          +
                        </Button>
                      </div>
                    </div>

                    <Button
                      onClick={() => addCartMutation.mutate({ productId: product.id, qty: quantity })}
                      disabled={addCartMutation.isPending || product.stock <= 0}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium h-12 shadow-lg shadow-indigo-500/10 flex items-center justify-center gap-2"
                    >
                      {addCartMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menambahkan...
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-5 w-5" /> Tambah ke Keranjang
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Button
                      disabled
                      className="w-full bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed h-12 flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-5 w-5" /> Tambah ke Keranjang
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

      {/* Conflict Modal */}
      <Dialog open={isConflictOpen} onOpenChange={setIsConflictOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-indigo-400" /> Reset Keranjang Belanja?
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs leading-relaxed">
              Keranjang Anda sudah berisi produk dari toko lain. Sesuai ketentuan, satu keranjang hanya boleh berisi produk dari satu toko yang sama.
              <br /><br />
              Apakah Anda ingin mengosongkan keranjang saat ini untuk memasukkan produk ini?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConflictOpen(false)}
              className="flex-1 border-zinc-800 text-zinc-450 hover:text-white"
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={resetCartAndAddMutation.isPending}
              onClick={() => resetCartAndAddMutation.mutate()}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              {resetCartAndAddMutation.isPending ? 'Mengosongkan...' : 'Ya, Reset & Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
