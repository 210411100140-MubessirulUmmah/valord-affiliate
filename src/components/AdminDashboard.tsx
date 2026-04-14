import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock,
  FileSpreadsheet
} from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { AffiliateSubmission } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { syncToGoogleSheets } from '@/services/sheetsService';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<AffiliateSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'submissions'), orderBy('submissionTimestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AffiliateSubmission[];
      setSubmissions(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching submissions:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'submissions', id), { status });
      toast.success(`Status diperbarui menjadi ${status}`);
    } catch (error) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleSyncToSheets = async () => {
    if (submissions.length === 0) {
      toast.error('Tidak ada data untuk disinkronkan');
      return;
    }

    setSyncing(true);
    try {
      // Format data for sheets (convert timestamps to strings)
      const formattedData = submissions.map(sub => ({
        ...sub,
        submissionTimestamp: sub.submissionTimestamp ? format(sub.submissionTimestamp.toDate(), 'yyyy-MM-dd HH:mm:ss') : ''
      }));

      const result = await syncToGoogleSheets(formattedData);
      if (result.success) {
        toast.success('Berhasil sinkronisasi ke Google Sheets!');
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Gagal sinkronisasi. Periksa konfigurasi Webhook URL.');
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"><CheckCircle2 size={12} className="mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200"><XCircle size={12} className="mr-1" /> Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200"><Clock size={12} className="mr-1" /> Pending</Badge>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">Admin Dashboard</h2>
          <p className="text-slate-500 text-sm">Kelola data konten dari para affiliator.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleSyncToSheets} 
            disabled={syncing}
            className="border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            {syncing ? <RefreshCw size={16} className="mr-2 animate-spin" /> : <FileSpreadsheet size={16} className="mr-2 text-emerald-600" />}
            Sync to Sheets
          </Button>
          <Button className="bg-slate-900 text-white hover:bg-slate-800">
            <Download size={16} className="mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle>Daftar Submisi</CardTitle>
          <CardDescription>Total {submissions.length} data masuk terdeteksi.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="w-[150px]">Akun</TableHead>
                  <TableHead>Link Konten</TableHead>
                  <TableHead>Kode Boost</TableHead>
                  <TableHead>Tgl Post</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                      <div className="flex flex-col items-center gap-2">
                        <RefreshCw className="animate-spin" size={24} />
                        Memuat data...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : submissions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                      Belum ada data yang masuk.
                    </TableCell>
                  </TableRow>
                ) : (
                  submissions.map((sub) => (
                    <TableRow key={sub.id} className="hover:bg-slate-50/50 border-slate-100 transition-colors">
                      <TableCell className="font-medium text-slate-900">{sub.accountName}</TableCell>
                      <TableCell>
                        <a 
                          href={sub.contentLink} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center text-blue-600 hover:underline gap-1 text-xs truncate max-w-[200px]"
                        >
                          {sub.contentLink}
                          <ExternalLink size={12} />
                        </a>
                      </TableCell>
                      <TableCell>
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs font-mono text-slate-700">
                          {sub.boostCode || '-'}
                        </code>
                      </TableCell>
                      <TableCell className="text-slate-600 text-xs">
                        {sub.postDate || '-'}
                      </TableCell>
                      <TableCell className="text-slate-400 text-[10px]">
                        {sub.submissionTimestamp ? format(sub.submissionTimestamp.toDate(), 'dd MMM yyyy, HH:mm') : '-'}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(sub.status)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                            onClick={() => handleStatusUpdate(sub.id!, 'approved')}
                          >
                            <CheckCircle2 size={16} />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                            onClick={() => handleStatusUpdate(sub.id!, 'rejected')}
                          >
                            <XCircle size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
