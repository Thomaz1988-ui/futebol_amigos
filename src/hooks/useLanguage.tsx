import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'pt-BR' | 'en-US' | 'es-ES';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations = {
  'pt-BR': {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.players': 'Jogadores',
    'nav.messages': 'Mensagens',
    'nav.financial': 'Financeiro',
    'nav.settings': 'Configurações',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Visão geral do seu time',
    'dashboard.totalPlayers': 'Total de Jogadores',
    'dashboard.activePlayers': 'Jogadores Ativos',
    'dashboard.monthlyRevenue': 'Receita Mensal',
    'dashboard.pendingPayments': 'Pagamentos Pendentes',
    
    // Players
    'players.title': 'Jogadores',
    'players.subtitle': 'Gerencie os jogadores do seu time',
    'players.addPlayer': 'Adicionar Jogador',
    
    // Messages
    'messages.title': 'Mensagens WhatsApp',
    'messages.subtitle': 'Envie mensagens para os jogadores',
    
    // Financial
    'financial.title': 'Financeiro',
    'financial.subtitle': 'Controle financeiro do time',
    
    // Settings
    'settings.title': 'Configurações',
    'settings.subtitle': 'Gerencie as configurações do sistema',
    'settings.profile': 'Perfil',
    'settings.account': 'Conta',
    'settings.team': 'Time',
    'settings.notifications': 'Notificações',
    'settings.appearance': 'Aparência',
    
    // General
    'general.save': 'Salvar',
    'general.cancel': 'Cancelar',
    'general.edit': 'Editar',
    'general.delete': 'Excluir',
    'general.add': 'Adicionar',
    'general.close': 'Fechar',
  },
  'en-US': {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.players': 'Players',
    'nav.messages': 'Messages',
    'nav.financial': 'Financial',
    'nav.settings': 'Settings',
    
    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.subtitle': 'Overview of your team',
    'dashboard.totalPlayers': 'Total Players',
    'dashboard.activePlayers': 'Active Players',
    'dashboard.monthlyRevenue': 'Monthly Revenue',
    'dashboard.pendingPayments': 'Pending Payments',
    
    // Players
    'players.title': 'Players',
    'players.subtitle': 'Manage your team players',
    'players.addPlayer': 'Add Player',
    
    // Messages
    'messages.title': 'WhatsApp Messages',
    'messages.subtitle': 'Send messages to players',
    
    // Financial
    'financial.title': 'Financial',
    'financial.subtitle': 'Team financial control',
    
    // Settings
    'settings.title': 'Settings',
    'settings.subtitle': 'Manage system settings',
    'settings.profile': 'Profile',
    'settings.account': 'Account',
    'settings.team': 'Team',
    'settings.notifications': 'Notifications',
    'settings.appearance': 'Appearance',
    
    // General
    'general.save': 'Save',
    'general.cancel': 'Cancel',
    'general.edit': 'Edit',
    'general.delete': 'Delete',
    'general.add': 'Add',
    'general.close': 'Close',
  },
  'es-ES': {
    // Navigation
    'nav.dashboard': 'Panel',
    'nav.players': 'Jugadores',
    'nav.messages': 'Mensajes',
    'nav.financial': 'Financiero',
    'nav.settings': 'Configuración',
    
    // Dashboard
    'dashboard.title': 'Panel',
    'dashboard.subtitle': 'Resumen de tu equipo',
    'dashboard.totalPlayers': 'Total de Jugadores',
    'dashboard.activePlayers': 'Jugadores Activos',
    'dashboard.monthlyRevenue': 'Ingresos Mensuales',
    'dashboard.pendingPayments': 'Pagos Pendientes',
    
    // Players
    'players.title': 'Jugadores',
    'players.subtitle': 'Gestiona los jugadores de tu equipo',
    'players.addPlayer': 'Agregar Jugador',
    
    // Messages
    'messages.title': 'Mensajes WhatsApp',
    'messages.subtitle': 'Envía mensajes a los jugadores',
    
    // Financial
    'financial.title': 'Financiero',
    'financial.subtitle': 'Control financiero del equipo',
    
    // Settings
    'settings.title': 'Configuración',
    'settings.subtitle': 'Gestiona la configuración del sistema',
    'settings.profile': 'Perfil',
    'settings.account': 'Cuenta',
    'settings.team': 'Equipo',
    'settings.notifications': 'Notificaciones',
    'settings.appearance': 'Apariencia',
    
    // General
    'general.save': 'Guardar',
    'general.cancel': 'Cancelar',
    'general.edit': 'Editar',
    'general.delete': 'Eliminar',
    'general.add': 'Agregar',
    'general.close': 'Cerrar',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('language') as Language;
      return saved || 'pt-BR';
    }
    return 'pt-BR';
  });

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations[typeof language]] || key;
  };

  const handleSetLanguage = (newLanguage: Language) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const value = {
    language,
    setLanguage: handleSetLanguage,
    t,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};