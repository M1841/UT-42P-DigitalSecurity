import { env } from "node:process";

import { ready } from "@serenity-kit/opaque";
import cors from "cors";
import express from "express";
import { express as useragent } from "express-useragent";

import { authRoutes } from "./routes/auth.js";
import { captchaRoutes } from "./routes/captcha.js";
import { settingsRoutes } from "./routes/settings.js";

await ready;

const app = express();

app.use(useragent());
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set("trust proxy", true);

app.use("/api/auth", authRoutes);
app.use("/api/captcha", captchaRoutes);
app.use("/api/settings", settingsRoutes);

app.get("/api/health", (_req, res) => res.send({ ok: true }));

app.listen(8080, () => {
  console.log(`Server running at ${env["SERVER_HOST"]}`);
});
