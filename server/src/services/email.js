import { env } from "node:process";

import { Resend } from "resend";

const resend = new Resend(env["MAILTRAP_API_KEY"]);

/**
 *
 * @param {string} to
 * @param {string} subject
 * @param {string} html
 * @returns {Promise<{err:string|undefined}>}
 */
export async function send(to, subject, html) {
  try {
    await resend.emails.send({
      from: "ut-42p-digitalsecurity@resend.dev",
      to,
      subject,
      html,
    });
    return {};
  } catch (err) {
    return { err: String(err) };
  }
}
