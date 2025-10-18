import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class RecruitmentService {
  private urlCreatures = 'http://127.0.0.1:8000/creatures';

  constructor(private http: HttpClient) {}

  getCreatureTemplates(): Observable<any> {
    return this.http.get(`${this.urlCreatures}/templates`);
  }

  recruitCreature(playerName: string, templateName: string): Observable<any> {
    return this.http.post(`${this.urlCreatures}/recruit/${playerName}`, { template_name: templateName });
  }
}
