function parseFigmaJson(json) {
  const htmlParts = [];
  const cssParts = [];
  let index = 0;
  const addClass = (base) => `${base}-${index++}`;

  function colorToCss(color) {
    if (!color) return '';
    return `rgb(${Math.round(color.r * 255)},${Math.round(color.g * 255)},${Math.round(color.b * 255)})`;
  }

  function styleToCss(style = {}, fill = null) {
    let css = '';
    if (fill) css += `background: ${colorToCss(fill)};`;
    if (style.backgroundColor) css += `background: ${colorToCss(style.backgroundColor)};`;
    if (style.borderRadius) css += `border-radius: ${style.borderRadius}px;`;
    if (style.padding) css += `padding: ${style.padding}px;`;
    if (style.margin) css += `margin: ${style.margin}px;`;
    if (style.width) css += `width: ${style.width}px;`;
    if (style.height) css += `height: ${style.height}px;`;
    if (style.boxShadow) css += `box-shadow: ${style.boxShadow};`;
    if (style.border) css += `border: ${style.border};`;
    if (style.gap) css += `gap: ${style.gap}px;`;
    if (style.opacity !== undefined) css += `opacity: ${style.opacity};`;
    if (style.textAlign) css += `text-align: ${style.textAlign};`;
    return css;
  }

  function walk(node) {
    if (!node || !node.type) return '';

    const name = (node.name || '').toLowerCase();
    const style = node.style || {};
    const fill = (node.fills && node.fills[0] && node.fills[0].type === 'SOLID') ? node.fills[0].color : null;
    const fontSize = style.fontSize || 16;
    const fontFamily = style.fontFamily || 'Inter, Arial, sans-serif';
    const textColor = style.fill ? colorToCss(style.fill) : (fill ? colorToCss(fill) : '#fff');

    let html = '';
    let css = [];
    let cls = '';

    // --- Контейнеры (FRAME, GROUP) ---
    if (node.type === 'FRAME' || node.type === 'GROUP') {
      cls = addClass('container');
      let childrenHtml = '';
      if (node.children && node.children.length) {
        childrenHtml = node.children.map(child => walk(child)).join('\n');
      }
      html = `<div class="${cls}">${childrenHtml}</div>`;
      css.push(`.${cls} { display: flex; flex-direction: column; ${styleToCss(style, fill)} }`);
      htmlParts.push(html);
      cssParts.push(...css);
      return html;
    }

    // --- Текст ---
    if (node.type === 'TEXT' && node.characters) {
      cls = addClass('text');
      html = `<p class="${cls}">${node.characters}</p>`;
      css.push(`.${cls} { font-size: ${fontSize}px; font-family: ${fontFamily}; color: ${textColor}; margin: 8px 0; ${styleToCss(style)} }`);
      htmlParts.push(html);
      cssParts.push(...css);
      return html;
    }

    // --- Прямоугольник ---
    if (node.type === 'RECTANGLE') {
      cls = addClass('rect');
      html = `<div class="${cls}"></div>`;
      css.push(`.${cls} { width: ${style.width || 100}px; height: ${style.height || 20}px; ${styleToCss(style, fill)} margin: 8px 0; }`);
      htmlParts.push(html);
      cssParts.push(...css);
      return html;
    }

    // --- Линия ---
    if (node.type === 'LINE') {
      cls = addClass('line');
      html = `<div class="${cls}"></div>`;
      css.push(`.${cls} { width: ${style.width || 100}px; height: 1px; background: ${fill ? colorToCss(fill) : '#fff'}; margin: 8px 0; }`);
      htmlParts.push(html);
      cssParts.push(...css);
      return html;
    }

    // --- Эллипс (круг) ---
    if (node.type === 'ELLIPSE') {
      cls = addClass('ellipse');
      html = `<div class="${cls}"></div>`;
      css.push(`.${cls} { width: ${style.width || 40}px; height: ${style.height || 40}px; border-radius: 50%; ${styleToCss(style, fill)} margin: 8px 0; }`);
      htmlParts.push(html);
      cssParts.push(...css);
      return html;
    }

    // --- Изображение ---
    if (node.type === 'IMAGE' && node.imageRef) {
      cls = addClass('img');
      html = `<img class="${cls}" src="${node.imageRef}" alt="${node.name || ''}" />`;
      css.push(`.${cls} { width: ${style.width || 100}px; height: ${style.height || 100}px; object-fit: cover; ${styleToCss(style)} }`);
      htmlParts.push(html);
      cssParts.push(...css);
      return html;
    }

    // --- Иконки (icon, eye) ---
    if ((name.includes('icon') || name.includes('eye')) && node.type !== 'TEXT') {
      cls = addClass('icon');
      html = `<span class="${cls}"></span>`;
      css.push(`.${cls} { display: inline-block; width: 20px; height: 20px; background: url('/result/eye.svg') center/contain no-repeat; vertical-align: middle; margin-left: 4px; cursor: pointer; }`);
      htmlParts.push(html);
      cssParts.push(...css);
      return html;
    }

    // --- Рекурсивно для остальных детей ---
    if (node.children && node.children.length) {
      node.children.forEach(child => walk(child));
    }
  }

  // Парсим всё дерево, не только главный контейнер
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
  <div class="generated-root">
    ${htmlParts.join('\n')}
  </div>
</body>
</html>
    `.trim(),
    css: `
body { margin: 0; font-family: 'Inter', Arial, sans-serif; background: #101114; color: #fff; }
.generated-root {
  max-width: 900px;
  margin: 40px auto;
  background: #181a20;
  padding: 40px 32px 32px 32px;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(31,71,228,0.08);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 8px;
}
img { display: block; }
input, button { outline: none; }
${cssParts.join('\n')}`.trim()
  };
}

module.exports = { parseFigmaJson };