'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import ModalPortal from '@/components/ModalPortal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/ToastProvider';
import useLocale from '@/hooks/useLocale';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Users,
  MapPin,
  Loader2,
  X,
  Camera,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  Mail
} from 'lucide-react';

interface Academy {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  address: string;
  city: string;
  country: string;
  logo_url: string;
  is_active: boolean;
  manager_id: string;
  manager_first_name: string;
  manager_last_name: string;
  manager_email: string;
  user_count: number;
  created_at: string;
}

interface Manager {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export default function AcademiesContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const router = useRouter();
  const searchParams = useSearchParams();
  // Read URL params once for initial state
  const statusParam = searchParams.get('status');
  const hasUsersParam = searchParams.get('hasUsers');
  
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // Initialize filters directly from URL
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(() => 
    (statusParam === 'active' || statusParam === 'inactive') ? statusParam : 'all'
  );
  const [hasUsersFilter, setHasUsersFilter] = useState<boolean | null>(() => 
    hasUsersParam === 'true' ? true : hasUsersParam === 'false' ? false : null
  );
  const [showModal, setShowModal] = useState(false);
  const [editingAcademy, setEditingAcademy] = useState<Academy | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Academy | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    address: '',
    city: '',
    country: '',
    manager_id: '',
    is_active: true
  });

  // Sync filters when URL params change
  useEffect(() => {
    const currentStatusParam = searchParams.get('status');
    const currentHasUsersParam = searchParams.get('hasUsers');
    
    const newStatusFilter = (currentStatusParam === 'active' || currentStatusParam === 'inactive') ? currentStatusParam : 'all';
    const newHasUsersFilter = currentHasUsersParam === 'true' ? true : currentHasUsersParam === 'false' ? false : null;
    
    if (newStatusFilter !== statusFilter) {
      setStatusFilter(newStatusFilter);
    }
    if (newHasUsersFilter !== hasUsersFilter) {
      setHasUsersFilter(newHasUsersFilter);
    }
  }, [searchParams]);

  // Check admin status once on mount
  useEffect(() => {
    checkIsAdmin();
  }, []);

  useEffect(() => {
    fetchAcademies();
    fetchManagers();
  }, [page, limit, search, sortField, sortOrder, statusFilter, hasUsersFilter]);

  const checkIsAdmin = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.roleName === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchAcademies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortField,
        sortOrder: sortOrder,
        ...(search && { search })
      });

      // Add status filter if not 'all'
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      // Add hasUsers filter if set
      if (hasUsersFilter !== null) {
        params.append('hasUsers', hasUsersFilter.toString());
      }

      const response = await fetch(`/api/academies?${params}`);
      const data = await response.json();

      if (response.ok) {
        setAcademies(data.academies);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching academies:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchManagers = async () => {
    try {
      // Fetch users with academy_manager role who don't have an academy yet
      const response = await fetch('/api/users?role=academy_manager&limit=100');
      const data = await response.json();
      if (response.ok) {
        setManagers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching managers:', error);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="w-3.5 h-3.5 text-orange-500" /> : 
      <ArrowDown className="w-3.5 h-3.5 text-orange-500" />;
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLogo = async (): Promise<string | null> => {
    if (!logoFile) return editingAcademy?.logo_url || null;

    setUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('file', logoFile);
      formData.append('type', 'academy');

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        return data.url;
      }
      return null;
    } catch (error) {
      console.error('Error uploading logo:', error);
      return null;
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const logoUrl = await uploadLogo();

    const payload = {
      ...formData,
      logo_url: logoUrl
    };

    try {
      const url = editingAcademy 
        ? `/api/academies/${editingAcademy.id}` 
        : '/api/academies';
      
      const response = await fetch(url, {
        method: editingAcademy ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchAcademies();
        fetchManagers();
      } else {
        const data = await response.json();
        showToast('error', data.message || (isAr ? 'تعذر حفظ الأكاديمية' : 'Failed to save academy'));
      }
    } catch (error) {
      console.error('Error saving academy:', error);
      showToast('error', isAr ? 'تعذر حفظ الأكاديمية' : 'Failed to save academy');
    }
  };

  const handleEdit = (academy: Academy) => {
    setEditingAcademy(academy);
    setFormData({
      name: academy.name,
      name_ar: academy.name_ar || '',
      description: academy.description || '',
      address: academy.address || '',
      city: academy.city || '',
      country: academy.country || '',
      manager_id: academy.manager_id || '',
      is_active: academy.is_active
    });
    setLogoPreview(academy.logo_url);
    setShowModal(true);
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/academies/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchAcademies();
        return true;
      } else {
        const data = await response.json();
        setDeleteError(data.message || (isAr ? 'تعذر حذف الأكاديمية' : 'Failed to delete academy'));
      }
    } catch (error) {
      console.error('Error deleting academy:', error);
      setDeleteError(isAr ? 'تعذر حذف الأكاديمية' : 'Failed to delete academy');
    }
    return false;
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const success = await handleDelete(deleteTarget.id);
      if (success) setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  const resetForm = () => {
    setEditingAcademy(null);
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      address: '',
      city: '',
      country: '',
      manager_id: '',
      is_active: true
    });
    setLogoFile(null);
    setLogoPreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Filter Banner */}
      {(statusFilter !== 'all' || hasUsersFilter !== null) && (
        <div className="bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-zinc-700 dark:text-zinc-300">
              {statusFilter === 'inactive' && hasUsersFilter === true
                ? isAr
                  ? '🔍 عرض الأكاديميات غير النشطة التي بها مستخدمون'
                  : '🔍 Showing inactive academies with users'
                : statusFilter === 'inactive'
                ? isAr
                  ? '🔍 عرض الأكاديميات غير النشطة'
                  : '🔍 Showing inactive academies'
                : statusFilter === 'active'
                ? isAr
                  ? '🔍 عرض الأكاديميات النشطة'
                  : '🔍 Showing active academies'
                : hasUsersFilter === true
                ? isAr
                  ? '🔍 عرض الأكاديميات التي بها مستخدمون'
                  : '🔍 Showing academies with users'
                : isAr
                  ? '🔍 عرض الأكاديميات بدون مستخدمين'
                  : '🔍 Showing academies without users'}
            </p>
            <button
              onClick={() => {
                setStatusFilter('all');
                setHasUsersFilter(null);
                window.history.pushState({}, '', '/dashboard/academies');
              }}
              className="text-xs text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 font-medium"
            >
              {isAr ? 'إزالة الفلتر' : 'Clear Filter'}
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{isAr ? 'الأكاديميات' : 'Academies'}</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {isAr ? `إجمالي ${total} أكاديمية` : `${total} total academies`}
          </p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/25 transition-all text-sm"
        >
          <Plus className="w-4 h-4" />
          {isAr ? 'إضافة أكاديمية' : 'Add Academy'}
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={isAr ? 'ابحث عن الأكاديمية...' : 'Search academies...'}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : academies.length === 0 ? (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center py-20">
            <Building2 className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400">{isAr ? 'لا توجد أكاديميات' : 'No academies found'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {academies.map((academy) => (
              <motion.div
                key={academy.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="group relative bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden hover:border-orange-300 dark:hover:border-orange-700 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
              >
                {/* Status Badge - Floating */}
                <div className="absolute top-4 right-4 z-10">
                  {academy.is_active ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/90 text-white shadow-lg backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                      {isAr ? 'نشط' : 'Active'}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-zinc-500/90 text-white shadow-lg backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-300" />
                      {isAr ? 'غير نشط' : 'Inactive'}
                    </span>
                  )}
                </div>

                {/* Logo/Header Area - Fixed Height with Full Image Display */}
                <div className="relative h-44 bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                  {academy.logo_url ? (
                    <>
                      {/* Main Image - Fill Container Completely */}
                      <img 
                        src={academy.logo_url} 
                        alt={academy.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      />
                      
                      {/* Subtle Overlay for better contrast */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
                    </>
                  ) : (
                    <>
                      {/* Background Pattern for no-logo */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 dark:from-zinc-800 dark:via-zinc-850 dark:to-zinc-900">
                        <div className="absolute inset-0 opacity-[0.05]" style={{
                          backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                          backgroundSize: '16px 16px'
                        }} />
                      </div>
                      {/* Default Icon */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 via-amber-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/20 group-hover:scale-105 group-hover:shadow-orange-500/30 transition-all duration-500">
                          <Building2 className="w-10 h-10 text-white" />
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Name */}
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1">
                      {academy.name}
                    </h3>
                    {academy.name_ar && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1">{academy.name_ar}</p>
                    )}
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {/* Location */}
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{isAr ? 'الموقع' : 'Location'}</p>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200 truncate">
                          {academy.city || (isAr ? 'غير محدد' : 'N/A')}
                        </p>
                      </div>
                    </div>

                    {/* Users Count */}
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                      <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500">{isAr ? 'المستخدمون' : 'Users'}</p>
                        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                          {academy.user_count}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Manager Info */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-zinc-800 dark:to-zinc-800/50 border border-orange-100 dark:border-zinc-700">
                    {academy.manager_first_name ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {academy.manager_first_name.charAt(0)}{academy.manager_last_name?.charAt(0) || ''}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[10px] uppercase tracking-wider text-orange-600/70 dark:text-orange-400/70">{isAr ? 'المدير' : 'Manager'}</p>
                            <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate">
                              {academy.manager_first_name} {academy.manager_last_name}
                            </p>
                          </div>
                        </div>
                        {academy.manager_email && (
                          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 pl-13">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate">{academy.manager_email}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center">
                          <Users className="w-4 h-4 text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-zinc-400">{isAr ? 'المدير' : 'Manager'}</p>
                          <p className="text-sm text-zinc-400 italic">{isAr ? 'لم يتم التعيين' : 'Not assigned'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Created Date */}
                  <div className="flex items-center gap-2 mt-3 text-xs text-zinc-400 dark:text-zinc-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{isAr ? 'تاريخ الإنشاء:' : 'Created:'} {new Date(academy.created_at).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  </div>

                  {/* Actions - Always visible with all buttons */}
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    {/* View Details Button */}
                    <button
                      onClick={() => router.push(`/${locale}/dashboard/programs?academyId=${academy.id}`)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                      title={isAr ? 'عرض التفاصيل' : 'View Details'}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">{isAr ? 'عرض' : 'View'}</span>
                    </button>
                    
                    {/* Edit Button */}
                    <button
                      onClick={() => handleEdit(academy)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                      title={isAr ? 'تعديل' : 'Edit'}
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{isAr ? 'تعديل' : 'Edit'}</span>
                    </button>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => {
                        setDeleteTarget(academy);
                        setDeleteError(null);
                      }}
                      className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                      title={isAr ? 'حذف' : 'Delete'}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">{isAr ? 'حذف' : 'Delete'}</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title={isAr ? 'حذف الأكاديمية؟' : 'Delete academy?'}
        description={deleteTarget ? (isAr ? `سيتم حذف ${deleteTarget.name} نهائياً.` : `This will permanently remove ${deleteTarget.name}.`) : undefined}
        confirmText={isAr ? 'حذف الأكاديمية' : 'Delete Academy'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        errorMessage={deleteError}
      />

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {isAr
                  ? `عرض ${((page - 1) * limit) + 1} إلى ${Math.min(page * limit, total)} من أصل ${total} أكاديمية`
                  : `Showing ${((page - 1) * limit) + 1} to ${Math.min(page * limit, total)} of ${total} academies`}
              </p>
              <div className="h-5 w-px bg-zinc-300 dark:bg-zinc-700" />
              <div className="flex items-center gap-2">
                <label className="text-sm text-zinc-600 dark:text-zinc-400">{isAr ? 'لكل صفحة:' : 'Per page:'}</label>
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  className="px-2.5 py-1 bg-transparent border border-zinc-200 dark:border-zinc-700 rounded-lg text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 cursor-pointer hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
                >
                  <option value="10" className="bg-white dark:bg-zinc-900">10</option>
                  <option value="12" className="bg-white dark:bg-zinc-900">12</option>
                  <option value="20" className="bg-white dark:bg-zinc-900">20</option>
                  <option value="50" className="bg-white dark:bg-zinc-900">50</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-zinc-200 dark:disabled:hover:border-zinc-700 transition-colors text-sm font-medium"
              >
                {isAr ? 'الأول' : 'First'}
              </button>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-zinc-200 dark:disabled:hover:border-zinc-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {/* Page Numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`min-w-[2.5rem] px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        page === pageNum
                          ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                          : 'border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-zinc-200 dark:disabled:hover:border-zinc-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:border-zinc-200 dark:disabled:hover:border-zinc-700 transition-colors text-sm font-medium"
              >
                {isAr ? 'الأخير' : 'Last'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <ModalPortal>
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
              >
                {/* Header */}
                <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                  <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                    {editingAcademy ? (isAr ? 'تعديل الأكاديمية' : 'Edit Academy') : (isAr ? 'إضافة أكاديمية جديدة' : 'Add New Academy')}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                  {/* Body - Scrollable */}
                  <OverlayScrollbarsComponent
                    options={{ scrollbars: { autoHide: 'leave' } }}
                    className="flex-1"
                  >
                    <div className="p-6 space-y-5">
                    {/* Logo Upload */}
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-40 h-24 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500 font-bold text-2xl overflow-hidden">
                          {logoPreview ? (
                            <img src={logoPreview} alt="" className="w-full h-full object-contain" />
                          ) : (
                            <Building2 className="w-10 h-10" />
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-0 right-0 p-2 bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-orange-500 transition-colors"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* Name */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          {isAr ? 'الاسم (بالإنجليزية)' : 'Name (English)'}
                        </label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          placeholder={isAr ? 'اسم الأكاديمية' : 'Academy name'}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          {isAr ? 'الاسم (بالعربية)' : 'Name (Arabic)'}
                        </label>
                        <input
                          type="text"
                          value={formData.name_ar}
                          onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          placeholder={isAr ? 'اسم الأكاديمية' : 'Academy name in Arabic'}
                          dir="rtl"
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {isAr ? 'الوصف' : 'Description'}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none"
                        placeholder={isAr ? 'وصف الأكاديمية...' : 'Academy description...'}
                      />
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          {isAr ? 'المدينة' : 'City'}
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          placeholder={isAr ? 'المدينة' : 'City'}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                          {isAr ? 'الدولة' : 'Country'}
                        </label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                          className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                          placeholder={isAr ? 'الدولة' : 'Country'}
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {isAr ? 'العنوان' : 'Address'}
                      </label>
                      <input
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                        placeholder={isAr ? 'العنوان الكامل' : 'Full address'}
                      />
                    </div>

                    {/* Manager */}
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                        {isAr ? 'مدير الأكاديمية' : 'Academy Manager'}
                      </label>
                      <select
                        value={formData.manager_id}
                        onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer"
                      >
                        <option value="">{isAr ? 'اختر المدير (اختياري)' : 'Select manager (optional)'}</option>
                        {managers.map((manager) => (
                          <option key={manager.id} value={manager.id}>
                            {manager.first_name} {manager.last_name} ({manager.email})
                          </option>
                        ))}
                        {editingAcademy?.manager_id && !managers.find(m => m.id === editingAcademy.manager_id) && (
                          <option value={editingAcademy.manager_id}>
                            {editingAcademy.manager_first_name} {editingAcademy.manager_last_name} ({editingAcademy.manager_email})
                          </option>
                        )}
                      </select>
                    </div>

                    {/* Active Status */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                        className={`relative w-11 h-6 rounded-full transition-colors ${
                          formData.is_active ? 'bg-orange-500' : 'bg-zinc-300 dark:bg-zinc-700'
                        }`}
                      >
                        <span
                          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                            formData.is_active ? 'translate-x-5' : ''
                          }`}
                        />
                      </button>
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        {isAr ? 'أكاديمية نشطة' : 'Active Academy'}
                      </span>
                    </div>
                    </div>
                  </OverlayScrollbarsComponent>

                  {/* Footer - Actions */}
                  <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shrink-0 bg-zinc-50 dark:bg-zinc-800/50">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                      {isAr ? 'إلغاء' : 'Cancel'}
                    </button>
                    <button
                      type="submit"
                      disabled={uploadingLogo}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploadingLogo ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isAr ? 'جارٍ الرفع...' : 'Uploading...'}
                        </>
                      ) : (
                        editingAcademy ? (isAr ? 'تحديث الأكاديمية' : 'Update Academy') : (isAr ? 'إنشاء الأكاديمية' : 'Create Academy')
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </ModalPortal>
    </div>
  );
}
