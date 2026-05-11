import nodemailer from "nodemailer";
import { env } from "./env";

const SITE_URL = "https://homyhomegrow.de";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    console.error("[SMTP] Missing config:", { host: !!env.smtp.host, user: !!env.smtp.user, pass: !!env.smtp.pass });
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: {
      user: env.smtp.user,
      pass: env.smtp.pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  // Verify connection on first use
  transporter.verify((err) => {
    if (err) console.error("[SMTP] Connection verify failed:", err.message);
    else console.log("[SMTP] Connected to", env.smtp.host, "on port", env.smtp.port);
  });

  return transporter;
}

function createEmailTemplate(opts: {
  title: string;
  body: string;
  button?: { text: string; url: string };
  footer?: string;
}): string {
  const { title, body, button, footer } = opts;
  return `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${title}</title>
<style>
  body { margin:0; padding:0; background:#0A0A0A; font-family:system-ui,-apple-system,sans-serif; }
  .container { max-width:560px; margin:0 auto; padding:32px 20px; }
  .card { background:#141414; border:1px solid #2A2A2A; border-radius:16px; padding:40px 32px; }
  .logo { color:#39FF14; font-size:24px; font-weight:800; letter-spacing:-0.02em; text-align:center; margin-bottom:28px; }
  .logo span { color:#FFFFFF; }
  h1 { color:#FFFFFF; font-size:22px; font-weight:700; margin:0 0 16px; line-height:1.3; }
  p { color:#A0A0A0; font-size:15px; line-height:1.7; margin:0 0 20px; }
  .btn { display:inline-block; background:#39FF14; color:#0A0A0A; text-decoration:none; font-weight:700; font-size:15px; padding:14px 32px; border-radius:10px; }
  .btn-wrap { text-align:center; margin:28px 0; }
  .link { color:#A0A0A0; font-size:13px; word-break:break-all; }
  .divider { border-top:1px solid #2A2A2A; margin:28px 0; }
  .footer { color:#555; font-size:12px; text-align:center; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="logo">HOMYHOME<span>GROW</span></div>
    <h1>${title}</h1>
    <p>${body}</p>
    ${button ? `<div class="btn-wrap"><a href="${button.url}" class="btn">${button.text}</a></div><p class="link">${button.url}</p>` : ""}
    <div class="divider"></div>
    <div class="footer">${footer || `HomyHomegrow | Alle Informationen dienen Bildungszwecken.<br><a href="${SITE_URL}" style="color:#39FF14;">${SITE_URL}</a>`}</div>
  </div>
</div>
</body>
</html>`;
}

export async function sendConfirmationEmail(opts: {
  to: string;
  token: string;
}): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.error("[SMTP] Cannot send confirmation - no transporter");
    return false;
  }

  try {
    const confirmUrl = `${SITE_URL}/newsletter/confirm?token=${opts.token}`;
    const html = createEmailTemplate({
      title: "Bestätige deine Newsletter-Anmeldung",
      body: "Danke fürs Interesse! Klicke auf den Button, um deine Anmeldung abzuschließen. Wenn du dich nicht angemeldet hast, ignoriere diese Email einfach.",
      button: { text: "Anmeldung bestätigen", url: confirmUrl },
    });

    await t.sendMail({
      from: `"HomyHomegrow" <${env.smtp.from}>`,
      to: opts.to,
      subject: "Newsletter-Anmeldung bestätigen",
      html,
      text: `Danke fürs Interesse! Bestätige hier: ${confirmUrl}`,
    });
    return true;
  } catch (err) {
    console.error("[Email] Confirmation failed:", err);
    return false;
  }
}

