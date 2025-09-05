import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

interface Neuron {
  id: string;
  x: number;
  y: number;
  value: number;
  targetValue: number;
  layer: number;
  index: number;
  glow: number; // new: for halo effect
}

interface Connection {
  source: Neuron;
  target: Neuron;
  id: string;
  glow: number;
}

@Component({
  selector: 'app-nn-graph-4',
  template: `
    <div>
      <button (click)="toggleValues()">
        {{ showValues ? 'Hide' : 'Show' }} Values
      </button>
    </div>
    <svg #svgRef width="800" height="600"></svg>
  `,
  styleUrls: ['./nn-graph-4.component.scss']
})
export class NnGraph4Component implements OnInit, OnDestroy {
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  neurons: Neuron[] = [];
  connections: Connection[] = [];
  eventSource!: EventSource;
  showValues = true;

  private layerSizes = [5, 8, 5]; // example architecture
  private pulseDuration = 500;
  private activationQueue: number[][] = [];
  private pulseIndex = 0;

  ngOnInit(): void {
    if (!this.svgRef?.nativeElement) return;

    this.svg = d3.select(this.svgRef.nativeElement);

    this.createNetwork();
    this.drawConnections();
    this.drawNeurons();
    this.startActivationStream('A');
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

    this.layerSizes.forEach((count, layerIndex) => {
      const offsetY = (Math.max(...this.layerSizes) - count) * neuronSpacing / 2;
      for (let i = 0; i < count; i++) {
        this.neurons.push({
          id: `L${layerIndex}N${i}`,
          x: layerIndex * layerSpacing + 100,
          y: i * neuronSpacing + 50 + offsetY,
          value: 0,
          targetValue: 0,
          layer: layerIndex,
          index: i,
          glow: 0
        });
      }
    });

    this.connections = [];
    for (let l = 0; l < this.layerSizes.length - 1; l++) {
      const layerA = this.neurons.filter(n => n.layer === l);
      const layerB = this.neurons.filter(n => n.layer === l + 1);
      layerA.forEach(source => {
        layerB.forEach(target => {
          this.connections.push({
            source,
            target,
            id: `${source.id}-${target.id}`,
            glow: 0
          });
        });
      });
    }
  }

  private drawConnections(): void {
    this.svg.selectAll('line')
      .data(this.connections, (d: any) => d.id)
      .enter()
      .append('line')
      .attr('id', d => d.id)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', '#999')
      .attr('stroke-width', 1)
      .attr('opacity', 0.3);
  }

  private drawNeurons(): void {
    // halo layer first
    this.svg.selectAll('circle.halo')
      .data(this.neurons, (d: any) => d.id + '-halo')
      .enter()
      .append('circle')
      .attr('class', 'halo')
      .attr('id', d => `${d.id}-halo`)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 15)
      .attr('fill', 'none')
      .attr('stroke', 'gold')
      .attr('stroke-width', 4)
      .attr('opacity', 0);

    // main neuron circles
    this.svg.selectAll('circle.node')
      .data(this.neurons, (d: any) => d.id)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('id', d => d.id)
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
    const maxRadius = 12;

    d3.timer(() => {
      this.neurons.forEach(n => {
        // smooth update to target values
        n.value += (n.targetValue - n.value) * 0.1;

        let pulseValue = 0;
        if (this.activationQueue.length > 0 && n.layer === this.pulseIndex) {
          pulseValue = n.value;
          n.glow = Math.max(n.glow, pulseValue); // boost glow
        }

        const radius = baseRadius + (maxRadius - baseRadius) * pulseValue;
        this.svg.select<SVGCircleElement>(`#${n.id}`)
          .attr('r', radius)
          .attr('fill', `rgba(70,130,180, ${0.3 + 0.7 * n.value})`);

        // decay halo glow
        n.glow *= 0.9;
        this.svg.select<SVGCircleElement>(`#${n.id}-halo`)
          .attr('opacity', n.glow)
          .attr('r', radius + 1 * n.glow);
      });

      // fade connections
      this.connections.forEach(c => {
        c.glow *= 0.9;
        this.svg.select<SVGLineElement>(`#${c.id}`)
          .attr('stroke', d3.interpolateRgb('#999', 'orange')(c.glow))
          .attr('stroke-width', 1 + 5 * c.glow)
          .attr('opacity', 0.2 + 0.6 * c.glow);
      });

      if (this.showValues) this.updateValueLabels();
    });

    setInterval(() => {
      if (this.activationQueue.length === 0) return;

      // boost connection glow for active layer
      this.connections.forEach(c => {
        if (c.source.layer === this.pulseIndex) {
          c.glow = Math.max(c.glow, c.source.value);
        }
      });

      this.pulseIndex++;
      if (this.pulseIndex >= this.layerSizes.length) {
        this.pulseIndex = 0;
        this.activationQueue.shift();
      }
    }, this.pulseDuration);
  }

  private startActivationStream(creatureName: string): void {
    this.eventSource = new EventSource(`http://127.0.0.1:8000/battle/nn-stream/${creatureName}`);

    this.eventSource.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as { epoch: number; activations: number[][] };
      if (!data.activations || data.activations.length === 0) return;

      this.activationQueue.push(data.activations[0]);

      data.activations.forEach((layerValues, layerIndex) => {
        this.neurons
          .filter(n => n.layer === layerIndex)
          .forEach((neuron, i) => {
            neuron.targetValue = layerValues[i] ?? 0;
          });
      });
    };
  }
}
