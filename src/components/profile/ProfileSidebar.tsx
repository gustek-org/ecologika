
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Settings, Key, Box, History, BarChart, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProfileSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const ProfileSidebar = ({ activeSection, onSectionChange }: ProfileSidebarProps) => {
  const menuItems = [
    { id: 'profile', label: 'Configurações de perfil', icon: Settings },
    { id: 'password', label: 'Mudar senha', icon: Key },
    { id: 'products', label: 'Meus produtos', icon: Box },
    { id: 'sold-products', label: 'Produtos vendidos', icon: ShoppingBag },
    { id: 'purchases', label: 'Histórico de compras', icon: History },
    { id: 'emissions', label: 'Relatório de emissões', icon: BarChart },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200">
      <div className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Meu perfil</h2>
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center px-3 py-2 text-left rounded-md transition-colors",
                  activeSection === item.id
                    ? "bg-green-50 text-green-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default ProfileSidebar;
