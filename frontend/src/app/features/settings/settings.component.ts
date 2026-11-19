import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  User,
  Building2,
  Shield,
  SlidersHorizontal,
  Users,
  Save,
  LogOut,
  Plus,
  Trash2,
  Upload,
} from 'lucide-angular';
import { FraudStoreService } from '../../core/state/fraud-store.service';
import { AuthService } from '../../core/auth/services/auth.service';
import { SessionService } from '../../core/auth/services/session.service';
import { WorkspaceService } from '../../core/auth/services/workspace.service';
import { IndustryType, OrganizationSize } from '../../core/auth/models/organization.model';
import { Role } from '../../core/auth/models/user.model';

type SettingsTab = 'personal' | 'organization' | 'security' | 'preferences' | 'team';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-6 max-w-5xl animate-page-in">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
            Account & Organization Settings
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Manage personal identity, organization workspace, security posture, and team access
          </p>
        </div>

        <button
          type="button"
          (click)="saveAll()"
          class="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-xs font-semibold text-white flex items-center gap-1.5 self-start"
        >
          <lucide-icon [img]="SaveIcon" class="w-3.5 h-3.5" />
          Save Changes
        </button>
      </div>

      <!-- Tabs -->
      <div class="flex flex-wrap gap-2 border-b border-white/8 pb-3">
        @for (t of tabs; track t.id) {
          <button
            type="button"
            (click)="activeTab.set(t.id)"
            class="px-3.5 py-2 rounded-xl text-xs font-medium flex items-center gap-2 border transition-all"
            [ngClass]="
              activeTab() === t.id
                ? 'bg-purple-600/20 border-purple-500/45 text-white'
                : 'bg-[#10111D] border-white/8 text-zinc-400 hover:text-white'
            "
          >
            <lucide-icon [img]="t.icon" class="w-3.5 h-3.5" />
            {{ t.label }}
          </button>
        }
      </div>

      <!-- 1. PERSONAL PROFILE -->
      @if (activeTab() === 'personal') {
        <div class="fs-card p-6 space-y-5 text-xs">
          <h2 class="text-sm font-semibold text-white">Personal Profile</h2>

          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-lg font-bold text-white overflow-hidden">
              @if (avatarPreview()) {
                <img [src]="avatarPreview()" alt="Profile" class="w-full h-full object-cover" />
              } @else {
                {{ user()?.avatarInitials || 'ML' }}
              }
            </div>
            <label class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-zinc-200 cursor-pointer">
              <lucide-icon [img]="UploadIcon" class="w-3.5 h-3.5 text-purple-400" />
              <span>Upload Profile Picture</span>
              <input type="file" accept="image/*" (change)="onAvatarSelected($event)" class="hidden" />
            </label>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-zinc-400 mb-1.5">Full name</label>
              <input type="text" [(ngModel)]="fullName" class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white" />
            </div>
            <div>
              <label class="block text-zinc-400 mb-1.5">Email</label>
              <input type="email" [(ngModel)]="email" class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white" />
            </div>
            <div>
              <label class="block text-zinc-400 mb-1.5">Job title</label>
              <input type="text" [(ngModel)]="jobTitle" class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white" />
            </div>
            <div>
              <label class="block text-zinc-400 mb-1.5">Country</label>
              <input type="text" [(ngModel)]="country" class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white" />
            </div>
          </div>
        </div>
      }

      <!-- 2. ORGANIZATION PROFILE -->
      @if (activeTab() === 'organization') {
        <div class="fs-card p-6 space-y-5 text-xs">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-white">Organization Profile</h2>
            @if (org(); as o) {
              <span class="font-mono-num text-[11px] px-2.5 py-1 rounded-lg bg-white/6 text-zinc-300">
                ID: {{ o.id }}
              </span>
            }
          </div>

          @if (org(); as o) {
            <div class="flex items-center gap-4">
              <div class="w-16 h-16 rounded-2xl bg-[#090A16] border border-white/10 flex items-center justify-center overflow-hidden">
                @if (orgLogoPreview()) {
                  <img [src]="orgLogoPreview()" alt="Org logo" class="w-full h-full object-cover" />
                } @else {
                  <lucide-icon [img]="BuildingIcon" class="w-6 h-6 text-purple-400" />
                }
              </div>
              <label class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-zinc-200 cursor-pointer">
                <lucide-icon [img]="UploadIcon" class="w-3.5 h-3.5 text-purple-400" />
                <span>Update Organization Logo</span>
                <input type="file" accept="image/*" (change)="onOrgLogoSelected($event)" class="hidden" />
              </label>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-zinc-400 mb-1.5">Organization name</label>
                <input type="text" [(ngModel)]="orgName" class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white" />
              </div>
              <div>
                <label class="block text-zinc-400 mb-1.5">Industry</label>
                <select [(ngModel)]="orgIndustry" class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white">
                  @for (i of industries; track i) {
                    <option [value]="i">{{ i }}</option>
                  }
                </select>
              </div>
              <div>
                <label class="block text-zinc-400 mb-1.5">Website</label>
                <input type="text" [(ngModel)]="orgWebsite" class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white" />
              </div>
              <div>
                <label class="block text-zinc-400 mb-1.5">Company size</label>
                <select [(ngModel)]="orgSize" class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white">
                  @for (s of orgSizes; track s) {
                    <option [value]="s">{{ s }}</option>
                  }
                </select>
              </div>
            </div>
          } @else {
            <p class="text-zinc-400">
              You are currently operating in a Personal Workspace. Switch to an Organization Workspace to configure organization details.
            </p>
          }
        </div>
      }

      <!-- 3. SECURITY -->
      @if (activeTab() === 'security') {
        <div class="space-y-4 text-xs">
          <div class="fs-card p-6 space-y-4">
            <h2 class="text-sm font-semibold text-white">Change Password</h2>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="password" [(ngModel)]="currentPwd" placeholder="Current password" class="px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white" />
              <input type="password" [(ngModel)]="newPwd" placeholder="New password" class="px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white" />
              <button type="button" (click)="updatePassword()" class="py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-white">
                Update Password
              </button>
            </div>
          </div>

          <div class="fs-card p-6 flex items-center justify-between">
            <div>
              <h3 class="text-sm font-semibold text-white">Two-Factor Authentication (2FA)</h3>
              <p class="text-zinc-400 mt-0.5">Require hardware key or authenticator app verification on sign-in.</p>
            </div>
            <input type="checkbox" [(ngModel)]="twoFactor" class="accent-purple-500 w-4 h-4" />
          </div>

          <div class="fs-card p-6 space-y-3">
            <div class="flex items-center justify-between">
              <h3 class="text-sm font-semibold text-white">Active Sessions</h3>
              <button
                type="button"
                (click)="auth.signOut()"
                class="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-semibold flex items-center gap-1.5"
              >
                <lucide-icon [img]="LogOutIcon" class="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
            @for (s of workspaceService.activeSessions(); track s.id) {
              <div class="p-3 rounded-xl bg-[#090A16] border border-white/8 flex items-center justify-between">
                <div>
                  <p class="font-semibold text-white">{{ s.device }}</p>
                  <p class="text-[11px] text-zinc-400">{{ s.location }} • {{ s.ipAddress }} • {{ s.lastActive }}</p>
                </div>
                @if (!s.current) {
                  <button type="button" (click)="workspaceService.revokeSession(s.id)" class="text-red-400 hover:underline">
                    Revoke
                  </button>
                } @else {
                  <span class="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-semibold">Current</span>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- 4. PREFERENCES -->
      @if (activeTab() === 'preferences') {
        <div class="fs-card p-6 space-y-5 text-xs">
          <h2 class="text-sm font-semibold text-white">Workspace & Notification Preferences</h2>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label class="block text-zinc-400 mb-1.5">Theme</label>
              <select [(ngModel)]="theme" class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white">
                <option value="Midnight Dark">Midnight Dark (Default)</option>
                <option value="Obsidian High Contrast">Obsidian High Contrast</option>
              </select>
            </div>
            <div>
              <label class="block text-zinc-400 mb-1.5">Language</label>
              <select [(ngModel)]="language" class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white">
                <option value="English (US)">English (US)</option>
                <option value="English (UK)">English (UK)</option>
              </select>
            </div>
            <div>
              <label class="block text-zinc-400 mb-1.5">Timezone</label>
              <select [(ngModel)]="timezone" class="w-full px-3.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white">
                <option value="UTC+00:00 (UTC)">UTC+00:00 (UTC)</option>
                <option value="UTC-05:00 (America/New_York)">UTC-05:00 (America/New_York)</option>
                <option value="UTC+06:00 (Asia/Dhaka)">UTC+06:00 (Asia/Dhaka)</option>
              </select>
            </div>
          </div>

          <div class="space-y-2 pt-2 border-t border-white/8">
            <div class="flex justify-between">
              <span class="text-zinc-300">Active Global Detection Threshold</span>
              <span class="font-mono-num font-bold text-purple-300">{{ store.activeThreshold() }} / 100</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              [ngModel]="store.activeThreshold()"
              (ngModelChange)="store.activeThreshold.set(+$event)"
              class="w-full fs-slider"
            />
          </div>

          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-zinc-300">Email Escalation Digests</span>
            <input type="checkbox" [(ngModel)]="emailAlerts" class="accent-purple-500 w-4 h-4" />
          </label>
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-zinc-300">Webhook Alert Dispatch</span>
            <input type="checkbox" [(ngModel)]="slackAlerts" class="accent-purple-500 w-4 h-4" />
          </label>
        </div>
      }

      <!-- 5. TEAM MANAGEMENT -->
      @if (activeTab() === 'team') {
        <div class="fs-card p-6 space-y-5 text-xs">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 class="text-sm font-semibold text-white">Team Management</h2>
              <p class="text-zinc-400 mt-0.5">Manage workspace members, roles, and pending invitations.</p>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-purple-500/15 text-purple-300 font-mono-num text-[11px]">
              Your Role: {{ session.activeRole() }}
            </span>
          </div>

          @if (canManageTeam()) {
            <div class="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
              <input type="text" [(ngModel)]="inviteName" placeholder="Full name" class="sm:col-span-4 px-3 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white" />
              <input type="email" [(ngModel)]="inviteEmail" placeholder="analyst@company.com" class="sm:col-span-4 px-3 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white" />
              <select [(ngModel)]="inviteRole" class="sm:col-span-2 px-2.5 py-2.5 rounded-xl bg-[#090A16] border border-white/10 text-white">
                @for (r of roles; track r) {
                  <option [value]="r">{{ r }}</option>
                }
              </select>
              <button
                type="button"
                (click)="inviteMember()"
                class="sm:col-span-2 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 font-semibold text-white flex items-center justify-center gap-1"
              >
                <lucide-icon [img]="PlusIcon" class="w-3.5 h-3.5" />
                Invite
              </button>
            </div>
          }

          <div class="space-y-2">
            @for (m of workspaceService.teamMembers(); track m.id) {
              <div class="p-3.5 rounded-xl bg-[#090A16] border border-white/8 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p class="font-semibold text-white">{{ m.name }}</p>
                  <p class="text-[11px] text-zinc-400">{{ m.email }} • {{ m.status }}</p>
                </div>
                <div class="flex items-center gap-2">
                  <select
                    [ngModel]="m.role"
                    (ngModelChange)="workspaceService.updateMemberRole(m.id, $event)"
                    [disabled]="!canManageTeam() || m.role === 'OWNER'"
                    class="px-2.5 py-1.5 rounded-lg bg-[#10111D] border border-white/10 text-xs text-white disabled:opacity-60"
                  >
                    @for (r of roles; track r) {
                      <option [value]="r">{{ r }}</option>
                    }
                  </select>
                  @if (canManageTeam() && m.role !== 'OWNER') {
                    <button type="button" (click)="workspaceService.removeTeamMember(m.id)" class="p-1.5 text-zinc-500 hover:text-red-400">
                      <lucide-icon [img]="TrashIcon" class="w-4 h-4" />
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
})
export class SettingsComponent {
  readonly store = inject(FraudStoreService);
  readonly auth = inject(AuthService);
  readonly session = inject(SessionService);
  readonly workspaceService = inject(WorkspaceService);

  readonly SaveIcon = Save;
  readonly LogOutIcon = LogOut;
  readonly PlusIcon = Plus;
  readonly TrashIcon = Trash2;
  readonly UploadIcon = Upload;
  readonly BuildingIcon = Building2;

  readonly activeTab = signal<SettingsTab>('personal');
  readonly tabs: { id: SettingsTab; label: string; icon: typeof User }[] = [
    { id: 'personal', label: 'Personal Profile', icon: User },
    { id: 'organization', label: 'Organization Profile', icon: Building2 },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
    { id: 'team', label: 'Team Management', icon: Users },
  ];

  readonly user = this.session.currentUser;
  readonly org = this.workspaceService.activeOrganization;
  readonly canManageTeam = computed(() =>
    this.session.activeRole() === 'OWNER' || this.session.activeRole() === 'ADMINISTRATOR'
  );

  readonly avatarPreview = signal<string | null>(this.user()?.avatarUrl ?? null);
  readonly orgLogoPreview = signal<string | null>(this.org()?.logoDataUrl ?? null);

  fullName = this.user()?.fullName ?? this.store.settings().analystName;
  email = this.user()?.email ?? this.store.settings().analystEmail;
  jobTitle = this.user()?.jobTitle ?? 'Lead Fraud Intelligence Analyst';
  country = this.user()?.country ?? 'United States';

  orgName = this.org()?.name ?? '';
  orgIndustry: IndustryType = this.org()?.industry ?? 'FinTech';
  orgWebsite = this.org()?.website ?? '';
  orgSize: OrganizationSize = this.org()?.size ?? '51–200 employees';

  currentPwd = '';
  newPwd = '';
  twoFactor = this.user()?.twoFactorEnabled ?? true;

  theme = 'Midnight Dark';
  language = 'English (US)';
  timezone = this.workspaceService.activeWorkspace()?.timezone ?? 'UTC+00:00 (UTC)';
  emailAlerts = this.store.settings().emailAlerts;
  slackAlerts = this.store.settings().slackWebhookAlerts;

  inviteName = '';
  inviteEmail = '';
  inviteRole: Role = 'FRAUD_ANALYST';

  readonly industries: IndustryType[] = ['Banking', 'Financial Services', 'FinTech', 'Insurance', 'E-commerce', 'Payment Services', 'Other'];
  readonly orgSizes: OrganizationSize[] = ['1–10 employees', '11–50 employees', '51–200 employees', '201–500 employees', '500+ employees'];
  readonly roles: Role[] = ['OWNER', 'ADMINISTRATOR', 'FRAUD_ANALYST', 'INVESTIGATOR', 'VIEWER'];

  onAvatarSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  onOrgLogoSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => this.orgLogoPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  async updatePassword(): Promise<void> {
    if (!this.currentPwd || this.newPwd.length < 8) {
      this.store.showToast('Validation', 'Enter current password and a new password (min 8 chars).', 'warning');
      return;
    }
    await this.auth.resetPassword(this.newPwd);
    this.currentPwd = '';
    this.newPwd = '';
    this.store.showToast('Password Updated', 'Your workspace password has been updated.', 'success');
  }

  inviteMember(): void {
    if (!this.inviteName.trim() || !this.inviteEmail.trim()) return;
    this.workspaceService.addTeamMember(this.inviteName.trim(), this.inviteEmail.trim(), this.inviteRole);
    this.inviteName = '';
    this.inviteEmail = '';
    this.store.showToast('Invitation Queued', 'Team member added to workspace directory.', 'success');
  }

  saveAll(): void {
    this.session.updateUser({
      fullName: this.fullName,
      email: this.email,
      jobTitle: this.jobTitle,
      country: this.country,
      twoFactorEnabled: this.twoFactor,
      avatarUrl: this.avatarPreview() ?? undefined,
    });

    const org = this.org();
    if (org) {
      this.workspaceService.updateOrganization(org.id, {
        name: this.orgName,
        industry: this.orgIndustry,
        website: this.orgWebsite,
        size: this.orgSize,
        logoDataUrl: this.orgLogoPreview() ?? undefined,
      });
    }

    const ws = this.workspaceService.activeWorkspace();
    if (ws) {
      this.workspaceService.updateWorkspace(ws.id, { timezone: this.timezone });
    }

    this.store.settings.update((s) => ({
      ...s,
      analystName: this.fullName,
      analystEmail: this.email,
      emailAlerts: this.emailAlerts,
      slackWebhookAlerts: this.slackAlerts,
    }));

    this.store.showToast('Settings Saved', 'Account and organization settings updated.', 'success');
  }
}
