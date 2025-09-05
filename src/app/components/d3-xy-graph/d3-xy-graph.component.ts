import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, effect, WritableSignal, signal, InputSignal } from '@angular/core';
import * as d3 from 'd3';
import { CreatureStats } from '../../shared/creature.model';

interface BattleLog {
  tick: number;
  creature: string;
  hp: number;
  energy: number;
  reward: number;
}

@Component({
  selector: 'app-d3-xy-graph',
  imports: [CommonModule],
  templateUrl: './d3-xy-graph.component.html',
  styleUrls: ['./d3-xy-graph.component.scss']
})
export class D3XyGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  @Input() logs: WritableSignal<BattleLog[]> = signal<BattleLog[]>([]);
  @Input() maxTicks: number = 100;
  @Input() appendMode: boolean = true;
  @Input() statusMessages: WritableSignal<string[]> = signal([]);
  // @Input({ required: true }) summaryData!: InputSignal<Record<string, CreatureStats> | null>;
  @Input({ required: true }) summaryData!: WritableSignal<any>;

  // Selected stat to plot
  selectedStat: WritableSignal<'hp' | 'energy' | 'reward'> = signal('hp');

  private svgRoot!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private svg!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private margin = { top: 20, right: 30, bottom: 40, left: 50 };
  private width = 1000 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;

  private x!: d3.ScaleLinear<number, number>;
  private y!: d3.ScaleLinear<number, number>;
  private line!: d3.Line<BattleLog | null>;
  private color = d3.scaleOrdinal<string>().range(['steelblue', 'tomato']);

  private fullData: (BattleLog | null)[] = [];
  private epochBoundaries: number[] = [];
  private tickOffset = 0;
  private includeEpochBoundaries = true;

  constructor() {
    effect(() => this.updateChart(this.logs()));
    effect(() => {
      this.updateChart(this.summaryData())
      console.log('--- this.summaryData(): ', this.summaryData());
    });
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): void {
    this.svgRoot = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom);

    this.svg = this.svgRoot.append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);

    this.x = d3.scaleLinear().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);

    this.line = d3.line<BattleLog | null>()
      .defined(d => d !== null)
      .x(d => this.x(d!.tick))
      .y(d => this.y(d![this.selectedStat()]));

    this.svg.append('g').attr('class', 'x-axis').attr('transform', `translate(0,${this.height})`);
    this.svg.append('g').attr('class', 'y-axis');
    this.svg.append('g').attr('class', 'epoch-lines');
  }

  updateChart(newLogs: BattleLog[]): void {
    if (!Array.isArray(newLogs) || newLogs.length === 0) return;

    let dataToPlot: (BattleLog | null)[] = [];

    if (this.appendMode) {
      const shiftedLogs = newLogs.map(d => ({ ...d, tick: d.tick + this.tickOffset }));
      const isNewEpoch = newLogs[0].tick === 0 && this.fullData.length > 0;

      if (isNewEpoch && this.includeEpochBoundaries) {
        this.epochBoundaries.push(this.tickOffset);
        this.fullData.push(null);
      }

      this.fullData = [...this.fullData, ...shiftedLogs];
      this.tickOffset = d3.max(this.fullData, d => d?.tick ?? 0)! + 1;
      dataToPlot = this.fullData;
    } else {
      this.fullData = [...newLogs];
      this.epochBoundaries = [];
      this.tickOffset = 0;
      dataToPlot = newLogs;
    }

    const grouped = d3.group(dataToPlot.filter(d => d !== null) as BattleLog[], d => d.creature);
    const maxTick = d3.max(this.fullData, d => d?.tick ?? 0) ?? 0;

    if (this.appendMode && this.maxTicks > 0) {
      this.x.domain([Math.max(0, maxTick - this.maxTicks), maxTick]);
    } else {
      this.x.domain([d3.min(dataToPlot, d => d?.tick ?? 0) ?? 0, maxTick]);
    }

    this.y.domain([0, d3.max(dataToPlot, d => d?.[this.selectedStat()] ?? 0) as number]).nice();

    this.svg.select<SVGGElement>('.x-axis').call(d3.axisBottom(this.x));
    this.svg.select<SVGGElement>('.y-axis').call(d3.axisLeft(this.y));

    const creatures = this.svg.selectAll<SVGPathElement, [string, BattleLog[]]>('path.line')
      .data(Array.from(grouped), d => d[0]);

    creatures.exit().remove();

    const xDomain = this.x.domain();

    creatures.enter()
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('stroke-width', 2)
      .merge(creatures)
      .attr('stroke', d => this.color(d[0])!)
      .attr('d', d => {
        const lineData: (BattleLog | null)[] = dataToPlot.filter(pt => 
          pt === null || (pt.creature === d[0] && pt.tick >= xDomain[0] && pt.tick <= xDomain[1])
        );
        return this.line(lineData)!;
      });

    const epochLines = this.svg.select<SVGGElement>('g.epoch-lines')
      .selectAll<SVGLineElement, number>('line.epoch-line')
      .data(this.appendMode ? this.epochBoundaries : []);

    epochLines.exit()
      .transition()
      .duration(200)
      .attr('x1', d => this.x(d as number))
      .attr('x2', d => this.x(d as number))
      .remove();

    epochLines.enter()
      .append('line')
      .attr('class', 'epoch-line')
      .attr('stroke', 'gray')
      .attr('stroke-dasharray', '4 4')
      .attr('y1', 0)
      .attr('y2', this.height)
      .attr('x1', d => this.x(d as number))
      .attr('x2', d => this.x(d as number))
      .merge(epochLines)
      .transition()
      .duration(200)
      .attr('x1', d => this.x(d as number))
      .attr('x2', d => this.x(d as number));

    // console.log('--- dataToPlot: ', dataToPlot);
  }

  setStat(stat: 'hp' | 'energy' | 'reward') {
    this.selectedStat.set(stat);
    this.line.y(d => this.y(d![stat])); // update line generator
    this.updateChart(this.logs());
  }

  onStatChange(event: Event) {
    const target = event.target as HTMLSelectElement | null;
    if (target) {
      this.setStat(target.value as 'hp' | 'energy' | 'reward');
    }
  }
}
