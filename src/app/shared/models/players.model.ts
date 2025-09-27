export interface PlayerModel {
    id:        number;
    name:      string;
    creatures: Creature[];
}

export interface Creature {
    id:                number;
    name:              string;
    owner:             string;
    hp:                number;
    max_hp:            number;
    energy:            number;
    max_energy:        number;
    speed:             number;
    special_abilities: string[];
    reward_config:     RewardConfig;
    nn_config:         NnConfig;
    runtime_state:     RuntimeState;
}

export interface NnConfig {
    learning_rate:       number;
    epsilon:             number;
    eps_min:             number;
    eps_decay_rate:      number;
    alpha_baseline:      number;
    entropy_beta:        number;
    max_display_neurons: number;
    hidden_sizes:        number[];
}

export interface RewardConfig {
    attack:  number;
    defend:  number;
    recover: number;
    win:     number;
    lose:    number;
    poison:  number;
    stun:    number;
}

export interface RuntimeState {
    hp:       number;
    energy:   number;
    statuses: Statuses;
}

export interface Statuses {
}
