import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { LogIn, Lock, Rocket, ShieldCheck } from 'lucide-react';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { toast } from 'sonner';

interface AdminLoginProps {
  onLoginSuccess?: () => void;
}

export default function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setLoading(true);
      await signInWithPopup(auth, provider);
      toast.success('Berhasil masuk sebagai Owner');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Gagal masuk. Periksa izin domain Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Mohon isi email dan password');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Berhasil masuk sebagai Tim Marketing');
    } catch (error: any) {
      console.error('Password login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        toast.error('Email atau password salah');
      } else {
        toast.error('Gagal masuk. Pastikan tim Anda sudah terdaftar di Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-orange-600 shadow-xl shadow-orange-100 mb-4">
            <ShieldCheck size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Admin Gateway</h1>
          <p className="text-slate-500 mt-2">Masuk untuk mengelola data affiliate</p>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle>{showEmailForm ? 'Team Login' : 'Pilih Metode Akses'}</CardTitle>
            <CardDescription>
              {showEmailForm 
                ? 'Gunakan email dan sandi tim marketing Anda' 
                : 'Pilih login Google (Owner) atau Sandi (Marketing)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!showEmailForm ? (
              <div className="space-y-3">
                <Button 
                  onClick={handleGoogleLogin} 
                  variant="outline" 
                  className="w-full h-12 border-slate-200 hover:bg-slate-50 relative overflow-hidden group"
                  disabled={loading}
                >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4 mr-2" alt="Google" />
                  Masuk dengan Google (Owner)
                </Button>
                
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-slate-400 font-medium">Atau</span></div>
                </div>

                <Button 
                  onClick={() => setShowEmailForm(true)} 
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white"
                  disabled={loading}
                >
                  <Lock size={16} className="mr-2" />
                  Masuk dengan Sandi (Tim)
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Tim</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="marketing@valord.id" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 border-slate-200 bg-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Sandi Admin</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-11 border-slate-200 bg-white/50"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-100"
                  disabled={loading}
                >
                  {loading ? <RefreshCw className="animate-spin mr-2" size={16} /> : <LogIn size={16} className="mr-2" />}
                  Masuk Sekarang
                </Button>
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => setShowEmailForm(false)} 
                  className="w-full h-11 text-slate-500"
                >
                  Kembali
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Akses dashboard ini direkam secara berkala untuk keamanan.<br />
            Masalah akses? Hubungi Admin sistem.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function RefreshCw(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
    </svg>
  );
}
