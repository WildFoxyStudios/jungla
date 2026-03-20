'use client';

import { useState } from 'react';
import { ordersApi, type CreateOrderRequest } from '@/lib/api-orders';
import { useRouter } from 'next/navigation';
import { CreditCard, MapPin, Phone, Mail } from 'lucide-react';

export default function Checkout() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateOrderRequest>({
    shipping_address: '',
    shipping_city: '',
    shipping_state: '',
    shipping_postal_code: '',
    contact_phone: '',
    contact_email: '',
    payment_method: 'stripe',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const order = await ordersApi.createOrder(formData);
      
      // Si el método de pago es Stripe, redirigir a Stripe Checkout
      if (formData.payment_method === 'stripe') {
        // Integración con Stripe Checkout
        try {
          const { createCheckoutSession, redirectToCheckout } = await import('@/lib/stripe');
          const session = await createCheckoutSession({
            orderId: order.id,
            amount: order.total,
            currency: 'mxn',
          });
          
          if (session.url) {
            window.location.href = session.url;
          } else if (session.id) {
            await redirectToCheckout(session.id);
          }
        } catch (stripeError) {
          console.error('Stripe error:', stripeError);
          alert('Error al procesar pago con Stripe. Redirigiendo a confirmación...');
          router.push(`/orders/${order.id}`);
        }
      } else {
        // Para otros métodos, ir directo a confirmación
        router.push(`/orders/${order.id}`);
      }
    } catch (error) {
      console.error('Error creating order:', error);
      alert('Error al crear la orden. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Finalizar Compra</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Información de envío */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Dirección de Envío
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección completa *
              </label>
              <input
                type="text"
                required
                value={formData.shipping_address}
                onChange={(e) => setFormData({ ...formData, shipping_address: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Calle, número, colonia"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.shipping_city || ''}
                  onChange={(e) => setFormData({ ...formData, shipping_city: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <input
                  type="text"
                  value={formData.shipping_state || ''}
                  onChange={(e) => setFormData({ ...formData, shipping_state: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código Postal
              </label>
              <input
                type="text"
                value={formData.shipping_postal_code || ''}
                onChange={(e) => setFormData({ ...formData, shipping_postal_code: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                maxLength={5}
              />
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5" />
            Información de Contacto
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <input
                type="tel"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="5512345678"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="tu@email.com"
              />
            </div>
          </div>
        </div>

        {/* Método de pago */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Método de Pago
          </h2>

          <div className="space-y-3">
            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="stripe"
                checked={formData.payment_method === 'stripe'}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="font-semibold">Tarjeta de Crédito/Débito</div>
                <div className="text-sm text-gray-600">Pago seguro con Stripe</div>
              </div>
              <img src="/stripe-logo.png" alt="Stripe" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="paypal"
                checked={formData.payment_method === 'paypal'}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="font-semibold">PayPal</div>
                <div className="text-sm text-gray-600">Paga con tu cuenta PayPal</div>
              </div>
              <img src="/paypal-logo.png" alt="PayPal" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
            </label>

            <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="payment"
                value="cash"
                checked={formData.payment_method === 'cash'}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <div className="font-semibold">Pago en Efectivo</div>
                <div className="text-sm text-gray-600">Paga al recibir tu pedido</div>
              </div>
            </label>
          </div>
        </div>

        {/* Botones */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 border border-gray-300 py-3 rounded-lg hover:bg-gray-50"
            disabled={loading}
          >
            Volver al Carrito
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Procesando...' : 'Confirmar Pedido'}
          </button>
        </div>
      </form>
    </div>
  );
}
