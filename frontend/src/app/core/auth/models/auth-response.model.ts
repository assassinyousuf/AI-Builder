import { AccountType, Role, User } from './user.model';
import {
  IndustryType,
  Membership,
  Organization,
  OrganizationSize,
  Workspace,
} from './organization.model';

export interface AuthSession {
  token: string;
  expiresAt: string;
  rememberMe: boolean;
  user: User;
  activeWorkspaceId: string;
  activeRole: Role;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface IndividualRegisterPayload {
  accountType: 'individual';
  fullName: string;
  email: string;
  password: string;
  country: string;
  jobTitle?: string;
  termsAccepted: boolean;
}

export interface OrganizationRegisterPayload {
  accountType: 'organization';
  organizationName: string;
  organizationEmail: string;
  adminFullName: string;
  password: string;
  industry: IndustryType;
  organizationSize: OrganizationSize;
  country: string;
  website?: string;
  termsAccepted: boolean;
}

export type RegisterRequest = IndividualRegisterPayload | OrganizationRegisterPayload;

export interface AuthResponse {
  success: boolean;
  message?: string;
  session?: AuthSession;
  workspaces?: Workspace[];
  organizations?: Organization[];
  memberships?: Membership[];
  requiresEmailVerification?: boolean;
  requiresOnboarding?: boolean;
}

export interface EmailVerificationResult {
  verified: boolean;
  message: string;
}

export interface AuthAdapter {
  signIn(request: LoginRequest): Promise<AuthResponse>;
  signInWithGoogle(): Promise<AuthResponse>;
  signUp(request: RegisterRequest): Promise<AuthResponse>;
  requestPasswordReset(email: string): Promise<{ ok: boolean; message: string }>;
  resetPassword(newPassword: string): Promise<{ ok: boolean; message: string }>;
  verifyEmail(code?: string): Promise<EmailVerificationResult>;
  resendVerification(email: string): Promise<{ ok: boolean; message: string }>;
}

export type { AccountType };
