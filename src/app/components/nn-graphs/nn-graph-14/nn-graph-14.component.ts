import { Component, effect, ElementRef, Input, OnInit, ViewChild, WritableSignal } from '@angular/core';
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

export const easingFunctions: { [key: string]: (t: number) => number } = {
  linear: d3.easeLinear,
  quadIn: d3.easeQuadIn,
  quadOut: d3.easeQuadOut,
  quadInOut: d3.easeQuadInOut,
  cubicIn: d3.easeCubicIn,
  cubicOut: d3.easeCubicOut,
  cubicInOut: d3.easeCubicInOut,
  polyIn: d3.easePolyIn,
  polyOut: d3.easePolyOut,
  polyInOut: d3.easePolyInOut,
  expIn: d3.easeExpIn,
  expOut: d3.easeExpOut,
  expInOut: d3.easeExpInOut,
  circleIn: d3.easeCircleIn,
  circleOut: d3.easeCircleOut,
  circleInOut: d3.easeCircleInOut,
  backIn: d3.easeBackIn,
  backOut: d3.easeBackOut,
  backInOut: d3.easeBackInOut,
  elasticIn: d3.easeElasticIn,
  elasticOut: d3.easeElasticOut,
  elasticInOut: d3.easeElasticInOut,
  bounceIn: d3.easeBounceIn,
  bounceOut: d3.easeBounceOut,
  bounceInOut: d3.easeBounceInOut
};

@Component({
  selector: 'app-nn-graph-14',
  template: `
    <div style="margin-bottom: 8px;">
      <button (click)="toggleShowWeights()">
        {{ showWeights ? 'Hide' : 'Show' }} Weights
      </button>
      <button (click)="toggleShowPulses()">
        {{ showPulses ? 'Hide' : 'Show' }} Pulses
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
export class NnGraph14Component implements OnInit {
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  @Input({ required: true }) activations!: WritableSignal<{ epoch: number, activations: number[][] } | null>;

  @Input() haloRadius = 12;
  @Input() passDirection: 'forward' | 'backward' | 'none' = 'backward';
  @Input() showActivation = false;
  @Input() weightFontColor = 'white';
  @Input() showPulses = false;

  @Input() easeType = easingFunctions['linear'];
  @Input() linkPulseScale = 4;
  @Input() linkPulseOpacity = 0.7;

  showWeights = false;

  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private nodes: Node[] = [];
  private links: Link[] = [];

  private tickDuration = 1000;
  private easeDuration = this.tickDuration;
  private pulseDuration = this.tickDuration * 0.9;

  constructor() {
    effect(() => {
      const data = this.activations();
      if (data) {
        this.updateGraph(data.activations, data.epoch);
      }
    });
  }

  ngOnInit(): void {
    this.svg = d3.select(this.svgRef.nativeElement);
    this.buildStaticLayout();
  }

  toggleShowWeights(): void {
    this.showWeights = !this.showWeights;
    this.updateGraph([]);
  }

  toggleShowPulses(): void {
    this.showPulses = !this.showPulses;
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
          this.links.push({ source: src, target: tgt, weight: Math.random() * 2 - 1 });
        });
      });
    }

    this.updateGraph([]);
  }

  private updateGraph(activations: number[][], epoch?: number): void {
    if (activations.length > 0) {
      activations.forEach((layer, l) => {
        layer.forEach((act, i) => {
          const node = this.nodes.find(n => n.layer === l && n.index === i);
          if (node) {
            const value = Array.isArray(act)
              ? d3.mean(act as number[]) ?? 0
              : (act as number);
            node.activation = value;
          }
        });
      });
    }

    const weightColorScale = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(['tomato', 'cyan', 'steelblue']);

    const activationColor = d3.scaleLinear<string>()
      .domain([0, 1])
      .range(['tomato', 'cyan', 'steelblue']);

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
        .attr('stroke-width', d => 1 + Math.abs(d.source.activation - d.target.activation) * this.linkPulseScale)
        .attr('opacity', d => Math.abs(d.source.activation - d.target.activation) * this.linkPulseOpacity);
    };

    enterLinks.call(updateLinkTransition);
    linkSel.call(updateLinkTransition);
    linkSel.exit().remove();

    // WEIGHTS TEXT
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

    // PULSES (spawn fresh each time)
    if (this.showPulses && this.passDirection !== 'none' && epoch !== undefined) {
      this.links.forEach(d => {
        const forward = this.passDirection === 'forward';
        const xStart = forward ? d.source.x : d.target.x;
        const yStart = forward ? d.source.y : d.target.y;
        const xEnd   = forward ? d.target.x : d.source.x;
        const yEnd   = forward ? d.target.y : d.source.y;
        const act = forward ? Math.max(0, d.source.activation) : Math.max(0, d.target.activation);

        this.svg.append('circle')
          .attr('class', 'pulse')
          .attr('cx', xStart)
          .attr('cy', yStart)
          .attr('r', 3 + 4 * act)
          .attr('opacity', 0.9)
          .attr('fill', weightColorScale(d.weight))
          .transition()
          .duration(this.pulseDuration)
          .ease(this.easeType)
          .attr('cx', xEnd)
          .attr('cy', yEnd)
          .attr('opacity', 0.2)
          .remove();
      });
    }

    // NODES + HALO
    const nodeGroup = this.svg.selectAll<SVGGElement, Node>('.node-group')
      .data(this.nodes, d => `${d.layer}-${d.index}`);

    const nodeEnter = nodeGroup.enter()
      .append('g')
      .attr('class', 'node-group');

    nodeEnter.append('circle')
      .attr('class', 'halo')
      .attr('r', 0)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 5)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

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
      .attr('opacity', d => d.activation > 0.1 ? 1 : 0)
      .attr('fill', d => activationColor(d.activation));

    nodeMerge.select<SVGCircleElement>('.node')
      .transition().duration(this.easeDuration).ease(this.easeType)
      .attr('r', d => 5 + d.activation * 5)
      .attr('fill', d => activationColor(d.activation));

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
