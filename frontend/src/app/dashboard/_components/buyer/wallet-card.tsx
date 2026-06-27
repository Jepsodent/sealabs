'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Wallet, Plus, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface WalletType {
  id: string;
  balance: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface WalletCardProps {
  wallet: WalletType | undefined;
  isLoadingWallet: boolean;
  formatRupiah: (amount: number) => string;
  refetchWallet: () => void;
  refetchTransactions: () => void;
}

const topUpSchema = z.object({
  amount: z.number({ message: 'Nominal harus berupa angka!' })
    .min(1000, { message: 'Minimal pengisian adalah Rp 1.000!' })
    .max(10000000, { message: 'Maksimal pengisian adalah Rp 10.000.000!' }),
});

type TopUpFormValues = z.infer<typeof topUpSchema>;

export function WalletCard({
  wallet,
  isLoadingWallet,
  formatRupiah,
  refetchWallet,
  refetchTransactions,
}: WalletCardProps) {
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const topUpMutation = useMutation({
    mutationFn: async (data: TopUpFormValues) => {
      const response = await api.post('/wallet/top-up', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Pengisian saldo berhasil!');
      setIsTopUpOpen(false);
      resetTopUp();
      refetchWallet();
      refetchTransactions();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal mengisi saldo.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal mengisi saldo.');
    },
  });

  const {
    register,
    handleSubmit,
    reset: resetTopUp,
    formState: { errors },
  } = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpSchema),
    defaultValues: { amount: 50000 },
  });

  const onSubmit = (data: TopUpFormValues) => {
    topUpMutation.mutate(data);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Wallet Balance */}
      <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between md:col-span-2">
        <div className="space-y-1">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Saldo Dompet Saya</span>
          {isLoadingWallet ? (
            <div className="h-9 w-32 bg-zinc-800 animate-pulse rounded mt-1" />
          ) : (
            <h3 className="text-3xl font-black text-white">{formatRupiah(wallet?.balance ?? 0)}</h3>
          )}
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => {
              resetTopUp({ amount: 50000 });
              setIsTopUpOpen(true);
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" /> Top Up Saldo
          </Button>
        </div>
      </Card>

      {/* Orders Navigation Short Link (Best Practice Accessibility) */}
      <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs text-zinc-500 font-semibold uppercase tracking-wider">Pesanan Saya</span>
          <h3 className="text-xs font-semibold text-zinc-400 pt-1">Pantau & lacak pengiriman pesanan Anda</h3>
          <Link
            href="/orders"
            className="inline-flex items-center gap-1 text-xs font-bold text-indigo-400 hover:underline pt-2"
          >
            Lihat Transaksi <ClipboardList className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="h-12 w-12 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
          <Wallet className="h-6 w-6" />
        </div>
      </Card>

      {/* Top Up Dialog */}
      <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-400" /> Top Up Saldo Dompet
            </DialogTitle>
            <DialogDescription className="text-zinc-450 text-xs">
              Masukkan nominal saldo dummy yang ingin ditambahkan ke akun Anda.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="amount" className="text-zinc-350 text-xs font-semibold uppercase">
                Nominal Top Up (Rp)
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="50000"
                className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700 focus-visible:ring-indigo-500"
                {...register('amount', { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-xs text-rose-500 font-medium">{errors.amount.message}</p>
              )}
            </div>

            <div className="flex gap-2 pt-2">
              {[50000, 100000, 250000, 500000].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => resetTopUp({ amount: val })}
                  className="flex-1 py-1 text-center rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 text-[10px] font-bold cursor-pointer"
                >
                  +{formatRupiah(val).replace('Rp', '').trim()}
                </button>
              ))}
            </div>

            <DialogFooter className="pt-4 flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTopUpOpen(false)}
                className="flex-1 border-zinc-800 text-zinc-450 hover:text-white"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={topUpMutation.isPending}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
              >
                {topUpMutation.isPending ? 'Memproses...' : 'Isi Saldo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
