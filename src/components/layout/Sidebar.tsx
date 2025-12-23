import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  FileText, 
  FileCheck, 
  Calculator, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const menuItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", path: "/" },
  { icon: FileText, label: "Factures", path: "/invoices" },
  { icon: FileCheck, label: "Devis", path: "/quotes" },
  { icon: Calculator, label: "Comptabilité", path: "/accounting" },
  { icon: Users, label: "Clients", path: "/clients" },
  { icon: Settings, label: "Paramètres", path: "/settings" },
];

export function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside 
      className={cn(
        "gradient-sidebar h-screen flex flex-col transition-all duration-300 relative",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
          <span className="text-primary-foreground font-bold text-lg">N</span>
        </div>
        {!collapsed && (
          <div className="animate-fade-in">
            <h1 className="text-sidebar-foreground font-bold text-lg tracking-tight">Nyraa Digital</h1>
            <p className="text-sidebar-foreground/60 text-xs">Gestion & Facturation</p>
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-8 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-md hover:shadow-glow transition-shadow"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-sidebar-accent text-sidebar-foreground" 
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon 
                    size={20} 
                    className={cn(
                      "transition-colors",
                      isActive ? "text-primary" : "group-hover:text-primary"
                    )} 
                  />
                  {!collapsed && (
                    <span className="font-medium text-sm animate-fade-in">{item.label}</span>
                  )}
                  {isActive && !collapsed && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-scale-in" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="p-4 mx-3 mb-4 rounded-xl bg-sidebar-accent/50 animate-fade-in">
          <p className="text-sidebar-foreground/80 text-xs">
            © 2024 Nyraa Digital
          </p>
        </div>
      )}
    </aside>
  );
}
