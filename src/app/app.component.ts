import { Component, inject, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BattleService } from './services/battle/battle.service';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { D3ChartComponent } from './components/d3-chart/d3-chart.component';
import { D3XyGraphComponent } from './components/d3-xy-graph/d3-xy-graph.component';
import { D3BarChartComponent } from './components/d3-bar-chart/d3-bar-chart.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    // D3ChartComponent,
    D3BarChartComponent,
    D3XyGraphComponent,
    // RouterOutlet,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  logs: WritableSignal<any> = signal([]);
  summaryData: WritableSignal<any> = signal(null)

  public statusMessages: WritableSignal<string[]> = signal([]);
  private statusMessageLength = 5;

  private battleService: BattleService = inject(BattleService);

  constructor() {}

  onTrain(): void {
    this.battleService.getTrain().pipe(take(1)).subscribe();
  }

  onTrainingStream(): void {
    const eventSource = this.battleService.getTrainingStream();
    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.handleStatusMessages(data, eventSource);

      console.log('--- data: ', data);

    if (data.status === "summary" && data.summary) {
      this.summaryData.set(data.summary); // signal to update your bar chart
      console.log("Summary data received:", data.summary);
      return;
    }

      if (data.status === "completed") {
        eventSource.close();
      }
    };

    eventSource.onerror = (error) => {
      console.error("Stream error", error);
      eventSource.close();
    };
  }

  handleStatusMessages(data: any, eventSource: any): void {
    if (Array.isArray(data)) {
      this.logs.set(data);  // only BattleLog arrays go to the chart
    } else if (data.status) {
      const now = new Date();
      const timestamp = now.toLocaleTimeString('en-US', { hour12: false }); // HH:MM:SS format
      const statusMessagesValue = this.statusMessages();
      statusMessagesValue.push(`[${timestamp}] Status: ${data.status}`);
      this.statusMessages.set(statusMessagesValue);

      if (this.statusMessages().length > this.statusMessageLength) {
        const statusMessageSlice = statusMessagesValue.slice(this.statusMessages().length - this.statusMessageLength);
        this.statusMessages.set(statusMessageSlice);
      }
    }
  }
}
