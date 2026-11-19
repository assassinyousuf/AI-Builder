import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import cytoscape, { Core } from 'cytoscape';
import {
  LucideAngularModule,
  Share2,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FolderPlus,
  Sparkles,
  Network,
} from 'lucide-angular';
import { FraudStoreService } from '../../core/state/fraud-store.service';
import { GraphNode, GraphNodeType } from '../../core/models/fraud.models';

@Component({
  selector: 'app-fraud-network',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule],
  template: `
    <div class="space-y-5 animate-page-in">
      <!-- Header -->
      <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 class="font-display text-2xl sm:text-3xl font-bold tracking-tight gradient-text">
            Fraud Network Intelligence
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 mt-1">
            Interactive entity-link topology for mule networks, shared devices, and suspicious transfer chains
          </p>
        </div>

        <!-- Cluster Quick-Focus -->
        <div class="flex flex-wrap items-center gap-2">
          @for (c of clusters; track c.id) {
            <button
              type="button"
              (click)="focusCluster(c.id)"
              class="px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors"
              [ngClass]="
                activeCluster() === c.id
                  ? 'bg-purple-600/25 border-purple-500/50 text-white'
                  : 'bg-[#10111D] border-white/8 text-zinc-400 hover:text-white'
              "
            >
              {{ c.label }}
            </button>
          }
        </div>
      </div>

      <!-- Controls Bar -->
      <div class="fs-card p-3.5 flex flex-wrap items-center gap-3">
        <div class="relative flex-1 min-w-[200px]">
          <lucide-icon [img]="SearchIcon" class="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            [ngModel]="searchTerm()"
            (ngModelChange)="searchAndFocus($event)"
            placeholder="Search account, device, or merchant ID (e.g. ACC-77318)..."
            class="w-full pl-9 pr-3 py-2 rounded-xl bg-[#090A16] border border-white/8 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500/50"
          />
        </div>

        <select
          [ngModel]="entityFilter()"
          (ngModelChange)="filterEntityType($event)"
          class="px-3 py-2 rounded-xl bg-[#090A16] border border-white/8 text-xs text-zinc-200"
        >
          <option value="all">All Entities</option>
          <option value="suspicious_account">Suspicious Accounts</option>
          <option value="normal_account">Normal Accounts</option>
          <option value="device">Devices</option>
          <option value="merchant">Merchants</option>
        </select>

        <div class="flex items-center gap-1.5">
          <button type="button" (click)="zoom(1.2)" class="p-2 rounded-xl bg-[#090A16] border border-white/8 text-zinc-300 hover:text-white" title="Zoom In">
            <lucide-icon [img]="ZoomInIcon" class="w-4 h-4" />
          </button>
          <button type="button" (click)="zoom(0.8)" class="p-2 rounded-xl bg-[#090A16] border border-white/8 text-zinc-300 hover:text-white" title="Zoom Out">
            <lucide-icon [img]="ZoomOutIcon" class="w-4 h-4" />
          </button>
          <button type="button" (click)="fitGraph()" class="p-2 rounded-xl bg-[#090A16] border border-white/8 text-zinc-300 hover:text-white" title="Fit Graph">
            <lucide-icon [img]="FitIcon" class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Graph + Side Panel -->
      <div class="grid grid-cols-1 xl:grid-cols-12 gap-4">
        <!-- Cytoscape Canvas -->
        <div class="fs-card xl:col-span-8 relative overflow-hidden">
          <div #cyContainer class="w-full h-[540px] bg-[#070812]"></div>

          <!-- Legend -->
          <div class="absolute bottom-3 left-3 flex flex-wrap items-center gap-3 px-3 py-2 rounded-xl bg-[#090A16]/90 border border-white/10 text-[11px] text-zinc-300">
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-red-500"></span> Suspicious Account</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-indigo-500"></span> Normal Account</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Device</span>
            <span class="flex items-center gap-1.5"><span class="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> Merchant</span>
          </div>
        </div>

        <!-- Side Detail Panel -->
        <div class="fs-card p-5 xl:col-span-4 flex flex-col justify-between">
          @if (selectedNode(); as node) {
            <div class="space-y-4">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="text-[10px] uppercase tracking-wider text-purple-400 font-semibold">
                    {{ node.type.replace('_', ' ') }}
                  </span>
                  <h3 class="font-mono-num text-lg font-bold text-white mt-0.5">{{ node.id }}</h3>
                </div>
                <span
                  class="px-2.5 py-1 rounded-full text-xs font-mono-num font-bold border"
                  [ngClass]="
                    node.riskScore >= 75
                      ? 'bg-red-500/15 text-red-400 border-red-500/30'
                      : 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  "
                >
                  Risk {{ node.riskScore }}/100
                </span>
              </div>

              <div class="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[#090A16] border border-white/8 text-xs">
                <div>
                  <p class="text-zinc-500">Connections</p>
                  <p class="font-mono-num font-semibold text-white mt-0.5">{{ node.connections }}</p>
                </div>
                <div>
                  <p class="text-zinc-500">Status</p>
                  <p class="font-semibold text-amber-300 mt-0.5">{{ node.investigationStatus }}</p>
                </div>
                <div>
                  <p class="text-zinc-500">Cluster</p>
                  <p class="font-mono-num text-purple-300 mt-0.5">{{ node.clusterId }}</p>
                </div>
                <div>
                  <p class="text-zinc-500">Devices</p>
                  <p class="font-mono-num text-zinc-200 mt-0.5">{{ node.associatedDevices.length || 1 }}</p>
                </div>
              </div>

              <div>
                <p class="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                  Related Transactions
                </p>
                <div class="space-y-1.5">
                  @for (txId of node.relatedTransactions; track txId) {
                    <button
                      type="button"
                      (click)="store.openTransactionDrawer(txId)"
                      class="w-full text-left px-3 py-2 rounded-xl bg-[#090A16] hover:bg-purple-500/15 border border-white/8 text-xs font-mono-num text-purple-300 flex items-center justify-between transition-colors"
                    >
                      <span>{{ txId }}</span>
                      <span class="text-[10px] text-zinc-400">Inspect →</span>
                    </button>
                  } @empty {
                    <p class="text-xs text-zinc-500">No direct transactions linked in sample.</p>
                  }
                </div>
              </div>
            </div>

            <div class="pt-4 mt-4 border-t border-white/8 space-y-2">
              <button
                type="button"
                (click)="investigateNode(node)"
                class="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white flex items-center justify-center gap-1.5"
              >
                <lucide-icon [img]="SparklesIcon" class="w-3.5 h-3.5" />
                Investigate Account in Copilot
              </button>
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  (click)="highlightNeighborhood(node.id)"
                  class="py-2 rounded-xl bg-[#090A16] hover:bg-white/8 border border-white/10 text-xs text-zinc-200 flex items-center justify-center gap-1"
                >
                  <lucide-icon [img]="NetworkIcon" class="w-3.5 h-3.5 text-purple-400" />
                  Connected
                </button>
                <button
                  type="button"
                  (click)="createCaseFromNode(node)"
                  class="py-2 rounded-xl bg-[#090A16] hover:bg-white/8 border border-white/10 text-xs text-zinc-200 flex items-center justify-center gap-1"
                >
                  <lucide-icon [img]="FolderIcon" class="w-3.5 h-3.5 text-amber-400" />
                  Create Case
                </button>
              </div>
            </div>
          } @else {
            <div class="flex-1 flex flex-col items-center justify-center text-center py-12 text-zinc-500">
              <lucide-icon [img]="ShareIcon" class="w-10 h-10 text-purple-500/40 mb-3" />
              <p class="text-sm font-medium text-zinc-300">Select a Graph Node</p>
              <p class="text-xs text-zinc-500 mt-1 max-w-xs">
                Click any account, device, or merchant node to inspect connections, linked transactions, and risk score.
              </p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class FraudNetworkComponent implements AfterViewInit, OnDestroy {
  @ViewChild('cyContainer', { static: true }) cyContainer!: ElementRef<HTMLDivElement>;
  readonly store = inject(FraudStoreService);
  private readonly router = inject(Router);

  private cy: Core | null = null;

  readonly ShareIcon = Share2;
  readonly SearchIcon = Search;
  readonly ZoomInIcon = ZoomIn;
  readonly ZoomOutIcon = ZoomOut;
  readonly FitIcon = Maximize2;
  readonly FolderIcon = FolderPlus;
  readonly SparklesIcon = Sparkles;
  readonly NetworkIcon = Network;

  readonly searchTerm = signal('');
  readonly entityFilter = signal<'all' | GraphNodeType>('all');
  readonly activeCluster = signal<string>('all');
  readonly selectedNode = signal<GraphNode | null>(this.store.graphNodes()[0] ?? null);

  readonly clusters = [
    { id: 'all', label: 'All Clusters' },
    { id: 'mule_ring', label: 'Mule Account Ring' },
    { id: 'shared_device', label: 'Shared Device Cluster' },
    { id: 'merchant_hub', label: 'Merchant Hub' },
    { id: 'transfer_chain', label: 'Transfer Chain' },
  ];

  constructor() {
    effect(() => {
      const nodes = this.store.graphNodes();
      const edges = this.store.graphEdges();
      if (this.cy) {
        this.renderElements(nodes, edges);
      }
    });
  }

  ngAfterViewInit(): void {
    this.cy = cytoscape({
      container: this.cyContainer.nativeElement,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(label)',
            color: '#E4E4E7',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-wrap': 'wrap',
            width: 34,
            height: 34,
            'border-width': 2,
            'border-color': 'rgba(255,255,255,0.2)',
            'background-color': '#6366F1',
          },
        },
        {
          selector: 'node[type = "suspicious_account"]',
          style: {
            'background-color': '#EF4444',
            'border-color': '#FCA5A5',
            width: 40,
            height: 40,
          },
        },
        {
          selector: 'node[type = "device"]',
          style: {
            'background-color': '#A855F7',
            shape: 'round-rectangle',
          },
        },
        {
          selector: 'node[type = "merchant"]',
          style: {
            'background-color': '#22D3EE',
            shape: 'diamond',
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.6,
            'line-color': 'rgba(161,161,170,0.35)',
            'target-arrow-color': 'rgba(161,161,170,0.45)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            label: 'data(type)',
            'font-size': '8px',
            color: '#71717A',
            'text-rotation': 'autorotate',
          },
        },
        {
          selector: 'edge[?suspicious]',
          style: {
            width: 2.4,
            'line-color': 'rgba(239,68,68,0.65)',
            'target-arrow-color': '#EF4444',
          },
        },
        {
          selector: '.dimmed',
          style: {
            opacity: 0.18,
          },
        },
        {
          selector: '.highlighted',
          style: {
            'border-width': 3,
            'border-color': '#F8FAFC',
          },
        },
      ],
    });

    this.renderElements(this.store.graphNodes(), this.store.graphEdges());

    this.cy.on('tap', 'node', (evt) => {
      const id = evt.target.id();
      const found = this.store.graphNodes().find((n) => n.id === id) ?? null;
      this.selectedNode.set(found);
      this.highlightNeighborhood(id);
    });

    this.cy.on('tap', (evt) => {
      if (evt.target === this.cy) {
        this.cy?.elements().removeClass('dimmed highlighted');
      }
    });
  }

  private renderElements(nodes: GraphNode[], edges: ReturnType<FraudStoreService['graphEdges']>): void {
    if (!this.cy) return;
    this.cy.elements().remove();
    this.cy.add([
      ...nodes.map((n) => ({
        group: 'nodes' as const,
        data: { id: n.id, label: n.label, type: n.type, clusterId: n.clusterId },
      })),
      ...edges.map((e) => ({
        group: 'edges' as const,
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          type: e.type,
          suspicious: !!e.suspicious,
          clusterId: e.clusterId,
        },
      })),
    ]);
    this.cy.layout({ name: 'cose', animate: true, animationDuration: 450, padding: 36 }).run();
  }

  highlightNeighborhood(nodeId: string): void {
    if (!this.cy) return;
    const node = this.cy.getElementById(nodeId);
    if (!node || node.empty()) return;
    this.cy.elements().addClass('dimmed').removeClass('highlighted');
    const neighborhood = node.closedNeighborhood();
    neighborhood.removeClass('dimmed').addClass('highlighted');
  }

  focusCluster(clusterId: string): void {
    this.activeCluster.set(clusterId);
    if (!this.cy) return;
    if (clusterId === 'all') {
      this.cy.elements().removeClass('dimmed highlighted');
      this.cy.fit(undefined, 36);
      return;
    }
    this.cy.elements().addClass('dimmed').removeClass('highlighted');
    const matching = this.cy.elements(`[clusterId = "${clusterId}"]`);
    matching.removeClass('dimmed').addClass('highlighted');
    this.cy.fit(matching, 50);
  }

  filterEntityType(type: 'all' | GraphNodeType): void {
    this.entityFilter.set(type);
    if (!this.cy) return;
    if (type === 'all') {
      this.cy.elements().removeClass('dimmed');
      return;
    }
    this.cy.elements().addClass('dimmed');
    this.cy.nodes(`[type = "${type}"]`).removeClass('dimmed');
  }

  searchAndFocus(term: string): void {
    this.searchTerm.set(term);
    if (!this.cy) return;
    const q = term.trim().toLowerCase();
    if (!q) {
      this.cy.elements().removeClass('dimmed highlighted');
      return;
    }
    const found = this.store.graphNodes().find((n) => n.id.toLowerCase().includes(q) || n.label.toLowerCase().includes(q));
    if (found) {
      this.selectedNode.set(found);
      this.highlightNeighborhood(found.id);
    }
  }

  zoom(factor: number): void {
    if (!this.cy) return;
    this.cy.zoom(this.cy.zoom() * factor);
  }

  fitGraph(): void {
    this.cy?.fit(undefined, 36);
  }

  investigateNode(node: GraphNode): void {
    if (node.relatedTransactions[0]) {
      this.store.selectedExplainTransactionId.set(node.relatedTransactions[0]);
    }
    this.router.navigate(['/app/analyst-copilot']);
  }

  createCaseFromNode(node: GraphNode): void {
    const txnId = node.relatedTransactions[0];
    const txn = this.store.transactions().find((t) => t.id === txnId) ?? this.store.transactions()[0];
    if (txn) {
      const c = this.store.createCaseFromTransaction(txn);
      this.store.showToast('Case Created', `${c.id} opened for ${node.id}.`, 'success');
    }
  }

  ngOnDestroy(): void {
    this.cy?.destroy();
  }
}
