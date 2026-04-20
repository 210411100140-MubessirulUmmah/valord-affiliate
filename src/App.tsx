/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import RegistrationForm from '@/components/RegistrationForm';
import BoostForm from '@/components/BoostForm';
import AdminDashboard from '@/components/AdminDashboard';
import { Toaster } from '@/components/ui/sonner';
import { LayoutDashboard, UserPlus, Zap, LogIn, LogOut, Rocket } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

function Navbar({ user }: { user: User | null }) {
  const location = useLocation();
  
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Berhasil masuk!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Gagal masuk. Pastikan domain sudah diizinkan di Firebase.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Berhasil keluar');
    } catch (error) {
      toast.error('Gagal keluar');
    }
  };
  
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white/50 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="bg-orange-600 p-2 rounded-lg shadow-lg shadow-orange-200">
          <Zap size={20} className="text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-slate-900">Affiliate<span className="text-orange-600">Boost</span></span>
      </div>
      <div className="flex items-center gap-4">
        {user && (
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <Link to="/">
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === '/' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <UserPlus size={16} />
                Form Daftar
              </button>
            </Link>
            <Link to="/boost">
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === '/boost' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <Rocket size={16} />
                Form Boost
              </button>
            </Link>
            <Link to="/admin">
              <button className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${location.pathname === '/admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <LayoutDashboard size={16} />
                Dashboard
              </button>
            </Link>
          </div>
        )}
        
        {user ? (
          <div className="flex items-center gap-3">
            <img src={user.photoURL || ''} alt="Avatar" className="w-8 h-8 rounded-full border border-slate-200" />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-slate-500">
              <LogOut size={16} />
            </Button>
          </div>
        ) : (
          <Link to="/admin">
            <Button variant="outline" size="sm" className="border-slate-200 text-slate-600">
              <LogIn size={16} className="mr-2" />
              Admin
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 selection:bg-orange-100 selection:text-orange-900">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-orange-100/50 blur-[120px] rounded-full" />
          <div className="absolute top-[20%] -right-[10%] w-[30%] h-[30%] bg-blue-100/30 blur-[100px] rounded-full" />
          <div className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-purple-100/20 blur-[120px] rounded-full" />
        </div>

        <Navbar user={user} />
        
        <main className="container mx-auto px-4 py-8 relative z-10">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<RegistrationForm />} />
              <Route path="/boost" element={<BoostForm />} />
              <Route path="/admin" element={user ? <AdminDashboard /> : (
                <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                  <div className="bg-slate-100 p-6 rounded-full">
                    <LayoutDashboard size={48} className="text-slate-400" />
                  </div>
                  <h2 className="text-2xl font-bold">Akses Terbatas</h2>
                  <p className="text-slate-500 max-w-xs">Silakan login dengan akun admin untuk mengakses dashboard ini.</p>
                  <Button onClick={() => {
                    const provider = new GoogleAuthProvider();
                    signInWithPopup(auth, provider);
                  }} className="bg-orange-600 hover:bg-orange-700">
                    <LogIn size={16} className="mr-2" />
                    Login Sekarang
                  </Button>
                </div>
              )} />
            </Routes>
          </AnimatePresence>
        </main>
        
        <Toaster position="top-center" richColors />
      </div>
    </Router>
  );
}


