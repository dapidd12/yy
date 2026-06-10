import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { addTransaction, getAccounts } from "../lib/sheets";

export function AddTransactionModal({ isOpen, onClose, onAdded }: { isOpen: boolean, onClose: () => void, onAdded: () => void }) {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [accountId, setAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<any[]>([]);

  useEffect(() => {
    if (isOpen) {
      getAccounts().then(setAccounts).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !accountId) return;
    
    setLoading(true);
    try {
      await addTransaction({
        id: Date.now().toString(),
        date: new Date().toISOString(),
        accountId,
        type,
        category,
        amount: parseFloat(amount),
        description
      });
      onAdded();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-background border-4 border-on-surface shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-headline-md font-bold uppercase">Tambah Transaksi</h2>
          <button onClick={onClose} className="p-2 border-2 border-transparent hover:border-on-surface hover:bg-surface-variant transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4">
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={(e) => setType(e.target.value)} className="peer sr-only" />
              <div className="text-center p-3 border-4 border-on-surface peer-checked:bg-error-container peer-checked:text-on-error-container hover:bg-surface-variant transition-colors font-label-bold uppercase">
                Pengeluaran
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" name="type" value="income" checked={type === 'income'} onChange={(e) => setType(e.target.value)} className="peer sr-only" />
              <div className="text-center p-3 border-4 border-on-surface peer-checked:bg-tertiary-container peer-checked:text-on-tertiary-container hover:bg-surface-variant transition-colors font-label-bold uppercase">
                Pemasukan
              </div>
            </label>
          </div>

          <div>
            <label className="block font-label-bold mb-2 uppercase text-on-surface-variant">Jumlah (Rp)</label>
            <input 
              type="number" 
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-white border-4 border-on-surface p-3 font-body-lg focus:outline-none focus:ring-4 focus:ring-primary/20"
              placeholder="0"
            />
          </div>

          <div>
            <label className="block font-label-bold mb-2 uppercase text-on-surface-variant">Sumber Akun</label>
            <select 
              required
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full bg-white border-4 border-on-surface p-3 font-body-lg focus:outline-none focus:ring-4 focus:ring-primary/20"
            >
              <option value="" disabled>Pilih Akun...</option>
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>{acc.name} - Rp {acc.balance.toLocaleString('id-ID')}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-label-bold mb-2 uppercase text-on-surface-variant">Kategori</label>
            <input 
              type="text" 
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-white border-4 border-on-surface p-3 font-body-lg focus:outline-none focus:ring-4 focus:ring-primary/20"
              placeholder="Contoh: Makanan, Gaji, Transport..."
            />
          </div>

          <div>
            <label className="block font-label-bold mb-2 uppercase text-on-surface-variant">Deskripsi (Opsional)</label>
            <input 
              type="text" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white border-4 border-on-surface p-3 font-body-lg focus:outline-none focus:ring-4 focus:ring-primary/20"
              placeholder="Contoh: Nasi Goreng Gila"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-primary text-on-primary border-4 border-on-surface p-4 font-label-bold text-label-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-primary/90 active:translate-y-1 active:translate-x-1 active:shadow-none transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Transaksi"}
          </button>
        </form>
      </div>
    </div>
  );
}
