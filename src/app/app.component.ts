import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BattleService } from './services/battle.service';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  // imports: [CommonModule, RouterOutlet],
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  mockData = {
    epoch: 'start epoch',
    winner: 'start winner',
    reward_A: 'start reward a',
    reward_B: 'start reward b',
    wins: 'start wins',
  }

  log = signal(this.mockData)

  constructor(private battleService: BattleService) {}

  onTrain(): void {
    this.battleService.getTrain().pipe(take(1)).subscribe();
  }

  onTrainingStream(): void {
    const eventSource = this.battleService.getTrainingStream();

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status === "completed") {
        console.log("Training finished");
        eventSource.close();
        return;
      }

      this.log.set({ ...data }); 
      console.log("UI rendering log:", this.log());
    };

    eventSource.onerror = (error) => {
      console.error("Stream error", error);
      eventSource.close();
    };
  }

}
