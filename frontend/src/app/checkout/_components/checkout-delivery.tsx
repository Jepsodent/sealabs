'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Truck } from 'lucide-react';

export type DeliveryMethod = 'INSTANT' | 'NEXT_DAY' | 'REGULAR';

interface CheckoutDeliveryProps {
  deliveryMethod: DeliveryMethod;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  deliveryPrice: Record<DeliveryMethod, number>;
  formatRupiah: (amount: number) => string;
}

export function CheckoutDelivery({
  deliveryMethod,
  setDeliveryMethod,
  deliveryPrice,
  formatRupiah,
}: CheckoutDeliveryProps) {
  return (
    <Card className="border-zinc-800 bg-zinc-900/30">
      <CardHeader className="p-5 border-b border-zinc-800/40">
        <CardTitle className="text-base font-bold text-white flex items-center gap-2">
          <Truck className="h-5 w-5 text-indigo-400" /> Metode Pengiriman
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(['REGULAR', 'NEXT_DAY', 'INSTANT'] as DeliveryMethod[]).map((method) => {
            const label = method === 'INSTANT' ? 'Instant' : method === 'NEXT_DAY' ? 'Next Day' : 'Regular';
            const est = method === 'INSTANT' ? '1-3 Jam' : method === 'NEXT_DAY' ? '1 Hari' : '2-4 Hari';
            return (
              <label
                key={method}
                className={`flex flex-col p-4 rounded-xl border cursor-pointer transition-all ${
                  deliveryMethod === method
                    ? 'border-indigo-500 bg-indigo-950/5'
                    : 'border-zinc-800 bg-zinc-950/20 hover:border-zinc-700/60'
                }`}
              >
                <div className="flex justify-between items-center w-full mb-1">
                  <span className="font-bold text-white text-sm">{label}</span>
                  <input
                    type="radio"
                    name="deliveryMethod"
                    checked={deliveryMethod === method}
                    onChange={() => setDeliveryMethod(method)}
                    className="accent-indigo-650 cursor-pointer"
                  />
                </div>
                <span className="text-[10px] text-zinc-550 font-semibold uppercase">{est}</span>
                <span className="text-sm font-black text-indigo-400 mt-3">{formatRupiah(deliveryPrice[method])}</span>
              </label>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
