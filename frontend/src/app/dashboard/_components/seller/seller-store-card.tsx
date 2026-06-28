'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
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
import { Store, Edit } from 'lucide-react';
import { toast } from 'sonner';
import { StoreType, Product } from '@/types';

interface SellerStoreCardProps {
  myStore: StoreType;
  products: Product[];
  formatRupiah: (amount: number) => string;
  refetchStore: () => void;
  sellerReport?: { revenue: number };
  isLoadingReport?: boolean;
}

const storeSchema = z.object({
  name: z.string().min(5, { message: 'Nama toko minimal 5 karakter!' }),
  description: z.string().max(100, { message: 'Deskripsi maksimal 100 karakter!' }).optional(),
});

type StoreFormValues = z.infer<typeof storeSchema>;

export function SellerStoreCard({
  myStore,
  products,
  formatRupiah,
  refetchStore,
  sellerReport,
  isLoadingReport,
}: SellerStoreCardProps) {
  const [isEditStoreOpen, setIsEditStoreOpen] = useState(false);

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

  // Store Form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: myStore.name,
      description: myStore.description || '',
    },
  });

  const onSubmitStore = (data: StoreFormValues) => {
    updateStoreMutation.mutate(data);
  };

  const openEditStore = () => {
    reset({
      name: myStore.name,
      description: myStore.description || '',
    });
    setIsEditStoreOpen(true);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Store Card Profile */}
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
              className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 h-8 px-3 text-xs cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5 mr-1" /> Edit Profil
            </Button>
          </div>

          <p className="text-sm text-zinc-400 leading-relaxed break-words">
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
          {isLoadingReport ? (
            <div className="h-9 w-32 bg-zinc-800 animate-pulse rounded mt-1" />
          ) : (
            <h3 className="text-2xl font-black text-white">{formatRupiah(sellerReport?.revenue ?? 0)}</h3>
          )}
          <p className="text-xs text-zinc-500 pt-1">Total akumulasi omset penjualan</p>
        </div>
        <div className="flex justify-between items-center text-xs py-2 border-t border-zinc-800/40 mt-4 text-zinc-400">
          <span>Total Produk</span>
          <span className="font-bold text-indigo-400">{products.length} Items</span>
        </div>
      </Card>

      {/* DIALOG MODAL EDIT PROFILE TOKO */}
      <Dialog open={isEditStoreOpen} onOpenChange={setIsEditStoreOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-white">Edit Profil Toko</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Perbarui nama dan informasi profil toko Seller Anda.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitStore)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="editStoreName" className="text-zinc-300 text-xs font-semibold uppercase">
                Nama Toko
              </Label>
              <Input
                id="editStoreName"
                type="text"
                className="border-zinc-800 bg-zinc-950 text-white focus-visible:ring-indigo-500"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editStoreDesc" className="text-zinc-300 text-xs font-semibold uppercase">
                Deskripsi Toko
              </Label>
              <Textarea
                id="editStoreDesc"
                rows={3}
                className="border-zinc-800 bg-zinc-950 text-white focus-visible:ring-indigo-500 resize-none"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-rose-500 font-medium">{errors.description.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2 flex gap-2">
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {updateStoreMutation.isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
