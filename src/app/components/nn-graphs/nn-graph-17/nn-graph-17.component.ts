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

@Component({
  selector: 'app-nn-graph-17',
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
export class NnGraph17Component implements OnInit, AfterViewInit {
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  @Input({ required: true }) activations!: WritableSignal<{ creature: string, epoch: number, activations: number[][] } | null>;
  @Input() haloRadius = 12;
  @Input() passDirection: 'forward' | 'backward' | 'none' = 'forward';
  @Input() showActivation = false;
  @Input() weightFontColor = 'white';
  @Input() showPulses = false;
  @Input() easeType: (t: number) => number = d3.easeLinear;
  @Input() linkPulseScale = 4;
  @Input() linkPulseOpacity = 0.7;

  showWeights = false;
  private svg!: d3.Selection<SVGSVGElement, unknown, null, undefined>;
  private currentCreature: string | null = null;

  private tickDuration = 1000;
  private easeDuration = this.tickDuration;
  private pulseDuration = this.tickDuration * 0.9;

  constructor(private battleService: BattleService) {
    effect(() => {
      const data = this.activations();
      if (!data?.activations?.length) {
        this.clearGraph();
        return;
      }

      if (this.currentCreature !== data.creature) {
        this.currentCreature = data.creature;
        this.clearGraph();
        this.renderFullGraph(data.activations, data.epoch, data.creature);
      } else {
        this.updateActivations(data.activations, data.epoch);
      }
    });
  }

  ngOnInit(): void {
    this.svg = d3.select(this.svgRef.nativeElement);
    this.svg.selectAll('*').remove();
  }

  ngAfterViewInit(): void {}

  toggleShowWeights(): void {
    this.showWeights = !this.showWeights;
    if (this.currentCreature) {
      this.updateActivations([], undefined);
    }
  }

  toggleShowPulses(): void {
    this.showPulses = !this.showPulses;
    if (this.currentCreature) {
      this.updateActivations([], undefined);
    }
  }

  // toggleShowWeights(): void {
  //   this.showWeights = !this.showWeights;
  //   if (this.currentCreature) {
  //     const layout = this.buildDynamicLayoutFromActivations(this.activations()?.activations || []);
  //     this.updateGraph(this.activations()?.activations || [], undefined, this.currentCreature, layout);
  //   }
  // }

  // toggleShowPulses(): void {
  //   this.showPulses = !this.showPulses;
  //   if (this.currentCreature) {
  //     const layout = this.buildDynamicLayoutFromActivations(this.activations()?.activations || []);
  //     this.updateGraph(this.activations()?.activations || [], undefined, this.currentCreature, layout);
  //   }
  // }

  togglePulseDirection(): void {
    this.passDirection = this.passDirection === 'forward' ? 'backward' : 'forward';
  }

  private clearGraph(): void {
    console.log('--- clear graph B ---');
    this.svg.selectAll('*').remove();
  }

  private renderFullGraph(activations: number[][], epoch: number, creature: string) {
    const width = this.svgRef.nativeElement.clientWidth;
    const height = this.svgRef.nativeElement.clientHeight;

    const nodes: Node[] = [];
    const links: Link[] = [];
    const layerMapping: number[][][] = [];

    const layerXGap = width / (activations.length + 1);

    activations.forEach((layer, layerIndex) => {
      const displayUnits = Array.isArray(layer[0]) ? layer : layer.map(v => [v]);
      const mapping: number[][] = [];
      const yGap = height / (displayUnits.length + 1);

      displayUnits.forEach((_, i) => {
        nodes.push({
          layer: layerIndex,
          index: i,
          x: (layerIndex + 1) * layerXGap,
          y: (i + 1) * yGap,
          activation: 0
        });
        mapping.push([i]);
      });

      layerMapping.push(mapping);
    });

    // Links
    for (let l = 0; l < layerMapping.length - 1; l++) {
      const fromLayer = nodes.filter(n => n.layer === l);
      const toLayer = nodes.filter(n => n.layer === l + 1);
      fromLayer.forEach(src => toLayer.forEach(tgt => links.push({
        source: src,
        target: tgt,
        weight: Math.random() * 2 - 1
      })));
    }

    const weightColorScale = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(['steelblue', 'cyan', 'tomato']);

    // Render links
    this.svg.selectAll<SVGLineElement, Link>('.link')
      .data(links)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', d => weightColorScale(d.weight))
      .attr('stroke-width', 1)
      .attr('opacity', 1);

    // Render nodes
    const nodeGroup = this.svg.selectAll<SVGGElement, Node>('.node-group')
      .data(nodes)
      .enter()
      .append('g')
      .attr('class', 'node-group');

    nodeGroup.append('circle')
      .attr('class', 'halo')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 0)
      .attr('opacity', 0);

    nodeGroup.append('circle')
      .attr('class', 'node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 5)
      .attr('opacity', 1)
      .attr('fill', 'white');

    // Store for updating activations
    this._currentNodes = nodes;
    this._currentLinks = links;
    this._currentLayerMapping = layerMapping;
  }

  private _currentNodes: Node[] = [];
  private _currentLinks: Link[] = [];
  private _currentLayerMapping: number[][][] = [];

  private updateActivations(activations: number[][], epoch?: number) {
    const nodes = this._currentNodes;
    const links = this._currentLinks;
    const layerMapping = this._currentLayerMapping;

    if (!nodes.length || !links.length) return;

    if (activations.length > 0) {
      activations.forEach((layer: number[], l: number) => {
        const mapping = layerMapping[l];
        mapping.forEach((indices: number[], i: number) => {
          const node = nodes.find(n => n.layer === l && n.index === i);
          if (node) node.activation = d3.mean(indices.map(idx => layer[idx])) ?? 0;
        });
      });
    }

    const weightColorScale = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(['steelblue', 'cyan', 'tomato']);

    // Update links
    const linkSel = this.svg.selectAll<SVGLineElement, Link>('.link')
      .data(links);

    linkSel
      .attr('stroke-width', d => 1 + Math.abs(d.source.activation - d.target.activation) * this.linkPulseScale)
      .attr('opacity', d => Math.abs(d.source.activation - d.target.activation) * this.linkPulseOpacity)
      .attr('stroke', d => weightColorScale(d.weight));

    // Update nodes
    const nodeGroup = this.svg.selectAll<SVGGElement, Node>('.node-group')
      .data(nodes);

    nodeGroup.select<SVGCircleElement>('.halo')
      .attr('r', d => d.activation > 0 ? this.haloRadius * d.activation : 0)
      .attr('opacity', d => d.activation > 0.1 ? 1 : 0)
      .attr('fill', d => {
        const linked = links.find(l => l.source === d || l.target === d);
        return linked ? weightColorScale(linked.weight) : 'white';
      });

    nodeGroup.select<SVGCircleElement>('.node')
      .attr('r', d => 5 + d.activation * 5)
      .attr('fill', d => {
        const linked = links.find(l => l.source === d || l.target === d);
        return linked ? weightColorScale(linked.weight) : 'white';
      });
  }
}
