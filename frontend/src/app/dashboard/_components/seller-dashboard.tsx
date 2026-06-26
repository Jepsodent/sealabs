'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Loader2,
  Store,
  Edit,
  Package,
  Plus,
  Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

// Sub-components
import { StoreSetup } from './seller/store-setup';
import { ProductModal } from './seller/product-modal';
import { DeleteProductDialog } from './seller/delete-dialog';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string;
  storeId: string;
  createdAt: string;
  updatedAt: string;
}

interface StoreType {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  products: Product[];
  createdAt: string;
  updatedAt: string;
}

const storeSchema = z.object({
  name: z.string().min(5, { message: 'Nama toko minimal 5 karakter!' }),
  description: z.string().max(100, { message: 'Deskripsi maksimal 100 karakter!' }).optional(),
});

type StoreFormValues = z.infer<typeof storeSchema>;

interface SellerDashboardProps {
  formatRupiah: (amount: number) => string;
}

export function SellerDashboard({ formatRupiah }: SellerDashboardProps) {
  // 1. Fetch Store Profile
  const { data: myStore, isLoading: isLoadingStore, refetch: refetchStore } = useQuery<StoreType | null>({
    queryKey: ['my-store'],
    queryFn: async () => {
      try {
        const response = await api.get('/stores/my-store');
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null; // Indicates no store yet
        }
        throw err;
      }
    },
    retry: false,
  });

  // 2. Fetch Products belonging to the store
  const { data: products = [], isLoading: isLoadingProducts, refetch: refetchProducts } = useQuery<Product[]>({
    queryKey: ['my-products'],
    queryFn: async () => {
      const response = await api.get('/products/my-products');
      return response.data;
    },
    enabled: !!myStore, // Only run if store exists
  });

  // --- MUTATIONS ---
  // Update Store Profile
  const updateStoreMutation = useMutation({
    mutationFn: async (data: StoreFormValues) => {
      const response = await api.patch('/stores/my-store', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Profil toko berhasil diperbarui!');
      setIsEditStoreOpen(false);
      refetchStore();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal memperbarui toko.';
      toast.error(typeof msg === 'string' ? msg : 'Nama toko sudah digunakan!');
    },
  });

  // --- STATES & FORMS ---
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Store Form
  const {
    register: registerStore,
    handleSubmit: handleSubmitStore,
    reset: resetStore,
    formState: { errors: storeErrors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const onSubmitStore = (data: StoreFormValues) => {
    updateStoreMutation.mutate(data);
  };

  const openAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const openDeleteConfirm = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteConfirmOpen(true);
  };

  const openEditStore = () => {
    if (!myStore) return;
    resetStore({
      name: myStore.name,
      description: myStore.description || '',
    });
    setIsEditStoreOpen(true);
  };

  // Loading indicator for Store query
  if (isLoadingStore) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500 gap-2">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
        <span className="text-sm">Mengecek data toko Anda...</span>
      </div>
    );
  }

  // CASE 1: No Store Created Yet -> Show Setup Store Screen
  if (!myStore) {
    return <StoreSetup onStoreCreated={refetchStore} />;
  }

  // CASE 2: Store Exists -> Render Store Profile & Product CRUD
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-zinc-800 bg-zinc-900/30 lg:col-span-2 p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Store className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white capitalize">{myStore.name}</h3>
                  <p className="text-xs text-zinc-500">Toko Aktif SEAPEDIA</p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={openEditStore}
                className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 h-8 px-3 text-xs"
              >
                <Edit className="h-3.5 w-3.5 mr-1" /> Edit Profil
              </Button>
            </div>

            <p className="text-sm text-zinc-400 leading-relaxed warp-break-words">
              {myStore.description || 'Tidak ada deskripsi toko.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-500 pt-4 border-t border-zinc-800/40 mt-4">
            <span>Dibuat pada: {new Date(myStore.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </Card>

        {/* Quick Finance Block */}
        <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-semibold uppercase block">Pendapatan Toko</span>
            <h3 className="text-3xl font-black text-white">{formatRupiah(12500000)}</h3>
            <p className="text-xs text-zinc-500 pt-1">Simulasi Pendapatan Level 2</p>
          </div>
          <div className="flex justify-between items-center text-xs py-2 border-t border-zinc-800/40 mt-4 text-zinc-400">
            <span>Total Produk</span>
            <span className="font-bold text-indigo-400">{products.length} Items</span>
          </div>
        </Card>
      </div>

      {/* Product Management Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-800/60 pb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Package className="h-5.5 w-5.5 text-indigo-400" /> Kelola Produk Toko
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Daftar inventaris produk yang Anda pasang ke katalog publik.</p>
          </div>
          <Button
            onClick={openAddProduct}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5"
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
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
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
                    className="flex-1 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 h-8 text-xs"
                  >
                    <Edit className="h-3.5 w-3.5 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => openDeleteConfirm(product)}
                    className="flex-1 bg-rose-950/20 hover:bg-rose-950 border border-rose-900/30 hover:border-rose-900/60 text-rose-400 h-8 text-xs font-semibold"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 1. DIALOG MODAL EDIT PROFILE TOKO */}
      <Dialog open={isEditStoreOpen} onOpenChange={setIsEditStoreOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Edit Profil Toko</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Perbarui nama dan informasi profil toko Seller Anda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitStore(onSubmitStore)} className="space-y-4 py-2">
            {/* Store Name */}
            <div className="space-y-1.5">
              <Label htmlFor="editStoreName" className="text-zinc-300 text-xs font-semibold uppercase">
                Nama Toko
              </Label>
              <Input
                id="editStoreName"
                type="text"
                className="border-zinc-800 bg-zinc-950 text-white focus-visible:ring-indigo-500"
                {...registerStore('name')}
              />
              {storeErrors.name && (
                <p className="text-xs text-rose-500 font-medium">{storeErrors.name.message}</p>
              )}
            </div>

            {/* Store Description */}
            <div className="space-y-1.5">
              <Label htmlFor="editStoreDesc" className="text-zinc-300 text-xs font-semibold uppercase">
                Deskripsi Toko
              </Label>
              <Textarea
                id="editStoreDesc"
                rows={3}
                className="border-zinc-800 bg-zinc-950 text-white focus-visible:ring-indigo-500 resize-none"
                {...registerStore('description')}
              />
              {storeErrors.description && (
                <p className="text-xs text-rose-500 font-medium">{storeErrors.description.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditStoreOpen(false)}
                className="border-zinc-800 text-zinc-400 hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={updateStoreMutation.isPending}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {updateStoreMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. DIALOG MODAL CRUD PRODUK */}
      <ProductModal
        isOpen={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        selectedProduct={selectedProduct}
        onSuccess={refetchProducts}
      />

      {/* 3. DIALOG KONFIRMASI HAPUS PRODUK */}
      <DeleteProductDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        selectedProduct={selectedProduct}
        onSuccess={refetchProducts}
      />
    </div>
  );
}
