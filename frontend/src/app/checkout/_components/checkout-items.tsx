'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { CartResponse } from '@/types';

interface CheckoutItemsProps {
  cart: CartResponse | undefined;
  formatRupiah: (amount: number) => string;
}

export function CheckoutItems({ cart, formatRupiah }: CheckoutItemsProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/30">
      <CardHeader className="p-5 border-b border-zinc-800/40">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-indigo-400" /> Rincian Barang Toko ({cart?.store?.name})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5 space-y-3">
        {cart?.items.map((item) => (
          <div key={item.id} className="flex justify-between items-center gap-4 py-2 border-b border-zinc-850/40 last:border-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-zinc-950 rounded border border-zinc-850 overflow-hidden shrink-0">
                <img src={item.imageUrl} alt={item.name} className="object-cover h-full w-full" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white line-clamp-1">{item.name}</h4>
                <p className="text-[10px] text-zinc-500">{item.quantity} x {formatRupiah(item.price)}</p>
              </div>
            </div>
            <span className="text-xs font-black text-white">{formatRupiah(item.price * item.quantity)}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
