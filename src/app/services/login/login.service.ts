import { HttpClient } from '@angular/common/http';
import { Injectable, signal, WritableSignal } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { PlayerModel } from '../../shared/models/players.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private urlBattle = 'http://127.0.0.1:8000/battle';
  private urlPlayer = 'http://127.0.0.1:8000/player';

  userInfoSignal: WritableSignal<PlayerModel | null> = signal(null);

  constructor(private http: HttpClient) { }

  postCreate(playerName: string, creature: string): Observable<PlayerModel> {
    const body = {
      name: playerName,
      creature: creature,
    }
    return this.http.post<PlayerModel>(`${this.urlPlayer}/create`, body)
      .pipe(
        take(1),
        tap((response: PlayerModel) => {
          this.userInfoSignal.set(response);
        }),
      );
  }

  postLogin(playerName: string): Observable<PlayerModel> {
    const body = {
      name: playerName,
    }
    return this.http.post<PlayerModel>(`${this.urlPlayer}/login`, body)
      .pipe(
        take(1),
        tap((response: PlayerModel) => {
          this.userInfoSignal.set(response);
        }),
      );
  }

  postLogout(playerName: string): Observable<{ 
    status: string, 
    message: string,
    deleted_checkpoints: string 
  }> {
    const body = {
      name: playerName,
    }
    return this.http.post<any>(`${this.urlPlayer}/logout`, body)
      .pipe(
        take(1),
        tap(response => {
          // this.userInfo = response;
          // console.log('--- response: ', response);
          this.userInfoSignal.set(null);
        }),
      );
  }
}
