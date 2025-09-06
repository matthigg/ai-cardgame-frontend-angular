import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { BattleService } from './services/battle/battle.service';
import { D3BarChartComponent } from './components/d3-bar-chart/d3-bar-chart.component';
import { NnGraph15Component } from './components/nn-graphs/nn-graph-15/nn-graph-15.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    D3BarChartComponent,
    NnGraph15Component
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  activations: WritableSignal<{ epoch: number, activations: number[][] } | null> = signal(null);
  logs: WritableSignal<any> = signal([]);
  summaryData: WritableSignal<any> = signal(null);

  public statusMessages: WritableSignal<string[]> = signal([]);
  private statusMessageLength = 5;

  private battleService: BattleService = inject(BattleService);

  constructor() {}

  // ------------------ Training ------------------
  async onTrain(creature: 'A' | 'B', playbackSpeed = 200) {
    this.addStatusMessage('Training started...');
    const result = await this.battleService.getTrain().pipe(take(1)).toPromise();
    this.summaryData.set(result.summary);
    this.addStatusMessage('Training completed! Fetching activations...');
    await this.playActivations(creature, playbackSpeed);
    this.addStatusMessage('Activation playback finished.');
  }

  // ------------------ Playback ------------------

  async playActivations(creature: 'A' | 'B', speed = 200) {
    const data = await this.battleService.getCreatureGraph(creature).toPromise();
    const history = data.activations_history || [];

    for (let epoch = 0; epoch < history.length; epoch++) {
      const activations = history[epoch];
      this.activations.set({ epoch, activations });
      await new Promise(resolve => setTimeout(resolve, speed));
    }
  }

  // ------------------ Status messages ------------------
  addStatusMessage(msg: string) {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour12: false });
    const statusMessagesValue = this.statusMessages();
    statusMessagesValue.push(`[${timestamp}] ${msg}`);
    if (statusMessagesValue.length > this.statusMessageLength) {
      this.statusMessages.set(statusMessagesValue.slice(-this.statusMessageLength));
    } else {
      this.statusMessages.set(statusMessagesValue);
    }
  }
}
