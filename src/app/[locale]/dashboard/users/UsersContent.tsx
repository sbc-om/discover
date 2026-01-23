'use client';

import { useEffect, useState } from 'react';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import {
  Users as UsersIcon,
  UserPlus,
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
  EyeOff
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
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
}

export default function UsersContent() {
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    role_id: '',
    preferred_language: 'en',
    is_active: true
  });

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [page, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(roleFilter && { role: roleFilter })
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setTotal(data.pagination.total);
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

  const splitFullName = (value: string) => {
    const parts = value.trim().split(/\s+/).filter(Boolean);
    const firstName = parts[0] || '';
    const lastName = parts.length > 1 ? parts.slice(1).join(' ') : parts[0] || '';
    return { firstName, lastName };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      const { firstName, lastName } = splitFullName(fullName);
      const payload = {
        ...formData,
        first_name: firstName,
        last_name: lastName
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchUsers();
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const handleEdit = (user: User) => {
    setFullName(`${user.first_name} ${user.last_name}`.trim());
    setEditingUser(user);
    setFormData({
      email: user.email,
      password: '',
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      role_id: user.role_id || '',
      preferred_language: 'en',
      is_active: user.is_active
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingUser(null);
    setFullName('');
    setFormData({
      email: '',
      password: '',
      first_name: '',
      last_name: '',
      phone: '',
      role_id: '',
      preferred_language: 'en',
      is_active: true
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl shadow-lg shadow-orange-500/20">
              <UsersIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">User Management</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage system users and their roles</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="group relative px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 flex items-center gap-2"
          >
            <UserPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Add New User
          </button>
        </div>
      </div>

      {/* Filters Card */}
      <div className="mb-6 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-zinc-900/50 border border-zinc-200 dark:border-zinc-700 p-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by name, email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="relative min-w-[200px]">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer transition-all"
            >
              <option value="">All Roles</option>
              {roles.map((role) => (
                <option key={role.id} value={role.name}>
                  {role.name_en}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        {loading ? (
          <div className="flex items-center justify-center py-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl">
            <UsersIcon className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">No users found</p>
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="group bg-white dark:bg-zinc-800 rounded-2xl shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50 border border-zinc-200 dark:border-zinc-700 hover:shadow-xl hover:shadow-zinc-300/50 dark:hover:shadow-zinc-900/70 transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                      {user.first_name.charAt(0)}{user.last_name.charAt(0)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </h3>
                        {user.email_verified && <CheckCircle2 className="w-5 h-5 text-orange-500" />}
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                            user.is_active
                              ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          {user.is_active ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Active
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              Inactive
                            </>
                          )}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{user.email}</span>
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                            <Phone className="w-4 h-4" />
                            <span className="text-sm">{user.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-3">
                        <Shield className="w-4 h-4 text-orange-500" />
                        <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 rounded-lg text-sm font-medium">
                          {user.name_en}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-orange-100/70 dark:hover:bg-orange-900/20 transition-all group/btn"
                      title="Edit User"
                    >
                      <Edit2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className="p-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-orange-100/70 dark:hover:bg-orange-900/20 transition-all group/btn"
                      title="Delete User"
                    >
                      <Trash2 className="w-5 h-5 group-hover/btn:scale-110 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-800 rounded-2xl shadow-xl shadow-zinc-200/50 dark:shadow-zinc-900/50 border border-zinc-200 dark:border-zinc-700 p-4">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          Showing <span className="font-semibold text-zinc-900 dark:text-white">{users.length}</span> of{' '}
          <span className="font-semibold text-zinc-900 dark:text-white">{total}</span> users
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(5, Math.ceil(total / 10)) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  page === p
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30'
                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-600'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(total / 10)}
            className="px-4 py-2 bg-zinc-100 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] animate-in zoom-in-95 duration-200">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    {editingUser ? <Edit2 className="w-6 h-6 text-white" /> : <UserPlus className="w-6 h-6 text-white" />}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <OverlayScrollbarsComponent
              options={{ scrollbars: { autoHide: 'leave' } }}
              className="max-h-[calc(90vh-96px)]"
            >
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Full Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFullName(value);
                    const { firstName, lastName } = splitFullName(value);
                    setFormData({ ...formData, first_name: firstName, last_name: lastName });
                  }}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Email Address <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required
                    placeholder="john.doe@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Password {editingUser && <span className="text-zinc-500 text-xs">(leave blank to keep current)</span>}
                  {!editingUser && <span className="text-orange-500">*</span>}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    required={!editingUser}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Role <span className="text-orange-500">*</span>
                </label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                  <select
                    value={formData.role_id}
                    onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none cursor-pointer transition-all"
                    required
                  >
                    <option value="">Select a role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-5 h-5 text-orange-600 bg-zinc-100 border-zinc-300 rounded focus:ring-orange-500 focus:ring-2"
                />
                <label htmlFor="is_active" className="text-sm font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  Active User (User can log in and access the system)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200"
                >
                  {editingUser ? 'Update User' : 'Create User'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
              </form>
            </OverlayScrollbarsComponent>
          </div>
        </div>
      )}
    </div>
  );
}
