'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ClipboardList, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';

// Subcomponents
import { OrderCard } from './_components/order-card';
import { OrderPagination } from './_components/order-pagination';

import { Order } from '@/types';

export default function OrdersPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const isBuyer = user?.activeRole === 'BUYER';

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(5);

  // 1. Fetch Orders for Buyer
  const { data: orders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['orders-buyer'],
    queryFn: async () => {
      const response = await api.get('/orders/buyer');
      return response.data;
    },
    enabled: isBuyer,
  });

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const totalItems = orders.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedOrders = orders.slice(startIndex, startIndex + pageSize);

  if (isLoadingAuth || isLoadingOrders) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-950 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-zinc-550">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Memuat riwayat transaksi pesanan...</p>
        </div>
      </div>
    );
  }

  if (!user || !isBuyer) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 bg-zinc-950 min-h-[60vh]">
        <Card className="max-w-md border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <ClipboardList className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Akses Ditolak</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Anda harus masuk sebagai Pembeli (Buyer) untuk mengakses halaman riwayat pesanan.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-zinc-800 pb-4 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <ClipboardList className="h-7 w-7 text-indigo-400" /> Transaksi Belanja
          </h1>
          <p className="text-zinc-400 text-sm mt-1">Daftar riwayat pesanan barang yang telah Anda lakukan di SEAPEDIA.</p>
        </div>
        <Link
          href="/products"
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            "border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 h-9 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          )}
        >
          <ShoppingBag className="h-4 w-4 text-indigo-400" /> Belanja Lagi
        </Link>
      </div>

      {totalItems === 0 ? (
        <div className="text-center py-20 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/10 text-zinc-550 max-w-2xl mx-auto">
          <ClipboardList className="h-14 w-14 mx-auto mb-3 opacity-30" />
          <h3 className="text-lg font-bold text-white">Belum Ada Transaksi Pemesanan</h3>
          <p className="text-xs text-zinc-500 mt-1.5 max-w-sm mx-auto leading-relaxed">
            Anda belum pernah memesan barang apa pun. Silakan berbelanja terlebih dahulu.
          </p>
          <Link
            href="/products"
            className={cn(
              buttonVariants({ variant: 'default' }),
              "mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
            )}
          >
            Mulai Belanja
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="space-y-4">
            {paginatedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                formatRupiah={formatRupiah}
              />
            ))}
          </div>

          {/* Pagination Component */}
          <OrderPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
    </div>
  );
}
