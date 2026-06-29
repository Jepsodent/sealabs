'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Ticket, Loader2 } from 'lucide-react';
import { Voucher } from '@/types';

interface VoucherListProps {
  vouchers: Voucher[];
  formatRupiah: (amount: number) => string;
  formatDate: (date: string | Date) => string;
  isLoading: boolean;
}

export function VoucherList({ vouchers, formatRupiah, formatDate, isLoading }: VoucherListProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/30">
      <CardHeader className="p-5 border-b border-zinc-800/40">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <Ticket className="h-5 w-5 text-indigo-400" /> Daftar Voucher Diskon (Kuota Terbatas)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
          </div>
        ) : !vouchers || vouchers.length === 0 ? (
          <p className="text-zinc-550 text-center py-8 text-xs">Belum ada Voucher yang diterbitkan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 bg-zinc-950/20 font-bold">
                  <th className="p-4">Kode Voucher</th>
                  <th className="p-4">Nilai Potongan</th>
                  <th className="p-4">Sisa Kuota</th>
                  <th className="p-4">Tanggal Kadaluarsa (Virtual)</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {vouchers.map((v) => (
                  <tr key={v.id} className="hover:bg-zinc-850/20 transition-all">
                    <td className="p-4 font-mono font-bold text-indigo-400 tracking-wider">
                      {v.code}
                    </td>
                    <td className="p-4 font-black text-white">
                      {v.isPercent ? `${v.discountValue}%` : formatRupiah(v.discountValue)}
                    </td>
                    <td className="p-4 font-bold text-zinc-300">
                      {v.remainingUsage} Kuota
                    </td>
                    <td className="p-4 text-zinc-500">{formatDate(v.expiryDate)}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                          v.isExpired || v.remainingUsage <= 0
                            ? 'bg-rose-500/10 text-rose-455 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                        }`}
                      >
                        {v.remainingUsage <= 0 ? 'KUOTA HABIS' : v.isExpired ? 'EXPIRED' : 'AKTIF'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
