'use client';

import MetricCard from '@/components/common/MetricCard';
import { Package, AlertTriangle, Users, TrendingUp } from 'lucide-react';

export default function DashboardMetrics({ metrics }) {
  if (!metrics) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Total Products"
        value={metrics.totalProducts || 0}
        icon={Package}
        description="Active products in catalog"
      />
      <MetricCard
        title="Critical Stock"
        value={metrics.criticalStockProducts || 0}
        icon={AlertTriangle}
        description="Products below critical level"
      />
      <MetricCard
        title="Total Customers"
        value={metrics.totalCustomers || 0}
        icon={Users}
        description="Active customer accounts"
      />
      <MetricCard
        title="At Risk Customers"
        value={metrics.atRiskCustomers || 0}
        icon={TrendingUp}
        description="Near balance risk limit"
      />
    </div>
  );
}