'use client';

import { useEffect, useRef, useState } from 'react';
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
  Clock
} from 'lucide-react';

interface Level {
  id: string;
  name: string;
  name_ar: string;
  description: string;
  image_url: string;
  level_order: number;
  min_sessions: number;
  min_points: number;
  is_active: boolean;
  created_at: string;
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
  created_at: string;
  levels?: Level[];
  age_groups?: AgeGroup[];
}

interface Academy {
  id: string;
  name: string;
  name_ar: string;
}

export default function ProgramsContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  
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
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showModal, setShowModal] = useState(false);
  const [showLevelModal, setShowLevelModal] = useState(false);
  const [showAgeGroupModal, setShowAgeGroupModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [editingAgeGroup, setEditingAgeGroup] = useState<AgeGroup | null>(null);
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
    is_active: true
  });
  const [ageGroupFormData, setAgeGroupFormData] = useState({
    name: '',
    name_ar: '',
    min_age: 6,
    max_age: 18,
    is_active: true
  });

  if (currentRole === 'coach') {
    return <CoachProgramsContent />;
  }

  useEffect(() => {
    fetchPrograms();
    fetchAcademies();
    checkIsAdmin();
  }, [page, limit, search, sortField, sortOrder]);

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

  const fetchPrograms = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy: sortField,
        sortOrder: sortOrder,
        ...(search && { search })
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
      is_active: true
    });
    setLevelImageFile(null);
    setLevelImagePreview(null);
    setShowLevelModal(true);
  };

  const handleEditLevel = (level: Level) => {
    setEditingLevel(level);
    setLevelFormData({
      name: level.name,
      name_ar: level.name_ar || '',
      description: level.description || '',
      image_url: level.image_url || '',
      level_order: level.level_order,
      min_sessions: level.min_sessions,
      min_points: level.min_points,
      is_active: level.is_active
    });
    setLevelImageFile(null);
    setLevelImagePreview(level.image_url || null);
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
        showToast('success', editingLevel ? 'Level updated successfully' : 'Level created successfully');
        setShowLevelModal(false);
        setLevelImageFile(null);
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
            <button
              onClick={handleAddLevel}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>{t('Add Level', 'إضافة مستوى')}</span>
            </button>
            <button
              onClick={handleAddAgeGroup}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span>{t('Add Age Group', 'إضافة فئة عمرية')}</span>
            </button>
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
                <div className={`rounded-2xl border ${level.is_active ? 'border-zinc-200 dark:border-zinc-800' : 'border-red-200 dark:border-red-900/50'} bg-white dark:bg-zinc-900 p-5 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all`}>
                  {level.image_url && (
                    <div className="mb-4">
                      <img
                        src={level.image_url}
                        alt={level.name}
                        className="w-full h-36 object-cover rounded-xl"
                        loading="lazy"
                      />
                    </div>
                  )}
                  {/* Level Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                        {level.level_order}
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{level.name}</h3>
                        {level.name_ar && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{level.name_ar}</p>
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
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-zinc-500 dark:text-zinc-400">{t('Min Sessions', 'الحد الأدنى للجلسات')}</p>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{level.min_sessions}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                        <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <div>
                        <p className="text-zinc-500 dark:text-zinc-400">{t('Min Points', 'الحد الأدنى للنقاط')}</p>
                        <p className="font-semibold text-zinc-900 dark:text-zinc-100">{level.min_points}</p>
                      </div>
                    </div>
                  </div>

                  {level.description && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">
                      {level.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditLevel(level)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                      {t('Edit', 'تعديل')}
                    </button>
                    <button
                      onClick={() => setDeleteTarget({ type: 'level', item: level, programId: selectedProgram.id })}
                      className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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
              <button
                onClick={handleAddLevel}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('Add Level', 'إضافة مستوى')}
              </button>
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
                  <div className={`rounded-2xl border ${ageGroup.is_active ? 'border-zinc-200 dark:border-zinc-800' : 'border-red-200 dark:border-red-900/50'} bg-white dark:bg-zinc-900 p-5 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all`}>
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
                      <button
                        onClick={() => handleEditAgeGroup(ageGroup)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                        {t('Edit', 'تعديل')}
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'age_group', item: ageGroup, programId: selectedProgram.id })}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
                <button
                  onClick={handleAddAgeGroup}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  {t('Add Age Group', 'إضافة فئة عمرية')}
                </button>
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
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLevelModal(false)}
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
                  {editingLevel ? t('Edit Level', 'تعديل المستوى') : t('Add Level', 'إضافة مستوى')}
                </h2>
                <button
                  onClick={() => setShowLevelModal(false)}
                  className="p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
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
                    type="number"
                    min="1"
                    value={levelFormData.level_order}
                    onChange={(e) => setLevelFormData({ ...levelFormData, level_order: parseInt(e.target.value) || 1 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Min Sessions Required', 'الحد الأدنى للجلسات')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={levelFormData.min_sessions}
                      onChange={(e) => setLevelFormData({ ...levelFormData, min_sessions: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Min Points Required', 'الحد الأدنى للنقاط')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={levelFormData.min_points}
                      onChange={(e) => setLevelFormData({ ...levelFormData, min_points: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    />
                  </div>
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
                      type="number"
                      min={1}
                      value={ageGroupFormData.min_age}
                      onChange={(e) => setAgeGroupFormData({ ...ageGroupFormData, min_age: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Max Age', 'الحد الأقصى للعمر')}
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={ageGroupFormData.max_age}
                      onChange={(e) => setAgeGroupFormData({ ...ageGroupFormData, max_age: Number(e.target.value) })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
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
            : t(`Are you sure you want to delete age group "${(deleteTarget?.item as AgeGroup)?.name}"?`, `هل أنت متأكد من حذف الفئة العمرية "${(deleteTarget?.item as AgeGroup)?.name}"?`)
          }
          confirmText={t('Delete', 'حذف')}
          loading={deleting}
          errorMessage={deleteError}
        />
      </div>
    );
  }

  // Render programs list
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          {t('Programs', 'البرامج')}
        </h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-orange-500/25 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>{t('Add Program', 'إضافة برنامج')}</span>
        </button>
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
                  <div className={`rounded-2xl border ${program.is_active ? 'border-zinc-200 dark:border-zinc-800' : 'border-red-200 dark:border-red-900/50'} bg-white dark:bg-zinc-900 p-5 hover:shadow-xl hover:shadow-zinc-200/50 dark:hover:shadow-zinc-900/50 transition-all`}>
                    {program.image_url && (
                      <div className="mb-4">
                        <img
                          src={program.image_url}
                          alt={program.name}
                          className="w-full h-36 object-cover rounded-xl"
                          loading="lazy"
                        />
                      </div>
                    )}
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                          <Layers className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{program.name}</h3>
                          {program.name_ar && (
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{program.name_ar}</p>
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
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
                        {program.academy_name}
                      </p>
                    )}

                    {/* Description */}
                    {program.description && (
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 line-clamp-2">
                        {program.description}
                      </p>
                    )}

                    {/* Stats */}
                    <div className="flex flex-wrap items-center gap-3 mb-4 text-sm">
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
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewLevels(program)}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                      >
                        <Target className="w-4 h-4" />
                        {t('Levels', 'المستويات')}
                      </button>
                      <button
                        onClick={() => handleEdit(program)}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget({ type: 'program', item: program })}
                        className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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
              <p className="text-zinc-500 dark:text-zinc-400 mb-4">
                {t('Create your first program to get started', 'أنشئ برنامجك الأول للبدء')}
              </p>
              <button
                onClick={handleAdd}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:from-orange-600 hover:to-amber-600 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('Add Program', 'إضافة برنامج')}
              </button>
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

                {isAdmin && academies.length > 1 && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      {t('Academy', 'الأكاديمية')} *
                    </label>
                    <select
                      value={formData.academy_id}
                      onChange={(e) => setFormData({ ...formData, academy_id: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                    >
                      <option value="">{t('Select Academy', 'اختر الأكاديمية')}</option>
                      {academies.map((academy) => (
                        <option key={academy.id} value={academy.id}>
                          {academy.name} {academy.name_ar && `(${academy.name_ar})`}
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

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => { setDeleteTarget(null); setDeleteError(null); }}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.type === 'program' ? t('Delete Program', 'حذف البرنامج') : t('Delete Level', 'حذف المستوى')}
        description={deleteTarget?.type === 'program' 
          ? t(`Are you sure you want to delete "${(deleteTarget?.item as Program)?.name}"? All levels will also be deleted.`, `هل أنت متأكد من حذف "${(deleteTarget?.item as Program)?.name}"? سيتم حذف جميع المستويات أيضاً.`)
          : t(`Are you sure you want to delete level "${(deleteTarget?.item as Level)?.name}"?`, `هل أنت متأكد من حذف المستوى "${(deleteTarget?.item as Level)?.name}"?`)
        }
        confirmText={t('Delete', 'حذف')}
        loading={deleting}
        errorMessage={deleteError}
      />
    </div>
  );
}
