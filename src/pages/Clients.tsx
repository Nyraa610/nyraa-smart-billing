import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { useSupabaseClients, Client } from "@/hooks/useSupabaseClients";
import { Plus, Search, Mail, Phone, MapPin, MoreHorizontal, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientForm } from "@/components/clients/ClientForm";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { clients, loading, addClient, deleteClient } = useSupabaseClients();

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (client.siret && client.siret.includes(searchTerm))
  );

  const handleAddClient = async (client: Omit<Client, 'id' | 'created_at'>) => {
    const result = await addClient(client);
    if (result) {
      toast.success('Client ajouté avec succès');
    }
  };

  const handleDelete = async () => {
    if (deleteId) {
      const success = await deleteClient(deleteId);
      if (success) {
        toast.success('Client supprimé');
      }
      setDeleteId(null);
    }
  };

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
      <div className="space-y-4 md:space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Clients</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">Gérez votre base de clients</p>
          </div>
          <Button className="gradient-primary" size="lg" onClick={() => setIsFormOpen(true)}>
            <Plus size={20} className="mr-2" />
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
          <div className="bg-card rounded-2xl border shadow-sm p-8 md:p-12 text-center animate-slide-up">
            <p className="text-muted-foreground">Aucun client trouvé. Ajoutez votre premier client !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredClients.map((client, index) => (
              <div 
                key={client.id}
                className="bg-card rounded-2xl border shadow-sm p-4 md:p-6 hover:shadow-md transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${100 + index * 50}ms` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
                      <span className="text-primary-foreground font-bold text-base md:text-lg">
                        {client.name.charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-foreground truncate">{client.name}</h3>
                      {client.siret && (
                        <p className="text-xs text-muted-foreground">SIRET: {client.siret}</p>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
                        <MoreHorizontal size={18} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(client.id)}>
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                
                <div className="space-y-2 md:space-y-3">
                  {client.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail size={14} className="flex-shrink-0" />
                      <span className="text-sm truncate">{client.email}</span>
                    </div>
                  )}
                  {client.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone size={14} className="flex-shrink-0" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  )}
                  {(client.address || client.city) && (
                    <div className="flex items-start gap-2 text-muted-foreground">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="text-sm">
                        {client.address}{client.postal_code && `, ${client.postal_code}`}{client.city && ` ${client.city}`}
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
        onSave={handleAddClient}
      />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le client ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le client sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
