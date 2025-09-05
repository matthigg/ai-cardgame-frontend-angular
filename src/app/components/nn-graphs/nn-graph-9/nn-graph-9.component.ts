import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
  selector: 'app-nn-graph-9',
  template: `
    <div style="margin-bottom: 8px;">
      <button (click)="toggleShowWeights()">
        {{ showWeights ? 'Hide' : 'Show' }} Weights
      </button>
    </div>
    <svg #svgRef></svg>
  `,
  styles: [`
    svg { width: 100%; height: 600px; background: #111; }
    .halo { pointer-events: none; }
    .activation-text, .weight-text {
      font-size: 12px;
      text-anchor: middle;
      pointer-events: none;
      font-family: monospace;
    }
  `]
})
export class NnGraph9Component implements OnInit, OnDestroy {
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  @Input() easeDuration = 600;
  @Input() easeType = d3.easeCubicInOut;
  @Input() haloRadius = 12;
  @Input() haloColor = 'rgba(255,255,0,0.4)';
  @Input() passDirection: 'forward' | 'backward' | 'none' = 'none';
  @Input() pulseDuration = 800;
  @Input() showActivation = false;
  @Input() weightFontColor = 'white';
  @Input() linkPulseScale = 4; // max width pulse
  @Input() linkPulseOpacity = 0.7; // max opacity pulse

  showWeights = false;

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private nodes: Node[] = [];
  private links: Link[] = [];
  private eventSource?: EventSource;

  ngOnInit(): void {
    this.svg = d3.select(this.svgRef.nativeElement);
    this.buildStaticLayout();
    this.startActivationStream('A');
  }

  ngOnDestroy(): void {
    this.eventSource?.close();
  }

  toggleShowWeights(): void {
    this.showWeights = !this.showWeights;
    this.updateGraph([]);
  }

  private buildStaticLayout(): void {
    const layers = [3, 5, 2];
    const width = this.svgRef.nativeElement.clientWidth;
    const height = this.svgRef.nativeElement.clientHeight;

    this.nodes = [];
    const layerXGap = width / (layers.length + 1);

    layers.forEach((count, layerIndex) => {
      const yGap = height / (count + 1);
      for (let i = 0; i < count; i++) {
        this.nodes.push({
          layer: layerIndex,
          index: i,
          x: (layerIndex + 1) * layerXGap,
          y: (i + 1) * yGap,
          activation: 0
        });
      }
    });

    this.links = [];
    for (let l = 0; l < layers.length - 1; l++) {
      const fromLayer = this.nodes.filter(n => n.layer === l);
      const toLayer = this.nodes.filter(n => n.layer === l + 1);

      fromLayer.forEach(src => {
        toLayer.forEach(tgt => {
          this.links.push({
            source: src,
            target: tgt,
            weight: Math.random() * 2 - 1
          });
        });
      });
    }

    this.updateGraph([]);
  }

  private startActivationStream(creatureName: string): void {
    this.eventSource = new EventSource(`http://127.0.0.1:8000/battle/nn-stream/${creatureName}`);

    this.eventSource.onmessage = (event: MessageEvent) => {
      const data = JSON.parse(event.data) as { epoch: number; activations: number[][] };
      if (!data.activations || data.activations.length === 0) return;
      this.updateGraph(data.activations);
    };
  }

  private updateGraph(activations: number[][]): void {
    if (activations.length > 0) {
      activations.forEach((layer, l) => {
        layer.forEach((act, i) => {
          const node = this.nodes.find(n => n.layer === l && n.index === i);
          if (node) node.activation = act;
        });
      });
    }

    // Color scale for weights (smooth interpolation)
    const weightColorScale = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(['tomato', '#aaa', 'steelblue']);

    // LINKS
    const linkSel = this.svg.selectAll<SVGLineElement, Link>('.link')
      .data(this.links, d => `${d.source.layer}-${d.source.index}-${d.target.layer}-${d.target.index}`);

    const enterLinks = linkSel.enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', d => weightColorScale(d.weight))
      .attr('stroke-width', 1)
      .attr('opacity', 0);

    const updateLinkTransition = (selection: d3.Selection<SVGLineElement, Link, any, any>) => {
      selection.transition()
        .duration(this.easeDuration)
        .ease(this.easeType)
        .delay(d => {
          if (this.passDirection === 'forward') return d.source.layer * 100;
          if (this.passDirection === 'backward') return (this.nodes[this.nodes.length-1].layer - d.source.layer) * 100;
          return 0;
        })
        .attr('stroke-width', d => 1 + Math.abs(d.source.activation - d.target.activation) * this.linkPulseScale)
        .attr('opacity', d => Math.abs(d.source.activation - d.target.activation) * this.linkPulseOpacity)
        .attrTween('stroke', function(d) {
          const interp = d3.interpolateRgb(weightColorScale(d.weight), d.weight >= 0 ? 'steelblue' : 'tomato');
          return t => interp(t);
        });
    };

    enterLinks.call(updateLinkTransition);
    linkSel.call(updateLinkTransition);
    linkSel.exit().remove();

    // LINK WEIGHT TEXT
    const weightSel = this.svg.selectAll<SVGTextElement, Link>('.weight-text')
      .data(this.showWeights ? this.links : [], d => `${d.source.layer}-${d.source.index}-${d.target.layer}-${d.target.index}`);

    const weightEnter = weightSel.enter()
      .append('text')
      .attr('class', 'weight-text')
      .attr('font-size', 12)
      .attr('fill', this.weightFontColor);

    weightEnter.merge(weightSel as any)
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2 - 5)
      .text(d => d.weight.toFixed(2));

