'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Truck } from 'lucide-react';

interface JobDetailDialogProps {
  selectedJobId: string | null;
  onClose: () => void;
  formatRupiah: (amount: number) => string;
}

export function JobDetailDialog({ selectedJobId, onClose, formatRupiah }: JobDetailDialogProps) {
  // Fetch Job Detail if modal is open
  const { data: jobDetail, isLoading: isLoadingDetail } = useQuery({
    queryKey: ['delivery-detail', selectedJobId],
    queryFn: async () => {
      if (!selectedJobId) return null;
      const response = await api.get(`/deliveries/${selectedJobId}`);
      return response.data;
    },
    enabled: !!selectedJobId,
    staleTime: 1000 * 60 * 5, // Cache valid for 5 minutes
  });

  return (
    <Dialog open={!!selectedJobId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-zinc-800 bg-zinc-900 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold text-white flex items-center gap-2">
            <Truck className="h-5 w-5 text-indigo-400" /> Rincian Pekerjaan Pengantaran
          </DialogTitle>
          <DialogDescription className="text-zinc-450 text-xs">
            Detail toko, pembeli, dan barang-barang yang ada di dalam paket ini.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-[280px] flex flex-col justify-between">
          {isLoadingDetail ? (
            <div className="flex flex-col items-center justify-center py-20 text-zinc-550 gap-3">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <span className="text-xs font-medium">Memuat rincian paket...</span>
            </div>
          ) : jobDetail ? (
            <div className="space-y-4 py-2 text-xs">
              {/* Addresses Info */}
              <div className="space-y-2 border-b border-zinc-850 pb-3">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Toko Pengirim
                  </span>
                  <span className="text-white font-bold capitalize text-sm">
                    {jobDetail.order?.store?.name}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Nama Penerima (Buyer)
                  </span>
                  <span className="text-white font-semibold capitalize">
                    {jobDetail.order?.buyer?.username}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                    Alamat Pengantaran
                  </span>
                  <span className="text-white capitalize">
                    {jobDetail.order?.deliveryAddress}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                  Daftar Barang Bawaan ({jobDetail.order?.orderItem?.length ?? 0} Item)
                </span>
                <div className="max-h-[160px] overflow-y-auto space-y-3 pr-1">
                  {jobDetail.order?.orderItem?.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center gap-3 p-2 bg-zinc-950/40 rounded border border-zinc-850">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-zinc-950 border border-zinc-800 rounded overflow-hidden shrink-0">
                          <img
                            src={item.product?.imageUrl}
                            alt={item.product?.name}
                            className="object-cover h-full w-full"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-white line-clamp-1">{item.product?.name}</p>
                          <p className="text-[10px] text-zinc-500 mt-0.5">{item.quantity} Unit x {formatRupiah(item.price)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Summary Finance */}
              <div className="border-t border-zinc-850 pt-3 flex justify-between items-baseline">
                <span className="text-zinc-450">Jasa Kurir (Ongkos Kirim):</span>
                <span className="text-base font-black text-emerald-400">
                  {formatRupiah(jobDetail.order?.deliveryFee ?? 0)}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-20 text-zinc-500">
              <p className="text-xs">Gagal memuat detail pekerjaan.</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={onClose}
            className="w-full bg-zinc-800 hover:bg-zinc-750 text-white font-bold text-xs"
          >
            Tutup Rincian
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
