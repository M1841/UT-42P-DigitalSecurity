import { getRecord, removeRecord, setRecord } from "./stronghold";

/**
 *
 * @param {string} endpoint
 * @param {boolean|undefined} isAuthProtected
 * @returns {Promise<{[key:string]:any,err:string|undefined}>}
 */
export async function get(endpoint, isAuthProtected = false) {
  return await request(endpoint, "GET", undefined, isAuthProtected);
}

/**
 *
 * @param {string} endpoint
 * @param {{[key:string]:any}} body
 * @param {boolean | undefined} isAuthProtected
 * @returns {Promise<{[key:string]:any,err:string|undefined}>}
 */
export async function post(endpoint, body, isAuthProtected = false) {
  return await request(endpoint, "POST", body, isAuthProtected);
}

/**
 *
 * @param {string} endpoint
 * @param {string} method
 * @param {{[key:string]:any}|undefined} body
 * @param {boolean|undefined} isAuthProtected
 * @returns {Promise<{[key:string]:any,err:string|undefined}>}
 */
export async function request(
  endpoint = "/",
  method = "GET",
  body = undefined,
  isAuthProtected = false,
  headers = undefined,
) {
  if (!headers) headers = {};
  headers["Content-Type"] = "application/json";

  if (isAuthProtected) {
    headers["Authorization"] = `Bearer ${await getRecord("session.key")}`;
    const sessionId = await getRecord("session.id");
    if (method === "POST") {
      if (!body) body = {};
      body.sessionId = sessionId;
    }
    if (method === "GET") {
      endpoint = `${endpoint}?sessionId=${sessionId}`;
    }
  }
  const url = `${import.meta.env["VITE_SERVER_HOST"]}${endpoint}`;

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

/**
 *
 * @param {string} id
 * @param {string} key
 */
export async function setSession(id, key) {
  await setRecord("session.id", id);
  await setRecord("session.key", key);
  isLoggedInVar = true;
}

export async function getSessionId() {
  return await getRecord("session.id");
}

export async function clearSession() {
  await removeRecord("session.id");
  await removeRecord("session.key");
  isLoggedInVar = false;
}

let isLoggedInVar = false;
export function isLoggedIn() {
  return isLoggedInVar;
}

export async function syncIsLoggedIn() {
  isLoggedInVar =
    (await getRecord("session.id")) !== undefined &&
    (await getRecord("session.key")) !== undefined;
}
