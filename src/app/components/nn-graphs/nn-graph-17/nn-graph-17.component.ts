import { Component, effect, ElementRef, Input, OnInit, ViewChild, WritableSignal, AfterViewInit } from '@angular/core';
import * as d3 from 'd3';
import { BattleService } from '../../../services/battle/battle.service';
import { Activations } from '../../../shared/models/activations.model';

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
    <div class="tooltip" #tooltip></div>
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
    .tooltip {
      position: absolute;
      pointer-events: none;
      background: rgba(0,0,0,0.8);
      color: white;
      padding: 4px 6px;
      border-radius: 4px;
      font-size: 12px;
      opacity: 0;
      transition: opacity 0.2s;
    }
  `]
})
export class NnGraph17Component implements OnInit, AfterViewInit {
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('tooltip', { static: true }) tooltipRef!: ElementRef<HTMLDivElement>;
  @Input({ required: true }) activations!: WritableSignal<Activations | null>;
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
  private tooltip!: d3.Selection<HTMLDivElement, unknown, null, undefined>;
  private currentCreature: string | null = null;

  private tickDuration = 1000;
  private easeDuration = this.tickDuration;
  private pulseDuration = this.tickDuration * 0.9;

  private sessionId = 0;
  private _currentNodes: Node[] = [];
  private _currentLinks: Link[] = [];
  private _currentLayerMapping: number[][][] = [];

  // Color scales
  private weightColorScale = d3.scaleLinear<string>()
    .domain([-1, 0, 1])
    .range(['steelblue', 'cyan', 'tomato']);

  private activationColorScale = d3.scaleLinear<string>()
    .domain([0, 1])
    .range(['steelblue', 'tomato']); 

  constructor(private battleService: BattleService) {
    effect(() => {
      const data = this.activations();

      if (!data?.activations?.length) {
        this.hardResetSvg();
        return;
      }

      if (this.currentCreature !== data.creature) {
        this.currentCreature = data.creature;
        this.sessionId++;
        this.hardResetSvg();
        const layout = this.buildDynamicLayoutFromActivations(data.activations);
        this.renderLayout(layout);
        this.updateGraph(data.activations, data.epoch, layout, this.sessionId);
      } else {
        const layout = this.ensureLayoutForCurrent(data.activations);
        this.updateGraph(data.activations, data.epoch, layout, this.sessionId);
      }
    });
  }

  ngOnInit(): void {
    this.svg = d3.select(this.svgRef.nativeElement);
    this.svg.selectAll('*').remove();
  }

  ngAfterViewInit(): void {
    this.tooltip = d3.select(this.tooltipRef.nativeElement);
  }

  toggleShowWeights(): void {
    this.showWeights = !this.showWeights;
    if (this.currentCreature) {
      const data = this.activations();
      const layout = this.ensureLayoutForCurrent(data?.activations || []);
      this.updateGraph(data?.activations || [], undefined, layout, this.sessionId);
    }
  }

  toggleShowPulses(): void {
    this.showPulses = !this.showPulses;
    if (this.currentCreature) {
      const data = this.activations();
      const layout = this.ensureLayoutForCurrent(data?.activations || []);
      this.updateGraph(data?.activations || [], undefined, layout, this.sessionId);
    }
  }

  togglePulseDirection(): void {
    this.passDirection = this.passDirection === 'forward' ? 'backward' : 'forward';
  }

  private hardResetSvg(): void {
    this.svg.selectAll('*').interrupt();
    (this.svg.node() as SVGSVGElement)?.replaceChildren();
    this._currentNodes = [];
    this._currentLinks = [];
    this._currentLayerMapping = [];
  }

  private ensureLayoutForCurrent(activations: number[][]) {
    if (this._currentNodes.length && this._currentLinks.length) {
      return {
        nodes: this._currentNodes,
        links: this._currentLinks,
        layerMapping: this._currentLayerMapping
      };
    }
    const layout = this.buildDynamicLayoutFromActivations(activations);
    this.renderLayout(layout);
    return layout;
  }

  private buildDynamicLayoutFromActivations(activations: number[][]) {
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

    for (let l = 0; l < layerMapping.length - 1; l++) {
      const fromLayer = nodes.filter(n => n.layer === l);
      const toLayer = nodes.filter(n => n.layer === l + 1);
      fromLayer.forEach(src => toLayer.forEach(tgt => links.push({
        source: src,
        target: tgt,
        weight: Math.random() * 2 - 1
      })));
    }

    return { nodes, links, layerMapping };
  }

  private renderLayout(layout: { nodes: Node[], links: Link[], layerMapping: number[][][] }) {
    const { nodes, links } = layout;

    // ---- Links with tooltip ----
    this.svg.selectAll<SVGLineElement, Link>('.link')
      .data(links, d => `${d.source.layer}-${d.source.index}-${d.target.layer}-${d.target.index}`)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', d => this.weightColorScale(d.weight))
      .attr('stroke-width', 1)
      .attr('opacity', 1)
      .on('mouseover', (event, d) => {
        this.tooltip
          .style('opacity', 1)
          .html(`Weight: ${d.weight.toFixed(3)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 20}px`);
      })
      .on('mousemove', (event) => {
        this.tooltip
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 20}px`);
      })
      .on('mouseout', () => {
        this.tooltip.style('opacity', 0);
      });

    // ---- Nodes with tooltip ----
    const nodeGroup = this.svg.selectAll<SVGGElement, Node>('.node-group')
      .data(nodes, d => `${d.layer}-${d.index}`)
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
      .attr('fill', d => this.activationColorScale(d.activation))
      .on('mouseover', (event, d) => {
        this.tooltip
          .style('opacity', 1)
          .html(`Activation: ${d.activation.toFixed(3)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 20}px`);
      })
      .on('mousemove', (event, d) => {
        this.tooltip
          .html(`Activation: ${d.activation.toFixed(3)}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 20}px`);
      })
      .on('mouseout', () => {
        this.tooltip.style('opacity', 0);
      });

    this._currentNodes = nodes;
    this._currentLinks = links;
    this._currentLayerMapping = layout.layerMapping;
  }

  private updateGraph(
    activations: number[][],
    epoch: number | undefined,
    layout: { nodes: Node[], links: Link[], layerMapping: number[][][] },
    sessionAtSchedule: number
  ) {
    const { nodes, links, layerMapping } = layout;

    if (activations.length > 0) {
      activations.forEach((layer: number[], l: number) => {
        const mapping = layerMapping[l];
        mapping.forEach((indices: number[], i: number) => {
          const node = nodes.find(n => n.layer === l && n.index === i);
          if (node) node.activation = d3.mean(indices.map(idx => layer[idx])) ?? 0;
        });
      });
    }

    this.svg.selectAll<SVGLineElement, Link>('.link')
      .data(links, d => `${d.source.layer}-${d.source.index}-${d.target.layer}-${d.target.index}`)
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('stroke-width', d => 1 + Math.abs(d.source.activation - d.target.activation) * this.linkPulseScale)
      .attr('opacity', d => Math.abs(d.source.activation - d.target.activation) * this.linkPulseOpacity)
      .attr('stroke', d => this.weightColorScale(d.weight));

    // ---- Pulses ----
    if (this.showPulses && this.passDirection !== 'none' && epoch !== undefined) {
      const localSession = sessionAtSchedule;
      links.forEach(d => {
        const forward = this.passDirection === 'forward';
        const xStart = forward ? d.source.x : d.target.x;
        const yStart = forward ? d.source.y : d.target.y;
        const xEnd = forward ? d.target.x : d.source.x;
        const yEnd = forward ? d.target.y : d.source.y;
        const act = forward ? Math.max(0, d.source.activation) : Math.max(0, d.target.activation);
        const pulseColor = this.weightColorScale(d.weight);

        const pulse = this.svg.append('circle')
          .attr('class', 'pulse')
          .attr('cx', xStart)
          .attr('cy', yStart)
          .attr('r', 3 + 4 * act)
          .attr('fill', pulseColor)
          .attr('opacity', 0.9);

        pulse.transition()
          .duration(this.pulseDuration)
          .ease(this.easeType)
          .attr('cx', xEnd)
          .attr('cy', yEnd)
          .attr('opacity', 0)
          .on('end', () => {
            if (localSession !== this.sessionId) {
              try { pulse.remove(); } catch {}
              return;
            }
            pulse.remove();
          });
      });
    }

    const nodeGroup = this.svg.selectAll<SVGGElement, Node>('.node-group')
      .data(nodes, d => `${d.layer}-${d.index}`);

    nodeGroup.select<SVGCircleElement>('.halo')
      .transition().duration(this.easeDuration).ease(this.easeType)
      .attr('r', d => d.activation > 0 ? this.haloRadius * d.activation : 0)
      .attr('opacity', d => d.activation > 0.1 ? 1 : 0)
      .attr('fill', d => this.activationColorScale(d.activation));

    nodeGroup.select<SVGCircleElement>('.node')
      .transition().duration(this.easeDuration).ease(this.easeType)
      .attr('r', d => 5 + d.activation * 5)
      .attr('fill', d => this.activationColorScale(d.activation));
  }
}
