import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { take } from 'rxjs';
import { Activations } from './shared/models/activations.model';
import { BattleService } from './services/battle/battle.service';
import { D3BarChartComponent } from './components/d3-bar-chart/d3-bar-chart.component';
import { NnGraph18Component } from './components/nn-graphs/nn-graph-18/nn-graph-18.component';
import { NnGraph19Component } from './components/nn-graphs/nn-graph-19/nn-graph-19.component';
import { DojoService } from './services/dojo/dojo.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {

  constructor() {}
  
}