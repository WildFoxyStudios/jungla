import { API_URL } from './api';

export interface CartItem {
  id: string;
  product_id: string;
  product_name: string;
  product_image_url?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  total_items: number;
}

export interface AddToCartRequest {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

export const cartApi = {
  // Obtener carrito
  getCart: async (): Promise<Cart> => {
    const res = await fetch(`${API_URL}/cart`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to fetch cart');
    return res.json();
  },

  // Agregar al carrito
  addToCart: async (data: AddToCartRequest): Promise<Cart> => {
    const res = await fetch(`${API_URL}/cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to add to cart');
    return res.json();
  },

  // Actualizar cantidad
  updateCartItem: async (itemId: string, data: UpdateCartItemRequest): Promise<Cart> => {
    const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update cart item');
    return res.json();
  },

  // Eliminar del carrito
  removeFromCart: async (itemId: string): Promise<Cart> => {
    const res = await fetch(`${API_URL}/cart/items/${itemId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to remove from cart');
    return res.json();
  },

  // Vaciar carrito
  clearCart: async (): Promise<void> => {
    const res = await fetch(`${API_URL}/cart`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to clear cart');
  },
};
