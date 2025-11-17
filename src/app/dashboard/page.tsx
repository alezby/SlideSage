'use client';
import DashboardPageClient from '@/components/dashboard-page-client';
import { presentations } from '@/lib/data';

export default function DashboardPage() {
  return <DashboardPageClient presentations={presentations} />;
}
