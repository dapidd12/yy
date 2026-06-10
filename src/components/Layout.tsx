import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { 
  Receipt, 
  Wallet, 
  PieChart, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Bell, 
  User 
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../lib/AuthContext";
import { AddTransactionModal } from "./AddTransactionModal";

const navItems = [
  { path: "/", label: "Transaksi", icon: Receipt },
  { path: "/accounts", label: "Rekening", icon: Wallet },
  { path: "/recap", label: "Rekap", icon: PieChart },
  { path: "/settings", label: "Pengaturan", icon: Settings },
];

export function Layout() {
  const { user, userProfile, logout, requireAuth, login } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAdded = () => {
    window.location.reload();
  };

  const handleOpenAddModal = () => {
    requireAuth(() => setIsModalOpen(true));
  };

  return (
    <div className="font-body-md text-on-background bg-background min-h-screen flex">
      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex flex-col h-screen p-base fixed left-0 top-0 overflow-y-auto border-r-4 border-on-surface w-64 bg-surface-container z-40">
        <div className="mb-10 px-2 mt-4">
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-black uppercase tracking-tighter">
            MONEYMIND
          </h1>
        </div>
        
        <div className="mb-8 px-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 border-2 border-on-surface rounded-full overflow-hidden bg-primary-container flex items-center justify-center">
              <User className="text-on-primary-container" size={20} />
            </div>
            <div>
              <p className="font-label-bold text-label-bold">{user ? userProfile?.username || user.displayName || "Halo, User" : "Halo, Guest"}</p>
              <p className="text-xs text-on-surface-variant">{user ? "Kelola uangmu hari ini" : "Mode Preview"}</p>
            </div>
          </div>
          <button 
            onClick={handleOpenAddModal}
            className="w-full bg-primary-container border-4 border-on-surface p-3 font-label-bold text-label-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-primary-container/90 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all mt-4 text-on-primary-container"
          >
            + Transaksi Baru
          </button>
        </div>

        <nav className="flex-grow space-y-2 px-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-4 mb-2 p-3 transition-all",
                  isActive
                    ? "bg-primary text-on-primary border-4 border-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                    : "text-on-surface-variant hover:text-on-surface border-2 border-transparent hover:border-on-surface hover:bg-surface-variant"
                )
              }
            >
              <item.icon size={24} strokeWidth={2} />
              <span className="font-label-bold text-label-bold">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-6 border-t-2 border-on-surface/20 px-2 pb-4">
          <button className="w-full flex items-center gap-4 text-on-surface-variant hover:text-on-surface p-3 transition-all">
            <HelpCircle size={24} />
            <span className="font-label-bold text-label-bold">Bantuan</span>
          </button>
          <button onClick={user ? logout : login} className={cn("w-full flex items-center gap-4 p-3 transition-all", user ? "text-error hover:bg-error-container" : "text-primary hover:bg-primary-container")}>
            {user ? <LogOut size={24} /> : <User size={24} />}
            <span className="font-label-bold text-label-bold">{user ? "Keluar" : "Login"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <header className="lg:hidden flex justify-between items-center w-full px-gutter py-4 bg-background border-b-4 border-on-surface sticky top-0 z-40">
          <h1 className="font-display-lg text-headline-md text-on-background uppercase tracking-tighter">
            MONEYMIND
          </h1>
          <div className="flex gap-2">
            <button className="p-2 border-2 border-on-surface bg-white neobrutal-active-sm neobrutal-shadow-xs">
              <Bell size={20} />
            </button>
            <button onClick={user ? logout : login} className={cn("p-2 border-2 border-on-surface bg-white neobrutal-active-sm neobrutal-shadow-xs", user ? "text-error" : "text-primary")}>
              {user ? <LogOut size={20} /> : <User size={20} />}
            </button>
          </div>
        </header>

        {/* Outlet for Pages */}
        <div className="flex-1 pb-24 lg:pb-0 relative">
          <Outlet context={{ openAddModal: handleOpenAddModal }} />
        </div>

        {/* Bottom Navigation Mobile */}
        <nav className="lg:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 py-2 bg-background border-t-4 border-on-surface shadow-[0px_-4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center p-2 transition-all active:scale-95",
                  isActive
                    ? "bg-primary-container text-on-primary-container border-2 border-on-surface rounded-xl shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "text-on-surface-variant hover:bg-surface-variant"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  <span className="font-label-sm text-[10px] mt-1">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdded={handleAdded} 
      />
    </div>
  );
}
