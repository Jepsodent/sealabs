'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Store, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const storeSchema = z.object({
  name: z.string().min(5, { message: 'Nama toko minimal 5 karakter!' }),
  description: z.string().max(100, { message: 'Deskripsi maksimal 100 karakter!' }).optional(),
});

type StoreFormValues = z.infer<typeof storeSchema>;

interface StoreSetupProps {
  onStoreCreated: () => void;
}

export function StoreSetup({ onStoreCreated }: StoreSetupProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const createStoreMutation = useMutation({
    mutationFn: async (data: StoreFormValues) => {
      const response = await api.post('/stores', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Toko Anda berhasil dibuat!');
      onStoreCreated();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal membuat toko.';
      toast.error(typeof msg === 'string' ? msg : 'Nama toko sudah digunakan!');
    },
  });

  const onSubmitStore = (data: StoreFormValues) => {
    createStoreMutation.mutate(data);
  };

  return (
    <div className="max-w-xl mx-auto py-6">
      <Card className="border-zinc-800 bg-zinc-900/50 backdrop-blur-md shadow-xl">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-2">
            <Store className="h-6 w-6" />
          </div>
          <CardTitle className="text-xl font-bold text-white">Setup Toko Seller Anda</CardTitle>
          <CardDescription className="text-zinc-400 text-sm">
            Anda terdaftar sebagai Seller tetapi belum memiliki toko. Buat toko Anda untuk mulai mendaftarkan produk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmitStore)} className="space-y-4">
            {createStoreMutation.isError && (
              <div className="flex items-center gap-2 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Nama toko sudah digunakan! Tolong pilih nama yang lain.</span>
              </div>
            )}

            {/* Store Name */}
            <div className="space-y-2">
              <Label htmlFor="storeName" className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                Nama Toko (Harus Unik)
              </Label>
              <Input
                id="storeName"
                type="text"
                placeholder="Contoh: Budi Elektronik Mall"
                className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-600 focus-visible:ring-indigo-500"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
              )}
            </div>

            {/* Store Description */}
            <div className="space-y-2">
              <Label htmlFor="storeDesc" className="text-zinc-300 text-xs font-semibold uppercase tracking-wider">
                Deskripsi Singkat Toko
              </Label>
              <Textarea
                id="storeDesc"
                rows={3}
                placeholder="Jelaskan jenis produk yang Anda jual (maks 100 karakter)..."
                className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-600 focus-visible:ring-indigo-500 resize-none"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-rose-500 font-medium">{errors.description.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={createStoreMutation.isPending}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium"
            >
              {createStoreMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Membuat Toko...
                </>
              ) : (
                'Buat Toko Sekarang'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
