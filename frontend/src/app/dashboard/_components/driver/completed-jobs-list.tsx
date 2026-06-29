'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';

interface CompletedJobsListProps {
  completedJobs: any[];
  formatRupiah: (amount: number) => string;
  onViewDetails: (jobId: string) => void;
}

export function CompletedJobsList({ completedJobs, formatRupiah, onViewDetails }: CompletedJobsListProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/30">
      <CardHeader className="p-5 border-b border-zinc-800/40">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-indigo-400" /> Riwayat Pekerjaan Selesai
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        {completedJobs.length === 0 ? (
          <div className="text-center py-8 text-zinc-555 space-y-2">
            <ClipboardList className="h-10 w-10 mx-auto opacity-30 text-zinc-650" />
            <p className="text-sm font-semibold text-white">Belum ada riwayat pekerjaan</p>
            <p className="text-xs text-zinc-600">Daftar pekerjaan selesai Anda akan terekam di sini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedJobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-xl border border-zinc-850 bg-zinc-950/20 hover:border-zinc-800 transition-all gap-4 text-xs"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded font-mono">
                      ID: {job.id.slice(0, 8)}...
                    </span>
                    <span className="text-[9px] font-black text-emerald-450 border border-emerald-500/10 bg-emerald-500/5 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      SELESAI
                    </span>
                  </div>
                  <div className="space-y-0.5 text-zinc-400">
                    <p>
                      Dari:{' '}
                      <span className="text-white capitalize">
                        {job.order?.store?.name}
                      </span>
                    </p>
                    <p>
                      Ke:{' '}
                      <span className="text-white capitalize">
                        {job.order?.deliveryAddress}
                      </span>
                    </p>
                    <p className="text-[10px] text-zinc-505">
                      Penerima: <span className="capitalize">{job.order?.buyer?.username}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto shrink-0">
                  <div className="text-right">
                    <span className="text-[9px] text-zinc-550 uppercase font-bold block">
                      Jasa Kirim Cair
                    </span>
                    <span className="text-sm font-black text-emerald-400">
                      +{formatRupiah(job.order?.deliveryFee ?? 0)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-zinc-800 text-zinc-400 hover:text-white h-8 px-2.5 cursor-pointer text-xs"
                    onClick={() => onViewDetails(job.id)}
                  >
                    Detail
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
