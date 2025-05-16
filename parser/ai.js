// parser/ai.js — адаптивная генерация HTML/CSS без абсолютных координат

function parseFigmaJson(json) {
  const htmlParts = [];
  const cssParts = [];

  function walk(node) {
    if (!node || !node.name || !node.type) return;

    const name = node.name.toLowerCase();
    const id = node.id.replace(/[:;]/g, '_');
    const text = node.characters || '';

    if (name.includes('button')) {
      htmlParts.push(`<button class="btn-${id}">${text || 'Button'}</button>`);
      cssParts.push(`.btn-${id} { background: #0047ff; color: white; padding: 0.8rem 1.2rem; border: none; border-radius: 4px; font-weight: bold; cursor: pointer; margin-bottom: 1rem; }`);
    } else if (name.includes('input') || name.includes('username') || name.includes('password')) {
      htmlParts.push(`<input class="input-${id}" placeholder="${text || 'Input'}" />`);
      cssParts.push(`.input-${id} { width: 100%; padding: 0.8rem; margin: 0.5rem 0; border: 1px solid #ccc; border-radius: 5px; }`);
    } else if (name.includes('link') || name.includes('forgot')) {
      htmlParts.push(`<a class="link-${id}" href="#">${text || 'Link'}</a>`);
      cssParts.push(`.link-${id} { color: #0047ff; text-decoration: none; margin-top: 0.5rem; display: inline-block; }`);
    } else if (node.type === 'TEXT') {
      htmlParts.push(`<p class="text-${id}">${text}</p>`);
      cssParts.push(`.text-${id} { margin: 0.5rem 0; font-size: 1rem; color: #111; }`);
    } else if (name.includes('container') || node.children) {
      const childHtml = [];
      if (node.children) {
        node.children.forEach(child => {
          walk(child);
        });
      }
    }
  }

  walk(json.document);

  return {
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Generated Page</title>
  <link rel="stylesheet" href="/result/result.css">
</head>
<body>
  <div class="generated">
    ${htmlParts.join('\n')}
  </div>
</body>
</html>`.trim(),
    css: `body { font-family: sans-serif; padding: 2rem; background: #f9f9f9; }
.generated { max-width: 480px; margin: auto; }
${cssParts.join('\n')}`
  };
}

module.exports = { parseFigmaJson };
