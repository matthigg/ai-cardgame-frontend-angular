import { Component, effect, ElementRef, Input, OnInit, ViewChild, WritableSignal, AfterViewInit, signal, Output, EventEmitter, inject } from '@angular/core';
import * as d3 from 'd3';
import { Activations } from '../../../shared/models/activations.model';
import { colorPalettes, defaultPalette, paletteObj } from '../../../shared/utils/utils';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

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
  imports: [ 
    CommonModule, 
    FormsModule, 
    MatButtonModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    ReactiveFormsModule 
  ],
  templateUrl: './nn-graph-19.component.html',
  styleUrls: ['./nn-graph-19.component.scss']
})
export class NnGraph19Component implements OnInit, AfterViewInit {
  @ViewChild('svgRef', { static: true }) svgRef!: ElementRef<SVGSVGElement>;
  @ViewChild('tooltip', { static: true }) tooltipRef!: ElementRef<HTMLDivElement>;
  @Input({ required: true }) activations!: WritableSignal<Activations | null>;
  @Input() passDirection: 'forward' | 'backward' | 'none' = 'forward';
  @Input() showActivation = false;
  @Input() weightFontColor = 'white';
  @Input() showPulses = false;
  @Input() easeType: (t: number) => number = d3.easeLinear;
  @Input({ required: true }) isPlaying!: WritableSignal<boolean>;
  @Input() uncenteredNeuronPadding: number = 30;
  @Input() maxEpochs: number = 100; // total epochs in training

  /** Single intensity control variable for neuron halos, node size, and link pulse */
  @Input() intensity: number = 1;

  @Output() layoutToggled = new EventEmitter<'vertical' | 'horizontal' | 'center'>();

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

  private progressBar!: d3.Selection<SVGRectElement, unknown, null, undefined>;

  // --- NEW: hovered node & last mouse position to enable dynamic tooltip update ---
  private hoveredNode: Node | null = null;
  private lastMousePos: { x: number; y: number } = { x: 0, y: 0 };

  private fb = inject(FormBuilder);

  colorPaletteKeys: string[] = Object.keys(paletteObj);
  colorScale = signal(colorPalettes(defaultPalette));
  colorPaletteFormGroup = this.fb.group({
    selectedValue: defaultPalette
  })

  handleColorPalette(event: string): void {
    if (event) {
      this.colorScale.set(colorPalettes(event));
    }
    this.weightColorScale = d3.scaleLinear<string>()
      .domain([-1, 0, 1])
      .range(this.colorScale());
    this.activationColorScale = d3.scaleLinear<string>()
      .domain([0, 0.5, 1])
      .range(this.colorScale());
  }

  private weightColorScale = d3.scaleLinear<string>()
    .domain([-1, 0, 1])
    .range(this.colorScale());

  private activationColorScale = d3.scaleLinear<string>()
    .domain([0, 0.5, 1])
    .range(this.colorScale());

