'use client';

import { useState, useRef, useEffect, useCallback, ReactElement } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar, Clock, X } from 'lucide-react';

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  mode?: 'date' | 'datetime';
  locale?: string;
  placeholder?: string;
  className?: string;
  minDate?: string;
  maxDate?: string;
  disabled?: boolean;
}

const MONTHS_EN = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
const DAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const DAYS_AR = ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب'];

export default function DateTimePicker({
  value,
  onChange,
  mode = 'date',
  locale = 'en',
  placeholder,
  className = '',
  minDate,
  maxDate,
  disabled = false,
}: DateTimePickerProps) {
  const isAr = locale === 'ar';
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [view, setView] = useState<'calendar' | 'time' | 'month'>('calendar');
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const parseValue = useCallback(() => {
    if (!value) {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate(), hour: 12, minute: 0 };
    }
    const date = new Date(value);
    return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate(), hour: date.getHours(), minute: date.getMinutes() };
  }, [value]);

  const [viewDate, setViewDate] = useState(() => {
    const parsed = parseValue();
    return { year: parsed.year, month: parsed.month };
  });

  const [selectedTime, setSelectedTime] = useState(() => {
    const parsed = parseValue();
    return { hour: parsed.hour, minute: parsed.minute };
  });

  useEffect(() => {
    if (isOpen && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const dropdownHeight = 320;
      const spaceBelow = window.innerHeight - rect.bottom;
      const openAbove = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

      setDropdownStyle({
        position: 'fixed',
        left: rect.left,
        width: Math.max(rect.width, 280),
        ...(openAbove ? { bottom: window.innerHeight - rect.top + 4 } : { top: rect.bottom + 4 }),
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current && !containerRef.current.contains(e.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => setIsOpen(false);
    document.addEventListener('mousedown', handleClick);
    window.addEventListener('scroll', handleScroll, true);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  useEffect(() => {
    if (value) {
      const parsed = parseValue();
      setViewDate({ year: parsed.year, month: parsed.month });
      setSelectedTime({ hour: parsed.hour, minute: parsed.minute });
    }
  }, [value, parseValue]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const isDateDisabled = (year: number, month: number, day: number) => {
    const date = new Date(year, month, day);
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };

  const handleSelectDate = (day: number) => {
    const { year, month } = viewDate;
    const h = selectedTime.hour.toString().padStart(2, '0');
    const m = selectedTime.minute.toString().padStart(2, '0');
    const dateStr = mode === 'datetime'
      ? `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${h}:${m}`
      : `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    onChange(dateStr);
    if (mode === 'date') setIsOpen(false);
    else setView('time');
  };

  const handleTimeChange = (hour: number, minute: number) => {
    setSelectedTime({ hour, minute });
    if (value) {
      const parsed = parseValue();
      const h = hour.toString().padStart(2, '0');
      const m = minute.toString().padStart(2, '0');
      onChange(`${parsed.year}-${(parsed.month + 1).toString().padStart(2, '0')}-${parsed.day.toString().padStart(2, '0')}T${h}:${m}`);
    }
  };

  const formatDisplay = () => {
    if (!value) return placeholder || (isAr ? 'اختر التاريخ' : 'Select date');
    const parsed = parseValue();
    const months = isAr ? MONTHS_AR : MONTHS_EN;
    let display = `${parsed.day} ${months[parsed.month]} ${parsed.year}`;
    if (mode === 'datetime') {
      display += ` · ${parsed.hour.toString().padStart(2, '0')}:${parsed.minute.toString().padStart(2, '0')}`;
    }
    return display;
  };

  const prevMonth = () => setViewDate(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { ...p, month: p.month - 1 });
  const nextMonth = () => setViewDate(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { ...p, month: p.month + 1 });

  const renderCalendar = () => {
    const { year, month } = viewDate;
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const days = isAr ? DAYS_AR : DAYS_EN;
    const months = isAr ? MONTHS_AR : MONTHS_EN;
    const parsed = parseValue();
    const today = new Date();

    const cells: ReactElement[] = [];
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`e-${i}`} className="h-8" />);

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = value && parsed.year === year && parsed.month === month && parsed.day === day;
      const isToday = today.getFullYear() === year && today.getMonth() === month && today.getDate() === day;
      const isDisabled = isDateDisabled(year, month, day);

      cells.push(
        <button
          key={day}
          type="button"
          disabled={isDisabled}
          onClick={() => handleSelectDate(day)}
          className={`h-8 w-8 rounded-lg text-xs font-medium transition ${
            isSelected
              ? 'bg-orange-500 text-white'
              : isToday
              ? 'bg-orange-50 dark:bg-orange-950 text-orange-600 dark:text-orange-400'
              : isDisabled
              ? 'text-zinc-300 dark:text-zinc-600'
              : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <button type="button" onClick={prevMonth} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => setView('month')} className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 hover:text-orange-500">
            {months[month]} {year}
          </button>
          <button type="button" onClick={nextMonth} className="h-7 w-7 rounded-lg flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {days.map(d => <div key={d} className="h-7 flex items-center justify-center text-[10px] font-medium text-zinc-400">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-0.5">{cells}</div>
        <div className="mt-2 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              const t = new Date();
              setViewDate({ year: t.getFullYear(), month: t.getMonth() });
              handleSelectDate(t.getDate());
            }}
            className="text-xs font-medium text-orange-500 hover:text-orange-600"
          >
            {isAr ? 'اليوم' : 'Today'}
          </button>
          {value && (
            <button type="button" onClick={() => { onChange(''); setIsOpen(false); }} className="text-xs font-medium text-zinc-400 hover:text-red-500">
              {isAr ? 'مسح' : 'Clear'}
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderMonthSelector = () => {
    const months = isAr ? MONTHS_AR : MONTHS_EN;

    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={() => setView('calendar')} className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" />{isAr ? 'رجوع' : 'Back'}
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setViewDate(p => ({ ...p, year: p.year - 1 }))} className="h-6 w-6 rounded flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
              <ChevronLeft className="h-3 w-3" />
            </button>
            <span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 w-12 text-center">{viewDate.year}</span>
            <button type="button" onClick={() => setViewDate(p => ({ ...p, year: p.year + 1 }))} className="h-6 w-6 rounded flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {months.map((month, i) => (
            <button
              key={month}
              type="button"
              onClick={() => { setViewDate(p => ({ ...p, month: i })); setView('calendar'); }}
              className={`py-2 rounded-lg text-xs font-medium transition ${
                viewDate.month === i ? 'bg-orange-500 text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {month}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const renderTimePicker = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

    return (
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <button type="button" onClick={() => setView('calendar')} className="text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 flex items-center gap-1">
            <ChevronLeft className="h-3 w-3" />{isAr ? 'رجوع' : 'Back'}
          </button>
          <span className="text-lg font-bold text-zinc-800 dark:text-zinc-200 font-mono">
            {selectedTime.hour.toString().padStart(2, '0')}:{selectedTime.minute.toString().padStart(2, '0')}
          </span>
          <div className="w-12" />
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-medium text-zinc-400 mb-1">{isAr ? 'الساعة' : 'Hour'}</div>
          <div className="grid grid-cols-6 gap-1 max-h-24 overflow-y-auto">
            {hours.map(h => (
              <button
                key={h}
                type="button"
                onClick={() => handleTimeChange(h, selectedTime.minute)}
                className={`h-7 rounded text-xs font-medium transition ${
                  selectedTime.hour === h ? 'bg-orange-500 text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {h.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
        <div className="mb-3">
          <div className="text-[10px] font-medium text-zinc-400 mb-1">{isAr ? 'الدقيقة' : 'Minute'}</div>
          <div className="grid grid-cols-6 gap-1">
            {minutes.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => handleTimeChange(selectedTime.hour, m)}
                className={`h-7 rounded text-xs font-medium transition ${
                  selectedTime.minute === m ? 'bg-orange-500 text-white' : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {m.toString().padStart(2, '0')}
              </button>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={() => { setIsOpen(false); setView('calendar'); }}
          className="w-full py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold transition"
        >
          {isAr ? 'تأكيد' : 'Done'}
        </button>
      </div>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition ${
            disabled
              ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 cursor-not-allowed opacity-60'
              : isOpen
              ? 'border-orange-500 bg-white dark:bg-zinc-900'
              : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 hover:border-zinc-300 dark:hover:border-zinc-600'
          }`}
        >
          {mode === 'datetime' ? (
            <Clock className={`h-4 w-4 ${isOpen ? 'text-orange-500' : 'text-zinc-400'}`} />
          ) : (
            <Calendar className={`h-4 w-4 ${isOpen ? 'text-orange-500' : 'text-zinc-400'}`} />
          )}
          <span className={`flex-1 text-start ${value ? 'text-zinc-800 dark:text-zinc-200' : 'text-zinc-400'}`}>
            {formatDisplay()}
          </span>
        </button>
        {value && !disabled && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-red-500 p-1 z-10"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {mounted && isOpen && createPortal(
        <div
          ref={dropdownRef}
          style={dropdownStyle}
          className="z-[9999] rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
        >
          {view === 'calendar' && renderCalendar()}
          {view === 'month' && renderMonthSelector()}
          {view === 'time' && renderTimePicker()}
        </div>,
        document.body
      )}
    </div>
  );
}
