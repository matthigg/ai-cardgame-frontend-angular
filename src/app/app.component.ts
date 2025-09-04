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
  data: WritableSignal<any> = signal([])

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

      this.data.set(data); 
      // console.log("UI rendering log:", this.data());
    };

    eventSource.onerror = (error) => {
      console.error("Stream error", error);
      eventSource.close();
    };
  }

}
