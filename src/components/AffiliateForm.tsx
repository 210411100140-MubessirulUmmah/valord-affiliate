import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Send, Link as LinkIcon, User, Zap, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function AffiliateForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    accountName: '',
    contentLink: '',
    boostCode: '',
    postDate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountName || !formData.contentLink) {
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
      toast.success('Data berhasil dikirim!');
      setFormData({
        accountName: '',
        contentLink: '',
        boostCode: '',
        postDate: '',
      });
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Gagal mengirim data. Pastikan Firebase sudah terkonfigurasi.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const link = e.target.value;
    setFormData({ ...formData, contentLink: link });
    
    // Simulate auto-fetching post date
    if (link.includes('tiktok.com') || link.includes('instagram.com')) {
      // In a real app, you'd fetch metadata here
      // For now, we simulate a delay and then set a placeholder date
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
            <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
              Affiliate Program
            </Badge>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">
            Submit Konten
          </CardTitle>
          <CardDescription>
            Lengkapi data konten Anda untuk proses verifikasi dan boost.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accountName" className="flex items-center gap-2">
                <User size={16} className="text-slate-400" />
                Nama Akun
              </Label>
              <Input
                id="accountName"
                placeholder="@username"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                className="bg-slate-50/50 border-slate-200 focus:ring-orange-500"
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
                className="bg-slate-50/50 border-slate-200 focus:ring-orange-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="boostCode" className="flex items-center gap-2">
                  <Zap size={16} className="text-slate-400" />
                  Kode Boost
                </Label>
                <Input
                  id="boostCode"
                  placeholder="BOOST123"
                  value={formData.boostCode}
                  onChange={(e) => setFormData({ ...formData, boostCode: e.target.value })}
                  className="bg-slate-50/50 border-slate-200 focus:ring-orange-500"
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
                  className="bg-slate-50/50 border-slate-200 focus:ring-orange-500"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-6 rounded-xl transition-all shadow-lg shadow-orange-200"
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
                  Kirim Data Konten
                </div>
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400 text-center">
            Data akan diproses secara otomatis oleh sistem kami.
          </p>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
