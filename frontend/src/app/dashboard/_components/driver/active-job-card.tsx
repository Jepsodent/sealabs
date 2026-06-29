'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Truck, Eye, CheckCircle, Loader2 } from 'lucide-react';

interface ActiveJobCardProps {
  activeJob: any;
  formatRupiah: (amount: number) => string;
  onViewDetails: (jobId: string) => void;
  onCompleteJob: (jobId: string) => void;
  isCompleting: boolean;
}

export function ActiveJobCard({
  activeJob,
  formatRupiah,
  onViewDetails,
  onCompleteJob,
  isCompleting,
}: ActiveJobCardProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/30">
      <CardHeader className="p-5 border-b border-zinc-800/40">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <MapPin className="h-5 w-5 text-amber-400 animate-bounce" /> Pekerjaan Aktif Saat Ini
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {activeJob ? (
          <div className="p-5 bg-amber-500/5 rounded-xl border border-amber-500/15 space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                    ID JOB: {activeJob.id.slice(0, 8)}...
                  </span>
                  <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-550/20">
                    Sedang Diantar
                  </span>
                </div>
                <div className="space-y-1 text-xs">
                  <p className="text-zinc-400">
                    Toko Pengirim:{' '}
                    <span className="font-semibold text-white capitalize">
                      {activeJob.order?.store?.name}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-400">
                    Nama Pembeli:{' '}
                    <span className="font-semibold text-white capitalize">
                      {activeJob.order?.buyer?.username}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-400">
                    Alamat Tujuan:{' '}
                    <span className="font-semibold text-white capitalize">
                      {activeJob.order?.deliveryAddress}
                    </span>
                  </p>
                  <p className="text-xs text-zinc-400">
                    Ongkos Kirim:{' '}
                    <span className="font-bold text-emerald-400">
                      {formatRupiah(activeJob.order?.deliveryFee ?? 0)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-zinc-800/40">
              <Button
                size="sm"
                variant="outline"
                className="border-zinc-800 text-zinc-450 hover:text-white cursor-pointer text-xs"
                onClick={() => onViewDetails(activeJob.id)}
              >
                <Eye className="h-4 w-4 mr-1" /> Rincian Barang
              </Button>
              <Button
                size="sm"
                disabled={isCompleting}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black flex items-center gap-1 cursor-pointer text-xs"
                onClick={() => onCompleteJob(activeJob.id)}
              >
                {isCompleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                Selesaikan Pengiriman
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-555 space-y-2">
            <Truck className="h-10 w-10 mx-auto opacity-30 text-zinc-650" />
            <p className="text-sm font-semibold text-white">Tidak ada pekerjaan aktif</p>
            <p className="text-xs text-zinc-600">
              Anda sedang tidak mengantar pesanan. Klik &quot;Cari Pekerjaan Pengiriman Baru&quot; untuk mengambil orderan.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
