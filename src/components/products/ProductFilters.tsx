
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductFiltersProps {
  filters: {
    material: string;
    location: string;
    priceRange: [number, number];
  };
  onFiltersChange: (filters: any) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, onFiltersChange }) => {
  const [materials, setMaterials] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const fetchFilterOptions = async () => {
    try {
      // Buscar materiais únicos
      const { data: materialData } = await supabase
        .from('products')
        .select('material')
        .eq('is_active', true);

      // Buscar localizações únicas
      const { data: locationData } = await supabase
        .from('products')
        .select('location')
        .eq('is_active', true);

      if (materialData) {
        const uniqueMaterials = [...new Set(materialData.map(item => item.material).filter(Boolean))];
        setMaterials(uniqueMaterials);
      }

      if (locationData) {
        const uniqueLocations = [...new Set(locationData.map(item => item.location).filter(Boolean))];
        setLocations(uniqueLocations);
      }
    } catch (error) {
      console.error('Erro ao buscar opções de filtro:', error);
    }
  };

  const updateFilter = (key: string, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      material: '',
      location: '',
      priceRange: [0, 1000] as [number, number]
    });
  };

  const hasActiveFilters = filters.material || filters.location || 
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2" />
            <span className="font-medium">Filtros</span>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              className="text-gray-600"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Material */}
          <div>
            <Label htmlFor="material" className="text-sm font-medium mb-2 block">
              Material
            </Label>
            <select
              id="material"
              value={filters.material}
              onChange={(e) => updateFilter('material', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todos</option>
              {materials.map((material) => (
                <option key={material} value={material}>
                  {material}
                </option>
              ))}
            </select>
          </div>

          {/* Localização */}
          <div>
            <Label htmlFor="location" className="text-sm font-medium mb-2 block">
              Localização
            </Label>
            <select
              id="location"
              value={filters.location}
              onChange={(e) => updateFilter('location', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Todas</option>
              {locations.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Preço mínimo */}
          <div>
            <Label htmlFor="minPrice" className="text-sm font-medium mb-2 block">
              Preço mínimo (R$)
            </Label>
            <Input
              id="minPrice"
              type="number"
              min="0"
              value={filters.priceRange[0]}
              onChange={(e) => updateFilter('priceRange', [Number(e.target.value), filters.priceRange[1]])}
              className="text-sm"
            />
          </div>

          {/* Preço máximo */}
          <div>
            <Label htmlFor="maxPrice" className="text-sm font-medium mb-2 block">
              Preço máximo (R$)
            </Label>
            <Input
              id="maxPrice"
              type="number"
              min="0"
              value={filters.priceRange[1]}
              onChange={(e) => updateFilter('priceRange', [filters.priceRange[0], Number(e.target.value)])}
              className="text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductFilters;
