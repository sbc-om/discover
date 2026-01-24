'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, Loader2, MessageSquare, Send, Users, Award } from 'lucide-react';
import useLocale from '@/hooks/useLocale';
import { useToast } from '@/components/ToastProvider';

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
}

interface AchievementOption {
  id: string;
  title: string;
  title_ar?: string | null;
  icon_url?: string | null;
}

export default function CoachProgramsContent() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';
  const { showToast } = useToast();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgramId, setSelectedProgramId] = useState<string>('');
  const [selectedAgeGroupId, setSelectedAgeGroupId] = useState<string>('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [loadingPrograms, setLoadingPrograms] = useState(true);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [messageDrafts, setMessageDrafts] = useState<Record<string, string>>({});
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [messageOpenId, setMessageOpenId] = useState<string | null>(null);
  const [achievements, setAchievements] = useState<AchievementOption[]>([]);
  const [awardSelections, setAwardSelections] = useState<Record<string, string>>({});
  const [awardNotes, setAwardNotes] = useState<Record<string, string>>({});
  const [awardingId, setAwardingId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));
  const saveTimeoutsRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const selectedProgram = useMemo(
    () => programs.find((program) => program.id === selectedProgramId) || null,
    [programs, selectedProgramId]
  );

  const selectedAgeGroup = useMemo(
    () => selectedProgram?.age_groups?.find((group) => group.id === selectedAgeGroupId) || null,
    [selectedProgram, selectedAgeGroupId]
  );

  const fetchPrograms = async () => {
    try {
      setLoadingPrograms(true);
      const response = await fetch('/api/coach/programs');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load programs');
      }
      setPrograms(data.programs || []);
      if (data.programs?.length) {
        setSelectedProgramId(data.programs[0].id);
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
      const params = new URLSearchParams({
        program_id: programId,
        age_group_id: ageGroupId,
        date,
      });
      const response = await fetch(`/api/coach/players?${params.toString()}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load players');
      }
      setPlayers(data.players || []);
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر تحميل اللاعبين' : 'Failed to load players'));
    } finally {
      setLoadingPlayers(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
    fetchAchievements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedProgramId && selectedAgeGroupId) {
      fetchPlayers(selectedProgramId, selectedAgeGroupId, selectedDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProgramId, selectedAgeGroupId, selectedDate]);

  const handleSave = async (player: Player) => {
    if (!selectedProgramId || !selectedAgeGroupId) return;
    try {
      setSavingId(player.id);
      const response = await fetch('/api/coach/attendance', {
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
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save');
      }
      showToast('success', isAr ? 'تم الحفظ' : 'Saved');
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر الحفظ' : 'Failed to save'));
    } finally {
      setSavingId(null);
    }
  };

  const scheduleAutoSave = (player: Player) => {
    if (saveTimeoutsRef.current[player.id]) {
      clearTimeout(saveTimeoutsRef.current[player.id]);
    }

    saveTimeoutsRef.current[player.id] = setTimeout(() => {
      handleSave(player);
    }, 600);
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
      if (!response.ok) {
        throw new Error(data.message || 'Failed to send');
      }
      setMessageDrafts((prev) => ({ ...prev, [playerId]: '' }));
      showToast('success', isAr ? 'تم إرسال الرسالة' : 'Message sent');
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر إرسال الرسالة' : 'Failed to send message'));
    } finally {
      setSendingId(null);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await fetch('/api/achievements');
      const data = await response.json();
      if (response.ok) {
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error('Error loading achievements', error);
    }
  };

  const handleAwardAchievement = async (playerId: string) => {
    const achievementId = awardSelections[playerId];
    if (!achievementId) return;
    try {
      setAwardingId(playerId);
      const response = await fetch('/api/player-achievements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: playerId,
          achievement_id: achievementId,
          note: awardNotes[playerId]?.trim() || null,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to award');
      }
      setAwardSelections((prev) => ({ ...prev, [playerId]: '' }));
      setAwardNotes((prev) => ({ ...prev, [playerId]: '' }));
      showToast('success', isAr ? 'تم منح الإنجاز' : 'Achievement awarded');
    } catch (error: any) {
      showToast('error', error.message || (isAr ? 'تعذر منح الإنجاز' : 'Failed to award achievement'));
    } finally {
      setAwardingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {isAr ? 'البرامج واللاعبون' : 'Programs & Players'}
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {isAr ? 'إدارة الحضور والدرجات اليومية للاعبين' : 'Track attendance and daily scores for players'}
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <CalendarDays className="h-4 w-4" />
            {isAr ? 'التاريخ' : 'Date'}
          </div>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full md:w-auto px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
          />
        </div>

        {loadingPrograms ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
          </div>
        ) : programs.length === 0 ? (
          <div className="text-sm text-zinc-500 dark:text-zinc-400">
            {isAr ? 'لا توجد برامج' : 'No programs found'}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="-mx-4 px-4">
              <div className="flex gap-4 overflow-x-auto pb-2">
                {programs.map((program) => {
                  const isActive = selectedProgramId === program.id;
                  return (
                    <button
                      key={program.id}
                      type="button"
                      onClick={() => {
                        setSelectedProgramId(program.id);
                        const firstGroup = program.age_groups?.[0];
                        setSelectedAgeGroupId(firstGroup?.id || '');
                      }}
                      className="flex flex-col items-center gap-2 min-w-[96px]"
                    >
                      <div
                        className={`h-16 w-16 rounded-full border-2 overflow-hidden flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 ${
                          isActive
                            ? 'border-orange-500 ring-2 ring-orange-200 dark:ring-orange-900/40'
                            : 'border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {program.image_url ? (
                          <img src={program.image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-[10px] font-semibold text-zinc-400">
                            {isAr ? 'برنامج' : 'Program'}
                          </span>
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold text-center ${
                          isActive ? 'text-orange-600 dark:text-orange-300' : 'text-zinc-600 dark:text-zinc-300'
                        }`}
                      >
                        {isAr ? program.name_ar || program.name : program.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedProgram && (
              <div className="flex flex-wrap gap-2">
                {selectedProgram.age_groups?.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => setSelectedAgeGroupId(group.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                      selectedAgeGroupId === group.id
                        ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200'
                        : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300'
                    }`}
                  >
                    {isAr ? group.name_ar || group.name : group.name} ({group.min_age}-{group.max_age})
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {selectedAgeGroup && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
              <Users className="h-4 w-4" />
              {isAr ? 'قائمة اللاعبين' : 'Players'}
            </div>
            <span className="text-xs text-zinc-400">
              {selectedAgeGroup ? `${selectedAgeGroup.min_age}-${selectedAgeGroup.max_age}` : ''}
            </span>
          </div>

          {loadingPlayers ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          ) : players.length === 0 ? (
            <div className="text-sm text-zinc-500 dark:text-zinc-400 px-4 py-8">
              {isAr ? 'لا يوجد لاعبون' : 'No players found'}
            </div>
          ) : (
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {players.map((player) => (
                <div key={player.id} className="p-4 space-y-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                        {player.avatar_url ? (
                          <img src={player.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                            {player.first_name?.charAt(0)}{player.last_name?.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                          {player.first_name} {player.last_name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {player.position || (isAr ? 'لا يوجد مركز' : 'No position')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() =>
                          setPlayers((prev) => {
                            const next = prev.map((item) =>
                              item.id === player.id ? { ...item, present: !item.present } : item
                            );
                            const updated = next.find((item) => item.id === player.id) || player;
                            scheduleAutoSave(updated);
                            return next;
                          })
                        }
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                          player.present
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200'
                            : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 dark:text-zinc-300'
                        }`}
                      >
                        {player.present ? (isAr ? 'حاضر' : 'Present') : (isAr ? 'غائب' : 'Absent')}
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">0</span>
                        <input
                          type="range"
                          min={0}
                          max={10}
                          value={player.score ?? 0}
                          onChange={(e) =>
                            setPlayers((prev) => {
                              const next = prev.map((item) =>
                                item.id === player.id ? { ...item, score: Number(e.target.value) } : item
                              );
                              const updated = next.find((item) => item.id === player.id) || player;
                              scheduleAutoSave(updated);
                              return next;
                            })
                          }
                          className="w-28 accent-orange-500"
                        />
                        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200 min-w-[2rem] text-center">
                          {player.score ?? 0}
                        </span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400">10</span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setMessageOpenId((prev) => (prev === player.id ? null : player.id))
                        }
                        className="h-9 w-9 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:text-blue-500 hover:border-blue-300 dark:hover:border-blue-700 flex items-center justify-center"
                        aria-label={isAr ? 'إرسال رسالة' : 'Send message'}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </button>

                      {savingId === player.id && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {isAr ? 'يتم الحفظ' : 'Saving'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="w-full">
                    <textarea
                      value={player.notes || ''}
                      onChange={(e) =>
                        setPlayers((prev) => {
                          const next = prev.map((item) =>
                            item.id === player.id ? { ...item, notes: e.target.value } : item
                          );
                          const updated = next.find((item) => item.id === player.id) || player;
                          scheduleAutoSave(updated);
                          return next;
                        })
                      }
                      rows={2}
                      placeholder={isAr ? 'ملاحظات المدرب' : 'Coach notes'}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm"
                    />
                  </div>

                  {messageOpenId === player.id && (
                    <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-950/20 p-3 space-y-3">
                      <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-300">
                        <MessageSquare className="h-3 w-3" />
                        {isAr ? 'رسالة للاعب' : 'Message to player'}
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={messageDrafts[player.id] || ''}
                          onChange={(e) =>
                            setMessageDrafts((prev) => ({ ...prev, [player.id]: e.target.value }))
                          }
                          placeholder={isAr ? 'اكتب الرسالة هنا' : 'Type your message'}
                          className="flex-1 px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-white dark:bg-zinc-900 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendMessage(player.id)}
                          disabled={sendingId === player.id || !(messageDrafts[player.id]?.trim())}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-500 text-white text-xs font-semibold disabled:opacity-50"
                        >
                          {sendingId === player.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Send className="h-3 w-3" />
                          )}
                          {isAr ? 'إرسال' : 'Send'}
                        </button>
                      </div>

                      <div className="pt-2 border-t border-blue-200/60 dark:border-blue-900/40 space-y-2">
                        <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-300">
                          <Award className="h-3 w-3" />
                          {isAr ? 'منح إنجاز' : 'Award achievement'}
                        </div>
                        <div className="grid gap-2 md:grid-cols-2">
                          <select
                            value={awardSelections[player.id] || ''}
                            onChange={(e) =>
                              setAwardSelections((prev) => ({ ...prev, [player.id]: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-white dark:bg-zinc-900 text-sm"
                          >
                            <option value="">{isAr ? 'اختر الإنجاز' : 'Select achievement'}</option>
                            {achievements.map((achievement) => (
                              <option key={achievement.id} value={achievement.id}>
                                {isAr ? achievement.title_ar || achievement.title : achievement.title}
                              </option>
                            ))}
                          </select>
                          <input
                            type="text"
                            value={awardNotes[player.id] || ''}
                            onChange={(e) =>
                              setAwardNotes((prev) => ({ ...prev, [player.id]: e.target.value }))
                            }
                            placeholder={isAr ? 'ملاحظة (اختياري)' : 'Note (optional)'}
                            className="w-full px-3 py-2 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-white dark:bg-zinc-900 text-sm"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAwardAchievement(player.id)}
                          disabled={awardingId === player.id || !awardSelections[player.id]}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
                        >
                          {awardingId === player.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Award className="h-3 w-3" />
                          )}
                          {isAr ? 'منح الإنجاز' : 'Award'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
