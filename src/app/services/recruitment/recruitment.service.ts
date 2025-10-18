import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecruitmentService {
  private baseUrl = '/api/creatures';

  constructor(private http: HttpClient) {}

  getCreatureTemplates(): Observable<any> {
    return this.http.get(`${this.baseUrl}/templates`);
  }

  recruitCreature(playerName: string, templateName: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/recruit/${playerName}`, { template_name: templateName });
  }
}
