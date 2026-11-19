import { Role } from './user.model';

export type OrganizationSize =
  | '1–10 employees'
  | '11–50 employees'
  | '51–200 employees'
  | '201–500 employees'
  | '500+ employees';

export type IndustryType =
  | 'Banking'
  | 'Financial Services'
  | 'FinTech'
  | 'Insurance'
  | 'E-commerce'
  | 'Payment Services'
  | 'Other';

export interface Organization {
  id: string;
  name: string;
  email: string;
  industry: IndustryType;
  size: OrganizationSize;
  country: string;
  website?: string;
  description?: string;
  logoDataUrl?: string;
}

export interface Workspace {
  id: string;
  name: string;
  type: 'personal' | 'organization';
  organizationId?: string;
  timezone: string;
  currency: string;
  notificationsEnabled: boolean;
  onboardingCompleted: boolean;
}

export interface Membership {
  id: string;
  userId: string;
  workspaceId: string;
  organizationId?: string;
  role: Role;
}
