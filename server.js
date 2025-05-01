const express = require('express');
const axios = require('axios');
const { ProxyAgent } = require('proxy-agent');  // Destructure to use ProxyAgent directly

const app = express();
const port = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');

const proxyUrl = 'http://pzytldso-rotate:oybm1jw2kflp@p.webshare.io:80/';
const agent = new ProxyAgent(proxyUrl); // Correct usage of ProxyAgent

// Siti da cui estrarre link
const sites = ['https://huhu.to', 'https://oha.to', 'https://kool.to', 'https://vavoo.to'];

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/generate', async (req, res) => {
  let m3u = '#EXTM3U\n';

  for (const site of sites) {
    try {
      const response = await axios.get(site, { httpAgent: agent, httpsAgent: agent });

      const links = [...response.data.matchAll(/https?:\/\/[^ "'\n]+\.m3u8/g)];

      for (const match of links) {
        m3u += `#EXTINF:-1, ${site.replace('https://', '')}\n${match[0]}\n`;
      }

    } catch (error) {
      console.error(`Errore con ${site}:`, error.message);
    }
  }

  res.setHeader('Content-Disposition', 'attachment; filename="playlist.m3u"');
  res.setHeader('Content-Type', 'audio/x-mpegurl');
  res.send(m3u);
});

app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});
