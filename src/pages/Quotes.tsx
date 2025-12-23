import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockQuotes } from "@/data/mockData";
import { generateQuotePDF } from "@/utils/pdfGenerator";
import { Plus, Download, Eye, MoreHorizontal, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const statusConfig = {
  draft: { label: "Brouillon", variant: "secondary" as const },
  sent: { label: "Envoyé", variant: "default" as const },
  accepted: { label: "Accepté", variant: "success" as const },
  rejected: { label: "Refusé", variant: "destructive" as const },
};

export default function QuotesPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredQuotes = mockQuotes.filter(quote =>
    quote.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Devis</h1>
            <p className="text-muted-foreground mt-1">Créez et gérez vos propositions commerciales</p>
          </div>
          <Button variant="gradient" size="lg">
            <Plus size={20} />
            Nouveau devis
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Rechercher un devis..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter size={18} />
            Filtrer
          </Button>
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden animate-slide-up" style={{ animationDelay: "100ms" }}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Numéro</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Client</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Date</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Validité</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Montant</th>
                  <th className="text-left p-4 font-semibold text-muted-foreground text-sm">Statut</th>
                  <th className="text-right p-4 font-semibold text-muted-foreground text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotes.map((quote, index) => (
                  <tr 
                    key={quote.id} 
                    className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    style={{ animationDelay: `${150 + index * 50}ms` }}
                  >
                    <td className="p-4">
                      <span className="font-semibold text-foreground">{quote.number}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                          <span className="text-secondary-foreground font-semibold text-xs">
                            {quote.client.name.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{quote.client.name}</p>
                          <p className="text-sm text-muted-foreground">{quote.client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {quote.createdAt.toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4 text-muted-foreground">
                      {quote.validUntil.toLocaleDateString('fr-FR')}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-foreground">
                        {quote.total.toLocaleString('fr-FR')} €
                      </span>
                    </td>
                    <td className="p-4">
                      <Badge variant={statusConfig[quote.status].variant}>
                        {statusConfig[quote.status].label}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => generateQuotePDF(quote)}
                          title="Télécharger PDF"
                        >
                          <Download size={18} />
                        </Button>
                        <Button variant="ghost" size="icon" title="Voir">
                          <Eye size={18} />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal size={18} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Modifier</DropdownMenuItem>
                            <DropdownMenuItem>Convertir en facture</DropdownMenuItem>
                            <DropdownMenuItem>Dupliquer</DropdownMenuItem>
                            <DropdownMenuItem>Envoyer par email</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
}
