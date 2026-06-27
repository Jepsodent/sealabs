'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { MapPin, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Address } from '@/types';

interface CheckoutAddressProps {
  addresses: Address[];
  selectedAddressId: string;
  setSelectedAddressId: (id: string) => void;
  refetchAddresses: () => void;
}

const addressSchema = z.object({
  label: z.string().min(1, { message: 'Label wajib diisi!' }).max(40, { message: 'Label maksimal 40 karakter!' }),
  fullAddress: z.string().min(5, { message: 'Alamat lengkap minimal 5 karakter!' }).max(300, { message: 'Alamat lengkap maksimal 300 karakter!' }),
  isDefault: z.boolean(),
});
type AddressFormValues = z.infer<typeof addressSchema>;

export function CheckoutAddress({
  addresses,
  selectedAddressId,
  setSelectedAddressId,
  refetchAddresses,
}: CheckoutAddressProps) {
  const [isAddAddressOpen, setIsAddAddressOpen] = useState(false);

  // Add Address Mutation
  const addAddressMutation = useMutation({
    mutationFn: async (data: AddressFormValues) => {
      const response = await api.post('/addresses', data);
      return response.data;
    },
    onSuccess: (newAddr) => {
      toast.success('Alamat berhasil ditambahkan!');
      setIsAddAddressOpen(false);
      refetchAddresses();
      setSelectedAddressId(newAddr.id);
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal menambahkan alamat.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal menambahkan alamat.');
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: '', fullAddress: '', isDefault: false },
  });

  const onSubmitAddress = (data: AddressFormValues) => {
    addAddressMutation.mutate(data);
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/30">
      <CardHeader className="p-5 border-b border-zinc-800/40 flex flex-row justify-between items-center gap-4">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-indigo-400" /> Alamat Pengiriman
        </CardTitle>
        <Button
          size="xs"
          variant="outline"
          onClick={() => {
            reset({ label: '', fullAddress: '', isDefault: false });
            setIsAddAddressOpen(true);
          }}
          className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 h-8 px-3 text-xs flex items-center gap-1 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" /> Tambah Alamat
        </Button>
      </CardHeader>
      <CardContent className="p-5">
        {addresses.length === 0 ? (
          <div className="text-center py-6 text-zinc-500 space-y-2">
            <MapPin className="h-8 w-8 mx-auto opacity-30" />
            <p className="text-sm font-medium">Anda belum mendaftarkan alamat.</p>
            <p className="text-xs text-zinc-600">Klik "Tambah Alamat" di atas untuk menambahkan alamat pengiriman.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedAddressId === addr.id
                    ? 'border-indigo-500 bg-indigo-950/5'
                    : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700/60'
                }`}
              >
                <input
                  type="radio"
                  name="checkoutAddress"
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="mt-1 accent-indigo-650 cursor-pointer"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white capitalize text-sm">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-bold px-2 py-0.5 rounded">
                        Utama
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-450 leading-relaxed whitespace-pre-line">
                    {addr.fullAddress}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </CardContent>

      {/* DIALOG TAMBAH ALAMAT INLINE */}
      <Dialog open={isAddAddressOpen} onOpenChange={setIsAddAddressOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white">Tambah Alamat Baru</DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Masukkan detail rincian alamat pengiriman Anda secara lengkap.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitAddress)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="addrLabel" className="text-zinc-300 text-xs font-semibold uppercase">
                Label Alamat
              </Label>
              <Input
                id="addrLabel"
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
              <Label htmlFor="addrFull" className="text-zinc-300 text-xs font-semibold uppercase">
                Alamat Lengkap
              </Label>
              <Textarea
                id="addrFull"
                rows={4}
                placeholder="Tulis alamat jalan, nomor rumah, RT/RW, kecamatan, kota, dan kode pos secara rinci..."
                className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700 focus-visible:ring-indigo-500 resize-none"
                {...register('fullAddress')}
              />
              {errors.fullAddress && (
                <p className="text-xs text-rose-500 font-medium">{errors.fullAddress.message}</p>
              )}
            </div>

            <div className="flex items-center gap-2 py-1">
              <input
                id="addrDefault"
                type="checkbox"
                className="rounded border-zinc-800 bg-zinc-950 text-indigo-650 focus:ring-indigo-500 h-4 w-4 cursor-pointer"
                {...register('isDefault')}
              />
              <Label htmlFor="addrDefault" className="text-zinc-300 text-xs cursor-pointer select-none">
                Jadikan Alamat Utama (Alamat Default)
              </Label>
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddAddressOpen(false)}
                className="flex-1 border-zinc-800 text-zinc-450 hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={addAddressMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {addAddressMutation.isPending ? 'Menyimpan...' : 'Simpan Alamat'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
