type EmailTemplateProps = {
  title: string;
  recipientName?: string;
  message: string;
  buttonText?: string;
  buttonUrl?: string;
  details?: Array<{
    label: string;
    value: string;
  }>;
  notice?: string;
};

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://reim-eventos.vercel.app';

const BRAND_NAME = 'REIM EVENTOS';
const SUPPORT_EMAIL = 'contato@reimeventos.com.br';

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function renderDetails(
  details?: Array<{
    label: string;
    value: string;
  }>
) {
  if (!details?.length) {
    return '';
  }

  const rows = details
    .map(
      (item) => `
        <tr>
          <td
            style="
              padding: 11px 12px;
              border-bottom: 1px solid #eee6d7;
              color: #6b7280;
              font-size: 13px;
              font-weight: 700;
              vertical-align: top;
              width: 42%;
            "
          >
            ${escapeHtml(item.label)}
          </td>

          <td
            style="
              padding: 11px 12px;
              border-bottom: 1px solid #eee6d7;
              color: #171717;
              font-size: 13px;
              font-weight: 800;
              text-align: right;
              vertical-align: top;
            "
          >
            ${escapeHtml(item.value)}
          </td>
        </tr>
      `
    )
    .join('');

  return `
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        margin-top: 24px;
        border: 1px solid #eee6d7;
        border-radius: 18px;
        border-collapse: separate;
        border-spacing: 0;
        overflow: hidden;
        background-color: #fffdf9;
      "
    >
      ${rows}
    </table>
  `;
}

