const figmaFileInput = document.getElementById('figmaFile');
const generateBtn = document.getElementById('generateBtn');
const generateByUrlBtn = document.getElementById('generateByUrlBtn');
const figmaUrlInput = document.getElementById('figmaUrl');
const downloadHTML = document.getElementById('downloadHTML');
const downloadCSS = document.getElementById('downloadCSS');

function showDownloadLinks(data) {
  downloadHTML.href = data.htmlPath;
  downloadCSS.href = data.cssPath;
  downloadHTML.style.display = 'inline-block';
  downloadCSS.style.display = 'inline-block';
}

generateBtn.addEventListener('click', async () => {
  const file = figmaFileInput.files[0];
  if (!file) {
    alert('Please, choose Figma file (JSON).');
    return;
  }

  const formData = new FormData();
  formData.append('figmaFile', file);

  try {
    const res = await fetch('/generate', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();

    if (data.error) {
      alert('Generate error: ' + data.error);
      return;
    }

    showDownloadLinks(data);
  } catch (err) {
    alert('Error sending file.');
    console.error(err);
  }
});

generateByUrlBtn.addEventListener('click', async () => {
  const url = figmaUrlInput.value.trim();
  if (!url) {
    alert('Enter Figma link.');
    return;
  }

  try {
    const res = await fetch('/generate-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await res.json();

    if (data.error) {
      alert('Error generating: ' + data.error);
      return;
    }

    showDownloadLinks(data);
  } catch (err) {
    alert('Error sending link.');
    console.error(err);
  }
});