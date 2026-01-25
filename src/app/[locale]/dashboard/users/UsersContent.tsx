'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import ModalPortal from '@/components/ModalPortal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/ToastProvider';
import useLocale from '@/hooks/useLocale';
import {
  Users as UsersIcon,
  UserPlus,
  User,
  Search,
  Filter,
  Edit2,
  Trash2,
  Mail,
  Phone,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  X,
  Eye,
  EyeOff,
  Camera,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  AlertTriangle
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  email_verified: boolean;
  role_id?: string;
  role_name: string;
  name_ar: string;
  name_en: string;
  academy_id?: string | null;
  created_at: string;
  avatar_url?: string;
  completed_level_order?: number | null;
  completed_level_name?: string | null;
  completed_level_name_ar?: string | null;
  has_health_test?: boolean;
  has_program_assignment?: boolean;
}

interface Role {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
}

interface Academy {
  id: string;
  name: string;
  name_ar: string;
}

const roleColors: { [key: string]: string } = {
  admin: 'from-red-500 to-rose-600',
  coach: 'from-orange-500 to-amber-500',
  player: 'from-amber-500 to-yellow-500',
  academy_manager: 'from-amber-500 to-orange-600',
  default: 'from-zinc-500 to-zinc-600'
};

const roleBadgeColors: { [key: string]: string } = {
  admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  coach: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  player: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  academy_manager: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  default: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400'
};

