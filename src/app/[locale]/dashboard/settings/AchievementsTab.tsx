'use client';

import { useEffect, useState } from 'react';
import { Award, ImagePlus, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import { useToast } from '@/components/ToastProvider';

interface Achievement {
  id: string;
  title: string;
  title_ar?: string | null;
  description?: string | null;
  icon_url?: string | null;
}

export default function AchievementsTab() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();

  const [roleName, setRoleName] = useState<string>('');
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    title_ar: '',
    description: '',
    icon_url: '',
  });
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const canManage = roleName === 'admin' || roleName === 'academy_manager';

  const fetchRole = async () => {
    const response = await fetch('/api/auth/me');
    const data = await response.json();
    if (response.ok) {
      setRoleName(data.roleName || '');
    }
  };

  const fetchAchievements = async () => {
    const response = await fetch('/api/achievements');
    const data = await response.json();
    if (response.ok) {
      setAchievements(data.achievements || []);
    }
  };

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      await fetchRole();
      await fetchAchievements();
      setLoading(false);
    };
    boot();
  }, []);

  const handleUploadIcon = async (file: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', isAr ? 'حجم الملف كبير جداً' : 'File too large');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('type', 'achievement');
      formData.append('file', file);
      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload');
      }
      setForm((prev) => ({ ...prev, icon_url: data.url }));
      showToast('success', isAr ? 'تم رفع الأيقونة' : 'Icon uploaded');
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر الرفع' : 'Upload failed'));
    } finally {
      setUploading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim()) {
      showToast('error', isAr ? 'اكتب اسم الإنجاز' : 'Enter a title');
      return;
    }
    setSaving(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const body = editingId 
        ? { id: editingId, ...form }
        : form;
        
      const response = await fetch('/api/achievements', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...body,
          title: form.title.trim(),
          title_ar: form.title_ar.trim() || null,
          description: form.description.trim() || null,
          icon_url: form.icon_url || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || (editingId ? 'Failed to update achievement' : 'Failed to create achievement'));
      }
      setForm({ title: '', title_ar: '', description: '', icon_url: '' });
      setEditingId(null);
      await fetchAchievements();
      showToast('success', editingId 
        ? (isAr ? 'تم تحديث الإنجاز' : 'Achievement updated')
        : (isAr ? 'تم إنشاء الإنجاز' : 'Achievement created')
      );
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر الحفظ' : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (achievement: Achievement) => {
    setEditingId(achievement.id);
    setForm({
      title: achievement.title || '',
      title_ar: achievement.title_ar || '',
      description: achievement.description || '',
      icon_url: achievement.icon_url || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setForm({ title: '', title_ar: '', description: '', icon_url: '' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(isAr ? 'هل تريد حذف هذا الإنجاز؟' : 'Are you sure you want to delete this achievement?')) {
      return;
    }
    
    setDeleting(id);
    try {
      const response = await fetch(`/api/achievements?id=${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete achievement');
      }
      await fetchAchievements();
      showToast('success', isAr ? 'تم حذف الإنجاز' : 'Achievement deleted');
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر الحذف' : 'Failed to delete'));
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-zinc-500">
        {isAr ? 'جاري التحميل...' : 'Loading...'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {canManage && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
            <Award className="h-4 w-4" />
            {isAr ? 'إنجاز جديد' : 'New achievement'}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">{isAr ? 'الاسم' : 'Title'}</label>
              <input
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">{isAr ? 'الاسم بالعربية' : 'Arabic title'}</label>
              <input
                value={form.title_ar}
                onChange={(e) => setForm((prev) => ({ ...prev, title_ar: e.target.value }))}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1">{isAr ? 'الوصف' : 'Description'}</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm cursor-pointer">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              {isAr ? 'رفع أيقونة' : 'Upload icon'}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUploadIcon(file);
                  e.target.value = '';
                }}
                disabled={uploading}
              />
            </label>
            {form.icon_url && (
              <div className="h-10 w-10 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-700">
                <img src={form.icon_url} alt="" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                editingId ? <Edit className="h-4 w-4" /> : <Plus className="h-4 w-4" />
              }
              {editingId 
                ? (isAr ? 'تحديث الإنجاز' : 'Update achievement')
                : (isAr ? 'إضافة الإنجاز' : 'Create achievement')
              }
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 text-sm font-semibold text-zinc-800 dark:text-zinc-100">
          {isAr ? 'الإنجازات' : 'Achievements'}
        </div>
        {achievements.length === 0 ? (
          <div className="p-6 text-sm text-zinc-500 dark:text-zinc-400">
            {isAr ? 'لا توجد إنجازات بعد.' : 'No achievements yet.'}
          </div>
        ) : (
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="p-4 flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
                  {achievement.icon_url ? (
                    <img src={achievement.icon_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <Award className="h-4 w-4 text-zinc-400" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                    {isAr ? achievement.title_ar || achievement.title : achievement.title}
                  </p>
                  {achievement.description && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      {achievement.description}
                    </p>
                  )}
                </div>
                {canManage && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(achievement)}
                      className="p-2 text-zinc-500 hover:text-orange-500 transition-colors"
                      title={isAr ? 'تعديل' : 'Edit'}
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(achievement.id)}
                      disabled={deleting === achievement.id}
                      className="p-2 text-zinc-500 hover:text-red-500 transition-colors disabled:opacity-50"
                      title={isAr ? 'حذف' : 'Delete'}
                    >
                      {deleting === achievement.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
