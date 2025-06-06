
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface ProductFiltersProps {
  filters: {
    material: string;
    location: string;
    country: string;
    priceRange: [number, number];
  };
  onFiltersChange: (filters: any) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, onFiltersChange }) => {
  const [materials, setMaterials] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [countries, setCountries] = useState<string[]>([]);

  // Placeholder values to avoid empty strings
  const ALL_MATERIALS = "__all_materials__";
  const ALL_COUNTRIES = "__all_countries__";
  const ALL_LOCATIONS = "__all_locations__";

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

      // Buscar países únicos
      const { data: countryData } = await supabase
        .from('products')
        .select('country')
        .eq('is_active', true);

      if (materialData) {
        const uniqueMaterials = [...new Set(materialData.map(item => item.material).filter(Boolean))];
        setMaterials(uniqueMaterials);
      }

      if (locationData) {
        const uniqueLocations = [...new Set(locationData.map(item => item.location).filter(Boolean))];
        setLocations(uniqueLocations);
      }

      if (countryData) {
        const uniqueCountries = [...new Set(countryData.map(item => item.country).filter(Boolean))];
        setCountries(uniqueCountries);
      }
    } catch (error) {
      console.error('Erro ao buscar opções de filtro:', error);
    }
  };

  const updateFilter = (key: string, value: any) => {
    // Convert placeholder values back to empty strings for the filter logic
    let actualValue = value;
    if (value === ALL_MATERIALS || value === ALL_COUNTRIES || value === ALL_LOCATIONS) {
      actualValue = '';
    }
    
    onFiltersChange({
      ...filters,
      [key]: actualValue
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      material: '',
      location: '',
      country: '',
      priceRange: [0, 1000] as [number, number]
    });
  };

  const formatPrice = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/[^\d]/g, '');
    
    // Se não há números, retorna vazio
    if (!numbers) return '';
    
    // Converte para número e divide por 100 para ter centavos
    const numberValue = parseInt(numbers) / 100;
    
    // Formata como moeda brasileira
    return numberValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  const parsePrice = (formattedPrice: string): number => {
    // Remove símbolos de moeda e converte para número
    const numbers = formattedPrice.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(numbers) || 0;
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    const numericValue = parsePrice(formatted);
    updateFilter('priceRange', [numericValue, filters.priceRange[1]]);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPrice(e.target.value);
    const numericValue = parsePrice(formatted);
    updateFilter('priceRange', [filters.priceRange[0], numericValue]);
  };

  const hasActiveFilters = filters.material || filters.location || filters.country ||
    filters.priceRange[0] > 0 || filters.priceRange[1] < 1000;

  // Helper function to get the current select value, converting empty strings to placeholder values
  const getSelectValue = (filterValue: string, placeholderValue: string) => {
    return filterValue === '' ? placeholderValue : filterValue;
  };

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
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Material */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Material
            </Label>
            <Select value={getSelectValue(filters.material, ALL_MATERIALS)} onValueChange={(value) => updateFilter('material', value)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                <SelectItem value={ALL_MATERIALS}>Todos</SelectItem>
                {materials.map((material) => (
                  <SelectItem key={material} value={material}>
                    {material}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* País */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              País
            </Label>
            <Select value={getSelectValue(filters.country, ALL_COUNTRIES)} onValueChange={(value) => updateFilter('country', value)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                <SelectItem value={ALL_COUNTRIES}>Todos</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Localização */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Localização
            </Label>
            <Select value={getSelectValue(filters.location, ALL_LOCATIONS)} onValueChange={(value) => updateFilter('location', value)}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent className="bg-white border shadow-lg">
                <SelectItem value={ALL_LOCATIONS}>Todas</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Preço mínimo */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Preço mínimo
            </Label>
            <Input
              type="text"
              value={filters.priceRange[0] > 0 ? formatPrice(filters.priceRange[0].toString() + '00') : ''}
              onChange={handleMinPriceChange}
              placeholder="R$ 0,00"
              className="h-10 text-sm"
            />
          </div>

          {/* Preço máximo */}
          <div>
            <Label className="text-sm font-medium mb-2 block">
              Preço máximo
            </Label>
            <Input
              type="text"
              value={filters.priceRange[1] < 1000 ? formatPrice(filters.priceRange[1].toString() + '00') : ''}
              onChange={handleMaxPriceChange}
              placeholder="R$ 1.000,00"
              className="h-10 text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductFilters;
