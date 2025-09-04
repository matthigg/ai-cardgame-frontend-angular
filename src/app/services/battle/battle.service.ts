import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private apiUrl = 'http://127.0.0.1:8000/battle'; // adjust if backend runs elsewhere

  constructor(private http: HttpClient) {}

  getTrain(): Observable<any> {
    return this.http.get(`${this.apiUrl}/train`);
  }

  getTrainingStream(): EventSource {
    return new EventSource(`${this.apiUrl}/training-stream`);
  }

  getSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`);
  }

}
