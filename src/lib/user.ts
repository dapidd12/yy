import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './auth';

export async function getUserProfile(uid: string) {
  const docRef = doc(db, 'users', uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

export async function createUserProfile(uid: string, email: string, username: string) {
  const docRef = doc(db, 'users', uid);
  await setDoc(docRef, {
    email,
    username,
    createdAt: serverTimestamp()
  });
}
