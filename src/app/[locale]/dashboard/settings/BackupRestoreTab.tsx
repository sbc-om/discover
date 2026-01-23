'use client';

import { useState } from 'react';
import { Database, FolderSync, Download, Upload, Loader2, Check, AlertCircle, FileText, Calendar } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import useLocale from '@/hooks/useLocale';

interface BackupInfo {
  filename: string;
  size: number;
  created_at: string;
}

export default function BackupRestoreTab() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();

  const [dbBackupLoading, setDbBackupLoading] = useState(false);
  const [dbRestoreLoading, setDbRestoreLoading] = useState(false);
  const [filesBackupLoading, setFilesBackupLoading] = useState(false);
  const [filesRestoreLoading, setFilesRestoreLoading] = useState(false);
  const [backupList, setBackupList] = useState<BackupInfo[]>([]);
  const [loadingList, setLoadingList] = useState(false);

  const handleDatabaseBackup = async () => {
    setDbBackupLoading(true);
    try {
      const response = await fetch('/api/backup/database', {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `database-backup-${new Date().toISOString().split('T')[0]}.sql`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('success', isAr ? 'تم تحميل نسخة البيانات بنجاح' : 'Database backup downloaded successfully');
      } else {
        const data = await response.json();
        showToast('error', data.message || (isAr ? 'فشل النسخ الاحتياطي' : 'Backup failed'));
      }
    } catch (error) {
      console.error('Database backup error:', error);
      showToast('error', isAr ? 'فشل النسخ الاحتياطي' : 'Backup failed');
    } finally {
      setDbBackupLoading(false);
    }
  };

  const handleDatabaseRestore = async (file: File) => {
    if (!file) return;

    const confirmed = confirm(
      isAr 
        ? 'تحذير: سيتم استبدال جميع البيانات الحالية. هل أنت متأكد؟'
        : 'Warning: This will replace all current data. Are you sure?'
    );

    if (!confirmed) return;

    setDbRestoreLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/backup/database/restore', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', isAr ? 'تمت استعادة البيانات بنجاح' : 'Database restored successfully');
      } else {
        showToast('error', data.message || (isAr ? 'فشلت الاستعادة' : 'Restore failed'));
      }
    } catch (error) {
      console.error('Database restore error:', error);
      showToast('error', isAr ? 'فشلت الاستعادة' : 'Restore failed');
    } finally {
      setDbRestoreLoading(false);
    }
  };

  const handleFilesBackup = async () => {
    setFilesBackupLoading(true);
    try {
      const response = await fetch('/api/backup/files', {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `files-backup-${new Date().toISOString().split('T')[0]}.tar.gz`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        showToast('success', isAr ? 'تم تحميل نسخة الملفات بنجاح' : 'Files backup downloaded successfully');
      } else {
        const data = await response.json();
        showToast('error', data.message || (isAr ? 'فشل النسخ الاحتياطي' : 'Backup failed'));
      }
    } catch (error) {
      console.error('Files backup error:', error);
      showToast('error', isAr ? 'فشل النسخ الاحتياطي' : 'Backup failed');
    } finally {
      setFilesBackupLoading(false);
    }
  };

  const handleFilesRestore = async (file: File) => {
    if (!file) return;

    const confirmed = confirm(
      isAr 
        ? 'تحذير: سيتم استبدال الملفات الحالية. هل أنت متأكد؟'
        : 'Warning: This will replace current files. Are you sure?'
    );

    if (!confirmed) return;

    setFilesRestoreLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/backup/files/restore', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', isAr ? 'تمت استعادة الملفات بنجاح' : 'Files restored successfully');
      } else {
        showToast('error', data.message || (isAr ? 'فشلت الاستعادة' : 'Restore failed'));
      }
    } catch (error) {
      console.error('Files restore error:', error);
      showToast('error', isAr ? 'فشلت الاستعادة' : 'Restore failed');
    } finally {
      setFilesRestoreLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Database Backup Section */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Database className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {isAr ? 'النسخ الاحتياطي لقاعدة البيانات' : 'Database Backup'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {isAr ? 'نسخ احتياطي واستعادة قاعدة البيانات PostgreSQL' : 'Backup and restore PostgreSQL database'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Backup Database */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  {isAr ? 'إنشاء نسخة احتياطية' : 'Create Backup'}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {isAr 
                    ? 'تنزيل نسخة كاملة من قاعدة البيانات بصيغة SQL'
                    : 'Download a complete SQL dump of the database'}
                </p>
              </div>
              <button
                onClick={handleDatabaseBackup}
                disabled={dbBackupLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
              >
                {dbBackupLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isAr ? 'تحميل' : 'Download'}</span>
              </button>
            </div>
          </div>

          {/* Restore Database */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  {isAr ? 'استعادة من نسخة احتياطية' : 'Restore from Backup'}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  {isAr 
                    ? 'تحذير: سيتم استبدال جميع البيانات الحالية بالنسخة الاحتياطية'
                    : 'Warning: This will replace all current data with the backup'}
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium cursor-pointer transition-all">
                  {dbRestoreLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{isAr ? 'رفع ملف SQL' : 'Upload SQL File'}</span>
                  <input
                    type="file"
                    accept=".sql"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleDatabaseRestore(file);
                      e.target.value = '';
                    }}
                    disabled={dbRestoreLoading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Files Backup Section */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <FolderSync className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {isAr ? 'النسخ الاحتياطي للملفات' : 'Files Backup'}
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {isAr ? 'نسخ احتياطي واستعادة ملفات المستخدمين والصور' : 'Backup and restore user files and images'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Backup Files */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  {isAr ? 'إنشاء نسخة احتياطية' : 'Create Backup'}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {isAr 
                    ? 'تنزيل أرشيف مضغوط يحتوي على جميع الملفات المرفوعة'
                    : 'Download a compressed archive of all uploaded files'}
                </p>
              </div>
              <button
                onClick={handleFilesBackup}
                disabled={filesBackupLoading}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
              >
                {filesBackupLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isAr ? 'تحميل' : 'Download'}</span>
              </button>
            </div>
          </div>

          {/* Restore Files */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800">
            <div className="flex items-start gap-3 mb-3">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                  {isAr ? 'استعادة من نسخة احتياطية' : 'Restore from Backup'}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">
                  {isAr 
                    ? 'تحذير: سيتم استبدال الملفات الحالية بالنسخة الاحتياطية'
                    : 'Warning: This will replace current files with the backup'}
                </p>
                <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-medium cursor-pointer transition-all">
                  {filesRestoreLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>{isAr ? 'رفع ملف الأرشيف' : 'Upload Archive File'}</span>
                  <input
                    type="file"
                    accept=".tar.gz,.tgz,.zip"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFilesRestore(file);
                      e.target.value = '';
                    }}
                    disabled={filesRestoreLoading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Best Practices */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-blue-50 to-emerald-50 dark:from-blue-950/20 dark:to-emerald-950/20 p-6">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
          <Check className="w-5 h-5 text-emerald-600" />
          {isAr ? 'أفضل الممارسات' : 'Best Practices'}
        </h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 mt-0.5">•</span>
            <span>
              {isAr 
                ? 'قم بإنشاء نسخ احتياطية منتظمة (يومية أو أسبوعية)'
                : 'Create regular backups (daily or weekly)'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 mt-0.5">•</span>
            <span>
              {isAr 
                ? 'احفظ النسخ الاحتياطية في مواقع متعددة (سحابة، أقراص خارجية)'
                : 'Store backups in multiple locations (cloud, external drives)'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 mt-0.5">•</span>
            <span>
              {isAr 
                ? 'اختبر استعادة النسخ الاحتياطية بشكل دوري'
                : 'Test backup restoration periodically'}
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-600 mt-0.5">•</span>
            <span>
              {isAr 
                ? 'قم بنسخ كل من قاعدة البيانات والملفات معاً'
                : 'Backup both database and files together'}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
