import { AfterViewInit, Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { D3BarChartComponent } from '../../components/d3-bar-chart/d3-bar-chart.component';
import { NnGraph19Component } from '../../components/nn-graphs/nn-graph-19/nn-graph-19.component';
import { DojoService } from '../../services/dojo/dojo.service';
import { LoginService } from '../../services/login/login.service';
import { TrainModel } from '../../shared/models/train.model';

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
export class DojoComponent implements AfterViewInit {
  public dojoService: DojoService = inject(DojoService);
  private loginService: LoginService = inject(LoginService);

  ngAfterViewInit(): void {
    const playerCreaturesList: TrainModel[] = []
    const userInfo = this.loginService.userInfo
    userInfo?.creatures?.forEach(creature => {
      playerCreaturesList.push({
        playerName: userInfo.name,
        playerID: userInfo.id,
        creatureName: creature.name,
        creatureID: creature.id,
      });
    });

    setTimeout(() => {
      this.dojoService.playerCreatures = playerCreaturesList;
    });
  }
}
