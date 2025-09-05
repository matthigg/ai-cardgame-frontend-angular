import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-nn-graph',
  template: `<svg #svg width="600" height="300"></svg>`,
})
export class NnGraphComponent implements OnInit {
  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private eventSource!: EventSource;

  ngOnInit(): void {
    this.svg = d3.select(this.svgRef.nativeElement);
    this.startActivationStream('A'); // replace with your creature name
  }

  private startActivationStream(creatureName: string) {
    this.eventSource = new EventSource(
      `http://127.0.0.1:8000/battle/nn-stream/${creatureName}`
    );

    this.eventSource.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as { epoch: number; activations: number[][] };
      if (!data.activations || data.activations.length === 0) return;
      this.updateGraph(data.activations);
    };
  }

  private updateGraph(activations: number[][]) {
    const layerCount = activations.length;
    const neuronCount = activations[0].length;

    // Flatten into neuron objects: {layer, index, value}
    const neurons = activations.flatMap((layer, layerIdx) =>
      layer.map((value, neuronIdx) => ({ layer: layerIdx, index: neuronIdx, value }))
    );

    // Bind data
    const circles = this.svg.selectAll<SVGCircleElement, any>('circle').data(neurons);

    // Enter + Update
    circles
      .join('circle')
      .attr('cx', d => 50 + d.layer * 100)
      .attr('cy', d => 50 + d.index * 25)
      .transition()
      .duration(300)
      .attr('r', d => d.value * 10 + 2) // radius proportional to activation
      .attr('fill', d => d3.interpolateViridis(d.value));

    // Optionally, remove extra circles if any
    circles.exit().remove();
  }
}
