'use client';

import { useEffect, useState } from 'react';
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
  Unlock
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
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
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
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/roles');
      const data = await response.json();
      if (response.ok) {
        setRoles(data.roles);
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
        alert(data.message);
      }
    } catch (error) {
      console.error('Error saving role:', error);
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
        alert(data.message);
      }
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this role?')) return;

    try {
      const response = await fetch(`/api/roles/${id}`, { method: 'DELETE' });
      if (response.ok) {
        fetchRoles();
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
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
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 dark:from-orange-600 dark:to-amber-700 rounded-2xl shadow-lg shadow-orange-500/20">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-white">Role Management</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage roles and their permissions</p>
            </div>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="group relative px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 flex items-center gap-2"
          >
            <ShieldPlus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Add New Role
          </button>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : roles.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 bg-white dark:bg-zinc-800 rounded-2xl shadow-xl">
            <Shield className="w-16 h-16 text-zinc-300 dark:text-zinc-600 mb-4" />
            <p className="text-zinc-500 dark:text-zinc-400 text-lg">No roles found</p>
          </div>
        ) : (
          roles.map((role) => (
            <div
              key={role.id}
              className="group bg-white dark:bg-zinc-800 rounded-2xl shadow-lg shadow-zinc-200/50 dark:shadow-zinc-900/50 border border-zinc-200 dark:border-zinc-700 hover:shadow-xl hover:shadow-zinc-300/50 dark:hover:shadow-zinc-900/70 transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl shadow-lg">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{role.name_en}</h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">{role.name_ar}</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 min-h-[40px]">
                  {role.description || 'No description provided'}
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-orange-50/60 dark:bg-orange-900/20 rounded-xl border border-orange-100/70 dark:border-orange-900/40">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <Users className="w-4 h-4" />
                      <span className="text-xs font-medium">Users</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1">{role.user_count}</p>
                  </div>
                  <div className="p-3 bg-orange-50/60 dark:bg-orange-900/20 rounded-xl border border-orange-100/70 dark:border-orange-900/40">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
                      <Key className="w-4 h-4" />
                      <span className="text-xs font-medium">Permissions</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1">{role.permission_count}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleManagePermissions(role.id)}
                    className="px-3 py-2.5 bg-zinc-100 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-orange-50/70 dark:hover:bg-orange-900/20 transition-all text-sm font-medium flex items-center justify-center gap-1.5 group/btn"
                    title="Manage Permissions"
                  >
                    <Key className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    Permissions
                  </button>
                  <button
                    onClick={() => handleEdit(role)}
                    className="px-3 py-2.5 bg-zinc-100 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-orange-50/70 dark:hover:bg-orange-900/20 transition-all text-sm font-medium flex items-center justify-center gap-1.5 group/btn"
                    title="Edit Role"
                  >
                    <Edit2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(role.id)}
                    className="px-3 py-2.5 bg-zinc-100 dark:bg-zinc-900/40 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-orange-50/70 dark:hover:bg-orange-900/20 transition-all text-sm font-medium flex items-center justify-center group/btn"
                    title="Delete Role"
                  >
                    <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-700 dark:to-amber-700 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    {editingRole ? <Edit2 className="w-6 h-6 text-white" /> : <ShieldPlus className="w-6 h-6 text-white" />}
                  </div>
                  <h2 className="text-2xl font-bold text-white">{editingRole ? 'Edit Role' : 'Add New Role'}</h2>
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

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Role Name (System) <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={!!editingRole}
                  placeholder="admin, coach, player"
                />
                {editingRole && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">System name cannot be changed</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Name (English) <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                  placeholder="Administrator"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                  Name (Arabic) <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                  required
                  placeholder="مدير النظام"
                  dir="rtl"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder="Describe the role and its responsibilities..."
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200"
                >
                  {editingRole ? 'Update Role' : 'Create Role'}
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
          </div>
        </div>
      )}

      {/* Permission Modal */}
      {showPermissionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-zinc-800 rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-700 dark:to-amber-700 p-6 rounded-t-3xl z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <Key className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Manage Permissions</h2>
                    <p className="text-orange-100 text-sm mt-0.5">Configure role access to modules and actions</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowPermissionModal(false);
                    setSelectedRole(null);
                    setSelectedPermissions([]);
                  }}
                  className="p-2 hover:bg-white/20 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
              {modules.map((module) => {
                const modulePermissionIds = module.permissions.map((p) => p.id);
                const allSelected = modulePermissionIds.every((id) => selectedPermissions.includes(id));
                const someSelected = modulePermissionIds.some((id) => selectedPermissions.includes(id));

                return (
                  <div key={module.module_id} className="bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                    <label className="flex items-center gap-4 p-5 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                      <div className="relative">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          ref={(input) => {
                            if (input) input.indeterminate = someSelected && !allSelected;
                          }}
                          onChange={(e) => toggleModulePermissions(module, e.target.checked)}
                          className="w-6 h-6 text-orange-600 bg-white dark:bg-zinc-700 border-zinc-300 dark:border-zinc-600 rounded-lg focus:ring-orange-500 focus:ring-2 cursor-pointer"
                        />
                        {someSelected && !allSelected && (
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-3 h-0.5 bg-orange-600"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                          {allSelected ? <Unlock className="w-5 h-5 text-white" /> : <Lock className="w-5 h-5 text-white" />}
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">{module.module_name_en}</h3>
                          <p className="text-sm text-zinc-500 dark:text-zinc-400">{module.module_name_ar}</p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
                        {selectedPermissions.filter((id) => modulePermissionIds.includes(id)).length} / {module.permissions.length}
                      </div>
                    </label>

                    <div className="px-5 pb-5 pt-2">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {module.permissions.map((permission) => {
                          const isSelected = selectedPermissions.includes(permission.id);
                          const actionColors = {
                            create: 'from-orange-500 to-amber-600',
                            read: 'from-orange-500 to-amber-600',
                            update: 'from-orange-500 to-amber-600',
                            delete: 'from-orange-500 to-amber-600'
                          };
                          const actionColor = actionColors[permission.action as keyof typeof actionColors] || 'from-zinc-500 to-zinc-600';

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
                              <div className="flex-1">
                                <div className={`inline-block px-2 py-0.5 bg-gradient-to-r ${actionColor} text-white text-xs font-bold rounded uppercase mb-1`}>
                                  {permission.action}
                                </div>
                                <p className="text-xs text-zinc-600 dark:text-zinc-400">{permission.name_en}</p>
                              </div>
                              {isSelected && (
                                <Check className="w-5 h-5 text-orange-600 dark:text-orange-400 absolute top-1 right-1" />
                              )}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-zinc-800 border-t border-zinc-200 dark:border-zinc-700 p-6 rounded-b-3xl">
              <div className="flex gap-3">
                <button
                  onClick={handlePermissionSubmit}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl font-semibold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  Save Permissions ({selectedPermissions.length} selected)
                </button>
                <button
                  onClick={() => {
                    setShowPermissionModal(false);
                    setSelectedRole(null);
                    setSelectedPermissions([]);
                  }}
                  className="px-6 py-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
