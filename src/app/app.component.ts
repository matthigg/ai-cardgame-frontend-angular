import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { BattleService } from './services/battle/battle.service';
import { D3BarChartComponent } from './components/d3-bar-chart/d3-bar-chart.component';
import { NnGraph16Component } from './components/nn-graphs/nn-graph-16/nn-graph-16.component';
import { Activations } from './shared/models/activations.model';
import { NnGraph17Component } from './components/nn-graphs/nn-graph-17/nn-graph-17.component';
import { NnGraph18Component } from './components/nn-graphs/nn-graph-18/nn-graph-18.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    D3BarChartComponent,
    NnGraph16Component,
    NnGraph17Component,
    NnGraph18Component,
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

  // ---- Playback cancellation guard ----
  private playbackId = 0;        // increments to cancel any in-flight playback
  private defaultSpeed = 200;

  constructor() {}

  // ------------------ Training ------------------
  async onTrain(creature: 'A' | 'B', playbackSpeed = this.defaultSpeed) {
    this.addStatusMessage('Training started...');
    const result = await this.battleService.getTrain().pipe(take(1)).toPromise();
    this.summaryData.set(result.summary);
    this.addStatusMessage('Training completed! Fetching activations...');
    await this.playActivations(creature, playbackSpeed);
    this.addStatusMessage('Activation playback finished.');
  }

  // ------------------ Creature switches ------------------
  // Call this when the user switches which creature to view.
  async onShowCreature(creature: 'A' | 'B', speed = this.defaultSpeed) {
    this.stopPlayback();                 // Cancel any in-flight loop
    await this.playActivations(creature, speed);
  }

  stopPlayback() {
    // Incrementing this tells any existing playActivations loop to exit early
    this.playbackId++;
  }

  // ------------------ Playback ------------------
  async playActivations(creature: 'A' | 'B', speed = this.defaultSpeed) {
    // Capture a local id to detect cancellation
    const myId = ++this.playbackId;

    const data = await this.battleService.getCreatureGraph(creature).toPromise();
    if (myId !== this.playbackId) return; // cancelled while fetching

    const history = data.activations_history || [];

    for (let epoch = 0; epoch < history.length; epoch++) {
      if (myId !== this.playbackId) return; // cancelled mid-loop

      const epochData = history[epoch];
      const lastEpoch = epoch === history.length - 1;
      const activations = epochData.layers || [];

      // Push a frame
      this.activations.set({ creature, epoch, lastEpoch, activations });

      // Delay with cancellation check on both sides
      await new Promise(resolve => setTimeout(resolve, speed));
      if (myId !== this.playbackId) return;
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
