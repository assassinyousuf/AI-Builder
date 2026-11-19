import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as echarts from 'echarts';

@Component({
  selector: 'app-echarts',
  standalone: true,
  template: `<div #chartHost [style.height]="height" class="w-full"></div>`,
})
export class EchartsWrapperComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('chartHost', { static: true }) chartHost!: ElementRef<HTMLDivElement>;
  @Input({ required: true }) option!: echarts.EChartsOption;
  @Input() height = '280px';

  private chart: echarts.ECharts | null = null;
  private resizeObserver: ResizeObserver | null = null;

  ngAfterViewInit(): void {
    this.chart = echarts.init(this.chartHost.nativeElement, undefined, { renderer: 'canvas' });
    if (this.option) {
      this.chart.setOption(this.option, true);
    }

    this.resizeObserver = new ResizeObserver(() => {
      this.chart?.resize();
    });
    this.resizeObserver.observe(this.chartHost.nativeElement);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['option'] && this.chart && this.option) {
      this.chart.setOption(this.option, true);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.chart?.dispose();
  }
}
