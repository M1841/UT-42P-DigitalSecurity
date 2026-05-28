import { randomInt, randomUUID } from "node:crypto";
import { env } from "node:process";

import { server } from "@serenity-kit/opaque";
import { count, eq } from "drizzle-orm";
import { Router } from "express";
import geoip from "geoip-lite";

import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { page } from "../services/html.js";
import { establish } from "../middleware/session.js";
import { send } from "../services/email.js";
import { redis } from "../services/redis.js";
import { generate, validate } from "../services/totp.js";
import { decrypt, encrypt } from "../services/encryption.js";

const SERVER_SETUP = env["OPAQUE_SERVER_SETUP"];
const SESSION_EXPIRY = 12 * 60 * 60;

const authRoutes = Router();

authRoutes.post("/email-code/send", async (req, res) => {
  try {
    const { email } = req.body;

    if (
      (
        await db
          .select({ count: count() })
          .from(users)
          .where(eq(users.email, email))
      )[0].count > 0
    ) {
      return res.status(409).send({ err: "Email address is taken" });
    }
    const code = String(randomInt(0, 1_000_000)).padStart(6, "0");
    const { err } = await send(
      email,
      "Email Verification",
      `
      <h1>Welcome!</h1>
      <p>Type or copy and paste the following code into the verification box</p>
      <h2><code>${code}</code></h2>
      <p>The code will expire after 5 minutes</p>`,
    );
    if (err) return res.status(400).send({ err });
    await redis.setex(`verificationCode:${email}`, 300, code);

    return res.status(200).send({});
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
});
authRoutes.post("/email-code/check", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (String(await redis.get(`verificationCode:${email}`)) !== code) {
      return res
        .status(401)
        .send({ err: "Verification code is incorrect or has expired" });
    }
    await redis.del(`verificationCode:${email}`);

    return res.status(200).send({});
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
});

