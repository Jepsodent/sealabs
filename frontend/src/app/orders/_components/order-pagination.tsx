'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderPaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function OrderPagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: OrderPaginationProps) {
  const startIndex = (currentPage - 1) * pageSize;

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center border-t border-zinc-800 pt-6 mt-4 gap-4">
      {/* Page Size Selector */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-zinc-500">Tampilkan:</span>
        <div className="flex border border-zinc-850 rounded bg-zinc-950 overflow-hidden">
          {[1, 5, 25].map((size) => (
            <button
              key={size}
              onClick={() => onPageSizeChange(size)}
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
        <span className="text-zinc-500">Pesanan per halaman</span>
      </div>

      {/* Page Navigation Controls */}
      <div className="flex items-center gap-4">
        <span className="text-[10px] text-zinc-550 font-semibold">
          Menampilkan {startIndex + 1}-{Math.min(startIndex + pageSize, totalItems)} dari {totalItems} Pesanan
        </span>
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            variant="outline"
            className="h-7 w-7 border-zinc-850 bg-zinc-950 text-white"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
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
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
