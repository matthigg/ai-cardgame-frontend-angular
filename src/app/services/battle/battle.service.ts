import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrainModel } from '../../shared/models/train.model';

@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private apiUrl = 'http://127.0.0.1:8000/battle'; // adjust if backend runs elsewhere

  constructor(private http: HttpClient) {}

  getTrain(playerData: TrainModel, enemyData: TrainModel): Observable<any> {

    let params = new HttpParams()
      .set('player_name_A', playerData.playerName)
      .set('player_id_A', playerData.playerID)
      .set('creature_name_A', playerData.creatureName)
      .set('creature_id_A', playerData.creatureID)
      .set('player_name_B', enemyData.playerName)
      .set('player_id_B', enemyData.playerID)
      .set('creature_name_B', enemyData.creatureName)
      .set('creature_id_B', enemyData.creatureID)

    return this.http.get(`${this.apiUrl}/train`, { params });
  }

  getSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`);
  }

  getCreatureGraph(playerData: TrainModel, enemyData: TrainModel): Observable<any> {

    let params = new HttpParams()
      .set('player_name_A', playerData.playerName)
      .set('player_id_A', playerData.playerID)
      .set('creature_name_A', playerData.creatureName)
      .set('creature_id_A', playerData.creatureID)
      .set('player_name_B', enemyData.playerName)
      .set('player_id_B', enemyData.playerID)
      .set('creature_name_B', enemyData.creatureName)
      .set('creature_id_B', enemyData.creatureID)

    return this.http.get(`${this.apiUrl}/nn-graph`, { params });
  }


}
