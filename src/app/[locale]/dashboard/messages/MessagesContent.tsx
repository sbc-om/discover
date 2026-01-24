'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Send, Loader2, User } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import useLocale from '@/hooks/useLocale';

interface SubscriberUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  role_name: string | null;
  role_id: string | null;
  academy_id: string | null;
  academy_name: string | null;
}

interface Academy {
  id: string;
  name: string;
  name_ar: string;
}

interface Role {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
}

export default function MessagesContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();

  const [users, setUsers] = useState<SubscriberUser[]>([]);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const [currentAcademyId, setCurrentAcademyId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedAcademy, setSelectedAcademy] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCurrentUser();
    fetchAcademies();
    fetchRoles();
    fetchSubscribers();
  }, []);

  useEffect(() => {
    fetchSubscribers();
  }, [selectedAcademy, selectedRole]);

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (response.ok) {
        setCurrentRole(data.roleName || null);
        setCurrentAcademyId(data.academyId || '');
        if (data.roleName === 'academy_manager' && data.academyId) {
          setSelectedAcademy(data.academyId);
        }
      }
    } catch (error) {
      console.error('Error fetching current user:', error);
    }
  };

  const fetchAcademies = async () => {
    if (currentRole === 'academy_manager') return;
    try {
      const response = await fetch('/api/academies?limit=1000');
      const data = await response.json();
      if (response.ok) {
        setAcademies(data.academies || []);
      }
    } catch (error) {
      console.error('Error fetching academies:', error);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles?limit=1000');
      const data = await response.json();
      if (response.ok) {
        setRoles(data.roles || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      const academyParam = currentRole === 'academy_manager' ? currentAcademyId : selectedAcademy;
      if (academyParam) params.append('academyId', academyParam);
      if (selectedRole) params.append('roleId', selectedRole);
      
      const response = await fetch(`/api/push/subscribers?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        showToast('error', data.message || (isAr ? 'فشل تحميل المستخدمين' : 'Failed to load users'));
      }
    } catch (error) {
      console.error('Error fetching subscribers:', error);
      showToast('error', isAr ? 'فشل تحميل المستخدمين' : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u) =>
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q)
    );
  }, [users, search]);

  const toggleUser = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedIds.length === filteredUsers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUsers.map((u) => u.id));
    }
  };

  const handleSend = async () => {
    if (selectedIds.length === 0) {
      showToast('error', isAr ? 'اختر مستخدمين أولاً' : 'Select users first');
      return;
    }
    if (!message.trim()) {
      showToast('error', isAr ? 'الرجاء كتابة رسالة' : 'Please enter a message');
      return;
    }

    setSending(true);
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userIds: selectedIds,
          message: message.trim()
        })
      });

      const data = await response.json();
      if (response.ok) {
        showToast('success', isAr ? 'تم إرسال الإشعارات' : 'Notifications sent');
        setMessage('');
      } else {
        showToast('error', data.message || (isAr ? 'فشل الإرسال' : 'Failed to send'));
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      showToast('error', isAr ? 'فشل الإرسال' : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {isAr ? 'الرسائل' : 'Messages'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isAr ? 'ابحث عن مستخدم...' : 'Search users...'}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            
            {currentRole !== 'academy_manager' && (
              <select
                value={selectedAcademy}
                onChange={(e) => setSelectedAcademy(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              >
                <option value="">{isAr ? 'جميع الأكاديميات' : 'All Academies'}</option>
                {academies.map((academy) => (
                  <option key={academy.id} value={academy.id}>
                    {isAr ? academy.name_ar || academy.name : academy.name}
                  </option>
                ))}
              </select>
            )}
            
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            >
              <option value="">{isAr ? 'جميع الأدوار' : 'All Roles'}</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {isAr ? role.name_ar || role.name_en : role.name_en}
                </option>
              ))}
            </select>
            
            <button
              onClick={toggleAll}
              className="w-full text-sm px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              {selectedIds.length === filteredUsers.length && filteredUsers.length > 0
                ? (isAr ? 'إلغاء تحديد الكل' : 'Deselect All')
                : (isAr ? 'تحديد الكل' : 'Select All')}
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {isAr ? 'لا يوجد مستخدمون مفعّلون' : 'No enabled users'}
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredUsers.map((user) => (
                  <label
                    key={user.id}
                    className="flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => toggleUser(user.id)}
                      className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-5 h-5 text-zinc-400" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Box */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          <div className="space-y-4">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {isAr
                ? `عدد المختارين: ${selectedIds.length}`
                : `Selected: ${selectedIds.length}`}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                {isAr ? 'نص الرسالة' : 'Message'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Type your message...'}
              />
            </div>

            <button
              onClick={handleSend}
              disabled={sending || !message.trim() || selectedIds.length === 0}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isAr ? 'إرسال إشعار' : 'Send notification'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
