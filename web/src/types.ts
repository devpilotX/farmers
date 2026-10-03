export type Point = { longitude: number; latitude: number };
export type Farm = {
  id: string;
  farmerName: string;
  village: string;
  district: string;
  crop: string;
  stage: string;
  areaHectares: number;
  assets: string;
  boundary: Point[];
  consentVersion: string;
  consentAt: string;
  createdAt: string;
  version: number;
  updatedAt: string;
};
export type FarmInput = Omit<
  Farm,
  "id" | "consentAt" | "createdAt" | "version" | "updatedAt"
> & {
  requestId: string;
  consent: boolean;
};
export type Task = {
  id: string;
  farmId: string;
  title: string;
  detail: string;
  completed: boolean;
  updatedAt: string;
};
export type Workspace = {
  mode: "local-demo" | "authenticated";
  playbookStatus: string;
};
export type Route =
  | "overview"
  | "farms"
  | "prepare"
  | "summary"
  | "register"
  | "pending"
  | "edit"
  | "history";

export type CorrectionInput = Pick<
  Farm,
  "crop" | "stage" | "areaHectares" | "assets" | "boundary"
> & {
  requestId: string;
  expectedVersion: number;
  reason: string;
  reviewed: boolean;
};
export type RecordEvent = {
  id: string;
  eventType: string;
  recordedAt: string;
  recordVersion: number | null;
  changedFields: string[];
  reason: string | null;
};