  constructor() {
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

  toggleLayout(): void {
    this.layoutVertical = !this.layoutVertical;
    this.layoutToggled.emit(this.layoutVertical ? 'vertical' : 'horizontal');

    if (!this._currentNodes.length) {
      const data = this.activations();
      if (!data?.activations?.length) return;
      const layout = this.buildDynamicLayoutFromActivations(data.activations);
      this.renderLayout(layout);
      this.updateGraph(data.activations, data.epoch, layout, this.sessionId);
      return;
    }

    const data = this.activations();
    const newLayout = this.buildDynamicLayoutFromActivations(data?.activations || []);

    const posMap: Record<string, { x: number, y: number }> = {};
    newLayout.nodes.forEach(n => {
      posMap[`${n.layer}-${n.index}`] = { x: n.x, y: n.y };
    });

    this._currentNodes.forEach(n => {
      const key = `${n.layer}-${n.index}`;
      const p = posMap[key];
      if (p) { n.x = p.x; n.y = p.y; }
    });

    this._currentLayerMapping = newLayout.layerMapping;

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
    // interrupt ongoing transitions and remove everything
    this.svg.selectAll('*').interrupt();
    (this.svg.node() as SVGSVGElement)?.replaceChildren();
    this._currentNodes = [];
    this._currentLinks = [];
    this._currentLayerMapping = [];
    // Reset hovered tooltip state
    this.hoveredNode = null;
    this.lastMousePos = { x: 0, y: 0 };
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

    if (!activations || !activations.length) return { nodes, links, layerMapping };

    const layerCount = activations.length;
    const maxNeurons = Math.max(...activations.map(l => (Array.isArray(l) ? l.length : 1)));

    const layerXGap = width / (layerCount + 1);
    const layerYGap = height / (layerCount + 1);
    const neuronXGap = width / (maxNeurons + 1);
    const neuronYGap = height / (maxNeurons + 1);

    activations.forEach((layer, layerIndex) => {
      const displayUnits = Array.isArray(layer[0]) ? layer : layer.map(v => [v]);
      const mapping: number[][] = [];
      const neuronCount = displayUnits.length;
      const offsetX = this.centerNeurons ? (width - neuronXGap * (neuronCount - 1)) / 2 : this.uncenteredNeuronPadding;
      const offsetY = this.centerNeurons ? (height - neuronYGap * (neuronCount - 1)) / 2 : this.uncenteredNeuronPadding;

      displayUnits.forEach((_, i) => {
        nodes.push({
          layer: layerIndex,
          index: i,
          x: this.layoutVertical ? i * neuronXGap + offsetX : (layerIndex + 1) * layerXGap,
          y: this.layoutVertical ? (layerIndex + 1) * layerYGap : i * neuronYGap + offsetY,
          activation: 0
        });
        mapping.push([i]);
      });

      layerMapping.push(mapping);
    });

    for (let l = 0; l < layerMapping.length - 1; l++) {
      const fromLayer = nodes.filter(n => n.layer === l);
      const toLayer = nodes.filter(n => n.layer === l + 1);
      fromLayer.forEach(src =>
        toLayer.forEach(tgt =>
          links.push({ source: src, target: tgt, weight: Math.random() * 2 - 1 })
        )
      );
    }

    return { nodes, links, layerMapping };
  }

  private adjustTooltipPosition(event: MouseEvent) {
    return { x: event.pageX -200, y: event.pageY -60 };
  }

  private renderLayout(
    layout: { 
      nodes: Node[], 
      links: Link[], 
      layerMapping: number[][][] 
    }
  ) {
    const { nodes, links } = layout;

    this.svg.selectAll('*').remove();

    const linkLayer = this.svg.append('g').attr('class', 'links-layer');
    const nodeLayer = this.svg.append('g').attr('class', 'nodes-layer');
    const pulseLayer = this.svg.append('g').attr('class', 'pulses-layer');

    (this as any)._linkLayer = linkLayer;
    (this as any)._nodeLayer = nodeLayer;
    (this as any)._pulseLayer = pulseLayer;

    // Draw links
    linkLayer.selectAll<SVGLineElement, Link>('.link')
      .data(links, d => `${d.source.layer}-${d.source.index}-${d.target.layer}-${d.target.index}`)
      .enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .attr('stroke', d => this.weightColorScale(d.weight))
      .attr('stroke-width', 1 * this.intensity)
      .attr('opacity', 1 * this.intensity)
      .attr('pointer-events', 'none');

    // Draw nodes
    const nodeGroup = nodeLayer.selectAll<SVGGElement, Node>('.node-group')
      .data(nodes, d => `${d.layer}-${d.index}`)
      .enter()
      .append('g')
      .attr('class', 'node-group');

    nodeGroup.append('circle')
      .attr('class', 'halo')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 0)
      .attr('opacity', 0)
      .attr('pointer-events', 'none');

    // NOTE: we attach mouse handlers that update hoveredNode and lastMousePos.
    nodeGroup.append('circle')
      .attr('class', 'node')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 5 * this.intensity)
      .attr('fill', d => this.activationColorScale(d.activation))
      .on('mouseover', (event, d) => {
        // store reference to the node object so updateGraph can update the tooltip value live
        this.hoveredNode = d;
        const pos = this.adjustTooltipPosition(event as MouseEvent);
        this.lastMousePos = { x: pos.x, y: pos.y };
        this.tooltip
          .style('opacity', 1)
          .html(`Activation: ${d.activation.toFixed(3)}`)
          .style('left', `${pos.x}px`)
          .style('top', `${pos.y}px`);
      })
      .on('mousemove', (event, d) => {
        // update last mouse pos so dynamic tooltip can be repositioned from updateGraph
        const pos = this.adjustTooltipPosition(event as MouseEvent);
        this.lastMousePos = { x: pos.x, y: pos.y };
        // also update position immediately (keeps tooltip following mouse while hovering)
        this.tooltip.style('left', `${pos.x}px`).style('top', `${pos.y}px`);
      })
      .on('mouseout', () => {
        this.hoveredNode = null;
        this.tooltip.style('opacity', 0);
      });

