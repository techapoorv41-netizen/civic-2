export const ROLES = {
  CITIZEN: 'citizen',
  OFFICIAL: 'official',
  ADMIN: 'admin',
};

export const ISSUE_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  VERIFIED: 'verified',
};

export const ISSUE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  CITIZEN_HOME: '/citizen/home',
  CITIZEN_DASHBOARD: '/citizen/dashboard',
  CITIZEN_REPORT: '/citizen/report',
  CITIZEN_MY_REPORTS: '/citizen/my-reports',
  CITIZEN_ISSUE_DETAIL: '/citizen/issue/:id',
  CITIZEN_ANALYSIS: '/citizen/issue/:id/analysis',
  CITIZEN_NOTIFICATIONS: '/citizen/notifications',
  CITIZEN_AI_BOT: '/citizen/issue/:id/ai-bot',
  OFFICIAL_DASHBOARD: '/official/dashboard',
  OFFICIAL_ALL_ISSUES: '/official/all-issues',
  OFFICIAL_HANDLE_REPORTS: '/official/handle-reports',
  OFFICIAL_NOTIFICATIONS: '/official/notifications',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_VERIFY_OFFICIALS: '/admin/verify-officials',
  ADMIN_VERIFY_ISSUE: '/admin/verify-issue',
};
