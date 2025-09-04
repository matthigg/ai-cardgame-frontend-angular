import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, signal, WritableSignal, inject, effect } from '@angular/core';
import * as d3 from 'd3';
import { BattleService } from '../../services/battle/battle.service';
import { take } from 'rxjs';

interface CreatureStats {
  name: string;
  totalWins: number;
  avgWins: number;
  totalEpochs: number;
  stats: Record<string, number>;
}

@Component({
  selector: 'app-d3-bar-chart',
  templateUrl: './d3-bar-chart.component.html',
  styleUrls: ['./d3-bar-chart.component.scss']
})
export class D3BarChartComponent implements OnInit {
  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;
  @Input() summaryData!: WritableSignal<Record<string, CreatureStats> | null>;

  private svg!: d3.Selection<SVGGElement, unknown, null, undefined>;
  private margin = { top: 30, right: 30, bottom: 50, left: 60 };
  private width = 800 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;
  private color = d3.scaleOrdinal<string>().range(['steelblue', 'tomato']);

  constructor() {
    effect(() => {
      const data = this.summaryData();
      this.updateChart(data);
    })
  }

  ngOnInit(): void {
    this.createChart();
  }

  private createChart(): void {
    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
  }

  private updateChart(summaryData: any): void {
    if (!this.summaryData()) return;

    const categories = Object.keys(summaryData?.['A']?.stats);
    const creatures = Object.keys(summaryData);

    // Prepare data for grouped bar chart
    const data = categories.map(cat => {
      const obj: any = { category: cat };
      creatures.forEach(c => obj[c] = summaryData?.[c]?.stats?.[cat]);
      return obj;
    });

    const x0 = d3.scaleBand()
      .domain(categories)
      .range([0, this.width])
      .padding(0.2);

    const x1 = d3.scaleBand()
      .domain(creatures)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d3.max(creatures, key => d[key])) ?? 0])
      .nice()
      .range([this.height, 0]);

    // Remove previous content
    this.svg.selectAll('*').remove();

    // Axes
    this.svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x0));

    this.svg.append('g')
      .call(d3.axisLeft(y));

    // Bars
    const bars = this.svg.selectAll('g.category')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'category')
      .attr('transform', d => `translate(${x0(d.category)},0)`);

    bars.selectAll('rect')
      .data(d => creatures.map(c => ({ key: c, value: d[c] })))
      .enter()
      .append('rect')
      .attr('x', d => x1(d.key)!)
      .attr('y', d => y(d.value))
      .attr('width', x1.bandwidth())
      .attr('height', d => this.height - y(d.value))
      .attr('fill', d => this.color(d.key)!);

    // Legend
    const legend = this.svg.selectAll('.legend')
      .data(creatures)
      .enter()
      .append('g')
      .attr('transform', (_, i) => `translate(${i * 120}, -20)`);

    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', d => this.color(d)!);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .text(d => d);
  }
}
