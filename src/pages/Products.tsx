
import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/products/ProductCard';
import ProductFilters from '@/components/products/ProductFilters';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export interface Product {
  id: string;
  name: string;
  material: string;
  type: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  seller: string;
  sellerCompany: string;
  description: string;
  images: string[];
  isApproved: boolean;
  createdAt: string;
}

// Mock data para demonstração
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Papel Reciclado',
    material: 'Papel',
    type: 'Escritório',
    quantity: 1000,
    unit: 'kg',
    price: 150,
    location: 'São Paulo, SP',
    seller: 'João Silva',
    sellerCompany: 'EcoPaper Ltda',
    description: 'Papel reciclado de alta qualidade, ideal para impressão e embalagens.',
    images: ['/placeholder.svg'],
    isApproved: true,
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    name: 'Plástico PET',
    material: 'Plástico',
    type: 'PET',
    quantity: 500,
    unit: 'kg',
    price: 300,
    location: 'Rio de Janeiro, RJ',
    seller: 'Maria Santos',
    sellerCompany: 'PlasticoVerde',
    description: 'Garrafas PET prensadas, prontas para reciclagem industrial.',
    images: ['/placeholder.svg'],
    isApproved: true,
    createdAt: '2024-01-18'
  },
  {
    id: '3',
    name: 'Alumínio Limpo',
    material: 'Metal',
    type: 'Alumínio',
    quantity: 200,
    unit: 'kg',
    price: 800,
    location: 'Belo Horizonte, MG',
    seller: 'Carlos Oliveira',
    sellerCompany: 'MetalRecicla',
    description: 'Latas de alumínio limpas e prensadas, excelente qualidade.',
    images: ['/placeholder.svg'],
    isApproved: true,
    createdAt: '2024-01-20'
  },
  {
    id: '4',
    name: 'Vidro Transparente',
    material: 'Vidro',
    type: 'Transparente',
    quantity: 300,
    unit: 'kg',
    price: 100,
    location: 'Curitiba, PR',
    seller: 'Ana Costa',
    sellerCompany: 'VidroEco',
    description: 'Vidro transparente separado e limpo, sem contaminações.',
    images: ['/placeholder.svg'],
    isApproved: true,
    createdAt: '2024-01-22'
  }
];

const Products = () => {
  const { t } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    material: '',
    location: '',
    priceRange: [0, 1000] as [number, number]
  });

  const filteredProducts = useMemo(() => {
    return mockProducts.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.material.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesMaterial = !filters.material || product.material === filters.material;
      const matchesLocation = !filters.location || product.location.includes(filters.location);
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];

      return matchesSearch && matchesMaterial && matchesLocation && matchesPrice;
    });
  }, [searchTerm, filters]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card className="text-center py-12">
            <CardContent>
              <h2 className="text-2xl font-bold mb-4">Acesso Restrito</h2>
              <p className="text-gray-600">Você precisa estar logado para ver os produtos.</p>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Produtos Disponíveis</h1>
          
          {/* Barra de busca */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar produtos, materiais ou descrições..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filtros */}
          <ProductFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Lista de produtos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <h3 className="text-xl font-semibold mb-2">Nenhum produto encontrado</h3>
              <p className="text-gray-600">Tente ajustar os filtros ou termo de busca.</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Products;
