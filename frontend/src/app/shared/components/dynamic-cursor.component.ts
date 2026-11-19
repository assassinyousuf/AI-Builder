import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  ViewChild,
  inject,
} from '@angular/core';

@Component({
  selector: 'app-dynamic-cursor',
  standalone: true,
  template: `
    <div #glow class="fs-cursor-glow" aria-hidden="true"></div>
    <div #ring class="fs-cursor-ring" aria-hidden="true"></div>
    <div #dot class="fs-cursor-dot" aria-hidden="true"></div>
  `,
  styles: `
    :host {
      display: contents;
    }

    .fs-cursor-glow,
    .fs-cursor-ring,
    .fs-cursor-dot {
      position: fixed;
      top: 0;
      left: 0;
      pointer-events: none;
      z-index: 9999;
      opacity: 0;
      will-change: transform, opacity;
      transition: opacity 0.25s ease;
    }

    .fs-cursor-glow {
      width: 260px;
      height: 260px;
      margin-left: -130px;
      margin-top: -130px;
      border-radius: 9999px;
      background: radial-gradient(
        circle,
        rgba(168, 85, 247, 0.14) 0%,
        rgba(217, 70, 239, 0.06) 40%,
        transparent 70%
      );
      filter: blur(8px);
    }

    .fs-cursor-ring {
      width: 34px;
      height: 34px;
      margin-left: -17px;
      margin-top: -17px;
      border-radius: 9999px;
      border: 1.5px solid rgba(168, 85, 247, 0.65);
      background: rgba(168, 85, 247, 0.04);
      box-shadow: 0 0 18px rgba(168, 85, 247, 0.25);
      transition:
        opacity 0.25s ease,
        width 0.2s cubic-bezier(0.16, 1, 0.3, 1),
        height 0.2s cubic-bezier(0.16, 1, 0.3, 1),
        margin 0.2s cubic-bezier(0.16, 1, 0.3, 1),
        border-color 0.2s ease,
        background-color 0.2s ease;
    }

    .fs-cursor-ring.is-hover {
      width: 50px;
      height: 50px;
      margin-left: -25px;
      margin-top: -25px;
      border-color: rgba(236, 72, 153, 0.9);
      background: rgba(217, 70, 239, 0.1);
      box-shadow: 0 0 26px rgba(217, 70, 239, 0.38);
    }

    .fs-cursor-ring.is-pressed {
      width: 26px;
      height: 26px;
      margin-left: -13px;
      margin-top: -13px;
      border-color: #f8fafc;
    }

    .fs-cursor-dot {
      width: 7px;
      height: 7px;
      margin-left: -3.5px;
      margin-top: -3.5px;
      border-radius: 9999px;
      background: linear-gradient(135deg, #f8fafc, #e879f9);
      box-shadow: 0 0 10px rgba(217, 70, 239, 0.9);
      transition: opacity 0.2s ease, transform 0.15s ease;
    }

    .fs-cursor-dot.is-hover {
      transform: scale(0.75);
    }

    @media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce) {
      .fs-cursor-glow,
      .fs-cursor-ring,
      .fs-cursor-dot {
        display: none !important;
      }
    }
  `,
})
export class DynamicCursorComponent implements AfterViewInit, OnDestroy {
  @ViewChild('glow', { static: true }) glowRef!: ElementRef<HTMLDivElement>;
  @ViewChild('ring', { static: true }) ringRef!: ElementRef<HTMLDivElement>;
  @ViewChild('dot', { static: true }) dotRef!: ElementRef<HTMLDivElement>;

  private readonly ngZone = inject(NgZone);
  private rafId: number | null = null;
  private targetX = -200;
  private targetY = -200;
  private ringX = -200;
  private ringY = -200;
  private glowX = -200;
  private glowY = -200;
  private visible = false;

  private readonly interactiveSelector =
    'a, button, [role="button"], input, select, textarea, label, tr.cursor-pointer, .fs-card-hover';

  private onMouseMove = (e: MouseEvent): void => {
    this.targetX = e.clientX;
    this.targetY = e.clientY;
    if (!this.visible) {
      this.visible = true;
      this.ringX = e.clientX;
      this.ringY = e.clientY;
      this.glowX = e.clientX;
      this.glowY = e.clientY;
      this.setOpacity('1');
    }

    const target = e.target as HTMLElement | null;
    const isInteractive = !!target?.closest(this.interactiveSelector);
    this.ringRef.nativeElement.classList.toggle('is-hover', isInteractive);
    this.dotRef.nativeElement.classList.toggle('is-hover', isInteractive);
  };

  private onMouseDown = (): void => {
    this.ringRef.nativeElement.classList.add('is-pressed');
  };

  private onMouseUp = (): void => {
    this.ringRef.nativeElement.classList.remove('is-pressed');
  };

  private onMouseLeave = (): void => {
    this.visible = false;
    this.setOpacity('0');
  };

  ngAfterViewInit(): void {
    const isTouchOrReduced =
      window.matchMedia('(hover: none), (pointer: coarse), (prefers-reduced-motion: reduce)').matches;
    if (isTouchOrReduced) return;

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('mousemove', this.onMouseMove, { passive: true });
      window.addEventListener('mousedown', this.onMouseDown, { passive: true });
      window.addEventListener('mouseup', this.onMouseUp, { passive: true });
      document.addEventListener('mouseleave', this.onMouseLeave, { passive: true });

      const tick = (): void => {
        this.ringX += (this.targetX - this.ringX) * 0.2;
        this.ringY += (this.targetY - this.ringY) * 0.2;
        this.glowX += (this.targetX - this.glowX) * 0.09;
        this.glowY += (this.targetY - this.glowY) * 0.09;

        this.dotRef.nativeElement.style.transform = `translate3d(${this.targetX}px, ${this.targetY}px, 0)`;
        this.ringRef.nativeElement.style.transform = `translate3d(${this.ringX}px, ${this.ringY}px, 0)`;
        this.glowRef.nativeElement.style.transform = `translate3d(${this.glowX}px, ${this.glowY}px, 0)`;

        this.rafId = requestAnimationFrame(tick);
      };

      this.rafId = requestAnimationFrame(tick);
    });
  }

  private setOpacity(value: string): void {
    this.dotRef.nativeElement.style.opacity = value;
    this.ringRef.nativeElement.style.opacity = value;
    this.glowRef.nativeElement.style.opacity = value;
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }
    window.removeEventListener('mousemove', this.onMouseMove);
    window.removeEventListener('mousedown', this.onMouseDown);
    window.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mouseleave', this.onMouseLeave);
  }
}
