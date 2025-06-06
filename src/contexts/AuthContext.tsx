
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  location: string | null;
  documents: string[] | null;
  is_approved: boolean | null;
  saved_products: string[] | null;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  signup: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  isLoading: boolean;
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
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const isAuthenticated = !!user && !!session;

  // Fetch user profile from the profiles table
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Defer profile fetching to avoid blocking auth state changes
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setProfile(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signup = async (email: string, password: string, userData: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: userData.name,
            company: userData.company,
            location: userData.location,
          }
        }
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const saveProduct = async (productId: string) => {
    if (!profile) return;
    
    const savedProducts = profile.saved_products || [];
    if (!savedProducts.includes(productId)) {
      const updatedSavedProducts = [...savedProducts, productId];
      
      const { error } = await supabase
        .from('profiles')
        .update({ saved_products: updatedSavedProducts })
        .eq('id', profile.id);

      if (!error) {
        setProfile({ ...profile, saved_products: updatedSavedProducts });
      }
    }
  };

  const unsaveProduct = async (productId: string) => {
    if (!profile) return;
    
    const savedProducts = profile.saved_products || [];
    const updatedSavedProducts = savedProducts.filter(id => id !== productId);
    
    const { error } = await supabase
      .from('profiles')
      .update({ saved_products: updatedSavedProducts })
      .eq('id', profile.id);

    if (!error) {
      setProfile({ ...profile, saved_products: updatedSavedProducts });
    }
  };

  const isProductSaved = (productId: string) => {
    return profile?.saved_products?.includes(productId) || false;
  };

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      session,
      login,
      signup,
      logout,
      resetPassword,
      isLoading,
      isAuthenticated,
      saveProduct,
      unsaveProduct,
      isProductSaved
    }}>
      {children}
    </AuthContext.Provider>
  );
};
