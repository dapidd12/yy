import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc, query, writeBatch } from 'firebase/firestore';
import { db, auth } from './auth';

export async function getSpreadsheetId(): Promise<string> {
  return 'firestore';
}

export async function createSpreadsheet(): Promise<string> {
  return 'firestore';
}

export async function initSpreadsheet(spreadsheetId: string) {
  // No-op for firestore
}

export async function getTransactions() {
  if (!auth.currentUser) return [];
  const q = query(collection(db, 'users', auth.currentUser.uid, 'transactions'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addTransaction(transaction: any) {
  if (!auth.currentUser) throw new Error("UNAUTHENTICATED");
  await setDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', transaction.id), transaction);
}

export async function deleteTransactions() {
  if (!auth.currentUser) throw new Error("UNAUTHENTICATED");
  const q = query(collection(db, 'users', auth.currentUser.uid, 'transactions'));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function getAccounts() {
  if (!auth.currentUser) return [];
  const q = query(collection(db, 'users', auth.currentUser.uid, 'accounts'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function addAccount(account: any) {
  if (!auth.currentUser) throw new Error("UNAUTHENTICATED");
  await setDoc(doc(db, 'users', auth.currentUser.uid, 'accounts', account.id), account);
}

export async function resetAccounts() {
  if (!auth.currentUser) throw new Error("UNAUTHENTICATED");
  const q = query(collection(db, 'users', auth.currentUser.uid, 'accounts'));
  const snapshot = await getDocs(q);
  const batch = writeBatch(db);
  snapshot.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
}

export async function updateAccountBalance(accountId: string, newBalance: number) {
  if (!auth.currentUser) throw new Error("UNAUTHENTICATED");
  await updateDoc(doc(db, 'users', auth.currentUser.uid, 'accounts', accountId), { balance: newBalance });
}

export async function deleteAccount(accountId: string) {
  if (!auth.currentUser) throw new Error("UNAUTHENTICATED");
  await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'accounts', accountId));
}

export async function deleteTransaction(txId: string) {
  if (!auth.currentUser) throw new Error("UNAUTHENTICATED");
  await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'transactions', txId));
}
