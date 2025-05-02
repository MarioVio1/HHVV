const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));

async function estraiM3U8(url) {
  try {
    // Aggiungi il 'User-Agent' per simulare una richiesta da un browser
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
      }
    });

    // Usa Cheerio per caricare e analizzare il contenuto della pagina
    const $ = cheerio.load(response.data);
    const links = [];

    // Estrai i link con estensione .m3u8
    $('a').each((_, el) => {
      const href = $(el).attr('href');
      if (href && href.includes('.m3u8')) {
        links.push(href);
      }
    });

    console.log(`Link trovati per ${url}:`, links); // Log dei link trovati
    return links;
  } catch (err) {
    console.error(`Errore su ${url}:`, err.message);
    return [];
  }
}

app.get('/playlist.m3u', async (req, res) => {
  const siti = [
    'https://huhu.to',
    'https://oha.to',
    'https://kool.to',
    'https://vavoo.to'
  ];

  let playlist = '#EXTM3U\n';

  // Estrai i link da ogni sito
  for (const sito of siti) {
    const links = await estraiM3U8(sito);
    links.forEach((link, i) => {
      playlist += `#EXTINF:-1, ${sito} ${i + 1}\n${link}\n`;
    });
  }

  // Imposta l'intestazione per il tipo di contenuto .m3u e invia la playlist
  res.setHeader('Content-Type', 'application/x-mpegURL');
  res.send(playlist);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server attivo su http://localhost:${PORT}`);
});
