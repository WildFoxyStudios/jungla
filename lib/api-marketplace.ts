import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface MarketplaceProduct {
  id: string;
  seller_id: string;
  seller_name?: string;
  seller_picture?: string;
  category_id: string;
  category_name?: string;
  title: string;
  description?: string;
  price: number;
  currency: string;
  condition: 'new' | 'used_like_new' | 'used_good' | 'used_fair';
  location?: string;
  status: 'available' | 'pending' | 'sold';
  images?: string[];
  created_at: string;
}

export interface CreateProductRequest {
  category_id: string;
  title: string;
  description?: string;
  price: number;
  currency?: string;
  condition: 'new' | 'used_like_new' | 'used_good' | 'used_fair';
  location?: string;
  images?: string[];
}

export const marketplaceApi = {
  createProduct: async (data: CreateProductRequest, token: string) => {
    const response = await axios.post<MarketplaceProduct>(
      `${API_URL}/marketplace/products`,
      data,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  searchProducts: async (query?: string, category?: string, token?: string) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (category) params.append('category', category);
    
    const response = await axios.get<MarketplaceProduct[]>(
      `${API_URL}/marketplace/products?${params}`,
      token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
    );
    return response.data;
  },

  markAsSold: async (productId: string, token: string) => {
    await axios.post(
      `${API_URL}/marketplace/products/${productId}/sold`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },

  saveProduct: async (productId: string, token: string) => {
    await axios.post(
      `${API_URL}/marketplace/products/${productId}/save`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
  },
};
