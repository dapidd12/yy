import { useEffect, useState } from "react";
import { 
  Landmark, 
  Smartphone, 
  Banknote,
  LayoutGrid,
  Edit2,
  Trash2,
  Plus
} from "lucide-react";
import { getAccounts, addAccount, deleteAccount } from "../lib/sheets";
import { useAuth } from "../lib/AuthContext";

export function Accounts() {
  const { requireAuth } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const accs = await getAccounts();
        setAccounts(accs);
      } catch(e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalAssets = accounts.reduce((sum, a) => sum + a.balance, 0);
  const totalCash = accounts.filter(a => a.type === 'cash').reduce((sum, a) => sum + a.balance, 0);
  const totalEwallet = accounts.filter(a => a.type === 'ewallet').reduce((sum, a) => sum + a.balance, 0);
  const totalBank = accounts.filter(a => a.type === 'bank').reduce((sum, a) => sum + a.balance, 0);

  function formatIDR(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  const handleDelete = (id: string) => {
    requireAuth(async () => {
      if(!window.confirm("Hapus rekening ini?")) return;
      try {
        await deleteAccount(id);
        setAccounts(accounts.filter(a => a.id !== id));
      } catch(e) {
        console.error(e);
      }
    });
  };

  const handleAddDemoAccount = () => {
    requireAuth(async () => {
      const id = Date.now().toString();
      const newAcc = { 
        id, 
        name: "Dompet Utama " + Math.floor(Math.random() * 100), 
        type: 'cash', 
        balance: Math.floor(Math.random() * 500000) 
      };
      try {
        await addAccount(newAcc);
        setAccounts([...accounts, newAcc]);
      } catch (e) {
        console.error(e);
      }
    });
  };

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-on-surface"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 pb-24 lg:pb-8">
      {/* TopAppBar included within Layout, but page title block here */}
      <div className="w-full border-b-4 border-on-surface shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-background flex justify-between items-center px-gutter py-4 px-4 sticky top-0 z-30 lg:z-10">
        <h2 className="font-headline-md text-headline-md text-on-surface">Daftar Rekening</h2>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleAddDemoAccount}
            className="hidden md:flex bg-primary text-on-primary border-4 border-on-surface px-6 py-2 font-label-bold text-label-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all hover:bg-primary/90"
          >
            Tambah Rekening
          </button>
        </div>
      </div>

      <div className="p-gutter max-w-container-max mx-auto px-4 mt-8">
        {/* Asset Overview Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Seluruh Aset */}
          <div className="bg-primary-container border-4 border-on-surface p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <WalletIcon size={120} strokeWidth={1} />
            </div>
            <p className="font-label-bold text-label-bold uppercase text-on-primary-container/80 mb-2">
              Total Seluruh Aset
            </p>
            <h3 className="font-display-lg text-3xl font-black text-on-surface">
              {formatIDR(totalAssets)}
            </h3>
          </div>

          {/* Total Cash */}
          <div className="bg-surface border-4 border-on-surface p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
            <p className="font-label-bold text-label-bold uppercase text-on-surface-variant mb-2">Total Cash</p>
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">{formatIDR(totalCash)}</h3>
            <div className="mt-4 flex items-center justify-between border-t-2 border-on-surface/20 pt-4">
              <span className="px-2 py-1 bg-tertiary-container text-on-tertiary-container border-2 border-on-surface font-label-sm text-label-sm">Liquid</span>
              <Banknote className="text-on-surface-variant" size={24} />
            </div>
          </div>

          {/* Total E-Wallet */}
          <div className="bg-surface border-4 border-on-surface p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
            <p className="font-label-bold text-label-bold uppercase text-on-surface-variant mb-2">Total E-Wallet</p>
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">{formatIDR(totalEwallet)}</h3>
            <div className="mt-4 flex items-center justify-between border-t-2 border-on-surface/20 pt-4">
              <span className="px-2 py-1 bg-secondary-container text-on-secondary-container border-2 border-on-surface font-label-sm text-label-sm">Digital</span>
              <Smartphone className="text-on-surface-variant" size={24} />
            </div>
          </div>

          {/* Total Bank */}
          <div className="bg-surface border-4 border-on-surface p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
            <p className="font-label-bold text-label-bold uppercase text-on-surface-variant mb-2">Total Bank</p>
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface">{formatIDR(totalBank)}</h3>
            <div className="mt-4 flex items-center justify-between border-t-2 border-on-surface/20 pt-4">
              <span className="px-2 py-1 bg-outline-variant text-on-surface-variant border-2 border-on-surface font-label-sm text-label-sm">Savings</span>
              <Landmark className="text-on-surface-variant" size={24} />
            </div>
          </div>
        </section>

        {/* Account Grid Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-headline-md text-headline-md flex items-center gap-3">
            <span className="p-2 bg-on-surface text-background flex items-center justify-center">
              <LayoutGrid size={24} />
            </span>
            Daftar Akun
          </h3>
        </div>

        {/* Grid of Account Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {accounts.map(acc => (
            <div key={acc.id} className="bg-[#FFF9F2] border-4 border-on-surface shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative flex flex-col">
              <div className="bg-secondary p-4 border-b-4 border-on-surface flex justify-between items-center text-on-secondary">
                <span className="font-label-bold text-label-bold uppercase">{acc.name}</span>
                {acc.type === 'bank' ? <Landmark size={20} /> : acc.type === 'ewallet' ? <Smartphone size={20} /> : <Banknote size={20} />}
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant mb-1">Saldo Tersedia</p>
                  <h4 className="font-headline-lg text-2xl font-bold mb-6">{formatIDR(acc.balance)}</h4>
                </div>
                <div className="flex justify-between items-end border-t-2 border-on-surface/20 pt-4 mt-auto">
                  <div className="font-label-sm text-label-sm">
                    <p className="text-on-surface-variant">Tipe</p>
                    <p className="font-bold uppercase">{acc.type}</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleDelete(acc.id)}
                      className="w-10 h-10 border-2 border-on-surface flex items-center justify-center hover:bg-error-container text-error transition-colors active:translate-y-1"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add New Account Placeholder Card */}
          <button 
            onClick={handleAddDemoAccount}
            className="border-4 border-dashed border-on-surface-variant bg-surface-container-low p-6 flex flex-col items-center justify-center gap-4 group hover:bg-surface-variant transition-colors active:scale-[0.98] min-h-[200px]"
          >
            <div className="w-16 h-16 rounded-full border-4 border-on-surface flex items-center justify-center bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-primary-container transition-all">
              <Plus size={32} strokeWidth={3} />
            </div>
            <p className="font-label-bold text-label-bold uppercase">Tambah Rekening Baru</p>
          </button>
        </div>
      </div>
    </main>
  );
}

const WalletIcon = ({ size, ...props }:any) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
    <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
    <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
  </svg>
)
