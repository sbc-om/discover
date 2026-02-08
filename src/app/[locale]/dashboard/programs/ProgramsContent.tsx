'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { OverlayScrollbarsComponent } from 'overlayscrollbars-react';
import ModalPortal from '@/components/ModalPortal';
import ConfirmDialog from '@/components/ConfirmDialog';
import { useToast } from '@/components/ToastProvider';
import CoachProgramsContent from './CoachProgramsContent';
import useLocale from '@/hooks/useLocale';
import {
  Layers,
  Plus,
  Search,
  Edit2,
  Trash2,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Target,
  Award,
  Clock,
  Gift,
  Medal,
  Sparkles
} from 'lucide-react';

interface LevelReward {
  id?: string;
  reward_type: 'virtual' | 'physical';
  trigger_type: 'sessions_completed' | 'points_earned' | 'level_completed';
  trigger_value: number | null;
  title: string;
  title_ar: string;
  description: string;
  description_ar: string;
  badge_icon_url: string;
  medal_type: string;
  achievement_id: string | null;
  notify_player: boolean;
  notify_coach: boolean;
  notify_parent: boolean;
  display_order: number;
  is_active: boolean;
}

interface Achievement {
  id: string;
  title: string;
  title_ar: string;
  description: string;
  icon_url: string;
  is_active: boolean;
}

interface HealthTestFieldOption {
  value: string;
  label: string;
  label_ar?: string;
}

interface HealthTestField {
  id?: string;
  field_key: string;
  field_name: string;
  field_name_ar?: string;
  field_type: 'number' | 'text' | 'select' | 'boolean' | 'date' | 'range';
  field_unit?: string;
  field_unit_ar?: string;
  field_options?: HealthTestFieldOption[];
  min_value?: number | null;
  max_value?: number | null;
  is_required: boolean;
  display_order: number;
  description?: string;
  description_ar?: string;
  is_active: boolean;
}

interface Level {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  image_url: string;
  level_order: number;
  min_sessions: number;
  min_points: number;
  health_test_requirement?: 'none' | 'before' | 'after' | 'both';
  health_test_after_sessions?: number | null;
  is_active: boolean;
  created_at: string;
  rewards?: LevelReward[];
}

interface AgeGroup {
  id: string;
  name: string;
  name_ar: string;
  min_age: number;
  max_age: number;
  is_active: boolean;
  created_at: string;
}

interface AssignedAcademy {
  academy_id: string;
  academy_name: string;
  academy_name_ar?: string;
  logo_url?: string;
  is_active: boolean;
}

interface Program {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  description_ar: string;
  image_url: string;
  academy_id: string;
  academy_name: string;
  academy_name_ar: string;
  is_active: boolean;
  level_count: number;
  age_group_count?: number;
  assigned_academy_count?: number;
  assigned_academies?: AssignedAcademy[];
  created_at: string;
  levels?: Level[];
  age_groups?: AgeGroup[];
}

interface Academy {
  id: string;
  name: string;
  name_ar: string;
}

interface Permissions {
  read?: boolean;
  create?: boolean;
  update?: boolean;
  delete?: boolean;
  create_program?: boolean;
  edit_program?: boolean;
  delete_program?: boolean;
  create_level?: boolean;
  edit_level?: boolean;
  delete_level?: boolean;
  create_age_group?: boolean;
  edit_age_group?: boolean;
  delete_age_group?: boolean;
}

