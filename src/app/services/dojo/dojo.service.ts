import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DojoService {

  playerCreatures = [
    {
      playerName: 'Alice',
      playerID: 1,
      creatureName: 'Bear',
      creatureID: 11,
    }
  ];

  enemyCreatures = [
    {
      playerName: 'Bob',
      playerID: 2,
      creatureName: 'Snake',
      creatureID: 21,
    }
  ];
  
  constructor() { }
}
