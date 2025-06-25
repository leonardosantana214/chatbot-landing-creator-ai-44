
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  name: string | null;
  email: string | null;
  company: string | null;
  area: string | null;
  whatsapp: string | null;
  instance_id: string | null;
  instance_name: string | null;
  created_at: string;
  updated_at: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      console.log('👤 Buscando perfil do usuário:', user.id);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Erro ao buscar perfil:', error);
        setError(error.message);
        setProfile(null);
      } else {
        console.log('✅ Perfil encontrado:', data);
        setProfile(data);
        setError(null);
      }
    } catch (err) {
      console.error('💥 Erro geral ao buscar perfil:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return { error: 'Usuário não encontrado' };

    try {
      console.log('🔄 Atualizando perfil:', updates);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Erro ao atualizar perfil:', error);
        return { error: error.message };
      }

      console.log('✅ Perfil atualizado:', data);
      setProfile(data);
      return { data };
    } catch (err) {
      console.error('💥 Erro geral ao atualizar perfil:', err);
      return { error: err instanceof Error ? err.message : 'Erro desconhecido' };
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    fetchProfile,
    updateProfile
  };
};
