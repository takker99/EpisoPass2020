export type QAS = {
  question: string;
  answers: string[];
}[];

export type EpisoData = {
  name: string;
  seed: string;
  qas: QAS;
};
