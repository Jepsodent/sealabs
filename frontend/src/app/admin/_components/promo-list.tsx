'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tag, Loader2 } from 'lucide-react';
import { Promo } from '@/types';

interface PromoListProps {
  promos: Promo[];
  formatRupiah: (amount: number) => string;
  formatDate: (date: string | Date) => string;
  isLoading: boolean;
}

export function PromoList({ promos, formatRupiah, formatDate, isLoading }: PromoListProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/30">
      <CardHeader className="p-5 border-b border-zinc-800/40">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <Tag className="h-5 w-5 text-emerald-450" /> Daftar Promo Diskon (Global)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          </div>
        ) : !promos || promos.length === 0 ? (
          <p className="text-zinc-555 text-center py-8 text-xs">Belum ada Promo yang diterbitkan.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 bg-zinc-950/20 font-bold">
                  <th className="p-4">Kode Promo</th>
                  <th className="p-4">Nilai Potongan</th>
                  <th className="p-4">Tanggal Kadaluarsa (Virtual)</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {promos.map((p) => (
                  <tr key={p.id} className="hover:bg-zinc-850/20 transition-all">
                    <td className="p-4 font-mono font-bold text-emerald-400 tracking-wider">
                      {p.code}
                    </td>
                    <td className="p-4 font-black text-white">
                      {p.isPercent ? `${p.discountValue}%` : formatRupiah(p.discountValue)}
                    </td>
                    <td className="p-4 text-zinc-500">{formatDate(p.expiryDate)}</td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border ${
                          p.isExpired
                            ? 'bg-rose-500/10 text-rose-455 border-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-450 border-emerald-500/20'
                        }`}
                      >
                        {p.isExpired ? 'EXPIRED' : 'AKTIF'}
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
