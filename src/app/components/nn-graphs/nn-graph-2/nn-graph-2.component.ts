import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import * as d3 from 'd3';

@Component({
  selector: 'app-nn-graph-2',
  imports: [FormsModule],
  template: `
    <div>
      <label>
        <input type="checkbox" [(ngModel)]="showValues" />
        Show neuron values
      </label>
    </div>
    <svg #svg width="800" height="600"></svg>
    <div>Epoch: {{ currentEpoch }}</div>
  `,
  styles: []
})
export class NnGraph2Component implements OnInit, OnDestroy {
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private eventSource!: EventSource;

  neurons: { layer: number; index: number; x: number; y: number; value: number }[] = [];
  connections: { source: any; target: any }[] = [];
  currentEpoch: number = 0;
  showValues: boolean = false;

  ngOnInit(): void {
    this.svg = d3.select(this.svgRef.nativeElement);
    this.startActivationStream('A');
  }

  ngOnDestroy(): void {
    if (this.eventSource) this.eventSource.close();
  }

  private startActivationStream(creatureName: string) {
    this.eventSource = new EventSource(`http://127.0.0.1:8000/battle/nn-stream/${creatureName}`);

    this.eventSource.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as { epoch: number; activations: number[][] };
      this.currentEpoch = data.epoch;

      if (!data.activations || data.activations.length === 0) return;

      // Compute neuron positions per layer
      const width = 800;
      const height = 600;
      const layerCount = data.activations.length;

      this.neurons = [];
      data.activations.forEach((layer, layerIndex) => {
        const ySpacing = height / (layer.length + 1);
        const x = (width / (layerCount + 1)) * (layerIndex + 1);
        layer.forEach((value, neuronIndex) => {
          this.neurons.push({
            layer: layerIndex,
            index: neuronIndex,
            x,
            y: ySpacing * (neuronIndex + 1),
            value
          });
        });
      });

      // Compute connections (fully connected)
      this.connections = [];
      for (let l = 0; l < layerCount - 1; l++) {
        const currentLayer = this.neurons.filter(n => n.layer === l);
        const nextLayer = this.neurons.filter(n => n.layer === l + 1);
        currentLayer.forEach(src => {
          nextLayer.forEach(tgt => {
            this.connections.push({ source: src, target: tgt });
          });
        });
      }

      this.updateGraph();
    };
  }

  private updateGraph() {
    const colorScale = d3.scaleSequential(d3.interpolateCool).domain([0, 1]);
    const baseRadius = 10;
    const maxRadius = 30;

    // Draw connections
    const lines = this.svg.selectAll<SVGLineElement, typeof this.connections[0]>('line')
      .data(this.connections);

    lines.enter()
      .append('line')
      .attr('stroke', '#aaa')
      .attr('stroke-width', 1)
      .merge(lines)
      .transition()
      .duration(100)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    lines.exit().remove();

    // Draw neurons with pulsing animation
    const circles = this.svg.selectAll<SVGCircleElement, typeof this.neurons[0]>('circle')
      .data(this.neurons);

    const mergedCircles = circles.enter()
      .append('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', baseRadius)
      .attr('fill', d => colorScale(d.value))
      .merge(circles);

    mergedCircles
      .transition()
      .duration(200)
      .ease(d3.easeSin)
      .attr('r', d => baseRadius + (maxRadius - baseRadius) * d.value)
      .attr('fill', d => colorScale(d.value));

    circles.exit().remove();

    // Draw neuron values
    const texts = this.svg.selectAll<SVGTextElement, typeof this.neurons[0]>('text')
      .data(this.neurons);

    texts.enter()
      .append('text')
      .attr('x', d => d.x)
      .attr('y', d => d.y + 4)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .merge(texts)
      .text(d => this.showValues ? d.value.toFixed(2) : '');

    texts.exit().remove();
  }


  // private updateGraph() {
  //   const colorScale = d3.scaleSequential(d3.interpolateCool).domain([0, 1]);
  //   const radiusScale = d3.scaleLinear().domain([0, 1]).range([10, 30]);

  //   // Draw connections
  //   const lines = this.svg.selectAll<SVGLineElement, typeof this.connections[0]>('line')
  //     .data(this.connections);

  //   lines.enter()
  //     .append('line')
  //     .attr('stroke', '#aaa')
  //     .attr('stroke-width', 1)
  //     .merge(lines)
  //     .transition()
  //     .duration(100)
  //     .attr('x1', d => d.source.x)
  //     .attr('y1', d => d.source.y)
  //     .attr('x2', d => d.target.x)
  //     .attr('y2', d => d.target.y);

  //   lines.exit().remove();

  //   // Draw neurons
  //   const circles = this.svg.selectAll<SVGCircleElement, typeof this.neurons[0]>('circle')
  //     .data(this.neurons);

  //   circles.enter()
  //     .append('circle')
  //     .attr('cx', d => d.x)
  //     .attr('cy', d => d.y)
  //     .attr('r', 10)
  //     .attr('fill', d => colorScale(d.value))
  //     .merge(circles)
  //     .transition()
  //     .duration(100)
  //     .attr('r', d => radiusScale(d.value))
  //     .attr('fill', d => colorScale(d.value));

  //   circles.exit().remove();

  //   // Draw neuron values
  //   const texts = this.svg.selectAll<SVGTextElement, typeof this.neurons[0]>('text')
  //     .data(this.neurons);

  //   texts.enter()
  //     .append('text')
  //     .attr('x', d => d.x)
  //     .attr('y', d => d.y + 4)
  //     .attr('text-anchor', 'middle')
  //     .attr('font-size', '12px')
  //     .merge(texts)
  //     .text(d => this.showValues ? d.value.toFixed(2) : '');

  //   texts.exit().remove();
  // }
}
