import { Component, effect, ElementRef, Input, OnInit, ViewChild, WritableSignal, AfterViewInit, signal, Output, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { Activations } from '../../../shared/models/activations.model';
import { colorPalettes, defaultPalette, paletteObj } from '../../../shared/utils/utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  selector: 'app-nn-graph-19',
  imports: [CommonModule, FormsModule],
  template: `
    <div style="margin-bottom: 8px;">
      <select [(ngModel)]="selectedValue" (change)="handleColorPalette()">
        <option *ngFor="let palette of colorPaletteKeys" [value]="palette">{{ palette }}</option>
      </select>
      <button (click)="toggleShowPulses()">
        {{ showPulses ? 'Hide' : 'Show' }} Pulses
      </button>
      <button (click)="togglePulseDirection()">
        {{ passDirection }} Pulse Direction
      </button>
      <button (click)="toggleLayout()">
        {{ layoutVertical ? 'Horizontal Layout' : 'Vertical Layout' }}
      </button>
      <button (click)="toggleCenterNeurons()">
        {{ centerNeurons ? 'Center Neurons: ON' : 'Center Neurons: OFF' }}
      </button>
    </div>
    <div class="tooltip" #tooltip></div>
    <svg #svgRef></svg>
  `,
  styles: [`
    svg { width: 100%; height: 600px; background: #111; display: block; }
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
export class NnGraph19Component implements OnInit, AfterViewInit {
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('tooltip', { static: true }) tooltipRef!: ElementRef<HTMLDivElement>;
  @Input({ required: true }) activations!: WritableSignal<Activations | null>;
  @Input() haloRadius = 6;
  @Input() passDirection: 'forward' | 'backward' | 'none' = 'forward';
  @Input() showActivation = false;
  @Input() weightFontColor = 'white';
  @Input() showPulses = false;
  @Input() easeType: (t: number) => number = d3.easeLinear;
  @Input() linkPulseScale = 4;
  @Input() linkPulseOpacity = 0.7;
  @Input({ required: true }) isPlaying!: WritableSignal<boolean>;
  @Output() layoutToggled = new EventEmitter<'vertical' | 'horizontal'>();

  layoutVertical = false;
  showWeights = false;
  centerNeurons = true; 
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

  colorPaletteKeys: string[] = Object.keys(paletteObj);
  colorScale = signal(colorPalettes(defaultPalette));
  selectedValue: string = defaultPalette;

  handleColorPalette(): void {
    if (this.selectedValue) {
      this.colorScale.set(colorPalettes(this.selectedValue));
    }

    // Recreate scales using new palette
    this.weightColorScale = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(this.colorScale());

    this.activationColorScale = d3.scaleLinear<string>()
      .domain([0, 0.5, 1])
      .range(this.colorScale());
  }

  // Color scales (initialized with default palette)
  private weightColorScale = d3.scaleLinear<string>()
    .domain([-1, 0, 1])
    .range(this.colorScale());

  private activationColorScale = d3.scaleLinear<string>()
    .domain([0, 0.5, 1])
    .range(this.colorScale());

  constructor() {
    // Watch the activations signal and update graph
    effect(() => {
      const data = this.activations();

      if (!data?.activations?.length) {
        this.hardResetSvg();
        return;
      }

      if (this.currentCreature !== data.creature) {
        // Creature switched: full rebuild
        this.currentCreature = data.creature;
        this.sessionId++;
        this.hardResetSvg();
        const layout = this.buildDynamicLayoutFromActivations(data.activations);
        this.renderLayout(layout);
        this.updateGraph(data.activations, data.epoch, layout, this.sessionId);
      } else {
        // Same creature: update activations/pulses
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

  /**
   * Toggle layout orientation. Instead of fully re-rendering, compute the
   * new coordinates for nodes and animate nodes + links to the new positions.
   */
  toggleLayout(): void {
    this.layoutVertical = !this.layoutVertical;
    this.layoutToggled.emit(this.layoutVertical ? 'vertical' : 'horizontal');

    // If no layout yet, nothing to animate; ensure layout/render
    if (!this._currentNodes.length) {
      const data = this.activations();
      if (!data?.activations?.length) return;
      const layout = this.buildDynamicLayoutFromActivations(data.activations);
      this.renderLayout(layout);
      this.updateGraph(data.activations, data.epoch, layout, this.sessionId);
      return;
    }

    // Build a new layout purely to get target coordinates (but don't re-bind DOM)
    const data = this.activations();
    const newLayout = this.buildDynamicLayoutFromActivations(data?.activations || []);

    // Build a quick lookup map keyed by layer-index
    const posMap: Record<string, { x: number, y: number }> = {};
    newLayout.nodes.forEach(n => {
      posMap[`${n.layer}-${n.index}`] = { x: n.x, y: n.y };
    });

    // Apply target positions to existing node objects (so Link.source/target still refer to same Node objects)
    this._currentNodes.forEach(n => {
      const key = `${n.layer}-${n.index}`;
      const p = posMap[key];
      if (p) {
        n.x = p.x;
        n.y = p.y;
      }
    });

    // Update the stored layerMapping to the new one (structure should be same counts)
    this._currentLayerMapping = newLayout.layerMapping;

    // Animate node halos and nodes positions
    const nodeGroup = this.svg.selectAll<SVGGElement, Node>('.node-group');

    nodeGroup.select<SVGCircleElement>('.halo')
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y);

    nodeGroup.select<SVGCircleElement>('.node')
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('cx', (d: any) => d.x)
      .attr('cy', (d: any) => d.y);

    // Animate links positions
    this.svg.selectAll<SVGLineElement, Link>('.link')
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
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
    const width = this.svgRef.nativeElement.clientWidth || 800;
    const height = this.svgRef.nativeElement.clientHeight || 600;

    const nodes: Node[] = [];
    const links: Link[] = [];
    const layerMapping: number[][][] = [];

    if (!activations || !activations.length) {
      return { nodes, links, layerMapping };
    }

    const layerCount = activations.length;
    const maxNeurons = Math.max(...activations.map(l => (Array.isArray(l) ? l.length : 1)));

    // Base gaps
    const layerXGap = width / (layerCount + 1);
    const layerYGap = height / (layerCount + 1);
    const neuronXGap = width / (maxNeurons + 1);
    const neuronYGap = height / (maxNeurons + 1);

    activations.forEach((layer, layerIndex) => {
      const displayUnits = Array.isArray(layer[0]) ? layer : layer.map(v => [v]);
      const mapping: number[][] = [];

      // Compute per-layer offset for center alignment
      const neuronCount = displayUnits.length;
      const offsetX = this.centerNeurons
        ? (width - neuronXGap * (neuronCount - 1)) / 2
        : 0;
      const offsetY = this.centerNeurons
        ? (height - neuronYGap * (neuronCount - 1)) / 2
        : 0;

      displayUnits.forEach((_, i) => {
        nodes.push({
          layer: layerIndex,
          index: i,
          x: this.layoutVertical
            ? i * neuronXGap + offsetX
            : (layerIndex + 1) * layerXGap,
          y: this.layoutVertical
            ? (layerIndex + 1) * layerYGap
            : i * neuronYGap + offsetY,
          activation: 0
        });
        mapping.push([i]);
      });

      layerMapping.push(mapping);
    });

    // Connect adjacent layers
    for (let l = 0; l < layerMapping.length - 1; l++) {
      const fromLayer = nodes.filter(n => n.layer === l);
      const toLayer = nodes.filter(n => n.layer === l + 1);
      fromLayer.forEach(src =>
        toLayer.forEach(tgt =>
          links.push({
            source: src,
            target: tgt,
            weight: Math.random() * 2 - 1
          })
        )
      );
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

    // Save current layout
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

    // Update activations mapping
    if (activations && activations.length > 0) {
      activations.forEach((layer: number[], l: number) => {
        const mapping = layerMapping[l];
        mapping.forEach((indices: number[], i: number) => {
          const node = nodes.find(n => n.layer === l && n.index === i);
          if (node) node.activation = d3.mean(indices.map(idx => layer[idx])) ?? 0;
        });
      });
    }

    // Update links
    this.svg.selectAll<SVGLineElement, Link>('.link')
      .data(links, d => `${d.source.layer}-${d.source.index}-${d.target.layer}-${d.target.index}`)
      .attr('x1', d => d.source.x)   // geometry updates immediately
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('stroke-width', d => 1 + Math.abs(d.source.activation - d.target.activation) * this.linkPulseScale)
      .attr('opacity', d => Math.abs(d.source.activation - d.target.activation) * this.linkPulseOpacity)
      .attr('stroke', d => this.weightColorScale(d.weight));

    // Pulses (per epoch)
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
          // .duration(this.easeDuration)
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

    // Node transitions: halos and nodes update size/color & position
    const nodeGroup = this.svg.selectAll<SVGGElement, Node>('.node-group')
      .data(nodes, d => `${d.layer}-${d.index}`);

    nodeGroup.select<SVGCircleElement>('.halo')
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('r', d => d.activation > 0 ? this.haloRadius * d.activation : 0)
      .attr('opacity', d => d.activation > 0.1 ? 1 : 0)
      .attr('fill', d => this.activationColorScale(d.activation))
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    nodeGroup.select<SVGCircleElement>('.node')
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('r', d => 5 + d.activation * 5)
      .attr('fill', d => this.activationColorScale(d.activation))
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);
  }

  toggleCenterNeurons(): void {
    this.centerNeurons = !this.centerNeurons;

    // If no nodes yet, nothing to animate
    if (!this._currentNodes.length) return;

    // Recompute layout
    const data = this.activations();
    const newLayout = this.buildDynamicLayoutFromActivations(data?.activations || []);

    // Build a quick lookup map keyed by layer-index
    const posMap: Record<string, { x: number, y: number }> = {};
    newLayout.nodes.forEach(n => {
      posMap[`${n.layer}-${n.index}`] = { x: n.x, y: n.y };
    });

    // Animate nodes to new positions
    this._currentNodes.forEach(n => {
      const key = `${n.layer}-${n.index}`;
      const p = posMap[key];
      if (p) {
        n.x = p.x;
        n.y = p.y;
      }
    });

    // Update layer mapping
    this._currentLayerMapping = newLayout.layerMapping;

    // Animate halos and nodes
    const nodeGroup = this.svg.selectAll<SVGGElement, Node>('.node-group');
    nodeGroup.select<SVGCircleElement>('.halo')
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    nodeGroup.select<SVGCircleElement>('.node')
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    // Animate links
    this.svg.selectAll<SVGLineElement, Link>('.link')
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);
  }

}
