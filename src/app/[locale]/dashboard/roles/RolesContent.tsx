'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import ModalPortal from '@/components/ModalPortal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/ToastProvider';
import useLocale from '@/hooks/useLocale';
import {
  Shield,
  ShieldPlus,
  Edit2,
  Trash2,
  Users,
  Key,
  Loader2,
  X,
  Check,
  Lock,
  Unlock,
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

interface Permission {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
  action: string;
}

interface Module {
  module_id: string;
  module_name: string;
  module_name_ar: string;
  module_name_en: string;
  icon: string;
  route: string;
  display_order: number;
  permissions: Permission[];
}

interface Role {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
  description: string;
  user_count: number;
  permission_count: number;
}

export default function RolesContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<string>('name_en');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showModal, setShowModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    name_en: '',
    description: ''
  });

  useEffect(() => {
    fetchRoles();
    fetchModules();
  }, [page, limit, search, sortField, sortOrder]);

  // Authority hierarchy for sorting roles
  const roleHierarchy: { [key: string]: number } = {
    'admin': 1,
    'academy_manager': 2,
    'coach': 3,
    'player': 4
  };

  const getRoleColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
      admin: 'from-red-500 to-rose-600',
      coach: 'from-blue-500 to-indigo-600',
      player: 'from-emerald-500 to-teal-600',
      academy_manager: 'from-amber-500 to-orange-600',
    };
    return colors[roleName] || 'from-zinc-500 to-zinc-600';
  };

  const getRoleBadgeColor = (roleName: string) => {
    const colors: { [key: string]: string } = {
      admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      coach: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      player: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      academy_manager: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    };
    return colors[roleName] || 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400';
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

  const sortRolesByAuthority = (rolesList: Role[]) => {
    return [...rolesList].sort((a, b) => {
      const orderA = roleHierarchy[a.name] || 999;
      const orderB = roleHierarchy[b.name] || 999;
      return orderA - orderB;
    });
  };

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortField,
        sortOrder: sortOrder,
        ...(search && { search })
      });

      const response = await fetch(`/api/roles?${params}`);
      const data = await response.json();
      if (response.ok) {
        setRoles(data.roles || []);
        setTotal(data.pagination?.total || data.roles?.length || 0);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch('/api/permissions');
      const data = await response.json();
      if (response.ok) {
        setModules(data.modules);
      }
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchRolePermissions = async (roleId: string) => {
    try {
      const response = await fetch(`/api/roles/${roleId}`);
      const data = await response.json();
      if (response.ok) {
        const permissionIds = data.role.permissions.map((p: any) => p.id);
        setSelectedPermissions(permissionIds);
      }
    } catch (error) {
      console.error('Error fetching role permissions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingRole ? `/api/roles/${editingRole.id}` : '/api/roles';
      const method = editingRole ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchRoles();
      } else {
        const data = await response.json();
        showToast('error', data.message || (isAr ? 'تعذر حفظ الدور' : 'Failed to save role'));
      }
    } catch (error) {
      console.error('Error saving role:', error);
      showToast('error', isAr ? 'تعذر حفظ الدور' : 'Failed to save role');
    }
  };

  const handlePermissionSubmit = async () => {
    if (!selectedRole) return;

    try {
      const response = await fetch(`/api/roles/${selectedRole}/permissions`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permission_ids: selectedPermissions })
      });

      if (response.ok) {
        setShowPermissionModal(false);
        setSelectedRole(null);
        setSelectedPermissions([]);
        fetchRoles();
      } else {
        const data = await response.json();
        showToast('error', data.message || (isAr ? 'تعذر تحديث الصلاحيات' : 'Failed to update permissions'));
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
      showToast('error', isAr ? 'تعذر تحديث الصلاحيات' : 'Failed to update permissions');
    }
  };

  const handleDelete = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchRoles();
        showToast('success', isAr ? 'تم حذف الدور بنجاح' : 'Role deleted successfully');
        return true;
      } else {
        const data = await response.json();
        const errorMsg = data.message || (isAr ? 'تعذر حذف الدور' : 'Failed to delete role');
        setDeleteError(errorMsg);
        showToast('error', errorMsg);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      setDeleteError(isAr ? 'تعذر حذف الدور' : 'Failed to delete role');
      showToast('error', isAr ? 'تعذر حذف الدور' : 'Failed to delete role');
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

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      name_ar: role.name_ar,
      name_en: role.name_en,
      description: role.description || ''
    });
    setShowModal(true);
  };

  const handleManagePermissions = async (roleId: string) => {
    setSelectedRole(roleId);
    await fetchRolePermissions(roleId);
    setShowPermissionModal(true);
  };

  const togglePermission = (permissionId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  const toggleModulePermissions = (module: Module, checked: boolean) => {
    const modulePermissionIds = module.permissions.map((p) => p.id);
    setSelectedPermissions((prev) =>
      checked
        ? [...new Set([...prev, ...modulePermissionIds])]
        : prev.filter((id) => !modulePermissionIds.includes(id))
    );
  };

  const resetForm = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      name_ar: '',
      name_en: '',
      description: ''
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-lg shadow-orange-500/20">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">{isAr ? 'الأدوار' : 'Roles'}</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {isAr ? `إجمالي ${total} دور` : `${total} total roles`}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/25 transition-all text-sm"
        >
          <ShieldPlus className="w-4 h-4" />
          {isAr ? 'إضافة دور' : 'Add Role'}
        </button>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder={isAr ? 'ابحث عن الأدوار...' : 'Search roles...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all"
          />
        </div>
      </div>

      {/* Roles List */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : roles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Shield className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mb-3" />
            <p className="text-zinc-500 dark:text-zinc-400">{isAr ? 'لا توجد أدوار' : 'No roles found'}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th 
                      className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors"
                      onClick={() => handleSort('name_en')}
                    >
                      <div className="flex items-center gap-1.5">
                        {isAr ? 'الدور' : 'Role'}
                        {getSortIcon('name_en')}
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{isAr ? 'الوصف' : 'Description'}</th>
                    <th 
                      className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:text-orange-500 transition-colors"
                      onClick={() => handleSort('user_count')}
                    >
                      <div className="flex items-center gap-1.5">
                        {isAr ? 'المستخدمون' : 'Users'}
                        {getSortIcon('user_count')}
                      </div>
                    </th>
                    <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{isAr ? 'الصلاحيات' : 'Permissions'}</th>
                    <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">{isAr ? 'الإجراءات' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {roles.map((role) => (
                    <motion.tr
                      key={role.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getRoleColor(role.name)} flex items-center justify-center text-white shadow-sm`}>
                            <Shield className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white text-sm">
                              {role.name_en}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400">
                              {role.name_ar}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-md truncate">
                          {role.description || (isAr ? 'بدون وصف' : 'No description')}
                        </p>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-zinc-400" />
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {role.user_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-1.5">
                          <Key className="w-4 h-4 text-zinc-400" />
                          <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {role.permission_count}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleManagePermissions(role.id)}
                            className="p-2 text-zinc-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                            title={isAr ? 'إدارة الصلاحيات' : 'Manage Permissions'}
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(role)}
                            className="p-2 text-zinc-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(role.id)}
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
              {roles.map((role) => (
                <motion.div
                  key={role.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-4"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getRoleColor(role.name)} flex items-center justify-center text-white shadow-sm shrink-0`}>
                      <Shield className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-zinc-900 dark:text-white text-sm">
                        {isAr ? role.name_ar || role.name_en : role.name_en}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {isAr ? role.name_en : role.name_ar}
                      </p>
                    </div>
                  </div>
                  {role.description && (
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                      {role.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {role.user_count}
                      </span>
                      <span className="text-xs text-zinc-500">{isAr ? 'مستخدمون' : 'users'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-zinc-400" />
                      <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {role.permission_count}
                      </span>
                      <span className="text-xs text-zinc-500">{isAr ? 'صلاحيات' : 'perms'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleManagePermissions(role.id)}
                      className="flex-1 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                      {isAr ? 'الصلاحيات' : 'Permissions'}
                    </button>
                    <button
                      onClick={() => handleEdit(role)}
                      className="p-2 text-zinc-500 hover:text-orange-500 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                          <button
                            onClick={() => {
                              setDeleteTarget(role);
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
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {isAr
                  ? `عرض ${((page - 1) * limit) + 1} إلى ${Math.min(page * limit, total)} من أصل ${total} دور`
                  : `Showing ${((page - 1) * limit) + 1} to ${Math.min(page * limit, total)} of ${total} roles`}
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

      <ConfirmDialog
        open={!!deleteTarget}
        title={isAr ? 'حذف الدور؟' : 'Delete role?'}
        description={deleteTarget ? (isAr ? `سيتم حذف دور ${deleteTarget.name_ar || deleteTarget.name_en || deleteTarget.name} نهائياً.` : `This will permanently remove the ${deleteTarget.name_en || deleteTarget.name} role.`) : undefined}
        confirmText={isAr ? 'حذف الدور' : 'Delete Role'}
        cancelText={isAr ? 'إلغاء' : 'Cancel'}
        onClose={() => {
          setDeleteTarget(null);
          setDeleteError(null);
        }}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        errorMessage={deleteError}
      />

      <ModalPortal>
        {/* Role Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {editingRole ? (isAr ? 'تعديل الدور' : 'Edit Role') : (isAr ? 'إضافة دور جديد' : 'Add New Role')}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {/* Body - Scrollable */}
              <OverlayScrollbarsComponent
                options={{ scrollbars: { autoHide: 'leave' } }}
                className="flex-1"
              >
                <form id="role-modal-form" onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {isAr ? 'اسم الدور (النظام)' : 'Role Name (System)'} <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      required
                      disabled={!!editingRole}
                      placeholder={isAr ? 'admin, coach, player' : 'admin, coach, player'}
                    />
                    {editingRole && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {isAr ? 'لا يمكن تغيير اسم النظام' : 'System name cannot be changed'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {isAr ? 'الاسم (بالإنجليزية)' : 'Name (English)'} <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name_en}
                      onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      required
                      placeholder={isAr ? 'Administrator' : 'Administrator'}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      {isAr ? 'الاسم (بالعربية)' : 'Name (Arabic)'} <span className="text-orange-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      required
                      placeholder={isAr ? 'مدير النظام' : 'System Administrator'}
                      dir="rtl"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{isAr ? 'الوصف' : 'Description'}</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                      rows={3}
                      placeholder={isAr ? 'صف الدور ومسؤولياته...' : 'Describe the role and its responsibilities...'}
                    />
                  </div>
                </form>
              </OverlayScrollbarsComponent>

              {/* Footer - Actions */}
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shrink-0 bg-zinc-50 dark:bg-zinc-800/50">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  form="role-modal-form"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all"
                >
                  {editingRole ? (isAr ? 'تحديث الدور' : 'Update Role') : (isAr ? 'إنشاء دور' : 'Create Role')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permission Modal */}
        {showPermissionModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {isAr ? 'إدارة الصلاحيات' : 'Manage Permissions'}
                </h2>
                <button
                  onClick={() => {
                    setShowPermissionModal(false);
                    setSelectedRole(null);
                    setSelectedPermissions([]);
                  }}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body - Scrollable */}
              <OverlayScrollbarsComponent
                options={{ scrollbars: { autoHide: 'leave' } }}
                className="flex-1"
              >
                <div className="p-6 space-y-4">
                  {modules.map((module) => {
                    const modulePermissionIds = module.permissions.map((p) => p.id);
                    const allSelected = modulePermissionIds.every((id) => selectedPermissions.includes(id));
                    const someSelected = modulePermissionIds.some((id) => selectedPermissions.includes(id));

                    return (
                      <div key={module.module_id} className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                        <div className="flex items-center gap-4 p-5 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors">
                          <input
                            type="checkbox"
                            checked={allSelected}
                            ref={(input) => {
                              if (input) input.indeterminate = someSelected && !allSelected;
                            }}
                            onChange={(e) => toggleModulePermissions(module, e.target.checked)}
                            className="w-6 h-6 text-orange-600 bg-white dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-orange-500 focus:ring-2 cursor-pointer"
                        />
                        <div className="flex items-center gap-3 flex-1">
                          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                            {allSelected ? <Unlock className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5 text-white" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                              {isAr ? module.module_name_ar || module.module_name_en : module.module_name_en}
                            </h3>
                          </div>
                        </div>
                        <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                          {selectedPermissions.filter((id) => modulePermissionIds.includes(id)).length} / {module.permissions.length}
                        </div>
                      </div>

                      <div className="px-5 pb-5 pt-2">
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {module.permissions.map((permission) => {
                            const isSelected = selectedPermissions.includes(permission.id);
                            return (
                              <label
                                key={permission.id}
                                className={`relative flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => togglePermission(permission.id)}
                                  className="w-5 h-5 text-orange-600 bg-white dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 rounded focus:ring-orange-500 focus:ring-2 cursor-pointer"
                                />
                                <span className="flex-1 text-sm font-semibold text-zinc-700 dark:text-zinc-200 capitalize">
                                  {isAr ? permission.name_ar || permission.name_en : permission.name_en || permission.name_ar}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              </OverlayScrollbarsComponent>

              {/* Footer - Actions */}
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3 shrink-0 bg-zinc-50 dark:bg-zinc-800/50">
                <button
                  onClick={() => {
                    setShowPermissionModal(false);
                    setSelectedRole(null);
                    setSelectedPermissions([]);
                  }}
                  className="flex-1 px-4 py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  onClick={handlePermissionSubmit}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-all flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  {isAr ? `حفظ الصلاحيات (${selectedPermissions.length})` : `Save Permissions (${selectedPermissions.length})`}
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalPortal>
    </div>
  );
}
