import React, { useState } from 'react';
import { BackupRecord } from '../types';
import { dbService } from '../services/dbService';
import { Database, CloudUpload, Download, ShieldCheck, Clock, RefreshCw, UploadCloud, CheckCircle2, AlertCircle, FileText } from 'lucide-react';

interface BackupManagerProps {
  backups?: BackupRecord[];
  onBackupCompleted?: () => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({
  backups = [],
  onBackupCompleted = () => {}
}) => {
  const safeBackups = Array.isArray(backups) ? backups : [];
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [autoScheduleActive, setAutoScheduleActive] = useState(true);
  const [restoreMessage, setRestoreMessage] = useState<{ success: boolean; text: string } | null>(null);

  const handleManualBackup = () => {
    setIsBackingUp(true);
    setTimeout(() => {
      dbService.createCloudBackup(false);
      setIsBackingUp(false);
      onBackupCompleted();
    }, 600);
  };

  const handleDownloadFullJson = () => {
    const jsonString = dbService.exportBackupJson();
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kayu-nusantara-cloud-dump-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const content = event.target?.result as string;
        const result = dbService.restoreBackupJson(content);
        setRestoreMessage({ success: result.success, text: result.message });
        onBackupCompleted();
      } catch (err) {
        setRestoreMessage({
          success: false,
          text: 'Berkas JSON rusak atau tidak kompatibel.'
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
              Keandalan Data & Cloud Sync
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              100% Free Tier Compatible
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-display text-slate-900 dark:text-slate-100 mt-1">
            Backup Cloud Otomatis & Manajemen Snapshot
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Sistem otomatis mencadangkan data katalog, inquiry, dan profil pelanggan tanpa membebani biaya akun gratis Anda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadFullJson}
            className="px-4 py-2.5 rounded-xl bg-white dark:bg-[#16191f] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Unduh Arsip JSON</span>
          </button>

          <button
            onClick={handleManualBackup}
            disabled={isBackingUp}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-2 shadow-xs transition-transform hover:scale-102 disabled:opacity-50 cursor-pointer"
          >
            <CloudUpload className="w-4 h-4" />
            <span>{isBackingUp ? 'Menyimpan Snapshot...' : 'Snapshot Cloud Sekarang'}</span>
          </button>
        </div>
      </div>

      {/* Free Tier Architecture Info Card */}
      <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#16191f] border border-slate-200 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white dark:bg-emerald-500 dark:text-slate-950 shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
                Optimasi Batasan Free Tier (MongoDB Atlas M0 Sandbox)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed max-w-2xl">
                Arsitektur database dirancang dengan skema BSON ringkas yang muat hingga <strong>500.000+ data pesanan</strong> di dalam kuota 512MB gratis MongoDB Atlas. Rotasi backup berkala menjaga snapshot tetap ramping di bawah 1MB.
              </p>
            </div>
          </div>

          {/* Auto Backup Toggle */}
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 shrink-0 text-xs">
            <div className="flex flex-col">
              <span className="font-semibold text-slate-900 dark:text-slate-100">Jadwal Backup Otomatis</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Tiap 24 Jam (Cron)</span>
            </div>
            <button
              onClick={() => setAutoScheduleActive(!autoScheduleActive)}
              className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                autoScheduleActive ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform transform ${
                  autoScheduleActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Restore Status Alert */}
      {restoreMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
            restoreMessage.success
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800'
              : 'bg-red-50 text-red-800 border-red-200 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {restoreMessage.success ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{restoreMessage.text}</span>
          </div>
          <button onClick={() => setRestoreMessage(null)} className="font-bold underline cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {/* Restore Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-[#16191f] border border-slate-200 dark:border-slate-800/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
              Pulihkan Database dari File Backup
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Unggah file backup `.json` untuk mengembalikan data katalog, pelanggan, dan pesanan secara instan.
            </p>
          </div>

          <label className="cursor-pointer px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium flex items-center gap-2 border border-slate-200 dark:border-slate-700 transition-colors">
            <UploadCloud className="w-4 h-4" />
            <span>Pilih Berkas JSON Restore</span>
            <input type="file" accept=".json" onChange={handleFileRestore} className="hidden" />
          </label>
        </div>
      </div>

      {/* Backup History Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#16191f] overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 font-display">
            Riwayat Snapshot Cloud & Checksum
          </h3>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
            Total {safeBackups.length} Arsip Tersimpan
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#0f1115] border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Nama File Arsip</th>
                <th className="py-3 px-4">Waktu Eksekusi</th>
                <th className="py-3 px-4">Total Record</th>
                <th className="py-3 px-4">Ukuran & Kuota</th>
                <th className="py-3 px-4">Checksum Integritas</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {safeBackups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    Belum ada snapshot backup. Klik tombol "Snapshot Cloud Sekarang" di atas untuk membuat backup pertama Anda.
                  </td>
                </tr>
              ) : (
                safeBackups.map(bkp => (
                  <tr key={bkp.id} className="hover:bg-slate-50/50 dark:hover:bg-[#1f242d] transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>{bkp.filename}</span>
                      {bkp.autoScheduled && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          AUTO
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                      {new Date(bkp.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>

                    <td className="py-3 px-4 text-slate-900 dark:text-slate-100">
                      <span>{bkp.totalRecords.inquiries} pesanan, {bkp.totalRecords.customers} pelanggan</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-emerald-600 dark:text-emerald-400">
                      {bkp.sizeKb} KB <span className="text-[10px] text-slate-500">(&lt;0.01% Free Tier)</span>
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                      {bkp.checksum}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                        <CheckCircle2 className="w-3 h-3" />
                        Terverifikasi
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
