import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { mockTransactions } from "@/data/mockData";
import { TrendingUp, TrendingDown, Wallet, PieChart } from "lucide-react";
import { PieChart as RechartPie, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const expensesByCategory = [
  { name: 'Logiciels', value: 2500, color: 'hsl(220, 70%, 45%)' },
  { name: 'Marketing', value: 3500, color: 'hsl(175, 60%, 40%)' },
  { name: 'Bureautique', value: 800, color: 'hsl(38, 92%, 50%)' },
  { name: 'Autres', value: 1200, color: 'hsl(215, 16%, 47%)' },
];

const monthlyData = [
  { month: 'Jan', income: 8500, expense: 2800 },
  { month: 'Fév', income: 6200, expense: 2100 },
  { month: 'Mar', income: 9800, expense: 3200 },
  { month: 'Avr', income: 7500, expense: 2600 },
  { month: 'Mai', income: 11200, expense: 3800 },
  { month: 'Jun', income: 9400, expense: 3100 },
];

export default function AccountingPage() {
  const totalIncome = mockTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = mockTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Comptabilité</h1>
          <p className="text-muted-foreground mt-1">Suivez vos finances en temps réel</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Solde actuel"
            value={`${balance.toLocaleString('fr-FR')} €`}
            icon={Wallet}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="Revenus totaux"
            value={`${totalIncome.toLocaleString('fr-FR')} €`}
            change={8.2}
            icon={TrendingUp}
            variant="success"
            delay={50}
          />
          <StatCard
            title="Dépenses totales"
            value={`${totalExpenses.toLocaleString('fr-FR')} €`}
            icon={TrendingDown}
            delay={100}
          />
          <StatCard
            title="Marge bénéficiaire"
            value={`${((balance / totalIncome) * 100).toFixed(1)}%`}
            icon={PieChart}
            delay={150}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-card rounded-2xl border shadow-sm p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <h3 className="text-lg font-semibold text-card-foreground mb-6">Revenus vs Dépenses</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                  <XAxis 
                    dataKey="month" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }}
                    tickFormatter={(value) => `${value / 1000}k€`}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(0, 0%, 100%)',
                      border: '1px solid hsl(214, 32%, 91%)',
                      borderRadius: '12px',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, '']}
                  />
                  <Bar dataKey="income" fill="hsl(220, 70%, 45%)" radius={[4, 4, 0, 0]} name="Revenus" />
                  <Bar dataKey="expense" fill="hsl(175, 60%, 40%)" radius={[4, 4, 0, 0]} name="Dépenses" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-card rounded-2xl border shadow-sm p-6 animate-slide-up" style={{ animationDelay: "150ms" }}>
            <h3 className="text-lg font-semibold text-card-foreground mb-6">Dépenses par catégorie</h3>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartPie>
                  <Pie
                    data={expensesByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expensesByCategory.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [`${value.toLocaleString('fr-FR')} €`, '']}
                  />
                </RechartPie>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {expensesByCategory.map((cat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-sm text-muted-foreground">{cat.name}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{cat.value.toLocaleString('fr-FR')} €</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 animate-slide-up" style={{ animationDelay: "200ms" }}>
          <h3 className="text-lg font-semibold text-card-foreground mb-6">Transactions récentes</h3>
          <div className="space-y-3">
            {mockTransactions.map((transaction, index) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    transaction.type === 'income' ? 'bg-success/10' : 'bg-destructive/10'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="text-success" size={20} />
                    ) : (
                      <TrendingDown className="text-destructive" size={20} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">{transaction.category} • {transaction.date.toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  transaction.type === 'income' ? 'text-success' : 'text-destructive'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{transaction.amount.toLocaleString('fr-FR')} €
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
