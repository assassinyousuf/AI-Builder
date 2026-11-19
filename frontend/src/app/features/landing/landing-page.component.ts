import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import type { EChartsOption } from 'echarts';
import {
  LucideAngularModule,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Share2,
  Bot,
  Fingerprint,
  SlidersHorizontal,
  Swords,
  Sparkles,
  Activity,
  ShieldAlert,
  Menu,
  X,
  Layers,
  Server,
  Cpu,
  Database,
  CheckCircle2,
  Zap,
  LogOut,
  ChevronDown,
  Settings,
} from 'lucide-angular';
import { FraudStoreService } from '../../core/state/fraud-store.service';
import { MockTransactionService } from '../../core/services/mock-transaction.service';
import { AuthService } from '../../core/auth/services/auth.service';
import { EchartsWrapperComponent } from '../../shared/components/echarts-wrapper.component';
import { RiskGaugeComponent } from '../../shared/components/risk-gauge.component';
import { RiskBadgeComponent } from '../../shared/components/risk-badge.component';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    LucideAngularModule,
    EchartsWrapperComponent,
    RiskGaugeComponent,
    RiskBadgeComponent,
  ],
  templateUrl: './landing-page.component.html',
  styleUrl: './landing-page.component.css',
})
export class LandingPageComponent implements OnInit, AfterViewInit, OnDestroy {
  readonly store = inject(FraudStoreService);
  readonly auth = inject(AuthService);
  private readonly txnService = inject(MockTransactionService);
  private readonly router = inject(Router);
  private readonly hostRef = inject(ElementRef<HTMLElement>);

  readonly scrolled = signal(false);
  readonly mobileNavOpen = signal(false);
  readonly signInModalOpen = signal(false);
  readonly profileMenuOpen = signal(false);

  private observer: IntersectionObserver | null = null;

  readonly Math = Math;

  // Icons
  readonly ArrowRightIcon = ArrowRight;
  readonly ShieldIcon = ShieldCheck;
  readonly BrainIcon = BrainCircuit;
  readonly ShareIcon = Share2;
  readonly BotIcon = Bot;
  readonly FingerprintIcon = Fingerprint;
  readonly SlidersIcon = SlidersHorizontal;
  readonly SwordsIcon = Swords;
  readonly SparklesIcon = Sparkles;
  readonly ActivityIcon = Activity;
  readonly AlertIcon = ShieldAlert;
  readonly MenuIcon = Menu;
  readonly CloseIcon = X;
  readonly LayersIcon = Layers;
  readonly ServerIcon = Server;
  readonly CpuIcon = Cpu;
  readonly DbIcon = Database;
  readonly CheckIcon = CheckCircle2;
  readonly ZapIcon = Zap;
  readonly LogOutIcon = LogOut;
  readonly ChevronDownIcon = ChevronDown;
  readonly SettingsIcon = Settings;

  readonly kpis = this.store.kpis;
  readonly previewTxns = computed(() => this.store.transactions().slice(0, 4));
  readonly previewAlerts = computed(() => this.store.alerts().slice(0, 3));

  readonly sampleExplainTxn = computed(
    () => this.store.transactions().find((t) => t.id === 'TXN-4821') ?? this.store.transactions()[0]
  );

