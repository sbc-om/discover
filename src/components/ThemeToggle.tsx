'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { Moon, Sun } from 'lucide-react';
import useTheme from '@/hooks/useTheme';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = resolvedTheme === 'dark';

  const toggleTheme = useCallback(() => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    const newTheme = theme === 'system' ? (isDark ? 'light' : 'dark') : (theme === 'dark' ? 'light' : 'dark');
    const willBeDark = newTheme === 'dark';
    
    // Get button position for animation origin
    const rect = buttonRef.current?.getBoundingClientRect();
    const x = rect ? rect.left + rect.width / 2 : window.innerWidth - 50;
    const y = rect ? rect.top + rect.height / 2 : 50;
    
    // Calculate the radius needed to cover the entire screen
    const maxRadius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y)
    ) * 1.1;
    
    // Create circular reveal overlay - very transparent so content is fully visible
    const overlay = document.createElement('div');
    overlay.id = 'theme-transition-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 9998;
      pointer-events: none;
      background: ${willBeDark ? 'rgba(11, 11, 15, 0.4)' : 'rgba(255, 255, 255, 0.4)'};
      clip-path: circle(0px at ${x}px ${y}px);
      transition: clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1);
      backdrop-filter: blur(1px);
    `;
    
    document.body.appendChild(overlay);
    
    // Trigger the circular reveal animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlay.style.clipPath = `circle(${maxRadius}px at ${x}px ${y}px)`;
      });
    });
    
    // Apply theme change when circle is about halfway
    setTimeout(() => {
      setTheme(newTheme);
    }, 350);
    
    // Fade out overlay after theme change
    setTimeout(() => {
      overlay.style.transition = 'clip-path 0.7s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out';
      overlay.style.opacity = '0';
      
      setTimeout(() => {
        overlay.remove();
        setIsAnimating(false);
      }, 400);
    }, 700);
  }, [isAnimating, isDark, theme, setTheme]);

  if (!mounted) {
    return (
      <button
        type="button"
        className="h-10 w-10 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 animate-pulse"
        aria-label="Toggle theme"
        disabled
      />
    );
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={toggleTheme}
      disabled={isAnimating}
      className="group relative inline-flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-white text-zinc-800 transition-all duration-300 hover:bg-zinc-50 hover:border-zinc-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800 dark:hover:border-zinc-700 dark:focus-visible:ring-zinc-600 disabled:cursor-not-allowed overflow-hidden"
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {/* Icon container with smooth morph animation */}
      <span className={`relative transition-all duration-500 ease-out ${isAnimating ? 'scale-0 rotate-180' : 'scale-100 rotate-0 group-hover:scale-110'}`}>
        {isDark ? (
          <Sun className="h-5 w-5 text-amber-500 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
        ) : (
          <Moon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
        )}
      </span>
      
      {/* Glow effect */}
      <span className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${isDark ? 'bg-amber-500/10 opacity-0 group-hover:opacity-100' : 'bg-indigo-500/10 opacity-0 group-hover:opacity-100'}`} />
    </button>
  );
}
