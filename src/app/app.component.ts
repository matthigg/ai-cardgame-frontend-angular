import { Component, inject, signal, WritableSignal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BattleService } from './services/battle/battle.service';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { D3XyGraphComponent } from './components/d3-xy-graph/d3-xy-graph.component';
import { D3BarChartComponent } from './components/d3-bar-chart/d3-bar-chart.component';
import { NnGraphComponent } from './components/nn-graphs/nn-graph/nn-graph.component';
import { NnGraph2Component } from './components/nn-graphs/nn-graph-2/nn-graph-2.component';
import { NnGraph3Component } from './components/nn-graphs/nn-graph-3/nn-graph-3.component';
import { NnGraph4Component } from './components/nn-graphs/nn-graph-4/nn-graph-4.component';
import { NnGraph5Component } from './components/nn-graphs/nn-graph-5/nn-graph-5.component';
import { NnGraph6Component } from './components/nn-graphs/nn-graph-6/nn-graph-6.component';
import { NnGraph7Component } from './components/nn-graphs/nn-graph-7/nn-graph-7.component';
import { NnGraph8Component } from './components/nn-graphs/nn-graph-8/nn-graph-8.component';
import { NnGraph9Component } from './components/nn-graphs/nn-graph-9/nn-graph-9.component';
import { NnGraph10Component } from './components/nn-graphs/nn-graph-10/nn-graph-10.component';
import { NnGraph11Component } from './components/nn-graphs/nn-graph-11/nn-graph-11.component';
import { NnGraph12Component } from './components/nn-graphs/nn-graph-12/nn-graph-12.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule, 
    D3BarChartComponent,
    D3XyGraphComponent,
    NnGraphComponent,
    NnGraph2Component,
    NnGraph3Component,
    NnGraph4Component,
    NnGraph5Component,
    NnGraph6Component,
    NnGraph7Component,
    NnGraph8Component,
    NnGraph9Component,
    NnGraph10Component,
    NnGraph11Component,
    NnGraph12Component,
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

      // console.log('--- data: ', data);

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
