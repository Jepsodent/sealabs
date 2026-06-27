'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Loader2, Edit, Trash2 } from 'lucide-react';

interface Address {
  id: string;
  label: string;
  fullAddress: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
}

interface AddressListProps {
  addresses: Address[];
  isLoadingAddresses: boolean;
  openEditAddress: (addr: Address) => void;
  openDeleteConfirm: (addr: Address) => void;
}

export function AddressList({
  addresses,
  isLoadingAddresses,
  openEditAddress,
  openDeleteConfirm,
}: AddressListProps) {
  if (isLoadingAddresses) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500 gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
        <span className="text-xs">Memuat alamat Anda...</span>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center py-16 border border-zinc-800 border-dashed rounded-xl bg-zinc-900/10 text-zinc-500">
        <MapPin className="h-10 w-10 mx-auto mb-2 opacity-40 text-zinc-650" />
        <p className="text-sm font-semibold">Belum ada alamat pengiriman</p>
        <p className="text-xs text-zinc-600 mt-1">Silakan tambahkan alamat utama Anda terlebih dahulu sebelum berbelanja.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {addresses.map((addr) => (
        <Card
          key={addr.id}
          className="border-zinc-800 bg-zinc-900/20 p-5 flex flex-col justify-between hover:border-zinc-750 transition-all gap-4"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-bold text-white text-sm capitalize">{addr.label}</span>
              {addr.isDefault && (
                <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2 py-0.5 rounded">
                  Alamat Utama
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed break-words whitespace-pre-line">
              {addr.fullAddress}
            </p>
          </div>

          <div className="flex gap-2 border-t border-zinc-850/60 pt-3">
            <Button
              size="xs"
              variant="outline"
              onClick={() => openEditAddress(addr)}
              className="flex-1 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-850 h-8 text-xs cursor-pointer"
            >
              <Edit className="h-3.5 w-3.5 mr-1" /> Edit
            </Button>
            <Button
              size="xs"
              variant="destructive"
              onClick={() => openDeleteConfirm(addr)}
              className="flex-1 bg-rose-950/20 hover:bg-rose-950 border border-rose-900/30 hover:border-rose-900/60 text-rose-400 h-8 text-xs font-semibold cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Hapus
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
