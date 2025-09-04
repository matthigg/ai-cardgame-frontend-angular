import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BattleService } from './services/battle/battle.service';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';
import { D3ChartComponent } from './d3-chart/d3-chart.component';

@Component({
  selector: 'app-root',
  // imports: [CommonModule, RouterOutlet],
  imports: [CommonModule, D3ChartComponent],
  // imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  mockData = {
    epoch: 'start epoch',
    winner: 'start winner',
    reward_A: 'start reward a',
    reward_B: 'start reward b',
    wins: 'start wins',
  }

  log = signal(this.mockData)

  constructor(private battleService: BattleService) {}

  onTrain(): void {
    this.battleService.getTrain().pipe(take(1)).subscribe();
  }

  onTrainingStream(): void {
    const eventSource = this.battleService.getTrainingStream();

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.status === "completed") {
        console.log("Training finished");
        eventSource.close();
        return;
      }

      this.log.set(data); 
      console.log("UI rendering log:", this.log());
    };

    eventSource.onerror = (error) => {
      console.error("Stream error", error);
      eventSource.close();
    };
  }

}



const x = [
  {
    "epoch": 99,
    "tick": 0,
    "creature": "A",
    "state": [
      100,
      100,
      100,
      100
    ],
    "action": "recover",
    "action_idx": 2,
    "probs": [
      0.03596285358071327,
      0.007072279695421457,
      0.8414093255996704,
      0.0036093140952289104,
      0.1119462102651596
    ],
    "hp": 100,
    "energy": 100,
    "statuses": {},
    "reward": -0.01
  },
  {
    "epoch": 99,
    "tick": 1,
    "creature": "A",
    "state": [
      100,
      100,
      100,
      60
    ],
    "action": "*STUNNED*",
    "action_idx": -1,
    "probs": [
      0,
      0,
      0,
      0
    ],
    "hp": 100,
    "energy": 100,
    "statuses": {
      "stun": 1
    },
    "reward": 0
  },
  {
    "epoch": 99,
    "tick": 2,
    "creature": "A",
    "state": [
      95,
      100,
      100,
      30
    ],
    "action": "defend",
    "action_idx": 1,
    "probs": [
      0.11277551203966141,
      0.029593100771307945,
      0.6530499458312988,
      0.010774409398436546,
      0.19380713999271393
    ],
    "hp": 95,
    "energy": 100,
    "statuses": {
      "poison": 2,
      "defend": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 3,
    "creature": "A",
    "state": [
      90,
      70,
      100,
      0
    ],
    "action": "poison",
    "action_idx": 4,
    "probs": [
      0.15695492923259735,
      0.02328937128186226,
      0.5660421252250671,
      0.005692756734788418,
      0.24802082777023315
    ],
    "hp": 90,
    "energy": 70,
    "statuses": {
      "poison": 2
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 4,
    "creature": "A",
    "state": [
      85,
      40,
      95,
      10
    ],
    "action": "poison",
    "action_idx": 4,
    "probs": [
      0.16870243847370148,
      0.04094230756163597,
      0.5308589339256287,
      0.013733669184148312,
      0.24576275050640106
    ],
    "hp": 85,
    "energy": 40,
    "statuses": {
      "poison": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 5,
    "creature": "A",
    "state": [
      80,
      50,
      95,
      10
    ],
    "action": "defend",
    "action_idx": 1,
    "probs": [
      0.20174060761928558,
      0.05403578281402588,
      0.46400341391563416,
      0.019207093864679337,
      0.26101306080818176
    ],
    "hp": 80,
    "energy": 50,
    "statuses": {
      "defend": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 6,
    "creature": "A",
    "state": [
      80,
      60,
      85,
      20
    ],
    "action": "defend",
    "action_idx": 1,
    "probs": [
      0.1802256554365158,
      0.06200897693634033,
      0.4866722524166107,
      0.0235894788056612,
      0.24750357866287231
    ],
    "hp": 80,
    "energy": 60,
    "statuses": {
      "defend": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 7,
    "creature": "A",
    "state": [
      80,
      100,
      80,
      30
    ],
    "action": "recover",
    "action_idx": 2,
    "probs": [
      0.1511726826429367,
      0.05601801350712776,
      0.5432721972465515,
      0.022709447890520096,
      0.22682765126228333
    ],
    "hp": 80,
    "energy": 100,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 8,
    "creature": "A",
    "state": [
      80,
      60,
      80,
      30
    ],
    "action": "stun",
    "action_idx": 3,
    "probs": [
      0.0834403932094574,
      0.021619008854031563,
      0.7108256220817566,
      0.012335961684584618,
      0.17177903652191162
    ],
    "hp": 80,
    "energy": 60,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 9,
    "creature": "A",
    "state": [
      80,
      70,
      80,
      40
    ],
    "action": "defend",
    "action_idx": 1,
    "probs": [
      0.13871492445468903,
      0.052914898842573166,
      0.5695657134056091,
      0.021187659353017807,
      0.21761685609817505
    ],
    "hp": 80,
    "energy": 70,
    "statuses": {
      "defend": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 10,
    "creature": "A",
    "state": [
      80,
      40,
      80,
      50
    ],
    "action": "poison",
    "action_idx": 4,
    "probs": [
      0.10503789782524109,
      0.038540009409189224,
      0.6451191306114197,
      0.017786214128136635,
      0.19351667165756226
    ],
    "hp": 80,
    "energy": 40,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 11,
    "creature": "A",
    "state": [
      80,
      50,
      55,
      100
    ],
    "action": "attack",
    "action_idx": 0,
    "probs": [
      0.0567210428416729,
      0.020110372453927994,
      0.767328679561615,
      0.013685133308172226,
      0.14215479791164398
    ],
    "hp": 80,
    "energy": 50,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 12,
    "creature": "A",
    "state": [
      60,
      20,
      45,
      100
    ],
    "action": "poison",
    "action_idx": 4,
    "probs": [
      0.06005186587572098,
      0.012274141423404217,
      0.7870079874992371,
      0.0033329303842037916,
      0.13733306527137756
    ],
    "hp": 60,
    "energy": 20,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 13,
    "creature": "A",
    "state": [
      60,
      80,
      45,
      100
    ],
    "action": "recover",
    "action_idx": 2,
    "probs": [
      0.04493880271911621,
      0.0124061219394207,
      0.8072079420089722,
      0.009577556513249874,
      0.12586960196495056
    ],
    "hp": 60,
    "energy": 80,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 14,
    "creature": "A",
    "state": [
      55,
      80,
      35,
      30
    ],
    "action": "*STUNNED*",
    "action_idx": -1,
    "probs": [
      0,
      0,
      0,
      0
    ],
    "hp": 55,
    "energy": 80,
    "statuses": {
      "stun": 1,
      "poison": 2
    },
    "reward": 0
  },
  {
    "epoch": 99,
    "tick": 15,
    "creature": "A",
    "state": [
      50,
      90,
      30,
      30
    ],
    "action": "defend",
    "action_idx": 1,
    "probs": [
      0.0909188911318779,
      0.025867197662591934,
      0.6606967449188232,
      0.020764853805303574,
      0.20175239443778992
    ],
    "hp": 50,
    "energy": 90,
    "statuses": {
      "poison": 1,
      "defend": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 16,
    "creature": "A",
    "state": [
      45,
      60,
      30,
      30
    ],
    "action": "poison",
    "action_idx": 4,
    "probs": [
      0.06669378280639648,
      0.017315004020929337,
      0.7083819508552551,
      0.016460822895169258,
      0.19114840030670166
    ],
    "hp": 45,
    "energy": 60,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 17,
    "creature": "A",
    "state": [
      45,
      20,
      25,
      90
    ],
    "action": "stun",
    "action_idx": 3,
    "probs": [
      0.06361386924982071,
      0.006782290060073137,
      0.8019980192184448,
      0.0013121194206178188,
      0.12629373371601105
    ],
    "hp": 45,
    "energy": 20,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 18,
    "creature": "A",
    "state": [
      45,
      80,
      20,
      90
    ],
    "action": "recover",
    "action_idx": 2,
    "probs": [
      0.053757961839437485,
      0.007492745760828257,
      0.777582049369812,
      0.004445212893188,
      0.1567220836877823
    ],
    "hp": 45,
    "energy": 80,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 19,
    "creature": "A",
    "state": [
      45,
      100,
      15,
      100
    ],
    "action": "recover",
    "action_idx": 2,
    "probs": [
      0.02416420169174671,
      0.0017072695773094893,
      0.8913952708244324,
      0.0002300726919202134,
      0.08250322937965393
    ],
    "hp": 45,
    "energy": 100,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 20,
    "creature": "A",
    "state": [
      25,
      60,
      15,
      100
    ],
    "action": "stun",
    "action_idx": 3,
    "probs": [
      0.007885942235589027,
      0.00046114559518173337,
      0.9517267346382141,
      0.0003943514602724463,
      0.03953183442354202
    ],
    "hp": 25,
    "energy": 60,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 21,
    "creature": "A",
    "state": [
      25,
      20,
      15,
      100
    ],
    "action": "stun",
    "action_idx": 3,
    "probs": [
      0.03178653493523598,
      0.0021978316362947226,
      0.9020877480506897,
      0.0005930957267992198,
      0.06333483755588531
    ],
    "hp": 25,
    "energy": 20,
    "statuses": {},
    "reward": 10.2
  },
  {
    "epoch": 99,
    "tick": 0,
    "creature": "B",
    "state": [
      100,
      100,
      100,
      100
    ],
    "action": "defend",
    "action_idx": 1,
    "probs": [
      0.00005346608304535039,
      0.23956263065338135,
      0.03380085155367851,
      0.0013100015930831432,
      0.7252730131149292
    ],
    "hp": 100,
    "energy": 100,
    "statuses": {
      "defend": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 1,
    "creature": "B",
    "state": [
      100,
      60,
      100,
      100
    ],
    "action": "stun",
    "action_idx": 3,
    "probs": [
      0.00005346608304535039,
      0.23956263065338135,
      0.03380085155367851,
      0.0013100015930831432,
      0.7252730131149292
    ],
    "hp": 100,
    "energy": 60,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 2,
    "creature": "B",
    "state": [
      100,
      30,
      100,
      100
    ],
    "action": "poison",
    "action_idx": 4,
    "probs": [
      0.00011078436364186928,
      0.3569197654724121,
      0.021831106394529343,
      0.0004263721057213843,
      0.6207119822502136
    ],
    "hp": 100,
    "energy": 30,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 3,
    "creature": "B",
    "state": [
      100,
      0,
      95,
      100
    ],
    "action": "poison",
    "action_idx": 4,
    "probs": [
      0.0001635642402106896,
      0.6328290700912476,
      0.03411335125565529,
      0.0005773621378466487,
      0.33231672644615173
    ],
    "hp": 100,
    "energy": 0,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 4,
    "creature": "B",
    "state": [
      95,
      10,
      90,
      70
    ],
    "action": "defend",
    "action_idx": 1,
    "probs": [
      0.0009736234787851572,
      0.887596607208252,
      0.03193918615579605,
      0.002679375233128667,
      0.07681112736463547
    ],
    "hp": 95,
    "energy": 10,
    "statuses": {
      "poison": 2,
      "defend": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 5,
    "creature": "B",
    "state": [
      90,
      20,
      80,
      50
    ],
    "action": "defend",
    "action_idx": 1,
    "probs": [
      0.0023418013006448746,
      0.8685762882232666,
      0.022579453885555267,
      0.005797934718430042,
      0.10070447623729706
    ],
    "hp": 90,
    "energy": 20,
    "statuses": {
      "poison": 2,
      "defend": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 6,
    "creature": "B",
    "state": [
      85,
      20,
      80,
      50
    ],
    "action": "stun",
    "action_idx": 3,
    "probs": [
      0.0024722411762923002,
      0.8128710389137268,
      0.027820304036140442,
      0.005859193857759237,
      0.1509772539138794
    ],
    "hp": 85,
    "energy": 20,
    "statuses": {
      "poison": 1
    },
    "reward": 0
  },
  {
    "epoch": 99,
    "tick": 7,
    "creature": "B",
    "state": [
      80,
      30,
      80,
      60
    ],
    "action": "defend",
    "action_idx": 1,
    "probs": [
      0.001762772211804986,
      0.7498691082000732,
      0.04145873710513115,
      0.004347506444901228,
      0.20256181061267853
    ],
    "hp": 80,
    "energy": 30,
    "statuses": {
      "defend": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 8,
    "creature": "B",
    "state": [
      80,
      40,
      80,
      60
    ],
    "action": "defend",
    "action_idx": 1,
    "probs": [
      0.0015905977925285697,
      0.6578547358512878,
      0.03940284997224808,
      0.004070767667144537,
      0.2970811426639557
    ],
    "hp": 80,
    "energy": 40,
    "statuses": {
      "defend": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 9,
    "creature": "B",
    "state": [
      80,
      50,
      80,
      70
    ],
    "action": "defend",
    "action_idx": 1,
    "probs": [
      0.0009271950111724436,
      0.4820210337638855,
      0.04321743920445442,
      0.0026591005735099316,
      0.4711751937866211
    ],
    "hp": 80,
    "energy": 50,
    "statuses": {
      "defend": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 10,
    "creature": "B",
    "state": [
      75,
      100,
      80,
      40
    ],
    "action": "recover",
    "action_idx": 2,
    "probs": [
      0.0031284689903259277,
      0.6469190716743469,
      0.05636350065469742,
      0.016252538189291954,
      0.2773364186286926
    ],
    "hp": 75,
    "energy": 100,
    "statuses": {
      "poison": 2
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 11,
    "creature": "B",
    "state": [
      50,
      100,
      80,
      50
    ],
    "action": "recover",
    "action_idx": 2,
    "probs": [
      0.00031265776487998664,
      0.375999391078949,
      0.35766446590423584,
      0.028357869014143944,
      0.23766566812992096
    ],
    "hp": 50,
    "energy": 100,
    "statuses": {
      "poison": 1
    },
    "reward": -0.01
  },
  {
    "epoch": 99,
    "tick": 12,
    "creature": "B",
    "state": [
      45,
      100,
      60,
      50
    ],
    "action": "attack",
    "action_idx": 0,
    "probs": [
      0.0002581157023087144,
      0.3779628872871399,
      0.3919261693954468,
      0.02603592723608017,
      0.20381692051887512
    ],
    "hp": 45,
    "energy": 100,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 13,
    "creature": "B",
    "state": [
      40,
      60,
      60,
      80
    ],
    "action": "stun",
    "action_idx": 3,
    "probs": [
      0.00017778189794626087,
      0.31081175804138184,
      0.24482113122940063,
      0.011982678435742855,
      0.4322066009044647
    ],
    "hp": 40,
    "energy": 60,
    "statuses": {
      "poison": 2
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 14,
    "creature": "B",
    "state": [
      35,
      30,
      60,
      80
    ],
    "action": "poison",
    "action_idx": 4,
    "probs": [
      0.00042773073073476553,
      0.3657158315181732,
      0.17826005816459656,
      0.003973192535340786,
      0.45162317156791687
    ],
    "hp": 35,
    "energy": 30,
    "statuses": {
      "poison": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 15,
    "creature": "B",
    "state": [
      30,
      30,
      55,
      80
    ],
    "action": "stun",
    "action_idx": 3,
    "probs": [
      0.0007942952215671539,
      0.3917572498321533,
      0.2238030880689621,
      0.0019521611975505948,
      0.3816932439804077
    ],
    "hp": 30,
    "energy": 30,
    "statuses": {},
    "reward": 0
  },
  {
    "epoch": 99,
    "tick": 16,
    "creature": "B",
    "state": [
      25,
      90,
      45,
      60
    ],
    "action": "recover",
    "action_idx": 2,
    "probs": [
      0.0027497364208102226,
      0.38657280802726746,
      0.19856621325016022,
      0.007089614402502775,
      0.40502163767814636
    ],
    "hp": 25,
    "energy": 90,
    "statuses": {
      "poison": 2
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 17,
    "creature": "B",
    "state": [
      20,
      90,
      45,
      20
    ],
    "action": "*STUNNED*",
    "action_idx": -1,
    "probs": [
      0,
      0,
      0,
      0
    ],
    "hp": 20,
    "energy": 90,
    "statuses": {
      "poison": 1,
      "stun": 1
    },
    "reward": 0
  },
  {
    "epoch": 99,
    "tick": 18,
    "creature": "B",
    "state": [
      15,
      100,
      45,
      80
    ],
    "action": "recover",
    "action_idx": 2,
    "probs": [
      0.00020970543846488,
      0.3554155230522156,
      0.292176216840744,
      0.010234121233224869,
      0.3419644236564636
    ],
    "hp": 15,
    "energy": 100,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 19,
    "creature": "B",
    "state": [
      15,
      100,
      45,
      100
    ],
    "action": "defend",
    "action_idx": 1,
    "probs": [
      0.00007252790237544104,
      0.33269205689430237,
      0.246631920337677,
      0.004404490813612938,
      0.4161989390850067
    ],
    "hp": 15,
    "energy": 100,
    "statuses": {
      "defend": 1
    },
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 20,
    "creature": "B",
    "state": [
      15,
      100,
      25,
      100
    ],
    "action": "attack",
    "action_idx": 0,
    "probs": [
      0.00007252790237544104,
      0.33269205689430237,
      0.246631920337677,
      0.004404490813612938,
      0.4161989390850067
    ],
    "hp": 15,
    "energy": 100,
    "statuses": {},
    "reward": 0.01
  },
  {
    "epoch": 99,
    "tick": 21,
    "creature": "B",
    "state": [
      15,
      100,
      25,
      20
    ],
    "action": "*STUNNED*",
    "action_idx": -1,
    "probs": [
      0,
      0,
      0,
      0
    ],
    "hp": 15,
    "energy": 100,
    "statuses": {
      "stun": 1
    },
    "reward": 0
  },
  {
    "epoch": 99,
    "tick": 22,
    "creature": "B",
    "state": [
      -5,
      100,
      25,
      30
    ],
    "action": "*KNOCKOUT*",
    "action_idx": 0,
    "probs": [
      0.0432291105389595,
      0.0030377255752682686,
      0.8574082851409912,
      0.0035143427085131407,
      0.09281053394079208
    ],
    "hp": -5,
    "energy": 100,
    "statuses": {
      "stun": 1
    },
    "reward": -9.83
  }
]