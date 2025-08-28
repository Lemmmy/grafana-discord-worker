import { Env, GrafanaWebhook } from "./types";

function findSecret(token: string | undefined | null, env: Env): string | null {
  if (!token) return null;

  // Iterate through all the keys in the environment until a match for the token is found, then return the URL.
  for (let i = 0; i < Object.keys(env).length; i++) {
    const key: keyof Env = `TOKEN_${i + 1}`;
    if (env[key]) {
      const [envToken, url] = env[key].split(",");
      if (envToken === token) return url;
    }
  }

  return null;
}

async function handleGrafanaWebhook(req: Request, forwardingUrl: string) {
  const body = await req.json();
  const { status, alerts } = body as GrafanaWebhook;

  if (!status) {
    return new Response("No status found", { status: 400 });
  }

  const alertsText = alerts
    .map((alert) => {
      const status = alert.status === "firing" ? "🔥" : "✅";
      const title = alert?.labels?.alertname ?? "No title";
      const url = alert.generatorURL;

      const annotations = alert.annotations;
      const text = annotations.description || annotations.summary || "No description provided";

      const titleUrl = url ? `[${title}](${url})` : title;
      const silenceUrl = alert.silenceURL ? ` [(silence)](${alert.silenceURL})` : "";

      return `${status} **${titleUrl}**${silenceUrl}\n${text}`;
    })
    .join("\n\n");

  const overallStatus = status === "firing" ? "🔥 **FIRING**" : "✅ **RESOLVED**";
  let message = `${overallStatus}\n\n${alertsText}`;
  if (message.length > 2044) {
    message = message.substring(0, 2044) + "…";
  }

  const payload = {
    content: message,
  };

  return fetch(forwardingUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

export default {
  async fetch(req: Request, env: Env) {
    const url = new URL(req.url);
    const { pathname } = url;

    if (pathname === "/webhook") {
      if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

      // Get the token from the `Authentication: Bearer <token>` header
      const authHeader = req.headers.get("Authorization");
      const token = authHeader?.split("Bearer ")[1];
      const forwardingUrl = findSecret(token, env);
      if (!forwardingUrl) return new Response("Unauthorized", { status: 401 });

      return handleGrafanaWebhook(req, forwardingUrl);
    } else {
      return new Response("Not found", { status: 404 });
    }
  },
}
