import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

interface Neuron {
  id: string;
  x: number;
  y: number;
  value: number; // activation value
  layer: number;
  index: number;
}

@Component({
  selector: 'app-nn-graph-3',
  template: `
    <div>
      <button (click)="toggleValues()">
        {{ showValues ? 'Hide' : 'Show' }} Values
      </button>
    </div>
    <svg #svgRef width="800" height="600"></svg>
  `,
  styleUrls: ['./nn-graph-3.component.scss']
})
export class NnGraph3Component implements OnInit, OnDestroy {
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  neurons: Neuron[] = [];
  connections: { source: Neuron; target: Neuron }[] = [];
  eventSource!: EventSource;
  showValues = true;

  private layerSizes = [5, 8, 5]; // example: 3 layers

  ngOnInit(): void {
    if (!this.svgRef?.nativeElement) return;

    this.svg = d3.select(this.svgRef.nativeElement);

    this.createNetwork();
    this.drawConnections();
    this.drawNeurons();
    this.startActivationStream('A'); // SSE stream
    this.startPulseAnimation();
  }

  ngOnDestroy(): void {
    if (this.eventSource) this.eventSource.close();
  }

  toggleValues(): void {
    this.showValues = !this.showValues;
    this.updateValueLabels();
  }

  private createNetwork(): void {
    const layerSpacing = 200;
    const neuronSpacing = 50;
    this.neurons = [];

    // Generate neurons layer by layer
    this.layerSizes.forEach((count, layerIndex) => {
      const offsetY = (Math.max(...this.layerSizes) - count) * neuronSpacing / 2;
      for (let i = 0; i < count; i++) {
        this.neurons.push({
          id: `L${layerIndex}N${i}`,
          x: layerIndex * layerSpacing + 100,
          y: i * neuronSpacing + 50 + offsetY,
          value: 0,
          layer: layerIndex,
          index: i
        });
      }
    });

    // Create connections between consecutive layers
    this.connections = [];
    for (let l = 0; l < this.layerSizes.length - 1; l++) {
      const layerA = this.neurons.filter(n => n.layer === l);
      const layerB = this.neurons.filter(n => n.layer === l + 1);
      layerA.forEach(source => {
        layerB.forEach(target => {
          this.connections.push({ source, target });
        });
      });
    }
  }

  private drawConnections(): void {
    this.svg.selectAll('line')
      .data(this.connections)
      .enter()
      .append('line')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', '#999')
      .attr('stroke-width', 1);
  }

  private drawNeurons(): void {
    this.svg.selectAll('circle')
      .data(this.neurons, (d: any) => d.id)
      .enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 10)
      .attr('fill', 'steelblue');

    this.updateValueLabels();
  }

  private updateValueLabels(): void {
    const labels = this.svg.selectAll<SVGTextElement, Neuron>('text')
      .data(this.neurons, d => d.id);

    labels.join(
      enter => enter.append('text')
        .attr('x', d => d.x)
        .attr('y', d => d.y + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text(d => this.showValues ? d.value.toFixed(2) : ''),
      update => update.text(d => this.showValues ? d.value.toFixed(2) : '')
    );
  }

  private startPulseAnimation(): void {
    const baseRadius = 10;
    const maxRadius = 25;

    d3.timer((elapsed) => {
      const t = (elapsed % 1000) / 1000;
      const pulse = 0.05 + 0.05 * Math.sin(2 * Math.PI * t);

      this.svg.selectAll<SVGCircleElement, Neuron>('circle')
        .attr('r', d => baseRadius + (maxRadius - baseRadius) * d.value * pulse);
    });
  }

  private startActivationStream(creatureName: string): void {
    this.eventSource = new EventSource(`http://127.0.0.1:8000/battle/nn-stream/${creatureName}`);

    this.eventSource.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as { epoch: number; activations: number[][] };
      if (!data.activations || data.activations.length === 0) return;

      // Update neuron values layer by layer
      data.activations.forEach((layerValues, layerIndex) => {
        this.neurons
          .filter(n => n.layer === layerIndex)
          .forEach((neuron, i) => {
            neuron.value = layerValues[i] ?? 0;
          });
      });

      if (this.showValues) this.updateValueLabels();
    };
  }
}
