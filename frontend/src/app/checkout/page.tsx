'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useAuth } from '@/context/auth-context';
import { Card } from '@/components/ui/card';
import { Loader2, ShieldAlert, CreditCard, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// Types
import { CartResponse, Address, WalletType } from '@/types';

// Subcomponents
import { CheckoutAddress } from './_components/checkout-address';
import { CheckoutDelivery, DeliveryMethod } from './_components/checkout-delivery';
import { CheckoutItems } from './_components/checkout-items';
import { CheckoutSummary } from './_components/checkout-summary';

const DeliveryPrice: Record<DeliveryMethod, number> = {
  INSTANT: 20000,
  NEXT_DAY: 12000,
  REGULAR: 7000,
};

const ppnTax = 0.12;

export default function CheckoutPage() {
  const { user, isLoading: isLoadingAuth } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const isBuyer = user?.activeRole === 'BUYER';

  // Selection states
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('REGULAR');

  // Discount states
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountValue: number;
    isPercent: boolean;
    type: 'VOUCHER' | 'PROMO';
  } | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  // --- QUERY FETCHERS ---
  const { data: cart, isLoading: isLoadingCart } = useQuery<CartResponse>({
    queryKey: ['cart'],
    queryFn: async () => {
      const response = await api.get('/cart');
      return response.data;
    },
    enabled: isBuyer,
  });

  const { data: addresses = [], isLoading: isLoadingAddresses, refetch: refetchAddresses } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await api.get('/addresses');
      return response.data;
    },
    enabled: isBuyer,
  });

  const { data: wallet, isLoading: isLoadingWallet, refetch: refetchWallet } = useQuery<WalletType>({
    queryKey: ['wallet'],
    queryFn: async () => {
      const response = await api.get('/wallet');
      return response.data;
    },
    enabled: isBuyer,
  });

  // Automatically select default address (derived during render)
  const activeAddressId = React.useMemo(() => {
    if (addresses.length === 0) return '';
    const currentExists = addresses.some((addr) => addr.id === selectedAddressId);
    if (selectedAddressId && currentExists) {
      return selectedAddressId;
    }
    const defaultAddr = addresses.find((addr) => addr.isDefault);
    return defaultAddr ? defaultAddr.id : addresses[0].id;
  }, [addresses, selectedAddressId]);


  // Redirect to cart if empty
  useEffect(() => {
    if (cart && cart.items.length === 0) {
      router.replace('/cart');
    }
  }, [cart, router]);

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post('/orders/checkout', {
        addressId: activeAddressId,
        deliveryMethod: deliveryMethod,
        discountCode: appliedDiscount?.code || undefined,
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Pembayaran & Checkout Berhasil!');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['wallet'] });
      queryClient.invalidateQueries({ queryKey: ['wallet-transactions'] });
      router.push('/orders');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.message || 'Gagal melakukan checkout.';
      toast.error(typeof msg === 'string' ? msg : 'Gagal melakukan checkout.');
    },
  });

  const handleApplyDiscount = async (code: string) => {
    setIsApplyingDiscount(true);
    try {
      const response = await api.get(`/discounts/validate/${code}`);
      setAppliedDiscount(response.data);
      toast.success(`Diskon ${code} berhasil dipasang!`);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Kode diskon tidak valid atau telah kadaluwarsa.';
      toast.error(typeof msg === 'string' ? msg : 'Kode diskon tidak valid.');
      setAppliedDiscount(null);
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const handleRemoveDiscount = () => {
    setAppliedDiscount(null);
    toast.info('Diskon dilepas.');
  };

  const formatRupiah = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoadingAuth || isLoadingCart || isLoadingAddresses || isLoadingWallet) {
    return (
      <div className="flex flex-1 items-center justify-center bg-zinc-950 min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-zinc-550">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
          <p className="text-sm font-medium">Menyiapkan halaman checkout...</p>
        </div>
      </div>
    );
  }

  if (!user || !isBuyer) {
    return (
      <div className="flex flex-1 items-center justify-center p-4 bg-zinc-950 min-h-[60vh]">
        <Card className="max-w-md border-zinc-800 bg-zinc-900/50 p-6 text-center">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-white">Akses Ditolak</h2>
          <p className="text-sm text-zinc-400 mt-1">
            Anda harus masuk sebagai Pembeli (Buyer) untuk mengakses halaman checkout.
          </p>
        </Card>
      </div>
    );
  }

  // Calculations
  const subTotal = cart?.subTotal ?? 0;
  const shippingFee = DeliveryPrice[deliveryMethod];

  // Calculate discount amount
  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.isPercent) {
      discountAmount = Math.floor((subTotal * appliedDiscount.discountValue) / 100);
    } else {
      discountAmount = appliedDiscount.discountValue;
    }
    // Limit to subtotal
    discountAmount = Math.min(discountAmount, subTotal);
  }

  const taxAmount = Math.floor((subTotal - discountAmount) * ppnTax);
  const totalAmount = (subTotal - discountAmount) + shippingFee + taxAmount;

  return (
    <div className="flex-1 w-full bg-zinc-950 px-4 py-12 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6">
      {/* Back Link */}
      <Link href="/cart" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white text-sm font-medium transition-colors">
        <ArrowLeft className="h-4 w-4" /> Kembali ke Keranjang
      </Link>

      {/* Header */}
      <div className="border-b border-zinc-800 pb-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
          <CreditCard className="h-7 w-7 text-indigo-400" /> Form Checkout Pesanan
        </h1>
        <p className="text-zinc-400 text-sm mt-1">Konfirmasi rincian alamat, kurir, dan pembayaran pesanan Anda.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Setup Details */}
        <div className="lg:col-span-8 space-y-6">
          <CheckoutAddress
            addresses={addresses}
            selectedAddressId={activeAddressId}
            setSelectedAddressId={setSelectedAddressId}
            refetchAddresses={refetchAddresses}
          />

          <CheckoutDelivery
            deliveryMethod={deliveryMethod}
            setDeliveryMethod={setDeliveryMethod}
            deliveryPrice={DeliveryPrice}
            formatRupiah={formatRupiah}
          />

          <CheckoutItems
            cart={cart}
            formatRupiah={formatRupiah}
          />
        </div>

        {/* Right Side: Financial Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          <CheckoutSummary
            subTotal={subTotal}
            shippingFee={shippingFee}
            taxAmount={taxAmount}
            totalAmount={totalAmount}
            wallet={wallet}
            formatRupiah={formatRupiah}
            onCheckout={() => checkoutMutation.mutate()}
            isCheckoutPending={checkoutMutation.isPending}
            selectedAddressId={activeAddressId}
            refetchWallet={refetchWallet}
            appliedDiscount={appliedDiscount}
            discountAmount={discountAmount}
            onApplyDiscount={handleApplyDiscount}
            onRemoveDiscount={handleRemoveDiscount}
            isApplyingDiscount={isApplyingDiscount}
          />
        </div>
      </div>
    </div>
  );
}