    this._currentNodes = nodes;
    this._currentLinks = links;
    this._currentLayerMapping = layout.layerMapping;

    // Progress bar background
    this.svg.append('rect')
      .attr('class', 'progress-bar-bg')
      .attr('x', 50)
      .attr('y', this.svgRef.nativeElement.clientHeight - 20)
      .attr('width', this.svgRef.nativeElement.clientWidth - 100)
      .attr('height', 10)
      .attr('fill', '#444')
      .attr('rx', 5)
      .attr('ry', 5);

    // Progress bar foreground
    this.progressBar = this.svg.append('rect')
      .attr('class', 'progress-bar-fg')
      .attr('x', 50)
      .attr('y', this.svgRef.nativeElement.clientHeight - 20)
      .attr('width', 0) // start at 0
      .attr('height', 10)
      .attr('fill', 'rgba(0, 195, 255, 1)')
      .attr('rx', 5)
      .attr('ry', 5);
  }

  private updateGraph(
    activations: number[][],
    epoch: number | undefined,
    layout: { nodes: Node[], links: Link[], layerMapping: number[][][] },
    sessionAtSchedule: number
  ) {
    const { nodes, links, layerMapping } = layout;

    if (activations && activations.length > 0) {
      activations.forEach((layer: number[], l: number) => {
        const mapping = layerMapping[l];
        mapping.forEach((indices: number[], i: number) => {
          const node = nodes.find(n => n.layer === l && n.index === i);
          if (node) node.activation = d3.mean(indices.map(idx => layer[idx])) ?? 0;
        });
      });
    }

    // If user is currently hovering a node, update tooltip contents using the referenced node object
    if (this.hoveredNode) {
      try {
        // Update tooltip text with freshest activation and keep it at last known mouse pos
        this.tooltip
          .html(`Activation: ${this.hoveredNode.activation.toFixed(3)}`)
          .style('left', `${this.lastMousePos.x}px`)
          .style('top', `${this.lastMousePos.y}px`);
      } catch {
        // ignore any DOM timing issues
      }
    }

    this.svg.selectAll<SVGLineElement, Link>('.link')
      .data(links, d => `${d.source.layer}-${d.source.index}-${d.target.layer}-${d.target.index}`)
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('stroke-width', d => 1 + Math.abs(d.source.activation - d.target.activation) * this.intensity)
      .attr('opacity', d => Math.min(1, (d.source.activation + d.target.activation)) * this.intensity)
      .attr('stroke', d => this.weightColorScale(d.weight));

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
          .attr('r', 3 * this.intensity + 4 * act * this.intensity)
          .attr('fill', pulseColor)
          .attr('opacity', 0.9 * this.intensity);

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
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('r', d => d.activation > 0 ? this.intensity * d.activation * 6 : 0)
      .attr('opacity', d => d.activation > 0.1 ? 1 * this.intensity : 0)
      .attr('fill', d => this.activationColorScale(d.activation))
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    nodeGroup.select<SVGCircleElement>('.node')
      .transition()
      .duration(this.easeDuration)
      .ease(this.easeType)
      .attr('r', d => 5 * this.intensity + d.activation * 5 * this.intensity)
      .attr('fill', d => this.activationColorScale(d.activation))
      .attr('cx', d => d.x)
      .attr('cy', d => d.y);

    if (epoch !== undefined && this.progressBar) {
      const maxWidth = this.svgRef.nativeElement.clientWidth - 100;

      // Use activations_history_length from your WritableSignal data if available
      const data = this.activations();
      const totalEpochs = data?.activations_history_length ?? this.maxEpochs;

      const progressWidth = Math.min(1, epoch / totalEpochs) * maxWidth;

      this.progressBar.transition()
        .duration(this.easeDuration)
        .ease(this.easeType)
        .attr('width', progressWidth);
    }
  }

  toggleCenterNeurons(): void {
    this.centerNeurons = !this.centerNeurons;
    this.layoutToggled.emit('center'); 

    if (!this._currentNodes.length) return;

    const data = this.activations();
    const newLayout = this.buildDynamicLayoutFromActivations(data?.activations || []);

    const posMap: Record<string, { x: number, y: number }> = {};
    newLayout.nodes.forEach(n => {
      posMap[`${n.layer}-${n.index}`] = { x: n.x, y: n.y };
    });

    this._currentNodes.forEach(n => {
      const key = `${n.layer}-${n.index}`;
      const p = posMap[key];
      if (p) { n.x = p.x; n.y = p.y; }
    });

    this._currentLayerMapping = newLayout.layerMapping;

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
