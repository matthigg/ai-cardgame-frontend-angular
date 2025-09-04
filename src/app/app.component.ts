import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BattleService } from './services/battle/battle.service';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { D3ChartComponent } from './components/d3-chart/d3-chart.component';
import { D3XyGraphComponent } from './components/d3-xy-graph/d3-xy-graph.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    // D3ChartComponent,
    D3XyGraphComponent,
    // RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  logs: WritableSignal<any> = signal([])

  public statusMessages: WritableSignal<string[]> = signal([]);
  private statusMessageLength = 5;

  constructor(private battleService: BattleService) {}

  onTrain(): void {
    this.battleService.getTrain().pipe(take(1)).subscribe();
  }

  onTrainingStream(): void {
    const eventSource = this.battleService.getTrainingStream();

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour12: false }); // HH:MM:SS format

      if (Array.isArray(data)) {
        this.logs.set(data);  // only BattleLog arrays go to the chart
      } else if (data.status) {
        const statusMessagesValue = this.statusMessages();
        statusMessagesValue.push(`[${timestamp}] Status: ${data.status}`);
        this.statusMessages.set(statusMessagesValue);

        if (this.statusMessages().length > this.statusMessageLength) {
          const x = statusMessagesValue.slice(this.statusMessages().length - this.statusMessageLength);
          this.statusMessages.set(x);
        }

        if (data.status === "completed") {
          eventSource.close();
        }
      }
    };

    eventSource.onerror = (error) => {
      console.error("Stream error", error);
      eventSource.close();
    };
  }


}
