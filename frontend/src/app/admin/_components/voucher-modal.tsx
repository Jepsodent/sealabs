'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Ticket, Calendar, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
  isPending: boolean;
}

export function VoucherModal({ isOpen, onClose, onSubmit, isPending }: VoucherModalProps) {
  const [code, setCode] = useState('');
  const [value, setValue] = useState(0);
  const [isPercent, setIsPercent] = useState(false);
  const [quota, setQuota] = useState(10);
  const [expiry, setExpiry] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || value <= 0 || !expiry) {
      toast.error('Harap isi semua field voucher dengan benar!');
      return;
    }
    onSubmit({
      code: code.toUpperCase().replace(/\s+/g, ''),
      discountValue: Number(value),
      isPercent,
      remainingUsage: Number(quota),
      expiryDate: new Date(expiry).toISOString(),
    });
    // Reset state after submitting
    setCode('');
    setValue(0);
    setIsPercent(false);
    setQuota(10);
    setExpiry('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-white flex items-center gap-1.5">
            <Ticket className="h-5 w-5 text-indigo-400" /> Terbitkan Voucher baru
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="vcode" className="text-zinc-400 text-xs">Kode Voucher</Label>
            <Input
              id="vcode"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="CONTOH: HEMAT20"
              className="bg-zinc-950 border-zinc-800 text-white uppercase text-xs h-9"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="vval" className="text-zinc-400 text-xs">Besar Potongan</Label>
              <Input
                id="vval"
                type="number"
                value={value || ''}
                onChange={(e) => setValue(Number(e.target.value))}
                placeholder="20 atau 15000"
                className="bg-zinc-950 border-zinc-800 text-white text-xs h-9"
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <Checkbox
                id="vispercent"
                checked={isPercent}
                onCheckedChange={(checked) => setIsPercent(!!checked)}
                className="border-zinc-800 bg-zinc-950 data-[state=checked]:bg-indigo-600 data-[state=checked]:text-white cursor-pointer"
              />
              <Label htmlFor="vispercent" className="text-zinc-300 text-xs cursor-pointer select-none">Tipe Persen (%)</Label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vquota" className="text-zinc-400 text-xs">Kuota Penggunaan</Label>
            <Input
              id="vquota"
              type="number"
              value={quota || ''}
              onChange={(e) => setQuota(Number(e.target.value))}
              placeholder="10"
              className="bg-zinc-950 border-zinc-800 text-white text-xs h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vexp" className="text-zinc-400 text-xs flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> Tanggal Expired (Batas Virtual)
            </Label>
            <Input
              id="vexp"
              type="datetime-local"
              value={expiry}
              onChange={(e) => setExpiry(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-white text-xs h-9 cursor-pointer"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Terbitkan Voucher'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
