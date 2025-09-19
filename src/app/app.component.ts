import { Component, inject, signal, WritableSignal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { Activations } from './shared/models/activations.model';
import { BattleService } from './services/battle/battle.service';
import { D3BarChartComponent } from './components/d3-bar-chart/d3-bar-chart.component';
import { NnGraph18Component } from './components/nn-graphs/nn-graph-18/nn-graph-18.component';
import { NnGraph19Component } from './components/nn-graphs/nn-graph-19/nn-graph-19.component';
import { DojoService } from './services/dojo/dojo.service';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    D3BarChartComponent,
    // NnGraph18Component,
    NnGraph19Component,
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
  private dojoService: DojoService = inject(DojoService)

  // ---- Playback cancellation guard ----
  private playbackId = 0;        // increments to cancel any in-flight playback
  private defaultSpeed = 200;
  public isPlaying: WritableSignal<boolean> = signal(false);
  public isTraining: WritableSignal<boolean> = signal(false);

  constructor() {}

  // ------------------ Training ------------------
  async onTrain(creature: string, playbackSpeed = this.defaultSpeed) {
    this.isTraining.set(true);                     // 🔹 spinner on
    this.addStatusMessage('Training started...');

    try {
      // Wait for training loop to finish on server
      const result = await this.battleService.getTrain().pipe(take(1)).toPromise();

      this.summaryData.set(result.summary);
      this.addStatusMessage('Training completed! Fetching activations...');

      this.isTraining.set(false);                  // 🔹 stop spinner here
                                                  // (before playback starts)

      // Playback continues, but spinner no longer blocks UI
      await this.playActivations(creature, playbackSpeed);

      this.addStatusMessage('Activation playback finished.');
    } catch (err) {
      this.isTraining.set(false);                  // 🔹 ensure reset on error
      throw err;
    }
  }

  // ------------------ Creature switches ------------------
  // Call this when the user switches which creature to view.
  async onShowCreature(creature: string, speed = this.defaultSpeed) {
    this.stopPlayback();                 // Cancel any in-flight loop
    await this.playActivations(creature, speed);
  }

  stopPlayback() {
    // Incrementing this tells any existing playActivations loop to exit early
    this.playbackId++;
  }

  // ------------------ Playback ------------------
  async playActivations(creature: string, speed = this.defaultSpeed) {
    // Capture a local id to detect cancellation
    const myId = ++this.playbackId;
    this.isPlaying.set(true); // 🔹 playback started

    try {
      const data = await this.battleService.getCreatureGraph(creature).toPromise();
      if (myId !== this.playbackId) {
        this.isPlaying.set(false); // 🔹 canceled while fetching
        return;
      }

      // const history = data.activations_history || [];
      const history = data[creature].activations_history || [];

      for (let epoch = 0; epoch < history.length; epoch++) {
        if (myId !== this.playbackId) {
          this.isPlaying.set(false); // 🔹 canceled mid-loop
          return;
        }

        const epochData = history[epoch];
        const lastEpoch = epoch === history.length - 1;
        const activations = epochData.layers || [];

        // Push a frame
        this.activations.set({ creature, epoch, lastEpoch, activations });

        // Delay with cancellation check on both sides
        await new Promise(resolve => setTimeout(resolve, speed));
        if (myId !== this.playbackId) {
          this.isPlaying.set(false); // 🔹 canceled during delay
          return;
        }
      }
    } finally {
      this.isPlaying.set(false); // 🔹 always reset after finishing
    }
  }

  // ------------------ Track layout state ------------------
  onLayoutToggled(direction: 'vertical' | 'horizontal' | 'center') {
    // Increment playbackId to cancel the current epoch loop
    this.playbackId++;
    console.log(`Layout changed to ${direction}, playback canceled.`);
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
