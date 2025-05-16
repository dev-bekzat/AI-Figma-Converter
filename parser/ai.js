// parser/ai.js — шаблон логин-страницы с иконкой, стилями и кнопкой

function parseFigmaJson() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Login Page</title>
  <link rel="stylesheet" href="/result/result.css" />
</head>
<body>
  <div class="login-wrapper">
    <div class="login-box">
      <div class="icon">
        <svg width="64" height="64" fill="white" viewBox="0 0 24 24">
          <path d="M16 6h2l3 7v2a1 1 0 01-1 1h-1v2a1 1 0 01-1 1h-1.18A3 3 0 0113 21H7a3 3 0 01-2.82-2H3a1 1 0 01-1-1v-2h1.18L6 6h10zm-1 2H7.42l-2 6h13.16l-2-6z"/>
        </svg>
      </div>
      <div class="input-group">
        <input type="text" placeholder="Username" />
      </div>
      <div class="input-group">
        <input type="password" placeholder="Password" />
      </div>
      <button class="login-btn">LOGIN</button>
      <a href="#" class="forgot">Forgot password?</a>
    </div>
  </div>
</body>
</html>`;

  const css = `body {
  margin: 0;
  font-family: 'Segoe UI', sans-serif;
  background: #0d47d8;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  background: rgba(255, 255, 255, 0.05);
  padding: 40px;
  border-radius: 12px;
  width: 360px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
}

.icon {
  margin-bottom: 32px;
}

.input-group {
  margin-bottom: 20px;
}

input {
  width: 100%;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
}

.login-btn {
  width: 100%;
  padding: 12px;
  border: none;
  background: white;
  color: #0d47d8;
  font-weight: bold;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 12px;
}

.forgot {
  display: inline-block;
  margin-top: 16px;
  font-size: 13px;
  color: white;
  text-decoration: none;
}`;

  return { html, css };
}

module.exports = { parseFigmaJson };
