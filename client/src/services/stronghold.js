import { appDataDir } from "@tauri-apps/api/path";
import { Stronghold } from "@tauri-apps/plugin-stronghold";

/**
 *
 * @param {string} key
 * @param {string} value
 */
export async function setRecord(key, value) {
  if ((await getRecord(key)) !== undefined) {
    await removeRecord(key);
  }
  await insertRecord(key, value);
}

/**
 *
 * @param {string} key
 * @param {string} value
 */
export async function insertRecord(key, value) {
  const store = await getStore();
  await store.insert(key, Array.from(new TextEncoder().encode(value)));
  const stronghold = await getStronghold();
  stronghold.save();
}

/**
 *
 * @param {string} key
 * @returns {Promise<string|undefined>}
 */
export async function getRecord(key) {
  const store = await getStore();
  const value = await store.get(key);
  return value ? new TextDecoder().decode(new Uint8Array(value)) : undefined;
}

/**
 *
 * @param {string} key
 */
export async function removeRecord(key) {
  const store = await getStore();
  await store.remove(key);
  const stronghold = await getStronghold();
  stronghold.save();
}

let stronghold = undefined;
/**
 *
 * @returns {Promise<Stronghold>}
 */
async function getStronghold() {
  if (!stronghold) {
    stronghold = await Stronghold.load(
      `${await appDataDir()}/vault.hold`,
      import.meta.env["VITE_STRONGHOLD_PASSWORD"],
    );
  }
  return stronghold;
}

let client = undefined;
/**
 *
 * @returns {Promise<Client>}
 */
async function getClient() {
  if (!client) {
    const stronghold = await getStronghold();
    try {
      client = await stronghold.loadClient("ut-42p-digitalsecurity.client");
    } catch {
      client = await stronghold.createClient("ut-42p-digitalsecurity.client");
    }
  }
  return client;
}

let store = undefined;
/**
 *
 * @returns {Promise<Store>}
 */
async function getStore() {
  if (!store) {
    const client = await getClient();
    store = client.getStore();
  }
  return store;
}
