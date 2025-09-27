import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private urlBattle = 'http://127.0.0.1:8000/battle';
  private urlPlayer = 'http://127.0.0.1:8000/player';

  constructor(private http: HttpClient) { }

  postCreate(playerName: string, creature: string): Observable<any> {
    const body = {
      name: playerName,
      creature: creature,
    }
    return this.http.post(`${this.urlPlayer}/create`, body);
  }

  postLogin(playerName: string): Observable<any> {
    const body = {
      name: playerName,
    }
    return this.http.post(`${this.urlPlayer}/login`, body);
  }
}
