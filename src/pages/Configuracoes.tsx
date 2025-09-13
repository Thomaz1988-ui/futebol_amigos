import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Settings, User, CreditCard, Bell, Palette, Shield, Save, Mail, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProfile, useSettings } from "@/hooks/useSupabaseData";
import { useImageUpload } from "@/hooks/useImageUpload";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { useLanguage } from "@/hooks/useLanguage";
import { supabase } from "@/integrations/supabase/client";

const Configuracoes = () => {
  const { toast } = useToast();
  const { profile, loading: profileLoading, updateProfile } = useProfile();
  const { settings, loading: settingsLoading, updateSettings } = useSettings();
  const { uploadAvatar, uploading } = useImageUpload();
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage } = useLanguage();

  // Profile Settings
  const [profileData, setProfileData] = useState({
    display_name: "",
    team_name: "",
    monthly_fee: 200,
    due_day: 15,
    timezone: "America/Sao_Paulo"
  });

  // Notification Settings
  const [notifications, setNotifications] = useState({
    notifications_email: true,
    notifications_whatsapp: true,
    notifications_payment_reminder: true,
    notifications_overdue: true
  });

  // Appearance Settings - usando hooks reais
  const [localAppearance, setLocalAppearance] = useState({
    compact_mode: false
  });

  // Account Settings
  const [accountData, setAccountData] = useState({
    currentEmail: "",
    newEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  useEffect(() => {
    if (profile) {
      setProfileData({
        display_name: profile.display_name || "",
        team_name: profile.team_name || "",
        monthly_fee: profile.monthly_fee || 200,
        due_day: profile.due_day || 15,
        timezone: profile.timezone || "America/Sao_Paulo"
      });
    }
  }, [profile]);

  useEffect(() => {
    if (settings) {
      setNotifications({
        notifications_email: settings.notifications_email,
        notifications_whatsapp: settings.notifications_whatsapp,
        notifications_payment_reminder: settings.notifications_payment_reminder,
        notifications_overdue: settings.notifications_overdue
      });
      setLocalAppearance({
        compact_mode: settings.compact_mode
      });
    }
    if (user) {
      setAccountData(prev => ({
        ...prev,
        currentEmail: user.email || ""
      }));
    }
  }, [settings, user]);

  const saveProfileSettings = async () => {
    await updateProfile(profileData);
  };

  const saveNotificationSettings = async () => {
    await updateSettings(notifications);
  };

  const saveAppearanceSettings = async () => {
    await updateSettings({
      compact_mode: localAppearance.compact_mode
    });
  };

  const resetPassword = async () => {
    if (!user?.email) return;
    
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/`,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message
      });
    } else {
      toast({
        title: "Email enviado!",
        description: "Instruções para redefinir a senha foram enviadas para seu email.",
      });
    }
  };

  const updateEmail = async () => {
    if (!accountData.newEmail || accountData.newEmail === accountData.currentEmail) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite um novo email válido"
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      email: accountData.newEmail
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar email",
        description: error.message
      });
    } else {
      toast({
        title: "Email alterado!",
        description: "Verifique seu novo email para confirmar a alteração."
      });
      setAccountData(prev => ({ ...prev, newEmail: "" }));
    }
  };

  const updatePassword = async () => {
    if (!accountData.newPassword || !accountData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos de senha"
      });
      return;
    }

    if (accountData.newPassword !== accountData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem"
      });
      return;
    }

    if (accountData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres"
      });
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password: accountData.newPassword
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Erro ao alterar senha",
        description: error.message
      });
    } else {
      toast({
        title: "Senha alterada!",
        description: "Sua senha foi atualizada com sucesso."
      });
      setAccountData(prev => ({ 
        ...prev, 
        currentPassword: "", 
        newPassword: "", 
        confirmPassword: "" 
      }));
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const avatarUrl = await uploadAvatar(file, user.id);
    if (avatarUrl) {
      await updateProfile({ avatar_url: avatarUrl });
    }
  };

  return (
    <div className="w-full bg-background p-4 lg:p-6">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
            <p className="text-muted-foreground">Gerencie as configurações do sistema</p>
          </div>
          <Settings className="h-8 w-8 text-muted-foreground" />
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="account" className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span className="hidden sm:inline">Conta</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Time</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-card bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <User className="mr-2 h-5 w-5" />
                  Informações Pessoais
                </CardTitle>
                <CardDescription>
                  Atualize suas informações pessoais e de contato
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-primary/20 text-primary text-lg">
                      {(profileData.display_name || profile?.display_name || 'U').split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <input
                      type="file"
                      id="avatar-upload"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                    <Button 
                      variant="outline" 
                      className="border-border hover:bg-muted"
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={uploading}
                    >
                      {uploading ? "Enviando..." : "Alterar Foto"}
                    </Button>
                    <p className="text-sm text-muted-foreground mt-1">
                      JPG, PNG ou GIF. Máximo 2MB.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="display_name" className="text-foreground">Nome de Exibição</Label>
                    <Input
                      id="display_name"
                      value={profileData.display_name}
                      onChange={(e) => setProfileData({...profileData, display_name: e.target.value})}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="team_name" className="text-foreground">Nome do Time</Label>
                    <Input
                      id="team_name"
                      value={profileData.team_name}
                      onChange={(e) => setProfileData({...profileData, team_name: e.target.value})}
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={saveProfileSettings}
                    disabled={profileLoading}
                    className="gradient-primary text-white hover:opacity-90"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Alterações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Settings */}
          <TabsContent value="account" className="space-y-6">
            <Card className="shadow-card bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Mail className="mr-2 h-5 w-5" />
                  Alterar Email
                </CardTitle>
                <CardDescription>
                  Atualize seu endereço de email
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="currentEmail" className="text-foreground">Email Atual</Label>
                  <Input
                    id="currentEmail"
                    value={accountData.currentEmail}
                    disabled
                    className="bg-muted border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="newEmail" className="text-foreground">Novo Email</Label>
                  <Input
                    id="newEmail"
                    type="email"
                    value={accountData.newEmail}
                    onChange={(e) => setAccountData({...accountData, newEmail: e.target.value})}
                    placeholder="Digite seu novo email"
                    className="bg-background border-border"
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={updateEmail}
                    className="gradient-primary text-white hover:opacity-90"
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Alterar Email
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-card bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Key className="mr-2 h-5 w-5" />
                  Alterar Senha
                </CardTitle>
                <CardDescription>
                  Atualize sua senha de acesso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newPassword" className="text-foreground">Nova Senha</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={accountData.newPassword}
                    onChange={(e) => setAccountData({...accountData, newPassword: e.target.value})}
                    placeholder="Digite sua nova senha"
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={accountData.confirmPassword}
                    onChange={(e) => setAccountData({...accountData, confirmPassword: e.target.value})}
                    placeholder="Confirme sua nova senha"
                    className="bg-background border-border"
                  />
                </div>
                <div className="flex justify-between pt-4">
                  <Button 
                    variant="outline" 
                    onClick={resetPassword}
                    className="border-border hover:bg-muted"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Redefinir por Email
                  </Button>
                  <Button 
                    onClick={updatePassword}
                    className="gradient-primary text-white hover:opacity-90"
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Alterar Senha
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Team Settings */}
          <TabsContent value="team" className="space-y-6">
            <Card className="shadow-card bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Configurações do Time
                </CardTitle>
                <CardDescription>
                  Configure as informações e regras do seu time
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="monthlyFee" className="text-foreground">Mensalidade (R$)</Label>
                    <Input
                      id="monthlyFee"
                      type="number"
                      value={profileData.monthly_fee}
                      onChange={(e) => setProfileData({...profileData, monthly_fee: Number(e.target.value)})}
                      className="bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDay" className="text-foreground">Dia de Vencimento</Label>
                    <Select 
                      value={profileData.due_day.toString()} 
                      onValueChange={(value) => setProfileData({...profileData, due_day: Number(value)})}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({length: 28}, (_, i) => i + 1).map(day => (
                          <SelectItem key={day} value={day.toString()}>
                            Dia {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="timezone" className="text-foreground">Fuso Horário</Label>
                    <Select 
                      value={profileData.timezone} 
                      onValueChange={(value) => setProfileData({...profileData, timezone: value})}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">Brasil (GMT-3)</SelectItem>
                        <SelectItem value="America/New_York">Nova York (GMT-5)</SelectItem>
                        <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={saveProfileSettings}
                    disabled={profileLoading}
                    className="gradient-primary text-white hover:opacity-90"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card className="shadow-card bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Preferências de Notificação
                </CardTitle>
                <CardDescription>
                  Configure como e quando você quer receber notificações
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Email Notifications */}
                <div>
                  <h4 className="font-medium text-foreground mb-4">Notificações por Email</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-foreground">Pagamentos recebidos</Label>
                        <p className="text-sm text-muted-foreground">Receba um email quando um pagamento for confirmado</p>
                      </div>
                      <Switch
                        checked={notifications.notifications_email}
                        onCheckedChange={(checked) => setNotifications({...notifications, notifications_email: checked})}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-foreground">Lembretes de cobrança</Label>
                        <p className="text-sm text-muted-foreground">Emails automáticos para pagamentos pendentes</p>
                      </div>
                      <Switch
                        checked={notifications.notifications_payment_reminder}
                        onCheckedChange={(checked) => setNotifications({...notifications, notifications_payment_reminder: checked})}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* WhatsApp Notifications */}
                <div>
                  <h4 className="font-medium text-foreground mb-4">Notificações por WhatsApp</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-foreground">Lembretes automáticos</Label>
                        <p className="text-sm text-muted-foreground">Envie lembretes automáticos via WhatsApp</p>
                      </div>
                      <Switch
                        checked={notifications.notifications_whatsapp}
                        onCheckedChange={(checked) => setNotifications({...notifications, notifications_whatsapp: checked})}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Reports */}
                <div>
                  <h4 className="font-medium text-foreground mb-4">Relatórios</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-foreground">Relatório diário</Label>
                        <p className="text-sm text-muted-foreground">Resumo diário das atividades</p>
                      </div>
                      <Switch
                        checked={notifications.notifications_overdue}
                        onCheckedChange={(checked) => setNotifications({...notifications, notifications_overdue: checked})}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={saveNotificationSettings}
                    disabled={settingsLoading}
                    className="gradient-primary text-white hover:opacity-90"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Preferências
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Settings */}
          <TabsContent value="appearance" className="space-y-6">
            <Card className="shadow-card bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center">
                  <Palette className="mr-2 h-5 w-5" />
                  Configurações de Aparência
                </CardTitle>
                <CardDescription>
                  Personalize a aparência do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label className="text-foreground">Tema</Label>
                    <Select 
                      value={theme} 
                      onValueChange={setTheme}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dark">Escuro</SelectItem>
                        <SelectItem value="light">Claro</SelectItem>
                        <SelectItem value="system">Sistema</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-foreground">Idioma</Label>
                    <Select 
                      value={language} 
                      onValueChange={setLanguage}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">Modo compacto</Label>
                      <p className="text-sm text-muted-foreground">Reduz o espaçamento da interface</p>
                    </div>
                      <Switch
                        checked={localAppearance.compact_mode}
                        onCheckedChange={(checked) => setLocalAppearance({...localAppearance, compact_mode: checked})}
                      />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-foreground">Animações</Label>
                      <p className="text-sm text-muted-foreground">Ativar animações e transições</p>
                    </div>
                    <Switch
                      checked={!localAppearance.compact_mode}
                      onCheckedChange={(checked) => setLocalAppearance({...localAppearance, compact_mode: !checked})}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button 
                    onClick={saveAppearanceSettings}
                    className="gradient-primary text-white hover:opacity-90"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Configuracoes;