import { client } from "@serenity-kit/opaque";

import { post, request, setSession, clearSession } from "./api";

/**
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{finishLoginRequest:string|undefined;sessionKey:string|undefined;err:string|undefined}>}
 */
export async function loginStart(username, password) {
  try {
    const { clientLoginState, startLoginRequest } = client.startLogin({
      password,
    });

    const { loginResponse, err: errStart } = await post(
      "/api/auth/login/start",
      {
        startLoginRequest,
        userIdentifier: username,
      },
    );
    if (errStart) return { err: errStart };

    const loginResult = client.finishLogin({
      clientLoginState,
      loginResponse,
      password,
    });
    if (!loginResult) return { err: "Password is incorrect" };
    const { finishLoginRequest, sessionKey, serverStaticPublicKey } =
      loginResult;
    if (serverStaticPublicKey !== import.meta.env["VITE_SERVER_PUBLIC_KEY"]) {
      return { err: "Unauthorized server" };
    }

    return { finishLoginRequest, sessionKey };
  } catch (err) {
    return { err: String(err) };
  }
}

/**
 *
 * @param {string} userIdentifier
 * @param {string} finishLoginRequest
 * @param {string} sessionKey
 * @returns {Promise<{err:string|undefined}>}
 */
export async function loginFinish(
  userIdentifier,
  finishLoginRequest,
  sessionKey,
) {
  try {
    const { sessionId, err } = await post("/api/auth/login/finish", {
      finishLoginRequest,
      userIdentifier,
    });
    if (err) return { err };

    await setSession(sessionId, sessionKey);
    return {};
  } catch (err) {
    return { err: String(err) };
  }
}

/**
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{registrationRecord:string|undefined;err:string|undefined}>}
 */
export async function registerStart(username, password) {
  try {
    const { clientRegistrationState, registrationRequest } =
      client.startRegistration({ password });

    const { registrationResponse, err } = await post(
      "/api/auth/register/start",
      { registrationRequest, userIdentifier: username },
    );
    if (err) return { err };

    const { registrationRecord, serverStaticPublicKey } =
      client.finishRegistration({
        clientRegistrationState,
        registrationResponse,
        password,
      });
    if (serverStaticPublicKey !== import.meta.env["VITE_SERVER_PUBLIC_KEY"]) {
      return { err: "Unauthorized server" };
    }

    return { registrationRecord };
  } catch (err) {
    return { err: String(err) };
  }
}

/**
 *
 * @param {string} email
 * @param {string} username
 * @param {string} registrationRecord
 * @returns {Promise<{err:string|undefined}>}
 */
export async function registerFinish(email, username, registrationRecord) {
  try {
    const { err: errFinish } = await post("/api/auth/register/finish", {
      registrationRecord,
      username,
      email,
    });
    if (errFinish) return { err: errFinish };
    return {};
  } catch (err) {
    return { err: String(err) };
  }
}

/**
 *
 * @param {string} email
 * @returns {Promise<{err:string|undefined}>}
 */
export async function sendEmailCode(email) {
  try {
    const { err } = await post("/api/auth/email-code/send", { email });
    if (err) return { err };
    return {};
  } catch (err) {
    return { err: String(err) };
  }
}

/**
 *
 * @param {string} email
 * @returns {Promise<{err:string|undefined}>}
 */
export async function checkEmailCode(email, code) {
  try {
    const { err } = await post("/api/auth/email-code/check", { email, code });
    if (err) return { err };
    return {};
  } catch (err) {
    return { err: String(err) };
  }
}

export async function logout(sessionId, sessionKey) {
  if (!sessionId || !sessionKey) {
    await post("/api/auth/logout", undefined, true);
    await clearSession();
    return;
  }
  await request("/api/auth/logout", "POST", { sessionId }, false, {
    Authorization: `Bearer ${sessionKey}`,
  });
}

/**
 *
 * @param {string} userIdentifier
 * @returns {Promise<{err:string|undefined}>}
 */
export async function generateTotp(userIdentifier) {
  try {
    const { uri, qr, err } = await post("/api/auth/totp/generate", {
      userIdentifier,
    });
    if (err) return { err };
    return { uri, qr };
  } catch (err) {
    return { err: String(err) };
  }
}

/**
 *
 * @param {string} userIdentifier
 * @param {string} token
 * @returns {Promise<{err:string|undefined}>}
 */
export async function validateTotp(userIdentifier, token) {
  try {
    const { err } = await post("/api/auth/totp/validate", {
      userIdentifier,
      token,
    });
    if (err) return { err };
    return {};
  } catch (err) {
    return { err: String(err) };
  }
}
