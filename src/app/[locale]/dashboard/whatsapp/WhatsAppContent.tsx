'use client';

import { useEffect, useMemo, useState } from 'react';
import { Search, Send, Loader2, User, Phone } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';
import useLocale from '@/hooks/useLocale';

interface UserItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  avatar_url: string | null;
  role_name: string | null;
}

export default function WhatsAppContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();

  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [search]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: '100',
        ...(search && { search })
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users || []);
      } else {
        showToast('error', data.message || (isAr ? 'فشل تحميل المستخدمين' : 'Failed to load users'));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showToast('error', isAr ? 'فشل تحميل المستخدمين' : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const normalizePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, '');
    if (digits.startsWith('00')) return digits.slice(2);
    return digits;
  };

  const selectedPhone = useMemo(() => {
    if (!selectedUser?.phone) return '';
    return normalizePhone(selectedUser.phone);
  }, [selectedUser]);

  const handleSend = async () => {
    if (!selectedUser) return;
    if (!selectedPhone) {
      showToast('error', isAr ? 'رقم الهاتف غير موجود' : 'Phone number is missing');
      return;
    }
    if (!message.trim()) {
      showToast('error', isAr ? 'الرجاء كتابة رسالة' : 'Please enter a message');
      return;
    }

    setSending(true);
    try {
      const text = encodeURIComponent(message.trim());
      const apiLink = `https://api.whatsapp.com/send?phone=${selectedPhone}&text=${text}`;
      window.open(apiLink, '_blank');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {isAr ? 'واتساب' : 'WhatsApp'}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
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
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
                {isAr ? 'لا يوجد مستخدمون' : 'No users found'}
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                      selectedUser?.id === user.id ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
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
                          {user.phone || (isAr ? 'بدون رقم' : 'No phone')}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Box */}
        <div className="lg:col-span-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6">
          {selectedUser ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <Phone className="w-4 h-4" />
                    <span>{selectedUser.phone || (isAr ? 'بدون رقم' : 'No phone')}</span>
                  </div>
                </div>
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
                disabled={sending || !message.trim() || !selectedPhone}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>{isAr ? 'إرسال عبر واتساب' : 'Send via WhatsApp'}</span>
              </button>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-zinc-500 dark:text-zinc-400">
              {isAr ? 'اختر مستخدمًا لإرسال رسالة' : 'Select a user to send a message'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
