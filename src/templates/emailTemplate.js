const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const renderActionEmail = ({
  name,
  preheader,
  eyebrow,
  heading,
  intro,
  cta,
  link,
  note,
}) => {
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(link);

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Chronicle</title>
    <!--[if mso]>
    <style>
      body, table, td { font-family: Arial, Helvetica, sans-serif !important; }
    </style>
    <![endif]-->
  </head>
  <body style="margin:0;padding:0;background-color:#F8F7F3;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${escapeHtml(
      preheader,
    )}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;background-color:#F8F7F3;">
      <tr>
        <td align="center" style="padding:40px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;background-color:#FCFBF9;border:1px solid #E8E6DF;border-radius:16px;overflow:hidden;box-shadow:0 12px 40px -15px rgba(37,38,34,0.08);">
            <tr>
              <td style="height:4px;background-color:#82947C;font-size:0;line-height:0;">&nbsp;</td>
            </tr>
            <tr>
              <td style="padding:34px 40px 0 40px;">
                <span style="font-family:Georgia,'Times New Roman',serif;font-size:26px;line-height:1.2;letter-spacing:-0.02em;color:#252622;">Chronicle<span style="color:#82947C;">.</span></span>
                <span style="display:block;margin-top:6px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:9px;line-height:1.4;letter-spacing:0.22em;text-transform:uppercase;color:#8A8C83;">A quiet sanctuary for your thoughts</span>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 40px 0 40px;">
                <p style="margin:0 0 10px 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:10px;line-height:1.4;letter-spacing:0.2em;text-transform:uppercase;color:#52664F;font-weight:700;">${escapeHtml(
                  eyebrow,
                )}</p>
                <h1 style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.25;font-weight:400;letter-spacing:-0.02em;color:#252622;">${escapeHtml(
                  heading,
                )}</h1>
                <p style="margin:18px 0 0 0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.7;color:#66685F;">Hi ${safeName}, ${escapeHtml(
                  intro,
                )}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:30px 40px 0 40px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td align="center" bgcolor="#52664F" style="border-radius:8px;background-color:#52664F;box-shadow:0 10px 24px -12px rgba(82,102,79,0.7);">
                      <a href="${safeLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:14px 30px;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:14px;line-height:1.2;font-weight:700;letter-spacing:0.02em;color:#FCFBF9;text-decoration:none;border-radius:8px;">${escapeHtml(
                        cta,
                      )}&nbsp;&rarr;</a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 40px 0 40px;">
                <p style="margin:0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.6;color:#8A8C83;">${escapeHtml(
                  note,
                )}</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 40px 0 40px;">
                <div style="height:1px;background-color:#E8E6DF;font-size:0;line-height:0;">&nbsp;</div>
              </td>
            </tr>
            <tr>
              <td style="padding:22px 40px 36px 40px;">
                <p style="margin:0;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:12px;line-height:1.7;color:#777970;">If you didn't request this, you can safely ignore this email. Your account will remain unchanged.</p>
                <p style="margin:14px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:14px;line-height:1.6;color:#52664F;">Some things are worth writing down.</p>
              </td>
            </tr>
          </table>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:560px;">
            <tr>
              <td style="padding:22px 12px 0 12px;text-align:center;font-family:'DM Sans',Helvetica,Arial,sans-serif;font-size:11px;line-height:1.6;color:#8A8C83;">
                You are receiving this email because someone used this address at Chronicle.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

module.exports = { renderActionEmail };
