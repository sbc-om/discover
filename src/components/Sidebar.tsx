'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  LayoutDashboard,
  Users,
  Shield,
  Building2,
  Activity,
  Award,
  Layers,
  Mail,
  MessageCircle,
  Settings,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  locale: string;
}

const menuItems = [
  { key: 'dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { key: 'users', icon: Users, path: '/dashboard/users' },
  { key: 'roles', icon: Shield, path: '/dashboard/roles' },
  { key: 'academies', icon: Building2, path: '/dashboard/academies' },
  { key: 'healthTests', icon: Activity, path: '/dashboard/health-tests' },
  { key: 'medalRequests', icon: Award, path: '/dashboard/medal-requests' },
  { key: 'programs', icon: Layers, path: '/dashboard/programs' },
  { key: 'messages', icon: Mail, path: '/dashboard/messages' },
  { key: 'whatsapp', icon: MessageCircle, path: '/dashboard/whatsapp' },
  { key: 'settings', icon: Settings, path: '/dashboard/settings' },
];

export default function Sidebar({ locale }: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations('menu');
  const tCommon = useTranslations('common');
  const isRTL = locale === 'ar';

  return (
    <aside
      className={`w-64 min-h-screen bg-[#0A0E27] text-white border-r border-gray-800 ${
        isRTL ? 'border-l border-r-0' : ''
      }`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
            <span className="text-lg font-bold">DNA</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">{tCommon('dna')}</h1>
            <p className="text-xs text-gray-400">{tCommon('fullName')}</p>
          </div>
        </div>
        <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
      </div>

      {/* Menu Items */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === `/${locale}${item.path}`;
            
            return (
              <li key={item.key}>
                <Link
                  href={`/${locale}${item.path}`}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                    ${
                      isActive
                        ? 'bg-black text-white'
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="flex-1">{t(item.key)}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
