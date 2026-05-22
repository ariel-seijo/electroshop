import { createTransport } from "nodemailer";

const transporter = createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetEmail(to: string, token: string, origin: string): Promise<void> {
  const resetLink = `${origin}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject: "Restablecer tu contraseña — ELECTROSHOP",
    html: `
      <div style="max-width: 560px; margin: 0 auto; padding: 32px 24px; background: #161616; border: 1px solid #262626; font-family: 'Inter', Arial, sans-serif; color: #d6d6d6;">
        <div style="text-align: center; margin-bottom: 28px;">
          <span style="font-size: 18px; letter-spacing: 4px; color: #24abf3; font-weight: 900;">ELECTROSHOP</span>
        </div>
        <h1 style="font-size: 22px; font-weight: 700; color: #e0e0e0; margin: 0 0 12px;">Restablecer contraseña</h1>
        <p style="font-size: 14px; line-height: 1.6; color: #aaaaaa; margin: 0 0 24px;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta. Hacé clic en el botón de abajo para continuar. Este enlace es válido por <strong>1 hora</strong>.
        </p>
        <div style="text-align: center; margin-bottom: 28px;">
          <a href="${resetLink}" style="display: inline-block; padding: 14px 36px; background: linear-gradient(135deg, #007fff, #00cfff); color: #111; text-decoration: none; font-weight: 900; font-size: 14px; letter-spacing: 1px; text-transform: uppercase;">
            Restablecer contraseña
          </a>
        </div>
        <p style="font-size: 12px; color: #707070; margin: 0 0 8px;">
          Si no solicitaste este cambio, ignorá este mensaje. Tu cuenta permanece segura.
        </p>
        <hr style="border: none; border-top: 1px solid #2a2a2a; margin: 24px 0;" />
        <p style="font-size: 11px; color: #606060; margin: 0;">
          Si el botón no funciona, copiá y pegá este enlace en tu navegador:<br />
          <a href="${resetLink}" style="color: #24abf3; word-break: break-all;">${resetLink}</a>
        </p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
}
