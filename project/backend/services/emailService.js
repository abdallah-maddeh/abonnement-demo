const nodemailer = require('nodemailer');

const getTransporter = () => {
    const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
        return null;
    }

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: String(SMTP_PORT) === '465',
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
};

const escapeHtml = (value) => {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

const sendPasswordResetEmail = async ({ to, resetLink }) => {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@srtb.local';
    const safeTo = escapeHtml(to);
    const safeResetLink = escapeHtml(resetLink);

    if (!transporter) {
        console.log('[DEV] SMTP non configure. Lien de reinitialisation:', resetLink);
        return { skipped: true };
    }

    return transporter.sendMail({
        from,
        to,
        subject: 'Reinitialisation de votre mot de passe SRTB',
        text: [
            'Bonjour,',
            '',
            'Vous avez fait une demande de reinitialisation de mot de passe.',
            'Cliquez sur le bouton suivant pour le changer. Merci de choisir SRTB.',
            '',
            `Changer mon mot de passe : ${resetLink}`,
            '',
            'Ce lien expire dans 30 minutes.',
            'Si vous n etes pas a l origine de cette demande, ignorez cet email.',
        ].join('\n'),
        html: `
            <!doctype html>
            <html>
                <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;background:#f3f4f6;padding:24px 0;">
                        <tr>
                            <td align="center" style="padding:24px 12px;">
                                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border-collapse:collapse;">
                                    <tr>
                                        <td style="border-radius:2px;overflow:hidden;background:#071413;">
                                            <div style="background:linear-gradient(135deg,rgba(3,10,13,0.98),rgba(8,31,31,0.94));padding:28px 36px 34px;">
                                                <h1 style="margin:0 0 20px;color:#ffffff;font-size:34px;line-height:1.1;font-weight:800;letter-spacing:0;">
                                                    Mot de passe oubli&eacute;
                                                </h1>
                                                <p style="margin:0 0 10px;color:#ffffff;font-size:17px;line-height:1.6;font-weight:700;">
                                                    Vous avez fait une demande de r&eacute;initialisation de mot de passe.
                                                </p>
                                                <p style="margin:0;color:#ffffff;font-size:17px;line-height:1.6;font-weight:700;">
                                                    Cliquez sur le bouton suivant pour le changer. Merci de choisir SRTB.
                                                </p>
                                                <div style="text-align:center;margin-top:30px;">
                                                    <a href="${safeResetLink}" style="display:inline-block;background:#F97316;color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;border-radius:8px;padding:13px 24px;">
                                                        Changer mon mot de passe
                                                    </a>
                                                </div>
                                                <p style="margin:22px 0 0;color:#b9c2c7;font-size:12px;line-height:1.5;text-align:center;word-break:break-word;">
                                                    Demande envoy&eacute;e &agrave; ${safeTo}
                                                </p>
                                                <p style="margin:8px 0 0;color:#b9c2c7;font-size:12px;line-height:1.5;text-align:center;">
                                                    Ce lien expire dans 30 minutes. Si vous n'&ecirc;tes pas &agrave; l'origine de cette demande, ignorez cet email.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>
        `,
    });
};

const sendExpirationNotificationEmail = async ({ to, prenom, typeAbonnement, ligne, dateFin }) => {
    const transporter = getTransporter();
    const from = process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@srtb.local';
    const safePrenom = escapeHtml(prenom || 'utilisateur');
    const safeType = escapeHtml(typeAbonnement || 'abonnement');
    const safeLigne = escapeHtml(ligne || '-');
    const safeDateFin = escapeHtml(String(dateFin || '').split('T')[0]);

    if (!to || !String(to).includes('@')) {
        return { skipped: true };
    }

    if (!transporter) {
        console.log('[DEV] SMTP non configure. Notification expiration pour:', to);
        return { skipped: true };
    }

    return transporter.sendMail({
        from,
        to,
        subject: 'Notification d expiration de votre abonnement',
        text: [
            `Bonjour ${prenom || 'utilisateur'},`,
            '',
            `Votre abonnement ${typeAbonnement || ''} sur la ligne ${ligne || '-'} expire le ${String(dateFin || '').split('T')[0]}.`,
            'Veuillez le renouveler afin de continuer a utiliser le service.',
        ].join('\n'),
        html: `
            <!doctype html>
            <html>
                <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;">
                    <div style="max-width:560px;margin:0 auto;padding:28px 16px;">
                        <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:10px;padding:24px;">
                            <h1 style="margin:0 0 16px;color:#1f2937;font-size:22px;">Notification d'expiration</h1>
                            <p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6;">Bonjour ${safePrenom},</p>
                            <p style="margin:0 0 12px;color:#374151;font-size:15px;line-height:1.6;">
                                Votre abonnement <strong>${safeType}</strong> sur la ligne <strong>${safeLigne}</strong> expire le <strong>${safeDateFin}</strong>.
                            </p>
                            <p style="margin:0;color:#374151;font-size:15px;line-height:1.6;">Veuillez le renouveler afin de continuer &agrave; utiliser le service.</p>
                        </div>
                    </div>
                </body>
            </html>
        `,
    });
};

module.exports = {
    sendPasswordResetEmail,
    sendExpirationNotificationEmail,
};
