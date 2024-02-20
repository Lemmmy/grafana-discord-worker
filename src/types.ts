export interface Env {
  [key: `TOKEN_${string}`]: string;
}

type Status = "firing" | "resolved";

export interface GrafanaWebhook {
  receiver         : string;
  status           : Status;
  orgId            : number;
  alerts           : GrafanaAlert[];
  groupLabels      : Record<string  , string>;
  commonLabels     : Record<string  , string>;
  commonAnnotations: Record<string  , string>;
  externalURL      : string;
  version          : string;
  groupKey         : string;
  truncatedAlerts  : number;
}

interface GrafanaAlert {
  status      : Status;
  labels      : Record<string, string>;
  annotations : Record<string, string>;
  startsAt    : string;
  endsAt      : string;
  values      : Record<string, number>;
  generatorURL: string;
  fingerprint : string;
  silenceURL  : string;
  dashboardURL: string;
  panelURL    : string;
  imageURL    : string;
}
