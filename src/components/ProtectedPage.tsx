import { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/session';
import { hasModuleAccess } from '@/lib/permissions';
import DashboardLayout from '@/components/DashboardLayout';
import { getAccessibleMenuItems } from '@/lib/permissions';

interface ProtectedPageProps {
  children: ReactNode;
  locale: string;
  moduleName?: string;
}

/**
 * Wrapper component for protected pages that require authentication
 * and optional module-level access control
 */
export default async function ProtectedPage({
  children,
  locale,
  moduleName,
}: ProtectedPageProps) {
  try {
    // Require authentication
    const session = await requireAuth();

    // Check module access if specified
    if (moduleName) {
      if (moduleName === 'player_profile' && ['admin', 'academy_manager', 'player'].includes(session.roleName)) {
        // allow
      } else {
        const hasAccess = await hasModuleAccess(moduleName);
        if (!hasAccess) {
          redirect(`/${locale}/dashboard`);
        }
      }
    }

    // Get accessible menu items for the user
    const accessibleMenuItems = await getAccessibleMenuItems();

    return (
      <DashboardLayout
        locale={locale}
        userName={session.email}
        accessibleMenuItems={accessibleMenuItems}
      >
        {children}
      </DashboardLayout>
    );
  } catch (error) {
    // Not authenticated, redirect to login
    redirect(`/${locale}/login`);
  }
}
