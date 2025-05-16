// parser/ai.js — генерация адаптивной формы из Figma JSON

function parseFigmaJson(json) {
  const htmlParts = [];
  const cssParts = [];

  let index = 0;
  const addClass = (base) => `${base}-${index++}`;

  function walk(node) {
    if (!node || !node.type) return;

    const id = node.id.replace(/[:;]/g, '_');
    const name = (node.name || '').toLowerCase();

    const style = node.style || {};
    const fill = (node.fills && node.fills[0]) ? node.fills[0].color : null;
    const fontSize = style.fontSize || 16;
    const fontFamily = style.fontFamily || 'sans-serif';
    const textColor = fill ? `rgb(${Math.round(fill.r * 255)}, ${Math.round(fill.g * 255)}, ${Math.round(fill.b * 255)})` : '#000';

    const css = [];
    let html = '';

    if (node.type === 'TEXT' && node.characters) {
      const cls = addClass('text');
      html = `<p class="${cls}">${node.characters}</p>`;
      css.push(`.${cls} { font-size: ${fontSize}px; font-family: ${fontFamily}; color: ${textColor}; margin: 8px 0; }`);
    }

    if (name.includes('username')) {
      const labelCls = addClass('label');
      const inputCls = addClass('input');
      html = `
        <label class="${labelCls}">Username</label>
        <input type="text" class="${inputCls}" />
      `;
      css.push(`.${labelCls} { font-size: ${fontSize}px; margin-top: 16px; display: block; }`);
      css.push(`.${inputCls} { padding: 10px; width: 100%; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 12px; }`);
    }

    if (name.includes('password')) {
      const labelCls = addClass('label');
      const inputCls = addClass('input');
      html = `
        <label class="${labelCls}">Password</label>
        <input type="password" class="${inputCls}" />
      `;
      css.push(`.${labelCls} { font-size: ${fontSize}px; margin-top: 16px; display: block; }`);
      css.push(`.${inputCls} { padding: 10px; width: 100%; border: 1px solid #ccc; border-radius: 4px; margin-bottom: 12px; }`);
    }

    if (name.includes('login')) {
      const btnCls = addClass('btn');
      html = `<button class="${btnCls}">Login</button>`;
      css.push(`.${btnCls} { background-color: #1f47e4; color: white; padding: 10px 20px; border: none; border-radius: 4px; cursor: pointer; margin-top: 12px; width: 100%; }`);
    }

    if (name.includes('forgot')) {
      const cls = addClass('link');
      html = `<a href="#" class="${cls}">Forgot password?</a>`;
      css.push(`.${cls} { font-size: 14px; color: #1f47e4; text-align: center; display: block; margin-top: 10px; text-decoration: none; }`);
    }

    if (html) htmlParts.push(html);
    cssParts.push(...css);

    if (node.children && node.children.length) {
      node.children.forEach(walk);
    }
  }

  walk(json.document);

  return {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Generated Page</title>
  <link rel="stylesheet" href="/result/result.css">
</head>
<body>
  <div class="generated-form">
    ${htmlParts.join('\n')}
  </div>
</body>
</html>
    `.trim(),
    css: `
body { margin: 0; font-family: sans-serif; background: #f0f2f5; }
.generated-form {
  max-width: 400px;
  margin: 100px auto;
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.1);
}
${cssParts.join('\n')}`.trim()
  };
}

module.exports = { parseFigmaJson };
