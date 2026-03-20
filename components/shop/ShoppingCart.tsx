'use client';

import { useState, useEffect } from 'react';
import { cartApi, type Cart, type CartItem } from '@/lib/api-cart';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ShoppingCartComponent() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const data = await cartApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const updatedCart = await cartApi.updateCartItem(itemId, { quantity: newQuantity });
      setCart(updatedCart);
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      const updatedCart = await cartApi.removeFromCart(itemId);
      setCart(updatedCart);
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const clearCart = async () => {
    if (!confirm('¿Vaciar todo el carrito?')) return;
    try {
      await cartApi.clearCart();
      await loadCart();
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCart className="w-24 h-24 mx-auto text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Tu carrito está vacío</h2>
        <p className="text-gray-600 mb-6">Explora el Marketplace y agrega productos</p>
        <button
          onClick={() => router.push('/marketplace')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Ir al Marketplace
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Carrito de Compras</h1>
        <button
          onClick={clearCart}
          className="text-red-600 hover:text-red-700 flex items-center gap-2"
        >
          <Trash2 className="w-5 h-5" />
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items del carrito */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <CartItemCard
              key={item.id}
              item={item}
              onUpdateQuantity={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-lg shadow p-6 h-fit sticky top-4">
          <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>
          
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Subtotal ({cart.total_items} items)</span>
              <span className="font-semibold">${cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Envío</span>
              <span className="font-semibold">$5.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">IVA (16%)</span>
              <span className="font-semibold">${(cart.subtotal * 0.16).toFixed(2)}</span>
            </div>
            <div className="border-t pt-3 flex justify-between text-lg">
              <span className="font-bold">Total</span>
              <span className="font-bold text-blue-600">
                ${(cart.subtotal + 5 + cart.subtotal * 0.16).toFixed(2)}
              </span>
            </div>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            Proceder al pago
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={() => router.push('/marketplace')}
            className="w-full mt-3 border border-gray-300 py-3 rounded-lg hover:bg-gray-50"
          >
            Continuar comprando
          </button>
        </div>
      </div>
    </div>
  );
}

interface CartItemCardProps {
  item: CartItem;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
}

function CartItemCard({ item, onUpdateQuantity, onRemove }: CartItemCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-4 flex gap-4">
      <img
        src={item.product_image_url || '/placeholder-product.png'}
        alt={item.product_name}
        className="w-24 h-24 object-cover rounded"
      />
      
      <div className="flex-1">
        <h3 className="font-semibold text-lg mb-1">{item.product_name}</h3>
        <p className="text-blue-600 font-bold mb-3">${item.price.toFixed(2)}</p>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 border rounded-lg">
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
              className="p-2 hover:bg-gray-100 rounded-l-lg"
              disabled={item.quantity <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-4 font-semibold">{item.quantity}</span>
            <button
              onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
              className="p-2 hover:bg-gray-100 rounded-r-lg"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.id)}
            className="text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>

      <div className="text-right">
        <p className="text-lg font-bold">${item.total.toFixed(2)}</p>
      </div>
    </div>
  );
}
