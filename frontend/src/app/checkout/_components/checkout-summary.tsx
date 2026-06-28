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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Wallet, CreditCard, Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { WalletType } from '@/types';

interface CheckoutSummaryProps {
  subTotal: number;
  shippingFee: number;
  taxAmount: number;
  totalAmount: number;
  wallet: WalletType | undefined;
  formatRupiah: (amount: number) => string;
  onCheckout: () => void;
  isCheckoutPending: boolean;
  selectedAddressId: string;
  refetchWallet: () => void;
  appliedDiscount: {
    code: string;
    discountValue: number;
    isPercent: boolean;
    type: 'VOUCHER' | 'PROMO';
  } | null;
  discountAmount: number;
  onApplyDiscount: (code: string) => Promise<void>;
  onRemoveDiscount: () => void;
  isApplyingDiscount: boolean;
}

const topUpSchema = z.object({
  amount: z.number({ message: 'Nominal harus berupa angka!' })
    .min(1000, { message: 'Minimal pengisian adalah Rp 1.000!' })
    .max(10000000, { message: 'Maksimal pengisian adalah Rp 10.000.000!' }),
});
type TopUpFormValues = z.infer<typeof topUpSchema>;

export function CheckoutSummary({
  subTotal,
  shippingFee,
  taxAmount,
  totalAmount,
  wallet,
  formatRupiah,
  onCheckout,
  isCheckoutPending,
  selectedAddressId,
  refetchWallet,
  appliedDiscount,
  discountAmount,
  onApplyDiscount,
  onRemoveDiscount,
  isApplyingDiscount,
}: CheckoutSummaryProps) {
  const [discountCodeText, setDiscountCodeText] = useState('');
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);

  const buyerBalance = wallet?.balance ?? 0;
  const isBalanceSufficient = buyerBalance >= totalAmount;

  // Top Up Mutation
  const topUpMutation = useMutation({
    mutationFn: async (data: TopUpFormValues) => {
      const response = await api.post('/wallet/top-up', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Top up berhasil!');
      setIsTopUpOpen(false);
      refetchWallet();
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal mengisi saldo.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal mengisi saldo.');
    },
  });

  const {
    register: registerTopUp,
    handleSubmit: handleSubmitTopUp,
    reset: resetTopUp,
    formState: { errors: topUpErrors },
  } = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpSchema),
    defaultValues: { amount: 50000 },
  });

  const onSubmitTopUp = (data: TopUpFormValues) => {
    topUpMutation.mutate(data);
  };

  const handleApplyClick = () => {
    if (!discountCodeText.trim()) {
      toast.error('Masukkan kode diskon terlebih dahulu!');
      return;
    }
    onApplyDiscount(discountCodeText.trim());
  };

  const handleCancelClick = () => {
    onRemoveDiscount();
    setDiscountCodeText('');
  };

  return (
    <Card className="border-zinc-800 bg-zinc-900/30 p-6 space-y-6 sticky top-24">
      <h3 className="text-base font-bold text-white border-b border-zinc-800/60 pb-3">Ringkasan Pembayaran</h3>

      {/* Input Kode Diskon */}
      <div className="space-y-2">
        <Label htmlFor="discountCode" className="text-xs font-semibold text-zinc-300 uppercase">
          Kode Voucher / Promo
        </Label>
        <div className="flex gap-2">
          <Input
            id="discountCode"
            placeholder="Contoh: DISKON20"
            value={discountCodeText}
            onChange={(e) => setDiscountCodeText(e.target.value)}
            disabled={!!appliedDiscount || isApplyingDiscount}
            className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700 text-xs focus-visible:ring-indigo-500"
          />
          {appliedDiscount ? (
            <Button
              type="button"
              onClick={handleCancelClick}
              variant="destructive"
              className="px-4 text-xs font-bold shrink-0 cursor-pointer h-9"
            >
              Lepas
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleApplyClick}
              disabled={isApplyingDiscount}
              className="bg-indigo-600 hover:bg-indigo-755 text-white px-4 text-xs font-bold shrink-0 cursor-pointer h-9"
            >
              {isApplyingDiscount ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Gunakan'}
            </Button>
          )}
        </div>
        {appliedDiscount && (
          <p className="text-[10px] text-emerald-400 font-medium">
            Terpasang: {appliedDiscount.type} - {appliedDiscount.code} ({appliedDiscount.isPercent ? `${appliedDiscount.discountValue}%` : formatRupiah(appliedDiscount.discountValue)})
          </p>
        )}
      </div>

      <div className="space-y-3.5 text-xs">
        <div className="flex justify-between text-zinc-400">
          <span>Subtotal Barang</span>
          <span className="font-semibold text-white">{formatRupiah(subTotal)}</span>
        </div>
        {appliedDiscount && (
          <div className="flex justify-between text-emerald-400 font-semibold animate-fadeIn">
            <span>Potongan Diskon ({appliedDiscount.code})</span>
            <span>-{formatRupiah(discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between text-zinc-400">
          <span>Ongkos Kirim</span>
          <span className="font-semibold text-white">{formatRupiah(shippingFee)}</span>
        </div>
        <div className="flex justify-between text-zinc-400">
          <span>PPN (12%)</span>
          <span className="font-semibold text-white">{formatRupiah(taxAmount)}</span>
        </div>

        <div className="border-t border-zinc-800/60 pt-3.5 flex justify-between items-baseline">
          <span className="text-sm font-bold text-white">Total Tagihan</span>
          <span className="text-xl font-black text-white">{formatRupiah(totalAmount)}</span>
        </div>
      </div>

      {/* Wallet Info Display */}
      <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-850 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-zinc-400 text-xs">
            <Wallet className="h-4 w-4 text-indigo-400" />
            <span>Saldo Dompet</span>
          </div>
          <span className={`text-sm font-black ${isBalanceSufficient ? 'text-white' : 'text-rose-400'}`}>
            {formatRupiah(buyerBalance)}
          </span>
        </div>

        {!isBalanceSufficient && (
          <div className="space-y-2">
            <div className="flex gap-2 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-[10px] leading-normal font-medium">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Saldo Anda tidak mencukupi untuk checkout ini.</span>
            </div>
            <Button
              onClick={() => {
                resetTopUp({ amount: Math.max(50000, totalAmount - buyerBalance) });
                setIsTopUpOpen(true);
              }}
              className="w-full h-8 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
            >
              Top Up Langsung
            </Button>
          </div>
        )}
      </div>

      {/* Checkout Trigger */}
      <Button
        onClick={onCheckout}
        disabled={isCheckoutPending || !selectedAddressId || !isBalanceSufficient}
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-650 hover:from-blue-600 hover:to-indigo-750 text-white font-bold h-12 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/10 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        {isCheckoutPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Memproses Pembayaran...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" /> Bayar Sekarang
          </>
        )}
      </Button>

      {/* DIALOG TOP UP INLINE */}
      <Dialog open={isTopUpOpen} onOpenChange={setIsTopUpOpen}>
        <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-400" /> Top Up Saldo Dompet
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-xs">
              Isi saldo dummy secara langsung untuk menyelesaikan checkout ini.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitTopUp(onSubmitTopUp)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="topUpAmount" className="text-zinc-300 text-xs font-semibold uppercase">
                Nominal Saldo (Rp)
              </Label>
              <Input
                id="topUpAmount"
                type="number"
                placeholder="50000"
                className="border-zinc-800 bg-zinc-950 text-white placeholder-zinc-700 focus-visible:ring-indigo-500"
                {...registerTopUp('amount', { valueAsNumber: true })}
              />
              {topUpErrors.amount && (
                <p className="text-xs text-rose-500 font-medium">{topUpErrors.amount.message}</p>
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
                {topUpMutation.isPending ? 'Mengisi...' : 'Isi Saldo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
