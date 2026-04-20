import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, Link as LinkIcon, User, Zap, Calendar, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function BoostForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    accountName: '',
    contentLink: '',
    boostCode: '',
    postDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName || !formData.accountName || !formData.contentLink) {
      toast.error('Mohon isi semua data yang diperlukan');
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'submissions'), {
        ...formData,
        submissionTimestamp: serverTimestamp(),
        status: 'pending',
      });
      toast.success('Data konten berhasil dikirim!');
      setFormData({
        accountName: '',
        contentLink: '',
        boostCode: '',
        postDate: '',
      });
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Gagal mengirim data.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setFormData({ ...formData, contentLink: link });
    
    if (link.includes('tiktok.com') || link.includes('instagram.com')) {
      setTimeout(() => {
        if (!formData.postDate) {
          const today = new Date().toISOString().split('T')[0];
          setFormData(prev => ({ ...prev, postDate: today }));
          toast.info('Tanggal posting terdeteksi otomatis');
        }
      }, 1000);
    }
  };

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
            <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
              Boost Request
            </Badge>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
            Submit Link Boost
          </CardTitle>
          <CardDescription>
            Masukkan link konten Anda untuk mendapatkan boost engagement.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                Nama Lengkap
              </Label>
              <Input
                id="fullName"
                placeholder="Nama Lengkap"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="bg-slate-50/50 border-slate-200 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountName" className="flex items-center gap-2">
                <FileText size={16} className="text-slate-400" />
                Nama Akun TikTok
              </Label>
              <Input
                id="accountName"
                placeholder="@username"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="bg-slate-50/50 border-slate-200 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contentLink" className="flex items-center gap-2">
                <LinkIcon size={16} className="text-slate-400" />
                Link Konten
              </Label>
              <Input
                id="contentLink"
                placeholder="https://tiktok.com/..."
                value={formData.contentLink}
                onChange={handleLinkChange}
                className="bg-slate-50/50 border-slate-200 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="boostCode" className="flex items-center gap-2">
                  <Zap size={16} className="text-slate-400" />
                  Kode boost (exp 1 Tahun)
                </Label>
                <Input
                  id="boostCode"
                  placeholder="BOOST123"
                  value={formData.boostCode}
                  onChange={(e) => setFormData({ ...formData, boostCode: e.target.value })}
                  className="bg-slate-50/50 border-slate-200 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="postDate" className="flex items-center gap-2">
                  <Calendar size={16} className="text-slate-400" />
                  Tanggal Post
                </Label>
                <Input
                  id="postDate"
                  type="date"
                  value={formData.postDate}
                  onChange={(e) => setFormData({ ...formData, postDate: e.target.value })}
                  className="bg-slate-50/50 border-slate-200 focus:ring-blue-500"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-xl transition-all shadow-lg shadow-blue-200"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Mengirim...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send size={18} />
                  Kirim Data Boost
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400 text-center">
            Gunakan form ini hanya jika Anda sudah lolos seleksi affiliate.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
