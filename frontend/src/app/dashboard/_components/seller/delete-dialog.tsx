'use client';

import React from 'react';
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

interface DeleteProductDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct: Product | null;
  onSuccess: () => void;
}

export function DeleteProductDialog({ isOpen, onOpenChange, selectedProduct, onSuccess }: DeleteProductDialogProps) {
  const queryClient = useQueryClient();

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/products/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Produk berhasil dihapus!');
      onOpenChange(false);
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error('Gagal menghapus produk.');
    },
  });

  const handleDelete = () => {
    if (selectedProduct) {
      deleteProductMutation.mutate(selectedProduct.id);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-white">Hapus Produk?</DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs leading-relaxed">
            Apakah Anda yakin ingin menghapus produk <span className="font-bold text-white">"{selectedProduct?.name}"</span>? 
            Tindakan ini permanen dan tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="pt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 border-zinc-800 text-zinc-450 hover:text-white hover:bg-zinc-850"
          >
            Batal
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={deleteProductMutation.isPending}
            onClick={handleDelete}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold"
          >
            {deleteProductMutation.isPending ? 'Menhgapus...' : 'Ya, Hapus'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
