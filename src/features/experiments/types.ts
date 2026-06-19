export type ExperimentArm = "control" | "variant";

export interface ExperimentAssignment {
  experimentId: string;
  variantArm: ExperimentArm;
}

export type ExperimentWinnerRecommendation = ExperimentArm | "inconclusive";

export type ExperimentStatus =
  | "draft"
  | "running"
  | "paused"
  | "completed";

export interface Experiment {
  id: string;
  name: string;
  status: ExperimentStatus;
  variantId: string;
  controlConversions: number;
  variantConversions: number;
  controlSessions: number;
  variantSessions: number;
  createdAt: Date;
  completedAt: Date | null;
}
