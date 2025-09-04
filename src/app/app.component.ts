import { Component, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BattleService } from './services/battle/battle.service';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { D3ChartComponent } from './components/d3-chart/d3-chart.component';
import { D3XyGraphComponent } from './components/d3-xy-graph/d3-xy-graph.component';

@Component({
  selector: 'app-root',
  // imports: [CommonModule, RouterOutlet],
  imports: [
    CommonModule, 
    // D3ChartComponent,
    D3XyGraphComponent,
  ],
  // imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  logs: WritableSignal<any> = signal([])

  public statusMessages: string[] = [];

  constructor(private battleService: BattleService) {}

  onTrain(): void {
    this.battleService.getTrain().pipe(take(1)).subscribe();
  }

  onTrainingStream(): void {
    const eventSource = this.battleService.getTrainingStream();

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (Array.isArray(data)) {
        this.logs.set(data);  // only BattleLog arrays go to the chart
      } else if (data.status) {
        this.statusMessages.push(`Status: ${data.status}`);
        console.log("Training status:", data.status);

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
