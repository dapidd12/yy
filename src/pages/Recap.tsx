import { useEffect, useState } from "react";
import { 
  Calendar, 
  Filter, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  FileDown,
  Table as TableIcon,
  Printer
} from "lucide-react";
import { getTransactions } from "../lib/sheets";
import { useAuth } from "../lib/AuthContext";

export function Recap() {
  const { user, requireAuth } = useAuth();
  const [data, setData] = useState({
    transactions: [] as any[]
  });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      if (!user) {
        setData({ transactions: [] });
        setLoading(false);
        return;
      }
      setLoading(true);
      setErrorMsg(null);
      try {
        const txs = await getTransactions();
        setData({ transactions: txs });
      } catch(e: any) {
        console.error(e);
        setErrorMsg("Gagal memuat rekap. Error: " + e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  if (loading) {
    return (
      <div className="flex-1 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-on-surface"></div>
      </div>
    );
  }

  const { transactions } = data;
  
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s,t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s,t) => s + t.amount, 0);

  function formatIDR(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  }

  const expensesByCategory = transactions.filter(t => t.type === 'expense').reduce((acc: any, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});

  return (
    <main className="p-gutter max-w-container-max mx-auto">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 mt-8">
        <div>
          <p className="font-label-bold text-label-bold text-primary uppercase mb-1">Financial Analysis</p>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Laporan Rekapitulasi</h2>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-surface border-4 border-on-surface p-2 px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] grow md:grow-0">
            <Calendar size={20} className="text-on-surface-variant" />
            <span className="font-label-bold text-label-bold">Sepanjang Waktu</span>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <button 
              onClick={() => requireAuth(() => alert("Excel berhasil diekspor"))}
              className="bg-primary-container border-4 border-on-surface px-4 py-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all font-label-bold text-label-bold flex items-center justify-center gap-2 flex-1 md:flex-none"
            >
              <Download size={20} /> Ekspor
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats Bento */}
      {errorMsg && (
        <div className="bg-error-container text-on-error-container p-4 mb-4 border-4 border-error shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <p className="font-label-bold">{errorMsg}</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-surface-container-low border-4 border-on-surface p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
          <div className="relative z-10">
            <p className="font-label-bold text-label-bold text-on-surface-variant mb-2">Total Pemasukan</p>
            <p className="font-headline-lg text-headline-lg mt-2">{formatIDR(totalIncome)}</p>
            <div className="mt-4 flex items-center gap-1 text-tertiary">
              <TrendingUp size={16} />
              <span className="font-label-sm text-[12px]">Pemasukan Aktif</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-low border-4 border-on-surface p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
          <div className="relative z-10">
            <p className="font-label-bold text-label-bold text-on-surface-variant mb-2">Total Pengeluaran</p>
            <p className="font-headline-lg text-headline-lg mt-2 text-error">{formatIDR(totalExpense)}</p>
            <div className="mt-4 flex items-center gap-1 text-error">
              <TrendingDown size={16} />
              <span className="font-label-sm text-[12px]">Pengeluaran Aktif</span>
            </div>
          </div>
        </div>

        <div className="bg-tertiary-container border-4 border-on-surface p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
          <div className="relative z-10">
            <p className="font-label-bold text-label-bold text-on-tertiary-container mb-2">Tabungan (Net)</p>
            <p className="font-headline-lg text-headline-lg text-on-tertiary-container mt-2">{formatIDR(totalIncome - totalExpense)}</p>
            <div className="mt-4 w-full bg-white/30 h-3 border-2 border-on-surface rounded-full overflow-hidden">
              <div className="bg-tertiary h-full w-[100%]"></div>
            </div>
          </div>
        </div>

        <div className="bg-secondary-container border-4 border-on-surface p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
          <div className="relative z-10">
            <p className="font-label-bold text-label-bold text-on-secondary-container mb-2">Target Harian</p>
            <p className="font-headline-lg text-headline-lg text-on-secondary-container mt-2">Rp 270.000</p>
            <div className="mt-4 flex items-center gap-1">
              <PiggyBank size={16} className="text-on-secondary-container" />
              <span className="font-label-sm text-[12px] text-on-secondary-container">Target: &lt; Rp 300k</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        
        {/* Pie Chart: Distribution */}
        <div className="bg-white border-4 border-on-surface shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="border-b-4 border-on-surface p-4 bg-surface-container-highest">
            <h3 className="font-label-bold text-label-bold uppercase">Distribusi Pengeluaran</h3>
          </div>
          <div className="p-6">
            <div className="relative w-48 h-48 mx-auto mb-8">
              <div className="absolute inset-0 rounded-full border-8 border-on-surface bg-primary" style={{clipPath: "polygon(50% 50%, 50% 0, 100% 0, 100% 100%, 0 100%, 0 40%)"}}></div>
              <div className="absolute inset-0 rounded-full border-8 border-on-surface bg-secondary" style={{clipPath: "polygon(50% 50%, 0 40%, 0 0, 50% 0)"}}></div>
              <div className="absolute inset-0 rounded-full border-4 border-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                 <span className="font-headline-md">Overview</span>
              </div>
            </div>
            <div className="space-y-4 pt-2">
              {Object.keys(expensesByCategory).length === 0 && (
                <p className="text-center text-on-surface-variant font-label-bold">Belum ada pengeluaran</p>
              )}
              {Object.entries(expensesByCategory).sort((a:any, b:any) => b[1] - a[1]).map((entry: any, index) => {
                const percentage = totalExpense > 0 ? (entry[1] / totalExpense * 100).toFixed(0) : 0;
                return (
                  <div key={entry[0]} className="flex justify-between items-center border-b-2 border-on-surface/10 pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary border-2 border-on-surface"></div>
                      <span className="font-body-md text-body-md">{entry[0]}</span>
                    </div>
                    <span className="font-label-bold text-label-bold">{percentage}% ({formatIDR(entry[1])})</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Transaction Table */}
        <div className="bg-white border-4 border-on-surface shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col">
          <div className="border-b-4 border-on-surface p-4 bg-surface-container-highest flex justify-between items-center">
            <h3 className="font-label-bold text-label-bold uppercase">Riwayat Lengkap</h3>
          </div>
          <div className="p-4 flex-1 overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[400px]">
                <thead>
                  <tr className="bg-surface-variant border-b-4 border-on-surface">
                    <th className="p-4 font-label-bold text-label-bold uppercase">Tgl</th>
                    <th className="p-4 font-label-bold text-label-bold uppercase">Deskripsi</th>
                    <th className="p-4 font-label-bold text-label-bold uppercase text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-on-surface/20">
                  {transactions.slice(0).reverse().map(tx => (
                    <tr key={tx.id} className="hover:bg-[#FFF9F2] transition-colors">
                      <td className="p-4 font-body-sm text-on-surface-variant">{new Date(tx.date).toLocaleDateString('id-ID')}</td>
                      <td className="p-4 font-label-bold text-label-bold">{tx.description || tx.category}</td>
                      <td className={`p-4 font-label-bold text-label-bold text-right whitespace-nowrap ${tx.type === 'expense' ? 'text-error' : 'text-tertiary'}`}>
                        {tx.type === 'expense' ? '-' : '+'} {formatIDR(tx.amount)}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center p-8 font-label-bold text-on-surface-variant">Tidak ada data transaksi.</td>
                    </tr>
                  )}
                </tbody>
              </table>
          </div>
        </div>

      </div>

      {/* Action Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-surface-container-highest border-4 border-on-surface p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <p className="font-label-bold text-label-bold">Ready to take action?</p>
        <div className="flex flex-wrap justify-center gap-4">
          <button 
            onClick={() => requireAuth(() => alert("PDF berhasil di-download"))}
            className="bg-white border-2 border-on-surface px-6 py-3 font-label-bold text-label-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
          >
            <FileDown size={20} /> PDF
          </button>
          <button 
            onClick={() => requireAuth(() => alert("Excel berhasil diekspor"))}
            className="bg-white border-2 border-on-surface px-6 py-3 font-label-bold text-label-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
          >
            <TableIcon size={20} /> Excel
          </button>
          <button 
            onClick={() => requireAuth(() => window.print())}
            className="bg-white border-2 border-on-surface px-6 py-3 font-label-bold text-label-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all"
          >
            <Printer size={20} /> Cetak
          </button>
        </div>
      </div>
    </main>
  );
}
