import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private apiUrl = 'http://127.0.0.1:8000'; // FastAPI backend

  constructor(private http: HttpClient) {}

  runBattle(): Observable<any> {
    return this.http.get(`${this.apiUrl}/battle`, {}); 
    // Adjust endpoint + payload based on your FastAPI route
  }

  runSimulate(): Observable<any> {
    return this.http.get(`${this.apiUrl}/battle`, {}); 
    // Adjust endpoint + payload based on your FastAPI route
  }

  getLogs(): Observable<any> {
    return this.http.get(`${this.apiUrl}/logs`);
    // Adjust if your backend uses a different path for logs
  }
}
