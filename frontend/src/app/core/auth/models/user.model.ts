export type AccountType = 'individual' | 'organization';

export type Role =
  | 'OWNER'
  | 'ADMINISTRATOR'
  | 'FRAUD_ANALYST'
  | 'INVESTIGATOR'
  | 'VIEWER';

export interface User {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  accountType: AccountType;
  avatarInitials: string;
  avatarUrl?: string;
  country: string;
  jobTitle?: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: 'Active' | 'Pending';
  joinedAt: string;
}

export interface ActiveSession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}
