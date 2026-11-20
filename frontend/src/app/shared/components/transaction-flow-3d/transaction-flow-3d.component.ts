import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import * as THREE from 'three';
import {
  LucideAngularModule,
  ShieldAlert,
  ShieldCheck,
  RotateCcw,
  X,
  CreditCard,
  Banknote,
  Send,
  Plane,
  Building,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Play,
  Pause,
  Gauge,
  Sparkles,
} from 'lucide-angular';

export interface FlowTransactionInput {
  senderBank: string;
  senderAccount: string;
  senderName?: string;
  receiverBank: string;
  recipientAccount: string;
  recipientName?: string;
  amount: number;
  currency: string;
  type: string;
  isFraud?: boolean;
  score?: number;
  decision?: 'Blocked' | 'Approved' | 'Flagged for Review' | 'Failed';
  reasons?: string[];
  latency?: number;
  alertNotification?: string;
}

@Component({
  selector: 'app-transaction-flow-3d',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="relative w-full rounded-2xl overflow-hidden border border-white/10 bg-[#070913] select-none font-sans text-zinc-100">
      
      <!-- Top Action Bar (Intuitive & User-Friendly) -->
      <div class="absolute top-0 inset-x-0 z-20 bg-[#070913]/95 border-b border-white/8 backdrop-blur-md px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        
        <!-- Left Title & Human-Friendly Status -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-zinc-300">
            <lucide-icon [img]="PlaneIcon" class="w-5 h-5 text-zinc-200" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-sm font-bold text-white tracking-wide">Live 3D Money Flight Simulation</h3>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                [ngClass]="{
                  'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30': currentPhase() === 'settled',
                  'bg-red-500/20 text-red-300 border border-red-500/30': currentPhase() === 'intercepted',
                  'bg-white/10 text-zinc-300 border border-white/15': currentPhase() !== 'settled' && currentPhase() !== 'intercepted' && currentPhase() !== 'idle',
                  'bg-zinc-800 text-zinc-400': currentPhase() === 'idle'
                }">
                <span class="w-2 h-2 rounded-full"
                  [ngClass]="{
                    'bg-emerald-400': currentPhase() === 'settled',
                    'bg-red-400': currentPhase() === 'intercepted',
                    'bg-zinc-300': currentPhase() !== 'settled' && currentPhase() !== 'intercepted' && currentPhase() !== 'idle',
                    'bg-zinc-500': currentPhase() === 'idle'
                  }"></span>
                {{ statusText() }}
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">
              <span>{{ currentData.senderBank }}</span>
              <span class="text-zinc-600 mx-1">&rarr;</span>
              <span class="text-zinc-300">AI Fraud Shield</span>
              <span class="text-zinc-600 mx-1">&rarr;</span>
              <span class="text-emerald-400">{{ currentData.receiverBank }}</span>
            </p>
          </div>
        </div>

        <!-- Right Quick Action Buttons -->
        <div class="flex items-center gap-2 shrink-0 flex-wrap">
          
          <!-- Speed Controller: Slow, Normal, Fast -->
          <div class="flex items-center bg-black/50 border border-white/10 rounded-xl p-0.5 text-xs font-mono">
            <button
              type="button"
              (click)="setSpeed(0.0011)"
              class="px-2.5 py-1 rounded-lg transition-all"
              [ngClass]="simSpeed() === 0.0011 ? 'bg-purple-600 text-white font-bold shadow' : 'text-zinc-400 hover:text-white'">
              Cinematic Slow
            </button>
            <button
              type="button"
              (click)="setSpeed(0.0024)"
              class="px-2.5 py-1 rounded-lg transition-all"
              [ngClass]="simSpeed() === 0.0024 ? 'bg-purple-600 text-white font-bold shadow' : 'text-zinc-400 hover:text-white'">
              Normal
            </button>
          </div>

          <button
            type="button"
            (click)="triggerScenario(true)"
            title="Simulate someone stealing card and trying to transfer money"
            class="px-3.5 py-2 rounded-xl bg-red-600/25 hover:bg-red-600/40 border border-red-500/40 text-xs font-bold text-red-200 transition-all flex items-center gap-2 shadow-lg">
            <lucide-icon [img]="ShieldAlertIcon" class="w-4 h-4 text-red-400" />
            <span>Simulate Stolen Card ($4,800)</span>
          </button>

          <button
            type="button"
            (click)="triggerScenario(false)"
            title="Simulate normal everyday money remittance"
            class="px-3.5 py-2 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 border border-emerald-500/40 text-xs font-bold text-emerald-200 transition-all flex items-center gap-2 shadow-lg">
            <lucide-icon [img]="ShieldCheckIcon" class="w-4 h-4 text-emerald-400" />
            <span>Simulate Safe Transfer ($850)</span>
          </button>

          <button
            type="button"
            (click)="togglePlayPause()"
            title="Play / Pause"
            class="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-all">
            <lucide-icon [img]="isPlaying() ? PauseIcon : PlayIcon" class="w-4 h-4" />
          </button>

          <button
            type="button"
            (click)="replay()"
            title="Replay Transaction Flight"
            class="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 transition-all">
            <lucide-icon [img]="RotateIcon" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- 3D Canvas Viewport -->
      <div #canvasContainer class="relative w-full h-[560px] sm:h-[640px] cursor-grab active:cursor-grabbing"></div>

      <!-- Clear, User-Friendly Result Card (Bottom-Right) -->
      @if (showDetectionOverlay()) {
        <div class="absolute bottom-20 right-4 sm:right-6 z-30 max-w-[360px] sm:max-w-md w-[calc(100%-2rem)] pointer-events-auto animate-pop-in">
          <div class="p-5 rounded-2xl backdrop-blur-2xl border shadow-2xl space-y-3.5"
            [ngClass]="currentData.isFraud
              ? 'bg-[#150608]/95 border-red-500/50'
              : 'bg-[#05150c]/95 border-emerald-500/50'">
            
            <!-- Result Header -->
            <div class="flex items-start justify-between gap-3 pb-3 border-b border-white/10">
              <div class="flex items-center gap-3">
                <div class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-inner"
                  [ngClass]="currentData.isFraud ? 'bg-red-500/25 text-red-300 border border-red-500/40' : 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'">
                  <lucide-icon [img]="currentData.isFraud ? AlertOctagonIcon : CheckCircle2Icon" class="w-6 h-6" />
                </div>
                <div>
                  <h4 class="text-sm font-extrabold text-white">
                    {{ currentData.isFraud ? '🚨 FRAUD ATTACK STOPPED!' : '✅ TRANSFER SUCCESSFUL!' }}
                  </h4>
                  <p class="text-xs text-zinc-300 mt-0.5">
                    Amount: <strong class="text-white text-sm">{{ currentData.amount | currency: currentData.currency : 'symbol' : '1.0-0' }}</strong>
                  </p>
                </div>
              </div>

              <!-- Close Button -->
              <button
                type="button"
                (click)="dismissOverlay()"
                class="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-zinc-400 hover:text-white transition-all">
                <lucide-icon [img]="CloseIcon" class="w-4 h-4" />
              </button>
            </div>

            <!-- Plain English Human Explanation -->
            <div class="space-y-2 text-xs leading-relaxed">
              @if (currentData.isFraud) {
                <div class="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 space-y-1">
                  <div class="font-bold text-red-300 flex items-center gap-1.5">
                    <span>Why was this blocked?</span>
                  </div>
                  <p class="text-zinc-300">
                    A thief changed the account password 40 seconds ago and immediately tried to wire <strong>$4,800.00</strong>.
                  </p>
                </div>
                <div class="p-3 rounded-xl bg-red-950/50 border border-red-500/30 text-red-200 space-y-1">
                  <div class="font-bold text-emerald-400 flex items-center gap-1.5">
                    <span>Protection Outcome</span>
                  </div>
                  <p class="text-zinc-300">
                    <strong>Zero money lost.</strong> The transfer was frozen in mid-flight before funds left the bank.
                  </p>
                </div>
              } @else {
                <div class="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 space-y-1">
                  <div class="font-bold text-emerald-300 flex items-center gap-1.5">
                    <span>Why was this approved?</span>
                  </div>
                  <p class="text-zinc-300">
                    Normal everyday transfer pattern. Matches the customer's regular salary remittance history.
                  </p>
                </div>
                <div class="p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/30 text-emerald-200 space-y-1">
                  <div class="font-bold text-emerald-300 flex items-center gap-1.5">
                    <span>Arrival Confirmation</span>
                  </div>
                  <p class="text-zinc-300">
                    <strong>$850.00</strong> safely arrived in the recipient bank vault in under 10 milliseconds.
                  </p>
                </div>
              }
            </div>

            <!-- Dismiss footer -->
            <div class="pt-2 flex justify-end">
              <button
                type="button"
                (click)="dismissOverlay()"
                class="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition-all">
                Dismiss
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Minimized Inspection Pill (Shown when card is dismissed) -->
      @if (!showDetectionOverlay() && (currentPhase() === 'intercepted' || currentPhase() === 'settled')) {
        <button
          type="button"
          (click)="showDetectionOverlay.set(true)"
          class="absolute bottom-20 right-4 z-30 px-4 py-2 rounded-full border shadow-xl backdrop-blur-md text-xs font-bold flex items-center gap-2 animate-pop-in"
          [ngClass]="currentData.isFraud
            ? 'bg-red-600/90 border-red-400 text-white hover:bg-red-500'
            : 'bg-emerald-600/90 border-emerald-400 text-white hover:bg-emerald-500'">
          <lucide-icon [img]="currentData.isFraud ? ShieldAlertIcon : ShieldCheckIcon" class="w-4 h-4" />
          <span>{{ currentData.isFraud ? 'View Why Transfer Was Blocked' : 'View Transfer Receipt' }}</span>
        </button>
      }

      <!-- Bottom Step Tracker (Simple, Recognizable Icons) -->
      <div class="absolute bottom-3 inset-x-4 sm:inset-x-6 z-20 pointer-events-none">
        <div class="p-2 sm:p-2.5 rounded-xl bg-[#080a18]/95 border border-white/10 backdrop-blur-md shadow-xl pointer-events-auto flex items-center justify-between gap-2 text-xs font-semibold">
          
          <div class="flex items-center gap-2 flex-1 justify-center py-1 rounded-lg border transition-all"
            [ngClass]="progressPercent() >= 5 ? 'bg-purple-950/40 border-purple-500/40 text-purple-200' : 'bg-black/20 border-white/5 text-zinc-500'">
            <lucide-icon [img]="CreditCardIcon" class="w-4 h-4" />
            <span class="hidden sm:inline">1. Card Swiped</span>
          </div>

          <span class="text-zinc-600">&rarr;</span>

          <div class="flex items-center gap-2 flex-1 justify-center py-1 rounded-lg border transition-all"
            [ngClass]="progressPercent() >= 30 ? 'bg-purple-950/40 border-purple-500/40 text-purple-200' : 'bg-black/20 border-white/5 text-zinc-500'">
            <lucide-icon [img]="PlaneIcon" class="w-4 h-4" />
            <span class="hidden sm:inline">2. Money in Flight</span>
          </div>

          <span class="text-zinc-600">&rarr;</span>

          <div class="flex items-center gap-2 flex-1 justify-center py-1 rounded-lg border transition-all"
            [ngClass]="progressPercent() >= 50 ? 'bg-purple-950/40 border-purple-500/40 text-purple-200' : 'bg-black/20 border-white/5 text-zinc-500'">
            <lucide-icon [img]="ShieldCheckIcon" class="w-4 h-4" />
            <span class="hidden sm:inline">3. AI Fraud Scan</span>
          </div>

          <span class="text-zinc-600">&rarr;</span>

          <div class="flex items-center gap-2 flex-1 justify-center py-1 rounded-lg border transition-all"
            [ngClass]="progressPercent() >= 90 ? (currentData.isFraud ? 'bg-red-950/60 border-red-500 text-red-200' : 'bg-emerald-950/60 border-emerald-500 text-emerald-200') : 'bg-black/20 border-white/5 text-zinc-500'">
            <lucide-icon [img]="currentData.isFraud ? AlertOctagonIcon : BuildingIcon" class="w-4 h-4" />
            <span class="hidden sm:inline">{{ currentData.isFraud ? '4. Blocked & Saved' : '4. In Bank Vault' }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes popIn {
      0% { opacity: 0; transform: scale(0.92) translateY(10px); }
      100% { opacity: 1; transform: scale(1) translateY(0); }
    }
    .animate-pop-in {
      animation: popIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
    }
  `]
})
export class TransactionFlow3dComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild('canvasContainer', { static: true }) canvasContainer!: ElementRef<HTMLDivElement>;

  @Input() transactionData?: FlowTransactionInput;

  // Icons
  readonly ShieldAlertIcon = ShieldAlert;
  readonly ShieldCheckIcon = ShieldCheck;
  readonly RotateIcon = RotateCcw;
  readonly CloseIcon = X;
  readonly CreditCardIcon = CreditCard;
  readonly BanknoteIcon = Banknote;
  readonly SendIcon = Send;
  readonly PlaneIcon = Plane;
  readonly BuildingIcon = Building;
  readonly CheckCircle2Icon = CheckCircle2;
  readonly AlertOctagonIcon = AlertOctagon;
  readonly ArrowRightIcon = ArrowRight;
  readonly PlayIcon = Play;
  readonly PauseIcon = Pause;

  // State
  readonly isPlaying = signal<boolean>(true);
  readonly currentPhase = signal<'idle' | 'in_flight' | 'scanning' | 'intercepted' | 'settled'>('idle');
  readonly progressPercent = signal<number>(0);
  readonly showDetectionOverlay = signal<boolean>(false);
  readonly simSpeed = signal<number>(0.0011); // Deliberate cinematic slow default!

  readonly statusText = computed(() => {
    switch (this.currentPhase()) {
      case 'in_flight': return 'Plane In Flight With Money';
      case 'scanning': return 'AI Scanning Transaction in Mid-Air';
      case 'intercepted': return 'FRAUD INTERCEPTED & BLOCKED';
      case 'settled': return 'MONEY SAFELY DELIVERED';
      default: return 'Ready for Transfer';
    }
  });

  currentData: FlowTransactionInput = {
    senderBank: 'Aegis Capital Bank',
    senderAccount: 'ACC-AEGIS-90412',
    receiverBank: 'Apex Global Bank',
    recipientAccount: 'ACC-APEX-44109',
    amount: 4800,
    currency: 'USD',
    type: 'Wire Transfer',
    isFraud: true,
    score: 87,
    decision: 'Blocked',
    latency: 7.8,
  };

  // Three.js Objects
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private animFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Real 3D Physical Elements
  private flightSpline!: THREE.CatmullRomCurve3;
  private airplaneGroup!: THREE.Group;
  private moneyBundleMesh!: THREE.Mesh;
  private senderBankGroup!: THREE.Group;
  private receiverBankGroup!: THREE.Group;
  private creditCardMesh!: THREE.Mesh;
  private aiScannerShieldGroup!: THREE.Group;
  private redStopBarrier!: THREE.Mesh;
  private vaultCoinsGroup!: THREE.Group;
  private engineContrails: THREE.Points[] = [];
  private runwayLights: THREE.Mesh[] = [];
  private cloudsGroup!: THREE.Group;
  private navLights: { red: THREE.PointLight; green: THREE.PointLight; white: THREE.PointLight } | null = null;

  // Animation values
  private animProgress = 0;
  private isMouseDragging = false;
  private previousMousePosition = { x: 0, y: 0 };
  private cameraTarget = new THREE.Vector3(0, 0, 0);
  private cameraTargetPos = new THREE.Vector3(0, 11, 28);
  private cameraCurrentPos = new THREE.Vector3(0, 11, 28);

  ngOnInit(): void {
    if (this.transactionData) {
      this.currentData = { ...this.currentData, ...this.transactionData };
    }
    this.initThree();
    this.startAnimation();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['transactionData'] && this.transactionData) {
      this.currentData = { ...this.currentData, ...this.transactionData };
      this.replay();
    }
  }

  ngOnDestroy(): void {
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.renderer) this.renderer.dispose();
  }

  setSpeed(speed: number): void {
    this.simSpeed.set(speed);
  }

  togglePlayPause(): void {
    this.isPlaying.update((v) => !v);
  }

  triggerScenario(fraud: boolean): void {
    if (fraud) {
      this.currentData = {
        senderBank: 'Aegis Capital Bank',
        senderAccount: 'ACC-AEGIS-90412',
        receiverBank: 'Apex Global Bank',
        recipientAccount: 'ACC-APEX-44109',
        amount: 4800,
        currency: 'USD',
        type: 'Wire Transfer',
        isFraud: true,
        score: 87,
        decision: 'Blocked',
        latency: 7.8,
      };
    } else {
      this.currentData = {
        senderBank: 'Apex Global Bank',
        senderAccount: 'ACC-APEX-22901',
        receiverBank: 'Vanguard Crest Bank',
        recipientAccount: 'ACC-VANG-77142',
        amount: 850,
        currency: 'USD',
        type: 'Remittance',
        isFraud: false,
        score: 12,
        decision: 'Approved',
        latency: 6.4,
      };
    }
    this.replay();
  }

  replay(): void {
    this.animProgress = 0;
    this.showDetectionOverlay.set(false);
    this.currentPhase.set('in_flight');
    this.progressPercent.set(0);

    if (this.redStopBarrier) {
      this.redStopBarrier.visible = false;
      this.redStopBarrier.scale.set(0.1, 0.1, 0.1);
    }
  }

  dismissOverlay(): void {
    this.showDetectionOverlay.set(false);
  }

  private initThree(): void {
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 560;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x070913);
    this.scene.fog = new THREE.FogExp2(0x070913, 0.015);

    // 2. Camera: Auto-fit based on width
    const initZ = width < 640 ? 38 : width < 1024 ? 32 : 28;
    this.cameraTargetPos.set(0, 11, initZ);
    this.cameraCurrentPos.set(0, 11, initZ);

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    this.camera.position.copy(this.cameraCurrentPos);
    this.camera.lookAt(this.cameraTarget);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    container.appendChild(this.renderer.domElement);

    // 4. Lights: Crisp Professional Illumination (No Neon Glow)
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    this.scene.add(ambientLight);

    const sun = new THREE.DirectionalLight(0xffffff, 2.0);
    sun.position.set(15, 25, 20);
    this.scene.add(sun);

    const fillLight = new THREE.DirectionalLight(0x64748b, 0.7);
    fillLight.position.set(-15, 12, -10);
    this.scene.add(fillLight);

    // 5. Runway Grid: Crisp Blueprint Charcoal/Slate
    const grid = new THREE.GridHelper(60, 40, 0x334155, 0x0f172a);
    grid.position.y = -3.8;
    this.scene.add(grid);

    // 6. Build the Realistic Physical Elements:
    this.buildFlightPath();
    this.buildRunwaysAndApproachLights();
    this.buildClouds();
    this.buildBankBuilding('sender', -15, 'SENDER BANK', 0x7c3aed);
    this.buildCreditCard();
    this.buildAirplaneAndCashCarrier();
    this.buildAiShieldScanner();
    this.buildBankBuilding('receiver', 15, 'RECEIVER BANK', 0x10b981);
    this.buildVaultWithGoldCoins();
    this.buildRedStopSign();

    // 7. Mouse Orbit
    this.setupMouseEvents(container);

    // 8. Resize Observer
    this.resizeObserver = new ResizeObserver(() => this.onResize());
    this.resizeObserver.observe(container);

    this.replay();
  }

  private buildFlightPath(): void {
    const points = [
      new THREE.Vector3(-14, 0.5, 0),
      new THREE.Vector3(-7, 3.5, 0),
      new THREE.Vector3(0, 3.8, 0),
      new THREE.Vector3(7, 3.5, 0),
      new THREE.Vector3(14, 0.5, 0),
    ];
    this.flightSpline = new THREE.CatmullRomCurve3(points);

    // Luminous flight arc path
    const tubeGeo = new THREE.TubeGeometry(this.flightSpline, 64, 0.08, 8, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: 0.65,
    });
    this.scene.add(new THREE.Mesh(tubeGeo, tubeMat));
  }

  private buildRunwaysAndApproachLights(): void {
    // Left & Right Asphalt Runways with Center Lines
    [-15, 15].forEach((x) => {
      const rwGeo = new THREE.BoxGeometry(6.0, 0.08, 2.2);
      const rwMat = new THREE.MeshStandardMaterial({ color: 0x181c2b, roughness: 0.8 });
      const rw = new THREE.Mesh(rwGeo, rwMat);
      rw.position.set(x, -1.45, 0);
      this.scene.add(rw);

      // Blinking Runway Approach Lights
      for (let i = 0; i < 6; i++) {
        const lightGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.15, 8);
        const lightMat = new THREE.MeshBasicMaterial({ color: x < 0 ? 0x38bdf8 : 0x10b981 });
        const lightMesh = new THREE.Mesh(lightGeo, lightMat);
        lightMesh.position.set(x - 2.5 + i * 1.0, -1.35, 1.2);
        this.runwayLights.push(lightMesh);
        this.scene.add(lightMesh);
      }
    });
  }

  private buildClouds(): void {
    // Soft atmospheric clouds in the sky
    this.cloudsGroup = new THREE.Group();
    const cloudGeo = new THREE.DodecahedronGeometry(1.2, 1);
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.9,
      transparent: true,
      opacity: 0.45,
    });

    const positions = [
      new THREE.Vector3(-9, 5.0, -3),
      new THREE.Vector3(-3, 6.2, -4),
      new THREE.Vector3(4, 5.5, -3.5),
      new THREE.Vector3(10, 4.8, -4),
    ];

    positions.forEach((pos, i) => {
      const cloud = new THREE.Mesh(cloudGeo, cloudMat);
      cloud.position.copy(pos);
      cloud.scale.set(1.5, 0.8, 1.2);
      this.cloudsGroup.add(cloud);
    });

    this.scene.add(this.cloudsGroup);
  }

  private buildBankBuilding(type: 'sender' | 'receiver', xPos: number, label: string, accentColor: number): void {
    const group = new THREE.Group();
    group.position.set(xPos, 0, 0);

    // 1. Classical Bank Base Steps
    const stepsGeo = new THREE.BoxGeometry(4.4, 0.6, 3.4);
    const marbleMat = new THREE.MeshStandardMaterial({ color: 0x1e2238, roughness: 0.3, metalness: 0.8 });
    const steps = new THREE.Mesh(stepsGeo, marbleMat);
    steps.position.y = -1.2;
    group.add(steps);

    // 2. Pillars (4 Classical Bank Columns)
    const pillarMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.2, metalness: 0.2 });
    for (let i = 0; i < 4; i++) {
      const pX = -1.5 + i * 1.0;
      const pillarGeo = new THREE.CylinderGeometry(0.18, 0.22, 2.2, 16);
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(pX, 0.2, 1.2);
      group.add(pillar);
    }

    // 3. Bank Back Wall & Front Door
    const wallGeo = new THREE.BoxGeometry(4.0, 2.2, 1.8);
    const wallMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 0.2, 0);
    group.add(wall);

    // 4. Roof Pediment (Classical Triangular Gable)
    const pedimentGeo = new THREE.ConeGeometry(2.8, 1.2, 4);
    const roofMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.2, metalness: 0.7 });
    const roof = new THREE.Mesh(pedimentGeo, roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, 1.9, 0.6);
    group.add(roof);

    // 5. Bank Header Neon Sign
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 128;
    const ctx = signCanvas.getContext('2d')!;
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 512, 128);
    ctx.strokeStyle = type === 'sender' ? '#a855f7' : '#10b981';
    ctx.lineWidth = 8;
    ctx.strokeRect(4, 4, 504, 120);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 42px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, 256, 76);

    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.7, 0.1),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.2 })
    );
    signMesh.position.set(0, 1.4, 1.3);
    group.add(signMesh);

    if (type === 'sender') this.senderBankGroup = group;
    else this.receiverBankGroup = group;

    this.scene.add(group);
  }

  private buildCreditCard(): void {
    const cardCanvas = document.createElement('canvas');
    cardCanvas.width = 512;
    cardCanvas.height = 320;
    const ctx = cardCanvas.getContext('2d')!;

    const grad = ctx.createLinearGradient(0, 0, 512, 320);
    grad.addColorStop(0, '#312e81');
    grad.addColorStop(1, '#581c87');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 320);

    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(40, 70, 70, 55);
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 70, 70, 55);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('AEGIS PLATINUM', 40, 50);

    ctx.font = 'bold 30px monospace';
    ctx.fillText('•••• •••• •••• 4821', 40, 180);

    ctx.font = '18px monospace';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText('CARDHOLDER: MAYA LIN', 40, 230);
    ctx.fillText('VALID THRU: 12/29', 40, 260);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
    ctx.beginPath();
    ctx.arc(410, 250, 30, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
    ctx.beginPath();
    ctx.arc(445, 250, 30, 0, Math.PI * 2);
    ctx.fill();

    const cardTex = new THREE.CanvasTexture(cardCanvas);
    const cardGeo = new THREE.BoxGeometry(2.4, 1.5, 0.05);
    const cardMat = new THREE.MeshStandardMaterial({ map: cardTex, roughness: 0.2, metalness: 0.6 });

    this.creditCardMesh = new THREE.Mesh(cardGeo, cardMat);
    this.creditCardMesh.position.set(-14, 0.8, 1.8);
    this.creditCardMesh.rotation.y = Math.PI / 8;
    this.scene.add(this.creditCardMesh);
  }

  private buildAirplaneAndCashCarrier(): void {
    this.airplaneGroup = new THREE.Group();

    // 1. Sleek Jet Fuselage
    const bodyGeo = new THREE.CylinderGeometry(0.28, 0.15, 2.4, 16);
    const planeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, metalness: 0.8, roughness: 0.2 });
    const body = new THREE.Mesh(bodyGeo, planeMat);
    body.rotation.x = Math.PI / 2;
    this.airplaneGroup.add(body);

    // 2. Jet Nose
    const noseGeo = new THREE.ConeGeometry(0.28, 0.7, 16);
    const nose = new THREE.Mesh(noseGeo, planeMat);
    nose.rotation.x = -Math.PI / 2;
    nose.position.z = 1.5;
    this.airplaneGroup.add(nose);

    // 3. Swept Wings
    const wingGeo = new THREE.BoxGeometry(3.6, 0.06, 0.8);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x7e22ce, metalness: 0.6, roughness: 0.2 });
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(0, 0, 0.2);
    this.airplaneGroup.add(wing);

    // 4. Tail Fin
    const finGeo = new THREE.BoxGeometry(0.06, 0.8, 0.6);
    const fin = new THREE.Mesh(finGeo, wingMat);
    fin.position.set(0, 0.45, -1.0);
    this.airplaneGroup.add(fin);

    // 5. Twin Jet Engines under Wings
    const engGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.7, 12);
    const engMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 });
    [-1.0, 1.0].forEach((x) => {
      const eng = new THREE.Mesh(engGeo, engMat);
      eng.rotation.x = Math.PI / 2;
      eng.position.set(x, -0.2, 0.1);
      this.airplaneGroup.add(eng);

      // Jet exhaust contrails
      const contrailGeo = new THREE.BufferGeometry();
      const pos = new Float32Array(30 * 3);
      for (let p = 0; p < 30; p++) {
        pos[p * 3] = x + (Math.random() - 0.5) * 0.1;
        pos[p * 3 + 1] = -0.2 + (Math.random() - 0.5) * 0.1;
        pos[p * 3 + 2] = -0.4 - (p * 0.12);
      }
      contrailGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
      const contrailMat = new THREE.PointsMaterial({
        color: 0x38bdf8,
        size: 0.12,
        transparent: true,
        opacity: 0.75,
        blending: THREE.AdditiveBlending,
      });
      const contrail = new THREE.Points(contrailGeo, contrailMat);
      this.engineContrails.push(contrail);
      this.airplaneGroup.add(contrail);
    });

    // 6. Navigation Strobe Lights (Red Port, Green Starboard, White Tail)
    const redLight = new THREE.PointLight(0xef4444, 2, 4);
    redLight.position.set(-1.8, 0, 0.2);
    this.airplaneGroup.add(redLight);

    const greenLight = new THREE.PointLight(0x10b981, 2, 4);
    greenLight.position.set(1.8, 0, 0.2);
    this.airplaneGroup.add(greenLight);

    const whiteLight = new THREE.PointLight(0xffffff, 2, 5);
    whiteLight.position.set(0, 0.8, -1.0);
    this.airplaneGroup.add(whiteLight);

    this.navLights = { red: redLight, green: greenLight, white: whiteLight };

    // 7. REAL 3D MONEY BUNDLE (Cash Stacks strapped to the transfer vehicle)
    const cashCanvas = document.createElement('canvas');
    cashCanvas.width = 256;
    cashCanvas.height = 128;
    const cctx = cashCanvas.getContext('2d')!;
    cctx.fillStyle = '#15803d'; // US Dollar green
    cctx.fillRect(0, 0, 256, 128);
    cctx.strokeStyle = '#166534';
    cctx.lineWidth = 6;
    cctx.strokeRect(3, 3, 250, 122);
    cctx.fillStyle = '#fef08a';
    cctx.fillRect(100, 0, 56, 128);
    cctx.fillStyle = '#000000';
    cctx.font = 'bold 36px sans-serif';
    cctx.textAlign = 'center';
    cctx.fillText('$', 128, 75);

    const cashTex = new THREE.CanvasTexture(cashCanvas);
    const moneyGeo = new THREE.BoxGeometry(1.2, 0.4, 0.7);
    const moneyMat = new THREE.MeshStandardMaterial({ map: cashTex, roughness: 0.5 });
    this.moneyBundleMesh = new THREE.Mesh(moneyGeo, moneyMat);
    this.moneyBundleMesh.position.set(0, -0.4, 0);
    this.airplaneGroup.add(this.moneyBundleMesh);

    this.scene.add(this.airplaneGroup);
  }

  private buildAiShieldScanner(): void {
    this.aiScannerShieldGroup = new THREE.Group();
    this.aiScannerShieldGroup.position.set(0, 3.8, 0);

    const shieldGeo = new THREE.TorusGeometry(1.8, 0.08, 16, 48);
    const shieldMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const ring = new THREE.Mesh(shieldGeo, shieldMat);
    this.aiScannerShieldGroup.add(ring);

    const planeGeo = new THREE.CircleGeometry(1.7, 32);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const laserDisc = new THREE.Mesh(planeGeo, planeMat);
    this.aiScannerShieldGroup.add(laserDisc);

    this.scene.add(this.aiScannerShieldGroup);
  }

  private buildRedStopSign(): void {
    const stopCanvas = document.createElement('canvas');
    stopCanvas.width = 256;
    stopCanvas.height = 256;
    const ctx = stopCanvas.getContext('2d')!;
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.arc(128, 128, 120, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 12;
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 54px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('STOP', 128, 120);
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('FRAUD', 128, 165);

    const stopTex = new THREE.CanvasTexture(stopCanvas);
    const stopGeo = new THREE.CylinderGeometry(1.8, 1.8, 0.1, 32);
    const stopMat = new THREE.MeshStandardMaterial({ map: stopTex, roughness: 0.2, metalness: 0.4 });

    this.redStopBarrier = new THREE.Mesh(stopGeo, stopMat);
    this.redStopBarrier.rotation.x = Math.PI / 2;
    this.redStopBarrier.position.set(1.5, 3.8, 0);
    this.redStopBarrier.visible = false;

    this.scene.add(this.redStopBarrier);
  }

  private buildVaultWithGoldCoins(): void {
    this.vaultCoinsGroup = new THREE.Group();
    this.vaultCoinsGroup.position.set(15, 0.5, 1.6);

    const coinMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.9, roughness: 0.1 });
    for (let c = 0; c < 3; c++) {
      for (let h = 0; h < 6; h++) {
        const coin = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 16), coinMat);
        coin.position.set((c - 1) * 0.8, h * 0.11, 0);
        this.vaultCoinsGroup.add(coin);
      }
    }

    this.scene.add(this.vaultCoinsGroup);
  }

  private setupMouseEvents(container: HTMLElement): void {
    container.addEventListener('mousedown', (e) => {
      this.isMouseDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isMouseDragging) return;
      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      const offset = new THREE.Vector3().subVectors(this.camera.position, this.cameraTarget);
      const radius = offset.length();

      let theta = Math.atan2(offset.x, offset.z);
      let phi = Math.atan2(Math.sqrt(offset.x * offset.x + offset.z * offset.z), offset.y);

      theta -= deltaX * 0.005;
      phi -= deltaY * 0.005;
      phi = Math.max(0.1, Math.min(Math.PI / 2 - 0.05, phi));

      this.cameraTargetPos.x = this.cameraTarget.x + radius * Math.sin(phi) * Math.sin(theta);
      this.cameraTargetPos.y = this.cameraTarget.y + radius * Math.cos(phi);
      this.cameraTargetPos.z = this.cameraTarget.z + radius * Math.sin(phi) * Math.cos(theta);

      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDragging = false;
    });

    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const offset = new THREE.Vector3().subVectors(this.camera.position, this.cameraTarget);
      const newLen = Math.max(10, Math.min(50, offset.length() + e.deltaY * 0.02));
      offset.setLength(newLen);
      this.cameraTargetPos.copy(this.cameraTarget).add(offset);
    }, { passive: false });
  }

  private onResize(): void {
    if (!this.canvasContainer || !this.renderer || !this.camera) return;
    const container = this.canvasContainer.nativeElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera.aspect = width / height;

    const zDist = width < 640 ? 38 : width < 1024 ? 32 : 28;
    this.cameraTargetPos.set(0, 11, zDist);

    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private startAnimation(): void {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);

      // Smooth camera interpolation
      this.cameraCurrentPos.lerp(this.cameraTargetPos, 0.06);
      this.camera.position.copy(this.cameraCurrentPos);
      this.camera.lookAt(this.cameraTarget);

      // Card hovering pulse
      if (this.creditCardMesh) {
        this.creditCardMesh.position.y = 0.8 + Math.sin(Date.now() * 0.002) * 0.06;
      }

      // Gold coins rotating
      if (this.vaultCoinsGroup) {
        this.vaultCoinsGroup.rotation.y += 0.008;
      }

      // AI Shield spinning
      if (this.aiScannerShieldGroup) {
        this.aiScannerShieldGroup.rotation.z += 0.008;
      }

      // Blink runway lights
      if (this.runwayLights.length > 0) {
        const time = Date.now() * 0.004;
        this.runwayLights.forEach((light, i) => {
          light.visible = Math.sin(time + i * 0.8) > -0.2;
        });
      }

      // Strobe aircraft navigation lights
      if (this.navLights) {
        const strobe = Math.sin(Date.now() * 0.008) > 0.6;
        this.navLights.white.intensity = strobe ? 3.5 : 0.5;
      }

      // Money flight animation
      if (this.isPlaying()) {
        this.updateTimeline();
      }

      this.renderer.render(this.scene, this.camera);
    };

    animate();
  }

  private updateTimeline(): void {
    const isFraud = this.currentData.isFraud ?? true;
    const speed = this.simSpeed();

    if (isFraud) {
      if (this.animProgress < 0.48) {
        this.animProgress += speed;
        const pt = this.flightSpline.getPointAt(this.animProgress);
        this.airplaneGroup.position.copy(pt);

        // Realistic Aircraft Banking into Curve
        const tangent = this.flightSpline.getTangentAt(this.animProgress);
        this.airplaneGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
        // Bank roll
        this.airplaneGroup.rotation.z = Math.sin(this.animProgress * Math.PI) * 0.25;

        this.progressPercent.set(Math.round(this.animProgress * 100));
        this.currentPhase.set(this.animProgress < 0.25 ? 'in_flight' : 'scanning');
      } else if (this.animProgress >= 0.48 && this.animProgress < 0.5) {
        this.animProgress = 0.5;
        this.currentPhase.set('intercepted');
        this.progressPercent.set(100);

        this.redStopBarrier.visible = true;
        this.redStopBarrier.scale.set(1, 1, 1);

        this.showDetectionOverlay.set(true);
      } else {
        // Intercepted hover state
        this.redStopBarrier.rotation.z += 0.01;
        this.airplaneGroup.position.y = 3.8 + Math.sin(Date.now() * 0.003) * 0.04;
      }
    } else {
      if (this.animProgress < 1.0) {
        this.animProgress += speed;
        const pt = this.flightSpline.getPointAt(this.animProgress);
        this.airplaneGroup.position.copy(pt);

        const tangent = this.flightSpline.getTangentAt(this.animProgress);
        this.airplaneGroup.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), tangent);
        // Bank roll
        this.airplaneGroup.rotation.z = Math.sin(this.animProgress * Math.PI) * 0.25;

        this.progressPercent.set(Math.round(this.animProgress * 100));

        if (this.animProgress < 0.35) {
          this.currentPhase.set('in_flight');
        } else if (this.animProgress >= 0.35 && this.animProgress <= 0.65) {
          this.currentPhase.set('scanning');
        } else {
          this.currentPhase.set('in_flight');
        }
      } else {
        this.animProgress = 1.0;
        this.currentPhase.set('settled');
        this.progressPercent.set(100);

        // Smooth landing at vault
        this.airplaneGroup.position.set(14, 0.5, 0);
        this.airplaneGroup.rotation.set(0, 0, 0);

        if (!this.showDetectionOverlay()) {
          this.showDetectionOverlay.set(true);
        }
      }
    }
  }
}
