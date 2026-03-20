import { API_URL } from './api';

export interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  created_at: string;
}

export interface OrderDetail extends Order {
  payment_method?: string;
  shipping_address: string;
  tracking_number?: string;
  items: OrderItem[];
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_image_url?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CreateOrderRequest {
  shipping_address: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_postal_code?: string;
  contact_phone?: string;
  contact_email?: string;
  payment_method: string;
}

export const ordersApi = {
  // Crear orden
  createOrder: async (data: CreateOrderRequest): Promise<Order> => {
    const res = await fetch(`${API_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create order');
    return res.json();
  },

  // Obtener órdenes del usuario
  getUserOrders: async (filters?: { status?: string; limit?: number; offset?: number }): Promise<Order[]> => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const res = await fetch(`${API_URL}/orders?${params.toString()}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return res.json();
  },

  // Obtener detalle de orden
  getOrder: async (orderId: string): Promise<OrderDetail> => {
    const res = await fetch(`${API_URL}/orders/${orderId}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch order');
    return res.json();
  },
};
