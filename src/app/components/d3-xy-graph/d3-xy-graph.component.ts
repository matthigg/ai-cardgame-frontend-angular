import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, effect, WritableSignal, signal } from '@angular/core';
import * as d3 from 'd3';

interface BattleLog {
  tick: number;
  creature: string;
  hp: number;
}

@Component({
  selector: 'app-d3-xy-graph',
  imports: [CommonModule],
  templateUrl: './d3-xy-graph.component.html',
  styleUrl: './d3-xy-graph.component.scss'
})
export class D3XyGraphComponent implements OnInit, AfterViewInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  @Input() logs: WritableSignal<BattleLog[]> = signal<BattleLog[]>([]);
  @Input() statusMessages: WritableSignal<string[]> = signal([]);
  @Input() maxTicks: number = 100; // max ticks to display
  @Input() appendMode: boolean = true; // append vs full re-render
  @Input() statusMessagesLength: number = 10; // max messages to keep

  private svgRoot!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private svg!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private margin = { top: 20, right: 30, bottom: 40, left: 50 };
  private width = 1000 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;

  private x!: d3.ScaleLinear<number, number>;
  private y!: d3.ScaleLinear<number, number>;
  private line!: d3.Line<BattleLog>;
  private color = d3.scaleOrdinal<string>().range(["steelblue", "tomato"]);

  // Persistent state for append mode
  private fullData: BattleLog[] = [];
  private epochBoundaries: number[] = [];
  private tickOffset = 0;
  private includeEpochBoundaries = true;

  constructor() {
    effect(() => this.updateChart(this.logs()));
  }

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.createChart();
  }

  private createChart(): void {
    this.svgRoot = d3.select(this.chartContainer.nativeElement)
      .append("svg")
      .attr("width", this.width + this.margin.left + this.margin.right)
      .attr("height", this.height + this.margin.top + this.margin.bottom);

    this.svg = this.svgRoot.append("g")
      .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

    this.x = d3.scaleLinear().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);

    this.line = d3.line<BattleLog>()
      .x(d => this.x(d.tick))
      .y(d => this.y(d.hp));

    this.svg.append("g").attr("class", "x-axis").attr("transform", `translate(0,${this.height})`);
    this.svg.append("g").attr("class", "y-axis");
    this.svg.append("g").attr("class", "epoch-lines");
  }

  updateChart(newLogs: BattleLog[]): void {
    if (!Array.isArray(newLogs) || newLogs.length === 0) return;

    let dataToPlot: BattleLog[] = [];

    if (this.appendMode) {
      // --- append mode ---
      const shiftedLogs = newLogs.map(d => ({ ...d, tick: d.tick + this.tickOffset }));
      const isNewEpoch = newLogs[0].tick === 0 && this.fullData.length > 0;

      if (isNewEpoch && this.includeEpochBoundaries) this.epochBoundaries.push(this.tickOffset);

      this.fullData = [...this.fullData, ...shiftedLogs];
      this.tickOffset = d3.max(this.fullData, d => d.tick)! + 1;

      // --- trim data to maxTicks (scrolling window) ---
      const minTick = d3.max(this.fullData, d => d.tick)! - this.maxTicks;
      this.fullData = this.fullData.filter(d => d.tick >= minTick);
      this.epochBoundaries = this.epochBoundaries.filter(t => t >= minTick);

      dataToPlot = this.fullData;
    } else {
      // --- re-render per epoch ---
      this.fullData = [...newLogs];
      this.epochBoundaries = [];
      this.tickOffset = 0;
      dataToPlot = newLogs;
    }

    // Group by creature
    const grouped = d3.group(dataToPlot, d => d.creature);

    // Update scales
    this.x.domain([d3.min(dataToPlot, d => d.tick) || 0, d3.max(dataToPlot, d => d.tick) || 1]);
    this.y.domain([0, d3.max(dataToPlot, d => d.hp) as number]).nice();

    // Update axes
    this.svg.select<SVGGElement>(".x-axis").call(d3.axisBottom(this.x));
    this.svg.select<SVGGElement>(".y-axis").call(d3.axisLeft(this.y));

    // Update lines
    const creatures = this.svg.selectAll<SVGPathElement, [string, BattleLog[]]>("path.line")
      .data(Array.from(grouped), d => d[0]);

    creatures.exit().remove();
    creatures.enter()
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .merge(creatures)
      .attr("stroke", d => this.color(d[0])!)
      .attr("d", d => this.line(d[1]));

    // Update epoch separators
    const epochLines = this.svg.select<SVGGElement>("g.epoch-lines")
      .selectAll<SVGLineElement, number>("line.epoch-line")
      .data(this.appendMode ? this.epochBoundaries : []);

    epochLines.exit().remove();
    epochLines.enter()
      .append("line")
      .attr("class", "epoch-line")
      .attr("stroke", "gray")
      .attr("stroke-dasharray", "4 4")
      .attr("y1", 0)
      .attr("y2", this.height)
      .merge(epochLines)
      .attr("x1", d => this.x(d))
      .attr("x2", d => this.x(d));
  }
}
