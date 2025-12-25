import { Layout } from "@/components/layout/Layout";
import { StatCard } from "@/components/dashboard/StatCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { RecentInvoices } from "@/components/dashboard/RecentInvoices";
import { useSupabaseInvoices } from "@/hooks/useSupabaseInvoices";
import { Euro, FileText, Clock, TrendingUp, Loader2 } from "lucide-react";

const Index = () => {
  const { invoices, loading } = useSupabaseInvoices();
  
  const paidInvoices = invoices.filter(i => i.status === 'reglee');
  const totalRevenue = paidInvoices.reduce((sum, i) => sum + Number(i.total), 0);
  const pendingInvoices = invoices.filter(i => i.status === 'non_reglee' || i.status === 'reglement_en_cours');
  const pendingTotal = pendingInvoices.reduce((sum, i) => sum + Number(i.total), 0);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Tableau de bord
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Bienvenue sur votre espace de gestion Nyraa Digital
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
          <StatCard
            title="Chiffre d'affaires"
            value={`${totalRevenue.toLocaleString('fr-FR')} €`}
            change="+12.5%"
            icon={Euro}
            variant="primary"
            delay={0}
          />
          <StatCard
            title="En attente"
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          <RevenueChart />
          <RecentInvoices invoices={invoices.slice(0, 4)} />
        </div>
      </div>
    </Layout>
  );
};

export default Index;
