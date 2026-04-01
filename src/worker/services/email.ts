import type { Bindings } from "../index";

// Email templates use Children's Health brand colors
// Primary: #3400a5, Secondary: #b80c5a, Surface: #fcf8ff

const FROM_ADDRESS = "Children's Health <onboarding@resend.dev>";

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Children's Health</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #fcf8ff; color: #17085c; line-height: 1.6; }
    .wrapper { max-width: 600px; margin: 32px auto; background: #ffffff; border-radius: 16px; overflow: hidden; }
    .logo-bar { background-color: #3400a5; padding: 24px 32px; }
    .logo-text { color: #ffffff; font-size: 20px; font-weight: 700; letter-spacing: -0.3px; }
    .logo-sub { color: rgba(255,255,255,0.7); font-size: 12px; margin-top: 2px; }
    .body-content { padding: 32px; }
    .status-header { border-radius: 12px; padding: 20px 24px; margin-bottom: 28px; }
    .status-header h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
    .status-header p { font-size: 14px; opacity: 0.85; }
    .section-title { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; color: #534878; margin-bottom: 12px; margin-top: 28px; }
    .detail-grid { background: #f6f1ff; border-radius: 12px; padding: 16px 20px; }
    .detail-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 14px; }
    .detail-row:not(:last-child) { border-bottom: 1px solid #ede8f8; }
    .detail-label { color: #534878; }
    .detail-value { color: #17085c; font-weight: 500; text-align: right; max-width: 60%; }
    .next-steps { background: #f6f1ff; border-radius: 12px; padding: 16px 20px; }
    .next-steps ul { list-style: none; padding: 0; }
    .next-steps li { font-size: 14px; padding: 5px 0 5px 20px; position: relative; color: #17085c; }
    .next-steps li::before { content: '→'; position: absolute; left: 0; color: #3400a5; font-weight: 600; }
    .materials-list { background: #f6f1ff; border-radius: 12px; padding: 16px 20px; }
    .materials-list ul { list-style: none; padding: 0; }
    .materials-list li { font-size: 14px; padding: 5px 0 5px 20px; position: relative; color: #17085c; }
    .materials-list li::before { content: '↓'; position: absolute; left: 0; color: #16a34a; font-weight: 600; }
    .footer { background: #f0eafc; padding: 24px 32px; margin-top: 8px; }
    .footer p { font-size: 12px; color: #534878; line-height: 1.8; }
    .footer a { color: #3400a5; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="logo-bar">
      <div class="logo-text">Children's Health</div>
      <div class="logo-sub">Community Outreach &amp; Education</div>
    </div>
    <div class="body-content">
      ${content}
    </div>
    <div class="footer">
      <p>
        Questions? Contact the Community Education Team at
        <a href="mailto:community@childrenshealth.org">community@childrenshealth.org</a>
        or call <strong>(801) 662-1000</strong>.<br />
        Intermountain Primary Children's Hospital · 100 N Mario Capecchi Dr, Salt Lake City, UT 84113
      </p>
    </div>
  </div>
</body>
</html>`;
}

function formatName(submission: Record<string, unknown>): string {
  const first = (submission.first_name as string) ?? "";
  const last = (submission.last_name as string) ?? "";
  return `${first} ${last}`.trim() || "Requester";
}

function requestSummaryRows(submission: Record<string, unknown>): string {
  const rows: Array<[string, string]> = [
    ["Request ID", String(submission.id ?? "—")],
    ["Organization", String(submission.organization ?? "—")],
    ["Request Type", String(submission.request_type ?? "—")],
    ["Submitted", submission.created_at ? new Date(submission.created_at as string).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—"],
  ];

  return rows
    .map(
      ([label, value]) => `
        <div class="detail-row">
          <span class="detail-label">${label}</span>
          <span class="detail-value">${value}</span>
        </div>`
    )
    .join("");
}

async function sendEmail(
  env: Bindings,
  to: string,
  subject: string,
  html: string
): Promise<void> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend API error ${response.status}: ${text}`);
  }
}

export async function sendConfirmationEmail(
  env: Bindings,
  submission: Record<string, unknown>
): Promise<void> {
  const name = formatName(submission);
  const to = String(submission.email ?? "");

  if (!to) return;

  const html = baseTemplate(`
    <div class="status-header" style="background-color: #f0eafc; color: #17085c;">
      <h1>Request Received</h1>
      <p>We've received your Community Education request and will review it shortly.</p>
    </div>

    <p style="font-size: 15px; margin-bottom: 8px;">Hi ${name},</p>
    <p style="font-size: 14px; color: #534878; margin-bottom: 4px;">
      Thank you for submitting your request to the Children's Health Community Education program.
      Our team will review your submission and respond within <strong style="color: #3400a5;">3–5 business days</strong>.
    </p>

    <div class="section-title">Request Summary</div>
    <div class="detail-grid">
      ${requestSummaryRows(submission)}
    </div>

    <div class="section-title">What Happens Next</div>
    <div class="next-steps">
      <ul>
        <li>Our team reviews your request against availability and resources</li>
        <li>You'll receive an approval or denial email within 3–5 business days</li>
        <li>Approved requests will include material preparation and shipping details</li>
        <li>You can reply to this email with any updates or questions</li>
      </ul>
    </div>
  `);

  await sendEmail(env, to, "We received your Community Education request", html);
}

export async function sendApprovalEmail(
  env: Bindings,
  submission: Record<string, unknown>,
  digitalMaterials: string[]
): Promise<void> {
  const name = formatName(submission);
  const to = String(submission.email ?? "");

  if (!to) return;

  const materialsSection =
    digitalMaterials.length > 0
      ? `
    <div class="section-title">Digital Materials</div>
    <div class="materials-list">
      <p style="font-size: 13px; color: #534878; margin-bottom: 10px;">The following resources are available for immediate download:</p>
      <ul>
        ${digitalMaterials.map((m) => `<li>${m}</li>`).join("")}
      </ul>
    </div>`
      : "";

  const html = baseTemplate(`
    <div class="status-header" style="background-color: #dcfce7; color: #14532d;">
      <h1 style="color: #15803d;">Request Approved!</h1>
      <p>Your Community Education request has been approved and is being prepared.</p>
    </div>

    <p style="font-size: 15px; margin-bottom: 8px;">Hi ${name},</p>
    <p style="font-size: 14px; color: #534878; margin-bottom: 4px;">
      Great news — your request has been <strong style="color: #16a34a;">approved</strong>!
      Our Community Education team is now preparing your materials and will coordinate logistics with you.
    </p>

    <div class="section-title">Request Summary</div>
    <div class="detail-grid">
      ${requestSummaryRows(submission)}
    </div>

    ${materialsSection}

    <div class="section-title">Next Steps</div>
    <div class="next-steps">
      <ul>
        <li>Materials will be shipped or made available per your request details</li>
        <li>A coordinator may follow up with additional logistics questions</li>
        <li>For event requests, expect a confirmation call 48 hours before the event</li>
        <li>Reply to this email or call us with any changes or questions</li>
      </ul>
    </div>
  `);

  await sendEmail(env, to, "Your Community Education request has been approved", html);
}

export async function sendDenialEmail(
  env: Bindings,
  submission: Record<string, unknown>,
  reason: string
): Promise<void> {
  const name = formatName(submission);
  const to = String(submission.email ?? "");

  if (!to) return;

  const html = baseTemplate(`
    <div class="status-header" style="background-color: #fee2e2; color: #7f1d1d;">
      <h1 style="color: #dc2626;">Request Not Approved</h1>
      <p>We were unable to fulfill your Community Education request at this time.</p>
    </div>

    <p style="font-size: 15px; margin-bottom: 8px;">Hi ${name},</p>
    <p style="font-size: 14px; color: #534878; margin-bottom: 4px;">
      Thank you for reaching out to the Children's Health Community Education program.
      After careful review, we are unable to approve your request at this time.
    </p>

    <div class="section-title">Reason</div>
    <div class="detail-grid">
      <p style="font-size: 14px; color: #17085c; padding: 4px 0;">${reason}</p>
    </div>

    <div class="section-title">Request Summary</div>
    <div class="detail-grid">
      ${requestSummaryRows(submission)}
    </div>

    <div class="section-title">What You Can Do</div>
    <div class="next-steps">
      <ul>
        <li>Contact our team directly to discuss alternatives or a revised request</li>
        <li>Consider resubmitting with adjusted dates, scope, or materials</li>
        <li>Reach out to community@childrenshealth.org with any questions</li>
      </ul>
    </div>

    <p style="font-size: 13px; color: #534878; margin-top: 24px;">
      We appreciate your interest in partnering with Children's Health and hope to work together in the future.
    </p>
  `);

  await sendEmail(env, to, "Update on your Community Education request", html);
}
