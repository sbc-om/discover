import { useContext } from 'react';
import { LocaleContext } from '@/providers/LocaleProvider';

export default function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error('useLocale must be used within LocaleProvider');
  }
  return ctx;
}