  readonly riskDonutOption = computed<EChartsOption>(() => {
    const txns = this.store.transactions();
    const low = txns.filter((t) => t.prediction.riskLevel === 'low').length;
    const med = txns.filter((t) => t.prediction.riskLevel === 'medium').length;
    const high = txns.filter((t) => t.prediction.riskLevel === 'high').length;
    const crit = txns.filter((t) => t.prediction.riskLevel === 'critical').length;

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: '#151626',
        borderColor: 'rgba(168,85,247,0.35)',
        textStyle: { color: '#F8FAFC', fontSize: 12 },
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#A1A1AA', fontSize: 10 },
        itemWidth: 10,
        itemHeight: 10,
      },
      series: [
        {
          type: 'pie',
          radius: ['54%', '76%'],
          center: ['50%', '43%'],
          label: { show: false },
          data: [
            { value: low, name: 'Low', itemStyle: { color: '#10B981' } },
            { value: med, name: 'Medium', itemStyle: { color: '#A855F7' } },
            { value: high, name: 'High', itemStyle: { color: '#F59E0B' } },
            { value: crit, name: 'Critical', itemStyle: { color: '#EF4444' } },
          ],
        },
      ],
    };
  });

  readonly features = [
    {
      title: 'AI Fraud Detection',
      description:
        'Real-time ensemble scoring combining behavioral RFM signals, sequence models, and millisecond risk classification.',
      icon: this.ZapIcon,
      accent: 'from-purple-500/20 to-fuchsia-500/5',
    },
    {
      title: 'Explainable AI',
      description:
        'Transparent SHAP-style feature attributions and plain-English reason codes so analysts trust every alert.',
      icon: this.BrainIcon,
      accent: 'from-fuchsia-500/20 to-pink-500/5',
    },
    {
      title: 'Fraud Network Intelligence',
      description:
        'Interactive entity-link graphs uncovering mule account rings, shared devices, and coordinated laundering chains.',
      icon: this.ShareIcon,
      accent: 'from-violet-500/20 to-indigo-500/5',
    },
    {
      title: 'AI Investigation Copilot',
      description:
        'Context-aware investigation assistant that synthesizes evidence, linked accounts, and compliance briefs on demand.',
      icon: this.BotIcon,
      accent: 'from-purple-500/20 to-cyan-500/5',
    },
    {
      title: 'Behavioral Intelligence',
      description:
        'Consent-based pointer trajectory and keystroke cadence telemetry to surface account takeover and bot anomalies.',
      icon: this.FingerprintIcon,
      accent: 'from-pink-500/20 to-purple-500/5',
    },
    {
      title: 'Adaptive Risk Analysis',
      description:
        'Live precision-recall threshold tuning, PSI drift monitoring, and privacy-preserving federated learning.',
      icon: this.SlidersIcon,
      accent: 'from-fuchsia-500/20 to-violet-500/5',
    },
  ];

  readonly workflowSteps = [
    { step: '01', title: 'Transaction Ingestion', detail: 'Streaming payment & device telemetry captured in real time.' },
    { step: '02', title: 'Machine Learning Analysis', detail: 'Ensemble models score fraud probability in milliseconds.' },
    { step: '03', title: 'Explainable Risk Assessment', detail: 'SHAP attributions & AI reason codes explain the score.' },
    { step: '04', title: 'Fraud Network Analysis', detail: 'Graph topology detects mule rings & shared fingerprints.' },
    { step: '05', title: 'AI-Assisted Investigation', detail: 'Copilot correlates similar cases and entity histories.' },
    { step: '06', title: 'Analyst Decision', detail: 'Approve, block, or escalate with full audit trail.' },
  ];

  readonly attackScenarios = [
    {
      id: 'card_testing' as const,
      title: 'Card Testing Burst',
      tag: 'Velocity Attack',
      description:
        'Simulates rapid-fire micro-charges and failed authorization probes within seconds before escalating to high-value checkout.',
      highlights: ['Sub-3s burst cadence', 'Repeated BIN probing', 'Auto-block escalation'],
    },
    {
      id: 'account_takeover' as const,
      title: 'Account Takeover',
      tag: 'Session Hijack',
      description:
        'Simulates impossible travel login paired with an unseen headless device fingerprint and high-value outbound wire.',
      highlights: ['Impossible travel alert', 'New device + proxy', 'Behavioral deviation'],
    },
    {
      id: 'money_laundering' as const,
      title: 'Money Laundering Ring',
      tag: 'Graph Layering',
      description:
        'Simulates illicit funds splitting across connected mule accounts and converging into an offshore settlement hub.',
      highlights: ['Multi-hop mule chain', 'Shared device cluster', 'Live graph injection'],
    },
  ];

  readonly techStack = [
    {
      layer: 'Frontend',
      items: ['Angular', 'TypeScript', 'Tailwind CSS'],
      icon: this.LayersIcon,
    },
    {
      layer: 'Backend Architecture',
      items: ['Node.js', 'Express'],
      icon: this.ServerIcon,
    },
    {
      layer: 'ML Inference',
      items: ['Python', 'FastAPI', 'Pretrained Fraud Detection Model'],
      icon: this.CpuIcon,
    },
    {
      layer: 'Intelligence',
      items: ['SHAP', 'NetworkX', 'LLM-Powered Investigation'],
      icon: this.BrainIcon,
    },
    {
      layer: 'Data & Visualization',
      items: ['MongoDB', 'ECharts', 'Cytoscape.js'],
      icon: this.DbIcon,
    },
  ];

  ngOnInit(): void {
    this.txnService.startLiveStream();
  }

  ngAfterViewInit(): void {
    const sections = this.hostRef.nativeElement.querySelectorAll('.reveal-section');
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            this.observer?.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12 }
    );
    sections.forEach((el: Element) => this.observer?.observe(el));
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.scrolled.set(window.scrollY > 24);
  }

  scrollTo(sectionId: string): void {
    this.mobileNavOpen.set(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  launchScenario(scenarioId: 'card_testing' | 'account_takeover' | 'money_laundering'): void {
    this.router.navigate(['/app/simulator'], { queryParams: { scenario: scenarioId } });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
