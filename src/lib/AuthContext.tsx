import React, { createContext, useContext, useEffect, useState } from 'react';
import { initAuth, googleSignIn, logout as firebaseLogout } from './auth';
import { getUserProfile, createUserProfile } from './user';
import { X } from 'lucide-react';

type AuthContextType = {
  user: any;
  userProfile: any;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  requireAuth: (action: () => void) => void;
};

export const AuthContext = createContext<AuthContextType>({} as any);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [pendingUser, setPendingUser] = useState<any>(null);

  useEffect(() => {
    return initAuth(
      async (u) => { 
        try {
          const profile = await getUserProfile(u.uid);
          if (profile) {
            setUserProfile(profile);
            setUser(u);
            setShowLoginModal(false);
          } else {
            // Needs username
            setPendingUser(u);
            setShowUsernameModal(true);
            setShowLoginModal(false);
          }
        } catch (e) {
          console.error("Failed to fetch user profile", e);
        } finally {
          setLoading(false);
        }
      },
      () => { 
        setUser(null); 
        setUserProfile(null);
        setLoading(false); 
      }
    );
  }, []);

  const login = async () => {
    try {
      setError(null);
      await googleSignIn();
      // On success, initAuth callback will handle profile check
    } catch (err: any) {
      if (err?.code !== 'auth/popup-closed-by-user') {
        console.error('Login failed:', err);
      }
      if (err?.code === 'auth/popup-closed-by-user') {
        setError('Sign-in dibatalkan pengguna. Silakan coba lagi.');
      } else {
        setError('Sign-in gagal. Jika Anda menggunakan mode preview, silakan buka aplikasi di tab baru, atau izinkan cookies pihak ketiga di browser Anda (Error: ' + err?.code + ').');
      }
    }
  };

  const handleCreateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser) return;
    if (usernameInput.length < 3) {
      setUsernameError("Username minimal 3 karakter.");
      return;
    }
    
    try {
      setUsernameError(null);
      await createUserProfile(pendingUser.uid, pendingUser.email, usernameInput);
      const profile = await getUserProfile(pendingUser.uid);
      setUserProfile(profile);
      setUser(pendingUser);
      setPendingUser(null);
      setShowUsernameModal(false);
    } catch (err: any) {
      console.error(err);
      setUsernameError("Gagal membuat username. Coba lagi.");
    }
  };

  const logout = async () => {
    await firebaseLogout();
  };

  const requireAuth = (action: () => void) => {
    if (user) {
      action();
    } else {
      setShowLoginModal(true);
    }
  };

  // Prevent rendering until we know if it's logged in or not initially
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="font-headline-lg text-headline-lg uppercase animate-pulse">MONEYMIND</div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, login, logout, requireAuth }}>
      {children}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-container border-4 border-on-surface p-8 max-w-md w-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-center relative">
            <button 
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 p-1 hover:bg-surface-variant border-2 border-transparent hover:border-on-surface transition-colors"
            >
              <X size={24} />
            </button>
            <h1 className="font-headline-lg text-headline-lg uppercase mb-2">MONEYMIND</h1>
            <p className="font-body-md text-on-surface-variant mb-8">
              Login dengan akun Google untuk menyimpan dan mengelola data keuanganmu sendiri secara privat di Google Sheets.
            </p>
            {error && (
              <div className="bg-error-container text-on-error-container p-3 mb-6 border-2 border-error font-label-bold text-sm">
                {error}
              </div>
            )}
            <button 
              onClick={login}
              className="w-full bg-white border-4 border-on-surface p-4 flex items-center justify-center gap-3 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all font-label-bold"
            >
              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-6 h-6 block">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      )}

      {showUsernameModal && pendingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-surface-container border-4 border-on-surface p-8 max-w-md w-full shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] text-left relative">
            <h1 className="font-headline-md text-headline-md mb-2">Buat Username</h1>
            <p className="font-body-md text-on-surface-variant mb-6">
              Akun Google Anda berhasil disambungkan! Silakan buat username untuk profil Anda di aplikasi ini.
            </p>
            {usernameError && (
              <div className="bg-error-container text-on-error-container p-3 mb-6 border-2 border-error font-label-bold text-sm">
                {usernameError}
              </div>
            )}
            <form onSubmit={handleCreateUsername}>
              <div className="mb-6">
                <label className="block font-label-bold text-on-surface-variant mb-2 uppercase text-sm">Username</label>
                <input 
                  type="text" 
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="e.g., satoshi_nakamoto"
                  className="w-full bg-white border-4 border-on-surface p-4 font-body-lg focus:outline-none focus:ring-4 focus:ring-primary/20"
                />
              </div>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => {
                    firebaseLogout();
                    setShowUsernameModal(false);
                    setPendingUser(null);
                  }}
                  className="flex-1 bg-white border-4 border-on-surface p-4 font-label-bold uppercase active:translate-x-1 active:translate-y-1 transition-all"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-primary text-on-primary border-4 border-on-surface p-4 font-label-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
}
