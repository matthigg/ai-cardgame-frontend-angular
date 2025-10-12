import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { Activations } from '../../shared/models/activations.model';
import { BattleService } from '../battle/battle.service';
import { take } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TrainModel } from '../../shared/models/train.model';

@Injectable({
  providedIn: 'root'
})
export class DojoService {

  playerCreatures: TrainModel[] = [];

  enemyCreatures: TrainModel[] = [
    {
      playerName: 'Bob',
      playerID: 2,
      creatureName: 'Snake',
      creatureID: 21,
    }
  ];

  public fb = inject(FormBuilder);

  public dojoFormGroup: FormGroup = this.fb.group({
    playerFC: this.playerCreatures,
    enemyFC: this.enemyCreatures,
  });
  
  activations: WritableSignal<Activations | null> = signal(null);
  logs: WritableSignal<any> = signal([]);
  summaryData: WritableSignal<any> = signal(null);

  public statusMessages: WritableSignal<string[]> = signal([]);
  private statusMessageLength = 5;

  private battleService: BattleService = inject(BattleService);

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
      const playerData = this.dojoFormGroup.get('playerFC')?.value;
      const enemyData = this.dojoFormGroup.get('enemyFC')?.value;
      const result = await this.battleService.postTrain(playerData, enemyData).pipe(take(1)).toPromise();

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
      const playerData = this.dojoFormGroup.get('playerFC')?.value;
      const enemyData = this.dojoFormGroup.get('enemyFC')?.value;
      const data = await this.battleService.postNNGraph(playerData, enemyData).toPromise();
      if (myId !== this.playbackId) {
        this.isPlaying.set(false); // 🔹 canceled while fetching
        return;
      }

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
