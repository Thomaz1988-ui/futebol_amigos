import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

export interface Player {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  position?: string;
  status: 'ativo' | 'inativo' | 'suspenso';
  payment_status: 'pago' | 'pendente' | 'atrasado';
  monthly_fee: number;
  last_payment_date?: string;
  due_date?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  player_id?: string;
  type: 'receita' | 'despesa';
  category: string;
  description: string;
  amount: number;
  date: string;
  payment_method: 'dinheiro' | 'pix' | 'cartao' | 'transferencia';
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  user_id: string;
  player_ids: string[];
  template_name: string;
  content: string;
  sent_at: string;
  status: 'enviado' | 'erro' | 'pendente';
}

export interface Profile {
  id: string;
  user_id: string;
  display_name?: string;
  avatar_url?: string;
  team_name: string;
  monthly_fee: number;
  due_day: number;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface Settings {
  id: string;
  user_id: string;
  notifications_email: boolean;
  notifications_whatsapp: boolean;
  notifications_payment_reminder: boolean;
  notifications_overdue: boolean;
  theme: 'light' | 'dark';
  language: string;
  compact_mode: boolean;
  created_at: string;
  updated_at: string;
}

export const usePlayers = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchPlayers = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('players')
      .select('*')
      .order('name');

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar jogadores",
        description: error.message
      });
    } else {
      setPlayers((data || []) as Player[]);
    }
    setLoading(false);
  };

  const addPlayer = async (playerData: Omit<Player, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('players')
      .insert([{ ...playerData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar jogador",
        description: error.message
      });
    } else {
      setPlayers(prev => [...prev, data as Player]);
      toast({
        title: "Jogador adicionado com sucesso!",
        description: `${data.name} foi adicionado ao time.`
      });
    }
  };

  const updatePlayer = async (id: string, updates: Partial<Player>) => {
    const { data, error } = await supabase
      .from('players')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar jogador",
        description: error.message
      });
    } else {
      setPlayers(prev => prev.map(p => p.id === id ? data as Player : p));
      toast({
        title: "Jogador atualizado com sucesso!",
        description: `${data.name} foi atualizado.`
      });
    }
  };

  const deletePlayer = async (id: string) => {
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover jogador",
        description: error.message
      });
    } else {
      setPlayers(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Jogador removido com sucesso!",
        description: "O jogador foi removido do time."
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlayers();
    }
  }, [user]);

  return {
    players,
    loading,
    addPlayer,
    updatePlayer,
    deletePlayer,
    refetch: fetchPlayers
  };
};

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTransactions = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao carregar transações",
        description: error.message
      });
    } else {
      setTransactions((data || []) as Transaction[]);
    }
    setLoading(false);
  };

  const addTransaction = async (transactionData: Omit<Transaction, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert([{ ...transactionData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar transação",
        description: error.message
      });
    } else {
      setTransactions(prev => [data as Transaction, ...prev]);
      toast({
        title: "Transação adicionada com sucesso!",
        description: `${data.type === 'receita' ? 'Receita' : 'Despesa'} de R$ ${data.amount} registrada.`
      });
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    const { data, error } = await supabase
      .from('transactions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar transação",
        description: error.message
      });
    } else {
      setTransactions(prev => prev.map(t => t.id === id ? data as Transaction : t));
      toast({
        title: "Transação atualizada com sucesso!"
      });
    }
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao remover transação",
        description: error.message
      });
    } else {
      setTransactions(prev => prev.filter(t => t.id !== id));
      toast({
        title: "Transação removida com sucesso!"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  return {
    transactions,
    loading,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    refetch: fetchTransactions
  };
};

export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProfile = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Erro ao carregar perfil:', error);
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar perfil",
        description: error.message
      });
    } else {
      setProfile(data);
      toast({
        title: "Perfil atualizado com sucesso!"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile
  };
};

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchSettings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Erro ao carregar configurações:', error);
    } else {
      setSettings(data as Settings);
    }
    setLoading(false);
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('settings')
      .update(updates)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao atualizar configurações",
        description: error.message
      });
    } else {
      setSettings(data as Settings);
      toast({
        title: "Configurações atualizadas com sucesso!"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  return {
    settings,
    loading,
    updateSettings,
    refetch: fetchSettings
  };
};

export const useMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchMessages = async () => {
    if (!user) {
      console.log("Usuário não autenticado, não buscando mensagens");
      return;
    }

    console.log("Buscando mensagens para o usuário:", user.id);
    setLoading(true);

    // Teste de conectividade
    try {
      const { data: testData, error: testError } = await supabase
        .from('messages')
        .select('count', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      console.log("Teste de conectividade:", { testData, testError });
    } catch (err) {
      console.error("Erro de conectividade:", err);
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('user_id', user.id)
      .order('sent_at', { ascending: false });

    console.log("Resultado da busca de mensagens:", { data, error, count: data?.length });

    if (error) {
      console.error("Erro ao buscar mensagens:", error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar mensagens",
        description: error.message
      });
    } else {
      console.log("Mensagens carregadas com sucesso:", data?.length || 0);
      setMessages((data || []) as Message[]);
    }
    
    setLoading(false);
  };

  const addMessage = async (messageData: Omit<Message, 'id' | 'sent_at'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('messages')
      .insert([{ ...messageData, user_id: user.id }])
      .select()
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao salvar mensagem",
        description: error.message
      });
    } else {
      setMessages(prev => [data as Message, ...prev]);
      toast({
        title: "Mensagem salva no histórico!",
        description: `Mensagem "${messageData.template_name}" registrada.`
      });
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }

    console.log("Tentando deletar mensagem:", messageId, "do usuário:", user.id);

    const { data, error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('user_id', user.id)
      .select();

    console.log("Resultado da exclusão:", { data, error });

    if (error) {
      console.error("Erro ao deletar mensagem:", error);
      toast({
        variant: "destructive",
        title: "Erro ao deletar mensagem",
        description: error.message
      });
    } else {
      console.log("Mensagem deletada com sucesso, atualizando estado local");
      setMessages(prev => {
        const newMessages = prev.filter(m => m.id !== messageId);
        console.log("Estado anterior:", prev.length, "Estado novo:", newMessages.length);
        return newMessages;
      });
      toast({
        title: "Mensagem removida do histórico!"
      });
    }
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  return {
    messages,
    loading,
    addMessage,
    deleteMessage,
    refetch: fetchMessages
  };
};