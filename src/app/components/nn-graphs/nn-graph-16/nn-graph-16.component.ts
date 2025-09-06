import { Component, effect, ElementRef, Input, OnInit, ViewChild, WritableSignal, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { BattleService } from '../../../services/battle/battle.service';

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
  selector: 'app-nn-graph-16',
  template: `
    <div style="margin-bottom: 8px;">
      <button (click)="toggleShowWeights()">
        {{ showWeights ? 'Hide' : 'Show' }} Weights
      </button>
      <button (click)="toggleShowPulses()">
        {{ showPulses ? 'Hide' : 'Show' }} Pulses
      </button>
      <button (click)="togglePulseDirection()">
        {{ passDirection }} Pulse Direction
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
export class NnGraph16Component implements OnInit, AfterViewInit {
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  @Input({ required: true }) activations!: WritableSignal<{ epoch: number, activations: number[][] } | null>;
  @Input() haloRadius = 12;
  @Input() passDirection: 'forward' | 'backward' | 'none' = 'forward';
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
  private layerMapping: number[][][] = [];
  private tickDuration = 1000;
  private easeDuration = this.tickDuration;
  private pulseDuration = this.tickDuration * 0.9;

  constructor(private battleService: BattleService) {
    effect(() => {
      const data = this.activations();
      if (data?.activations?.length) {
        this.buildDynamicLayoutFromActivations(data.activations);
        this.updateGraph(data.activations, data.epoch);
      } else {
        // Clear graph if no activations yet
        this.nodes = [];
        this.links = [];
        this.layerMapping = [];
        this.svg?.selectAll('*').remove();
      }
    });
  }

  ngOnInit(): void {
    this.svg = d3.select(this.svgRef.nativeElement);
    // No static layout — graph renders only when activations exist
    this.svg.selectAll('*').remove();
  }

  ngAfterViewInit(): void {}

  toggleShowWeights(): void {
    this.showWeights = !this.showWeights;
    this.updateGraph([]);
  }

  toggleShowPulses(): void {
    this.showPulses = !this.showPulses;
    this.updateGraph([]);
  }

  togglePulseDirection(): void {
    this.passDirection = this.passDirection === 'forward' ? 'backward' : 'forward';
  }

  private buildDynamicLayoutFromActivations(activations: number[][]): void {
    if (!activations || !activations.length) return;

    const width = this.svgRef.nativeElement.clientWidth;
    const height = this.svgRef.nativeElement.clientHeight;

    this.nodes = [];
    this.links = [];
    this.layerMapping = [];

    const layerXGap = width / (activations.length + 1);

    activations.forEach((layer, layerIndex) => {
      const displayUnits = Array.isArray(layer[0]) ? layer : layer.map(v => [v]);
      const mapping: number[][] = [];
      const yGap = height / (displayUnits.length + 1);

      displayUnits.forEach((_, i) => {
        this.nodes.push({
          layer: layerIndex,
          index: i,
          x: (layerIndex + 1) * layerXGap,
          y: (i + 1) * yGap,
          activation: 0
        });
        mapping.push([i]);
      });

      this.layerMapping.push(mapping);
    });

    // Build links between layers
    for (let l = 0; l < this.layerMapping.length - 1; l++) {
      const fromLayer = this.nodes.filter(n => n.layer === l);
      const toLayer = this.nodes.filter(n => n.layer === l + 1);
      fromLayer.forEach(src => toLayer.forEach(tgt => this.links.push({ source: src, target: tgt, weight: Math.random() * 2 - 1 })));
    }

    this.updateGraph(activations);
  }

  private updateGraph(activations: number[][], epoch?: number): void {
    // Update node activations
    if (activations.length > 0) {
      activations.forEach((layer: number[], l: number) => {
        const mapping = this.layerMapping[l];
        mapping.forEach((indices: number[], i: number) => {
          const node = this.nodes.find(n => n.layer === l && n.index === i);
          if (node) node.activation = d3.mean(indices.map(idx => layer[idx])) ?? 0;
        });
      });
    }

    const weightColorScale = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(['steelblue', 'cyan', 'tomato']);

    // Links
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
          if (this.passDirection === 'backward') return (this.nodes[this.nodes.length - 1].layer - d.source.layer) * 100;
          return 0;
        })
        .attr('stroke-width', d => 1 + Math.abs(d.source.activation - d.target.activation) * this.linkPulseScale)
        .attr('opacity', d => Math.abs(d.source.activation - d.target.activation) * this.linkPulseOpacity);
    };

    enterLinks.call(updateLinkTransition);
    linkSel.call(updateLinkTransition);
    linkSel.exit().remove();

    // Pulses
    if (this.showPulses && this.passDirection !== 'none' && epoch !== undefined) {
      this.links.forEach(d => {
        const forward = this.passDirection === 'forward';
        const xStart = forward ? d.source.x : d.target.x;
        const yStart = forward ? d.source.y : d.target.y;
        const xEnd = forward ? d.target.x : d.source.x;
        const yEnd = forward ? d.target.y : d.source.y;
        const act = forward ? Math.max(0, d.source.activation) : Math.max(0, d.target.activation);
        const pulseColor = weightColorScale(d.weight);

        this.svg.append('circle')
          .attr('class', 'pulse')
          .attr('cx', xStart)
          .attr('cy', yStart)
          .attr('r', 3 + 4 * act)
          .attr('fill', pulseColor)
          .attr('opacity', 0.9)
          .transition()
          .duration(this.pulseDuration)
          .ease(this.easeType)
          .attr('cx', xEnd)
          .attr('cy', yEnd)
          .attr('opacity', 0)
          .remove();
      });
    }

    // Nodes
    const nodeGroup = this.svg.selectAll<SVGGElement, Node>('.node-group')
      .data(this.nodes, d => `${d.layer}-${d.index}`);

    const nodeEnter = nodeGroup.enter().append('g').attr('class', 'node-group');
    nodeEnter.append('circle').attr('class', 'halo').attr('r', 0).attr('cx', d => d.x).attr('cy', d => d.y);
    nodeEnter.append('circle').attr('class', 'node').attr('r', 5).attr('cx', d => d.x).attr('cy', d => d.y);

    const nodeMerge = nodeEnter.merge(nodeGroup as any);

    nodeMerge.select<SVGCircleElement>('.halo')
      .transition().duration(this.easeDuration).ease(this.easeType)
      .attr('r', d => d.activation > 0 ? this.haloRadius * d.activation : 0)
      .attr('opacity', d => d.activation > 0.1 ? 1 : 0)
      .attr('fill', d => {
        const linked = this.links.find(l => l.source === d || l.target === d);
        return linked ? weightColorScale(linked.weight) : 'white';
      });

    nodeMerge.select<SVGCircleElement>('.node')
      .transition().duration(this.easeDuration).ease(this.easeType)
      .attr('r', d => 5 + d.activation * 5)
      .attr('fill', d => {
        const linked = this.links.find(l => l.source === d || l.target === d);
        return linked ? weightColorScale(linked.weight) : 'white';
      });

    nodeGroup.exit().remove();
  }
}
