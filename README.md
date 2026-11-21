# apps

App e piccoli strumenti di iAvvocato, pubblicati con GitHub Pages su **https://apps.iavvocato.cloud**.

Ogni app sta in una cartella propria ed è una pagina web statica: niente server, account, cookie o statistiche. I dati che l'utente inserisce restano nel suo browser.

| App | Indirizzo | Cosa fa |
| --- | --- | --- |
| Il mio Amicobus | [guida](https://apps.iavvocato.cloud/amicobus/guida/) · [app](https://apps.iavvocato.cloud/amicobus/) | Prenotazione semplificata di Amicobus, il servizio a chiamata di CTM Cagliari per persone con disabilità |

## Il mio Amicobus

Non è un servizio ufficiale di CTM S.p.A. Aiuta a usare i canali di prenotazione di CTM (modulo online e numero verde 800 259 745).

- `amicobus/index.html`: l'app, in un solo file (HTML, CSS e JavaScript senza librerie).
- `amicobus/guida/`: presentazione e istruzioni passo per passo per iPhone e Android, con screenshot (dati di esempio; i dati personali visibili negli screenshot originali sono stati coperti). È la pagina da linkare per far conoscere l'app.
- `amicobus/amicobus.user.js`: script per Userscripts (Safari su iPhone) o Violentmonkey (Firefox su Android). Compila il modulo di [ctmcagliari.it/prenotazione-servizio](https://www.ctmcagliari.it/prenotazione-servizio/) con i dati preparati nell'app. Non invia nulla: la casella reCAPTCHA e il tasto Prenota restano alla persona. I dati arrivano nell'indirizzo dopo il `#` e lo script li toglie dalla barra degli indirizzi appena la pagina si apre.
- `amicobus/manifest.webmanifest` e le icone: nome e icona quando l'app viene aggiunta alla schermata Home.

Le regole di prenotazione (giorni e orari, conferma telefonica dalle 17:30, annullamento via WhatsApp al 348 250 2731 almeno 30 minuti prima) vengono dalla pagina Amicobus di [ctmcagliari.it](https://www.ctmcagliari.it/amico-bus-2/), consultata a novembre 2026. Se CTM le cambia, vanno aggiornate in `amicobus/index.html` (costanti `FINESTRE`, `NUMERO_VERDE`, `WA_NUM`, `TARIFFA` e funzione `giornoPrenotazione`).

Quando non si può prenotare, il viaggio si salva come bozza con l'orario in cui si potrà mandare. L'app crea un promemoria per il calendario del telefono (file `.ics` con fuso Europe/Rome, avviso all'apertura e un'ora prima della chiusura, oppure link a Google Calendar). Il file è servito da `amicobus/sw.js`, un service worker che risponde solo all'indirizzo `amicobus/promemoria.ics?ics=…` e non mette in cache nient'altro: su iPhone è l'unico metodo, tra quelli provati, che apre il calendario. Il promemoria contiene il link `…/amicobus/#bozza-<id>`, che riapre l'app sul viaggio già pronto.

Limiti noti: i giorni festivi non sono gestiti; l'indirizzo dello stadio nel viaggio "Partita del Cagliari" è generico e va verificato; gli orari di prenotazione sono calcolati con l'ora del telefono, quindi valgono per telefoni con il fuso italiano o belga; il rinnovo SUS e lo stato delle prenotazioni compaiono solo quando si apre l'app.

## Pubblicazione

GitHub Pages dal branch `main`, cartella principale. Il file `CNAME` contiene il dominio `apps.iavvocato.cloud`, che va collegato con un record DNS CNAME `apps` → `iavvocato.github.io`.

## Licenza

[MIT](LICENSE).
