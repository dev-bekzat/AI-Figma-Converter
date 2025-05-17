function parseFigmaJson(json) {
  const htmlParts = [];
  const cssParts = [];
  let index = 0;
  const addClass = (base) => `${base}-${index++}`;

  function styleToCss(style) {
    let css = '';
    if (style.backgroundColor) {
      const c = style.backgroundColor;
      css += `background: rgb(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)});`;
    }
    if (style.borderRadius) css += `border-radius: ${style.borderRadius}px;`;
    if (style.padding) css += `padding: ${style.padding}px;`;
    if (style.margin) css += `margin: ${style.margin}px;`;
    if (style.width) css += `width: ${style.width}px;`;
    if (style.height) css += `height: ${style.height}px;`;
    if (style.boxShadow) css += `box-shadow: ${style.boxShadow};`;
    if (style.border) css += `border: ${style.border};`;
    if (style.gap) css += `gap: ${style.gap}px;`;
    return css;
  }

  // Находим главный контейнер (form/main/center)
  function findMainContainer(node) {
    if (!node || !node.type) return null;
    const name = (node.name || '').toLowerCase();
    if (
      (node.type === 'FRAME' || node.type === 'GROUP') &&
      (name.includes('form') || name.includes('main') || name.includes('center'))
    ) {
      return node;
    }
    if (node.children && node.children.length) {
      for (const child of node.children) {
        const found = findMainContainer(child);
        if (found) return found;
      }
    }
    return null;
  }

  function walk(node) {
    if (!node || !node.type) return '';

    const name = (node.name || '').toLowerCase();
    const style = node.style || {};
    const fill = (node.fills && node.fills[0]) ? node.fills[0].color : null;
    const fontSize = style.fontSize || 16;
    const fontFamily = style.fontFamily || 'Inter, Arial, sans-serif';
    const textColor = fill ? `rgb(${Math.round(fill.r * 255)}, ${Math.round(fill.g * 255)}, ${Math.round(fill.b * 255)})` : '#000';

    let html = '';
    let css = [];
    let cls = '';

    // Только для текстовых слоёв
    if (node.type === 'TEXT' && node.characters) {
      // Username
      if (name.includes('username')) {
        const labelCls = addClass('label');
        const inputCls = addClass('input');
        html = `
          <label class="${labelCls}">${node.characters}</label>
          <input type="text" class="${inputCls}" placeholder="Enter your username" autocomplete="username" />
        `;
        css.push(`.${labelCls} { font-size: 15px; margin-bottom: 6px; display: block; font-weight: 500; }`);
        css.push(`.${inputCls} { padding: 12px; width: 100%; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 18px; font-size: 15px; background: #181a20; color: #fff; }`);
      }
      // Password
      else if (name.includes('password')) {
        const labelCls = addClass('label');
        const inputCls = addClass('input');
        html = `
          <label class="${labelCls}">${node.characters}</label>
          <input type="password" class="${inputCls}" placeholder="Enter your password" autocomplete="current-password" />
        `;
        css.push(`.${labelCls} { font-size: 15px; margin-bottom: 6px; display: block; font-weight: 500; }`);
        css.push(`.${inputCls} { padding: 12px; width: 100%; border: 1px solid #e0e0e0; border-radius: 6px; margin-bottom: 18px; font-size: 15px; background: #181a20; color: #fff; }`);
      }
      // Login button
      else if (name.includes('login')) {
        const btnCls = addClass('btn');
        html = `<button class="${btnCls}">${node.characters}</button>`;
        css.push(`.${btnCls} { background: #144ee3; color: #fff; padding: 12px 0; border: none; border-radius: 6px; font-size: 16px; font-weight: 600; margin-top: 10px; width: 100%; box-shadow: 0 2px 8px rgba(31,71,228,0.08); cursor: pointer; transition: background 0.2s; }
.${btnCls}:hover { background: #1637b8; }`);
      }
      // Forgot link
      else if (name.includes('forgot')) {
        const linkCls = addClass('link');
        html = `<a href="#" class="${linkCls}">${node.characters}</a>`;
        css.push(`.${linkCls} { font-size: 14px; color: #1f47e4; text-align: right; display: block; margin-top: 10px; text-decoration: none; }
.${linkCls}:hover { text-decoration: underline; }`);
      }
      // Обычный текст
      else {
        cls = addClass('text');
        html = `<p class="${cls}">${node.characters}</p>`;
        css.push(`.${cls} { font-size: ${fontSize}px; font-family: ${fontFamily}; color: ${textColor}; margin: 8px 0; ${styleToCss(style)} }`);
      }
      htmlParts.push(html);
      cssParts.push(...css);
      return html;
    }

    // Иконка (например, глаз для пароля)
    if ((name.includes('eye') || name.includes('icon')) && node.type !== 'TEXT') {
      const iconCls = addClass('icon');
      html = `<span class="${iconCls}"></span>`;
      css.push(`.${iconCls} { display: inline-block; width: 20px; height: 20px; background: url('/result/eye.svg') center/contain no-repeat; vertical-align: middle; margin-left: -32px; cursor: pointer; }`);
      htmlParts.push(html);
      cssParts.push(...css);
      return html;
    }

    // Рекурсивно для остальных детей
    if (node.children && node.children.length) {
      node.children.forEach(child => walk(child));
    }
  }

  // Находим главный контейнер и парсим только его содержимое
  const mainContainer = findMainContainer(json.document);
  if (mainContainer) {
    walk(mainContainer);
  } else {
    walk(json.document);
  }

  return {
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Generated Login Page</title>
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
body { margin: 0; font-family: 'Inter', Arial, sans-serif; background: #101114; color: #fff; }
.generated-form {
  max-width: 400px;
  margin: 80px auto;
  background: #181a20;
  padding: 40px 32px 32px 32px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31,71,228,0.08);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}
input, button { outline: none; }
${cssParts.join('\n')}`.trim()
  };
}

module.exports = { parseFigmaJson };