
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'buyer' | 'seller';
  company?: string;
  location?: string;
  documents?: string[];
  isApproved?: boolean;
  savedProducts?: string[];
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  isAuthenticated: boolean;
  saveProduct: (productId: string) => void;
  unsaveProduct: (productId: string) => void;
  isProductSaved: (productId: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (undefined === context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('ecomarket_user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const saveProduct = (productId: string) => {
    if (user) {
      const savedProducts = user.savedProducts || [];
      if (!savedProducts.includes(productId)) {
        const updatedUser = {
          ...user,
          savedProducts: [...savedProducts, productId]
        };
        setUser(updatedUser);
        localStorage.setItem('ecomarket_user', JSON.stringify(updatedUser));
      }
    }
  };

  const unsaveProduct = (productId: string) => {
    if (user) {
      const savedProducts = user.savedProducts || [];
      const updatedUser = {
        ...user,
        savedProducts: savedProducts.filter(id => id !== productId)
      };
      setUser(updatedUser);
      localStorage.setItem('ecomarket_user', JSON.stringify(updatedUser));
    }
  };

  const isProductSaved = (productId: string) => {
    return user?.savedProducts?.includes(productId) || false;
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call
      const users = JSON.parse(localStorage.getItem('ecomarket_users') || '[]');
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        localStorage.setItem('ecomarket_user', JSON.stringify(userWithoutPassword));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      const users = JSON.parse(localStorage.getItem('ecomarket_users') || '[]');
      const newUser = {
        id: Date.now().toString(),
        name: userData.name || '',
        email: userData.email || '',
        type: userData.type || 'buyer' as const,
        company: userData.company,
        location: userData.location,
        documents: userData.documents,
        isApproved: userData.type === 'buyer' ? true : false,
        savedProducts: [],
        password: userData.password
      };
      
      users.push(newUser);
      localStorage.setItem('ecomarket_users', JSON.stringify(users));
      
      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('ecomarket_user', JSON.stringify(userWithoutPassword));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('ecomarket_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      register,
      isAuthenticated,
      saveProduct,
      unsaveProduct,
      isProductSaved
    }}>
      {children}
    </AuthContext.Provider>
  );
};
