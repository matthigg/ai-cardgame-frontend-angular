import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, signal, WritableSignal, inject, effect } from '@angular/core';
import * as d3 from 'd3';
import { BattleService } from '../../services/battle/battle.service';
import { take } from 'rxjs';
import { CreatureStats } from '../../shared/creature.model';

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
    .style('background-color', '#111') // black background
    .append('g')
    .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
}

  private updateChart(summaryData: any): void {
    if (!summaryData) return;

    // Custom x-axis order including a divider
    const xOrder = [
      'attack', 'defend', 'poison', 'stun', 'recover',
      'divider',
      'knockout', 'stunned', 'poisoned', 'stalemates'
    ];

    const creatures = Object.keys(summaryData);

    // Prepare data for bars, skip 'divider'
    const data = xOrder
      .filter(cat => cat !== 'divider')
      .map(cat => {
        const obj: any = { category: cat };
        creatures.forEach(c => obj[c] = summaryData[c].stats[cat]);
        return obj;
      });

    const x0 = d3.scaleBand()
      .domain(xOrder)
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

    // Clear previous content
    this.svg.selectAll('*').remove();

    // Axes
    this.svg.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(x0).tickFormat(d => d === 'divider' ? '' : d))
      .selectAll('text')
      .style('fill', '#bbb');

    this.svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll('text')
      .style('fill', '#bbb');

    // Divider lines
    this.svg.selectAll('line.divider')
      .data(xOrder.filter(d => d === 'divider'))
      .enter()
      .append('line')
      .attr('class', 'divider')
      .attr('x1', d => x0(d)! + x0.bandwidth() / 2)
      .attr('x2', d => x0(d)! + x0.bandwidth() / 2)
      .attr('y1', 0)
      .attr('y2', this.height)
      .attr('stroke', '#555')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,2');

    // Bars with animation and stagger
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
      .attr('y', this.height)
      .attr('width', x1.bandwidth())
      .attr('height', 0)
      .attr('fill', d => this.color(d.key)!)
      .on('mouseover', function(event, d) {
        d3.select(this).attr('opacity', 0.7);
        tooltip.style('display', 'block').text(`${d.key}: ${d.value}`);
      })
      .on('mousemove', function(event) {
        tooltip
          .style('left', event.offsetX + 10 + 'px')
          .style('top', event.offsetY - 10 + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('opacity', 1);
        tooltip.style('display', 'none');
      })
      .transition()
      .duration(300)
      .delay((d, i) => i * 100)
      .attr('y', d => y(d.value))
      .attr('height', d => this.height - y(d.value));

    // Tooltip
    const tooltip = d3.select(this.chartContainer.nativeElement)
      .append('div')
      .style('position', 'absolute')
      .style('background', '#222')
      .style('color', '#fff')
      .style('padding', '4px 8px')
      .style('border-radius', '4px')
      .style('pointer-events', 'none')
      .style('display', 'none');

    // Legend
    const legend = this.svg.selectAll('.legend')
      .data(creatures)
      .enter()
      .append('g')
      .attr('transform', (_, i) => `translate(${i * 120}, -25)`);

    legend.append('rect')
      .attr('width', 15)
      .attr('height', 15)
      .attr('fill', d => this.color(d)!);

    legend.append('text')
      .attr('x', 20)
      .attr('y', 12)
      .style('fill', '#bbb')
      .text(d => d);
  }
}
