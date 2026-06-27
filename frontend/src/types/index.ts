export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string;
  storeId: string;
  store?: {
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface StoreType {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
}

export interface StoreInfo {
  id: string;
  name: string;
  description: string | null;
  owner?: {
    username: string;
  };
}

export interface Address {
  id: string;
  label: string;
  fullAddress: string;
  isDefault: boolean;
  userId: string;
  createdAt: string;
}

export interface WalletType {
  id: string;
  balance: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export type WalletTransactionType = 'TOP_UP' | 'PAYMENT' | 'REFUND';

export interface WalletTransaction {
  id: string;
  amount: number;
  type: WalletTransactionType;
  userId: string;
  createdAt: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  quantity: number;
  productId: string;
}

export interface CartResponse {
  items: CartItem[];
  store: { name: string; storeId: string } | null;
  totalQuantity: number;
  subTotal: number;
}

export interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  product: {
    name: string;
    imageUrl: string;
  };
}

export interface OrderStatusHistory {
  id: string;
  status: string;
  timestamp: string;
}

export interface Order {
  id: string;
  deliveryAddress: string;
  deliveryMethod: string;
  deliveryFee: number;
  subTotal: number;
  tax: number;
  total: number;
  status: string;
  createdAt: string;
  buyer?: {
    username: string;
  };
  orderItem: OrderItem[];
  orderStatusHistory: OrderStatusHistory[];
}
