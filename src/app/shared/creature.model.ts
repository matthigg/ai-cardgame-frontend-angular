export interface CreatureStats {
  name: string;
  totalWins: number;
  avgWins: number;
  totalEpochs: number;
  stats: Record<string, number>;
}
