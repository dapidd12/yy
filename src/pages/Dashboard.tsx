import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Landmark, 
  Utensils, 
  Briefcase, 
  ShoppingCart, 
  Zap,
  Plus,
  AlertTriangle
} from "lucide-react";
import { getTransactions, getAccounts } from "../lib/sheets";
import { useAuth } from "../lib/AuthContext";

export function Dashboard() {
  const { openAddModal } = useOutletContext<any>();
  const { userProfile } = useAuth();
  const [data, setData] = useState({

    accounts: [] as any[],
    transactions: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [accs, txs] = await Promise.all([
          getAccounts(),
          getTransactions()
        ]);
        setData({ accounts: accs, transactions: txs });
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const totalBalance = data.accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Calculate this month's stats
  const now = new Date();
  const currentMonthTx = data.transactions.filter(tx => {
    const d = new Date(tx.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  const thisMonthIncome = currentMonthTx
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const thisMonthExpense = currentMonthTx
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  function formatIDR(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  // Categories mapping to icons for recent transactions
  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('makan') || cat.includes('food')) return <Utensils size={20} />;
    if (cat.includes('gaji') || cat.includes('work')) return <Briefcase size={20} />;
    if (cat.includes('belanja') || cat.includes('shop')) return <ShoppingCart size={20} />;
    if (cat.includes('listrik') || cat.includes('util')) return <Zap size={20} />;
    return <Landmark size={20} />;
  };

  const getAccountName = (id: string) => {
    const acc = data.accounts.find(a => a.id === id);
    return acc ? acc.name : 'Unknown';
  };

  const monthlyTarget = userProfile?.settings?.monthlyTarget || 0;
  const expensePercentage = monthlyTarget > 0 ? Math.min(Math.round((thisMonthExpense / monthlyTarget) * 100), 100) : 0;
  const isOverBudget = monthlyTarget > 0 && thisMonthExpense > monthlyTarget;

  if (loading) {
    return (
      <div className="p-gutter max-w-container-max mx-auto flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-on-surface"></div>
      </div>
    );
  }

  const recentTxs = [...data.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <main className="p-gutter max-w-container-max mx-auto">
      {/* Dashboard Header */}
      <div className="mb-10">
        <h2 className="font-headline-lg text-headline-lg mb-2">Ringkasan Keuangan</h2>
        <p className="text-on-surface-variant font-body-lg text-body-lg">
          Pantau arus kas dan tabunganmu secara real-time dari Google Sheets.
        </p>
      </div>

      {/* Bento Grid Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Saldo */}
        <div className="bg-primary-container border-4 border-on-surface p-6 flex flex-col justify-between h-48 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          <div>
            <p className="font-label-bold text-label-bold uppercase text-on-primary-container">
              Total Saldo Saat Ini
            </p>
            <h3 className="font-headline-lg text-headline-lg mt-2">{formatIDR(totalBalance)}</h3>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-label-bold px-2 py-1 bg-on-surface text-white">
              AKTIF
            </span>
            <Landmark size={24} />
          </div>
        </div>

        {/* Total Pemasukan */}
        <div className="bg-tertiary-container border-4 border-on-surface p-6 flex flex-col justify-between h-48 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          <div>
            <p className="font-label-bold text-label-bold uppercase text-on-tertiary-container">
              Pemasukan Bulan Ini
            </p>
            <h3 className="font-headline-lg text-headline-lg mt-2">{formatIDR(thisMonthIncome)}</h3>
          </div>
          <div className="flex items-center text-on-tertiary-container">
            <TrendingUp size={20} className="mr-1" />
            <span className="font-label-bold text-label-bold">Bulan Ini</span>
          </div>
        </div>

        {/* Total Pengeluaran */}
        <div className="bg-error-container border-4 border-on-surface p-6 flex flex-col justify-between h-48 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          <div>
            <p className="font-label-bold text-label-bold uppercase text-on-error-container">
              Pengeluaran Bulan Ini
            </p>
            <h3 className="font-headline-lg text-headline-lg mt-2 text-error">{formatIDR(thisMonthExpense)}</h3>
          </div>
          <div className="flex items-center text-error">
            <TrendingDown size={20} className="mr-1" />
            <span className="font-label-bold text-label-bold">Bulan Ini</span>
          </div>
        </div>

        {/* Target Pengeluaran */}
        <div className="bg-secondary-container border-4 border-on-surface p-6 flex flex-col justify-between h-48 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
          {monthlyTarget > 0 ? (
            <>
              <div>
                <p className="font-label-bold text-label-bold uppercase text-on-secondary-container">
                  Sisa Budget Bulan Ini
                </p>
                <div className="mt-4 w-full h-4 border-2 border-on-surface bg-white relative">
                  <div
                    className={`h-full border-r-2 border-on-surface ${isOverBudget ? 'bg-error' : 'bg-secondary'}`}
                    style={{ width: `${expensePercentage}%` }}
                  ></div>
                </div>
                {isOverBudget ? (
                   <p className="font-label-bold text-label-bold mt-2 text-error flex items-center gap-1"><AlertTriangle size={16}/> Overbudget!</p>
                ) : (
                   <p className="font-label-bold text-label-bold mt-2">{expensePercentage}% Terpakai</p>
                )}
              </div>
              <div className="flex justify-between items-center text-on-secondary-container">
                <span className="font-label-bold text-label-bold">{formatIDR(thisMonthExpense)} / {formatIDR(monthlyTarget)}</span>
                <PiggyBank size={24} />
              </div>
            </>
          ) : (
             <div className="flex flex-col items-center justify-center h-full text-center">
               <PiggyBank size={32} className="mb-2 text-on-surface-variant" />
               <p className="font-label-bold text-sm uppercase text-on-surface-variant mb-2">Belum Ada Target</p>
               <a href="/settings" className="text-xs font-label-bold underline">Atur di Pengaturan</a>
             </div>
          )}
        </div>
      </div>

      {/* Content Grid: Recent Transactions & Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Transactions List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-end">
            <h3 className="font-headline-md text-headline-md">Transaksi Terakhir</h3>
            <a href="/recap" className="text-on-surface-variant font-label-bold text-label-bold underline">
              Lihat Semua
            </a>
          </div>

          <div className="bg-white border-4 border-on-surface shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
            <div className="divide-y-4 divide-on-surface">
              {recentTxs.length === 0 && (
                <div className="p-8 text-center text-on-surface-variant">
                  <p>Belum ada transaksi. Silakan tambah transaksi baru.</p>
                </div>
              )}
              {recentTxs.map(tx => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-surface-variant transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 border-4 border-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-tertiary-container flex items-center justify-center">
                      {getCategoryIcon(tx.category)}
                    </div>
                    <div>
                      <p className="font-label-bold text-label-bold">{tx.description || tx.category}</p>
                      <p className="text-sm text-on-surface-variant">{new Date(tx.date).toLocaleDateString('id-ID')} • {tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-label-bold text-label-bold ${tx.type === 'expense' ? 'text-error' : 'text-tertiary'}`}>
                      {tx.type === 'expense' ? '-' : '+'} {formatIDR(tx.amount)}
                    </p>
                    <p className="text-xs font-label-bold uppercase bg-surface-variant px-1 mt-1 inline-block">{getAccountName(tx.accountId)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Asymmetric Visualization/Insight Section */}
        <div className="space-y-6">
          <h3 className="font-headline-md text-headline-md">Analisis Pengeluaran</h3>
          
          <div className="bg-white border-4 border-on-surface shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 aspect-square relative flex flex-col justify-center items-center">
            <div className="relative w-48 h-48 border-4 border-on-surface rounded-full flex items-center justify-center overflow-hidden bg-white">
               {thisMonthExpense > 0 ? (
                 <>
                   <div 
                    className="absolute inset-0 bg-primary-container" 
                    style={{ clipPath: "polygon(50% 50%, 100% 0, 100% 100%, 0 100%)" }}
                   ></div>
                   <div 
                    className="absolute inset-0 bg-error-container" 
                    style={{ clipPath: "polygon(50% 50%, 0 0, 100% 0, 100% 0)" }}
                   ></div>
                 </>
               ) : (
                 <div className="absolute inset-0 bg-surface-variant"></div>
               )}
              
              <div className="z-10 bg-white border-4 border-on-surface rounded-full w-24 h-24 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <span className="font-headline-md text-headline-md text-center text-sm px-1">Chart</span>
              </div>
            </div>

            <div className="mt-8 space-y-2 w-full text-center">
              <p className="font-label-sm text-on-surface-variant">Chart data depends on your real transactions.</p>
            </div>
          </div>

          {/* Motivational Card */}
          <div className="bg-on-surface border-4 border-on-surface shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-white p-6">
            <span className="text-4xl">🏆</span>
            <h4 className="font-headline-md text-headline-md mt-4 mb-2">Terus Berusaha!</h4>
            <p className="font-body-md text-body-md opacity-80">
              Pantau aset dan transaksimu untuk mencapai tujuan kebebasan finansial.
            </p>
          </div>
        </div>
      </div>

      {/* Floating Action Button for Adding Data later */}
      <button 
        onClick={openAddModal}
        className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 w-16 h-16 bg-primary-container border-4 border-on-surface shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all z-50 group hover:bg-primary-container/90"
      >
        <Plus size={32} className="group-hover:rotate-90 transition-transform duration-300" strokeWidth={3} />
      </button>
    </main>
  );
}
