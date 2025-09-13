import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Plus, Search, Edit, Trash2, Phone, Mail, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePlayers } from "@/hooks/useSupabaseData";

interface Player {
  id: number;
  name: string;
  position: string;
  phone: string;
  email: string;
  monthlyFee: number;
  status: 'pago' | 'pendente' | 'atrasado';
  joinDate: string;
}

const Jogadores = () => {
  const { toast } = useToast();
  const { players, loading, addPlayer, updatePlayer, deletePlayer } = usePlayers();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [isAddPlayerOpen, setIsAddPlayerOpen] = useState(false);
  const [isEditPlayerOpen, setIsEditPlayerOpen] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (player.position || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "todos" || player.payment_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      pago: "bg-secondary/20 text-secondary border-secondary/30",
      pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      atrasado: "bg-primary/20 text-primary border-primary/30"
    };
    return variants[status as keyof typeof variants] || variants.pendente;
  };

  const handleAddPlayer = async (playerData: any) => {
    // Combina data e hora em um timestamp ISO
    const joinDateTime = new Date(`${playerData.join_date}T${playerData.join_time}:00`).toISOString();
    const { join_date, join_time, ...restData } = playerData;
    
    const playerWithTimestamp = {
      ...restData,
      created_at: joinDateTime
    };
    
    await addPlayer(playerWithTimestamp);
    setIsAddPlayerOpen(false);
  };

  const handleRemovePlayer = async (playerId: string) => {
    await deletePlayer(playerId);
  };

  const handleEditPlayer = (player: any) => {
    setSelectedPlayer(player);
    setIsEditPlayerOpen(true);
  };

  const handleUpdatePlayer = async (playerData: any) => {
    if (selectedPlayer) {
      // Combina data e hora em um timestamp ISO
      const joinDateTime = new Date(`${playerData.join_date}T${playerData.join_time}:00`).toISOString();
      const { join_date, join_time, ...restData } = playerData;
      
      const playerWithTimestamp = {
        ...restData,
        created_at: joinDateTime
      };
      
      await updatePlayer(selectedPlayer.id, playerWithTimestamp);
      setIsEditPlayerOpen(false);
      setSelectedPlayer(null);
    }
  };

  return (
    <div className="w-full bg-background p-4 lg:p-6">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Gestão de Jogadores</h1>
            <p className="text-muted-foreground">Gerencie os jogadores do seu time</p>
          </div>
          
          <Dialog open={isAddPlayerOpen} onOpenChange={setIsAddPlayerOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" />
                Adicionar Jogador
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Novo Jogador</DialogTitle>
                <DialogDescription>
                  Adicione um novo jogador ao time
                </DialogDescription>
              </DialogHeader>
              <AddPlayerForm onAddPlayer={handleAddPlayer} />
            </DialogContent>
          </Dialog>

          <Dialog open={isEditPlayerOpen} onOpenChange={setIsEditPlayerOpen}>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Editar Jogador</DialogTitle>
                <DialogDescription>
                  Edite as informações do jogador
                </DialogDescription>
              </DialogHeader>
              {selectedPlayer && (
                <EditPlayerForm 
                  player={selectedPlayer} 
                  onUpdatePlayer={handleUpdatePlayer} 
                />
              )}
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="shadow-card bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou posição..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-background border-border"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48 bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="pago">Pagos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
                  <SelectItem value="atrasado">Cartão</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Players Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Carregando jogadores...</div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredPlayers.map((player) => (
            <Card key={player.id} className="shadow-card bg-card border-border hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-foreground">{player.name}</CardTitle>
                      <CardDescription>{player.position || 'Posição não definida'}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusBadge(player.payment_status)}>
                    {player.payment_status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Phone className="mr-2 h-4 w-4" />
                    {player.phone || 'Não informado'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Mail className="mr-2 h-4 w-4" />
                    {player.email || 'Não informado'}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="mr-2 h-4 w-4" />
                    Desde {new Date(player.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="font-bold text-foreground">R$ {player.monthly_fee}/mês</span>
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-border hover:bg-muted"
                      onClick={() => handleEditPlayer(player)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary/10"
                      onClick={() => handleRemovePlayer(player.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredPlayers.length === 0 && (
          <Card className="shadow-card bg-card border-border">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">Nenhum jogador encontrado</h3>
              <p className="text-muted-foreground text-center mb-4">
                {searchTerm || filterStatus !== "todos" 
                  ? "Tente ajustar os filtros para encontrar jogadores"
                  : "Adicione o primeiro jogador ao seu time"
                }
              </p>
              {!searchTerm && filterStatus === "todos" && (
                <Button onClick={() => setIsAddPlayerOpen(true)} className="gradient-primary text-white hover:opacity-90">
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Primeiro Jogador
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Add Player Form Component
const AddPlayerForm = ({ onAddPlayer }: { onAddPlayer: (player: any) => void }) => {
  const [formData, setFormData] = useState({
    name: "",
    position: "",
    phone: "",
    email: "",
    monthly_fee: 200,
    payment_status: "pendente" as "pago" | "pendente" | "atrasado",
    status: "ativo" as const,
    join_date: new Date().toISOString().split('T')[0],
    join_time: new Date().toTimeString().slice(0, 5)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPlayer(formData);
    setFormData({
      name: "",
      position: "",
      phone: "",
      email: "",
      monthly_fee: 200,
      payment_status: "pendente" as "pago" | "pendente" | "atrasado",
      status: "ativo",
      join_date: new Date().toISOString().split('T')[0],
      join_time: new Date().toTimeString().slice(0, 5)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name" className="text-foreground">Nome</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            className="bg-background border-border"
          />
        </div>
        <div>
          <Label htmlFor="position" className="text-foreground">Posição</Label>
          <Select value={formData.position} onValueChange={(value) => setFormData({...formData, position: value})}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Goleiro">Goleiro</SelectItem>
              <SelectItem value="Defensor">Defensor</SelectItem>
              <SelectItem value="Meio-campo">Meio-campo</SelectItem>
              <SelectItem value="Atacante">Atacante</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="phone" className="text-foreground">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="(11) 99999-9999"
            className="bg-background border-border"
          />
        </div>
        <div>
          <Label htmlFor="email" className="text-foreground">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="bg-background border-border"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="monthly_fee" className="text-foreground">Mensalidade (R$)</Label>
          <Input
            id="monthly_fee"
            type="number"
            value={formData.monthly_fee}
            onChange={(e) => setFormData({...formData, monthly_fee: Number(e.target.value)})}
            className="bg-background border-border"
          />
        </div>
        <div>
          <Label htmlFor="payment_status" className="text-foreground">Status de Pagamento</Label>
          <Select value={formData.payment_status} onValueChange={(value) => setFormData({...formData, payment_status: value as "pago" | "pendente" | "atrasado"})}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="join_date" className="text-foreground">Data de Entrada</Label>
          <Input
            id="join_date"
            type="date"
            value={formData.join_date}
            onChange={(e) => setFormData({...formData, join_date: e.target.value})}
            className="bg-background border-border"
          />
        </div>
        <div>
          <Label htmlFor="join_time" className="text-foreground">Hora de Entrada</Label>
          <Input
            id="join_time"
            type="time"
            value={formData.join_time}
            onChange={(e) => setFormData({...formData, join_time: e.target.value})}
            className="bg-background border-border"
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">
        Adicionar Jogador
      </Button>
    </form>
  );
};

// Edit Player Form Component
const EditPlayerForm = ({ player, onUpdatePlayer }: { player: any; onUpdatePlayer: (player: any) => void }) => {
  const [formData, setFormData] = useState({
    name: player?.name || "",
    position: player?.position || "",
    phone: player?.phone || "",
    email: player?.email || "",
    monthly_fee: player?.monthly_fee || 200,
    payment_status: player?.payment_status || "pendente",
    status: player?.status || "ativo",
    join_date: player?.created_at ? new Date(player.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    join_time: player?.created_at ? new Date(player.created_at).toTimeString().slice(0, 5) : new Date().toTimeString().slice(0, 5)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePlayer(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-name" className="text-foreground">Nome</Label>
          <Input
            id="edit-name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            required
            className="bg-background border-border"
          />
        </div>
        <div>
          <Label htmlFor="edit-position" className="text-foreground">Posição</Label>
          <Select value={formData.position} onValueChange={(value) => setFormData({...formData, position: value})}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Goleiro">Goleiro</SelectItem>
              <SelectItem value="Defensor">Defensor</SelectItem>
              <SelectItem value="Meio-campo">Meio-campo</SelectItem>
              <SelectItem value="Atacante">Atacante</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-phone" className="text-foreground">Telefone</Label>
          <Input
            id="edit-phone"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="(11) 99999-9999"
            className="bg-background border-border"
          />
        </div>
        <div>
          <Label htmlFor="edit-email" className="text-foreground">Email</Label>
          <Input
            id="edit-email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="bg-background border-border"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-monthly_fee" className="text-foreground">Mensalidade (R$)</Label>
          <Input
            id="edit-monthly_fee"
            type="number"
            value={formData.monthly_fee}
            onChange={(e) => setFormData({...formData, monthly_fee: Number(e.target.value)})}
            className="bg-background border-border"
          />
        </div>
        <div>
          <Label htmlFor="edit-payment_status" className="text-foreground">Status de Pagamento</Label>
          <Select value={formData.payment_status} onValueChange={(value) => setFormData({...formData, payment_status: value})}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pago">Pago</SelectItem>
              <SelectItem value="pendente">Pendente</SelectItem>
              <SelectItem value="atrasado">Atrasado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-join_date" className="text-foreground">Data de Entrada</Label>
          <Input
            id="edit-join_date"
            type="date"
            value={formData.join_date}
            onChange={(e) => setFormData({...formData, join_date: e.target.value})}
            className="bg-background border-border"
          />
        </div>
        <div>
          <Label htmlFor="edit-join_time" className="text-foreground">Hora de Entrada</Label>
          <Input
            id="edit-join_time"
            type="time"
            value={formData.join_time}
            onChange={(e) => setFormData({...formData, join_time: e.target.value})}
            className="bg-background border-border"
          />
        </div>
      </div>
      
      <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">
        Atualizar Jogador
      </Button>
    </form>
  );
};

export default Jogadores;