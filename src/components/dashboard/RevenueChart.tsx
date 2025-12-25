import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const data = [
  { name: 'Jan', revenue: 4000, expenses: 2400 },
  { name: 'Fév', revenue: 3000, expenses: 1398 },
  { name: 'Mar', revenue: 2000, expenses: 9800 },
  { name: 'Avr', revenue: 2780, expenses: 3908 },
  { name: 'Mai', revenue: 1890, expenses: 4800 },
  { name: 'Jun', revenue: 2390, expenses: 3800 },
  { name: 'Jul', revenue: 3490, expenses: 4300 },
];

export function RevenueChart() {
  return (
    <div className="glass-card rounded-2xl p-4 md:p-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h3 className="text-base md:text-lg font-semibold text-foreground">Revenus</h3>
          <p className="text-xs md:text-sm text-muted-foreground">Évolution des 7 derniers mois</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
          <TrendingUp className="text-success" size={20} />
        </div>
      </div>
      
      <div className="h-48 md:h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(320, 70%, 55%)" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="hsl(320, 70%, 55%)" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 15%)" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(240, 5%, 45%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="hsl(240, 5%, 45%)" 
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}€`}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(240, 10%, 8%)', 
                border: '1px solid hsl(240, 10%, 18%)',
                borderRadius: '12px',
                color: 'hsl(0, 0%, 98%)',
                boxShadow: '0 10px 40px hsl(0, 0%, 0%, 0.5)'
              }}
              formatter={(value: number) => [`${value}€`, '']}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="hsl(262, 83%, 58%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRevenue)"
              name="Revenus"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="hsl(320, 70%, 55%)"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorExpenses)"
              name="Dépenses"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
