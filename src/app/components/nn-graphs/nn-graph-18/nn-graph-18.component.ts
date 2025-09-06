import { Component, effect, signal, WritableSignal } from '@angular/core';
import * as d3 from 'd3';
import { BattleService } from '../../../services/battle/battle.service';

@Component({
  selector: 'app-nn-graph-18',
  template: `<svg id="nn-svg" width="800" height="600"></svg>`,
  styles: [`
    svg { border: 1px solid #ccc; }
    .tooltip {
      position: absolute;
      text-align: center;
      padding: 4px;
      font: 12px sans-serif;
      background: lightsteelblue;
      border: 0px;
      border-radius: 4px;
      pointer-events: none;
    }
  `]
})
export class NnGraph18Component {
  activations: WritableSignal<any> = signal(null);

  private svg!: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
  private nodes: any[] = [];
  private links: any[] = [];
  private layerMapping: any[] = [];
  private layouts: Record<string, { nodes: any[]; links: any[]; layerMapping: any[] }> = {};
  private currentCreature: string | null = null;

  // ---- Color scales ----
  private activationColorScale = d3.scaleLinear<string>()
    .domain([0, 1])
    .range(['blue', 'red']);

  private weightColorScale = d3.scaleLinear<string>()
    .domain([-1, 0, 1])
    .range(['blue', 'purple', 'red']);

  // ---- Pulse settings ----
  private showPulses = true;
  private passDirection: 'forward' | 'backward' = 'forward';
  private pulseDuration = 900;
  private sessionId = 0;

  // ---- Coloring mode ----
  private useActivationColoring = true; // toggle: true = activation-based, false = weight-based

  constructor(private battleService: BattleService) {
    effect(() => {
      const data = this.activations();
      if (!data?.activations?.length) {
        this.clearGraph();
        return;
      }

      if (this.currentCreature !== data.creature) {
        this.sessionId++; // invalidate old pulses
        this.currentCreature = data.creature;
        this.rebuildGraph(data.creature, data.activations);
      } else {
        this.updateGraph(data.activations, data.epoch);
      }
    });
  }

  ngOnInit() {
    this.svg = d3.select<SVGSVGElement, unknown>('#nn-svg');
  }

  private clearGraph() {
    this.svg?.selectAll('*').remove();
    this.nodes = [];
    this.links = [];
    this.layerMapping = [];
  }

  private rebuildGraph(creature: string, activations: number[][]) {
    this.clearGraph();
    this.buildDynamicLayoutFromActivations(activations);

    this.layouts[creature] = {
      nodes: JSON.parse(JSON.stringify(this.nodes)),
      links: JSON.parse(JSON.stringify(this.links)),
      layerMapping: JSON.parse(JSON.stringify(this.layerMapping))
    };

    this.updateGraph(activations, 0);
  }

  private buildDynamicLayoutFromActivations(activations: number[][]) {
    const width = 800;
    const height = 600;
    const layerSpacing = width / (activations.length + 1);
    const nodeRadius = 15;

    this.nodes = [];
    this.links = [];
    this.layerMapping = [];

    activations.forEach((layer, layerIndex) => {
      const ySpacing = height / (layer.length + 1);
      const layerNodes = layer.map((activation, i) => {
        const node = {
          id: `${layerIndex}-${i}`,
          layer: layerIndex,
          index: i,
          activation,
          x: (layerIndex + 1) * layerSpacing,
          y: (i + 1) * ySpacing
        };
        this.nodes.push(node);
        return node;
      });
      this.layerMapping.push(layerNodes);
    });

    for (let l = 0; l < this.layerMapping.length - 1; l++) {
      const currLayer = this.layerMapping[l];
      const nextLayer = this.layerMapping[l + 1];
      currLayer.forEach((source: any) => {
        nextLayer.forEach((target: any) => {
          this.links.push({
            source,
            target,
            weight: Math.random() * 2 - 1 // placeholder
          });
        });
      });
    }
  }

  private updateGraph(activations: number[][], epoch: number) {
    // update nodes with latest activations
    activations.forEach((layer, layerIndex) => {
      layer.forEach((activation, i) => {
        const node = this.nodes.find(n => n.id === `${layerIndex}-${i}`);
        if (node) node.activation = activation;
      });
    });

    // --- Links ---
    const linkSel = this.svg.selectAll<SVGLineElement, any>('line.link')
      .data(this.links, (d: any) => `${d.source.id}-${d.target.id}`);

    linkSel.enter()
      .append('line')
      .attr('class', 'link')
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y)
      .style('stroke', d => this.weightColorScale(d.weight))
      .style('stroke-width', 1.5)
      .append('title')
      .text(d => `Weight: ${d.weight.toFixed(3)}`);

    linkSel
      .style('stroke', d => this.weightColorScale(d.weight));

    linkSel.exit().remove();

    // --- Nodes ---
    const nodeSel = this.svg.selectAll<SVGGElement, any>('g.node-group')
      .data(this.nodes, (d: any) => d.id);

    const nodeEnter = nodeSel.enter()
      .append('g')
      .attr('class', 'node-group')
      .attr('transform', d => `translate(${d.x},${d.y})`);

    // halos
    nodeEnter.append('circle')
      .attr('class', 'halo')
      .attr('r', 20)
      .style('fill', d =>
        this.useActivationColoring
          ? this.activationColorScale(d.activation)
          : this.weightColorScale(this.links.find(l => l.source.id === d.id || l.target.id === d.id)?.weight || 0)
      )
      .style('opacity', 0.2);

    // nodes
    nodeEnter.append('circle')
      .attr('class', 'node')
      .attr('r', 15)
      .style('fill', d =>
        this.useActivationColoring
          ? this.activationColorScale(d.activation)
          : this.weightColorScale(this.links.find(l => l.source.id === d.id || l.target.id === d.id)?.weight || 0)
      )
      .append('title')
      .text(d => `Activation: ${d.activation.toFixed(3)}`);

    nodeSel.select('circle.node')
      .transition().duration(300)
      .style('fill', d =>
        this.useActivationColoring
          ? this.activationColorScale(d.activation)
          : this.weightColorScale(this.links.find(l => l.source.id === d.id || l.target.id === d.id)?.weight || 0)
      );

    nodeSel.exit().remove();

    // --- Pulses ---
    if (this.showPulses) {
      const sessionAtSchedule = this.sessionId;
      this.links.forEach(link => {
        const startNode = this.passDirection === 'forward' ? link.source : link.target;
        const endNode = this.passDirection === 'forward' ? link.target : link.source;

        const act = startNode.activation;
        if (act > 0.01) {
          const r = 3 + 4 * act;

          const pulse = this.svg.append('circle')
            .attr('cx', startNode.x)
            .attr('cy', startNode.y)
            .attr('r', r)
            .style('fill', this.weightColorScale(link.weight))
            .style('opacity', 0.8);

          pulse.transition()
            .duration(this.pulseDuration)
            .attr('cx', endNode.x)
            .attr('cy', endNode.y)
            .style('opacity', 0.1)
            .remove()
            .on('end', () => {
              if (this.sessionId !== sessionAtSchedule) pulse.remove();
            });
        }
      });
    }
  }

  // ---- Playback control ----
  async playActivations(creature: 'A' | 'B', speed = 200) {
    const data = await this.battleService.getCreatureGraph(creature).toPromise();
    const history = data.activations_history || [];

    for (let epoch = 0; epoch < history.length; epoch++) {
      const epochData = history[epoch];
      const activations = epochData.layers || [];
      this.activations.set({ creature, epoch, activations });
      await new Promise(resolve => setTimeout(resolve, speed));
    }
  }
}
