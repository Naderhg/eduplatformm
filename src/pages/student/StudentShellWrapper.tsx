import { DashboardShell } from '../../components/dashboard/DashboardShell';
import { studentNav, studentComingSoon } from '../../lib/dashboard-data';
import type { ReactNode } from 'react';

export const StudentShellWrapper = ({ children }: { children: ReactNode }) => (
  <DashboardShell roleLabel="طالب" nav={studentNav} comingSoon={studentComingSoon}>
    {children}
  </DashboardShell>
);