export async function sendWelcomeEmail(opts: {
  to: string;
}): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    console.error("[SMTP] Cannot send welcome - no transporter");
    return false;
  }

  try {
    const html = createEmailTemplate({
      title: "Willkommen bei HomyHomegrow!",
      body: "Schön, dass du dabei bist. Du bekommst jetzt Updates zu neuen Guides, Grow-Tipps und Community-News direkt in dein Postfach.",
      footer:
        'HomyHomegrow | <a href="https://youtube.com/@HomyHomegrow" style="color:#39FF14;">YouTube</a> | <a href="' +
        SITE_URL +
        '" style="color:#39FF14;">Website</a><br>Möchtest du dich abmelden? Antworte einfach auf diese Mail.',
    });

    await t.sendMail({
      from: `"HomyHomegrow" <${env.smtp.from}>`,
      to: opts.to,
      subject: "Willkommen bei HomyHomegrow!",
      html,
      text: "Willkommen bei HomyHomegrow! Deine Newsletter-Anmeldung ist bestätigt.",
    });
    return true;
  } catch (err) {
    console.error("[Email] Welcome failed:", err);
    return false;
  }
}

// Newsletter send function - supports custom HTML with images
export async function sendNewsletterEmail(opts: {
  to: string;
  subject: string;
  html: string;
  previewText?: string;
  campaignId?: number;
  unsubscribeUrl?: string;
}): Promise<boolean> {
  const t = getTransporter();
  if (!t) {
    throw new Error("SMTP not configured - check .env");
  }

  try {
    // Wrap user HTML in our branded template
    const bodyHtml = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark">
<meta name="supported-color-schemes" content="dark">
<title>${opts.subject}</title>
<style>
  body { margin:0; padding:0; background:#0A0A0A; font-family:system-ui,-apple-system,sans-serif; }
  .container { max-width:600px; margin:0 auto; padding:32px 20px; }
  .card { background:#141414; border:1px solid #2A2A2A; border-radius:16px; overflow:hidden; }
  .logo { color:#39FF14; font-size:24px; font-weight:800; letter-spacing:-0.02em; text-align:center; padding:28px 20px 16px; }
  .logo span { color:#FFFFFF; }
  .content { padding:24px 32px 40px; }
  .content img { max-width:100%; height:auto; border-radius:8px; }
  .content h1 { color:#FFFFFF; font-size:24px; font-weight:700; margin:0 0 16px; line-height:1.3; }
  .content h2 { color:#39FF14; font-size:18px; font-weight:600; margin:24px 0 12px; }
  .content h3 { color:#FFFFFF; font-size:16px; font-weight:600; margin:20px 0 10px; }
  .content p { color:#A0A0A0; font-size:15px; line-height:1.7; margin:0 0 16px; }
  .content a { color:#39FF14; }
  .content ul, .content ol { color:#A0A0A0; font-size:15px; line-height:1.7; margin:0 0 16px; padding-left:24px; }
  .content li { margin-bottom:4px; }
  .content strong { color:#FFFFFF; }
  .content blockquote { border-left:3px solid #39FF14; padding-left:16px; margin:16px 0; color:#A0A0A0; font-style:italic; }
  .divider { border-top:1px solid #2A2A2A; margin:0 32px; }
  .footer { padding:20px 32px; color:#555; font-size:12px; text-align:center; }
</style>
</head>
<body>
<div class="container">
  <div class="card">
    <div class="logo">HOMYHOME<span>GROW</span></div>
    <div class="content">
      ${opts.previewText ? `<p style="display:none;font-size:1px;color:#141414;">${opts.previewText}</p>` : ""}
      ${opts.html}
    </div>
    <div class="divider"></div>
    <div class="footer">
      HomyHomegrow | Alle Informationen dienen Bildungszwecken.<br>
      <a href="https://www.youtube.com/@HomyHomegrow" style="color:#39FF14;">YouTube</a> |
      <a href="${SITE_URL}" style="color:#39FF14;">Website</a>
    </div>
    ${opts.unsubscribeUrl ? `<div style="padding:12px 32px;text-align:center;"><a href="${opts.unsubscribeUrl}" style="color:#555;font-size:11px;">Newsletter abbestellen</a></div>` : ""}
  </div>
</div>
</body>
</html>`;

    await t.sendMail({
      from: `"HomyHomegrow" <${env.smtp.from}>`,
      to: opts.to,
      subject: opts.subject,
      html: bodyHtml,
      text: "Dieser Newsletter enthält HTML-Inhalte. Bitte öffne die Email in einem HTML-fähigen Client.",
    });
    return true;
  } catch (err) {
    console.error("[Email] Newsletter send failed:", err);
    return false;
  }
}