function renderButton(
  buttonText?: string,
  buttonUrl?: string
) {
  if (!buttonText || !buttonUrl) {
    return '';
  }

  return `
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="margin-top: 28px;"
    >
      <tr>
        <td align="center">
          <a
            href="${escapeHtml(buttonUrl)}"
            target="_blank"
            rel="noopener noreferrer"
            style="
              display: inline-block;
              padding: 15px 26px;
              border-radius: 18px;
              background-color: #e3a925;
              color: #ffffff;
              font-family: Arial, Helvetica, sans-serif;
              font-size: 14px;
              font-weight: 800;
              line-height: 1;
              text-decoration: none;
              box-shadow: 0 8px 20px rgba(227, 169, 37, 0.25);
            "
          >
            ${escapeHtml(buttonText)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function createEmailTemplate({
  title,
  recipientName,
  message,
  buttonText,
  buttonUrl,
  details,
  notice,
}: EmailTemplateProps) {
  const safeTitle = escapeHtml(title);
  const safeRecipientName = recipientName
    ? escapeHtml(recipientName)
    : '';
  const safeMessage = escapeHtml(message).replace(
    /\n/g,
    '<br />'
  );

  const greeting = safeRecipientName
    ? `Olá, ${safeRecipientName}!`
    : 'Olá!';

  const detailsHtml = renderDetails(details);
  const buttonHtml = renderButton(
    buttonText,
    buttonUrl
  );

  const noticeHtml = notice
    ? `
      <div
        style="
          margin-top: 24px;
          padding: 14px 16px;
          border: 1px solid #f1dfae;
          border-radius: 16px;
          background-color: #fff8e7;
          color: #7a5b13;
          font-size: 12px;
          font-weight: 700;
          line-height: 1.6;
        "
      >
        ${escapeHtml(notice)}
      </div>
    `
    : '';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />

    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0"
    />

    <meta
      name="color-scheme"
      content="light only"
    />

    <meta
      name="supported-color-schemes"
      content="light only"
    />

    <title>${safeTitle}</title>
  </head>

  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #111111;
      font-family: Arial, Helvetica, sans-serif;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="
        width: 100%;
        background-color: #111111;
        padding: 24px 12px;
      "
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            style="
              width: 100%;
              max-width: 600px;
              border-radius: 30px;
              overflow: hidden;
              background-color: #fbf7f1;
              box-shadow: 0 18px 50px rgba(0, 0, 0, 0.35);
            "
          >
            <tr>
              <td
                style="
                  padding: 34px 26px 30px;
                  background-color: #090909;
                  text-align: center;
                "
              >
                <div
                  style="
                    display: inline-block;
                    margin-bottom: 14px;
                    padding: 8px 14px;
                    border: 1px solid rgba(227, 169, 37, 0.35);
                    border-radius: 999px;
                    background-color: rgba(227, 169, 37, 0.1);
                    color: #e3a925;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 2px;
                    text-transform: uppercase;
                  "
                >
                  Plataforma de Eventos
                </div>

                <div
                  style="
                    margin: 0;
                    color: #e3a925;
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size: 14px;
                    font-weight: 700;
                    letter-spacing: 5px;
                  "
                >
                  REIM
                </div>

                <div
                  style="
                    margin-top: 3px;
                    color: #ffffff;
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size: 30px;
                    font-weight: 700;
                    letter-spacing: 1px;
                  "
                >
                  EVENTOS
                </div>

                <div
                  style="
                    width: 56px;
                    height: 3px;
                    margin: 18px auto 0;
                    border-radius: 999px;
                    background-color: #e3a925;
                  "
                ></div>
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 32px 26px 28px;
                  background-color: #fbf7f1;
                "
              >
                <p
                  style="
                    margin: 0;
                    color: #d99200;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 1px;
                    text-transform: uppercase;
                  "
                >
                  ${greeting}
                </p>

                <h1
                  style="
                    margin: 12px 0 0;
                    color: #171717;
                    font-family: Georgia, 'Times New Roman', serif;
                    font-size: 28px;
                    line-height: 1.2;
                  "
                >
                  ${safeTitle}
                </h1>

                <p
                  style="
                    margin: 18px 0 0;
                    color: #5f6368;
                    font-size: 14px;
                    line-height: 1.75;
                  "
                >
                  ${safeMessage}
                </p>

                ${detailsHtml}

                ${buttonHtml}

                ${noticeHtml}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding: 24px 26px;
                  background-color: #171717;
                  text-align: center;
                "
              >
                <p
                  style="
                    margin: 0;
                    color: #ffffff;
                    font-size: 12px;
                    font-weight: 800;
                  "
                >
                  ${BRAND_NAME}
                </p>

                <p
                  style="
                    margin: 8px 0 0;
                    color: rgba(255, 255, 255, 0.6);
                    font-size: 11px;
                    line-height: 1.6;
                  "
                >
                  Todos os fornecedores do seu evento em um só lugar.
                </p>

                <p
                  style="
                    margin: 14px 0 0;
                    color: rgba(255, 255, 255, 0.65);
                    font-size: 11px;
                    line-height: 1.7;
                  "
                >
                  Este é um e-mail automático do REIM EVENTOS.
                  Para atendimento, responda para
                  <a
                    href="mailto:${SUPPORT_EMAIL}"
                    style="
                      color: #e3a925;
                      font-weight: 700;
                      text-decoration: none;
                    "
                  >
                    ${SUPPORT_EMAIL}
                  </a>.
                </p>

                <div
                  style="
                    margin-top: 18px;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 10px;
                    line-height: 1.8;
                  "
                >
                  <a
                    href="${SITE_URL}/termos"
                    style="
                      color: rgba(255, 255, 255, 0.65);
                      text-decoration: underline;
                    "
                  >
                    Termos de Uso
                  </a>

                  &nbsp;•&nbsp;

                  <a
                    href="${SITE_URL}/privacidade"
                    style="
                      color: rgba(255, 255, 255, 0.65);
                      text-decoration: underline;
                    "
                  >
                    Política de Privacidade
                  </a>
                </div>

                <p
                  style="
                    margin: 16px 0 0;
                    color: rgba(255, 255, 255, 0.35);
                    font-size: 10px;
                  "
                >
                  © ${new Date().getFullYear()} ${BRAND_NAME}.
                  Todos os direitos reservados.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `.trim();
}
