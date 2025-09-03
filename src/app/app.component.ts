import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BattleService } from './services/battle.service';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  log: any;

  constructor(private battleService: BattleService) {}

  onTrain(): void {
    this.battleService.getTrain().pipe(take(1)).subscribe();
  }

  onTrainingStream(): void {
    const eventSource = this.battleService.getTrainingStream();

    eventSource.onmessage = (event) => {
      const log = JSON.parse(event.data);
      console.log("Training update:", log);
      this.log = log;
    };

    eventSource.onerror = (error) => {
      console.error("Stream error", error);
      eventSource.close();
    };
  }

}
