function parseFigmaJson(json) {
  let html = '';

  function findFormContainer(node) {
    if (!node || !node.type) return null;
    const name = (node.name || '').toLowerCase();
    if ((node.type === 'FRAME' || node.type === 'GROUP') && (name.includes('form') || name.includes('login') || name.includes('painel'))) {
      return node;
    }
    if (node.children && node.children.length) {
      for (const child of node.children) {
        const found = findFormContainer(child);
        if (found) return found;
      }
    }
    return null;
  }

  function classifyTexts(node) {
    const texts = [];
    function walk(n) {
      if (!n) return;
      if (n.type === 'TEXT') {
        const name = (n.name || '').toLowerCase();
        const chars = (n.characters || '').toLowerCase();
        texts.push({
          name,
          raw: n.characters,
          chars,
          node: n
        });
      }
      if (n.children) n.children.forEach(walk);
    }
    walk(node);
    return texts;
  }

  function capitalizeFirst(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function buildForm(node) {
    const texts = classifyTexts(node);

    const welcome = texts.find(t => t.raw.toLowerCase().includes('welcome'));
    const title = texts.find(t => t.raw.toLowerCase().includes('login into your account'));
    const emailLabel = texts.find(t => t.raw.toLowerCase().includes('e-mail') || t.raw.toLowerCase().includes('username'));
    const emailInput = texts.find(t => t.raw.toLowerCase().includes('ex: teste@teste.com'));
    const passwordLabel = texts.find(t => t.raw.toLowerCase() === 'password');
    const passwordInput = texts.find(t => t.raw.toLowerCase().includes('ex: upfdlrvacir2ua'));
    const forgot = texts.find(t => t.raw.toLowerCase().includes('forgot'));
    const button = texts.find(t => t.raw.toLowerCase() === 'login');
    const note = texts.find(t => t.raw.toLowerCase().includes('new user') || t.raw.toLowerCase().includes('createaccount'));

    html = `<form class="form-0" autocomplete="off">\n`;

    if (welcome) html += `<div class="form-welcome">${welcome.raw}</div>\n`;
    if (title) html += `<div class="form-title">${title.raw}</div>\n`;

    // Email
    if (emailLabel) html += `<label class="form-label" for="email">${capitalizeFirst(emailLabel.raw.toLowerCase())}</label>\n`;
    if (emailInput) html += `<div class="input-block"><input id="email" name="email" type="text" placeholder="${emailInput.raw}" autocomplete="username" /></div>\n`;

    // Password row
    if (passwordLabel || forgot) {
      html += `<div class="form-label-row">`;
      if (passwordLabel) html += `<label class="form-label" for="password">${capitalizeFirst(passwordLabel.raw.toLowerCase())}</label>`;
      if (forgot) html += `<a class="form-link" href="#">${forgot.raw}</a>`;
      html += `</div>\n`;
    }
    if (passwordInput) html += `<div class="input-block"><input id="password" name="password" type="password" placeholder="${passwordInput.raw}" autocomplete="current-password" /></div>\n`;

    if (button) html += `<button class="form-btn" type="submit">${button.raw}</button>\n`;
    if (note) html += `<div class="form-note">${note.raw}</div>\n`;

    html += `</form>`;
  }

  // --- Основной вызов ---
  const formContainer = findFormContainer(json.document);
  if (formContainer) {
    buildForm(formContainer);
  } else {
    html = '<div style="color:red;text-align:center">Форма не найдена</div>';
  }

  // --- CSS для максимального соответствия макету ---
  const css = `
body {
  margin: 0;
  font-family: 'Inter', Arial, sans-serif;
  background: #181a20;
  color: #fff;
}
.form-0 {
  max-width: 320px;
  margin: 0 auto;
  background: #23272f;
  border-radius: 12px;
  padding: 28px 18px 18px 18px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.18);
  display: flex;
  flex-direction: column;
  align-items: stretch;
}
.input-block {
  margin-bottom: 12px;
}
input {
  width: 100%;
  padding: 11px 14px;
  border: 1.2px solid #454a54;
  border-radius: 6px;
  background: #23272f;
  color: #bfc9da;
  font-size: 15px;
  margin-bottom: 0;
  outline: none;
  transition: border 0.2s, background 0.2s;
  box-sizing: border-box;
}
input::placeholder {
  color: #7c8593;
  opacity: 1;
  font-size: 14px;
  font-weight: 400;
}
input:focus {
  border-color: #1769ff;
  background: #23272f;
  color: #fff;
}
.form-btn {
  width: 100%;
  background: #1769ff;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 20px;
  font-weight: 700;
  padding: 13px 0;
  margin: 18px 0 0 0;
  cursor: pointer;
  transition: background 0.2s;
  box-shadow: 0 2px 8px rgba(23,105,255,0.15);
  text-align: center;
  letter-spacing: 0.01em;
}
.form-btn:hover {
  background: #155edb;
}
.form-link {
  color: #bfc9da;
  opacity: 1;
  margin-left: 0;
  float: none;
  text-decoration: none;
  font-size: 13px;
  font-weight: 400;
}
.form-link:hover {
  text-decoration: underline;
  color: #1769ff;
}
.form-label, .form-label-row .form-label {
  font-size: 13px;
  color: #bfc9da;
  margin-bottom: 2px;
  margin-top: 10px;
  display: block;
  font-weight: 500;
  letter-spacing: 0.01em;
  text-transform: none;
}
.form-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2px;
  margin-top: 10px;
}
.form-welcome {
  text-align: center;
  font-size: 13px;
  color: #bfc9da;
  margin-bottom: 2px;
  margin-top: 0;
  letter-spacing: 1px;
  font-weight: 400;
  text-transform: none;
}
.form-title {
  text-align: center;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
  margin-top: 0;
  letter-spacing: 0.01em;
}
.form-note {
  font-size: 12px;
  color: #bfc9da;
  margin-top: 12px;
  text-align: left;
}
`.trim();

  return {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Generated Login Page</title>
  <style>
    ${css}
  </style>
</head>
<body style="background:#181a20;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  ${html}
</body>
</html>
    `.trim(),
    css
  };
}

module.exports = { parseFigmaJson };