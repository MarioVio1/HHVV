import asyncio
from playwright.async_api import async_playwright
from fastapi import FastAPI
import re
import uvicorn

app = FastAPI()

# Lista dei siti da cui estrarre i canali
SITES = ["https://huhu.to", "https://oha.to", "https://kool.to", "https://vavoo.to"]

# Configurazione del proxy
PROXY = {
    "server": "http://p.webshare.io:80",
    "username": "pzytldso-rotate",
    "password": "oybm1jw2kflp"
}

async def extract_m3u_links(site):
    m3u_content = ""
    async with async_playwright() as p:
        try:
            browser = await p.chromium.launch(
                headless=True,
                proxy=PROXY  # Usa il proxy fornito
            )
            page = await browser.new_page()
            
            # Naviga al sito
            await page.goto(site, timeout=60000)
            # Attendi il caricamento dei contenuti
            await page.wait_for_timeout(5000)

            # Cerca link M3U/M3U8 nella pagina
            links = await page.evaluate('''
                () => {
                    const urls = [];
                    document.querySelectorAll('a, source').forEach(el => {
                        const href = el.href || el.src;
                        if (href && href.match(/\.m3u8?$/)) {
                            urls.push({href, name: el.textContent.trim() || 'Canale Sconosciuto'});
                        }
                    });
                    return urls;
                }
            ''')

            # Aggiungi i link al file M3U
            for link in links:
                href = link['href']
                name = link['name']
                m3u_content += f'#EXTINF:-1 tvg-name="{name}",{name}\n{href}\n'

        except Exception as e:
            print(f"Errore su {site}: {e}")
        finally:
            await browser.close()

    return m3u_content

@app.get("/generate-m3u")
async def generate_m3u():
    m3u_content = "#EXTM3U\n"
    for site in SITES:
        try:
            site_m3u = await extract_m3u_links(site)
            m3u_content += site_m3u
        except Exception as e:
            print(f"Errore durante l'estrazione da {site}: {e}")
    
    # Ritorna il contenuto M3U come risposta
    return {"m3u": m3u_content}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