    weightSel.exit().remove();

    // PULSING SIGNALS
    if (this.passDirection !== 'none') {
      const pulseSel = this.svg.selectAll<SVGCircleElement, Link>('.pulse').data(this.links, d => `${d.source.layer}-${d.source.index}-${d.target.layer}-${d.target.index}`);

      const pulseEnter = pulseSel.enter()
        .append('circle')
        .attr('class', 'pulse')
        .attr('r', 4)
        .attr('fill', 'yellow')
        .attr('opacity', 0.8);

      const pulseMerge = pulseEnter.merge(pulseSel as any);

      pulseMerge.each((d, i, nodes) => {
        const circle = d3.select(nodes[i]);
        const x1 = d.source.x, y1 = d.source.y;
        const x2 = d.target.x, y2 = d.target.y;
        const sourceAct = Math.max(0, d.source.activation);

        const travel = () => {
          circle
            .attr('cx', x1)
            .attr('cy', y1)
            .attr('r', 3 + 4 * sourceAct)
            .attr('opacity', 0.6 + 0.4 * sourceAct)
            .transition()
            .duration(this.pulseDuration)
            .ease(this.easeType)
            .attr('cx', x2)
            .attr('cy', y2)
            .attr('opacity', 0)
            .on('end', () => setTimeout(travel, 50));
        };

        if ((this.passDirection === 'forward' && d.source.layer <= d.target.layer) ||
            (this.passDirection === 'backward' && d.source.layer >= d.target.layer)) {
          travel();
        }
      });

      pulseSel.exit().remove();
    }

    // NODES + HALO + ACTIVATION TEXT
    const nodeGroup = this.svg.selectAll<SVGGElement, Node>('.node-group')
      .data(this.nodes, d => `${d.layer}-${d.index}`);

    const nodeEnter = nodeGroup.enter()
      .append('g')
      .attr('class', 'node-group');

    nodeEnter.append('circle')
      .attr('class', 'halo')
      .attr('r', 0)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('fill', this.haloColor);

    nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 5)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('fill', d3.interpolateYlGnBu(0));

    if (this.showActivation) {
      nodeEnter.append('text')
        .attr('class', 'activation-text')
        .attr('x', d => d.x)
        .attr('y', d => d.y - 12)
        .attr('fill', 'white')
        .text(d => d.activation.toFixed(2));
    }

    const nodeMerge = nodeEnter.merge(nodeGroup as any);

    nodeMerge.select<SVGCircleElement>('.halo')
      .transition().duration(this.easeDuration).ease(this.easeType)
      .attr('r', d => d.activation > 0 ? this.haloRadius * d.activation : 0)
      .attr('opacity', d => d.activation > 0.1 ? 1 : 0);

    nodeMerge.select<SVGCircleElement>('.node')
      .transition().duration(this.easeDuration).ease(this.easeType)
      .attr('r', d => 5 + d.activation * 5)
      .attr('fill', d => d3.interpolateYlGnBu(d.activation));

    if (this.showActivation) {
      nodeMerge.select<SVGTextElement>('.activation-text')
        .transition().duration(this.easeDuration).ease(this.easeType)
        .attr('x', d => d.x)
        .attr('y', d => d.y - 12)
        .text(d => d.activation.toFixed(2));
    }

    nodeGroup.exit().remove();
  }
}
