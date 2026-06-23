'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, ShieldCheck, User as UserIcon, MapPin } from 'lucide-react';
import { toast } from 'sonner';

interface DriverDashboardProps {
  formatRupiah: (amount: number) => string;
}

export function DriverDashboard({ formatRupiah }: DriverDashboardProps) {
  return (
    <div className="space-y-6">
      {/* Driver Earnings & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-semibold uppercase">Pendapatan Driver</span>
            <h3 className="text-3xl font-black text-white">{formatRupiah(1200000)}</h3>
          </div>
          <div className="h-12 w-12 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
            <Truck className="h-6 w-6" />
          </div>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-semibold uppercase">Pengiriman Selesai</span>
            <h3 className="text-3xl font-black text-white">45 Job</h3>
          </div>
          <div className="h-12 w-12 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/30 p-6 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 font-semibold uppercase">Rating Driver</span>
            <h3 className="text-3xl font-black text-white">4.9 / 5.0</h3>
          </div>
          <div className="h-12 w-12 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <UserIcon className="h-6 w-6" />
          </div>
        </Card>
      </div>

      {/* Active Delivery Job */}
      <Card className="border-zinc-800 bg-zinc-900/30">
        <CardHeader className="p-5 border-b border-zinc-800/40">
          <CardTitle className="text-base font-bold text-white flex items-center gap-2">
            <MapPin className="h-5 w-5 text-amber-400 animate-bounce" /> Pekerjaan Aktif Saat Ini (Simulasi)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="p-4 bg-amber-500/5 rounded-lg border border-amber-500/15 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                  JOB #98231
                </span>
                <h4 className="text-base font-bold text-white mt-1.5">Mechanical Keyboard RGB</h4>
                <p className="text-xs text-zinc-400">Dari: Tech Gadget Store (Tangerang)</p>
                <p className="text-xs text-zinc-400">Ke: Jln. Sudirman No. 12 (Jakarta Pusat)</p>
              </div>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-550/20">
                Menuju Lokasi Tujuan
              </span>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button size="sm" variant="outline" className="border-zinc-800 text-zinc-400 hover:text-white" onClick={() => toast.info('Navigasi peta dimulai')}>
                Lihat Rute
              </Button>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold" onClick={() => toast.success('Pekerjaan ditandai selesai!')}>
                Selesaikan Pengiriman
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
