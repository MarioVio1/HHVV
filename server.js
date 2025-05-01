const express = require('express');
const puppeteer = require('puppeteer');  // Importiamo puppeteer

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

  const browser = await puppeteer.launch({
    headless: true,
    args: [`--proxy-server=${proxyUrl}`],  // Configura il proxy
  });
  const page = await browser.newPage();

  for (const site of sites) {
    try {
      await page.goto(site, { waitUntil: 'networkidle2' }); // Aspetta che la pagina si carichi

      // Usa una selezione più precisa per prendere i link m3u8 (aggiorna questa parte se il sito cambia)
      const links = await page.evaluate(() => {
        const m3u8Links = [];
        // Modifica il selettore in base alla struttura del sito
        const elements = document.querySelectorAll('a[href*=".m3u8"]');
        elements.forEach(element => m3u8Links.push(element.href));
        return m3u8Links;
      });

      // Aggiungi i link M3U8 trovati
      links.forEach(link => {
        m3u += `#EXTINF:-1, ${site.replace('https://', '')}\n${link}\n`;
      });

    } catch (error) {
      console.error(`Errore con ${site}:`, error.message);
    }
  }

  await browser.close();

  res.setHeader('Content-Disposition', 'attachment; filename="playlist.m3u"');
  res.setHeader('Content-Type', 'audio/x-mpegurl');
  res.send(m3u);
});

app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});
