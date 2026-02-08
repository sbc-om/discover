'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Mail, 
  Users, 
  Calendar,
  ArrowLeft,
  ArrowRight,
  Edit2,
  Loader2,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  FileText
} from 'lucide-react';
import Image from 'next/image';

interface Academy {
  id: string;
  name: string;
  name_ar?: string;
  description?: string;
  logo_url?: string;
  address?: string;
  city?: string;
  country?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  manager_id?: string;
  manager_first_name?: string;
  manager_last_name?: string;
  manager_email?: string;
  user_count?: number;
}

interface AcademyDetailContentProps {
  academyId: string;
}

export default function AcademyDetailContent({ academyId }: AcademyDetailContentProps) {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const isAr = locale === 'ar';

  const [academy, setAcademy] = useState<Academy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAcademy();
  }, [academyId]);

  const fetchAcademy = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/academies/${academyId}`);
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch academy');
      }
      
      const data = await response.json();
      setAcademy(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (error || !academy) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <XCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          {isAr ? 'حدث خطأ' : 'Error'}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-4">
          {error || (isAr ? 'الأكاديمية غير موجودة' : 'Academy not found')}
        </p>
        <button
          onClick={() => router.push(`/${locale}/dashboard/academies`)}
          className="px-4 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
        >
          {isAr ? 'العودة إلى القائمة' : 'Back to List'}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push(`/${locale}/dashboard/academies`)}
          className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        >
          {isAr ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
          <span className="font-medium">{isAr ? 'العودة إلى الأكاديميات' : 'Back to Academies'}</span>
        </button>
        
        <button
          onClick={() => router.push(`/${locale}/dashboard/academies?edit=${academy.id}`)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/20"
        >
          <Edit2 className="w-4 h-4" />
          <span>{isAr ? 'تعديل' : 'Edit'}</span>
        </button>
      </div>

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden"
      >
        {/* Logo */}
        {academy.logo_url ? (
          <div className="w-full h-48 sm:h-64 md:h-80 overflow-hidden bg-zinc-50 dark:bg-zinc-800/50">
            <Image
              src={academy.logo_url}
              alt={academy.name}
              width={1200}
              height={400}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-full h-48 sm:h-64 md:h-80 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center">
            <Building2 className="w-24 h-24 sm:w-32 sm:h-32 text-white/80" />
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-6">
          {/* Name & Status */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
                {academy.name}
              </h1>
              {academy.name_ar && academy.name_ar !== academy.name && (
                <p className="text-lg text-zinc-600 dark:text-zinc-400 mt-1">
                  {academy.name_ar}
                </p>
              )}
            </div>
            
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
              academy.is_active
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
            }`}>
              {academy.is_active ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  {isAr ? 'نشط' : 'Active'}
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  {isAr ? 'غير نشط' : 'Inactive'}
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Description Card */}
        {academy.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
                {isAr ? 'الوصف' : 'Description'}
              </h2>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
              {academy.description}
            </p>
          </motion.div>
        )}

        {/* Location Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {isAr ? 'الموقع' : 'Location'}
            </h2>
          </div>
          
          <div className="space-y-3">
            {academy.address && (
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-500 w-20 shrink-0">
                  {isAr ? 'العنوان:' : 'Address:'}
                </span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {academy.address}
                </span>
              </div>
            )}
            {academy.city && (
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-500 w-20 shrink-0">
                  {isAr ? 'المدينة:' : 'City:'}
                </span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {academy.city}
                </span>
              </div>
            )}
            {academy.country && (
              <div className="flex items-start gap-3">
                <span className="text-sm text-zinc-500 dark:text-zinc-500 w-20 shrink-0">
                  {isAr ? 'الدولة:' : 'Country:'}
                </span>
                <span className="text-sm text-zinc-700 dark:text-zinc-300">
                  {academy.country}
                </span>
              </div>
            )}
            {!academy.address && !academy.city && !academy.country && (
              <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">
                {isAr ? 'لم يتم تحديد الموقع' : 'No location specified'}
              </p>
            )}
          </div>
        </motion.div>

        {/* Manager Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {isAr ? 'المدير' : 'Manager'}
            </h2>
          </div>
          
          {academy.manager_first_name || academy.manager_last_name ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {(academy.manager_first_name?.[0] || '').toUpperCase()}
                  {(academy.manager_last_name?.[0] || '').toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-zinc-900 dark:text-white">
                    {academy.manager_first_name} {academy.manager_last_name}
                  </p>
                  {academy.manager_email && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">
                      {academy.manager_email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">
              {isAr ? 'لم يتم تعيين مدير' : 'No manager assigned'}
            </p>
          )}
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {isAr ? 'المستخدمون' : 'Users'}
            </h2>
          </div>
          
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-zinc-900 dark:text-white">
              {academy.user_count || 0}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              {isAr ? 'مستخدم مسجل' : 'Registered Users'}
            </p>
          </div>
          
          <button
            onClick={() => router.push(`/${locale}/dashboard/users?academyId=${academy.id}`)}
            className="w-full mt-2 px-4 py-2.5 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl font-medium hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
          >
            {isAr ? 'عرض المستخدمين' : 'View Users'}
          </button>
        </motion.div>

        {/* Dates Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-orange-100 dark:bg-orange-900/30">
              <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white">
              {isAr ? 'التواريخ' : 'Dates'}
            </h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-sm text-zinc-500 dark:text-zinc-500 w-24 shrink-0">
                {isAr ? 'تاريخ الإنشاء:' : 'Created:'}
              </span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {new Date(academy.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-sm text-zinc-500 dark:text-zinc-500 w-24 shrink-0">
                {isAr ? 'آخر تحديث:' : 'Updated:'}
              </span>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {new Date(academy.updated_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6"
      >
        <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-4">
          {isAr ? 'إجراءات سريعة' : 'Quick Actions'}
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => router.push(`/${locale}/dashboard/users?academyId=${academy.id}`)}
            className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all"
          >
            <Users className="w-5 h-5 text-orange-500" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {isAr ? 'إدارة المستخدمين' : 'Manage Users'}
            </span>
          </button>
          
          <button
            onClick={() => router.push(`/${locale}/dashboard/programs?academyId=${academy.id}`)}
            className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all"
          >
            <Globe className="w-5 h-5 text-blue-500" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {isAr ? 'عرض البرامج' : 'View Programs'}
            </span>
          </button>
          
          <button
            onClick={() => router.push(`/${locale}/dashboard/medal-requests?academyId=${academy.id}`)}
            className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:border-orange-300 dark:hover:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition-all"
          >
            <CheckCircle2 className="w-5 h-5 text-amber-500" />
            <span className="font-medium text-zinc-700 dark:text-zinc-300">
              {isAr ? 'طلبات الميداليات' : 'Medal Requests'}
            </span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
