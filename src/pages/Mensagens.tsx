import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, Users, Clock, CheckCircle, Phone, Copy, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlayers, useMessages } from "@/hooks/useSupabaseData";

interface Player {
  id: number;
  name: string;
  phone: string;
  status: 'pago' | 'pendente' | 'cartaoft';
  selected?: boolean;
}

interface MessageTemplate {
  id: number;
  name: string;
  message: string;
  category: string;
}


const Mensagens = () => {
  const { toast } = useToast();
  const { players: supabasePlayers, loading } = usePlayers();
  const { messages, loading: messagesLoading, addMessage, deleteMessage } = useMessages();
  
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[]>([]);
  
  const players = supabasePlayers.map(player => ({
    id: player.id,
    name: player.name,
    phone: player.phone || '',
    status: player.payment_status,
    selected: selectedPlayerIds.includes(player.id)
  }));

  const [messageTemplates] = useState<MessageTemplate[]>([
    {
      id: 1,
      name: "Cobrança Pendente",
      message: "Olá {NOME}! Sua mensalidade de R$ {VALOR} com vencimento em {DATA_VENCIMENTO} está pendente. Por favor, realize o pagamento para manter sua participação no time ativo. Qualquer dúvida, entre em contato!",
      category: "cobranca"
    },
    {
      id: 2,
      name: "Pagamento Cartão",
      message: "Oi {NOME}, sua penalidade é de R$ {VALOR} venceu em {DATA_VENCIMENTO} e ainda não foi quitada. Para evitar o cancelamento da sua vaga, regularize sua situação o quanto antes. Obrigado!",
      category: "cobranca"
    },
    {
      id: 3,
      name: "Confirmação de Treino",
      message: "Fala {NOME}! Lembrando que temos treino hoje às 19h no campo. Não esqueça de trazer água e chegar 15 minutos antes. Até mais!",
      category: "treino"
    },
    {
      id: 4,
      name: "Convocação para Jogo",
      message: "E aí {NOME}! Você está convocado para o jogo de domingo às 9h. Local: Campo Municipal. Chegada às 8h30. Vamos que vamos! ⚽",
      category: "jogo"
    }
  ]);


  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");

  const filteredPlayers = players.filter(player => 
    filterStatus === "todos" || player.status === filterStatus
  );

  const selectedPlayers = players.filter(player => player.selected);

  const togglePlayerSelection = (playerId: string) => {
    setSelectedPlayerIds(prev => 
      prev.includes(playerId)
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId]
    );
  };

  const toggleAllPlayers = (checked: boolean) => {
    setSelectedPlayerIds(checked ? players.map(p => p.id) : []);
  };

  const selectByStatus = (status: string) => {
    const filteredIds = players
      .filter(player => status === "todos" || player.status === status)
      .map(player => player.id);
    setSelectedPlayerIds(filteredIds);
  };

  const processMessage = (message: string, player: any) => {
    const dueDate = player.due_date 
      ? new Date(player.due_date).toLocaleDateString('pt-BR')
      : new Date().toLocaleDateString('pt-BR');
      
    return message
      .replace(/{NOME}/g, player.name)
      .replace(/{VALOR}/g, player.monthly_fee?.toString() || "200")
      .replace(/{DATA_VENCIMENTO}/g, dueDate);
  };

  const sendMessages = async () => {
    const message = selectedTemplate ? selectedTemplate.message : customMessage;
    
    if (!message.trim()) {
      toast({
        title: "Erro",
        description: "Digite uma mensagem antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    if (selectedPlayers.length === 0) {
      toast({
        title: "Erro", 
        description: "Selecione pelo menos um jogador.",
        variant: "destructive",
      });
      return;
    }

    // Enviar mensagens via WhatsApp
    const playerData = supabasePlayers.filter(p => selectedPlayerIds.includes(p.id));
    
    playerData.forEach(player => {
      const processedMessage = processMessage(message, player);
      const whatsappUrl = `https://wa.me/55${player.phone}?text=${encodeURIComponent(processedMessage)}`;
      window.open(whatsappUrl, '_blank');
    });

    // Salvar no histórico do banco de dados
    await addMessage({
      player_ids: selectedPlayerIds,
      template_name: selectedTemplate ? selectedTemplate.name : "Mensagem Personalizada",
      content: message,
      status: "enviado",
      user_id: "" // será preenchido automaticamente pelo hook
    });

    toast({
      title: "Mensagens enviadas!",
      description: `${selectedPlayers.length} mensagem(ns) aberta(s) no WhatsApp.`,
    });

    // Limpar seleção
    setSelectedPlayerIds([]);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pago: "bg-secondary/20 text-secondary border-secondary/30",
      pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      cartaoft: "bg-primary/20 text-primary border-primary/30"
    };
    return variants[status as keyof typeof variants] || variants.pendente;
  };

  const getMessageStatusBadge = (status: string) => {
    const variants = {
      enviado: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      entregue: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      lido: "bg-secondary/20 text-secondary border-secondary/30"
    };
    return variants[status as keyof typeof variants] || variants.enviado;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência.",
    });
  };

  const getPreviewPlayer = () => {
    if (selectedPlayerIds.length > 0) {
      const firstSelectedPlayer = supabasePlayers.find(p => selectedPlayerIds.includes(p.id));
      if (firstSelectedPlayer) {
        return firstSelectedPlayer;
      }
    }
    
    // Fallback para dados de exemplo
    return {
      name: "João Silva",
      monthly_fee: 200,
      due_date: "2024-12-15"
    };
  };

  const handleDeleteMessage = async (messageId: string) => {
    console.log("Iniciando exclusão da mensagem:", messageId);
    if (confirm("Tem certeza que deseja excluir esta mensagem do histórico?")) {
      await deleteMessage(messageId);
    }
  };

  return (
    <div className="w-full bg-background p-4 lg:p-6">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mensagens WhatsApp</h1>
            <p className="text-muted-foreground">Envie mensagens para os jogadores</p>
          </div>
          
          <Button 
            onClick={sendMessages} 
            disabled={selectedPlayers.length === 0}
            className="gradient-primary text-white hover:opacity-90"
          >
            <Send className="mr-2 h-4 w-4" />
            Enviar ({selectedPlayers.length})
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Player Selection */}
          <Card className="lg:col-span-1 shadow-card bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <Users className="mr-2 h-5 w-5" />
                Selecionar Jogadores
              </CardTitle>
              <CardDescription>
                {selectedPlayers.length} de {players.length} selecionados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Selection */}
              <div className="space-y-2">
                <Label className="text-foreground font-medium">Seleção Rápida:</Label>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => selectByStatus("todos")}
                    className="border-border hover:bg-muted"
                  >
                    Todos
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => selectByStatus("pendente")}
                    className="border-border hover:bg-muted"
                  >
                    Pendentes
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => selectByStatus("cartão")}
                    className="border-border hover:bg-muted"
                  >
                    Cartão
                  </Button>
                </div>
              </div>

              {/* Filter */}
              <div>
                <Label className="text-foreground font-medium">Filtrar por status:</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pago">Pagos</SelectItem>
                    <SelectItem value="pendente">Pendentes</SelectItem>
                    <SelectItem value="cartaoft">Cartão</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Player List */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredPlayers.map(player => (
                  <div key={player.id} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Checkbox
                      checked={player.selected || false}
                      onCheckedChange={() => togglePlayerSelection(player.id)}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{player.name}</p>
                      <p className="text-sm text-muted-foreground">{player.phone}</p>
                    </div>
                    <Badge className={getStatusBadge(player.status)}>
                      {player.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Message Composition */}
          <Card className="lg:col-span-2 shadow-card bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <MessageCircle className="mr-2 h-5 w-5" />
                Compor Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="templates" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="templates">Modelos</TabsTrigger>
                  <TabsTrigger value="custom">Personalizada</TabsTrigger>
                </TabsList>

                <TabsContent value="templates" className="space-y-4">
                  <div className="grid gap-4">
                    {messageTemplates.map(template => (
                      <Card 
                        key={template.id} 
                        className={`cursor-pointer transition-all duration-200 ${
                          selectedTemplate?.id === template.id 
                            ? 'ring-2 ring-primary bg-primary/5' 
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-sm text-foreground">{template.name}</CardTitle>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="border-border">
                                {template.category}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(template.message);
                                }}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {template.message}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {selectedTemplate && (
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Prévia da mensagem:</Label>
                      <div className="p-4 rounded-lg bg-muted border border-border">
                        <p className="text-foreground whitespace-pre-wrap">
                          {processMessage(selectedTemplate.message, getPreviewPlayer())}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        * Variáveis como {"{NOME}"}, {"{VALOR}"} e {"{DATA_VENCIMENTO}"} serão substituídas automaticamente.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="custom" className="space-y-4">
                  <div>
                    <Label htmlFor="customMessage" className="text-foreground font-medium">
                      Mensagem Personalizada
                    </Label>
                    <Textarea
                      id="customMessage"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Digite sua mensagem aqui..."
                      className="min-h-32 bg-background border-border"
                    />
                  </div>

                  {customMessage && (
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Prévia:</Label>
                      <div className="p-4 rounded-lg bg-muted border border-border">
                        <p className="text-foreground whitespace-pre-wrap">
                          {processMessage(customMessage, getPreviewPlayer())}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground">
                    <p className="font-medium mb-1">Variáveis disponíveis:</p>
                    <ul className="space-y-1">
                      <li>• {"{NOME}"} - Nome do jogador</li>
                      <li>• {"{VALOR}"} - Valor da mensalidade</li>
                      <li>• {"{DATA_VENCIMENTO}"} - Data de vencimento</li>
                    </ul>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Message History */}
        <Card className="shadow-card bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Histórico de Mensagens
            </CardTitle>
            <CardDescription>
              Mensagens enviadas recentemente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {messagesLoading ? (
                <div className="text-center py-8">
                  <div className="text-muted-foreground">Carregando histórico...</div>
                </div>
              ) : messages.length > 0 ? (
                messages.map(message => {
                  const playerNames = message.player_ids.map(playerId => {
                    const player = supabasePlayers.find(p => p.id === playerId);
                    return player?.name || 'Jogador não encontrado';
                  }).join(', ');

                  return (
                    <div key={message.id} className="flex items-start justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-foreground">{message.template_name}</h4>
                            <span className="text-sm text-muted-foreground">
                              ({message.player_ids.length} jogador{message.player_ids.length > 1 ? 'es' : ''})
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-1">
                            Para: {playerNames}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                            {message.content}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(message.sent_at).toLocaleString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getMessageStatusBadge(message.status)}>
                          {message.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteMessage(message.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma mensagem enviada</h3>
                  <p className="text-muted-foreground">
                    As mensagens enviadas aparecerão aqui
                  </p>
                </div>
              )}
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Mensagens;