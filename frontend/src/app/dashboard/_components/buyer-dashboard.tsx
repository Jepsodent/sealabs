'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';

// Buyer dashboard Sub-components
import { WalletCard } from './buyer/wallet-card';
import { WalletTransactions } from './buyer/wallet-transactions';
import { AddressList } from './buyer/address-list';
import { AddressDialogs } from './buyer/address-dialogs';

interface BuyerDashboardProps {
  formatRupiah: (amount: number) => string;
}

interface WalletType {
  id: string;
  balance: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface WalletTransaction {
  id: string;
  amount: number;
  type: 'TOP_UP' | 'PAYMENT' | 'REFUND';
  userId: string;
  createdAt: string;
}

interface Address {
  id: string;
  label: string;
  fullAddress: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
}

export function BuyerDashboard({ formatRupiah }: BuyerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'wallet' | 'addresses'>('wallet');

  // Modal control states
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  // --- QUERY FETCHERS ---
  // 1. Fetch Wallet Balance
  const { data: wallet, isLoading: isLoadingWallet, refetch: refetchWallet } = useQuery<WalletType>({
    queryKey: ['wallet'],
    queryFn: async () => {
      const response = await api.get('/wallet');
      return response.data;
    },
  });

  // 2. Fetch Wallet Transactions
  const { data: transactions = [], isLoading: isLoadingTransactions, refetch: refetchTransactions } = useQuery<WalletTransaction[]>({
    queryKey: ['wallet-transactions'],
    queryFn: async () => {
      const response = await api.get('/wallet/transactions');
      return response.data;
    },
  });

  // 3. Fetch Addresses
  const { data: addresses = [], isLoading: isLoadingAddresses, refetch: refetchAddresses } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await api.get('/addresses');
      return response.data;
    },
  });

  const openAddAddress = () => {
    setSelectedAddress(null);
    setIsAddressModalOpen(true);
  };

  const openEditAddress = (addr: Address) => {
    setSelectedAddress(addr);
    setIsAddressModalOpen(true);
  };

  const openDeleteConfirm = (addr: Address) => {
    setSelectedAddress(addr);
    setIsDeleteConfirmOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Navigation Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('wallet')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'wallet'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Dompet & Transaksi
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'addresses'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Alamat Pengiriman
        </button>
      </div>

      {/* --- TAB CONTENT: WALLET --- */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          <WalletCard
            wallet={wallet}
            isLoadingWallet={isLoadingWallet}
            formatRupiah={formatRupiah}
            refetchWallet={refetchWallet}
            refetchTransactions={refetchTransactions}
          />

          <WalletTransactions
            transactions={transactions}
            isLoadingTransactions={isLoadingTransactions}
            formatRupiah={formatRupiah}
          />
        </div>
      )}

      {/* --- TAB CONTENT: ADDRESSES --- */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center border-b border-zinc-800/60 pb-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <MapPin className="h-5 w-5 text-indigo-400" /> Manajemen Alamat Pengiriman
              </h3>
              <p className="text-xs text-zinc-500 mt-1">Kelola alamat pengiriman barang untuk proses checkout Anda.</p>
            </div>
            <Button
              onClick={openAddAddress}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" /> Tambah Alamat Baru
            </Button>
          </div>

          <AddressList
            addresses={addresses}
            isLoadingAddresses={isLoadingAddresses}
            openEditAddress={openEditAddress}
            openDeleteConfirm={openDeleteConfirm}
          />
        </div>
      )}

      {/* Shared Address Modals */}
      <AddressDialogs
        isModalOpen={isAddressModalOpen}
        setIsModalOpen={setIsAddressModalOpen}
        selectedAddress={selectedAddress}
        onSuccess={refetchAddresses}
        isDeleteOpen={isDeleteConfirmOpen}
        setIsDeleteOpen={setIsDeleteConfirmOpen}
      />
    </div>
  );
}
