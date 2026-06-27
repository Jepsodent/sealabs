'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Loader2 } from 'lucide-react';

// Sub-components
import { StoreSetup } from './seller/store-setup';
import { ProductModal } from './seller/product-modal';
import { DeleteProductDialog } from './seller/delete-dialog';
import { SellerStoreCard } from './seller/seller-store-card';
import { SellerOrdersList } from './seller/seller-orders-list';
import { SellerProductGrid } from './seller/seller-product-grid';

// Types
import { StoreType, Product, Order } from '@/types';

interface SellerDashboardProps {
  formatRupiah: (amount: number) => string;
}

export function SellerDashboard({ formatRupiah }: SellerDashboardProps) {
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  // Modal control states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // 1. Fetch Store Profile
  const { data: myStore, isLoading: isLoadingStore, refetch: refetchStore } = useQuery<StoreType | null>({
    queryKey: ['my-store'],
    queryFn: async () => {
      try {
        const response = await api.get('/stores/my-store');
        return response.data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null; // Indicates no store yet
        }
        throw err;
      }
    },
    retry: false,
  });

  // 2. Fetch Products belonging to the store
  const { data: products = [], isLoading: isLoadingProducts, refetch: refetchProducts } = useQuery<Product[]>({
    queryKey: ['my-products'],
    queryFn: async () => {
      const response = await api.get('/products/my-products');
      return response.data;
    },
    enabled: !!myStore, // Only run if store exists
  });

  // 3. Fetch Incoming Orders for Seller
  const { data: incomingOrders = [], isLoading: isLoadingOrders } = useQuery<Order[]>({
    queryKey: ['orders-seller'],
    queryFn: async () => {
      const response = await api.get('/orders/seller');
      return response.data;
    },
    enabled: !!myStore,
  });

  const openAddProduct = () => {
    setSelectedProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
  };

  const openDeleteConfirm = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteConfirmOpen(true);
  };

  // Loading indicator for Store query
  if (isLoadingStore) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500 gap-2">
        <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
        <span className="text-sm">Mengecek data toko Anda...</span>
      </div>
    );
  }

  // CASE 1: No Store Created Yet -> Show Setup Store Screen
  if (!myStore) {
    return <StoreSetup onStoreCreated={refetchStore} />;
  }

  // CASE 2: Store Exists -> Render Store Profile & Product CRUD
  return (
    <div className="space-y-8">
      {/* Seller Store Stats & Details */}
      <SellerStoreCard
        myStore={myStore}
        products={products}
        formatRupiah={formatRupiah}
        refetchStore={refetchStore}
      />

      {/* Tabs Navigation */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Kelola Produk Toko
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'orders'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-zinc-400 hover:text-white'
          }`}
        >
          Pesanan Masuk ({incomingOrders.length})
        </button>
      </div>

      {/* TAB CONTENT: PRODUCT MANAGEMENT */}
      {activeTab === 'products' && (
        <SellerProductGrid
          products={products}
          isLoadingProducts={isLoadingProducts}
          openEditProduct={openEditProduct}
          openDeleteConfirm={openDeleteConfirm}
          openAddProduct={openAddProduct}
          formatRupiah={formatRupiah}
        />
      )}

      {/* TAB CONTENT: INCOMING ORDERS */}
      {activeTab === 'orders' && (
        <SellerOrdersList
          incomingOrders={incomingOrders}
          isLoadingOrders={isLoadingOrders}
          formatRupiah={formatRupiah}
        />
      )}

      {/* Shared Modals */}
      <ProductModal
        isOpen={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        selectedProduct={selectedProduct}
        onSuccess={refetchProducts}
      />

      <DeleteProductDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        selectedProduct={selectedProduct}
        onSuccess={refetchProducts}
      />
    </div>
  );
}
