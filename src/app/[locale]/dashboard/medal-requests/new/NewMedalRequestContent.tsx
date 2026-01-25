'use client';

import { useEffect, useState } from 'react';
import { Award, Building2, Loader2, Medal, Send, Star } from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

interface PlayerOption {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  academy_id?: string;
  academy_name?: string;
  academy_name_ar?: string;
}

interface Academy {
  id: string;
  name: string;
  name_ar?: string | null;
}

const MEDAL_TYPES: Record<string, { label: string; labelAr: string; gradient: string; description: string; descriptionAr: string }> = {
  gold: { 
    label: 'Gold Medal', 
    labelAr: 'ميدالية ذهبية', 
    gradient: 'from-yellow-400 via-yellow-500 to-amber-600',
    description: 'For exceptional achievements and outstanding performance',
    descriptionAr: 'للإنجازات الاستثنائية والأداء المتميز'
  },
  silver: { 
    label: 'Silver Medal', 
    labelAr: 'ميدالية فضية', 
    gradient: 'from-zinc-300 via-zinc-400 to-zinc-500',
    description: 'For excellent achievements and great effort',
    descriptionAr: 'للإنجازات الممتازة والجهود العظيمة'
  },
  bronze: { 
    label: 'Bronze Medal', 
    labelAr: 'ميدالية برونزية', 
    gradient: 'from-amber-600 via-orange-600 to-orange-700',
    description: 'For good achievements and consistent performance',
    descriptionAr: 'للإنجازات الجيدة والأداء المستمر'
  },
  special: { 
    label: 'Special Medal', 
    labelAr: 'ميدالية خاصة', 
    gradient: 'from-purple-500 via-indigo-600 to-violet-700',
    description: 'For unique achievements and special recognition',
    descriptionAr: 'للإنجازات الفريدة والتقدير الخاص'
  },
};

