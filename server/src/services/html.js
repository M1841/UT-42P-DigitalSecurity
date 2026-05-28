/**
 *
 * @param {{head:string|undefined;body:string|undefined}} args
 * @returns {string}
 */
export function page({ head, body }) {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          html {
            background-color: #fafafa;
            color: #2e3436;
            font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Cantarell, sans-serif;
          }
          @media (prefers-color-scheme: dark) {
            html {
              background-color: #242424;
              color: #ffffff;
            }
          }
        </style>
        <title>UT-42P-DigitalSecurity</title>
        ${head ?? ""}
      </head>
      <body>
        ${body ?? ""}
      </body>
    </html>
  `;
}
