const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');  // Importiamo Cheerio

const app = express();
const port = 3000;

app.use(express.static('public'));
app.set('view engine', 'ejs');

const proxyUrl = 'http://pzytldso-rotate:oybm1jw2kflp@p.webshare.io:80/';

// Siti da cui estrarre link
const sites = ['https://huhu.to', 'https://oha.to', 'https://kool.to', 'https://vavoo.to'];

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/generate', async (req, res) => {
  let m3u = '#EXTM3U\n';

  for (const site of sites) {
    try {
      // Eseguiamo la richiesta HTTP con Axios
      const response = await axios.get(site, {
        proxy: {
          host: 'pzytldso-rotate',
          port: 80,
          auth: {
            username: 'oybm1jw2kflp',
            password: '',
          },
        },
      });

      // Carica il contenuto HTML nella variabile cheerio
      const $ = cheerio.load(response.data);

      // Cerca i link .m3u8 all'interno della pagina (modifica selettore se necessario)
      const links = [];
      $('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && href.includes('.m3u8')) {
          links.push(href);
        }
      });

      // Aggiungi i link M3U8 trovati al file M3U
      links.forEach(link => {
        m3u += `#EXTINF:-1, ${site.replace('https://', '')}\n${link}\n`;
      });

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
