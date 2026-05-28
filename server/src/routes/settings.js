import { Router } from "express";

import { establish } from "../middleware/session.js";

const settingsRoutes = Router();

settingsRoutes.get("/user", establish, async (req, res) => {
  try {
    const { username, email } = req.user;
    return res.status(200).send({ username, email });
  } catch (err) {
    return res.status(400).send({ err: String(err) });
  }
});

export { settingsRoutes };
