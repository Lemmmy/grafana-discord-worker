# Grafana → Discord webhook for Cloudflare Workers

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/Lemmmy/grafana-discord-worker)

Simple worker to proxy Grafana webhook requests to Discord in a more concise format. Not extensively tested or
comprehensive.

![](https://lemmmy.s-ul.eu/IuqTEiGQ.png)

## Usage

1. Deploy this worker to Cloudflare Workers
2. Create a new webhook in Discord
3. Generate a random secret key (e.g. 24 characters) and create a new environment variable in the worker called 
   `TOKEN_1`. The value should be the secret key, followed by a comma (`,`), followed by the Discord webhook URL. For
   example:
   `TOKEN_1=secretkey,https://discord.com/api/webhooks/1234567890/ABCDEFGHIJKLM`
4. Create as many more tokens as you need, e.g. `TOKEN_2`, `TOKEN_3`, etc. Each one can route to a different Discord
   webhook.
5. In Grafana, go to **Alerting** → **Contact points** → **Add contact point**
   - **Integration**: Webhook
   - **URL**: `https://grafana-discord-worker.yourusername.workers.dev/webhook`
   - **HTTP method**: POST
   - **Authorization Header - Scheme**: Bearer
   - **Authorization Header - Credentials**: The secret key you created in step 3
6. Test the contact point, and save it when there are no problems.

The description of the alert will use the summary of the alert, or the description if it is not available. No other
information is currently shown.

## License

MIT
