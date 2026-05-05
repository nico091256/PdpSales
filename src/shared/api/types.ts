// ─── Auth ───────────────────────────────────────────
export interface LoginRequest {
  email: string;
  password: string;
  companySlug?: string;
  companyId?: string;
}

export interface RegisterRequest {
  companyName: string;
  fullName: string;
  email: string;
  password: string;
  role: string;
}

export interface UserInfo {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
  companyId: string;
  theme?: string;
  photoUrl?: string;
}

export interface LoginResponse {
  token?: string;
  expiresUtc: string;
  refreshToken?: string;
  refreshTokenExpiresUtc: string;
  user: UserInfo;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken?: string;
  logoutAll?: boolean;
}

export interface GoogleLinkResponse {
  redirectUrl?: string;
}

export interface GoogleStatusResponse {
  enabled: boolean;
  linked?: boolean;
  googleEmail?: string;
  googlePictureUrl?: string;
  googleEmailVerified?: boolean;
}

// ─── User ────────────────────────────────────────────
export type UserRole = 'CEO' | 'ROP' | 'SalesManager';

export interface UserListItem {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
  region?: string;
  department?: string;
  phoneNumber?: string;
  photoUrl?: string;
  createdAtUtc: string;
  isDeleted: boolean;
  deletedAtUtc?: string;
}

export interface UpdateUserRequest {
  fullName?: string;
  role?: string;
  region?: string;
  department?: string;
}

// ─── Me ─────────────────────────────────────────────
export interface MeResponse {
  userId?: string;
  email?: string;
  fullName?: string;
  role?: string;
  companyId?: string;
  companyName?: string;
  theme?: string;
}

// ─── Profile ─────────────────────────────────────────
export interface ProfileDto {
  id: string;
  fullName?: string;
  email?: string;
  role?: string;
  phoneNumber?: string;
  photoUrl?: string;
  theme?: string;
  crmId?: string;
  telephonyId?: string;
  region?: string;
  department?: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  phoneNumber?: string;
  photoUrl?: string;
  theme?: string;
  crmId?: string;
  telephonyId?: string;
}

// ─── Dashboard ───────────────────────────────────────
export interface CeoDashboardDto {
  summary?: CeoSummaryDto;
  salesMetrics?: SalesMetricsDto;
  calls?: CallsMetricsDto;
  kpi?: KpiSummaryDto;
  ranking?: RankingDto;
  riskZone?: RiskZoneDto;
}

export interface RopDashboardDto {
  summary?: RopSummaryDto;
  salesMetrics?: SalesMetricsDto;
  calls?: CallsMetricsDto;
  kpi?: RopKpiDto;
  ranking?: RankingDto;
  riskZone?: RiskZoneDto;
}

export interface SalesManagerDashboardDto {
  summary?: ManagerSummaryDto;
  salesMetrics?: SalesMetricsDto;
  calls?: ManagerCallsMetricsDto;
  planVsFact?: ManagerPlanVsFactDto;
  kpi?: ManagerKpiDetailsDto;
  alerts?: ManagerAlertsDto;
}

export interface CeoSummaryDto {
  planTotal: number;
  factTotal: number;
  completionPercent: number;
  totalCalls: number;
  managersAtRisk: number;
}

export interface RopSummaryDto {
  planTotal: number;
  factTotal: number;
  completionPercent: number;
  totalCalls: number;
}

export interface ManagerSummaryDto {
  planTotal: number;
  factTotal: number;
  completionPercent: number;
  gapToPlan: number;
  totalCalls: number;
  kpiScore: number;
  riskLevel?: string;
}

export interface SalesMetricsDto {
  daily?: TimeSeriesDataPoint[];
  weekly?: TimeSeriesDataPoint[];
  monthly?: TimeSeriesDataPoint[];
}

export interface CallsMetricsDto {
  total: number;
  byManager?: ManagerCallsDto[];
}

export interface ManagerCallsDto {
  userId: string;
  fullName?: string;
  calls: number;
}

export interface ManagerCallsMetricsDto {
  daily?: DailyCallsDto[];
  total: number;
}

