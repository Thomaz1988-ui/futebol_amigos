import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Plus, TrendingUp, TrendingDown, Calendar, Download, Filter, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTransactions } from "@/hooks/useSupabaseData";

const Financeiro = () => {
  const { toast } = useToast();
  const { transactions, loading, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [filterType, setFilterType] = useState("todos");
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString());

  const filteredTransactions = transactions.filter(transaction => {
    const matchesType = filterType === "todos" || transaction.type === filterType;
    const transactionMonth = new Date(transaction.date).getMonth();
    const matchesMonth = filterMonth === "todos" || transactionMonth === parseInt(filterMonth);
    return matchesType && matchesMonth;
  });

  const totalReceitas = transactions
    .reduce((sum, t) => sum + (t.type === 'receita' ? t.amount : 0), 0);

  const totalDespesas = transactions
    .reduce((sum, t) => sum + (t.type === 'despesa' ? t.amount : 0), 0);

  const saldoTotal = totalReceitas - totalDespesas;

  const receitasPendentes = 0; // Supabase não tem status pendente

  const handleAddTransaction = async (transactionData: any) => {
    await addTransaction(transactionData);
    setIsAddTransactionOpen(false);
  };

  const handleEditTransaction = async (transactionData: any) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, transactionData);
      setEditingTransaction(null);
      toast({
        title: "Transação atualizada!",
        description: "A transação foi atualizada com sucesso.",
      });
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      await deleteTransaction(transactionId);
      toast({
        title: "Transação excluída!",
        description: "A transação foi excluída com sucesso.",
      });
    }
  };

  const exportToCSV = () => {
    const csvContent = [
      ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor', 'Método', 'Status'],
      ...filteredTransactions.map(t => [
        new Date(t.date).toLocaleDateString('pt-BR'),
        t.type,
        t.category,
        t.description,
        `R$ ${t.amount}`,
        t.payment_method,
        'concluído'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({
      title: "Relatório exportado!",
      description: "O arquivo CSV foi baixado com sucesso.",
    });
  };

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  return (
    <div className="w-full bg-background p-3 sm:p-4 lg:p-6">
      <div className="w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gestão Financeira</h1>
            <p className="text-muted-foreground">Controle de receitas e despesas do time</p>
          </div>
          
          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={exportToCSV} className="border-border hover:bg-muted text-xs sm:text-sm">
              <Download className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
              Exportar CSV
            </Button>
            
            <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-white hover:opacity-90 text-xs sm:text-sm">
                  <Plus className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                  Nova Transação
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Nova Transação</DialogTitle>
                  <DialogDescription>
                    Registre uma nova receita ou despesa
                  </DialogDescription>
                </DialogHeader>
                <AddTransactionForm onAddTransaction={handleAddTransaction} />
              </DialogContent>
            </Dialog>

            {/* Edit Transaction Dialog */}
            <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
              <DialogContent className="bg-card border-border max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Editar Transação</DialogTitle>
                  <DialogDescription>
                    Atualize os dados da transação
                  </DialogDescription>
                </DialogHeader>
                {editingTransaction && (
                  <EditTransactionForm
                    transaction={editingTransaction}
                    onEditTransaction={handleEditTransaction}
                  />
                )}
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid gap-4 sm:gap-6 grid-cols-2 md:grid-cols-4">
          <Card className="shadow-card bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Saldo Total
              </CardTitle>
              <DollarSign className={`h-4 w-4 ${saldoTotal >= 0 ? 'text-secondary' : 'text-primary'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold ${saldoTotal >= 0 ? 'text-secondary' : 'text-primary'}">
                R$ {saldoTotal.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Receitas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-secondary">
                R$ {totalReceitas.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Entradas confirmadas
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Despesas
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-primary">
                R$ {totalDespesas.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Gastos confirmados
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-card bg-card border-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pendentes
              </CardTitle>
              <Calendar className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-yellow-500">
                R$ {receitasPendentes.toLocaleString('pt-BR')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Receitas pendentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="shadow-card bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center">
              <Filter className="mr-2 h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full sm:w-48 bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="receita">Receitas</SelectItem>
                  <SelectItem value="despesa">Despesas</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-full sm:w-48 bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os meses</SelectItem>
                  {months.map((month, index) => (
                    <SelectItem key={index} value={index.toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="shadow-card bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Histórico de Transações</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transação(ões) encontrada(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="text-muted-foreground">Carregando transações...</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors gap-3 sm:gap-0">
                    <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${
                        transaction.type === 'receita' ? 'bg-secondary/20' : 'bg-primary/20'
                      }`}>
                        {transaction.type === 'receita' ? (
                          <TrendingUp className={`h-5 w-5 sm:h-6 sm:w-6 text-secondary`} />
                        ) : (
                          <TrendingDown className={`h-5 w-5 sm:h-6 sm:w-6 text-primary`} />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground">{transaction.description}</h4>
                        <div className="flex flex-wrap items-center gap-x-2 text-xs sm:text-sm text-muted-foreground">
                          <span>{transaction.category}</span>
                          <span className="hidden xs:inline">•</span>
                          <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                          <span className="hidden xs:inline">•</span>
                          <span>{transaction.payment_method}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-3">
                      <div className="text-left sm:text-right">
                        <div className={`font-bold text-sm sm:text-base ${
                          transaction.type === 'receita' ? 'text-secondary' : 'text-primary'
                        }`}>
                          {transaction.type === 'receita' ? '+' : '-'} R$ {transaction.amount.toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingTransaction(transaction)}
                          className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-foreground"
                        >
                          <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-primary"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">Nenhuma transação encontrada</h3>
                <p className="text-muted-foreground mb-4">
                  Ajuste os filtros ou adicione uma nova transação
                </p>
                <Button onClick={() => setIsAddTransactionOpen(true)} className="gradient-primary text-white hover:opacity-90 text-sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Primeira Transação
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Edit Transaction Form Component
const EditTransactionForm = ({ transaction, onEditTransaction }: { 
  transaction: any; 
  onEditTransaction: (transaction: any) => void;
}) => {
  const [formData, setFormData] = useState({
    type: transaction.type as 'receita' | 'despesa',
    category: transaction.category,
    description: transaction.description,
    amount: transaction.amount,
    date: transaction.date,
    payment_method: transaction.payment_method
  });

  const categoriesReceita = ['Mensalidade', 'Taxa de inscrição', 'Patrocínio', 'Eventos', 'Outros'];
  const categoriesDespesa = ['Campo', 'Material', 'Arbitragem', 'Transporte', 'Alimentação', 'Outros'];
  const paymentMethods = [
    { label: 'PIX', value: 'pix' },
    { label: 'Cartão', value: 'cartao' },
    { label: 'Dinheiro', value: 'dinheiro' },
    { label: 'Transferência', value: 'transferencia' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onEditTransaction(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as 'receita' | 'despesa', category: ''})}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receita" className="text-secondary">Receita</TabsTrigger>
          <TabsTrigger value="despesa" className="text-primary">Despesa</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-category" className="text-foreground">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {(formData.type === 'receita' ? categoriesReceita : categoriesDespesa).map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="edit-amount" className="text-foreground">Valor (R$)</Label>
          <Input
            id="edit-amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
            required
            className="bg-background border-border"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="edit-description" className="text-foreground">Descrição</Label>
        <Textarea
          id="edit-description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Descreva a transação..."
          required
          className="bg-background border-border"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="edit-date" className="text-foreground">Data</Label>
          <Input
            id="edit-date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="bg-background border-border"
          />
        </div>

        <div>
          <Label htmlFor="edit-payment-method" className="text-foreground">Método de Pagamento</Label>
          <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map(method => (
                <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">
        Salvar Alterações
      </Button>
    </form>
  );
};

// Add Transaction Form Component
const AddTransactionForm = ({ onAddTransaction }: { onAddTransaction: (transaction: any) => void }) => {
  const [formData, setFormData] = useState({
    type: 'receita' as 'receita' | 'despesa',
    category: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    payment_method: 'dinheiro'
  });

  const categoriesReceita = ['Mensalidade', 'Taxa de inscrição', 'Patrocínio', 'Eventos', 'Outros'];
  const categoriesDespesa = ['Campo', 'Material', 'Arbitragem', 'Transporte', 'Alimentação', 'Outros'];
  const paymentMethods = [
    { label: 'PIX', value: 'pix' },
    { label: 'Cartão', value: 'cartao' },
    { label: 'Dinheiro', value: 'dinheiro' },
    { label: 'Transferência', value: 'transferencia' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddTransaction(formData);
    setFormData({
      type: 'receita',
      category: '',
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      payment_method: 'dinheiro'
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Tabs value={formData.type} onValueChange={(value) => setFormData({...formData, type: value as 'receita' | 'despesa', category: ''})}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="receita" className="text-secondary">Receita</TabsTrigger>
          <TabsTrigger value="despesa" className="text-primary">Despesa</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category" className="text-foreground">Categoria</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {(formData.type === 'receita' ? categoriesReceita : categoriesDespesa).map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="amount" className="text-foreground">Valor (R$)</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
            required
            className="bg-background border-border"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="description" className="text-foreground">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          placeholder="Descreva a transação..."
          required
          className="bg-background border-border"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date" className="text-foreground">Data</Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({...formData, date: e.target.value})}
            className="bg-background border-border"
          />
        </div>

        <div>
          <Label htmlFor="payment_method" className="text-foreground">Método de Pagamento</Label>
          <Select value={formData.payment_method} onValueChange={(value) => setFormData({...formData, payment_method: value})}>
            <SelectTrigger className="bg-background border-border">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {paymentMethods.map(method => (
                <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button type="submit" className="w-full gradient-primary text-white hover:opacity-90">
        Adicionar Transação
      </Button>
    </form>
  );
};

export default Financeiro;