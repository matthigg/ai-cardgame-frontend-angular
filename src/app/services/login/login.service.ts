import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take, tap } from 'rxjs';
import { PlayerModel } from '../../shared/models/players.model';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private urlBattle = 'http://127.0.0.1:8000/battle';
  private urlPlayer = 'http://127.0.0.1:8000/player';

  userInfo?: PlayerModel;

  constructor(private http: HttpClient) { }

  postCreate(playerName: string, creature: string): Observable<PlayerModel> {
    const body = {
      name: playerName,
      creature: creature,
    }
    return this.http.post<PlayerModel>(`${this.urlPlayer}/create`, body)
      .pipe(
        take(1),
        tap(response => {
          this.userInfo = response;
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
        tap(response => {
          this.userInfo = response;
        }),
      );
  }
}
