import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, ElementRef, ViewChild, Input, effect, WritableSignal, signal } from '@angular/core';
import * as d3 from 'd3';

// d3.scaleLinear + d3.axisBottom/Left = classic x–y axes.
// d3.line() = transforms your (tick, hp) points into an SVG path.
// Grouping by creature lets you draw multiple lines.
// d3.scaleOrdinal gives different colors for A and B.

// Keep your chart initialized once (createChart).
// When new logs arrive, call updateChart(newData).
// D3 uses the data join pattern (.data(), .enter(), .exit()) to update paths instead of replacing the whole SVG.

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

  @Input() logs: WritableSignal<any[]> = signal([]);

  private svgRoot!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private svg!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private margin = { top: 20, right: 30, bottom: 40, left: 50 };
  private width = 600 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;

  private x!: d3.ScaleLinear<number, number>;
  private y!: d3.ScaleLinear<number, number>;
  private line!: d3.Line<BattleLog>;
  private color = d3.scaleOrdinal<string>().range(["steelblue", "tomato"]);

  constructor() {
    effect(() => {
      this.updateChart(this.logs());
    })
  }

  ngOnInit(): void {
    
  }

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

    // Scales
    this.x = d3.scaleLinear().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);

    // Line generator
    this.line = d3.line<BattleLog>()
      .x(d => this.x(d.tick))
      .y(d => this.y(d.hp));

    // Axes groups (empty for now, updated later)
    this.svg.append("g").attr("class", "x-axis")
      .attr("transform", `translate(0,${this.height})`);
    this.svg.append("g").attr("class", "y-axis");
  }

  updateChart(data: BattleLog[]): void {
    if (!data || data.length === 0) return;

    const grouped = d3.group(data, d => d.creature);

    // Update scales
    this.x.domain(d3.extent(data, d => d.tick) as [number, number]);
    this.y.domain([0, d3.max(data, d => d.hp) as number]).nice();

    // Update axes
    this.svg.select<SVGGElement>(".x-axis").call(d3.axisBottom(this.x));
    this.svg.select<SVGGElement>(".y-axis").call(d3.axisLeft(this.y));

    // JOIN + UPDATE paths
    const creatures = this.svg.selectAll<SVGPathElement, [string, BattleLog[]]>("path.line")
      .data(Array.from(grouped), d => d[0]);

    // EXIT old
    creatures.exit().remove();

    // ENTER new
    creatures.enter()
      .append("path")
      .attr("class", "line")
      .attr("fill", "none")
      .attr("stroke-width", 2)
      .merge(creatures) // MERGE with update selection
      .attr("stroke", d => this.color(d[0])!)
      .attr("d", d => this.line(d[1]));
  }
}