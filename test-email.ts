import "dotenv/config";
import nodemailer from "nodemailer";

async function testSmtp() {
  console.log("Testing SMTP connection...");
  console.log("Host:", process.env.SMTP_HOST);
  console.log("Port:", process.env.SMTP_PORT);
  console.log("User:", process.env.SMTP_USER);

  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      debug: true, // Show SMTP debug info
    });

    // Test connection
    console.log("\nVerifying connection...");
    await transport.verify();
    console.log("✓ Connection successful!");

    // Send test email
    console.log("\nSending test email...");
    const info = await transport.sendMail({
      from: `"Sendlet Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "Sendlet Test Email",
      html: "<h1>If you see this, SMTP is working!</h1>",
    });

    console.log("✓ Email sent!");
    console.log("Message ID:", info.messageId);
    console.log("Check your inbox (and spam folder) for the email.");
  } catch (err: any) {
    console.error("\n✗ Error:", err.message);
    if (err.response) {
      console.error("Server response:", err.response);
    }
    console.error("\nFull error:", err);
  }
}

testSmtp();
