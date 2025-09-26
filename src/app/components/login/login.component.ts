import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { take } from 'rxjs';
import { BattleService } from '../../services/battle/battle.service';
import { MatSelectModule } from '@angular/material/select';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  public battleService = inject(BattleService);
  private fb = inject(FormBuilder);

  loginFG = this.fb.group({
    loginName: '',
    createPlayerName: '',
    createCreature: '',
  });

  creatureTemplate = {};
  Object = Object;

  ngOnInit(): void {
    this.battleService.getCreatures()
      .pipe(take(1))
      .subscribe(response => {
        console.log('--- creature tempalte response: ', response);
        this.creatureTemplate = response;
      });
  }

  create(playerName: string | undefined | null, creature: string | undefined | null): any {
    if (playerName && creature) {
      this.battleService.postCreate(playerName, creature)
        .pipe(take(1))
        .subscribe(response => {
          console.log('--- create response: ', response);
        }); 
    }
  }

  login(playerName: string | undefined | null): any {
    if (playerName) {
      this.battleService.postLogin(playerName)
        .pipe(take(1))
        .subscribe(response => {
          console.log('--- login response: ', response);
        });
    }
  }
}
