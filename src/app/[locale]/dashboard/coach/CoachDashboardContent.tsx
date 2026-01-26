'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Award, Check, ChevronDown, Filter, Loader2, MessageSquare, Plus, Save, Search, Star, Trophy, Users, X } from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import { useToast } from '@/components/ToastProvider';
import DateTimePicker from '@/components/DateTimePicker';

interface AgeGroup {
  id: string;
  program_id: string;
  name: string;
  name_ar?: string | null;
  min_age: number;
  max_age: number;
}

interface Program {
  id: string;
  name: string;
  name_ar?: string | null;
  description?: string | null;
  image_url?: string | null;
  age_groups?: AgeGroup[];
}

interface Player {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  position?: string | null;
  sport?: string | null;
  present?: boolean | null;
  score?: number | null;
  notes?: string | null;
  level?: number;
  points?: number;
}

interface Achievement {
  id: string;
  title: string;
  title_ar?: string | null;
  description?: string | null;
  icon_url?: string | null;
}

interface ActivityLog {
  id: string;
  playerId: string;
  playerName: string;
  type: 'attendance' | 'score' | 'message' | 'achievement';
  action: string;
  value?: string | number;
  timestamp: Date;
}

export default function CoachDashboardContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();

  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [messageOpenId, setMessageOpenId] = useState<string | null>(null);
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  
  // Score popup state
  const [scoreOpenId, setScoreOpenId] = useState<string | null>(null);
  const [scoreValue, setScoreValue] = useState<number>(5);
  
  // Achievement popup state
  const [achievementOpenId, setAchievementOpenId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);
  const [awardingAchievement, setAwardingAchievement] = useState(false);
  
  // Activity Log
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [showActivityPanel, setShowActivityPanel] = useState(false);
  
  const addActivity = (playerId: string, playerName: string, type: ActivityLog['type'], action: string, value?: string | number) => {
    const newActivity: ActivityLog = {
      id: `${Date.now()}_${Math.random()}`,
      playerId,
      playerName,
      type,
      action,
      value,
      timestamp: new Date()
    };
    setActivityLog(prev => [newActivity, ...prev]);
  };

  const selectedProgram = useMemo(
    () => programs.find((p) => p.id === selectedProgramId) || null,
    [programs, selectedProgramId]
  );

  const selectedAgeGroup = useMemo(
    () => selectedProgram?.age_groups?.find((g) => g.id === selectedAgeGroupId) || null,
    [selectedProgram, selectedAgeGroupId]
  );

  // Filter players by search
  const filteredPlayers = useMemo(() => {
    if (!searchQuery.trim()) return players;
    const q = searchQuery.toLowerCase();
    return players.filter(
      (p) =>
        p.first_name.toLowerCase().includes(q) ||
        p.last_name.toLowerCase().includes(q) ||
        `${p.first_name} ${p.last_name}`.toLowerCase().includes(q)
    );
  }, [players, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    const absent = players.filter((p) => !p.present).length;
    const present = players.filter((p) => p.present).length;
    return { absent, present, members: players.length };
  }, [players]);

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const response = await fetch('/api/coach/programs');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setPrograms(data.programs || []);
      if (data.programs?.length) {
        const first = data.programs[0];
        setSelectedProgramId(first.id);
        if (first.age_groups?.length) {
          setSelectedAgeGroupId(first.age_groups[0].id);
        }
      }
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحميل البرامج' : 'Failed to load programs'));
    } finally {
      setLoadingPrograms(false);
    }
  };

  const fetchPlayers = async (programId: string, ageGroupId: string, date: string) => {
    try {
      setLoadingPlayers(true);
      const params = new URLSearchParams({ program_id: programId, age_group_id: ageGroupId, date });
      const response = await fetch(`/api/coach/players?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setPlayers(data.players || []);
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحميل اللاعبين' : 'Failed to load players'));
    } finally {
      setLoadingPlayers(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  useEffect(() => {
    if (selectedProgramId && selectedAgeGroupId) {
      fetchPlayers(selectedProgramId, selectedAgeGroupId, selectedDate);
      // Clear activity log when changing session
      setActivityLog([]);
    }
  }, [selectedProgramId, selectedAgeGroupId, selectedDate]);

  // Fetch achievements when achievement popup opens
  useEffect(() => {
    if (achievementOpenId && achievements.length === 0) {
      fetchAchievements();
    }
  }, [achievementOpenId]);

  const fetchAchievements = async () => {
    try {
      setLoadingAchievements(true);
      const response = await fetch('/api/achievements');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setAchievements(data.achievements || []);
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحميل الإنجازات' : 'Failed to load achievements'));
    } finally {
      setLoadingAchievements(false);
    }
  };

  const handleAwardAchievement = async (playerId: string, achievementId: string) => {
    try {
      setAwardingAchievement(true);
      const response = await fetch('/api/player-achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: playerId, achievement_id: achievementId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      const player = players.find(p => p.id === playerId);
      const achievement = achievements.find(a => a.id === achievementId);
      if (player && achievement) {
        addActivity(
          playerId,
          `${player.first_name} ${player.last_name}`,
          'achievement',
          isAr ? 'حصل على إنجاز' : 'Received achievement',
          isAr ? achievement.title_ar || achievement.title : achievement.title
        );
      }
      
      setAchievementOpenId(null);
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر منح الإنجاز' : 'Failed to award achievement'));
    } finally {
      setAwardingAchievement(false);
    }
  };

  const handleScoreSubmit = (playerId: string) => {
    updateScore(playerId, scoreValue);
    setScoreOpenId(null);
    setScoreValue(5);
    // Silent - no toast notification
  };

  const togglePresent = (playerId: string) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          const newPresent = !p.present;
          addActivity(
            playerId,
            `${p.first_name} ${p.last_name}`,
            'attendance',
            newPresent ? (isAr ? 'تم تسجيل الحضور' : 'Marked as present') : (isAr ? 'تم تسجيل الغياب' : 'Marked as absent')
          );
          return { ...p, present: newPresent };
        }
        return p;
      })
    );
  };

  const updateScore = (playerId: string, score: number) => {
    setPlayers((prev) =>
      prev.map((p) => {
        if (p.id === playerId) {
          addActivity(
            playerId,
            `${p.first_name} ${p.last_name}`,
            'score',
            isAr ? `حصل على ${score} نقطة` : `Received ${score} points`,
            score
          );
          return { ...p, score: (p.score || 0) + score, points: (p.points || 0) + score };
        }
        return p;
      })
    );
  };

  const handleSaveAll = async () => {
    if (!selectedProgramId || !selectedAgeGroupId) return;
    try {
      setSaving(true);
      const promises = players.map((player) =>
        fetch('/api/coach/attendance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: player.id,
            program_id: selectedProgramId,
            age_group_id: selectedAgeGroupId,
            date: selectedDate,
            present: player.present ?? false,
            score: player.score ?? null,
            notes: player.notes ?? null,
          }),
        })
      );
      await Promise.all(promises);
      // Silent save - no toast notification
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر الحفظ' : 'Failed to save'));
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async (playerId: string) => {
    const content = messageDrafts[playerId]?.trim();
    if (!content) return;
    try {
      setSendingId(playerId);
      const response = await fetch('/api/coach/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiver_id: playerId,
          subject: isAr ? 'رسالة من المدرب' : 'Message from coach',
          content,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      const player = players.find(p => p.id === playerId);
      if (player) {
        addActivity(
          playerId,
          `${player.first_name} ${player.last_name}`,
          'message',
          isAr ? 'تم إرسال رسالة' : 'Message sent',
          content.substring(0, 50) + (content.length > 50 ? '...' : '')
        );
      }
      
      setMessageDrafts((prev) => ({ ...prev, [playerId]: '' }));
      setMessageOpenId(null);
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر إرسال الرسالة' : 'Failed to send'));
    } finally {
      setSendingId(null);
    }
  };

  const programLabel = selectedProgram
    ? `${isAr ? selectedProgram.name_ar || selectedProgram.name : selectedProgram.name}${selectedAgeGroup ? ` - ${isAr ? selectedAgeGroup.name_ar || selectedAgeGroup.name : selectedAgeGroup.name}` : ''}`
    : '';

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      {/* Session Header - Enhanced */}
      <div className="rounded-2xl border-2 border-orange-200 dark:border-orange-900/40 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-orange-600 dark:text-orange-400">{isAr ? 'جلسة التدريب' : 'Training Session'}</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {new Date(selectedDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { 
                  weekday: 'long',
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowActivityPanel(!showActivityPanel)}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all flex items-center gap-2 ${
              showActivityPanel
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-white dark:bg-zinc-800 text-orange-600 dark:text-orange-400 border border-orange-300 dark:border-orange-700 hover:bg-orange-100 dark:hover:bg-orange-900/30'
            }`}
          >
            <Trophy className="w-4 h-4" />
            {isAr ? 'السجل' : 'Log'}
            {activityLog.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-orange-600 text-white text-xs font-bold">
                {activityLog.length}
              </span>
            )}
          </button>
        </div>
        {programLabel && (
          <div className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300 bg-white/50 dark:bg-zinc-800/50 px-3 py-2 rounded-lg">
            <Award className="w-4 h-4 text-orange-500" />
            <span className="font-semibold">{programLabel}</span>
          </div>
        )}
      </div>

      {/* Activity Panel */}
      {showActivityPanel && activityLog.length > 0 && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 space-y-3 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-orange-500" />
              {isAr ? 'سجل أنشطة الجلسة' : 'Session Activity Log'}
            </h3>
            <button
              onClick={() => setActivityLog([])}
              className="text-xs text-zinc-500 hover:text-red-500 transition-colors"
            >
              {isAr ? 'مسح الكل' : 'Clear All'}
            </button>
          </div>
          <div className="space-y-2">
            {activityLog.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-700/50 hover:border-orange-300 dark:hover:border-orange-700 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  activity.type === 'attendance' ? 'bg-emerald-100 dark:bg-emerald-900/30' :
                  activity.type === 'score' ? 'bg-blue-100 dark:bg-blue-900/30' :
                  activity.type === 'message' ? 'bg-indigo-100 dark:bg-indigo-900/30' :
                  'bg-amber-100 dark:bg-amber-900/30'
                }`}>
                  {activity.type === 'attendance' && <Check className={`w-4 h-4 text-emerald-600 dark:text-emerald-400`} />}
                  {activity.type === 'score' && <Plus className={`w-4 h-4 text-blue-600 dark:text-blue-400`} />}
                  {activity.type === 'message' && <MessageSquare className={`w-4 h-4 text-indigo-600 dark:text-indigo-400`} />}
                  {activity.type === 'achievement' && <Trophy className={`w-4 h-4 text-amber-600 dark:text-amber-400`} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-white">
                    {activity.playerName}
                  </p>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                    {activity.action}
                    {activity.value && (
                      <span className="font-semibold text-orange-600 dark:text-orange-400">
                        {activity.type === 'score' ? ` (+${activity.value})` : `: ${activity.value}`}
                      </span>
                    )}
                  </p>
                </div>
                <span className="text-[10px] text-zinc-400 shrink-0">
                  {activity.timestamp.toLocaleTimeString(isAr ? 'ar-SA' : 'en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header - Original kept for compatibility */}
      <div className="hidden">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isAr ? 'الجلسة:' : 'Session:'} {new Date(selectedDate).toLocaleDateString(isAr ? 'ar-SA' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric' })}
            </p>
          </div>
          <div className="text-right">
            <h1 className="text-lg font-bold text-orange-500">{isAr ? 'البرامج' : 'Programs'}</h1>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400">{isAr ? 'الحضور وتتبع التقدم' : 'Attendance & progress tracking'}</p>
          </div>
        </div>
      </div>

      {/* Filters Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {isAr ? 'البرنامج · التاريخ · البحث' : 'Program · Date · Search'}
        </p>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className="text-xs font-medium text-orange-500 hover:text-orange-600"
        >
          {isAr ? 'الفلاتر' : 'Filters'}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Program Selector */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400">{isAr ? 'البرنامج' : 'Program'}</label>
              <select
                value={`${selectedProgramId}_${selectedAgeGroupId}`}
                onChange={(e) => {
                  const [pId, aId] = e.target.value.split('_');
                  setSelectedProgramId(pId);
                  setSelectedAgeGroupId(aId);
                }}
                className="w-full px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
              >
                {programs.map((program) =>
                  program.age_groups?.map((group) => (
                    <option key={`${program.id}_${group.id}`} value={`${program.id}_${group.id}`}>
                      {isAr ? program.name_ar || program.name : program.name} - {isAr ? group.name_ar || group.name : group.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400">{isAr ? 'تاريخ الحصة' : 'Session Date'}</label>
              <DateTimePicker
                value={selectedDate}
                onChange={(val) => setSelectedDate(val)}
                mode="date"
                locale={locale}
                placeholder={isAr ? 'اختر التاريخ' : 'Select date'}
              />
            </div>

            {/* Search */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wider text-zinc-400">{isAr ? 'البحث' : 'Search'}</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={isAr ? 'اسم اللاعب أو الرقم' : 'Player name or number'}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {isAr ? 'الأعضاء · الحاضرون · الغائبون' : 'Members · Present · Absent'}
        </p>
        <p className="text-xs font-medium text-orange-500">{isAr ? 'الملخص' : 'Summary'}</p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-2xl border-2 border-red-200 dark:border-red-900/40 bg-white dark:bg-zinc-900 p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-zinc-400">{isAr ? 'غائب' : 'Absent'}</p>
          <p className="text-2xl font-bold text-red-500">{stats.absent}</p>
        </div>
        <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/40 bg-white dark:bg-zinc-900 p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-zinc-400">{isAr ? 'حاضر' : 'Present'}</p>
          <p className="text-2xl font-bold text-emerald-500">{stats.present}</p>
        </div>
        <div className="rounded-2xl border-2 border-blue-200 dark:border-blue-900/40 bg-white dark:bg-zinc-900 p-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-zinc-400">{isAr ? 'أعضاء' : 'Members'}</p>
          <p className="text-2xl font-bold text-blue-500">{stats.members}</p>
        </div>
      </div>

      {/* Program Label */}
      {programLabel && (
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">{programLabel}</p>
          <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{isAr ? 'الأعضاء' : 'MEMBERS'}</p>
        </div>
      )}

      {/* Players Grid */}
      {loadingPrograms || loadingPlayers ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="text-center py-16 text-zinc-500 dark:text-zinc-400">
          {isAr ? 'لا يوجد لاعبون' : 'No players found'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredPlayers.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              index={index + 1}
              isAr={isAr}
              onTogglePresent={() => togglePresent(player.id)}
              messageOpen={messageOpenId === player.id}
              onMessageToggle={() => setMessageOpenId(messageOpenId === player.id ? null : player.id)}
              messageDraft={messageDrafts[player.id] || ''}
              onMessageChange={(v) => setMessageDrafts((prev) => ({ ...prev, [player.id]: v }))}
              onSendMessage={() => handleSendMessage(player.id)}
              sendingMessage={sendingId === player.id}
              // Score popup
              scoreOpen={scoreOpenId === player.id}
              onScoreToggle={() => {
                if (scoreOpenId === player.id) {
                  setScoreOpenId(null);
                } else {
                  setScoreOpenId(player.id);
                  setScoreValue(5);
                }
              }}
              scoreValue={scoreValue}
              onScoreValueChange={setScoreValue}
              onScoreSubmit={() => handleScoreSubmit(player.id)}
              // Achievement popup
              achievementOpen={achievementOpenId === player.id}
              onAchievementToggle={() => setAchievementOpenId(achievementOpenId === player.id ? null : player.id)}
              achievements={achievements}
              loadingAchievements={loadingAchievements}
              awardingAchievement={awardingAchievement}
              onAwardAchievement={(achievementId) => handleAwardAchievement(player.id, achievementId)}
              // Activity log for this player
              playerActivities={activityLog.filter(a => a.playerId === player.id)}
            />
          ))}
        </div>
      )}

      {/* Save Button */}
      {players.length > 0 && (
        <div className="pt-4">
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="w-full max-w-xs mx-auto py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md disabled:opacity-50 transition"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isAr ? 'حفظ' : 'Save'}
          </button>
        </div>
      )}
    </div>
  );
}

// Player Card Component
interface PlayerCardProps {
  player: Player;
  index: number;
  isAr: boolean;
  onTogglePresent: () => void;
  messageOpen: boolean;
  onMessageToggle: () => void;
  messageDraft: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  sendingMessage: boolean;
  // Score popup
  scoreOpen: boolean;
  onScoreToggle: () => void;
  scoreValue: number;
  onScoreValueChange: (value: number) => void;
  onScoreSubmit: () => void;
  // Achievement popup
  achievementOpen: boolean;
  onAchievementToggle: () => void;
  achievements: Achievement[];
  loadingAchievements: boolean;
  awardingAchievement: boolean;
  onAwardAchievement: (achievementId: string) => void;
  // Activity log
  playerActivities: ActivityLog[];
}

function PlayerCard({
  player,
  index,
  isAr,
  onTogglePresent,
  messageOpen,
  onMessageToggle,
  messageDraft,
  onMessageChange,
  onSendMessage,
  sendingMessage,
  scoreOpen,
  onScoreToggle,
  scoreValue,
  onScoreValueChange,
  onScoreSubmit,
  achievementOpen,
  onAchievementToggle,
  achievements,
  loadingAchievements,
  awardingAchievement,
  onAwardAchievement,
  playerActivities,
}: PlayerCardProps) {
  const fullName = `${player.first_name} ${player.last_name}`;
  const sessionScore = playerActivities.filter(a => a.type === 'score').reduce((sum, a) => sum + (Number(a.value) || 0), 0);
  const sessionAchievements = playerActivities.filter(a => a.type === 'achievement').length;
  const sessionMessages = playerActivities.filter(a => a.type === 'message').length;

  return (
    <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Session Summary Badge */}
      {playerActivities.length > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            {isAr ? 'أنشطة الجلسة:' : 'Session:'}
          </span>
          {sessionScore > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold">
              <Plus className="w-3 h-3" />
              {sessionScore} {isAr ? 'نقطة' : 'pts'}
            </span>
          )}
          {sessionAchievements > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-semibold">
              <Trophy className="w-3 h-3" />
              {sessionAchievements} {isAr ? 'إنجاز' : 'achievement'}
            </span>
          )}
          {sessionMessages > 0 && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-xs font-semibold">
              <MessageSquare className="w-3 h-3" />
              {sessionMessages} {isAr ? 'رسالة' : 'msg'}
            </span>
          )}
        </div>
      )}
      
      {/* Main Content Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Left Side - Player Info & Actions */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Player Name & Stats */}
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {fullName} <span className="text-zinc-400 dark:text-zinc-500 font-medium"># {index}</span>
            </h3>
            <div className="flex items-center gap-5 mt-2">
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {isAr ? 'المستوى' : 'Level'} : <span className="font-semibold text-zinc-700 dark:text-zinc-300">{player.level || 1}</span>
              </span>
              <span className="text-sm text-zinc-500 dark:text-zinc-400">
                {isAr ? 'النقاط' : 'Point'}: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{player.points || 0}</span>
              </span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3">
            {/* Star - Achievement Button */}
            <button
              type="button"
              onClick={onAchievementToggle}
              className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                achievementOpen
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-300 dark:border-indigo-600'
                  : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
              }`}
            >
              <Star className="h-6 w-6" />
            </button>
            
            {/* Plus - Score Button */}
            <button
              type="button"
              onClick={onScoreToggle}
              className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                scoreOpen
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-300 dark:border-indigo-600'
                  : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
              }`}
            >
              <Plus className="h-6 w-6" />
            </button>
            
            {/* Message Button */}
            <button
              type="button"
              onClick={onMessageToggle}
              className={`h-11 w-11 rounded-xl flex items-center justify-center transition-all ${
                messageOpen
                  ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 border-2 border-indigo-300 dark:border-indigo-600'
                  : 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/40'
              }`}
            >
              <MessageSquare className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Right Side - Avatar & Absent Button */}
        <div className="flex flex-col items-center gap-2">
          {/* Avatar */}
          <div className="w-[100px] aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-orange-400 to-red-500 shadow-lg flex-shrink-0">
            {player.avatar_url ? (
              <img src={player.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-xl font-bold text-white">
                {player.first_name?.charAt(0)}{player.last_name?.charAt(0)}
              </div>
            )}
          </div>

          {/* Absent/Present Button */}
          <button
            type="button"
            onClick={onTogglePresent}
            className={`w-[100px] py-2.5 rounded-xl text-sm font-bold transition-all ${
              player.present
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
            }`}
          >
            {player.present ? (isAr ? 'حاضر' : 'Present') : (isAr ? 'غائب' : 'Absent')}
          </button>
        </div>
      </div>

      {/* Score Panel */}
      {scoreOpen && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {isAr ? 'إضافة نقاط' : 'Add Points'}
            </p>
            <span className="text-2xl font-bold text-emerald-500">{scoreValue}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={scoreValue}
            onChange={(e) => onScoreValueChange(parseInt(e.target.value))}
            className="w-full h-2.5 bg-zinc-200 dark:bg-zinc-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-emerald-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-emerald-500 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-md"
            style={{
              background: `linear-gradient(to right, #10b981 0%, #10b981 ${(scoreValue / 10) * 100}%, rgb(228 228 231) ${(scoreValue / 10) * 100}%, rgb(228 228 231) 100%)`
            }}
          />
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>0</span>
            <span>10</span>
          </div>
          <button
            type="button"
            onClick={onScoreSubmit}
            className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold flex items-center justify-center gap-2 transition shadow-md"
          >
            <Check className="h-4 w-4" />
            {isAr ? 'تأكيد' : 'Confirm'}
          </button>
        </div>
      )}

      {/* Achievement Panel */}
      {achievementOpen && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
          <p className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
            {isAr ? 'اختر إنجاز للمنح' : 'Select Achievement to Award'}
          </p>
          {loadingAchievements ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : achievements.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6">
              {isAr ? 'لا توجد إنجازات متاحة' : 'No achievements available'}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 max-h-52 overflow-y-auto p-1">
              {achievements.map((achievement) => (
                <button
                  key={achievement.id}
                  type="button"
                  onClick={() => onAwardAchievement(achievement.id)}
                  disabled={awardingAchievement}
                  className="flex flex-col items-center gap-2 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-700 hover:border-yellow-400 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-all disabled:opacity-50"
                >
                  {achievement.icon_url ? (
                    <img src={achievement.icon_url} alt="" className="h-12 w-12 object-contain" />
                  ) : (
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-md">
                      <Trophy className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <span className="text-[11px] text-zinc-600 dark:text-zinc-300 text-center line-clamp-2 leading-tight font-medium">
                    {isAr ? achievement.title_ar || achievement.title : achievement.title}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Message Panel */}
      {messageOpen && (
        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
          <div className="flex gap-2 items-stretch">
            <input
              type="text"
              value={messageDraft}
              onChange={(e) => onMessageChange(e.target.value)}
              placeholder={isAr ? 'اكتب رسالة...' : 'Type a message...'}
              className="flex-1 min-w-0 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
            <button
              type="button"
              onClick={onSendMessage}
              disabled={sendingMessage || !messageDraft.trim()}
              className="shrink-0 px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-semibold disabled:opacity-50 transition shadow-md"
            >
              {sendingMessage ? <Loader2 className="h-4 w-4 animate-spin" /> : isAr ? 'إرسال' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
