import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { redis } from "../services/redis.js";

/**
 *
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns {Promise<void|Response<any,Record<string,any>>>}
 */
export async function establish(req, res, next) {
  try {
    const { sessionId } = req.body ?? req.query;
    const sessionKey = req.headers?.authorization?.split(" ")[1];

    if (!sessionKey || !sessionId) {
      return res.status(401).send({ err: "Unauthenticated request" });
    }

    const { sessionKey: expectedKey, userId } = await redis.get(
      `session:${sessionId}`,
    );
    if (expectedKey !== sessionKey) {
      return res.status(401).send({ err: "Session invalid or expired" });
    }

    const [user] = await db
      .select({ id: users.id, username: users.username, email: users.email })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    req.user = user;
    next();
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
}
