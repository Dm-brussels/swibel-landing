export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, legal_form, message } = req.body;

  // Validation
  if (!name || !email || !phone) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #0D0845; padding: 20px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: #E1E6FC; margin: 0; font-size: 22px;">Nouveau lead Swibel</h1>
      </div>
      <div style="background: #ffffff; padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 12px 12px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0D0845; width: 160px;">Nom complet</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #334155;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0D0845;">Email</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #334155;"><a href="mailto:${email}" style="color: #0071E3;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0D0845;">Telephone</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #334155;"><a href="tel:${phone}" style="color: #0071E3;">${phone}</a></td>
          </tr>
          <tr>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; font-weight: bold; color: #0D0845;">Forme juridique</td>
            <td style="padding: 10px 0; border-bottom: 1px solid #f1f5f9; color: #334155;">${legal_form || 'Non renseigne'}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: bold; color: #0D0845; vertical-align: top;">Message</td>
            <td style="padding: 10px 0; color: #334155;">${message || 'Aucun message'}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 12px; background: #f0f9ff; border-radius: 8px; text-align: center;">
          <span style="color: #0071E3; font-weight: bold; font-size: 13px;">Repondre sous 24h</span>
        </div>
      </div>
    </div>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Swibel Onboarding <onboarding@swibel.be>',
        to: ['mimounmehdi94@gmail.com'],
        subject: `Nouveau lead : ${name} — ${legal_form || 'Forme non precisee'}`,
        html: htmlContent,
        reply_to: email,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Resend error:', data);
      return res.status(500).json({ error: 'Erreur envoi email.', details: data });
    }

    return res.status(200).json({ success: true, id: data.id });
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Erreur serveur.' });
  }
}
