export interface TimeSeriesDataPoint {
  period: string;
  plan: number;
  fact: number;
  completion: number;
}

export interface CompanySummaryDto {
  planTotal: number;
  factTotal: number;
  completionPercent: number;
  totalCalls: number;
}

export interface SalesMetricsDto {
  daily: TimeSeriesDataPoint[];
  weekly: TimeSeriesDataPoint[];
  monthly: TimeSeriesDataPoint[];
}

export interface KpiComponentDto {
  name: string;
  weight: number;
  value: number;
  score: number;
}

export interface PerformerDto {
  id: string;
  fullName: string;
  avatar?: string;
  score: number;
  revenue: number;
  region?: string;
}

export interface KpiSummaryDto {
  averageScore: KpiComponentDto;
  riskCount: KpiComponentDto;
  topPerformers: PerformerDto[];
  lowPerformers: PerformerDto[];
}

export interface AlertDto {
  id: string;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'danger';
  createdAt: string;
  isRead: boolean;
}

export interface CeoDashboardDto {
  companySummary: CompanySummaryDto;
  salesMetrics: SalesMetricsDto;
  kpiSummary: KpiSummaryDto;
  recentAlerts: AlertDto[];
}
