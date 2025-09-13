import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Calendar, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { usePlayers, useTransactions } from "@/hooks/useSupabaseData";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const { players, loading: playersLoading } = usePlayers();
  const { transactions, loading: transactionsLoading } = useTransactions();

  const stats = useMemo(() => {
    const totalPlayers = players.length;
    const paidPlayers = players.filter(p => p.payment_status === 'pago').length;
    const pendingPlayers = players.filter(p => p.payment_status === 'pendente').length;
    const latePayments = players.filter(p => p.payment_status === 'atrasado').length;
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
    
    const monthlyRevenue = monthlyTransactions
      .filter(t => t.type === 'receita')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const monthlyExpenses = monthlyTransactions
      .filter(t => t.type === 'despesa')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const pendingAmount = players
      .filter(p => p.payment_status === 'pendente' || p.payment_status === 'atrasado')
      .reduce((sum, p) => sum + p.monthly_fee, 0);

    const adimplencia = totalPlayers > 0 ? Math.round((paidPlayers / totalPlayers) * 100) : 0;

    return [
      {
        title: "Total Jogadores",
        value: totalPlayers.toString(),
        change: `${paidPlayers} pagos`,
        icon: Users,
        color: "text-secondary"
      },
      {
        title: "Receita Mensal",
        value: `R$ ${monthlyRevenue.toFixed(2)}`,
        change: `${monthlyTransactions.filter(t => t.type === 'receita').length} transações`,
        icon: DollarSign,
        color: "text-secondary"
      },
      {
        title: "Pagamentos Pendentes",
        value: `R$ ${pendingAmount.toFixed(2)}`,
        change: `${pendingPlayers + latePayments} jogadores`,
        icon: Calendar,
        color: "text-primary"
      },
      {
        title: "Taxa de Adimplência",
        value: `${adimplencia}%`,
        change: `${paidPlayers} de ${totalPlayers}`,
        icon: TrendingUp,
        color: "text-secondary"
      }
    ];
  }, [players, transactions]);

  const recentActivity = useMemo(() => {
    const recent = transactions
      .slice(0, 5)
      .map(t => {
        const player = players.find(p => p.id === t.player_id);
        return {
          id: t.id,
          name: player ? player.name : t.description,
          status: t.type === 'receita' ? 'pago' : 'despesa',
          value: t.amount,
          date: new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
          description: t.description
        };
      });
    
    return recent;
  }, [transactions, players]);

  const financialSummary = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
    });
    
    const revenues = monthlyTransactions.filter(t => t.type === 'receita');
    const expenses = monthlyTransactions.filter(t => t.type === 'despesa');
    
    const totalRevenue = revenues.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0);
    
    return {
      revenues: {
        transactions: revenues,
        total: totalRevenue
      },
      expenses: {
        transactions: expenses,
        total: totalExpenses
      }
    };
  }, [transactions]);

  const getStatusBadge = (status: string) => {
    const variants = {
      pago: "bg-secondary/20 text-secondary border-secondary/30",
      pendente: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      cartao: "bg-primary/20 text-primary border-primary/30",
      despesa: "bg-primary/20 text-primary border-primary/30"
    };
    return variants[status as keyof typeof variants] || variants.pendente;
  };

  if (playersLoading || transactionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-background p-4 lg:p-6">
      <div className="w-full space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do seu time</p>
          </div>          
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="shadow-card bg-card border-border hover:shadow-lg transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 shadow-card bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Atividade Recente</CardTitle>
              <CardDescription>
                Últimos pagamentos e atualizações dos jogadores
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <div key={activity.id || index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{activity.name}</p>
                        <p className="text-sm text-muted-foreground">{activity.description} - {activity.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-foreground">R$ {activity.value.toFixed(2)}</span>
                      <Badge className={getStatusBadge(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhuma atividade recente</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Ações Rápidas</CardTitle>
              <CardDescription>
                Acesso rápido às principais funcionalidades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full gradient-primary text-white hover:opacity-90"
                onClick={() => navigate('/jogadores')}
              >
                <Users className="mr-2 h-4 w-4" />
                Adicionar Jogador
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-border hover:bg-muted"
                onClick={() => navigate('/financeiro')}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                Registrar Pagamento
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-border hover:bg-muted"
                onClick={() => navigate('/mensagens')}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Agendar Cobrança
              </Button>
              <Button 
                variant="outline" 
                className="w-full border-border hover:bg-muted"
                onClick={() => navigate('/financeiro')}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                Ver Relatórios
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Financial Summary */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-secondary" />
                Receitas
              </CardTitle>
              <CardDescription>Entradas financeiras do mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialSummary.revenues.transactions.length > 0 ? (
                  <>
                    {financialSummary.revenues.transactions.slice(0, 3).map((transaction, index) => (
                      <div key={transaction.id} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{transaction.category}</span>
                        <span className="font-bold text-secondary">+ R$ {transaction.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="h-px bg-border"></div>
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-secondary">R$ {financialSummary.revenues.total.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Nenhuma receita este mês</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center">
                <TrendingDown className="mr-2 h-5 w-5 text-primary" />
                Despesas
              </CardTitle>
              <CardDescription>Gastos do time este mês</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financialSummary.expenses.transactions.length > 0 ? (
                  <>
                    {financialSummary.expenses.transactions.slice(0, 3).map((transaction, index) => (
                      <div key={transaction.id} className="flex justify-between items-center">
                        <span className="text-muted-foreground">{transaction.category}</span>
                        <span className="font-bold text-primary">- R$ {transaction.amount.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="h-px bg-border"></div>
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-foreground">Total</span>
                      <span className="text-primary">R$ {financialSummary.expenses.total.toFixed(2)}</span>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-muted-foreground">Nenhuma despesa este mês</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;