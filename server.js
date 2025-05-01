const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

// Funzione base per estrarre .m3u8
async function estraiM3U8(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    const $ = cheerio.load(data);
    const links = [];

    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('.m3u8')) {
        links.push(href);
      }
    });

    return links;
  } catch (err) {
    console.error(`Errore su ${url}`, err.message);
    return [];
  }
}

// Endpoint playlist
app.get('/playlist.m3u', async (req, res) => {
  const siti = [
    'https://huhu.to',
    'https://oha.to',
    'https://kool.to',
    'https://vavoo.to'
  ];

  let playlist = '#EXTM3U\n';

  for (const sito of siti) {
    const links = await estraiM3U8(sito);
    links.forEach((link, i) => {
      playlist += `#EXTINF:-1, ${sito} ${i + 1}\n${link}\n`;
    });
  }

  res.setHeader('Content-Type', 'application/x-mpegURL');
  res.send(playlist);
});

// Avvio server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});
