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
    if (style.width) css += `width: ${style.width}px;`;
    if (style.height) css += `height: ${style.height}px;`;
    if (style.boxShadow) css += `box-shadow: ${style.boxShadow};`;
    if (style.border) css += `border: ${style.border};`;
    if (style.opacity !== undefined) css += `opacity: ${style.opacity};`;
    return css;
  }

  function vectorToSvg(node) {
    if (node.svgPath) {
      return `<svg width="${node.absoluteBoundingBox?.width || 48}" height="${node.absoluteBoundingBox?.height || 48}" viewBox="0 0 ${node.absoluteBoundingBox?.width || 48} ${node.absoluteBoundingBox?.height || 48}" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="${node.svgPath}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }
    return '';
  }

  // --- Рекурсивный поиск всех групп для инпутов ---
  function findInputGroups(node) {
    let groups = [];
    if ((node.type === 'GROUP' || node.type === 'FRAME') && node.children) {
      const hasRect = node.children.some(c => c.type === 'RECTANGLE');
      const hasText = node.children.some(c => c.type === 'TEXT');
      if (hasRect && hasText) {
        groups.push(node);
      }
    }
    if (node.children) {
      node.children.forEach(child => {
        groups = groups.concat(findInputGroups(child));
      });
    }
    return groups;
  }

  // --- Поиск SVG-иконки корзины (VECTOR) ---
  function findCartIcon(node) {
    if (node.type === 'VECTOR' && (node.name?.toLowerCase().includes('cart') || node.name?.toLowerCase().includes('icon'))) {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const found = findCartIcon(child);
        if (found) return found;
      }
    }
    return null;
  }

  // --- Поиск текстовых кнопок и ссылок ---
  function findTextByName(node, keyword) {
    if (node.type === 'TEXT' && (node.name || '').toLowerCase().includes(keyword)) {
      return node;
    }
    if (node.children) {
      for (const child of node.children) {
        const found = findTextByName(child, keyword);
        if (found) return found;
      }
    }
    return null;
  }

  // --- Поиск контейнера формы ---
  function findFormContainer(node) {
    if (!node || !node.type) return null;
    const name = (node.name || '').toLowerCase();
    if ((node.type === 'FRAME' || node.type === 'GROUP') && (name.includes('form') || name.includes('login'))) {
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

  // --- Парсинг формы ---
  function parseForm(node) {
    let html = '';
    let css = [];
    let formCls = addClass('form');
    let iconHtml = '';
    let inputsHtml = '';
    let btnHtml = '';
    let linkHtml = '';

    // SVG-иконка корзины
    const icon = findCartIcon(node);
    if (icon) {
      iconHtml = `<div class="form-icon">${vectorToSvg(icon)}</div>`;
      css.push(`.form-icon { display: flex; justify-content: center; margin-bottom: 32px; }`);
    }

    // Инпуты
    const inputGroups = findInputGroups(node);
    inputGroups.forEach(group => {
      const rect = group.children?.find(c => c.type === 'RECTANGLE');
      const text = group.children?.find(c => c.type === 'TEXT');
      const icon = group.children?.find(c => c.type === 'VECTOR');
      if (rect && text) {
        const inputCls = addClass('input');
        let iconHtml = icon ? `<span class="input-icon">${vectorToSvg(icon)}</span>` : '';
        inputsHtml += `<div class="input-block">${iconHtml}<input class="${inputCls}" placeholder="${text.characters}" /></div>`;
        css.push(`.${inputCls} { 
          padding: 14px 44px; width: 100%; border: 1.5px solid #fff; border-radius: 6px; margin-bottom: 18px; font-size: 16px; background: transparent; color: #fff; 
        }`);
        css.push(`.input-block { position: relative; margin-bottom: 18px; }`);
        css.push(`.input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 22px; height: 22px; pointer-events: none; }`);
      }
    });

    // Кнопка и ссылка
    const loginBtn = findTextByName(node, 'login');
    if (loginBtn) {
      btnHtml = `<button class="form-btn">${loginBtn.characters}</button>`;
      css.push(`.form-btn { width: 100%; background: #fff; color: #144ee3; border: none; border-radius: 6px; font-size: 18px; font-weight: 600; padding: 14px 0; margin: 18px 0 0 0; cursor: pointer; transition: background 0.2s; }`);
    }
    const forgotLink = findTextByName(node, 'forgot');
    if (forgotLink) {
      linkHtml = `<a class="form-link" href="#">${forgotLink.characters}</a>`;
      css.push(`.form-link { display: block; text-align: center; color: #fff; opacity: 0.8; margin-top: 12px; text-decoration: none; font-size: 16px; }`);
    }

    html = `
      <form class="${formCls}">
        ${iconHtml}
        ${inputsHtml}
        ${btnHtml}
        ${linkHtml}
      </form>
    `;
    css.push(`.${formCls} { max-width: 400px; margin: 0 auto; display: flex; flex-direction: column; align-items: stretch; background: rgba(20,78,227,0.95); border-radius: 12px; padding: 48px 36px; box-shadow: 0 8px 32px rgba(31,71,228,0.08); }`);
    htmlParts.push(html);
    cssParts.push(...css);
  }

  // --- Основной вызов ---
  const formContainer = findFormContainer(json.document);
  if (formContainer) {
    parseForm(formContainer);
  } else {
    htmlParts.push('<div style="color:red;text-align:center">Форма не найдена</div>');
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
<body style="background:#144ee3;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  ${htmlParts.join('\n')}
</body>
</html>
    `.trim(),
    css: `
body { margin: 0; font-family: 'Inter', Arial, sans-serif; background: #144ee3; color: #fff; }
${cssParts.join('\n')}
    `.trim()
  };
}

module.exports = { parseFigmaJson };