'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Plus, RotateCcw, Loader2 } from 'lucide-react';

interface TimeSimulatorProps {
  systemTimeData: any;
  onAdvanceTime: () => void;
  onResetTime: () => void;
  isAdvancing: boolean;
  isResetting: boolean;
  formatDate: (date: string | Date) => string;
  isLoadingTime: boolean;
}

export function TimeSimulator({
  systemTimeData,
  onAdvanceTime,
  onResetTime,
  isAdvancing,
  isResetting,
  formatDate,
  isLoadingTime,
}: TimeSimulatorProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-950 p-4 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shadow-md">
      <div className="flex items-center gap-2.5">
        <div className="h-9 w-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-450 flex items-center justify-center shrink-0">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <span className="text-[10px] text-zinc-550 font-bold uppercase tracking-wider block">Jam Virtual Sistem</span>
          {isLoadingTime ? (
            <div className="h-4 w-28 bg-zinc-900 rounded animate-pulse mt-1" />
          ) : (
            <span className="text-xs font-mono font-bold text-white block">
              {systemTimeData ? formatDate(systemTimeData) : 'Gagal memuat'}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <Button
          size="sm"
          disabled={isAdvancing}
          onClick={onAdvanceTime}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1 cursor-pointer text-xs flex-1 sm:flex-none"
        >
          {isAdvancing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          +1 Hari
        </Button>
        <Button
          size="sm"
          variant="outline"
          disabled={isResetting}
          onClick={onResetTime}
          className="border-zinc-800 text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer text-xs flex-1 sm:flex-none"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Offset
        </Button>
      </div>
    </Card>
  );
}