export default function UsersContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentAcademyId, setCurrentAcademyId] = useState<string | null>(null);
  const [currentAcademyName, setCurrentAcademyName] = useState<string | null>(null);
  const [presetRoleName, setPresetRoleName] = useState<'player' | 'coach' | null>(null);
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role_id: '',
    academy_id: '',
    preferred_language: 'en',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchAcademies();
  }, [page, limit, search, roleFilter, sortField, sortOrder]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        if (response.ok) {
          setCurrentUserRole(data.roleName || null);
          setCurrentAcademyId(data.academyId || null);
          setCurrentAcademyName(data.academyName || null);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortField,
        sortOrder: sortOrder,
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter })
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      if (response.ok) {
        setRoles(data.roles);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchAcademies = async () => {
    try {
      const response = await fetch('/api/academies?limit=100');
      const data = await response.json();
      if (response.ok) {
        setAcademies(data.academies || []);
      }
    } catch (error) {
      console.error('Error fetching academies:', error);
    }
  };

  const splitFullName = (value: string) => {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] || '';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
    return { firstName, lastName };
  };

  const isAcademyManager = currentUserRole === 'academy_manager';
  const isAdmin = currentUserRole === 'admin';

  const getRoleIdByName = (roleName: string) =>
    roles.find((role) => role.name === roleName)?.id || '';

  const openCreateWithRole = (roleName: 'player' | 'coach') => {
    resetForm();
    setPresetRoleName(roleName);
    setShowModal(true);
  };

  useEffect(() => {
    if (!isAcademyManager) return;
    setFormData((prev) => ({
      ...prev,
      academy_id: currentAcademyId || ''
    }));
  }, [isAcademyManager, currentAcademyId]);

  useEffect(() => {
    if (!presetRoleName) return;
    const roleId = getRoleIdByName(presetRoleName);
    if (!roleId) return;
    setFormData((prev) => ({
      ...prev,
      role_id: roleId
    }));
  }, [presetRoleName, roles]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('error', isAr ? 'حجم الملف يجب أن يكون أقل من 5MB' : 'File size must be less than 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile) return null;

    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      formData.append('userId', userId);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        return data.avatarUrl;
      } else {
        showToast('error', data.message || (isAr ? 'تعذر رفع الصورة' : 'Failed to upload avatar'));
        return null;
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      showToast('error', isAr ? 'تعذر رفع الصورة' : 'Failed to upload avatar');
      return null;
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      const { firstName, lastName } = splitFullName(fullName);
      const enforcedRoleId = isAcademyManager && presetRoleName
        ? getRoleIdByName(presetRoleName)
        : formData.role_id;

      if (isAcademyManager && !enforcedRoleId) {
        showToast('error', isAr ? 'حدد نوع المستخدم أولاً' : 'Select user type first');
        return;
      }

      const payload = {
        ...formData,
        role_id: enforcedRoleId,
        academy_id: isAcademyManager ? (currentAcademyId || formData.academy_id) : formData.academy_id,
        first_name: firstName,
        last_name: lastName
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        const userId = editingUser?.id || result.user?.id;
        if (avatarFile && userId) {
          const avatarUrl = await uploadAvatar(userId);
          if (avatarUrl) {
            await fetch(`/api/users/${userId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ avatar_url: avatarUrl })
            });
          }
        }

        setShowModal(false);
        resetForm();
        fetchUsers();
      } else {
        showToast('error', result.message || (isAr ? 'تعذر حفظ المستخدم' : 'Failed to save user'));
      }
    } catch (error) {
      console.error('Error saving user:', error);
      showToast('error', isAr ? 'تعذر حفظ المستخدم' : 'Failed to save user');
    }
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchUsers();
        return true;
      } else {
        const data = await response.json();
        setDeleteError(data.message || (isAr ? 'تعذر حذف المستخدم' : 'Failed to delete user'));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setDeleteError(isAr ? 'تعذر حذف المستخدم' : 'Failed to delete user');
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

  const handleEdit = (user: User) => {
    setFullName(`${user.first_name} ${user.last_name}`.trim());
    setEditingUser(user);
    setPresetRoleName(null);
    setAvatarPreview(user.avatar_url || null);
    setFormData({
      email: user.email,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      role_id: user.role_id || '',
      academy_id: user.academy_id || '',
      preferred_language: 'en',
      is_active: user.is_active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFullName('');
    setAvatarFile(null);
    setAvatarPreview(null);
    setPresetRoleName(null);
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      role_id: '',
      academy_id: isAcademyManager ? (currentAcademyId || '') : '',
      preferred_language: 'en',
      is_active: true
    });
  };

  const getRoleColor = (roleName: string) => roleColors[roleName] || roleColors.default;
  const getRoleBadgeColor = (roleName: string) => roleBadgeColors[roleName] || roleBadgeColors.default;

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPage(1); // Reset to first page when sorting changes
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />;
    }
    return sortOrder === 'asc' ? 
      <ArrowUp className="w-3.5 h-3.5 text-orange-500" /> : 
      <ArrowDown className="w-3.5 h-3.5 text-orange-500" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isAr ? 'ar' : 'en', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const selectedRole = roles.find((role) => role.id === formData.role_id) || null;
  const selectedRoleLabel = selectedRole
    ? (isAr ? selectedRole.name_ar || selectedRole.name_en : selectedRole.name_en)
    : presetRoleName
      ? (isAr ? (presetRoleName === 'player' ? 'لاعب' : 'مدرب') : (presetRoleName === 'player' ? 'Player' : 'Coach'))
      : (isAr ? 'اختر نوع المستخدم' : 'Select user type');

  const completedPlayers = isAdmin
    ? users.filter((user) => user.role_name === 'player' && user.completed_level_order)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-500/20">
            <UsersIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{isAr ? 'المستخدمون' : 'Users'}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {isAr ? `إجمالي ${total} مستخدم` : `${total} total users`}
            </p>
          </div>
        </div>
        {isAcademyManager ? (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openCreateWithRole('player')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25 transition-all text-sm"
            >
              <UserPlus className="w-4 h-4" />
              {isAr ? 'إضافة لاعب' : 'Add Player'}
            </button>
            <button
              onClick={() => openCreateWithRole('coach')}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/25 transition-all text-sm"
            >
              <UserPlus className="w-4 h-4" />
              {isAr ? 'إضافة مدرب' : 'Add Coach'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/25 transition-all text-sm"
          >
            <UserPlus className="w-4 h-4" />
            {isAr ? 'إضافة مستخدم' : 'Add User'}
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={isAr ? 'ابحث عن المستخدمين...' : 'Search users...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
          />
        </div>
        <div className="relative sm:w-56">
          <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer transition-all hover:border-zinc-300 dark:hover:border-zinc-700"
          >
            <option value="" className="bg-white dark:bg-zinc-900">{isAr ? '🎯 كل الأدوار' : '🎯 All Roles'}</option>
            {roles.map((role) => (
              <option key={role.id} value={role.name} className="bg-white dark:bg-zinc-900">
                {role.name === 'admin' && '👑'}
                {role.name === 'coach' && '⚽'}
                {role.name === 'player' && '🏃'}
                {role.name === 'academy_manager' && '🎓'}
                {' '}{isAr ? role.name_ar || role.name_en : role.name_en}
              </option>
            ))}
          </select>
          <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 rotate-90 pointer-events-none" />
        </div>
      </div>

      {/* Legend for Player Indicators */}
      {roleFilter === 'player' || roleFilter === '' ? (
        <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-800/50 p-3">
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="font-semibold text-zinc-700 dark:text-zinc-300">
              {isAr ? 'دليل الرموز:' : 'Legend:'}
            </span>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400" />
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                {isAr ? 'لم يتم التقييم' : 'Not assessed'}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-red-100 dark:bg-red-900/30">
                <AlertTriangle className="w-3 h-3 text-red-700 dark:text-red-400" />
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                {isAr ? 'غير مسجل في برنامج' : 'Not assigned to program'}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Users List */}
      {isAdmin && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
              {isAr ? 'مكتملو المستويات' : 'Completed Levels'}
            </h3>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {completedPlayers.length}
            </span>
          </div>
          {completedPlayers.length === 0 ? (
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isAr ? 'لا يوجد لاعبون أكملوا مستوى بعد.' : 'No players have completed a level yet.'}
            </p>
          ) : (
            <div className="space-y-2">
              {completedPlayers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/40 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 rounded-full bg-gradient-to-br ${getRoleColor(user.role_name)} flex items-center justify-center text-white text-[10px] font-semibold overflow-hidden`}>
                      {user.avatar_url ? (
                        <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span>{user.first_name.charAt(0)}{user.last_name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-100">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                        {isAr ? (user.completed_level_name_ar || user.completed_level_name) : (user.completed_level_name || user.completed_level_name_ar)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 text-[10px] font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      {isAr ? 'مكتمل' : 'Completed'}
                    </span>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400">
                      {isAr ? `المستوى ${user.completed_level_order}` : `Level ${user.completed_level_order}`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <UsersIcon className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400">{isAr ? 'لا يوجد مستخدمون' : 'No users found'}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th 
                      className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors group"
                      onClick={() => handleSort('first_name')}
                    >
                      <div className="flex items-center gap-1.5">
                        {isAr ? 'المستخدم' : 'User'}
                        {getSortIcon('first_name')}
                      </div>
                    </th>
                    <th 
                      className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors group"
                      onClick={() => handleSort('email')}
                    >
                      <div className="flex items-center gap-1.5">
                        {isAr ? 'التواصل' : 'Contact'}
                        {getSortIcon('email')}
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{isAr ? 'الدور' : 'Role'}</th>
                    <th 
                      className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors group"
                      onClick={() => handleSort('is_active')}
                    >
                      <div className="flex items-center gap-1.5">
                        {isAr ? 'الحالة' : 'Status'}
                        {getSortIcon('is_active')}
                      </div>
                    </th>
                    <th 
                      className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors group"
                      onClick={() => handleSort('created_at')}
                    >
                      <div className="flex items-center gap-1.5">
                        {isAr ? 'تاريخ الانضمام' : 'Joined'}
                        {getSortIcon('created_at')}
                      </div>
                    </th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{isAr ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {users.map((user) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor(user.role_name)} flex items-center justify-center text-white font-semibold text-sm overflow-hidden shadow-sm`}>
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span>{user.first_name.charAt(0)}{user.last_name.charAt(0)}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-zinc-900 dark:text-white text-sm">
                                {user.first_name} {user.last_name}
                              </p>
                              {user.role_name === 'player' && (
                                <>
                                  {!user.has_health_test && (
                                    <span 
                                      className="inline-flex items-center justify-center w-5 h-5 rounded bg-amber-100 dark:bg-amber-900/30"
                                      title={isAr ? 'لم يتم التقييم' : 'Not assessed'}
                                    >
                                      <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                                    </span>
                                  )}
                                  {!user.has_program_assignment && (
                                    <span 
                                      className="inline-flex items-center justify-center w-5 h-5 rounded bg-red-100 dark:bg-red-900/30"
                                      title={isAr ? 'غير مسجل في برنامج' : 'Not assigned to program'}
                                    >
                                      <AlertTriangle className="w-3 h-3 text-red-700 dark:text-red-400" />
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                            {user.email_verified && (
                              <p className="text-[10px] text-orange-600 dark:text-orange-400 flex items-center gap-0.5 mt-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                {isAr ? 'موثق' : 'Verified'}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="space-y-0.5">
                          <p className="text-sm text-zinc-600 dark:text-zinc-300 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-zinc-400" />
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-zinc-400" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role_name)}`}>
                          <Shield className="w-3 h-3" />
                            {isAr ? user.name_ar || user.name_en || user.role_name : user.name_en || user.role_name}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.is_active
                            ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                            : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                        }`}>
                          {user.is_active ? (
                            <><CheckCircle2 className="w-3 h-3" /> {isAr ? 'نشط' : 'Active'}</>
                          ) : (
                            <><XCircle className="w-3 h-3" /> {isAr ? 'غير نشط' : 'Inactive'}</>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {formatDate(user.created_at)}
                        </p>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          {user.role_name === 'player' && (
                            <Link
                              href={`/${locale}/dashboard/players/${user.id}`}
                              title={isAr ? 'عرض ملف اللاعب' : 'View player profile'}
                              className="p-2 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            >
                              <User className="w-4 h-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-2 text-zinc-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setDeleteTarget(user);
                              setDeleteError(null);
                            }}
                            className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-zinc-100 dark:divide-zinc-800">
              {users.map((user) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4 flex items-center gap-3"
                >
                  <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRoleColor(user.role_name)} flex items-center justify-center text-white font-semibold overflow-hidden shrink-0 shadow-sm`}>
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span>{user.first_name.charAt(0)}{user.last_name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-medium text-zinc-900 dark:text-white text-sm truncate">
                        {user.first_name} {user.last_name}
                      </p>
                      <span className={`shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${getRoleBadgeColor(user.role_name)}`}>
                        {isAr ? user.name_ar || user.name_en || user.role_name : user.name_en || user.role_name}
                      </span>
                      {user.role_name === 'player' && (
                        <>
                          {!user.has_health_test && (
                            <span 
                              className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded bg-amber-100 dark:bg-amber-900/30"
                              title={isAr ? 'لم يتم التقييم' : 'Not assessed'}
                            >
                              <AlertTriangle className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                            </span>
                          )}
                          {!user.has_program_assignment && (
                            <span 
                              className="shrink-0 inline-flex items-center justify-center w-5 h-5 rounded bg-red-100 dark:bg-red-900/30"
                              title={isAr ? 'غير مسجل في برنامج' : 'Not assigned to program'}
                            >
                              <AlertTriangle className="w-3 h-3 text-red-700 dark:text-red-400" />
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user.email}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {user.role_name === 'player' && (
                      <Link
                        href={`/${locale}/dashboard/players/${user.id}`}
                        title={isAr ? 'عرض ملف اللاعب' : 'View player profile'}
                        className="p-2 text-zinc-500 hover:text-emerald-600 rounded-lg transition-colors"
                      >
                        <User className="w-4 h-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2 text-zinc-500 hover:text-orange-500 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setDeleteTarget(user);
                        setDeleteError(null);
                      }}
                      className="p-2 text-zinc-500 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-4 mt-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {isAr
                  ? `عرض ${((page - 1) * limit) + 1} إلى ${Math.min(page * limit, total)} من أصل ${total} مستخدم`
                  : `Showing ${((page - 1) * limit) + 1} to ${Math.min(page * limit, total)} of ${total} users`}
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
                  <option value="100" className="bg-white dark:bg-zinc-900">100</option>
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

      <ConfirmDialog
        open={!!deleteTarget}
        title={isAr ? 'حذف المستخدم؟' : 'Delete user?'}
        description={deleteTarget ? (isAr ? `سيتم حذف ${deleteTarget.first_name} ${deleteTarget.last_name} نهائياً.` : `This will permanently remove ${deleteTarget.first_name} ${deleteTarget.last_name}.`) : undefined}
        confirmText={isAr ? 'حذف المستخدم' : 'Delete User'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        errorMessage={deleteError}
      />

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
                    {editingUser ? (isAr ? 'تعديل المستخدم' : 'Edit User') : (isAr ? 'إضافة مستخدم جديد' : 'Add New User')}
                  </h2>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form id="user-modal-form" onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
                  {/* Body - Scrollable */}
                  <OverlayScrollbarsComponent
                    options={{ scrollbars: { autoHide: 'leave' } }}
                    className="flex-1"
                  >
                    <div className="p-6 space-y-5">
                {/* Avatar Upload */}
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-2xl overflow-hidden">
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="" className="w-full h-full object-cover" />
                      ) : editingUser ? (
                        <span>{editingUser.first_name.charAt(0)}{editingUser.last_name.charAt(0)}</span>
                      ) : (
                        <Camera className="w-8 h-8" />
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
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {isAr ? 'الاسم الكامل' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                    placeholder={isAr ? 'الاسم الكامل' : 'John Doe'}
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {isAr ? 'البريد الإلكتروني' : 'Email'}
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                    placeholder={isAr ? 'example@domain.com' : 'john@example.com'}
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {isAr ? 'كلمة المرور' : 'Password'} {editingUser && <span className="text-zinc-400">{isAr ? '(اتركه فارغاً للاحتفاظ بالحالي)' : '(leave empty to keep current)'}</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all pr-12"
                      placeholder="••••••••"
                      required={!editingUser}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Phone & Role */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {isAr ? 'رقم الهاتف' : 'Phone'}
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
                      placeholder={isAr ? '+968XXXXXXXX' : '+1234567890'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {isAr ? 'الدور' : 'Role'}
                    </label>
                    {isAcademyManager ? (
                      <div className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white">
                        {selectedRoleLabel}
                      </div>
                    ) : (
                      <select
                        value={formData.role_id}
                        onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                        className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer transition-all"
                        required
                      >
                        <option value="">{isAr ? 'اختر الدور' : 'Select role'}</option>
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {isAr ? role.name_ar || role.name_en : role.name_en}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Academy */}
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {isAr ? 'الأكاديمية' : 'Academy'}
                  </label>
                  {isAcademyManager ? (
                    <div className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white">
                      {currentAcademyName || (isAr ? 'غير محدد' : 'Not set')}
                    </div>
                  ) : (
                    <select
                      value={formData.academy_id}
                      onChange={(e) => setFormData({ ...formData, academy_id: e.target.value })}
                      className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50 appearance-none cursor-pointer transition-all"
                    >
                      <option value="">{isAr ? 'بدون أكاديمية' : 'No academy'}</option>
                      {academies.map((academy) => (
                        <option key={academy.id} value={academy.id}>
                          {isAr ? academy.name_ar || academy.name : academy.name}
                        </option>
                      ))}
                    </select>
                  )}
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
                        <span className="text-sm text-zinc-700 dark:text-zinc-300">{isAr ? 'مستخدم نشط' : 'Active User'}</span>
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
                      disabled={uploadingAvatar}
                      className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {isAr ? 'جارٍ الرفع...' : 'Uploading...'}
                        </>
                      ) : (
                        editingUser ? (isAr ? 'تحديث المستخدم' : 'Update User') : (isAr ? 'إنشاء مستخدم' : 'Create User')
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
