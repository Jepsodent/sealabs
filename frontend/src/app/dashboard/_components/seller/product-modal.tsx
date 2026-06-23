'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

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

const productSchema = z.object({
  name: z.string().min(1, { message: 'Nama produk wajib diisi!' }).max(50, { message: 'Nama produk maksimal 50 karakter!' }),
  description: z.string().max(150, { message: 'Deskripsi produk maksimal 150 karakter!' }).optional().nullable(),
  price: z.number().min(0, { message: 'Harga tidak boleh negatif!' }),
  stock: z.number().min(0, { message: 'Stok tidak boleh negatif!' }),
  imageUrl: z.string().min(1, { message: 'Link gambar wajib diisi!' }).url({ message: 'Masukkan URL gambar yang valid!' }),
});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: Product | null;
  onSuccess: () => void;
}

export function ProductModal({ isOpen, onOpenChange, selectedProduct, onSuccess }: ProductModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      imageUrl: '',
    },
  });

  // Prefill form when editing
  useEffect(() => {
    if (selectedProduct) {
      setValue('name', selectedProduct.name);
      setValue('description', selectedProduct.description || '');
      setValue('price', selectedProduct.price);
      setValue('stock', selectedProduct.stock);
      setValue('imageUrl', selectedProduct.imageUrl);
    } else {
      reset({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        imageUrl: '',
      });
    }
  }, [selectedProduct, setValue, reset, isOpen]);

  // Create Product Mutation
  const createProductMutation = useMutation({
    mutationFn: async (data: ProductFormValues) => {
      const response = await api.post('/products', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Produk berhasil ditambahkan!');
      onOpenChange(false);
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menambahkan produk.';
      toast.error(typeof msg === 'string' ? msg : 'Nama produk sudah terdaftar di toko Anda!');
    },
  });

  // Update Product Mutation
  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: ProductFormValues }) => {
      const response = await api.put(`/products/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Produk berhasil diperbarui!');
      onOpenChange(false);
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal memperbarui produk.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal memperbarui produk.');
    },
  });

  const onSubmitProduct = (data: ProductFormValues) => {
    if (selectedProduct) {
      updateProductMutation.mutate({ id: selectedProduct.id, data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const isPending = createProductMutation.isPending || updateProductMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">
            {selectedProduct ? 'Edit Data Produk' : 'Tambah Produk Baru'}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Isi data detail produk di bawah. Produk akan langsung terhubung ke toko Anda.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmitProduct)} className="space-y-4 py-2">
          {/* Product Name */}
          <div className="space-y-1.5">
            <Label htmlFor="prodName" className="text-zinc-300 text-xs font-semibold uppercase">
              Nama Produk
            </Label>
            <Input
              id="prodName"
              type="text"
              placeholder="Contoh: Wireless Gaming Mouse"
              className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700 focus-visible:ring-indigo-500"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-rose-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Price & Stock Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="prodPrice" className="text-zinc-300 text-xs font-semibold uppercase">
                Harga Jual (Rp)
              </Label>
              <Input
                id="prodPrice"
                type="number"
                placeholder="350000"
                className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700 focus-visible:ring-indigo-500"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-xs text-rose-500 font-medium">{errors.price.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="prodStock" className="text-zinc-300 text-xs font-semibold uppercase">
                Jumlah Stok
              </Label>
              <Input
                id="prodStock"
                type="number"
                placeholder="25"
                className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700 focus-visible:ring-indigo-500"
                {...register('stock', { valueAsNumber: true })}
              />
              {errors.stock && (
                <p className="text-xs text-rose-500 font-medium">{errors.stock.message}</p>
              )}
            </div>
          </div>

          {/* Image URL */}
          <div className="space-y-1.5">
            <Label htmlFor="prodImage" className="text-zinc-300 text-xs font-semibold uppercase">
              URL Gambar Produk
            </Label>
            <Input
              id="prodImage"
              type="text"
              placeholder="https://images.unsplash.com/..."
              className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700 focus-visible:ring-indigo-500"
              {...register('imageUrl')}
            />
            {errors.imageUrl && (
              <p className="text-xs text-rose-500 font-medium">{errors.imageUrl.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="prodDesc" className="text-zinc-300 text-xs font-semibold uppercase">
              Deskripsi Produk
            </Label>
            <Textarea
              id="prodDesc"
              rows={3}
              placeholder="Tulis deskripsi detail produk jualan Anda..."
              className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700 focus-visible:ring-indigo-500 resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-rose-500 font-medium">{errors.description.message}</p>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-zinc-800 text-zinc-400 hover:text-white"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                'Simpan Produk'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
