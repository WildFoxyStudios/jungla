'use client';

import { useState, useEffect } from 'react';
import { marketplaceApi, type MarketplaceProduct } from '@/lib/api-marketplace';
import { Search, Plus, MapPin, Tag, Bookmark } from 'lucide-react';

export default function MarketplacePage() {
  const [products, setProducts] = useState<MarketplaceProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await marketplaceApi.searchProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await marketplaceApi.searchProducts(searchQuery);
      setProducts(data);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleSaveProduct = async (productId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await marketplaceApi.saveProduct(productId, token);
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      'new': 'Nuevo',
      'used_like_new': 'Usado - Como nuevo',
      'used_good': 'Usado - Buen estado',
      'used_fair': 'Usado - Estado aceptable',
    };
    return labels[condition] || condition;
  };

  if (loading) {
    return <div className="p-8 text-center">Cargando productos...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Marketplace</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Vender artículo
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en Marketplace..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.length === 0 ? (
          <div className="col-span-full bg-white rounded-lg shadow p-12 text-center text-gray-500">
            <Tag className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">No se encontraron productos</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition cursor-pointer"
            >
              {product.images && product.images.length > 0 ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <Tag className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg line-clamp-1">{product.title}</h3>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSaveProduct(product.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <Bookmark className="w-5 h-5 text-gray-600" />
                  </button>
                </div>

                <p className="text-2xl font-bold text-blue-600 mb-2">
                  {product.currency === 'USD' ? '$' : product.currency} {product.price.toLocaleString()}
                </p>

                <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                  {product.description}
                </p>

                <div className="space-y-1 mb-3">
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Tag className="w-3 h-3" />
                    <span>{getConditionLabel(product.condition)}</span>
                  </div>
                  
                  {product.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{product.location}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-3 border-t">
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm">
                    {product.seller_name?.charAt(0) || 'V'}
                  </div>
                  <span className="text-sm text-gray-600">
                    {product.seller_name || 'Vendedor'}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
