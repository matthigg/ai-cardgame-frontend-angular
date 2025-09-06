import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { BattleService } from './services/battle/battle.service';
import { D3BarChartComponent } from './components/d3-bar-chart/d3-bar-chart.component';
import { NnGraph16Component } from './components/nn-graphs/nn-graph-16/nn-graph-16.component';
import { NnGraph17Component } from './components/nn-graphs/nn-graph-17/nn-graph-17.component';
import { Activations } from './shared/models/activations.model';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    D3BarChartComponent,
    NnGraph16Component,
    NnGraph17Component,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  activations: WritableSignal<Activations | null> = signal(null);
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
    // Fetch activations history from the backend
    const data = await this.battleService.getCreatureGraph(creature).toPromise();

    console.log('--- pb data: ', data);
    
    const history = data.activations_history || [];

    for (let epoch = 0; epoch < history.length; epoch++) {

      console.log('--- epoch: ', epoch);
      
      const epochData = history[epoch];
      const lastEpoch = epoch === history.length - 1;
      
      // Extract layers array for this epoch
      // Expected format: { name: 'B', epoch: 0, layers: [[...], [...], ...] }
      const activations = epochData.layers || [];
      
      // Set the WritableSignal for the NN graph
      this.activations.set({ creature, epoch, lastEpoch, activations });

      // Optional delay for playback speed
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
