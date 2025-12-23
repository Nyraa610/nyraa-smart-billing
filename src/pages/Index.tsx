import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { mockInvoices } from "@/data/mockData";
import { Euro, FileText, Clock, TrendingUp } from "lucide-react";

const Index = () => {
  const paidInvoices = mockInvoices.filter(i => i.status === 'paid');
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + i.total, 0);
  const pendingInvoices = mockInvoices.filter(i => i.status === 'sent' || i.status === 'overdue');
  const pendingTotal = pendingInvoices.reduce((sum, i) => sum + i.total, 0);

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-1">
            Bienvenue sur votre espace de gestion Nyraa Digital
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Chiffre d'affaires"
            value={`${totalRevenue.toLocaleString('fr-FR')} €`}
            change={12.5}
            icon={Euro}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="Factures en attente"
            value={pendingInvoices.length.toString()}
            icon={Clock}
            variant="warning"
            delay={50}
          />
          <StatCard
            title="Montant en attente"
            value={`${pendingTotal.toLocaleString('fr-FR')} €`}
            icon={FileText}
            delay={100}
          />
          <StatCard
            title="Factures payées"
            value={paidInvoices.length.toString()}
            icon={TrendingUp}
            variant="success"
            delay={150}
          />
        </div>

        {/* Charts & Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <RecentInvoices invoices={mockInvoices.slice(0, 4)} />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