export default function NewMedalRequestContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();
  const router = useRouter();

  const [academies, setAcademies] = useState<Academy[]>([]);
  const [players, setPlayers] = useState<PlayerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleName, setRoleName] = useState<string>('');
  const [selectedAcademy, setSelectedAcademy] = useState<string>('');
  
  const [form, setForm] = useState({
    user_id: '',
    medal_type: '',
    achievement_description: '',
  });

  const [selectedPlayer, setSelectedPlayer] = useState<PlayerOption | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch role
        const roleResponse = await fetch('/api/auth/me');
        if (roleResponse.ok) {
          const roleData = await roleResponse.json();
          setRoleName(roleData.roleName || '');
          
          // If admin, fetch academies
          if (roleData.roleName === 'admin') {
            const academiesResponse = await fetch('/api/academies?limit=100');
            const academiesData = await academiesResponse.json();
            if (academiesResponse.ok) {
              setAcademies(academiesData.academies || []);
            }
          }
        }
        
        // Fetch players
        const playersResponse = await fetch('/api/users?role=player&limit=500');
        const playersData = await playersResponse.json();
        if (playersResponse.ok) setPlayers(playersData.users || []);
      } catch (error) {
        showToast('error', isAr ? 'فشل تحميل البيانات' : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAr, showToast]);

  const filteredPlayers = players.filter(p => {
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    
    // If admin and academy is selected, filter by academy
    if (roleName === 'admin' && selectedAcademy && selectedAcademy !== 'all') {
      return matchesSearch && p.academy_id === selectedAcademy;
    }
    
    return matchesSearch;
  });

  const handleSelectPlayer = (player: PlayerOption) => {
    setSelectedPlayer(player);
    setForm(prev => ({ ...prev, user_id: player.id }));
  };

  const handleSubmit = async () => {
    if (!form.user_id || !form.medal_type) {
      showToast('error', isAr ? 'اختر اللاعب ونوع الميدالية' : 'Select player and medal type');
      return;
    }
    if (!form.achievement_description.trim()) {
      showToast('error', isAr ? 'أدخل وصف الإنجاز' : 'Enter achievement description');
      return;
    }
    try {
      setSaving(true);
      const response = await fetch('/api/medal-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed');
      
      showToast('success', isAr ? 'تم إرسال الطلب بنجاح' : 'Request submitted successfully');
      
      // Navigate back to medal requests page
      router.push(`/${locale}/dashboard/medal-requests`);
    } catch (error: any) {
      showToast('error', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const selectedMedal = form.medal_type ? MEDAL_TYPES[form.medal_type] : null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 mb-4">
          <Star className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          {isAr ? 'طلب ميدالية جديدة' : 'New Medal Request'}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          {isAr ? 'قم بتكريم اللاعبين المتميزين بميداليات فيزيائية' : 'Honor exceptional players with physical medals'}
        </p>
      </div>

      {/* Step 0: Select Academy (Admin only) */}
      {roleName === 'admin' && academies.length > 0 && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white font-bold text-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {isAr ? 'اختر الأكاديمية' : 'Select Academy'}
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedAcademy('all')}
                className={`p-4 rounded-xl border-2 transition-all text-left ${
                  selectedAcademy === 'all'
                    ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-amber-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-zinc-300 to-zinc-400 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-zinc-700" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {isAr ? 'جميع الأكاديميات' : 'All Academies'}
                    </h4>
                    <p className="text-xs text-zinc-500">
                      {players.length} {isAr ? 'لاعب' : 'players'}
                    </p>
                  </div>
                </div>
              </button>
              {academies.map((academy) => {
                const academyPlayerCount = players.filter(p => p.academy_id === academy.id).length;
                return (
                  <button
                    key={academy.id}
                    type="button"
                    onClick={() => setSelectedAcademy(academy.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      selectedAcademy === academy.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {isAr ? academy.name_ar || academy.name : academy.name}
                        </h4>
                        <p className="text-xs text-zinc-500">
                          {academyPlayerCount} {isAr ? 'لاعب' : 'players'}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 1: Select Player */}
      <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white font-bold text-sm">
              {roleName === 'admin' && academies.length > 0 ? '1' : '1'}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {isAr ? 'اختر اللاعب' : 'Select Player'}
              </h2>
              {roleName === 'admin' && selectedAcademy && selectedAcademy !== 'all' && (
                <p className="text-xs text-zinc-500 mt-0.5">
                  {isAr ? 'من أكاديمية: ' : 'From academy: '}
                  {academies.find(a => a.id === selectedAcademy) && (
                    isAr 
                      ? academies.find(a => a.id === selectedAcademy)?.name_ar || academies.find(a => a.id === selectedAcademy)?.name
                      : academies.find(a => a.id === selectedAcademy)?.name
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Search */}
          <div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? 'ابحث عن اللاعب...' : 'Search for player...'}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-amber-500"
            />
            {filteredPlayers.length > 0 && (
              <p className="text-xs text-zinc-500 mt-2">
                {isAr ? `تم العثور على ${filteredPlayers.length} لاعب` : `Found ${filteredPlayers.length} players`}
              </p>
            )}
          </div>

          {/* Selected Player */}
          {selectedPlayer && (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-500">
              <div className="flex items-center gap-4">
                {selectedPlayer.avatar_url ? (
                  <img src={selectedPlayer.avatar_url} alt="" className="w-16 h-16 rounded-xl object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white text-xl font-bold">
                    {selectedPlayer.first_name[0]}{selectedPlayer.last_name[0]}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                    {selectedPlayer.first_name} {selectedPlayer.last_name}
                  </h3>
                  {selectedPlayer.academy_name && (
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {isAr ? selectedPlayer.academy_name_ar || selectedPlayer.academy_name : selectedPlayer.academy_name}
                    </p>
                  )}
                </div>
                <Award className="w-8 h-8 text-amber-500" />
              </div>
            </div>
          )}

          {/* Players Grid */}
          {!selectedPlayer && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
              {filteredPlayers.map((player) => (
                <button
                  key={player.id}
                  type="button"
                  onClick={() => handleSelectPlayer(player)}
                  className="p-4 rounded-xl border-2 border-zinc-200 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-500 bg-white dark:bg-zinc-900 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    {player.avatar_url ? (
                      <img src={player.avatar_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-zinc-200 to-zinc-300 dark:from-zinc-700 dark:to-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 font-bold">
                        {player.first_name[0]}{player.last_name[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                        {player.first_name} {player.last_name}
                      </h4>
                      {player.academy_name && (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                          {isAr ? player.academy_name_ar || player.academy_name : player.academy_name}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {selectedPlayer && (
            <button
              type="button"
              onClick={() => {
                setSelectedPlayer(null);
                setForm(prev => ({ ...prev, user_id: '' }));
              }}
              className="text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              {isAr ? 'تغيير اللاعب' : 'Change Player'}
            </button>
          )}
        </div>
      </div>

      {/* Step 2: Select Medal Type */}
      {form.user_id && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white font-bold text-sm">
                {roleName === 'admin' && academies.length > 0 ? '2' : '2'}
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {isAr ? 'اختر نوع الميدالية' : 'Select Medal Type'}
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(MEDAL_TYPES).map(([value, config]) => {
                const isSelected = form.medal_type === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, medal_type: value }))}
                    className={`p-6 rounded-2xl border-2 transition-all text-left ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-lg shadow-amber-500/25'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-700'
                    }`}
                  >
                    <div className="flex items-center gap-4 mb-3">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}>
                        <Medal className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                          {isAr ? config.labelAr : config.label}
                        </h3>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center">
                          <Award className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {isAr ? config.descriptionAr : config.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Achievement Description */}
      {form.user_id && form.medal_type && (
        <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-800 dark:to-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500 text-white font-bold text-sm">
                {roleName === 'admin' && academies.length > 0 ? '3' : '3'}
              </div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {isAr ? 'وصف الإنجاز' : 'Achievement Description'}
              </h2>
            </div>
          </div>

          <div className="p-6 space-y-4">
            <textarea
              rows={6}
              value={form.achievement_description}
              onChange={(e) => setForm(prev => ({ ...prev, achievement_description: e.target.value }))}
              placeholder={isAr ? 'اكتب وصفاً مفصلاً عن الإنجاز الذي استحق هذه الميدالية...' : 'Write a detailed description of the achievement that earned this medal...'}
              className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-amber-500 resize-none"
            />
            <p className="text-xs text-zinc-500">
              {isAr 
                ? 'سيتم إرسال هذا الوصف مع الميدالية وسيظهر في ملف اللاعب' 
                : 'This description will be sent with the medal and displayed on the player\'s profile'}
            </p>
          </div>
        </div>
      )}

      {/* Summary & Submit */}
      {form.user_id && form.medal_type && form.achievement_description && (
        <div className="rounded-3xl border-2 border-amber-500 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-8">
          <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-4 flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-600" />
            {isAr ? 'ملخص الطلب' : 'Request Summary'}
          </h3>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{isAr ? 'اللاعب:' : 'Player:'}</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {selectedPlayer?.first_name} {selectedPlayer?.last_name}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">{isAr ? 'نوع الميدالية:' : 'Medal Type:'}</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {selectedMedal && (isAr ? selectedMedal.labelAr : selectedMedal.label)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-4 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
            >
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 px-6 py-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25"
            >
              {saving ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isAr ? 'جاري الإرسال...' : 'Submitting...'}
                </>
              ) : (
                <>
                  <Send className="h-5 w-5" />
                  {isAr ? 'إرسال الطلب' : 'Submit Request'}
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
