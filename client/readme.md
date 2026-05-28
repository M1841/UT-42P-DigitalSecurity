`.env`
```sh
VITE_SERVER_HOST="http://127.0.0.1:8080" # local development
# VITE_SERVER_HOST="URL of your server deployment" # production

VITE_STRONGHOLD_PASSWORD="Generate any secure password"

VITE_SERVER_PUBLIC_KEY="`npx @serenity-kit/opaque get-server-public-key <OPAQUE-SERVER-SETUP>`"
```
