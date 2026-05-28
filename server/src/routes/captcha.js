import { randomUUID } from "node:crypto";
import { env } from "node:process";

import { Router } from "express";

import { page } from "../services/html.js";
import { redis } from "../services/redis.js";

const captchaRoutes = Router();

captchaRoutes.get("/", async (req, res) => {
  const { userIdentifier } = req.query;
  return res.status(200).send(
    page({
      head: `
        <link rel="preconnect" href="https://challenges.cloudflare.com" />
        <style>
          main {
            font-family: system-ui, sans-serif;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
          }
        </style>
      `,
      body: `
        <main>
          <h2>Confirm you're a human</h2>
          <div
            class="cf-turnstile"
            data-sitekey="${env["TURNSTILE_SITEKEY"]}"
            data-callback="handleSuccess"
          ></div>
          <div id="error"></div>
        </main>
        <script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js"
          async
          defer
        ></script>
        <script>
          async function handleSuccess(token) {
            const res = await fetch("${env["SERVER_HOST"]}/api/captcha", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                userIdentifier: "${userIdentifier}",
                token: ${env["IS_DEV"] ? "'dev_token'" : "token"}
              }),
            });
            const { id, err } = await res.json();
            if (err) {
              document.getElementById("error").innerHTML = err;
              setTimeout(() => {
                location.reload();
              }, 2_000);
              return;
            }
            window.location.href = "http://localhost:1420/#/login?captchaId=" + id;
          }
        </script>`,
    }),
  );
});
captchaRoutes.post("/", async (req, res) => {
  try {
    const { userIdentifier, token } = req.body;
    if (!env["IS_DEV"]) {
      const result = await fetch(
        "https://challenges.cloudflare.com/turnstile/v0/siteverify",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            secret: env["TURNSTILE_SECRET"],
            response: token,
          }),
        },
      );
      const json = await result.json();
      if (!json.success) {
        return res
          .status(401)
          .send({ err: `Check failed: ${json["error-codes"][0]}` });
      }
    }
    const captchaId = randomUUID();
    await redis.setex(`captcha:${userIdentifier}`, 60, captchaId);
    return res.status(200).send({ id: captchaId });
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
});

export { captchaRoutes };
