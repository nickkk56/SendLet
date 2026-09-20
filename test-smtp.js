import "dotenv/config";
import nodemailer from "nodemailer";

const testEmail = async () => {
  try {
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Verify connection
    console.log("Testing SMTP connection to", process.env.SMTP_HOST + ":" + process.env.SMTP_PORT, "...");
    await transport.verify();
    console.log("✓ SMTP connection successful!");

    // Send test email
    console.log("Sending test email to", process.env.SMTP_USER, "...");
    const info = await transport.sendMail({
      from: `"Sendlet Test" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      subject: "Sendlet SMTP Test",
      html: "<h1>If you see this, SMTP is working!</h1><p>Your Sendlet mailing list is ready to send emails.</p>",
    });

    console.log("✓ Test email sent! Message ID:", info.messageId);
    console.log("Check your inbox (and spam folder) for the test email.");
  } catch (err) {
    console.error("✗ SMTP error:", err.message);
    if (err.response) {
      console.error("Server response:", err.response);
    }
  }
};

testEmail();
