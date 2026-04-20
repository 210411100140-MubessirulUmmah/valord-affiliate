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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Download, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle2, 
  XCircle, 
  Clock,
  FileSpreadsheet,
  Users,
  Zap,
  Phone
} from 'lucide-react';
import { db, auth } from '@/lib/firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { AffiliateSubmission, AffiliateRegistration } from '@/types';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { syncToGoogleSheets } from '@/services/sheetsService';

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<AffiliateSubmission[]>([]);
  const [registrations, setRegistrations] = useState<AffiliateRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Listen to Submissions
    const qSub = query(collection(db, 'submissions'), orderBy('submissionTimestamp', 'desc'));
    const unsubSub = onSnapshot(qSub, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AffiliateSubmission[];
      setSubmissions(data);
    });

    // Listen to Registrations
    const qReg = query(collection(db, 'registrations'), orderBy('registrationTimestamp', 'desc'));
    const unsubReg = onSnapshot(qReg, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AffiliateRegistration[];
      setRegistrations(data);
      setLoading(false);
    });

    return () => {
      unsubSub();
      unsubReg();
    };
  }, []);

  const handleStatusUpdate = async (collectionName: string, id: string, status: string) => {
    try {
      await updateDoc(doc(db, collectionName, id), { status });
      toast.success(`Status diperbarui`);
    } catch (error) {
      toast.error('Gagal memperbarui status');
    }
  };

  const handleSyncToSheets = async (data: any[], type: string) => {
    // Only sync items that haven't been synced yet
    const unsyncedData = data.filter(item => !item.isSynced);

    if (unsyncedData.length === 0) {
      toast.info('Semua data terpilih sudah disinkronkan sebelumnya.');
      return;
    }

    setSyncing(true);
    try {
      let formattedData = [];

      if (type === 'Submissions') {
        // Mapping specifically for "Recap SPARK ADS AFF"
        formattedData = unsyncedData.map((sub) => {
          let postDateStr = '';
          try {
            if (sub.postDate) {
              postDateStr = format(new Date(sub.postDate), 'dd/MM/yyyy');
            }
          } catch (e) {
            postDateStr = sub.postDate || '';
          }

          return {
            "TANGGAL_POSTING": postDateStr,
            "USERNAME_TIKTOK": `${sub.accountName} (${sub.fullName})`,
            "LINK_VIDEO": sub.contentLink || '',
            "SPARK_ADS_VIDEO": sub.boostCode || '',
            "TANGGAL_INPUT": format(new Date(), 'dd/MM/yyyy'),
            "Keterangan": sub.status,
            "SHEET_NAME": "Recap SPARK ADS AFF"
          };
        });
      } else {
        // Mapping for registrations
        formattedData = unsyncedData.map(reg => {
          let regDateStr = '';
          try {
            if (reg.registrationTimestamp && typeof reg.registrationTimestamp.toDate === 'function') {
              regDateStr = format(reg.registrationTimestamp.toDate(), 'dd/MM/yyyy HH:mm');
            }
          } catch (e) {
            regDateStr = '-';
          }

          return {
            "Nama Lengkap": reg.fullName,
            "Akun TikTok": reg.accountTikTok,
            "Nomor WA": reg.whatsappNumber,
            "Tanggal Daftar": regDateStr,
            "Status": reg.status,
            "SHEET_NAME": "Data Pendaftaran" 
          };
        });
      }

      const result = await syncToGoogleSheets(formattedData);
      if (result.success) {
        // Mark items as synced in Firestore
        const collectionName = type === 'Submissions' ? 'submissions' : 'registrations';
        await Promise.all(unsyncedData.map(item => 
          updateDoc(doc(db, collectionName, item.id!), { isSynced: true })
        ));
        
        toast.success(`Berhasil sinkronisasi ${formattedData.length} data baru ke Google Sheets!`);
      }
    } catch (error) {
      console.error('Sync error:', error);
      if (error instanceof Error && error.message === 'CONFIG_MISSING') {
        toast.error('URL Webhook belum diatur', {
          description: 'Tim kami memerlukan URL Webhook (yang berakhiran /exec) dari Google Apps Script.'
        });
      } else {
        toast.error('Gagal sinkronisasi', {
          description: 'Pastikan URL Webhook di Settings sudah benar dan berakhiran /exec (bukan URL Google Sheets).'
        });
      }
    } finally {
      setSyncing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'qualified':
        return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200"><CheckCircle2 size={12} className="mr-1" /> Qualified/Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200"><XCircle size={12} className="mr-1" /> Rejected</Badge>;
      case 'reviewed':
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"><RefreshCw size={12} className="mr-1" /> Reviewed</Badge>;
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
          <p className="text-slate-500 text-sm">
            {auth.currentUser?.email === 'mubarijojo.ummah11@gmail.com' 
              ? 'Selamat datang kembali, Owner.' 
              : `Akses Tim Marketing (${auth.currentUser?.email})`}
          </p>
        </div>
        {!import.meta.env.VITE_SHEETS_WEBHOOK_URL && (
          <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 animate-pulse">
            Sync Belum Dikonfigurasi
          </Badge>
        )}
      </div>

      <Tabs defaultValue="registrations" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-4">
          <TabsTrigger value="registrations" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
            <Users size={16} />
            Pendaftar
          </TabsTrigger>
          <TabsTrigger value="submissions" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm flex items-center gap-2">
            <Zap size={16} />
            Submisi Konten
          </TabsTrigger>
        </TabsList>

        <TabsContent value="registrations">
          <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daftar Pendaftar Baru</CardTitle>
                <CardDescription>Total {registrations.length} pendaftar perlu diseleksi.</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSyncToSheets(registrations, 'Registrations')} 
                disabled={syncing}
                className="border-slate-200 text-slate-600 h-9"
              >
                <FileSpreadsheet size={16} className="mr-2 text-emerald-600" />
                Sync Sheets
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead>Nama Lengkap</TableHead>
                      <TableHead>Akun TikTok</TableHead>
                      <TableHead>Nomor WA</TableHead>
                      <TableHead>Tgl Daftar</TableHead>
                      <TableHead>Sync</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="h-32 text-center">Memuat...</TableCell></TableRow>
                    ) : registrations.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="h-32 text-center text-slate-400">Belum ada pendaftar.</TableCell></TableRow>
                    ) : (
                      registrations.map((reg) => (
                        <TableRow key={reg.id} className="hover:bg-slate-50/50 border-slate-100">
                          <TableCell className="font-semibold text-slate-900">{reg.fullName}</TableCell>
                          <TableCell className="text-slate-600">{reg.accountTikTok}</TableCell>
                          <TableCell>
                            <a href={`https://wa.me/${reg.whatsappNumber.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-emerald-600 hover:underline">
                              <Phone size={14} />
                              {reg.whatsappNumber}
                            </a>
                          </TableCell>
                          <TableCell className="text-slate-500 text-xs text-nowrap">
                            {reg.registrationTimestamp ? format(reg.registrationTimestamp.toDate(), 'dd MMM yyyy, HH:mm') : '-'}
                          </TableCell>
                          <TableCell>
                            {reg.isSynced ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 ring-0">Synced</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 ring-0">New</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(reg.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600" onClick={() => handleStatusUpdate('registrations', reg.id!, 'qualified')}><CheckCircle2 size={16} /></Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-600" onClick={() => handleStatusUpdate('registrations', reg.id!, 'rejected')}><XCircle size={16} /></Button>
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
        </TabsContent>

        <TabsContent value="submissions">
          <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle>Daftar Submisi Link Boost</CardTitle>
                <CardDescription>Total {submissions.length} link boost terdeteksi.</CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSyncToSheets(submissions, 'Submissions')} 
                disabled={syncing}
                className="border-slate-200 text-slate-600 h-9"
              >
                <FileSpreadsheet size={16} className="mr-2 text-emerald-600" />
                Sync Sheets
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead>Nama Lengkap</TableHead>
                      <TableHead>Akun</TableHead>
                      <TableHead>Link Konten</TableHead>
                      <TableHead>Kode</TableHead>
                      <TableHead>Tgl Post</TableHead>
                      <TableHead>Sync</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.length === 0 ? (
                      <TableRow><TableCell colSpan={8} className="h-32 text-center text-slate-400">Belum ada link boost.</TableCell></TableRow>
                    ) : (
                      submissions.map((sub) => (
                        <TableRow key={sub.id} className="hover:bg-slate-50/50 border-slate-100">
                          <TableCell className="font-semibold text-slate-900">{sub.fullName}</TableCell>
                          <TableCell className="text-slate-600">{sub.accountName}</TableCell>
                          <TableCell>
                            <a href={sub.contentLink} target="_blank" rel="noreferrer" className="flex items-center text-blue-600 gap-1 text-xs">{sub.contentLink.substring(0, 30)}...<ExternalLink size={12} /></a>
                          </TableCell>
                          <TableCell><code className="bg-slate-100 px-1 rounded text-xs">{sub.boostCode || '-'}</code></TableCell>
                          <TableCell className="text-slate-500 text-xs">{sub.postDate || '-'}</TableCell>
                          <TableCell>
                            {sub.isSynced ? (
                              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 ring-0">Synced</Badge>
                            ) : (
                              <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-100 ring-0">New</Badge>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(sub.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-emerald-600" onClick={() => handleStatusUpdate('submissions', sub.id!, 'approved')}><CheckCircle2 size={16} /></Button>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-rose-600" onClick={() => handleStatusUpdate('submissions', sub.id!, 'rejected')}><XCircle size={16} /></Button>
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
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}

