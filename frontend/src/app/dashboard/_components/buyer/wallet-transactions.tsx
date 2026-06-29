'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Clock,
  Loader2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletTransaction {
  id: string;
  amount: number;
  type: 'TOP_UP' | 'PAYMENT' | 'REFUND';
  userId: string;
  createdAt: string;
}

interface WalletTransactionsProps {
  transactions: WalletTransaction[];
  isLoadingTransactions: boolean;
  formatRupiah: (amount: number) => string;
}

export function WalletTransactions({
  transactions,
  isLoadingTransactions,
  formatRupiah,
}: WalletTransactionsProps) {
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const totalItems = transactions.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Reset page to 1 if page size changes
  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // Slice transactions
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedTransactions = transactions.slice(startIndex, startIndex + pageSize);

  const isPlusType = (type: string) => type === 'TOP_UP' || type === 'REFUND' || type ==='DRIVER_EARNING';

  return (
    <Card className="border-zinc-800 bg-zinc-900/30">
      <CardHeader className="border-b border-zinc-800/40 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-indigo-400" /> Riwayat Transaksi Dompet
          </CardTitle>
          <CardDescription className="text-zinc-500 text-xs">Daftar keluar masuknya saldo akun Buyer Anda.</CardDescription>
        </div>

        {/* Page Size Selector */}
        {totalItems > 0 && (
          <div className="flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Tampilkan:</span>
            <div className="flex border border-zinc-850 rounded bg-zinc-950 overflow-hidden">
              {[1, 5, 25].map((size) => (
                <button
                  key={size}
                  onClick={() => handlePageSizeChange(size)}
                  className={cn(
                    "px-2.5 py-1 font-bold text-[10px] border-r border-zinc-850 last:border-0 cursor-pointer transition-all",
                    pageSize === size
                      ? "bg-indigo-650 text-white"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-5">
        {isLoadingTransactions ? (
          <div className="flex justify-center py-10 text-zinc-500 gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            <span className="text-xs">Memuat riwayat transaksi...</span>
          </div>
        ) : totalItems === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <Wallet className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold">Belum ada transaksi</p>
            <p className="text-xs text-zinc-600 mt-1">Saldo Anda masih kosong atau belum pernah ditransaksikan.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedTransactions.map((tx) => {
              const isPlus = isPlusType(tx.type);
              return (
                <div key={tx.id} className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-850">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                      isPlus
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {isPlus ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    </div>
                    <div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase text-[9px] ${
                        tx.type === 'TOP_UP'
                          ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                          : tx.type === 'PAYMENT'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {tx.type}
                      </span>
                      <p className="text-zinc-500 text-[10px] mt-1">
                        {new Date(tx.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-black ${isPlus ? 'text-emerald-400' : 'text-rose-405'}`}>
                    {isPlus ? '+' : '-'} {formatRupiah(tx.amount)}
                  </span>
                </div>
              );
            })}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-850 pt-4 mt-2">
                <span className="text-[10px] text-zinc-500 font-semibold">
                  Menampilkan {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} dari {totalItems} Mutasi
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 border-zinc-850 bg-zinc-950 text-white"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs text-zinc-300 font-bold px-2">
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-7 w-7 border-zinc-850 bg-zinc-950 text-white"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
