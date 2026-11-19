import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Membership,
  Organization,
  Workspace,
} from '../models/organization.model';
import { ActiveSession, Role, TeamMember } from '../models/user.model';
import { SessionService } from './session.service';

const WORKSPACE_STORAGE_KEY = 'fs_workspace_state_v1';

interface PersistedWorkspaceState {
  organizations: Organization[];
  workspaces: Workspace[];
  memberships: Membership[];
  teamMembers: TeamMember[];
}

@Injectable({ providedIn: 'root' })
export class WorkspaceService {
  private readonly sessionService = inject(SessionService);

  private readonly defaultState: PersistedWorkspaceState = {
    organizations: [
      {
        id: 'ORG-8801',
        name: 'Aegis Capital Financial',
        email: 'security@aegiscapital.com',
        industry: 'Banking',
        size: '500+ employees',
        country: 'United States',
        website: 'https://aegiscapital.com',
        description: 'Global institutional banking & real-time payment risk operations.',
      },
    ],
    workspaces: [
      {
        id: 'WS-901',
        name: 'Aegis Global Fraud Ops',
        type: 'organization',
        organizationId: 'ORG-8801',
        timezone: 'UTC+06:00 (Asia/Dhaka)',
        currency: 'USD',
        notificationsEnabled: true,
        onboardingCompleted: true,
      },
      {
        id: 'WS-902',
        name: 'Personal Intelligence Workspace',
        type: 'personal',
        timezone: 'UTC+00:00 (UTC)',
        currency: 'USD',
        notificationsEnabled: true,
        onboardingCompleted: true,
      },
    ],
    memberships: [
      { id: 'MEM-1', userId: 'USR-1001', workspaceId: 'WS-901', organizationId: 'ORG-8801', role: 'OWNER' },
      { id: 'MEM-2', userId: 'USR-1001', workspaceId: 'WS-902', role: 'OWNER' },
    ],
    teamMembers: [
      {
        id: 'TM-1',
        name: 'Maya Lin',
        email: 'maya.lin@aegiscapital.com',
        role: 'OWNER',
        status: 'Active',
        joinedAt: '2026-01-14T09:00:00Z',
      },
      {
        id: 'TM-2',
        name: 'Tariq Hassan',
        email: 'tariq.hassan@aegiscapital.com',
        role: 'ADMINISTRATOR',
        status: 'Active',
        joinedAt: '2026-02-02T11:30:00Z',
      },
      {
        id: 'TM-3',
        name: 'Elena Vance',
        email: 'elena.vance@aegiscapital.com',
        role: 'FRAUD_ANALYST',
        status: 'Active',
        joinedAt: '2026-03-19T14:15:00Z',
      },
      {
        id: 'TM-4',
        name: 'Devon Patel',
        email: 'devon.patel@aegiscapital.com',
        role: 'INVESTIGATOR',
        status: 'Active',
        joinedAt: '2026-04-08T10:00:00Z',
      },
    ],
  };

  private readonly state = signal<PersistedWorkspaceState>(this.loadState());

  readonly organizations = computed(() => this.state().organizations);
  readonly workspaces = computed(() => this.state().workspaces);
  readonly memberships = computed(() => this.state().memberships);
  readonly teamMembers = computed(() => this.state().teamMembers);

  readonly activeWorkspace = computed<Workspace | null>(() => {
    const activeId = this.sessionService.activeWorkspaceId();
    const list = this.state().workspaces;
    return list.find((w) => w.id === activeId) ?? list[0] ?? null;
  });

  readonly activeOrganization = computed<Organization | null>(() => {
    const ws = this.activeWorkspace();
    if (!ws?.organizationId) return null;
    return this.state().organizations.find((o) => o.id === ws.organizationId) ?? null;
  });

  readonly activeSessions = signal<ActiveSession[]>([
    {
      id: 'SES-1',
      device: 'Chrome 131 on Windows 11',
      location: 'Dhaka, Bangladesh',
      ipAddress: '103.145.82.19',
      lastActive: 'Active now',
      current: true,
    },
    {
      id: 'SES-2',
      device: 'Safari 18 on macOS Sequoia',
      location: 'Singapore',
      ipAddress: '175.156.44.92',
      lastActive: '2 days ago',
      current: false,
    },
  ]);

  registerWorkspaceBundle(
    orgs: Organization[],
    workspaces: Workspace[],
    memberships: Membership[],
    initialMembers: TeamMember[]
  ): void {
    this.state.set({
      organizations: orgs,
      workspaces,
      memberships,
      teamMembers: initialMembers,
    });
    this.persist();
  }

  switchWorkspace(workspaceId: string): void {
    const user = this.sessionService.currentUser();
    const membership = this.state().memberships.find(
      (m) => m.workspaceId === workspaceId && (!user || m.userId === user.id)
    );
    const role: Role = membership?.role ?? 'OWNER';
    this.sessionService.updateWorkspaceContext(workspaceId, role);
  }

  updateOrganization(orgId: string, patch: Partial<Organization>): void {
    this.state.update((s) => ({
      ...s,
      organizations: s.organizations.map((o) => (o.id === orgId ? { ...o, ...patch } : o)),
    }));
    this.persist();
  }

  updateWorkspace(workspaceId: string, patch: Partial<Workspace>): void {
    this.state.update((s) => ({
      ...s,
      workspaces: s.workspaces.map((w) => (w.id === workspaceId ? { ...w, ...patch } : w)),
    }));
    this.persist();
  }

  addTeamMember(name: string, email: string, role: Role): TeamMember {
    const member: TeamMember = {
      id: `TM-${Date.now()}`,
      name,
      email,
      role,
      status: 'Pending',
      joinedAt: new Date().toISOString(),
    };
    this.state.update((s) => ({
      ...s,
      teamMembers: [member, ...s.teamMembers],
    }));
    this.persist();
    return member;
  }

  updateMemberRole(memberId: string, role: Role): void {
    this.state.update((s) => ({
      ...s,
      teamMembers: s.teamMembers.map((m) => (m.id === memberId ? { ...m, role } : m)),
    }));
    this.persist();
  }

  removeTeamMember(memberId: string): void {
    this.state.update((s) => ({
      ...s,
      teamMembers: s.teamMembers.filter((m) => m.id !== memberId),
    }));
    this.persist();
  }

  revokeSession(sessionId: string): void {
    this.activeSessions.update((list) => list.filter((s) => s.id !== sessionId));
  }

  private persist(): void {
    try {
      localStorage.setItem(WORKSPACE_STORAGE_KEY, JSON.stringify(this.state()));
    } catch {
      // Ignore storage quota errors
    }
  }

  private loadState(): PersistedWorkspaceState {
    try {
      const raw = localStorage.getItem(WORKSPACE_STORAGE_KEY);
      if (!raw) return this.defaultState;
      return JSON.parse(raw) as PersistedWorkspaceState;
    } catch {
      return this.defaultState;
    }
  }
}
