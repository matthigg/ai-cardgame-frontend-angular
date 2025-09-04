import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-d3-chart',
  templateUrl: './d3-chart.component.html',
  styleUrls: ['./d3-chart.component.scss']
})
export class D3ChartComponent implements OnInit, AfterViewInit {

  @ViewChild('chartContainer', { static: true }) chartContainer!: ElementRef;

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private width = 600;
  private height = 400;

  constructor() { }

  ngOnInit(): void { }

  ngAfterViewInit(): void {
    this.createSvg();
    this.drawBars([30, 80, 45, 60, 20, 90, 50]); // sample data
  }

  private createSvg(): void {
    this.svg = d3.select(this.chartContainer.nativeElement)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height);
  }

  private drawBars(data: number[]): void {
    const x = d3.scaleBand()
      .domain(data.map((d, i) => i.toString()))
      .range([0, this.width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data) as number])
      .range([this.height, 0]);

    this.svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => x(i.toString())!)
      .attr('y', d => y(d))
      .attr('width', x.bandwidth())
      .attr('height', d => this.height - y(d))
      .attr('fill', '#69b3a2');
  }
}
