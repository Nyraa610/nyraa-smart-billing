import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useClients } from "@/hooks/useClients";
import { Plus, Search, Mail, Phone, MapPin, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientForm } from "@/components/clients/ClientForm";

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { clients, addClient, deleteClient } = useClients();

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.siret && client.siret.includes(searchTerm))
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-foreground tracking-tight">Clients</h1>
            <p className="text-muted-foreground mt-1">Gérez votre base de clients</p>
          </div>
          <Button variant="gradient" size="lg" onClick={() => setIsFormOpen(true)}>
            <Plus size={20} />
            Nouveau client
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Rechercher par nom, email ou SIRET..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="bg-card rounded-2xl border shadow-sm p-12 text-center animate-slide-up">
            <p className="text-muted-foreground">Aucun client trouvé. Ajoutez votre premier client !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients.map((client, index) => (
              <div 
                key={client.id}
                className="bg-card rounded-2xl border shadow-sm p-6 hover:shadow-md transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${100 + index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                      <span className="text-primary-foreground font-bold text-lg">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{client.name}</h3>
                      {client.siret && (
                        <p className="text-xs text-muted-foreground">SIRET: {client.siret}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Modifier</DropdownMenuItem>
                      <DropdownMenuItem>Voir les factures</DropdownMenuItem>
                      <DropdownMenuItem>Voir les devis</DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => deleteClient(client.id)}>
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={16} />
                    <span className="text-sm">{client.email}</span>
                  </div>
                  {client.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={16} />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  )}
                  {(client.address || client.city) && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin size={16} className="mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        {client.address}{client.postalCode && `, ${client.postalCode}`}{client.city && ` ${client.city}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ClientForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={addClient}
      />
    </Layout>
  );
}
