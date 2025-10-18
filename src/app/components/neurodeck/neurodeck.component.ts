import { Component, inject, OnInit } from '@angular/core';
import { LoginService } from '../../services/login/login.service';
import { PlayerModel } from '../../shared/models/players.model';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

const mockUserInfo = {
  id: 5,
  name: "asdf",
  creatures: [
    {
      id: 51,
      name: "Bear",
      owner: "asdf",
      hp: 100,
      max_hp: 100,
      energy: 100,
      max_energy: 100,
      speed: 10,
      special_abilities: [
        "stun"
      ],
      reward_config: {
        attack: 0.01,
        defend: 0.01,
        recover: 0.01,
        win: 10,
        lose: -10,
        poison: 0.01,
        stun: 0.01
      },
      nn_config: {
        learning_rate: 0.001,
        epsilon: 0.9,
        eps_min: 0.05,
        eps_decay_rate: 0.99,
        alpha_baseline: 0.05,
        entropy_beta: 0.001,
        max_display_neurons: 5,
        hidden_sizes: [
          10,
          10,
          10
        ]
      },
      runtime_state: {
        hp: 100,
        energy: 100,
        statuses: {}
      }
    }
  ]
}

@Component({
  selector: 'app-neurodeck',
  imports: [ 
    CommonModule, 
    MatCardModule, 
    MatIconModule, 
    MatProgressBarModule 
  ],
  templateUrl: './neurodeck.component.html',
  styleUrl: './neurodeck.component.scss'
})
export class NeurodeckComponent implements OnInit {
  public userInfoService = inject(LoginService);
  public userInfo: PlayerModel | null = null;

  ngOnInit(): void {
    this.userInfo = this.userInfoService.userInfoSignal()
    console.log('--- this.userInfo: ', this.userInfo);
  }

  viewDetails(creature: any): void {
    console.log('View details for:', creature);
    // later: open a dialog showing neural network config, stats, training data, etc.
  }
}
