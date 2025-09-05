import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  AfterViewInit,
  ViewChild,
} from '@angular/core';
import * as d3 from 'd3';

interface Node {
  layer: number;
  index: number;
  x: number;
  y: number;
  activation: number;
}

interface Link {
  source: Node;
  target: Node;
  weight: number;
}

@Component({
  selector: 'app-nn-graph-5',
  template: `
    <div class="controls">
      <button (click)="toggleValues()">
        {{ showValues ? 'Hide Values' : 'Show Values' }}
      </button>
    </div>
    <svg #svgRef width="800" height="600"></svg>
  `,
  styles: [
    `
      .controls {
        margin-bottom: 10px;
      }
      svg {
        border: 1px solid #ccc;
      }
      .node-label {
        font-size: 10px;
        fill: #333;
        pointer-events: none;
      }
    `,
  ],
})
export class NnGraph5Component
  implements OnInit, AfterViewInit, OnDestroy
{
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private nodes: Node[] = [];
  private links: Link[] = [];
  private eventSource?: EventSource;

  private nodeSelection!: d3.Selection<SVGCircleElement, Node, SVGGElement, unknown>;
  private labelSelection!: d3.Selection<SVGTextElement, Node, SVGGElement, unknown>;

  showValues = false;

  ngOnInit(): void {
    // nothing here yet
  }

  ngAfterViewInit(): void {
    this.svg = d3.select(this.svgRef.nativeElement);
    this.initGraph();
    this.startActivationStream('A'); // Replace "A" with your creature name
  }

  ngOnDestroy(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }

  private initGraph(): void {
    // Example: 3 layers with different neuron counts
    const layerConfig = [4, 6, 3];
    const width = 800;
    const height = 600;
    const layerSpacing = width / (layerConfig.length + 1);

    this.nodes = [];
    this.links = [];

    layerConfig.forEach((count, layerIndex) => {
      for (let i = 0; i < count; i++) {
        this.nodes.push({
          layer: layerIndex,
          index: i,
          x: (layerIndex + 1) * layerSpacing,
          y: (i + 1) * (height / (count + 1)),
          activation: 0,
        });
      }
    });

    // fully connect each layer to the next
    for (let l = 0; l < layerConfig.length - 1; l++) {
      const sourceNodes = this.nodes.filter((n) => n.layer === l);
      const targetNodes = this.nodes.filter((n) => n.layer === l + 1);

      sourceNodes.forEach((s) => {
        targetNodes.forEach((t) => {
          this.links.push({
            source: s,
            target: t,
            weight: Math.random() * 2 - 1, // random weights
          });
        });
      });
    }

    // Draw links
    this.svg
      .append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(this.links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', (d) => d.source.x)
      .attr('y1', (d) => d.source.y)
      .attr('x2', (d) => d.target.x)
      .attr('y2', (d) => d.target.y)
      .attr('stroke', (d) => (d.weight >= 0 ? 'steelblue' : 'tomato'))
      .attr('stroke-width', 1);

    // Draw nodes
    this.nodeSelection = this.svg
      .append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(this.nodes)
      .enter()
      .append('circle')
      .attr('class', 'node')
      .attr('cx', (d) => d.x)
      .attr('cy', (d) => d.y)
      .attr('r', 5)
      .attr('fill', (d) => d3.interpolateYlGnBu(d.activation));

    // Draw labels (initially hidden)
    this.labelSelection = this.svg
      .append('g')
      .attr('class', 'labels')
      .selectAll('text')
      .data(this.nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('x', (d) => d.x + 10)
      .attr('y', (d) => d.y + 3)
      .style('opacity', 0)
      .text((d) => d.activation.toFixed(2));
  }

  private startActivationStream(creatureName: string): void {
    this.eventSource = new EventSource(
      `http://127.0.0.1:8000/battle/nn-stream/${creatureName}`
    );

    this.eventSource.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as {
        epoch: number;
        activations: number[][];
      };

      if (!data.activations || data.activations.length === 0) return;

      this.updateGraph(data.activations);
    };
  }

  private updateGraph(activations: number[][]): void {
    // flatten activations back into this.nodes
    this.nodes.forEach((node) => {
      if (
        activations[node.layer] &&
        activations[node.layer][node.index] !== undefined
      ) {
        node.activation = activations[node.layer][node.index];
      }
    });

    // animate nodes pulsing
    this.nodeSelection
      .data(this.nodes)
      .transition()
      .duration(300)
      .attr('r', (d) => 5 + d.activation * 8)
      .attr('fill', (d) => d3.interpolateYlGnBu(d.activation));

    // update labels
    this.labelSelection
      .data(this.nodes)
      .transition()
      .duration(300)
      .style('opacity', this.showValues ? 1 : 0)
      .text((d) => d.activation.toFixed(2));
  }

  toggleValues(): void {
    this.showValues = !this.showValues;
    this.labelSelection.style('opacity', this.showValues ? 1 : 0);
  }
}