authRoutes.post("/login/start", async (req, res) => {
  try {
    const { startLoginRequest, userIdentifier } = req.body;

    if (
      (
        await db
          .select({ count: count() })
          .from(users)
          .where(eq(users.username, userIdentifier))
      )[0].count < 1
    ) {
      return res.status(404).send({ err: "User not found" });
    }

    const [{ id, registrationRecord }] = await db
      .select({ id: users.id, registrationRecord: users.registrationRecord })
      .from(users)
      .where(eq(users.username, userIdentifier))
      .limit(1);
    const { serverLoginState, loginResponse } = server.startLogin({
      serverSetup: SERVER_SETUP,
      userIdentifier,
      registrationRecord: await decrypt(registrationRecord),
      startLoginRequest,
    });

    await redis.setex(`serverLoginState:${id}`, 60, serverLoginState);

    return res.status(200).send({ loginResponse });
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
});
authRoutes.post("/login/finish", async (req, res) => {
  try {
    const { finishLoginRequest, userIdentifier } = req.body;
    await redis.del(`captcha:${userIdentifier}`);
    const [{ id: userId, email }] = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(eq(users.username, userIdentifier))
      .limit(1);

    const serverLoginState = await redis.get(`serverLoginState:${userId}`);
    const { sessionKey } = server.finishLogin({
      finishLoginRequest,
      serverLoginState,
    });
    await redis.del(`serverLoginState:${userId}`);

    const sessionId = randomUUID();
    const logoutToken = randomUUID();
    const ipaddr = env["IS_DEV"]
      ? "127.0.0.1"
      : (req.ips?.[0] ?? req.socket?.address()?.address)?.split(":")?.at(-1);
    const os = req.useragent.os;

    await redis.setex(`session:${sessionId}`, SESSION_EXPIRY, {
      userId,
      sessionKey,
      logoutToken,
      ipaddr,
      time: Date.now(),
      os,
    });
    await redis.zadd(`user:sessions:${userId}`, {
      score: Math.floor(Date.now() / 1000) + SESSION_EXPIRY,
      member: sessionId,
    });

    if (!env["IS_DEV"]) {
      const logoutUrl = `${env["SERVER_HOST"]}/api/auth/logout?sessionId=${sessionId}&logoutToken=${logoutToken}`;
      const { city, country } = geoip.lookup(ipaddr) ?? {
        city: "N/A",
        country: "N/A",
      };
      await send(
        email,
        "Sign in alert",
        `
    <p>Someone just signed into your account from ${city}, ${country} (${ipaddr}). If it wasn't you, you can sign them out and by following this link:</p>
    <a href="${logoutUrl}" taget="_blank">${logoutUrl}</a>
    <p>The link will expire after 10 minutes</p>`,
      );
    }

    return res.status(200).send({ sessionId });
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
});

authRoutes.post("/register/start", async (req, res) => {
  try {
    const { userIdentifier, registrationRequest } = req.body;

    if (
      (
        await db
          .select({ count: count() })
          .from(users)
          .where(eq(users.username, userIdentifier))
      )[0].count > 0
    ) {
      return res.status(409).send({ err: "Username is taken" });
    }

    const { registrationResponse } = server.createRegistrationResponse({
      serverSetup: SERVER_SETUP,
      userIdentifier,
      registrationRequest,
    });

    return res.status(200).send({ registrationResponse });
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
});
authRoutes.post("/register/finish", async (req, res) => {
  try {
    const { registrationRecord, username, email } = req.body;
    await db.insert(users).values({
      username,
      email,
      registrationRecord: await encrypt(registrationRecord),
    });
    return res.status(200).send({});
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
});

authRoutes.post("/logout", establish, async (req, res) => {
  try {
    const { sessionId } = req.body;
    const { id: userId } = req.user;
    await redis.del(`session:${sessionId}`);
    await redis.zrem(`user:sessions:${userId}`, sessionId);

    return res.status(200).send({});
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
});
authRoutes.get("/logout", async (req, res) => {
  try {
    const { sessionId, logoutToken } = req.query;

    const session = await redis.get(`session:${sessionId}`);
    if (session?.logoutToken === logoutToken) {
      await redis.del(`session:${sessionId}`);
      await redis.zrem(`user:sessions:${session.userId}`, sessionId);
    }

    return res.status(200).send(page({ body: "<h1>Logout successful</h1>" }));
  } catch (err) {
    return res
      .status(400)
      .send(page({ body: `<h1>Error</h1><pre>${String(err)}</pre>` }));
  }
});

authRoutes.post("/totp/generate", async (req, res) => {
  try {
    const { userIdentifier } = req.body;

    const { uri, qr, secret } = await generate(userIdentifier);
    await db
      .update(users)
      .set({ totp_secret: await encrypt(secret) })
      .where(eq(users.username, userIdentifier))
      .returning();

    return res.status(200).send({ uri, qr });
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
});
authRoutes.post("/totp/validate", async (req, res) => {
  if (env["IS_DEV"]) return res.status(200).send({});
  try {
    const { userIdentifier, token } = req.body;

    const [{ secret, lastTimeStep }] = await db
      .select({
        secret: users.totp_secret,
        lastTimeStep: users.totp_lastTimeStep,
      })
      .from(users)
      .where(eq(users.username, userIdentifier))
      .limit(1);
    const { isValid, timeStep: totp_lastTimeStep } = await validate(
      await decrypt(secret),
      lastTimeStep,
      token,
    );
    if (isValid) {
      await db.update(users).set({ totp_lastTimeStep });
      return res.status(200).send({});
    }
    return res.status(401).send({ err: "Code is invalid or has expired" });
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
});

authRoutes.get("/sessions", establish, async (req, res) => {
  try {
    const { id: userId } = req.user;
    await redis.zremrangebyscore(
      `user:sessions:${userId}`,
      "-inf",
      Math.floor(Date.now() / 1000),
    );
    const sessionIds = await redis.zrange(`user:sessions:${userId}`, 0, -1);
    const sessions = await Promise.all(
      sessionIds.map(async (sessionId) => {
        const session = await redis.get(`session:${sessionId}`);
        const { city, country } = geoip.lookup(session.ipaddr) ?? {
          city: "N/A",
          country: "N/A",
        };
        return {
          ...session,
          id: sessionId,
          location: `${city}, ${country}`,
        };
      }),
    );
    return res.status(200).send({ sessions });
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
});

export { authRoutes };
