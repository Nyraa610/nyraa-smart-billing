import { Home, Users, FileText, Calculator, Settings, LogOut, Menu, X, Receipt } from "lucide-react";
import logoNyraa from "@/assets/logo-nyraa.png";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

const navigation = [
  { name: "Tableau de bord", href: "/", icon: Home },
  { name: "Clients", href: "/clients", icon: Users },
  { name: "Factures", href: "/invoices", icon: FileText },
  { name: "Devis", href: "/quotes", icon: Receipt },
  { name: "Comptabilité", href: "/accounting", icon: Calculator },
  { name: "Paramètres", href: "/settings", icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const { signOut, user } = useAuth();

  const handleLogout = async () => {
    await signOut();
    if (onClose) onClose();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <img src={logoNyraa} alt="Nyraa Digital" className="w-12 h-12 object-contain rounded-xl" />
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">
              Nyraa <span className="text-gradient">Digital</span>
            </h1>
            <p className="text-xs text-muted-foreground">Gestion & Facturation</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200 group"
            activeClassName="bg-sidebar-accent text-sidebar-foreground shadow-glow-sm"
          >
            <item.icon size={20} className="group-hover:text-primary transition-colors" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-sidebar-border space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-lg bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {user?.email?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          Déconnexion
        </Button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src={logoNyraa} alt="Nyraa Digital" className="w-8 h-8 object-contain rounded-lg" />
            <span className="font-bold text-foreground">Nyraa</span>
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-foreground">
                {open ? <X size={24} /> : <Menu size={24} />}
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 gradient-sidebar border-sidebar-border">
              <SidebarContent onClose={() => setOpen(false)} />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex gradient-sidebar h-screen w-64 flex-col border-r border-sidebar-border">
        <SidebarContent />
      </aside>
    </>
  );
}
