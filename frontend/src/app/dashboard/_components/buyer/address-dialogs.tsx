'use client';

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/api';
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
import { AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Address {
  id: string;
  label: string;
  fullAddress: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
}

interface AddressDialogsProps {
  // Add/Edit Dialog
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedAddress: Address | null;
  onSuccess: () => void;

  // Delete Dialog
  isDeleteOpen: boolean;
  setIsDeleteOpen: (open: boolean) => void;
}

const addressSchema = z.object({
  label: z.string().min(1, { message: 'Label wajib diisi!' }).max(40, { message: 'Label maksimal 40 karakter!' }),
  fullAddress: z.string().min(5, { message: 'Alamat lengkap minimal 5 karakter!' }).max(300, { message: 'Alamat lengkap maksimal 300 karakter!' }),
  isDefault: z.boolean(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

export function AddressDialogs({
  isModalOpen,
  setIsModalOpen,
  selectedAddress,
  onSuccess,
  isDeleteOpen,
  setIsDeleteOpen,
}: AddressDialogsProps) {
  // 1. Create/Update Mutation
  const createAddressMutation = useMutation({
    mutationFn: async (data: AddressFormValues) => {
      const response = await api.post('/addresses', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Alamat berhasil ditambahkan!');
      setIsModalOpen(false);
      onSuccess();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menambahkan alamat.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal menambahkan alamat.');
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AddressFormValues }) => {
      const response = await api.put(`/addresses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Alamat berhasil diperbarui!');
      setIsModalOpen(false);
      onSuccess();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal memperbarui alamat.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal memperbarui alamat.');
    },
  });

  // 2. Delete Mutation
  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/addresses/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Alamat berhasil dihapus!');
      setIsDeleteOpen(false);
      onSuccess();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menghapus alamat.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal menghapus alamat.');
    },
  });

  // 3. Form Setup
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: '', fullAddress: '', isDefault: false },
  });

  // Reset/Set Form Values on selectedAddress change
  useEffect(() => {
    if (isModalOpen) {
      if (selectedAddress) {
        setValue('label', selectedAddress.label);
        setValue('fullAddress', selectedAddress.fullAddress);
        setValue('isDefault', selectedAddress.isDefault);
      } else {
        reset({ label: '', fullAddress: '', isDefault: false });
      }
    }
  }, [selectedAddress, isModalOpen, setValue, reset]);

  const onSubmit = (data: AddressFormValues) => {
    if (selectedAddress) {
      updateAddressMutation.mutate({ id: selectedAddress.id, data });
    } else {
      createAddressMutation.mutate(data);
    }
  };

  return (
    <>
      {/* 1. Add/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white">
              {selectedAddress ? 'Edit Alamat Pengiriman' : 'Tambah Alamat Baru'}
            </DialogTitle>
            <DialogDescription className="text-zinc-450 text-xs">
              {selectedAddress
                ? 'Perbarui detail informasi alamat pengiriman Anda.'
                : 'Lengkapi formulir untuk menambahkan alamat tujuan pengiriman baru.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="label" className="text-zinc-350 text-xs font-semibold uppercase">
                Label Alamat
              </Label>
              <Input
                id="label"
                type="text"
                placeholder="Contoh: Rumah, Kantor, Kosan"
                className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700 focus-visible:ring-indigo-500"
                {...register('label')}
              />
              {errors.label && (
                <p className="text-xs text-rose-500 font-medium">{errors.label.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="fullAddress" className="text-zinc-350 text-xs font-semibold uppercase">
                Alamat Lengkap
              </Label>
              <Textarea
                id="fullAddress"
                rows={4}
                placeholder="Nama jalan, nomor rumah, RT/RW, kelurahan, kecamatan, kota, kode pos..."
                className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700 focus-visible:ring-indigo-500 resize-none"
                {...register('fullAddress')}
              />
              {errors.fullAddress && (
                <p className="text-xs text-rose-500 font-medium">{errors.fullAddress.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                id="isDefault"
                type="checkbox"
                className="rounded border-zinc-800 bg-zinc-950 text-indigo-650 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                {...register('isDefault')}
              />
              <Label htmlFor="isDefault" className="text-zinc-350 text-xs cursor-pointer select-none">
                Jadikan Alamat Utama (Alamat Default)
              </Label>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 border-zinc-800 text-zinc-450 hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={createAddressMutation.isPending || updateAddressMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {createAddressMutation.isPending || updateAddressMutation.isPending
                  ? 'Menyimpan...'
                  : 'Simpan Alamat'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 2. Delete Confirm Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-rose-500" /> Hapus Alamat?
            </DialogTitle>
            <DialogDescription className="text-zinc-450 text-xs leading-relaxed">
              Apakah Anda yakin ingin menghapus alamat <span className="font-bold text-white capitalize">"{selectedAddress?.label}"</span>? Tindakan ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-4 flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDeleteOpen(false)}
              className="flex-1 border-zinc-800 text-zinc-450 hover:text-white"
            >
              Batal
            </Button>
            <Button
              type="button"
              disabled={deleteAddressMutation.isPending}
              onClick={() => selectedAddress && deleteAddressMutation.mutate(selectedAddress.id)}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold"
            >
              {deleteAddressMutation.isPending ? 'Menghapus...' : 'Ya, Hapus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
