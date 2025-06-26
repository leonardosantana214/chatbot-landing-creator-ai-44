
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ data?: any; error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔧 Configurando AuthContext SEM triggers automáticos...');
    
    // Configurar listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state change:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Verificar sessão existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('📋 Sessão existente:', session?.user?.email);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('🧹 Limpando AuthContext...');
      subscription.unsubscribe();
    };
  }, []);

  // SIMPLIFICADO: Agora o signUp só cria a conta AUTH, sem dados extras
  const signUp = async (email: string, password: string, userData: any) => {
    console.log('📝 SignUp SIMPLES para:', email);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });
      
      if (error) {
        console.error('❌ Erro no signup simples:', error);
        return { error };
      }
      
      console.log('✅ Signup simples realizado:', data);
      return { data, error: null };
      
    } catch (error) {
      console.error('❌ Erro inesperado no signup:', error);
      return { error: { message: 'Erro inesperado ao criar conta' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Iniciando login para:', email);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error('❌ Erro no login:', error);
      } else {
        console.log('✅ Login realizado com sucesso');
      }
      
      return { error };
      
    } catch (error) {
      console.error('❌ Erro inesperado no login:', error);
      return { error: { message: 'Erro inesperado no login' } };
    }
  };

  const signOut = async () => {
    console.log('👋 Fazendo logout...');
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('❌ Erro no logout:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
