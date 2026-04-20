import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, User, Phone, CheckCircle2, FileText, MessageSquareShare } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { syncToGoogleSheets } from '@/services/sheetsService';

export default function RegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    accountTikTok: '',
    whatsappNumber: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.accountTikTok || !formData.whatsappNumber) {
      toast.error('Mohon isi semua data pendaftaran');
      return;
    }

    setLoading(true);
    try {
      // 1. Save to Firestore
      const docRef = await addDoc(collection(db, 'registrations'), {
        ...formData,
        registrationTimestamp: serverTimestamp(),
        status: 'pending',
        isSynced: false
      });

      // 2. Auto-sync to Google Sheets
      try {
        const formattedData = [{
          "Nama Lengkap": formData.fullName,
          "Akun TikTok": formData.accountTikTok,
          "Nomor WA": formData.whatsappNumber,
          "Tanggal Daftar": format(new Date(), 'dd/MM/yyyy HH:mm'),
          "Status": "pending",
          "SHEET_NAME": "Data Pendaftaran" 
        }];

        const result = await syncToGoogleSheets(formattedData);
        if (result.success) {
          await updateDoc(doc(db, 'registrations', docRef.id), { isSynced: true });
        }
      } catch (syncError) {
        console.error('Auto-sync failed:', syncError);
        // We don't block the user experience if sync fails, 
        // admin can still manual sync later.
      }

      toast.success('Pendaftaran berhasil dikirim!');
      setSubmitted(true);
    } catch (error) {
      console.error('Error registering:', error);
      toast.error('Gagal mendaftar. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md mx-auto p-4"
      >
        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-xl text-center overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-emerald-400 to-teal-500 w-full" />
          <CardHeader>
            <div className="mx-auto bg-emerald-100 p-4 rounded-full w-fit mb-4">
              <CheckCircle2 size={48} className="text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-slate-900">Pendaftaran Terkirim!</CardTitle>
            <CardDescription className="text-slate-600">
              Terima kasih telah mendaftar. Tim kami akan melakukan proses seleksi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <p className="text-sm font-medium text-slate-700">Silakan lanjut ke langkah berikut:</p>
              
              <div className="grid gap-3">
                <a 
                  href="https://example.com/affiliate-desc.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-orange-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-rose-50 p-2 rounded-lg group-hover:bg-rose-100 transition-colors">
                      <FileText size={20} className="text-rose-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900">Download PDF Deskripsi</p>
                      <p className="text-[10px] text-slate-500">Panduan & Detail Program</p>
                    </div>
                  </div>
                </a>

                <a 
                  href="https://chat.whatsapp.com/example" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-emerald-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-50 p-2 rounded-lg group-hover:bg-emerald-100 transition-colors">
                      <MessageSquareShare size={20} className="text-emerald-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-slate-900">Gabung Grup WA</p>
                      <p className="text-[10px] text-slate-500">Update Informasi Terbaru</p>
                    </div>
                  </div>
                </a>
              </div>
            </div>

            <p className="text-xs text-slate-400">
              Jika cocok, kami akan mengirimkan sample produk dan form link boost.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-md mx-auto p-4"
    >
      <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
              Affiliate Registration
            </Badge>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
            Daftar Affiliate
          </CardTitle>
          <CardDescription>
            Gabung bersama kami dan mulai hasilkan cuan dari konten Anda.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2 text-slate-700">
                <User size={16} className="text-slate-400" />
                Nama Lengkap
              </Label>
              <Input
                id="fullName"
                placeholder="Nama Lengkap sesuai KTP"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-slate-50/50 border-slate-200 focus:ring-orange-500 h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountTikTok" className="flex items-center gap-2 text-slate-700">
                <FileText size={16} className="text-slate-400" />
                Nama Akun TikTok
              </Label>
              <Input
                id="accountTikTok"
                placeholder="@username_tiktok"
                value={formData.accountTikTok}
                onChange={(e) => setFormData({ ...formData, accountTikTok: e.target.value })}
                className="bg-slate-50/50 border-slate-200 focus:ring-orange-500 h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsappNumber" className="flex items-center gap-2 text-slate-700">
                <Phone size={16} className="text-slate-400" />
                Nomor WA Aktif
              </Label>
              <Input
                id="whatsappNumber"
                placeholder="08123456789"
                value={formData.whatsappNumber}
                onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
                className="bg-slate-50/50 border-slate-200 focus:ring-orange-500 h-12"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-7 rounded-2xl transition-all shadow-lg shadow-orange-200 mt-4 active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Memproses...
                </div>
              ) : (
                <div className="flex items-center gap-2 text-lg">
                  <Send size={20} />
                  Daftar Sekarang
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t border-slate-100 pt-6">
          <p className="text-xs text-slate-400 text-center">
            Dengan mendaftar, Anda menyetujui syarat dan ketentuan kami.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

