// server.js
// Ye chhota backend do kaam karta hai:
// 1) public/ folder ki website serve karta hai (aapka bank_to_tally tool)
// 2) /api/parse-statement route pe request aane par, use SAFELY Anthropic API
//    ko forward karta hai (API key sirf server pe rehti hai, browser mein kabhi nahi jaati)

const express = require('express');
const path = require('path');

const app = express();
app.use(express.json({ limit: '25mb' })); // bade PDF/base64 ke liye limit badhayi

// Website ke saare static files (index.html, css, js) serve karo
app.use(express.static(path.join(__dirname, 'public')));

// Secure proxy route
app.post('/api/parse-statement', async (req, res) => {
  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: { message: 'Server par ANTHROPIC_API_KEY set nahi hai.' } });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: { message: 'Proxy request fail ho gayi: ' + err.message } });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server chal raha hai port ' + PORT + ' par'));
