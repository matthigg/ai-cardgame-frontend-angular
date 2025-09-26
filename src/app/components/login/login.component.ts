import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { take } from 'rxjs';
import { BattleService } from '../../services/battle/battle.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  public battleService = inject(BattleService);
  private fb = inject(FormBuilder);

  loginFG = this.fb.group({
    name: '',
  });

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
