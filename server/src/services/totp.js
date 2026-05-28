import { base32 } from "@otplib/plugin-base32-scure";
import { crypto } from "@otplib/plugin-crypto-node";
import { generateSecret, generateURI, verify } from "otplib";
import { toDataURL } from "qrcode";

/**
 *
 * @param {string} userIdentifier
 * @returns {Promise<{uri:string;qr:string;secret:string}>}
 */
export async function generate(userIdentifier) {
  const secret = generateSecret({ crypto, base32 });

  const uri = generateURI({
    issuer: "UT-42P-DigitalSecurity",
    label: userIdentifier,
    secret,
  });
  const qr = await toDataURL(uri);

  return { uri, qr, secret };
}

/**
 *
 * @param {string} secret
 * @param {number} lastTimeStep
 * @param {string} token
 * @returns {Promise<{isValid:boolean;timeStep:number}>}
 */
export async function validate(secret, lastTimeStep, token) {
  const { valid: isValid, timeStep } = await verify({
    secret,
    token,
    afterTimeStep: lastTimeStep ?? undefined,
  });
  return { isValid, timeStep };
}
