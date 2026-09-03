import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { teacherNav, teacherComingSoon } from '../../lib/dashboard-data';
import type { ReactNode } from 'react';

/**
 * Wrapper to embed existing teacher pages (that were built for the old
 * DashboardLayout) inside the new DashboardShell so they share the same
 * sidebar / topbar as the new teacher pages.
 */
export const TeacherShellWrapper = ({ children }: { children: ReactNode }) => (
  <DashboardShell roleLabel="مدرس" nav={teacherNav} comingSoon={teacherComingSoon}>
    {children}
  </DashboardShell>
);
