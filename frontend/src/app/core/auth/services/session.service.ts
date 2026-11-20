import { Injectable, computed, signal } from '@angular/core';
import { AuthSession } from '../models/auth-response.model';
import { Role, User } from '../models/user.model';

const SESSION_STORAGE_KEY = 'fs_auth_session_v1';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly _session = signal<AuthSession | null>(this.loadInitialSession());

  readonly session = this._session.asReadonly();
  readonly isAuthenticated = computed(() => {
    const s = this._session();
    if (!s) return false;
    return new Date(s.expiresAt).getTime() > Date.now();
  });
  readonly currentUser = computed<User | null>(() => this._session()?.user ?? null);
  readonly activeRole = computed<Role>(() => this._session()?.activeRole ?? 'VIEWER');
  readonly activeWorkspaceId = computed<string | null>(() => this._session()?.activeWorkspaceId ?? null);

  setSession(session: AuthSession): void {
    this._session.set(session);
    const serialized = JSON.stringify(session);
    try {
      if (session.rememberMe) {
        localStorage.setItem(SESSION_STORAGE_KEY, serialized);
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } else {
        sessionStorage.setItem(SESSION_STORAGE_KEY, serialized);
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Storage unavailable; keep in-memory session
    }
  }

  updateUser(patch: Partial<User>): void {
    const current = this._session();
    if (!current) return;
    this.setSession({
      ...current,
      user: { ...current.user, ...patch },
    });
  }

  updateWorkspaceContext(workspaceId: string, role: Role): void {
    const current = this._session();
    if (!current) return;
    this.setSession({
      ...current,
      activeWorkspaceId: workspaceId,
      activeRole: role,
    });
  }

  clearSession(): void {
    this._session.set(null);
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignore storage errors
    }
  }

  private loadInitialSession(): AuthSession | null {
    try {
      const raw =
        localStorage.getItem(SESSION_STORAGE_KEY) ?? sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return this.createDefaultDemoSession();
      const parsed = JSON.parse(raw) as AuthSession;
      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        return this.createDefaultDemoSession();
      }
      return parsed;
    } catch {
      return this.createDefaultDemoSession();
    }
  }

  private createDefaultDemoSession(): AuthSession {
    const user: User = {
      id: 'USR-1001',
      fullName: 'Maya Lin',
      email: 'maya.lin@aegiscapital.com',
      emailVerified: true,
      accountType: 'organization',
      avatarInitials: 'ML',
      country: 'United States',
      jobTitle: 'Lead Fraud Intelligence Analyst',
      twoFactorEnabled: true,
      createdAt: new Date().toISOString(),
    };

    const session: AuthSession = {
      token: 'fs_tok_demo_active_session',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      rememberMe: true,
      user,
      activeWorkspaceId: 'WS-901',
      activeRole: 'OWNER',
    };

    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    } catch {
      // Ignore storage errors
    }

    return session;
  }
}