export default function ProgramsContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const searchParams = useSearchParams();
  const academyIdParam = searchParams.get('academyId');
  
  // Translation helper
  const t = (en: string, ar: string) => isAr ? ar : en;
  
  const [programs, setPrograms] = useState<Program[]>([]);
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');
  const [academyFilter, setAcademyFilter] = useState(() => academyIdParam || '');
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showModal, setShowModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showAgeGroupModal, setShowAgeGroupModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [editingAgeGroup, setEditingAgeGroup] = useState<AgeGroup | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({});
  const [permissionsLoaded, setPermissionsLoaded] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'program' | 'level' | 'age_group'; item: Program | Level | AgeGroup; programId?: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { showToast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentRole, setCurrentRole] = useState<string>('');
  const [programImageFile, setProgramImageFile] = useState<File | null>(null);
  const [programImagePreview, setProgramImagePreview] = useState<string | null>(null);
  const [uploadingProgramImage, setUploadingProgramImage] = useState(false);
  const [levelImageFile, setLevelImageFile] = useState<File | null>(null);
  const [levelImagePreview, setLevelImagePreview] = useState<string | null>(null);
  const [uploadingLevelImage, setUploadingLevelImage] = useState(false);
  const programFileInputRef = useRef<HTMLInputElement>(null);
  const levelFileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    image_url: '',
    academy_id: '',
    is_active: true
  });
  const [levelFormData, setLevelFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    image_url: '',
    level_order: 1,
    min_sessions: 0,
    min_points: 0,
    health_test_requirement: 'none' as 'none' | 'before' | 'after' | 'both',
    health_test_after_sessions: null as number | null,
    is_active: true
  });
  const [levelRewards, setLevelRewards] = useState<LevelReward[]>([]);
  const [showRewardForm, setShowRewardForm] = useState(false);
  const [editingRewardIndex, setEditingRewardIndex] = useState<number | null>(null);
  const [rewardFormData, setRewardFormData] = useState<LevelReward>({
    reward_type: 'virtual',
    trigger_type: 'level_completed',
    trigger_value: null,
    title: '',
    title_ar: '',
    description: '',
    description_ar: '',
    badge_icon_url: '',
    medal_type: 'gold',
    achievement_id: null,
    notify_player: true,
    notify_coach: true,
    notify_parent: false,
    display_order: 1,
    is_active: true
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [ageGroupFormData, setAgeGroupFormData] = useState({
    name: '',
    name_ar: '',
    min_age: 6,
    max_age: 18,
    is_active: true
  });

  // Health Test Fields State
  const [showHealthTestFieldsModal, setShowHealthTestFieldsModal] = useState(false);
  const [healthTestFields, setHealthTestFields] = useState<HealthTestField[]>([]);
  const [loadingHealthTestFields, setLoadingHealthTestFields] = useState(false);
  const [showHealthFieldForm, setShowHealthFieldForm] = useState(false);
  const [editingHealthField, setEditingHealthField] = useState<HealthTestField | null>(null);
  const [healthFieldFormData, setHealthFieldFormData] = useState<HealthTestField>({
    field_key: '',
    field_name: '',
    field_name_ar: '',
    field_type: 'number',
    field_unit: '',
    field_unit_ar: '',
    field_options: [],
    min_value: null,
    max_value: null,
    is_required: false,
    display_order: 0,
    description: '',
    description_ar: '',
    is_active: true
  });
  const [savingHealthField, setSavingHealthField] = useState(false);
  const [deletingHealthField, setDeletingHealthField] = useState<string | null>(null);

  // Academy Assignment State
  const [showAcademyAssignmentModal, setShowAcademyAssignmentModal] = useState(false);
  const [assignedAcademies, setAssignedAcademies] = useState<{
    assignment_id: string;
    academy_id: string;
    academy_name: string;
    academy_name_ar?: string;
    logo_url?: string;
    is_active: boolean;
    player_count: number;
    assigned_at: string;
  }[]>([]);
  const [loadingAssignedAcademies, setLoadingAssignedAcademies] = useState(false);
  const [selectedAcademiesToAssign, setSelectedAcademiesToAssign] = useState<string[]>([]);
  const [savingAcademyAssignment, setSavingAcademyAssignment] = useState(false);
  const [removingAcademy, setRemovingAcademy] = useState<string | null>(null);

  // Sync academyFilter with URL param
  useEffect(() => {
    const newFilter = academyIdParam || '';
    if (newFilter !== academyFilter) {
      setAcademyFilter(newFilter);
    }
  }, [academyIdParam]);

  useEffect(() => {
    checkIsAdmin();
    fetchPermissions();
  }, []);

  useEffect(() => {
    fetchPrograms();
    fetchAcademies();
  }, [page, limit, search, sortField, sortOrder, academyFilter]);

  const checkIsAdmin = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.roleName === 'admin');
        setCurrentRole(data.roleName || '');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/permissions/check?module=programs');
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions || {});
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setPermissionsLoaded(true);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements?limit=100&is_active=true');
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  // Health Test Fields Functions
  const fetchHealthTestFields = async (programId: string) => {
    try {
      setLoadingHealthTestFields(true);
      const response = await fetch(`/api/programs/${programId}/health-test-fields`);
      if (response.ok) {
        const data = await response.json();
        setHealthTestFields(data.fields || []);
      } else {
        setHealthTestFields([]);
      }
    } catch (error) {
      console.error('Error fetching health test fields:', error);
      setHealthTestFields([]);
    } finally {
      setLoadingHealthTestFields(false);
    }
  };

  const handleOpenHealthTestFields = async (program: Program) => {
    setSelectedProgram(program);
    await fetchHealthTestFields(program.id);
    setShowHealthTestFieldsModal(true);
  };

  const handleAddHealthField = () => {
    setEditingHealthField(null);
    setHealthFieldFormData({
      field_key: '',
      field_name: '',
      field_name_ar: '',
      field_type: 'number',
      field_unit: '',
      field_unit_ar: '',
      field_options: [],
      min_value: null,
      max_value: null,
      is_required: false,
      display_order: healthTestFields.length,
      description: '',
      description_ar: '',
      is_active: true
    });
    setShowHealthFieldForm(true);
  };

  const handleEditHealthField = (field: HealthTestField) => {
    setEditingHealthField(field);
    setHealthFieldFormData({
      ...field,
      field_options: field.field_options || []
    });
    setShowHealthFieldForm(true);
  };

  const handleSaveHealthField = async () => {
    if (!selectedProgram) return;
    if (!healthFieldFormData.field_key || !healthFieldFormData.field_name) {
      showToast('error', t('Field key and name are required', 'مفتاح الحقل والاسم مطلوبان'));
      return;
    }

    try {
      setSavingHealthField(true);
      const url = editingHealthField 
        ? `/api/programs/${selectedProgram.id}/health-test-fields/${editingHealthField.id}`
        : `/api/programs/${selectedProgram.id}/health-test-fields`;
      
      const response = await fetch(url, {
        method: editingHealthField ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(healthFieldFormData)
      });

      if (response.ok) {
        showToast(
          'success',
          editingHealthField 
            ? t('Field updated successfully', 'تم تحديث الحقل بنجاح')
            : t('Field created successfully', 'تم إنشاء الحقل بنجاح')
        );
        await fetchHealthTestFields(selectedProgram.id);
        setShowHealthFieldForm(false);
      } else {
        const data = await response.json();
        showToast('error', data.message || t('Failed to save field', 'فشل في حفظ الحقل'));
      }
    } catch (error) {
      showToast('error', t('Error saving field', 'خطأ في حفظ الحقل'));
    } finally {
      setSavingHealthField(false);
    }
  };

  const handleDeleteHealthField = async (fieldId: string) => {
    if (!selectedProgram) return;

    try {
      setDeletingHealthField(fieldId);
      const response = await fetch(
        `/api/programs/${selectedProgram.id}/health-test-fields/${fieldId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        showToast('success', t('Field deleted successfully', 'تم حذف الحقل بنجاح'));
        await fetchHealthTestFields(selectedProgram.id);
      } else {
        const data = await response.json();
        showToast('error', data.message || t('Failed to delete field', 'فشل في حذف الحقل'));
      }
    } catch (error) {
      showToast('error', t('Error deleting field', 'خطأ في حذف الحقل'));
    } finally {
      setDeletingHealthField(null);
    }
  };

  const addFieldOption = () => {
    setHealthFieldFormData(prev => ({
      ...prev,
      field_options: [...(prev.field_options || []), { value: '', label: '', label_ar: '' }]
    }));
  };

  const updateFieldOption = (index: number, key: keyof HealthTestFieldOption, value: string) => {
    setHealthFieldFormData(prev => ({
      ...prev,
      field_options: prev.field_options?.map((opt, i) => 
        i === index ? { ...opt, [key]: value } : opt
      ) || []
    }));
  };

  const removeFieldOption = (index: number) => {
    setHealthFieldFormData(prev => ({
      ...prev,
      field_options: prev.field_options?.filter((_, i) => i !== index) || []
    }));
  };

  // Academy Assignment Functions
  const fetchAssignedAcademies = async (programId: string) => {
    try {
      setLoadingAssignedAcademies(true);
      const response = await fetch(`/api/programs/${programId}/academies`);
      if (response.ok) {
        const data = await response.json();
        setAssignedAcademies(data.academies || []);
      } else {
        setAssignedAcademies([]);
      }
    } catch (error) {
      console.error('Error fetching assigned academies:', error);
      setAssignedAcademies([]);
    } finally {
      setLoadingAssignedAcademies(false);
    }
  };

  const handleOpenAcademyAssignment = async (program: Program) => {
    setSelectedProgram(program);
    setSelectedAcademiesToAssign([]);
    await fetchAssignedAcademies(program.id);
    setShowAcademyAssignmentModal(true);
  };

  const handleAssignAcademies = async () => {
    if (!selectedProgram || selectedAcademiesToAssign.length === 0) return;

    try {
      setSavingAcademyAssignment(true);
      const response = await fetch(`/api/programs/${selectedProgram.id}/academies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ academy_ids: selectedAcademiesToAssign })
      });

      if (response.ok) {
        showToast('success', t('Academies assigned successfully', 'تم تعيين الأكاديميات بنجاح'));
        setSelectedAcademiesToAssign([]);
        await fetchAssignedAcademies(selectedProgram.id);
        await fetchPrograms();
      } else {
        const data = await response.json();
        showToast('error', data.message || t('Failed to assign academies', 'فشل في تعيين الأكاديميات'));
      }
    } catch (error) {
      showToast('error', t('Error assigning academies', 'خطأ في تعيين الأكاديميات'));
    } finally {
      setSavingAcademyAssignment(false);
    }
  };

  const handleRemoveAcademyAssignment = async (academyId: string) => {
    if (!selectedProgram) return;

    try {
      setRemovingAcademy(academyId);
      const response = await fetch(
        `/api/programs/${selectedProgram.id}/academies?academy_id=${academyId}`,
        { method: 'DELETE' }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.deactivated) {
          showToast('info', t(
            `Program deactivated for this academy (${data.player_count} active players)`,
            `تم إلغاء تفعيل البرنامج لهذه الأكاديمية (${data.player_count} لاعب نشط)`
          ));
        } else {
          showToast('success', t('Academy removed successfully', 'تمت إزالة الأكاديمية بنجاح'));
        }
        await fetchAssignedAcademies(selectedProgram.id);
        await fetchPrograms();
      } else {
        const data = await response.json();
        showToast('error', data.message || t('Failed to remove academy', 'فشل في إزالة الأكاديمية'));
      }
    } catch (error) {
      showToast('error', t('Error removing academy', 'خطأ في إزالة الأكاديمية'));
    } finally {
      setRemovingAcademy(null);
    }
  };

  // Get unassigned academies for the dropdown
  const getUnassignedAcademies = () => {
    const assignedIds = assignedAcademies.map(a => a.academy_id);
    return academies.filter(a => !assignedIds.includes(a.id));
  };

  // Permission helper functions - only return true if permissions are loaded
  const canCreateProgram = () => permissionsLoaded && (isAdmin || permissions.create_program || permissions.create);
  const canEditProgram = () => permissionsLoaded && (isAdmin || permissions.edit_program || permissions.update);
  const canDeleteProgram = () => permissionsLoaded && (isAdmin || permissions.delete_program || permissions.delete);
  const canCreateLevel = () => permissionsLoaded && (isAdmin || permissions.create_level || permissions.create);
  const canEditLevel = () => permissionsLoaded && (isAdmin || permissions.edit_level || permissions.update);
  const canDeleteLevel = () => permissionsLoaded && (isAdmin || permissions.delete_level || permissions.delete);
  const canCreateAgeGroup = () => permissionsLoaded && (isAdmin || permissions.create_age_group || permissions.create);
  const canEditAgeGroup = () => permissionsLoaded && (isAdmin || permissions.edit_age_group || permissions.update);
  const canDeleteAgeGroup = () => permissionsLoaded && (isAdmin || permissions.delete_age_group || permissions.delete);

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortField,
        sortOrder: sortOrder,
        ...(search && { search }),
        ...(academyFilter && { academy_id: academyFilter })
      });

      const response = await fetch(`/api/programs?${params}`);
      const data = await response.json();

      if (response.ok) {
        setPrograms(data.programs);
        setTotal(data.pagination.total);
        setTotalPages(data.pagination.pages);
      }
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
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

  const fetchProgramWithLevels = async (programId: string) => {
    try {
      const response = await fetch(`/api/programs/${programId}`);
      const data = await response.json();
      if (response.ok) {
        setSelectedProgram(data.program);
      }
    } catch (error) {
      console.error('Error fetching program details:', error);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-4 h-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const handleAdd = () => {
    setEditingProgram(null);
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      image_url: '',
      academy_id: academies.length === 1 ? academies[0].id : '',
      is_active: true
    });
    setProgramImageFile(null);
    setProgramImagePreview(null);
    setShowModal(true);
  };

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      name_ar: program.name_ar || '',
      description: program.description || '',
      description_ar: program.description_ar || '',
      image_url: program.image_url || '',
      academy_id: program.academy_id,
      is_active: program.is_active
    });
    setProgramImageFile(null);
    setProgramImagePreview(program.image_url || null);
    setShowModal(true);
  };

  const handleProgramImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProgramImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProgramImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadProgramImage = async (): Promise<string | null> => {
    if (!programImageFile) return editingProgram?.image_url || null;

    setUploadingProgramImage(true);
    try {
      const formData = new FormData();
      formData.append('file', programImageFile);
      formData.append('type', 'program');

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
      console.error('Error uploading program image:', error);
      return null;
    } finally {
      setUploadingProgramImage(false);
    }
  };

  const handleSave = async () => {
    try {
      const programImageUrl = await uploadProgramImage();
      const payload = {
        ...formData,
        image_url: programImageUrl
      };

      const url = editingProgram ? `/api/programs/${editingProgram.id}` : '/api/programs';
      const method = editingProgram ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', editingProgram ? 'Program updated successfully' : 'Program created successfully');
        setShowModal(false);
        setProgramImageFile(null);
        fetchPrograms();
      } else {
        showToast('error', data.message || 'Failed to save program');
      }
    } catch (error) {
      console.error('Error saving program:', error);
      showToast('error', 'Failed to save program');
    }
  };

  const handleDelete = async (): Promise<boolean> => {
    if (!deleteTarget) return false;

    try {
      let url = '';
      if (deleteTarget.type === 'program') {
        url = `/api/programs/${(deleteTarget.item as Program).id}`;
      } else if (deleteTarget.type === 'level') {
        url = `/api/programs/${deleteTarget.programId}/levels/${(deleteTarget.item as Level).id}`;
      } else {
        url = `/api/programs/${deleteTarget.programId}/age-groups/${(deleteTarget.item as AgeGroup).id}`;
      }

      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        showToast(
          'success',
          deleteTarget.type === 'program'
            ? 'Program deleted successfully'
            : deleteTarget.type === 'level'
            ? 'Level deleted successfully'
            : 'Age group deleted successfully'
        );
        if (deleteTarget.type === 'program') {
          fetchPrograms();
        } else if (selectedProgram) {
          fetchProgramWithLevels(selectedProgram.id);
        }
        return true;
      } else {
        const data = await response.json();
        const errorMsg = data.message || 'Failed to delete';
        setDeleteError(errorMsg);
        showToast('error', errorMsg);
      }
    } catch (error) {
      console.error('Error deleting:', error);
      setDeleteError('Failed to delete');
      showToast('error', 'Failed to delete');
    }
    return false;
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const success = await handleDelete();
      if (success) setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // Level management
  const handleAddLevel = () => {
    if (!selectedProgram) return;
    setEditingLevel(null);
    const nextOrder = (selectedProgram.levels?.length || 0) + 1;
    setLevelFormData({
      name: '',
      name_ar: '',
      description: '',
      image_url: '',
      level_order: nextOrder,
      min_sessions: 0,
      min_points: 0,
      health_test_requirement: 'none' as 'none' | 'before' | 'after' | 'both',
      health_test_after_sessions: null as number | null,
      is_active: true
    });
    setLevelImageFile(null);
    setLevelImagePreview(null);
    setLevelRewards([]);
    setShowRewardForm(false);
    setEditingRewardIndex(null);
    fetchAchievements();
    setShowLevelModal(true);
  };

  const handleEditLevel = async (level: Level) => {
    setEditingLevel(level);
    setLevelFormData({
      name: level.name,
      name_ar: level.name_ar || '',
      description: level.description || '',
      image_url: level.image_url || '',
      level_order: level.level_order,
      min_sessions: level.min_sessions,
      min_points: level.min_points,
      health_test_requirement: (level.health_test_requirement || 'none') as 'none' | 'before' | 'after' | 'both',
      health_test_after_sessions: level.health_test_after_sessions ?? null,
      is_active: level.is_active
    });
    setLevelImageFile(null);
    setLevelImagePreview(level.image_url || null);
    setShowRewardForm(false);
    setEditingRewardIndex(null);
    
    // Fetch achievements for virtual rewards
    fetchAchievements();
    
    // Load existing rewards for this level
    try {
      const response = await fetch(`/api/programs/${selectedProgram?.id}/levels/${level.id}/rewards`);
      if (response.ok) {
        const data = await response.json();
        setLevelRewards(data.rewards || []);
      } else {
        setLevelRewards([]);
      }
    } catch {
      setLevelRewards([]);
    }
    
    setShowLevelModal(true);
  };

  const handleLevelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLevelImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLevelImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadLevelImage = async (): Promise<string | null> => {
    if (!levelImageFile) return editingLevel?.image_url || null;

    setUploadingLevelImage(true);
    try {
      const formData = new FormData();
      formData.append('file', levelImageFile);
      formData.append('type', 'level');

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
      console.error('Error uploading level image:', error);
      return null;
    } finally {
      setUploadingLevelImage(false);
    }
  };

  const handleSaveLevel = async () => {
    if (!selectedProgram) return;

    try {
      const levelImageUrl = await uploadLevelImage();
      const payload = {
        ...levelFormData,
        image_url: levelImageUrl
      };

      const url = editingLevel 
        ? `/api/programs/${selectedProgram.id}/levels/${editingLevel.id}` 
        : `/api/programs/${selectedProgram.id}/levels`;
      const method = editingLevel ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        const savedLevelId = editingLevel?.id || data.level?.id;
        
        // Save rewards for this level
        if (savedLevelId && levelRewards.length > 0) {
          for (const reward of levelRewards) {
            const rewardUrl = reward.id 
              ? `/api/programs/${selectedProgram.id}/levels/${savedLevelId}/rewards/${reward.id}`
              : `/api/programs/${selectedProgram.id}/levels/${savedLevelId}/rewards`;
            const rewardMethod = reward.id ? 'PUT' : 'POST';
            
            await fetch(rewardUrl, {
              method: rewardMethod,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(reward)
            });
          }
        }
        
        showToast('success', editingLevel ? 'Level updated successfully' : 'Level created successfully');
        setShowLevelModal(false);
        setLevelImageFile(null);
        setLevelRewards([]);
        fetchProgramWithLevels(selectedProgram.id);
        fetchPrograms();
      } else {
        showToast('error', data.message || 'Failed to save level');
      }
    } catch (error) {
      console.error('Error saving level:', error);
      showToast('error', 'Failed to save level');
    }
  };

  // Reward management helper functions
  const handleAddReward = () => {
    setEditingRewardIndex(null);
    setRewardFormData({
      reward_type: 'virtual',
      trigger_type: 'level_completed',
      trigger_value: null,
      title: '',
      title_ar: '',
      description: '',
      description_ar: '',
      badge_icon_url: '',
      medal_type: 'gold',
      achievement_id: null,
      notify_player: true,
      notify_coach: true,
      notify_parent: false,
      display_order: levelRewards.length + 1,
      is_active: true
    });
    setShowRewardForm(true);
  };

  const handleEditReward = (index: number) => {
    setEditingRewardIndex(index);
    setRewardFormData({ ...levelRewards[index] });
    setShowRewardForm(true);
  };

  const handleSaveReward = () => {
    if (!rewardFormData.title) {
      showToast('error', t('Reward title is required', 'عنوان المكافأة مطلوب'));
      return;
    }

    if (rewardFormData.reward_type === 'virtual' && !rewardFormData.achievement_id) {
      showToast('error', t('Please select an achievement for virtual reward', 'لطفاً یک دستاورد برای شارت مجازی انتخاب کنید'));
      return;
    }

    if (editingRewardIndex !== null) {
      // Update existing reward
      const updatedRewards = [...levelRewards];
      updatedRewards[editingRewardIndex] = rewardFormData;
      setLevelRewards(updatedRewards);
    } else {
      // Add new reward
      setLevelRewards([...levelRewards, rewardFormData]);
    }

    setShowRewardForm(false);
    setEditingRewardIndex(null);
  };

  const handleDeleteReward = async (index: number) => {
    const reward = levelRewards[index];
    
    // If this reward has an ID, delete it from the server
    if (reward.id && editingLevel && selectedProgram) {
      try {
        await fetch(`/api/programs/${selectedProgram.id}/levels/${editingLevel.id}/rewards/${reward.id}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Error deleting reward from server:', error);
      }
    }
    
    // Remove from local state
    const updatedRewards = levelRewards.filter((_, i) => i !== index);
    setLevelRewards(updatedRewards);
  };

  // Age group management
  const handleAddAgeGroup = () => {
    if (!selectedProgram) return;
    setEditingAgeGroup(null);
    setAgeGroupFormData({
      name: '',
      name_ar: '',
      min_age: 6,
      max_age: 18,
      is_active: true
    });
    setShowAgeGroupModal(true);
  };

  const handleEditAgeGroup = (ageGroup: AgeGroup) => {
    setEditingAgeGroup(ageGroup);
    setAgeGroupFormData({
      name: ageGroup.name,
      name_ar: ageGroup.name_ar || '',
      min_age: ageGroup.min_age,
      max_age: ageGroup.max_age,
      is_active: ageGroup.is_active
    });
    setShowAgeGroupModal(true);
  };

  const handleSaveAgeGroup = async () => {
    if (!selectedProgram) return;

    try {
      const payload = {
        ...ageGroupFormData,
      };

      const url = editingAgeGroup
        ? `/api/programs/${selectedProgram.id}/age-groups/${editingAgeGroup.id}`
        : `/api/programs/${selectedProgram.id}/age-groups`;
      const method = editingAgeGroup ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        showToast('success', editingAgeGroup ? 'Age group updated successfully' : 'Age group created successfully');
        setShowAgeGroupModal(false);
        fetchProgramWithLevels(selectedProgram.id);
      } else {
        showToast('error', data.message || 'Failed to save age group');
      }
    } catch (error) {
      console.error('Error saving age group:', error);
      showToast('error', 'Failed to save age group');
    }
  };

  const handleViewLevels = (program: Program) => {
    fetchProgramWithLevels(program.id);
  };

  const handleBackToPrograms = () => {
    setSelectedProgram(null);
  };

  // Coach view
  if (currentRole === 'coach') {
    return <CoachProgramsContent />;
  }

  // Render level view
  if (selectedProgram) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToPrograms}
              className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                {selectedProgram.name}
              </h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                {selectedProgram.name_ar && `${selectedProgram.name_ar} • `}
                {selectedProgram.academy_name}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {canCreateLevel() && (
              <button
                onClick={handleAddLevel}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>{t('Add Level', 'إضافة مستوى')}</span>
              </button>
            )}
            {canCreateAgeGroup() && (
              <button
                onClick={handleAddAgeGroup}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>{t('Add Age Group', 'إضافة فئة عمرية')}</span>
              </button>
            )}
            {(isAdmin || currentRole === 'academy_manager') && (
              <button
                onClick={() => handleOpenHealthTestFields(selectedProgram)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-500/25 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{t('Health Test Fields', 'حقول الفحص الصحي')}</span>
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => handleOpenAcademyAssignment(selectedProgram)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span>{t('Assign to Academies', 'تعيين للأكاديميات')}</span>
                {selectedProgram.assigned_academy_count !== undefined && selectedProgram.assigned_academy_count > 0 && (
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {selectedProgram.assigned_academy_count}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Levels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {selectedProgram.levels?.map((level, index) => (
              <motion.div
                key={level.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group"
              >
                <div className={`h-[320px] flex flex-col rounded-2xl border ${level.is_active ? 'border-zinc-200 dark:border-zinc-800' : 'border-red-200 dark:border-red-900/50'} bg-white dark:bg-zinc-900 p-5 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all`}>
                  {/* Level Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {level.image_url ? (
                        <div className="relative w-22 h-22 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                          <img
                            src={level.image_url}
                            alt={level.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-tl-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                            {level.level_order}
                          </div>
                        </div>
                      ) : (
                        <div className="w-22 h-22 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
                          {level.level_order}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{level.name}</h3>
                        {level.name_ar && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{level.name_ar}</p>
                        )}
                      </div>
                    </div>
                    {level.is_active ? (
                      <CheckCircle2 className="w-5 h-5 text-orange-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  {/* Requirements */}
                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                      <span className="text-zinc-500 dark:text-zinc-400">{t('Min Sessions', 'الحد الأدنى للجلسات')}:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{level.min_sessions}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Award className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span className="text-zinc-500 dark:text-zinc-400">{t('Min Points', 'الحد الأدنى للنقاط')}:</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">{level.min_points}</span>
                    </div>
                  </div>

                  {level.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3 line-clamp-2">
                      {level.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 mt-auto">
                    {canEditLevel() && (
                      <button
                        onClick={() => handleEditLevel(level)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('Edit', 'تعديل')}
                      </button>
                    )}
                    {canDeleteLevel() && (
                      <button
                        onClick={() => setDeleteTarget({ type: 'level', item: level, programId: selectedProgram.id })}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {(!selectedProgram.levels || selectedProgram.levels.length === 0) && (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {t('No levels yet', 'لا توجد مستويات بعد')}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                {t('Create the first level for this program', 'أنشئ المستوى الأول لهذا البرنامج')}
              </p>
              {canCreateLevel() && (
                <button
                  onClick={handleAddLevel}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('Add Level', 'إضافة مستوى')}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Age Groups */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              {t('Age Groups', 'الفئات العمرية')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {selectedProgram.age_groups?.map((ageGroup) => (
                <motion.div
                  key={ageGroup.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  <div className={`h-[280px] flex flex-col rounded-2xl border ${ageGroup.is_active ? 'border-zinc-200 dark:border-zinc-800' : 'border-red-200 dark:border-red-900/50'} bg-white dark:bg-zinc-900 p-5 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{ageGroup.name}</h3>
                        {ageGroup.name_ar && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{ageGroup.name_ar}</p>
                        )}
                      </div>
                      {ageGroup.is_active ? (
                        <CheckCircle2 className="w-5 h-5 text-orange-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-sm mb-4">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                        <Target className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <div>
                        <p className="text-zinc-500 dark:text-zinc-400">{t('Age Range', 'الفئة العمرية')}</p>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                          {ageGroup.min_age} - {ageGroup.max_age}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {canEditAgeGroup() && (
                        <button
                          onClick={() => handleEditAgeGroup(ageGroup)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                          {t('Edit', 'تعديل')}
                        </button>
                      )}
                      {canDeleteAgeGroup() && (
                        <button
                          onClick={() => setDeleteTarget({ type: 'age_group', item: ageGroup, programId: selectedProgram.id })}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {(!selectedProgram.age_groups || selectedProgram.age_groups.length === 0) && (
              <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <Target className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  {t('No age groups yet', 'لا توجد فئات عمرية بعد')}
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                  {t('Create the first age group for this program', 'أنشئ الفئة العمرية الأولى لهذا البرنامج')}
                </p>
                {canCreateAgeGroup() && (
                  <button
                    onClick={handleAddAgeGroup}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('Add Age Group', 'إضافة فئة عمرية')}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Level Modal */}
        {showLevelModal && (
        <ModalPortal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowLevelModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden my-4"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingLevel ? t('Edit Level', 'تعديل المستوى') : t('Add Level', 'إضافة مستوى')}
                </h2>
                <button
                  onClick={() => setShowLevelModal(false)}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Name (English)', 'الاسم (إنجليزي)')} *
                    </label>
                    <input
                      type="text"
                      value={levelFormData.name}
                      onChange={(e) => setLevelFormData({ ...levelFormData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder={t('Level 1', 'المستوى ١')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Name (Arabic)', 'الاسم (عربي)')}
                    </label>
                    <input
                      type="text"
                      value={levelFormData.name_ar}
                      onChange={(e) => setLevelFormData({ ...levelFormData, name_ar: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      dir="rtl"
                      placeholder="المستوى الأول"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {t('Level Order', 'ترتيب المستوى')}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={levelFormData.level_order}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^0-9]/g, '');
                      setLevelFormData({ ...levelFormData, level_order: val === '' ? 1 : parseInt(val) || 1 });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Min Sessions Required', 'الحد الأدنى للجلسات')}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={levelFormData.min_sessions}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setLevelFormData({ ...levelFormData, min_sessions: val === '' ? 0 : parseInt(val) });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Min Points Required', 'الحد الأدنى للنقاط')}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={levelFormData.min_points}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setLevelFormData({ ...levelFormData, min_points: val === '' ? 0 : parseInt(val) });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                {/* Health Test Requirements - Professional Section */}
                <div className="rounded-xl border border-emerald-200 dark:border-emerald-800/50 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 p-4 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="font-semibold text-sm">{t('Health Test Configuration', 'إعدادات الفحص الصحي')}</h4>
                  </div>

                  {/* Level-based Health Test */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Level-based Requirement', 'متطلبات بناءً على المستوى')}
                    </label>
                    <select
                      value={levelFormData.health_test_requirement}
                      onChange={(e) => setLevelFormData({ ...levelFormData, health_test_requirement: e.target.value as 'none' | 'before' | 'after' | 'both' })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="none">{t('Not Required', 'غير مطلوب')}</option>
                      <option value="before">{t('Before Starting Level', 'قبل بدء المستوى')}</option>
                      <option value="after">{t('After Completing Level', 'بعد إكمال المستوى')}</option>
                      <option value="both">{t('Before & After Level', 'قبل وبعد المستوى')}</option>
                    </select>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {t('Health test will be required when player enters or completes this level.', 'سيكون الفحص الصحي مطلوباً عند دخول اللاعب أو إكماله لهذا المستوى.')}
                    </p>
                  </div>

                  {/* Session-based Health Test */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Session-based Requirement', 'متطلبات بناءً على الجلسات')}
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <input
                          type="number"
                          min="0"
                          placeholder={t('Number of sessions', 'عدد الجلسات')}
                          value={levelFormData.health_test_after_sessions ?? ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setLevelFormData({ 
                              ...levelFormData, 
                              health_test_after_sessions: val === '' ? null : parseInt(val) 
                            });
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setLevelFormData({ ...levelFormData, health_test_after_sessions: null })}
                        className="px-3 py-2.5 rounded-xl text-sm text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {t('Clear', 'مسح')}
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {t('Health test will be required after player completes this many sessions in this level. Leave empty to disable.', 'سيكون الفحص الصحي مطلوباً بعد إكمال اللاعب لهذا العدد من الجلسات في هذا المستوى. اتركه فارغاً للتعطيل.')}
                    </p>
                  </div>

                  {/* Visual Summary */}
                  {(levelFormData.health_test_requirement !== 'none' || levelFormData.health_test_after_sessions) && (
                    <div className="mt-3 p-3 rounded-lg bg-white/60 dark:bg-zinc-800/60 border border-emerald-200 dark:border-emerald-800/30">
                      <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mb-2">{t('Active Health Test Triggers:', 'مشغلات الفحص الصحي النشطة:')}</p>
                      <div className="flex flex-wrap gap-2">
                        {(levelFormData.health_test_requirement === 'before' || levelFormData.health_test_requirement === 'both') && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                            {t('Before Level Start', 'قبل بدء المستوى')}
                          </span>
                        )}
                        {(levelFormData.health_test_requirement === 'after' || levelFormData.health_test_requirement === 'both') && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                            {t('After Level Complete', 'بعد إكمال المستوى')}
                          </span>
                        )}
                        {levelFormData.health_test_after_sessions && levelFormData.health_test_after_sessions > 0 && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
                            {t(`After ${levelFormData.health_test_after_sessions} Sessions`, `بعد ${levelFormData.health_test_after_sessions} جلسة`)}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {t('Image', 'الصورة')}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
                      {levelImagePreview ? (
                        <img
                          src={levelImagePreview}
                          alt="Level"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-zinc-400">{t('No image', 'لا توجد صورة')}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={levelFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLevelImageChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => levelFileInputRef.current?.click()}
                        className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        disabled={uploadingLevelImage}
                      >
                        {uploadingLevelImage ? t('Uploading...', 'جاري الرفع...') : t('Upload Image', 'رفع صورة')}
                      </button>
                      {levelImagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setLevelImageFile(null);
                            setLevelImagePreview(null);
                          }}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          {t('Remove', 'حذف')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {t('Description', 'الوصف')}
                  </label>
                  <textarea
                    rows={2}
                    value={levelFormData.description}
                    onChange={(e) => setLevelFormData({ ...levelFormData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                    placeholder={t('Level description...', 'وصف المستوى...')}
                  />
                </div>

                {/* Rewards Section */}
                <div className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {t('Level Rewards', 'مكافآت المستوى')}
                      </span>
                      <span className="px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-full">
                        {levelRewards.length}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddReward}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/20 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {t('Add Reward', 'إضافة مكافأة')}
                    </button>
                  </div>
                  
                  {levelRewards.length > 0 && (
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
                      {levelRewards.map((reward, index) => {
                        const linkedAchievement = reward.achievement_id 
                          ? achievements.find(a => a.id === reward.achievement_id) 
                          : null;
                        return (
                        <div key={index} className="flex items-center justify-between px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              reward.reward_type === 'physical' 
                                ? 'bg-gradient-to-br from-yellow-400 to-amber-500' 
                                : 'bg-gradient-to-br from-purple-400 to-indigo-500'
                            }`}>
                              {reward.reward_type === 'physical' ? (
                                <Medal className="w-4 h-4 text-white" />
                              ) : linkedAchievement?.icon_url ? (
                                <img src={linkedAchievement.icon_url} alt="" className="w-5 h-5 object-contain" />
                              ) : (
                                <Sparkles className="w-4 h-4 text-white" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                {isAr ? (reward.title_ar || reward.title) : reward.title}
                              </p>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                {reward.trigger_type === 'sessions_completed' && 
                                  t(`After ${reward.trigger_value} sessions`, `بعد ${reward.trigger_value} جلسة`)}
                                {reward.trigger_type === 'points_earned' && 
                                  t(`After ${reward.trigger_value} points`, `بعد ${reward.trigger_value} نقطة`)}
                                {reward.trigger_type === 'level_completed' && 
                                  t('On level completion', 'عند إكمال المستوى')}
                                {' • '}
                                {reward.reward_type === 'physical' 
                                  ? `${t('Physical Medal', 'ميدالية حقيقية')} (${reward.medal_type})` 
                                  : linkedAchievement 
                                    ? `${t('Achievement', 'دستاورد')}: ${isAr ? (linkedAchievement.title_ar || linkedAchievement.title) : linkedAchievement.title}`
                                    : t('Virtual Badge', 'شارة افتراضية')}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleEditReward(index)}
                              className="p-1.5 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteReward(index)}
                              className="p-1.5 text-red-500 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {levelRewards.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <Gift className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {t('No rewards defined yet', 'لم يتم تحديد مكافآت بعد')}
                      </p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
                        {t('Add rewards to motivate players!', 'أضف مكافآت لتحفيز اللاعبين!')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Reward Form (inline) */}
                {showRewardForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="border border-amber-200 dark:border-amber-500/30 rounded-xl p-4 bg-amber-50/50 dark:bg-amber-500/5 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        {editingRewardIndex !== null ? t('Edit Reward', 'تعديل المكافأة') : t('New Reward', 'مكافأة جديدة')}
                      </h4>
                      <button
                        type="button"
                        onClick={() => setShowRewardForm(false)}
                        className="p-1 text-amber-600 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          {t('Title (English)', 'العنوان (إنجليزي)')} *
                        </label>
                        <input
                          type="text"
                          value={rewardFormData.title}
                          onChange={(e) => setRewardFormData({ ...rewardFormData, title: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          placeholder={t('Gold Medal', 'ميدالية ذهبية')}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          {t('Title (Arabic)', 'العنوان (عربي)')}
                        </label>
                        <input
                          type="text"
                          value={rewardFormData.title_ar}
                          onChange={(e) => setRewardFormData({ ...rewardFormData, title_ar: e.target.value })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          dir="rtl"
                          placeholder="ميدالية ذهبية"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          {t('Reward Type', 'نوع المكافأة')}
                        </label>
                        <select
                          value={rewardFormData.reward_type}
                          onChange={(e) => setRewardFormData({ 
                            ...rewardFormData, 
                            reward_type: e.target.value as 'virtual' | 'physical',
                            achievement_id: e.target.value === 'physical' ? null : rewardFormData.achievement_id
                          })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="virtual">{t('Virtual Badge', 'شارة افتراضية')}</option>
                          <option value="physical">{t('Physical Medal', 'ميدالية حقيقية')}</option>
                        </select>
                      </div>
                      {rewardFormData.reward_type === 'physical' && (
                        <div>
                          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                            {t('Medal Type', 'نوع الميدالية')}
                          </label>
                          <select
                            value={rewardFormData.medal_type}
                            onChange={(e) => setRewardFormData({ ...rewardFormData, medal_type: e.target.value })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                          >
                            <option value="gold">{t('Gold', 'ذهبية')}</option>
                            <option value="silver">{t('Silver', 'فضية')}</option>
                            <option value="bronze">{t('Bronze', 'برونزية')}</option>
                            <option value="participation">{t('Participation', 'مشاركة')}</option>
                          </select>
                        </div>
                      )}
                      {rewardFormData.reward_type === 'virtual' && (
                        <div className="col-span-2">
                          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2">
                            {t('Select Achievement', 'انتخاب دستاورد')} *
                          </label>
                          {achievements.length > 0 ? (
                            <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                              {achievements.map((achievement) => (
                                <button
                                  key={achievement.id}
                                  type="button"
                                  onClick={() => {
                                    setRewardFormData({ 
                                      ...rewardFormData, 
                                      achievement_id: achievement.id,
                                      title: rewardFormData.title || achievement.title || '',
                                      title_ar: rewardFormData.title_ar || achievement.title_ar || '',
                                      badge_icon_url: achievement.icon_url || rewardFormData.badge_icon_url
                                    });
                                  }}
                                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition-all ${
                                    rewardFormData.achievement_id === achievement.id
                                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-500/10 shadow-sm'
                                      : 'border-zinc-200 dark:border-zinc-700 hover:border-amber-300 dark:hover:border-amber-500/50 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                                  }`}
                                >
                                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-500/20 dark:to-indigo-500/20 flex items-center justify-center overflow-hidden">
                                    {achievement.icon_url ? (
                                      <img 
                                        src={achievement.icon_url} 
                                        alt={achievement.title}
                                        className="w-8 h-8 object-contain"
                                      />
                                    ) : (
                                      <Sparkles className="w-5 h-5 text-purple-500" />
                                    )}
                                  </div>
                                  <span className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300 text-center line-clamp-2 leading-tight">
                                    {isAr ? (achievement.title_ar || achievement.title) : achievement.title}
                                  </span>
                                  {rewardFormData.achievement_id === achievement.id && (
                                    <div className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                                      <CheckCircle2 className="w-3 h-3 text-white" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-amber-600 dark:text-amber-400 py-4 text-center bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                              {t('No achievements found. Create achievements first.', 'هیچ دستاوردی یافت نشد. ابتدا دستاوردها را ایجاد کنید.')}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                          {t('Trigger', 'المحفز')}
                        </label>
                        <select
                          value={rewardFormData.trigger_type}
                          onChange={(e) => setRewardFormData({ 
                            ...rewardFormData, 
                            trigger_type: e.target.value as 'sessions_completed' | 'points_earned' | 'level_completed',
                            trigger_value: e.target.value === 'level_completed' ? null : rewardFormData.trigger_value || 1
                          })}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="level_completed">{t('On Level Completion', 'عند إكمال المستوى')}</option>
                          <option value="sessions_completed">{t('After X Sessions', 'بعد عدد جلسات')}</option>
                          <option value="points_earned">{t('After X Points', 'بعد عدد نقاط')}</option>
                        </select>
                      </div>
                      {rewardFormData.trigger_type !== 'level_completed' && (
                        <div>
                          <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">
                            {rewardFormData.trigger_type === 'sessions_completed' 
                              ? t('Sessions Required', 'الجلسات المطلوبة')
                              : t('Points Required', 'النقاط المطلوبة')}
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={rewardFormData.trigger_value || ''}
                            onChange={(e) => setRewardFormData({ ...rewardFormData, trigger_value: parseInt(e.target.value) || null })}
                            className="w-full px-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            placeholder={rewardFormData.trigger_type === 'sessions_completed' ? '10' : '100'}
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rewardFormData.notify_player}
                          onChange={(e) => setRewardFormData({ ...rewardFormData, notify_player: e.target.checked })}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-zinc-600 dark:text-zinc-400">{t('Notify Player', 'إشعار اللاعب')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rewardFormData.notify_coach}
                          onChange={(e) => setRewardFormData({ ...rewardFormData, notify_coach: e.target.checked })}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-zinc-600 dark:text-zinc-400">{t('Notify Coach', 'إشعار المدرب')}</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={rewardFormData.notify_parent}
                          onChange={(e) => setRewardFormData({ ...rewardFormData, notify_parent: e.target.checked })}
                          className="w-4 h-4 rounded border-zinc-300 dark:border-zinc-600 text-amber-500 focus:ring-amber-500"
                        />
                        <span className="text-zinc-600 dark:text-zinc-400">{t('Notify Parent', 'إشعار ولي الأمر')}</span>
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowRewardForm(false)}
                        className="flex-1 px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                      >
                        {t('Cancel', 'إلغاء')}
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveReward}
                        className="flex-1 px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg hover:shadow-md transition-all"
                      >
                        {editingRewardIndex !== null ? t('Update', 'تحديث') : t('Add', 'إضافة')}
                      </button>
                    </div>
                  </motion.div>
                )}

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={levelFormData.is_active}
                    onChange={(e) => setLevelFormData({ ...levelFormData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-zinc-300 dark:border-zinc-600 text-orange-500 focus:ring-orange-500 transition-all"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('Active', 'نشط')}</span>
                </label>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <button
                  onClick={() => setShowLevelModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  onClick={handleSaveLevel}
                  disabled={!levelFormData.name}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {editingLevel ? t('Update', 'تحديث') : t('Create', 'إنشاء')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </ModalPortal>
        )}

        {/* Age Group Modal */}
        {showAgeGroupModal && (
        <ModalPortal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAgeGroupModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                  {editingAgeGroup ? t('Edit Age Group', 'تعديل الفئة العمرية') : t('Add Age Group', 'إضافة فئة عمرية')}
                </h2>
                <button
                  onClick={() => setShowAgeGroupModal(false)}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Name (EN)', 'الاسم (إنجليزي)')}
                    </label>
                    <input
                      type="text"
                      value={ageGroupFormData.name}
                      onChange={(e) => setAgeGroupFormData({ ...ageGroupFormData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="U10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Name (AR)', 'الاسم (عربي)')}
                    </label>
                    <input
                      type="text"
                      value={ageGroupFormData.name_ar}
                      onChange={(e) => setAgeGroupFormData({ ...ageGroupFormData, name_ar: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="تحت 10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Min Age', 'الحد الأدنى للعمر')}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={ageGroupFormData.min_age}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setAgeGroupFormData({ ...ageGroupFormData, min_age: val === '' ? 1 : parseInt(val) || 1 });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Max Age', 'الحد الأقصى للعمر')}
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={ageGroupFormData.max_age}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        setAgeGroupFormData({ ...ageGroupFormData, max_age: val === '' ? 1 : parseInt(val) || 1 });
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ageGroupFormData.is_active}
                    onChange={(e) => setAgeGroupFormData({ ...ageGroupFormData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-zinc-300 dark:border-zinc-600 text-orange-500 focus:ring-orange-500 transition-all"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('Active', 'نشط')}</span>
                </label>
              </div>

              <div className="flex gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                <button
                  onClick={() => setShowAgeGroupModal(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
                >
                  {t('Cancel', 'إلغاء')}
                </button>
                <button
                  onClick={handleSaveAgeGroup}
                  disabled={!ageGroupFormData.name}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-600 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {editingAgeGroup ? t('Update', 'تحديث') : t('Create', 'إنشاء')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </ModalPortal>
        )}

        {/* Delete Confirmation */}
        <ConfirmDialog
          open={!!deleteTarget}
          onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
          onConfirm={handleConfirmDelete}
          title={deleteTarget?.type === 'program'
            ? t('Delete Program', 'حذف البرنامج')
            : deleteTarget?.type === 'level'
            ? t('Delete Level', 'حذف المستوى')
            : t('Delete Age Group', 'حذف الفئة العمرية')
          }
          description={deleteTarget?.type === 'program' 
            ? t(`Are you sure you want to delete "${(deleteTarget?.item as Program)?.name}"? All levels and age groups will also be deleted.`, `هل أنت متأكد من حذف "${(deleteTarget?.item as Program)?.name}"? سيتم حذف جميع المستويات والفئات العمرية أيضاً.`)
            : deleteTarget?.type === 'level'
            ? t(`Are you sure you want to delete level "${(deleteTarget?.item as Level)?.name}"?`, `هل أنت متأكد من حذف المستوى "${(deleteTarget?.item as Level)?.name}"?`)
            : t(`Are you sure you want to delete age group "${(deleteTarget?.item as AgeGroup)?.name}"?`, `هل أنت متأکد من حذف الفئة العمرية "${(deleteTarget?.item as AgeGroup)?.name}"?`)
          }
          confirmText={t('Delete', 'حذف')}
          loading={deleting}
          errorMessage={deleteError}
        />

        {/* Health Test Fields Modal */}
        {showHealthTestFieldsModal && (
        <ModalPortal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowHealthTestFieldsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-zinc-200 dark:border-zinc-800"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {t('Health Test Fields Configuration', 'إعداد حقول الفحص الصحي')}
                  </h2>
                  <p className="text-emerald-100 text-sm mt-1">
                    {selectedProgram.name} {selectedProgram.name_ar && `• ${selectedProgram.name_ar}`}
                  </p>
                </div>
                <button
                  onClick={() => setShowHealthTestFieldsModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>

              <OverlayScrollbarsComponent className="max-h-[calc(90vh-80px)]" options={{ scrollbars: { autoHide: 'scroll' } }}>
                <div className="p-6 space-y-6">
                  {/* Add Field Button */}
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {t('Define custom health test metrics for this program. These fields will be used when conducting health tests for players.', 
                         'حدد مقاييس الفحص الصحي المخصصة لهذا البرنامج. سيتم استخدام هذه الحقول عند إجراء الفحوصات الصحية للاعبين.')}
                    </p>
                    <button
                      onClick={handleAddHealthField}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      {t('Add Field', 'إضافة حقل')}
                    </button>
                  </div>

                  {/* Fields List */}
                  {loadingHealthTestFields ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                    </div>
                  ) : healthTestFields.length === 0 ? (
                    <div className="text-center py-12 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                      <svg className="w-16 h-16 mx-auto text-zinc-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                        {t('No health test fields defined', 'لم يتم تحديد حقول للفحص الصحي')}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                        {t('Add custom fields to track health metrics for players in this program.', 'أضف حقولاً مخصصة لتتبع المقاييس الصحية للاعبين في هذا البرنامج.')}
                      </p>
                      <button
                        onClick={handleAddHealthField}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        {t('Add First Field', 'إضافة أول حقل')}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {healthTestFields.map((field, index) => (
                        <div
                          key={field.id}
                          className={`flex items-center gap-4 p-4 rounded-xl border ${
                            field.is_active 
                              ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700' 
                              : 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-600 opacity-60'
                          }`}
                        >
                          {/* Order Badge */}
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm shrink-0">
                            {index + 1}
                          </div>

                          {/* Field Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                {isAr ? field.field_name_ar || field.field_name : field.field_name}
                              </h4>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300">
                                {field.field_key}
                              </span>
                              {field.is_required && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                                  {t('Required', 'مطلوب')}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                              <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                {field.field_type === 'number' && t('Number', 'رقم')}
                                {field.field_type === 'text' && t('Text', 'نص')}
                                {field.field_type === 'select' && t('Select', 'اختيار')}
                                {field.field_type === 'boolean' && t('Yes/No', 'نعم/لا')}
                                {field.field_type === 'date' && t('Date', 'تاريخ')}
                                {field.field_type === 'range' && t('Range', 'نطاق')}
                              </span>
                              {field.field_unit && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                  </svg>
                                  {isAr ? field.field_unit_ar || field.field_unit : field.field_unit}
                                </span>
                              )}
                              {(field.min_value !== null || field.max_value !== null) && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                  </svg>
                                  {field.min_value ?? '-'} - {field.max_value ?? '-'}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleEditHealthField(field)}
                              className="p-2 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => field.id && handleDeleteHealthField(field.id)}
                              disabled={deletingHealthField === field.id}
                              className="p-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {deletingHealthField === field.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Field Form Modal */}
                  {showHealthFieldForm && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]" onClick={() => setShowHealthFieldForm(false)}>
                      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 flex items-center justify-between">
                          <h3 className="text-lg font-bold text-white">
                            {editingHealthField ? t('Edit Field', 'تعديل الحقل') : t('Add New Field', 'إضافة حقل جديد')}
                          </h3>
                          <button onClick={() => setShowHealthFieldForm(false)} className="p-2 hover:bg-white/20 rounded-lg">
                            <X className="w-5 h-5 text-white" />
                          </button>
                        </div>

                        <OverlayScrollbarsComponent className="max-h-[calc(85vh-70px)]" options={{ scrollbars: { autoHide: 'scroll' } }}>
                          <div className="p-6 space-y-4">
                            {/* Field Key & Name */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                  {t('Field Key', 'مفتاح الحقل')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={healthFieldFormData.field_key}
                                  onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, field_key: e.target.value.toLowerCase().replace(/\s+/g, '_') }))}
                                  placeholder="speed_test"
                                  disabled={!!editingHealthField}
                                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 disabled:opacity-60"
                                />
                                <p className="text-xs text-zinc-500 mt-1">{t('Unique identifier (no spaces)', 'معرف فريد (بدون مسافات)')}</p>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                  {t('Field Type', 'نوع الحقل')} <span className="text-red-500">*</span>
                                </label>
                                <select
                                  value={healthFieldFormData.field_type}
                                  onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, field_type: e.target.value as any }))}
                                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                >
                                  <option value="number">{t('Number', 'رقم')}</option>
                                  <option value="text">{t('Text', 'نص')}</option>
                                  <option value="select">{t('Select (Dropdown)', 'اختيار (قائمة)')}</option>
                                  <option value="boolean">{t('Yes/No', 'نعم/لا')}</option>
                                  <option value="date">{t('Date', 'تاريخ')}</option>
                                  <option value="range">{t('Range (Min-Max)', 'نطاق (أدنى-أقصى)')}</option>
                                </select>
                              </div>
                            </div>

                            {/* Field Names */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                  {t('Field Name (English)', 'اسم الحقل (إنجليزي)')} <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  value={healthFieldFormData.field_name}
                                  onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, field_name: e.target.value }))}
                                  placeholder="Speed Test"
                                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                  {t('Field Name (Arabic)', 'اسم الحقل (عربي)')}
                                </label>
                                <input
                                  type="text"
                                  value={healthFieldFormData.field_name_ar || ''}
                                  onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, field_name_ar: e.target.value }))}
                                  placeholder="اختبار السرعة"
                                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                  dir="rtl"
                                />
                              </div>
                            </div>

                            {/* Units (for number/range) */}
                            {(healthFieldFormData.field_type === 'number' || healthFieldFormData.field_type === 'range') && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('Unit (English)', 'الوحدة (إنجليزي)')}
                                  </label>
                                  <input
                                    type="text"
                                    value={healthFieldFormData.field_unit || ''}
                                    onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, field_unit: e.target.value }))}
                                    placeholder="seconds, kg, cm, bpm"
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('Unit (Arabic)', 'الوحدة (عربي)')}
                                  </label>
                                  <input
                                    type="text"
                                    value={healthFieldFormData.field_unit_ar || ''}
                                    onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, field_unit_ar: e.target.value }))}
                                    placeholder="ثانية، كغ، سم"
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                    dir="rtl"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Min/Max Values (for number/range) */}
                            {(healthFieldFormData.field_type === 'number' || healthFieldFormData.field_type === 'range') && (
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('Minimum Value', 'القيمة الدنيا')}
                                  </label>
                                  <input
                                    type="number"
                                    value={healthFieldFormData.min_value ?? ''}
                                    onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, min_value: e.target.value ? parseFloat(e.target.value) : null }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                    {t('Maximum Value', 'القيمة القصوى')}
                                  </label>
                                  <input
                                    type="number"
                                    value={healthFieldFormData.max_value ?? ''}
                                    onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, max_value: e.target.value ? parseFloat(e.target.value) : null }))}
                                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                                  />
                                </div>
                              </div>
                            )}

                            {/* Select Options */}
                            {healthFieldFormData.field_type === 'select' && (
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                    {t('Options', 'الخيارات')} <span className="text-red-500">*</span>
                                  </label>
                                  <button
                                    type="button"
                                    onClick={addFieldOption}
                                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                                  >
                                    <Plus className="w-4 h-4" />
                                    {t('Add Option', 'إضافة خيار')}
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {(healthFieldFormData.field_options || []).map((option, index) => (
                                    <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 items-center">
                                      <input
                                        type="text"
                                        value={option.value}
                                        onChange={(e) => updateFieldOption(index, 'value', e.target.value)}
                                        placeholder={t('Value', 'القيمة')}
                                        className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                                      />
                                      <input
                                        type="text"
                                        value={option.label}
                                        onChange={(e) => updateFieldOption(index, 'label', e.target.value)}
                                        placeholder={t('Label (EN)', 'التسمية (EN)')}
                                        className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                                      />
                                      <input
                                        type="text"
                                        value={option.label_ar || ''}
                                        onChange={(e) => updateFieldOption(index, 'label_ar', e.target.value)}
                                        placeholder={t('Label (AR)', 'التسمية (AR)')}
                                        className="w-full min-w-0 px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                                        dir="rtl"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => removeFieldOption(index)}
                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex-shrink-0"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  ))}
                                  {(!healthFieldFormData.field_options || healthFieldFormData.field_options.length === 0) && (
                                    <p className="text-sm text-zinc-500 text-center py-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                                      {t('No options added yet. Click "Add Option" to add options.', 'لم تتم إضافة خيارات بعد. انقر على "إضافة خيار" لإضافة خيارات.')}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Description */}
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                  {t('Description (English)', 'الوصف (إنجليزي)')}
                                </label>
                                <textarea
                                  value={healthFieldFormData.description || ''}
                                  onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, description: e.target.value }))}
                                  rows={2}
                                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 resize-none"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                                  {t('Description (Arabic)', 'الوصف (عربي)')}
                                </label>
                                <textarea
                                  value={healthFieldFormData.description_ar || ''}
                                  onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, description_ar: e.target.value }))}
                                  rows={2}
                                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 resize-none"
                                  dir="rtl"
                                />
                              </div>
                            </div>

                            {/* Settings */}
                            <div className="flex items-center gap-6 pt-2">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={healthFieldFormData.is_required}
                                  onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, is_required: e.target.checked }))}
                                  className="w-4 h-4 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-zinc-700 dark:text-zinc-300">{t('Required Field', 'حقل مطلوب')}</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={healthFieldFormData.is_active}
                                  onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                                  className="w-4 h-4 rounded border-zinc-300 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="text-sm text-zinc-700 dark:text-zinc-300">{t('Active', 'نشط')}</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <label className="text-sm text-zinc-700 dark:text-zinc-300">{t('Display Order:', 'ترتيب العرض:')}</label>
                                <input
                                  type="number"
                                  value={healthFieldFormData.display_order}
                                  onChange={(e) => setHealthFieldFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                                  min="0"
                                  className="w-20 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-sm"
                                />
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                              <button
                                type="button"
                                onClick={() => setShowHealthFieldForm(false)}
                                className="px-5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800"
                              >
                                {t('Cancel', 'إلغاء')}
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveHealthField}
                                disabled={savingHealthField}
                                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium hover:shadow-lg disabled:opacity-60 flex items-center gap-2"
                              >
                                {savingHealthField && <Loader2 className="w-4 h-4 animate-spin" />}
                                {editingHealthField ? t('Update Field', 'تحديث الحقل') : t('Create Field', 'إنشاء الحقل')}
                              </button>
                            </div>
                          </div>
                        </OverlayScrollbarsComponent>
                      </div>
                    </div>
                  )}
                </div>
              </OverlayScrollbarsComponent>
            </motion.div>
          </motion.div>
        </ModalPortal>
        )}
      </div>
    );
  }

  // Get filtered academy name
  const filteredAcademy = academyFilter ? academies.find(a => a.id === academyFilter) : null;

  // Render programs list
  return (
    <div className="space-y-6">
      {/* Academy Filter Banner */}
      {academyFilter && filteredAcademy && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <Search className="w-4 h-4" />
            {isAr 
              ? `🔍 عرض برامج أكاديمية: ${filteredAcademy.name_ar || filteredAcademy.name}`
              : `🔍 Showing programs of academy: ${filteredAcademy.name}`}
          </p>
          <button
            onClick={() => {
              setAcademyFilter('');
              window.history.pushState({}, '', `/${locale}/dashboard/programs`);
            }}
            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
          >
            {isAr ? 'إزالة الفلتر' : 'Clear Filter'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {t('Programs', 'البرامج')}
        </h1>
        {canCreateProgram() && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>{t('Add Program', 'إضافة برنامج')}</span>
          </button>
        )}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t('Search programs...', 'بحث عن البرامج...')}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
          />
        </div>
        <button
          onClick={() => handleSort('name')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
        >
          {getSortIcon('name')}
          <span className="text-sm font-medium">{t('Sort by Name', 'ترتيب حسب الاسم')}</span>
        </button>
      </div>

      {/* Programs Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {programs.map((program) => (
                <motion.div
                  key={program.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative group"
                >
                  <div className={`h-[340px] flex flex-col rounded-2xl border ${program.is_active ? 'border-zinc-200 dark:border-zinc-800' : 'border-red-200 dark:border-red-900/50'} bg-white dark:bg-zinc-900 p-5 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {program.image_url ? (
                          <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                            <img
                              src={program.image_url}
                              alt={program.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shrink-0">
                            <Layers className="w-10 h-10 text-white" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">{program.name}</h3>
                          {program.name_ar && (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">{program.name_ar}</p>
                          )}
                        </div>
                      </div>
                      {program.is_active ? (
                        <CheckCircle2 className="w-5 h-5 text-orange-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>

                    {/* Academy */}
                    {program.academy_name && (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-2">
                        {program.academy_name}
                      </p>
                    )}

                    {/* Description */}
                    {program.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">
                        {program.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-3 mb-auto text-sm">
                      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        <Target className="w-4 h-4" />
                        <span>{program.level_count || 0} {program.level_count === 1 ? t('Level', 'مستوى') : t('Levels', 'مستويات')}</span>
                      </div>
                      <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                        <Target className="w-4 h-4" />
                        <span>{program.age_group_count || 0} {program.age_group_count === 1 ? t('Age Group', 'فئة عمرية') : t('Age Groups', 'فئات عمرية')}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleViewLevels(program)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                      >
                        <Target className="w-4 h-4" />
                        {t('Levels', 'المستویات')}
                      </button>
                      {canEditProgram() && (
                        <button
                          onClick={() => handleEdit(program)}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {canDeleteProgram() && (
                        <button
                          onClick={() => setDeleteTarget({ type: 'program', item: program })}
                          className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Empty State */}
          {programs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <Layers className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                {t('No programs yet', 'لا توجد برامج بعد')}
              </h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                {t('Create your first program to get started', 'أنشئ برنامجك الأول للبدء')}
              </p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t(`Page ${page} of ${totalPages}`, `صفحة ${page} من ${totalPages}`)}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Program Modal */}
      {showModal && (
      <ModalPortal>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {editingProgram ? t('Edit Program', 'تعديل البرنامج') : t('Add Program', 'إضافة برنامج')}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <OverlayScrollbarsComponent
              options={{ scrollbars: { autoHide: 'scroll' } }}
              className="max-h-[60vh]"
            >
              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Name (English)', 'الاسم (إنجليزي)')} *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      placeholder={t('Football', 'كرة القدم')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Name (Arabic)', 'الاسم (عربي)')}
                    </label>
                    <input
                      type="text"
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      dir="rtl"
                      placeholder="كرة القدم"
                    />
                  </div>
                </div>

                {isAdmin && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Academy', 'الأكاديمية')} *
                    </label>
                    <select
                      value={formData.academy_id}
                      onChange={(e) => setFormData({ ...formData, academy_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                      required
                    >
                      <option value="">{t('Select Academy', 'اختر الأكاديمية')}</option>
                      {academies.map((academy) => (
                        <option key={academy.id} value={academy.id}>
                          {isAr ? (academy.name_ar || academy.name) : academy.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {t('Image', 'الصورة')}
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
                      {programImagePreview ? (
                        <img
                          src={programImagePreview}
                          alt="Program"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs text-zinc-400">{t('No image', 'لا توجد صورة')}</span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <input
                        ref={programFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProgramImageChange}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => programFileInputRef.current?.click()}
                        className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        disabled={uploadingProgramImage}
                      >
                        {uploadingProgramImage ? t('Uploading...', 'جاري الرفع...') : t('Upload Image', 'رفع صورة')}
                      </button>
                      {programImagePreview && (
                        <button
                          type="button"
                          onClick={() => {
                            setProgramImageFile(null);
                            setProgramImagePreview(null);
                          }}
                          className="text-xs text-red-500 hover:text-red-600"
                        >
                          {t('Remove', 'حذف')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {t('Description (English)', 'الوصف (إنجليزي)')}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                    placeholder={t('Program description...', 'وصف البرنامج...')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    {t('Description (Arabic)', 'الوصف (عربي)')}
                  </label>
                  <textarea
                    rows={3}
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none"
                    dir="rtl"
                    placeholder={t('Program description...', 'وصف البرنامج...')}
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-5 h-5 rounded-lg border-zinc-300 dark:border-zinc-600 text-orange-500 focus:ring-orange-500 transition-all"
                  />
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('Active', 'نشط')}</span>
                </label>
              </div>
            </OverlayScrollbarsComponent>

            <div className="flex gap-3 px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors"
              >
                {t('Cancel', 'إلغاء')}
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || (isAdmin && academies.length > 1 && !formData.academy_id)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl hover:shadow-lg hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {editingProgram ? t('Update', 'تحديث') : t('Create', 'إنشاء')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      </ModalPortal>
      )}

      {/* Academy Assignment Modal */}
      {(() => {
        const program = selectedProgram as Program | null;
        if (!showAcademyAssignmentModal || !program) return null;
        return (
        <ModalPortal>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowAcademyAssignmentModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-zinc-200 dark:border-zinc-800"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-white">
                    {t('Assign to Academies', 'تعيين للأكاديميات')}
                  </h2>
                  <p className="text-blue-100 text-sm mt-1">
                    {program.name} {program.name_ar && `• ${program.name_ar}`}
                  </p>
                </div>
                <button
                  onClick={() => setShowAcademyAssignmentModal(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>


              <OverlayScrollbarsComponent className="max-h-[calc(85vh-80px)]" options={{ scrollbars: { autoHide: 'scroll' } }}>
                <div className="p-6 space-y-6">
                  {/* Assign New Academies */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-blue-500" />
                      {t('Add to Academy', 'إضافة إلى أكاديمية')}
                    </h3>
                    
                    {getUnassignedAcademies().length > 0 ? (
                      <div className="space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {getUnassignedAcademies().map((academy) => (
                            <label
                              key={academy.id}
                              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition-all ${
                                selectedAcademiesToAssign.includes(academy.id)
                                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300'
                                  : 'border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-600'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selectedAcademiesToAssign.includes(academy.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedAcademiesToAssign([...selectedAcademiesToAssign, academy.id]);
                                  } else {
                                    setSelectedAcademiesToAssign(selectedAcademiesToAssign.filter(id => id !== academy.id));
                                  }
                                }}
                                className="w-4 h-4 rounded border-zinc-300 text-blue-500 focus:ring-blue-500"
                              />
                              <span className="text-sm font-medium">
                                {isAr ? (academy.name_ar || academy.name) : academy.name}
                              </span>
                            </label>
                          ))}
                        </div>
                        
                        {selectedAcademiesToAssign.length > 0 && (
                          <button
                            onClick={handleAssignAcademies}
                            disabled={savingAcademyAssignment}
                            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50"
                          >
                            {savingAcademyAssignment ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Plus className="w-4 h-4" />
                            )}
                            {t(`Assign to ${selectedAcademiesToAssign.length} Academy`, `تعيين لـ ${selectedAcademiesToAssign.length} أكاديمية`)}
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-xl px-4 py-3">
                        {t('All academies have been assigned this program', 'تم تعيين هذا البرنامج لجميع الأكاديميات')}
                      </p>
                    )}
                  </div>

                  {/* Current Assigned Academies */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {t('Assigned Academies', 'الأكاديميات المعينة')} 
                      <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-bold px-2 py-0.5 rounded-full">
                        {assignedAcademies.length}
                      </span>
                    </h3>

                    {loadingAssignedAcademies ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      </div>
                    ) : assignedAcademies.length === 0 ? (
                      <div className="text-center py-8 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border-2 border-dashed border-zinc-300 dark:border-zinc-700">
                        <svg className="w-12 h-12 mx-auto text-zinc-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400">
                          {t('No academies assigned yet', 'لم يتم تعيين أي أكاديمية بعد')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {assignedAcademies.map((assignment) => (
                          <div
                            key={assignment.assignment_id}
                            className={`flex items-center justify-between p-4 rounded-xl border ${
                              assignment.is_active
                                ? 'bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                                : 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-600 opacity-70'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                                {(isAr ? assignment.academy_name_ar || assignment.academy_name : assignment.academy_name).charAt(0)}
                              </div>
                              <div>
                                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                                  {isAr ? assignment.academy_name_ar || assignment.academy_name : assignment.academy_name}
                                </h4>
                                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                                  <span>{t('Players', 'اللاعبين')}: {assignment.player_count}</span>
                                  <span>•</span>
                                  <span>{new Date(assignment.assigned_at).toLocaleDateString(isAr ? 'ar' : 'en')}</span>
                                  {!assignment.is_active && (
                                    <>
                                      <span>•</span>
                                      <span className="text-amber-500">{t('Inactive', 'غير نشط')}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveAcademyAssignment(assignment.academy_id)}
                              disabled={removingAcademy === assignment.academy_id}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                              title={t('Remove', 'إزالة')}
                            >
                              {removingAcademy === assignment.academy_id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </OverlayScrollbarsComponent>
            </motion.div>
          </motion.div>
        </ModalPortal>
        );
      })()}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.type === 'program' ? t('Delete Program', 'حذف البرنامج') : t('Delete Level', 'حذف المستوى')}
        description={deleteTarget?.type === 'program' 
          ? t(`Are you sure you want to delete "${(deleteTarget?.item as Program)?.name}"? All levels will also be deleted.`, `هل أنت متأکد من حذف "${(deleteTarget?.item as Program)?.name}"? سيتم حذف جميع المستويات أيضاً.`)
          : t(`Are you sure you want to delete level "${(deleteTarget?.item as Level)?.name}"?`, `هل أنت متأکد من حذف المستوى "${(deleteTarget?.item as Level)?.name}"?`)
        }
        confirmText={t('Delete', 'حذف')}
        loading={deleting}
        errorMessage={deleteError}
      />
    </div>
  );
}
