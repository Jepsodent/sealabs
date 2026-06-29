'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ClipboardList, Loader2 } from 'lucide-react';
import { DeliveryJob } from '@/types';

interface ActiveJobsProps {
  jobs: DeliveryJob[];
  formatRupiah: (amount: number) => string;
  isLoading: boolean;
}

export function ActiveJobs({ jobs, formatRupiah, isLoading }: ActiveJobsProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/30">
      <CardHeader className="p-5 border-b border-zinc-800/40">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-amber-450" /> Pekerjaan Kurir Aktif (Sedang Diantar)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
          </div>
        ) : !jobs || jobs.length === 0 ? (
          <p className="text-zinc-550 text-center py-8 text-xs">Tidak ada pekerjaan kurir aktif saat ini.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-500 bg-zinc-950/20 font-bold">
                  <th className="p-4">ID Job</th>
                  <th className="p-4">Nama Driver</th>
                  <th className="p-4">Alamat Tujuan</th>
                  <th className="p-4">Nilai Paket</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850/50">
                {jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-zinc-850/20 transition-all">
                    <td className="p-4 font-mono font-bold text-amber-500">{job.id.slice(0, 8)}...</td>
                    <td className="p-4 font-bold text-white capitalize">{job.driver?.username}</td>
                    <td className="p-4 text-zinc-300 capitalize">{job.order?.deliveryAddress}</td>
                    <td className="p-4 font-semibold text-emerald-400">{formatRupiah(job.order?.total ?? 0)}</td>
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wide border bg-amber-500/10 text-amber-400 border-amber-500/20">
                        SEDANG DIANTAR
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
