import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrainModel } from '../../shared/models/train.model';

@Injectable({
  providedIn: 'root'
})
export class BattleService {
  private apiUrl = 'http://127.0.0.1:8000/battle';

  constructor(private http: HttpClient) {}

  postTrain(playerData: TrainModel, enemyData: TrainModel): Observable<any> {
    const body = {
      player_name_A: playerData.playerName,
      player_id_A: playerData.playerID,
      creature_name_A: playerData.creatureName,
      creature_id_A: playerData.creatureID,
      player_name_B: enemyData.playerName,
      player_id_B: enemyData.playerID,
      creature_name_B: enemyData.creatureName,
      creature_id_B: enemyData.creatureID,
    };
    return this.http.post(`${this.apiUrl}/train`, body);
  }

  getSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/summary`);
  }

  postNNGraph(playerData: TrainModel, enemyData: TrainModel): Observable<any> {
    const body = {
      player_name_A: playerData.playerName,
      player_id_A: playerData.playerID,
      creature_name_A: playerData.creatureName,
      creature_id_A: playerData.creatureID,
      player_name_B: enemyData.playerName,
      player_id_B: enemyData.playerID,
      creature_name_B: enemyData.creatureName,
      creature_id_B: enemyData.creatureID,
    };
    return this.http.post(`${this.apiUrl}/nn-graph`, body);
  }
}
