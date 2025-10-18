import { CommonModule } from '@angular/common';
import { Component, Inject, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import * as d3 from 'd3';

@Component({
  selector: 'app-creature-details-dialog',
  imports: [ CommonModule, MatButtonModule, MatDialogModule ],
  templateUrl: './creature-details-dialog.component.html',
  styleUrls: ['./creature-details-dialog.component.scss']
})
export class CreatureDetailsDialogComponent implements AfterViewInit {
  @ViewChild('networkViz', { static: true }) networkVizRef!: ElementRef;

  private animationIntensity = 1.5; // 🔥 Control overall animation intensity (1 = subtle, 2 = strong)

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CreatureDetailsDialogComponent>
  ) {}

  ngAfterViewInit() {
    this.renderNetwork();
  }

  close(): void {
    this.dialogRef.close();
  }

  renderNetwork() {
    const container = this.networkVizRef.nativeElement;
    const width = 450;
    const height = 250;

    d3.select(container).selectAll('*').remove(); // Clear previous render

    const svg = d3.select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    const nn = this.data.nn_config;
    const hiddenSizes = nn.hidden_sizes || [];
    const layers = [...hiddenSizes, 4]; // adjust output layer size if needed

    const neuronRadius = 6;
    const animIntensity = this.animationIntensity;

    // --- Link / neuron constants ---
    const LINK_BASE_COLOR = '#aaa';
    const LINK_BASE_OPACITY = 0.5;
    const LINK_BASE_WIDTH = 1;
    const LINK_HIGHLIGHT_COLOR = '#3f51b5';
    const LINK_HIGHLIGHT_OPACITY = 0.9;
    const LINK_HIGHLIGHT_WIDTH = 2;

    const allNodes: any[] = [];
    const allLinks: any[] = [];

    layers.forEach((count, i) => {
      for (let j = 0; j < count; j++) {
        allNodes.push({ layer: i, y: (height / (count + 1)) * (j + 1) });
      }
    });

    allNodes.forEach((node) => {
      const nextLayerNodes = allNodes.filter(n => n.layer === node.layer + 1);
      nextLayerNodes.forEach(target => {
        allLinks.push({ source: node, target });
      });
    });

    const layerPositions = d3.scaleLinear()
      .domain([0, layers.length - 1])
      .range([50, width - 50]);

    // --- Draw links ---
    const linkGroup = svg.append('g')
      .selectAll('line')
      .data(allLinks)
      .enter()
      .append('line')
      .attr('x1', d => layerPositions(d.source.layer))
      .attr('y1', d => d.source.y)
      .attr('x2', d => layerPositions(d.target.layer))
      .attr('y2', d => d.target.y)
      .attr('stroke', LINK_BASE_COLOR)
      .attr('stroke-width', LINK_BASE_WIDTH)
      .attr('opacity', LINK_BASE_OPACITY);

    // --- Draw neurons ---
    const neuronGroup = svg.append('g')
      .selectAll('circle')
      .data(allNodes)
      .enter()
      .append('circle')
      .attr('cx', d => layerPositions(d.layer))
      .attr('cy', d => d.y)
      .attr('r', neuronRadius)
      .attr('fill', '#3f51b5')
      .attr('opacity', 0.8)
      .style('cursor', 'pointer');

    // --- Hover interactions ---
    neuronGroup
      .on('mouseenter', function (event, d) {
        const neuron = d3.select(this);
        neuron.interrupt()
          .transition()
          .duration(200)
          .attr('r', neuronRadius * animIntensity)
          .attr('fill', '#5c6bc0');

        const outgoing = linkGroup.filter(link => link.source === d);

        outgoing.interrupt()
          .transition()
          .duration(150)
          .attr('stroke', LINK_HIGHLIGHT_COLOR)
          .attr('stroke-width', LINK_HIGHLIGHT_WIDTH)
          .attr('opacity', LINK_HIGHLIGHT_OPACITY)
          .on('end', function () {
            d3.select(this)
              .transition()
              .duration(800)
              .ease(d3.easeSin)
              .attr('opacity', 1)
              .transition()
              .duration(400)
              .attr('opacity', LINK_HIGHLIGHT_OPACITY);
          });

        // Slightly fade non-outgoing links
        linkGroup
          .filter(link => link.source !== d)
          .interrupt()
          .transition()
          .duration(150)
          .attr('opacity', 0.25);
      })
      .on('mouseleave', function () {
        // reset neuron visual
        d3.select(this)
          .interrupt()
          .transition()
          .duration(200)
          .attr('r', neuronRadius)
          .attr('fill', '#3f51b5');

        // stop all link animations
        linkGroup.interrupt();

        // immediately normalize links
        linkGroup
          .attr('stroke', LINK_BASE_COLOR)
          .attr('stroke-width', LINK_BASE_WIDTH)
          .attr('opacity', LINK_BASE_OPACITY);

        // smooth fade to baseline
        linkGroup
          .transition()
          .duration(300)
          .attr('stroke', LINK_BASE_COLOR)
          .attr('stroke-width', LINK_BASE_WIDTH)
          .attr('opacity', LINK_BASE_OPACITY);
      });

    // --- Ambient idle animation ---
    const pulse = () => {
      neuronGroup
        .transition()
        .duration(1000 + Math.random() * 1000)
        .attr('opacity', () => 0.7 + Math.random() * 0.3)
        .on('end', pulse);
    };
    pulse();
  }

  get nnConfigKeys() {
    return Object.keys(this.data.nn_config || {});
  }

  get rewardKeys() {
    return Object.keys(this.data.reward_config || {});
  }
}
