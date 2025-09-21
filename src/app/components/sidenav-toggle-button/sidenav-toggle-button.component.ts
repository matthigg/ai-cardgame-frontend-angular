// src/app/sidenav-toggle/sidenav-toggle.component.ts
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  HostBinding
} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-sidenav-toggle',
  templateUrl: './sidenav-toggle-button.component.html',
  styleUrl: './sidenav-toggle-button.component.scss'
})
export class SidenavToggleComponent implements AfterViewInit, OnChanges {
  @ViewChild('svg', { static: true }) private svgRef!: ElementRef<SVGElement>;

  /** whether the sidenav is open (left sidenav open => arrow should point left to indicate "close") */
  @Input() open = false;

  /** emits new open state */
  @Output() toggle = new EventEmitter<boolean>();

  private svgSelection!: d3.Selection<SVGElement, unknown, null, undefined>;
  private pathSelection!: d3.Selection<SVGPathElement, unknown, null, undefined>;
  private readonly width = 40;
  private readonly height = 40;

  ngAfterViewInit(): void {
    this.svgSelection = d3.select<SVGElement, unknown>(this.svgRef.nativeElement);
    // create path
    this.pathSelection = this.svgSelection
      .append('path')
      .attr('d', this.pathFor(this.open))
      .attr('fill', 'currentColor')
      .attr('transform', 'translate(0,0)');

    // small initial animation
    this.pathSelection
      .attr('opacity', 0)
      .transition()
      .duration(220)
      .attr('opacity', 1);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.pathSelection) return;
    if (changes['open']) {
      this.animateTo(this.open);
    }
  }

  onToggle(): void {
    this.open = !this.open;
    this.animateTo(this.open);
    this.toggle.emit(this.open);
  }

  onKeydown(e: KeyboardEvent): void {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.onToggle();
    }
  }

  private pathFor(open: boolean): string {
    // triangle sized and centered in 40x40 viewBox
    const w = 40;
    const h = 40;
    // use three points; we inset a bit so it looks nice
    const inset = 10;
    if (open) {
      // point left: left-point on mid-left
      const p1 = [inset, h / 2];           // left tip
      const p2 = [w - inset, inset];      // top right
      const p3 = [w - inset, h - inset];  // bottom right
      return `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} Z`;
    } else {
      // point right: right-tip
      const p1 = [w - inset, h / 2];      // right tip
      const p2 = [inset, inset];          // top left
      const p3 = [inset, h - inset];      // bottom left
      return `M ${p1[0]} ${p1[1]} L ${p2[0]} ${p2[1]} L ${p3[0]} ${p3[1]} Z`;
    }
  }

  private animateTo(open: boolean) {
    const newD = this.pathFor(open);
    // smooth morph between path 'd' values with d3.interpolateString
    this.pathSelection
      .transition()
      .duration(220)
      .attrTween('d', function() {
        // `this` is the DOM path element
        const previous = (this as SVGPathElement).getAttribute('d') || '';
        return d3.interpolateString(previous, newD);
      });
  }
}
