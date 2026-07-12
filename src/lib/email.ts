import nodemailer from "nodemailer";

// Retrieve config from env
const host = process.env.SMTP_HOST || "localhost";
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER || "";
const pass = process.env.SMTP_PASS || "";
const from = process.env.SMTP_FROM || "no-reply@transitops.com";

// Create transporter
const transporter = nodemailer.createTransport({
  host,
  port,
  secure: port === 465, // true for 465, false for other ports
  auth: {
    user,
    pass,
  },
});

interface Driver {
  name: string;
  email: string;
  licenseNo: string;
  licenseCategory: string;
  licenseExpiry: Date;
  contactNumber: string;
}

export async function sendDriverExpiryReminder(driver: Driver) {
  const expiryStr = new Date(driver.licenseExpiry).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const mailOptions = {
    from,
    to: driver.email,
    subject: `⚠️ URGENT: Driver Registration Expiration Warning - TransitOps`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 15px;">
          <h2 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">TransitOps Fleet System</h2>
        </div>
        
        <div style="padding: 20px 0;">
          <h3 style="color: #ea580c; margin-top: 0; font-size: 18px; font-weight: 700;">Registration Expiry Reminder</h3>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Hello <strong>${driver.name}</strong>,
          </p>
          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            This is an automated notification from the <strong>TransitOps</strong> platform. 
            Your driver registration/license is scheduled to expire in <strong>1 day</strong> on:
          </p>
          
          <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; color: #78350f;">
            <strong>Expiry Date:</strong> ${expiryStr}
          </div>

          <p style="color: #334155; font-size: 14px; line-height: 1.6;">
            Please review your registration details below:
          </p>

          <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 180px;">Driver Name:</td>
              <td style="padding: 8px 0; color: #0f172a;">${driver.name}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">License Number:</td>
              <td style="padding: 8px 0; color: #0f172a; font-family: monospace;">${driver.licenseNo}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">License Category:</td>
              <td style="padding: 8px 0; color: #0f172a;">${driver.licenseCategory}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f1f5f9;">
              <td style="padding: 8px 0; font-weight: bold; color: #475569;">Contact Number:</td>
              <td style="padding: 8px 0; color: #0f172a;">${driver.contactNumber}</td>
            </tr>
          </table>

          <p style="color: #dc2626; font-size: 13px; font-weight: 700; margin-top: 25px;">
            ⚠️ IMPORTANT: Expired driver registrations will block trip dispatches and fleet system access. Please update your details immediately to prevent operational disruptions.
          </p>
        </div>

        <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 11px; color: #94a3b8; line-height: 1.4;">
          This is an automated system email from TransitOps. Please do not reply directly to this message. <br />
          &copy; ${new Date().getFullYear()} TransitOps Transport Operations. All rights reserved.
        </div>
      </div>
    `,
  };

  return await transporter.sendMail(mailOptions);
}
