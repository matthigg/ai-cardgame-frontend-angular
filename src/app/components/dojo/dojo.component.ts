import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { D3BarChartComponent } from '../../components/d3-bar-chart/d3-bar-chart.component';
import { NnGraph19Component } from '../../components/nn-graphs/nn-graph-19/nn-graph-19.component';
import { DojoService } from '../../services/dojo/dojo.service';

@Component({
  selector: 'app-dojo',
  imports: [
    CommonModule,
    D3BarChartComponent,
    MatButtonModule,
    NnGraph19Component,
  ],
  templateUrl: './dojo.component.html',
  styleUrl: './dojo.component.scss'
})
export class DojoComponent {
  public dojoService: DojoService = inject(DojoService);
}