export interface DailyCallsDto {
  date: string;
  count: number;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface KpiSummaryDto {
  averageScore: number;
  riskCount: number;
  topPerformers?: PerformerDto[];
  lowPerformers?: PerformerDto[];
}

export interface PerformerDto {
  userId: string;
  fullName?: string;
  kpiScore: number;
  completionPercent: number;
}

export interface RopKpiDto {
  averageScore: number;
  riskCount: number;
  byManager?: ManagerKpiDto[];
}

export interface ManagerKpiDto {
  userId: string;
  fullName?: string;
  plan: number;
  fact: number;
  completionPercent: number;
  kpiScore: number;
  riskLevel?: string;
}

export interface ManagerKpiDetailsDto {
  score: number;
  components?: KpiComponentDto[];
}

export interface KpiComponentDto {
  name?: string;
  weight: number;
  value: number;
  score: number;
}

export interface ManagerPlanVsFactDto {
  planTotal: number;
  factTotal: number;
  completionPercent: number;
  gapToPlan: number;
  trend?: TrendDataPoint[];
}

export interface ManagerAlertsDto {
  unreadCount: number;
  latest?: AlertSummaryDto[];
}

export interface AlertSummaryDto {
  id: string;
  message?: string;
  severity?: string;
  createdAtUtc: string;
}

export interface RankingDto {
  items?: RankedManagerDto[];
}

export interface RankedManagerDto {
  rank: number;
  userId: string;
  fullName?: string;
  completionPercent: number;
  kpiScore: number;
}

export interface RiskZoneDto {
  thresholds?: RiskThresholdsDto;
  users?: RiskUserDto[];
}

export interface RiskThresholdsDto {
  planNotMetPercent: number;
  planCriticalPercent: number;
  kpiRiskScore: number;
  kpiCriticalScore: number;
}

export interface RiskUserDto {
  userId: string;
  fullName?: string;
  reason?: string;
  completionPercent: number;
  kpiScore: number;
}

// ─── Alerts ──────────────────────────────────────────
export type AlertSeverity = 'Info' | 'Warning' | 'Danger';

export interface AlertDto {
  id: string;
  title?: string;
  message?: string;
  severity?: string;
  isRead: boolean;
  createdAtUtc: string;
}

export interface AlertGenerationResultDto {
  generated?: number;
  period?: string;
}

// ─── Appointments ────────────────────────────────────
export type AppointmentStatus = 'Requested' | 'Approved' | 'Completed' | 'Rejected';

export interface AppointmentResponse {
  id: string;
  salesManagerId: string;
  salesManagerName?: string;
  salesManagerAvatarUrl?: string;
  requestedAt: string;
  scheduledAt?: string;
  completedAt?: string;
  rejectedAt?: string;
  status: AppointmentStatus;
  notes?: string;
  rejectionReason?: string;
}

export interface CompleteAppointmentRequest {
  notes: string;
}

export interface RejectAppointmentRequest {
  reason?: string;
}

// ─── Call Logs ───────────────────────────────────────
export interface LogCallRequest {
  phone: string;
  note?: string;
  outcome: string;
  meetingRequested?: boolean;
  scheduledAtUtc?: string;
  assignedSalesManagerId?: string;
}

export interface LogCallResponse {
  contactId: string;
  callLogId: string;
  appointmentId?: string;
  phoneNormalized?: string;
  meetingCreated: boolean;
  message?: string;
}

// ─── Calls (Stats) ───────────────────────────────────
export type PlanPeriodType = 0 | 1;

export interface CallsSummaryDto {
  total: number;
  successful: number;
  followUp: number;
  noAnswer: number;
  items?: CallStatDto[];
}

export interface CallStatDto {
  id: string;
  date: string;
  total: number;
  successful: number;
  followUp: number;
  noAnswer: number;
  userId: string;
}

export interface CreateCallStatRequest {
  date: string;
  total: number;
  successful: number;
  followUp: number;
  noAnswer: number;
}

// ─── Sales Managers ──────────────────────────────────
export interface SalesManagerDto {
  id: string;
  fullName?: string;
  email?: string;
  region?: string;
  department?: string;
  isActive: boolean;
  createdAtUtc: string;
}

export interface CreateSalesManagerRequest {
  fullName: string;
  email: string;
  password: string;
  region?: string;
  department?: string;
}

// ─── Invitations ─────────────────────────────────────
export interface InviteListItem {
  id: string;
  email?: string;
  role?: string;
  createdAtUtc: string;
  expiresAtUtc: string;
  usedAtUtc?: string;
  invitedByName?: string;
  status?: string;
}

export interface SendInvitationRequest {
  email: string;
  role: UserRole;
}

export interface SendInvitationResponse {
  inviteId: string;
  expiresAtUtc: string;
  inviteLink: string;
}

// ─── Rankings ────────────────────────────────────────
export interface RankingItem {
  rank: number;
  userId: string;
  name?: string;
  avatarUrl?: string;
  revenue: number;
  appointments: number;
  calls: number;
  score: number;
  change: number;
}

// ─── Company Settings ────────────────────────────────
export interface CompanySettingsDto {
  companyName?: string;
  slug?: string;
  industry?: string;
  timezone?: string;
  currency?: string;
  logoUrl?: string;
}

export interface UpdateCompanySettingsRequest {
  companyName?: string;
  industry?: string;
  timezone?: string;
  currency?: string;
  logoUrl?: string;
}

// ─── Facts ───────────────────────────────────────────
export interface SalesFactDto {
  id: string;
  userId: string;
  userFullName?: string;
  userEmail?: string;
  date?: string;
  amount: number;
  source?: string;
  externalId?: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
}

export interface FactsSummaryDto {
  totalAmount: number;
  totalCount: number;
  facts?: SalesFactDto[];
}

export interface FactImportDto {
  id: string;
  status?: string;
  fileName?: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  insertedRows: number;
  skippedDuplicates: number;
  createdAtUtc: string;
  committedAtUtc?: string;
  expiresAtUtc: string;
}

// ─── Common ──────────────────────────────────────────
export interface ProblemDetails {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
}
