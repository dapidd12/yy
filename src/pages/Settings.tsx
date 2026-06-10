import { useState } from "react";
import { 
  Globe, 
  Database, 
  Download, 
  Upload, 
  FileText, 
  Info, 
  BadgeCheck, 
  Bot, 
  AlertTriangle,
  AlertOctagon
} from "lucide-react";
import { deleteTransactions, resetAccounts } from "../lib/sheets";
import { useAuth } from "../lib/AuthContext";

export function Settings() {
  const { requireAuth } = useAuth();
  const [modalType, setModalType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExecuteDanger = async () => {
    setLoading(true);
    try {
      if (modalType === 'transactions') {
        await deleteTransactions();
        alert("Semua transaksi berhasil dihapus.");
      } else if (modalType === 'accounts') {
        await resetAccounts();
        alert("Semua rekening berhasil direset.");
      } else if (modalType === 'everything') {
        await deleteTransactions();
        await resetAccounts();
        alert("Semua data berhasil direset.");
      }
    } catch(e) {
      console.error(e);
      alert("Gagal menghapus data.");
    } finally {
      setLoading(false);
      setModalType(null);
      window.location.reload();
    }
  };

  const renderModal = () => {
    if (!modalType) return null;

    let title, desc;
    if(modalType === 'transactions') {
        title = "Hapus Transaksi";
        desc = "Ini akan menghapus seluruh riwayat transaksi pengeluaran dan pemasukan Anda dari Google Sheets.";
    } else if (modalType === 'accounts') {
        title = "Reset Rekening";
        desc = "Saldo dan daftar rekening Anda akan dikembalikan ke pengaturan awal di Google Sheets (kosong).";
    } else if (modalType === 'everything') {
        title = "RESET TOTAL";
        desc = "SEMUA DATA termasuk transaksi dan rekening akan dihapus permanen dari Google Sheets.";
    }

    return (
      <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setModalType(null)}>
        <div 
          className="bg-surface border-4 border-on-surface w-full max-w-md p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col scale-100 transition-transform duration-200" 
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-error text-white p-3 border-4 border-on-surface shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <AlertOctagon size={36} />
            </div>
            <div>
              <h4 className="font-headline-md text-headline-md uppercase leading-none">{title}</h4>
              <p className="font-label-sm text-[12px] text-error mt-1 uppercase font-black">Tindakan Irreversible!</p>
            </div>
          </div>
          <p className="font-body-md text-body-md mb-8">
            {desc} Semua informasi yang dihapus tidak akan bisa dikembalikan lagi melalui aplikasi ini.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              disabled={loading}
              className="flex-1 font-label-bold uppercase py-4 border-4 border-on-surface bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] md:hover:translate-x-1 md:hover:translate-y-1 active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50" 
              onClick={() => setModalType(null)}
            >
              Batal
            </button>
            <button 
              disabled={loading}
              className="flex-1 font-label-bold uppercase py-4 border-4 border-on-surface bg-error text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] md:hover:translate-x-1 md:hover:translate-y-1 active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50"
              onClick={handleExecuteDanger}
            >
              {loading ? "Menghapus..." : "Ya, Hapus"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="max-w-4xl mx-auto px-4 md:px-margin-desktop py-8 md:py-12">
      <header className="mb-12 mt-8 lg:mt-0">
        <h2 className="font-display-lg text-display-lg mb-2">Pengaturan</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant">Konfigurasi akun dan preferensi aplikasi Anda secara detail.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        {/* Section: General */}
        <section className="flex flex-col gap-4 border-4 border-on-surface bg-surface-container-low p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-primary-container p-2 border-2 border-on-surface">
              <Globe size={24} />
            </span>
            <h3 className="font-headline-md text-headline-md uppercase">General</h3>
          </div>
          <p className="font-body-md text-body-md mb-4 flex-1">Ubah preferensi bahasa aplikasi sesuai kenyamanan Anda.</p>
          <div className="space-y-4">
            <label className="block">
              <span className="font-label-bold text-label-bold block mb-2 uppercase">Pilih Bahasa</span>
              <select className="w-full bg-white border-4 border-on-surface p-3 font-body-md focus:ring-0 focus:border-primary-container shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all outline-none">
                <option value="id">Bahasa Indonesia (ID)</option>
                <option value="en">English (EN)</option>
              </select>
            </label>
            <div className="flex items-center justify-between p-3 border-2 border-on-surface bg-white">
              <span className="font-label-bold text-label-bold uppercase">Mata Uang</span>
              <span className="font-label-sm text-[12px] bg-secondary-container px-2 py-1 border-2 border-on-surface">IDR (Rp)</span>
            </div>
          </div>
        </section>

        {/* Section: Data */}
        <section className="flex flex-col gap-4 border-4 border-on-surface bg-surface-container-low p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] h-full">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-tertiary-container p-2 border-2 border-on-surface">
              <Database size={24} />
            </span>
            <h3 className="font-headline-md text-headline-md uppercase">Data</h3>
          </div>
          <p className="font-body-md text-body-md mb-4 flex-1">Amankan data transaksi Anda dengan backup rutin.</p>
          <div className="flex flex-col gap-3">
            <button 
              onClick={() => requireAuth(() => alert("Backup di-download"))}
              className="w-full bg-white border-4 border-on-surface p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-surface-variant active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-label-bold uppercase"
            >
              <span>Download Backup</span>
              <Download size={24} />
            </button>
            <button 
              onClick={() => requireAuth(() => alert("Fitur impor segera hadir"))}
              className="w-full bg-white border-4 border-on-surface p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-surface-variant active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-label-bold uppercase"
            >
              <span>Import Data (.CSV)</span>
              <Upload size={24} />
            </button>
            <button 
              onClick={() => requireAuth(() => alert("Export PDF berhasil"))}
              className="w-full bg-white border-4 border-on-surface p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-surface-variant active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-label-bold uppercase"
            >
              <span>Export Recap (.PDF)</span>
              <FileText size={24} />
            </button>
          </div>
        </section>

        {/* Section: App Info */}
        <section className="md:col-span-2 flex flex-col gap-4 border-4 border-on-surface bg-secondary-fixed-dim p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative">
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <span className="bg-white p-2 border-2 border-on-surface">
              <Info size={24} />
            </span>
            <h3 className="font-headline-md text-headline-md uppercase">App Info</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10 pt-2">
            <div className="bg-white border-4 border-on-surface p-4">
              <p className="font-label-sm text-[12px] uppercase text-on-surface-variant mb-1">Versi Aplikasi</p>
              <p className="font-headline-md text-xl font-bold">v2.4.0-build</p>
            </div>
            <div className="bg-white border-4 border-on-surface p-4">
              <p className="font-label-sm text-[12px] uppercase text-on-surface-variant mb-1">Developer</p>
              <p className="font-headline-md text-xl font-bold">MindLabs Studio</p>
            </div>
            <div className="bg-white border-4 border-on-surface p-4 flex items-center justify-between">
              <div>
                <p className="font-label-sm text-[12px] uppercase text-on-surface-variant mb-1">Status Lisensi</p>
                <p className="font-headline-md text-xl font-bold text-primary">PRO PLAN</p>
              </div>
              <BadgeCheck size={36} className="text-primary" fill="currentColor" color="white" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-4 opacity-10 pointer-events-none">
            <Bot size={160} />
          </div>
        </section>

        {/* Section: Danger Zone */}
        <section className="md:col-span-2 flex flex-col gap-4 border-4 border-on-surface bg-error p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-white text-error p-2 border-2 border-on-surface">
              <AlertTriangle size={24} />
            </span>
            <h3 className="font-headline-md text-headline-md uppercase text-white">Danger Zone</h3>
          </div>
          <p className="font-body-md text-body-md text-white/90 mb-4 font-bold">
            Tindakan di bawah ini bersifat permanen dan tidak dapat dibatalkan. Berhati-hatilah.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              className="bg-white border-4 border-on-surface p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
              onClick={() => requireAuth(() => setModalType('transactions'))}
            >
              <p className="font-label-bold text-[12px] md:text-[14px] uppercase text-on-surface text-center">Hapus Semua Transaksi</p>
            </button>
            <button 
              className="bg-white border-4 border-on-surface p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
              onClick={() => requireAuth(() => setModalType('accounts'))}
            >
              <p className="font-label-bold text-[12px] md:text-[14px] uppercase text-on-surface text-center">Reset Rekening</p>
            </button>
            <button 
              className="bg-white border-4 border-on-surface p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
              onClick={() => requireAuth(() => setModalType('everything'))}
            >
              <p className="font-label-bold text-[12px] md:text-[14px] uppercase text-error text-center">Reset Semua Data</p>
            </button>
          </div>
        </section>
      </div>
      
      {renderModal()}
    </main>
  );
}
