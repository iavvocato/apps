// ==UserScript==
// @name         Il mio Amicobus – compila il modulo CTM
// @namespace    il-mio-amicobus
// @version      0.1.0
// @description  Compila il modulo di prenotazione Amicobus di CTM con i dati preparati nell'app "Il mio Amicobus". Non invia nulla da solo: la casella "Non sono un robot" e il tasto Prenota restano alla persona.
// @author       iAvvocato
// @homepageURL  https://apps.iavvocato.cloud/amicobus/
// @updateURL    https://apps.iavvocato.cloud/amicobus/amicobus.user.js
// @downloadURL  https://apps.iavvocato.cloud/amicobus/amicobus.user.js
// @license      MIT
// @match        https://www.ctmcagliari.it/prenotazione-servizio/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  var KEY = '#amicobus=';
  var hash = location.hash || '';
  if (hash.indexOf(KEY) !== 0) return;

  var data;
  try {
    var b64 = hash.slice(KEY.length).replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    var bin = atob(b64);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    data = JSON.parse(new TextDecoder().decode(bytes));
  } catch (e) {
    console.warn('[Il mio Amicobus] Dati non leggibili', e);
    return;
  }

  // Toglie subito i dati personali dalla barra degli indirizzi,
  // prima che gli script di statistica della pagina leggano l'URL.
  try { history.replaceState(null, '', location.pathname + location.search); } catch (e) {}

  function whenLoaded(fn) {
    if (document.readyState === 'complete') setTimeout(fn, 400);
    else window.addEventListener('load', function () { setTimeout(fn, 400); });
  }

  function pad(n) { return (n < 10 ? '0' : '') + n; }

  whenLoaded(function () { fill(0); });

  function fill(tries) {
    var $ = window.jQuery;
    if (!$ || !document.getElementById('amicobus__nome')) {
      if (tries < 40) { setTimeout(function () { fill(tries + 1); }, 250); return; }
      banner(false);
      return;
    }

    function setText(sel, value) {
      if (value === undefined || value === null || value === '') return;
      var $el = $(sel);
      if (!$el.length) return;
      $el.val(value).trigger('input').trigger('change');
      $el.siblings('label').addClass('active');
    }

    function setRadio(name, value) {
      if (!value) return;
      var el = document.querySelector('input[name="' + name + '"][value="' + value + '"]');
      if (!el) return;
      el.checked = true;
      $(el).trigger('change');
    }

    function setDate(iso) {
      if (!iso) return;
      var p = iso.split('-');
      var y = +p[0], m = +p[1], d = +p[2];
      var $d = $('#amicobus__data');
      var picker = null;
      try { picker = $d.pickadate ? $d.pickadate('picker') : null; } catch (e) { picker = null; }
      if (picker && picker.set) {
        try { picker.set('select', [y, m - 1, d]); } catch (e) {}
      }
      if (!$d.val()) $d.val(pad(d) + '/' + pad(m) + '/' + y).trigger('change');
      $d.siblings('label').addClass('active');
    }

    setText('#amicobus__nome', data.n);
    setText('#amicobus__cognome', data.c);
    setText('#amicobus__telefono', data.t);
    setText('#amicobus__email', data.e);
    setDate(data.d);
    setRadio('sedia_rotelle', data.acc);
    setRadio('tipo_viaggio', data.tipo);

    if (data.a) {
      setText('#amicobus__a_partenza_da', data.a.p);
      setText('#amicobus__a_partenza_da_citta', data.a.pc);
      setText('#amicobus__a_arrivo_a', data.a.a);
      setText('#amicobus__a_arrivo_a_citta', data.a.ac);
      setText('#amicobus__a_partenza_orario', data.a.o);
    }
    if (data.tipo === 'andataritorno' && data.r) {
      setText('#amicobus__r_partenza_da', data.r.p);
      setText('#amicobus__r_partenza_da_citta', data.r.pc);
      setText('#amicobus__r_arrivo_a', data.r.a);
      setText('#amicobus__r_arrivo_a_citta', data.r.ac);
      setText('#amicobus__r_partenza_orario', data.r.o);
    }

    banner(true);
  }

  function banner(ok) {
    var style = document.createElement('style');
    style.textContent = [
      '#amb-banner{position:fixed;left:0;right:0;bottom:0;z-index:2147483647;background:#13232E;color:#fff;',
      'font:18px/1.4 system-ui,sans-serif;padding:16px 16px calc(16px + env(safe-area-inset-bottom,0px));',
      'box-shadow:0 -4px 20px rgba(0,0,0,.35)}',
      '#amb-banner h2{font-size:22px;margin:0 0 8px;color:#fff}',
      '#amb-banner ol{margin:0 0 12px;padding-left:28px}',
      '#amb-banner li{margin:4px 0}',
      '#amb-banner .amb-sum{background:rgba(255,255,255,.1);border-radius:8px;padding:8px 12px;margin:0 0 12px;font-size:16px}',
      '#amb-banner button{font:inherit;font-weight:700;border:0;border-radius:12px;padding:12px 18px;margin-right:8px;cursor:pointer}',
      '#amb-go{background:#F2B705;color:#13232E}',
      '#amb-hide{background:transparent;color:#fff;border:2px solid #fff !important}',
      'body{padding-bottom:320px !important}',
      '.amb-target{outline:6px solid #F2B705 !important;outline-offset:6px;border-radius:6px}'
    ].join('');
    document.head.appendChild(style);

    var box = document.createElement('div');
    box.id = 'amb-banner';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Aiuto prenotazione Amicobus');

    if (!ok) {
      box.innerHTML = '<h2>Non sono riuscito a compilare il modulo</h2>' +
        '<p>La pagina di CTM forse è cambiata. Prenota al telefono: <strong>800 259 745</strong>.</p>' +
        '<button id="amb-hide" type="button">Chiudi</button>';
    } else {
      box.innerHTML = '<h2>✅ Ho scritto io tutti i dati</h2>' +
        (data.s ? '<div class="amb-sum"></div>' : '') +
        '<ol><li>Tocca la casella <strong>☐ Non sono un robot</strong></li>' +
        '<li>Poi tocca il tasto blu <strong>PRENOTA</strong></li></ol>' +
        '<button id="amb-go" type="button">Portami alla casella</button>' +
        '<button id="amb-hide" type="button">Nascondi</button>';
      if (data.s) box.querySelector('.amb-sum').textContent = data.s;
    }
    document.body.appendChild(box);

    var captcha = document.querySelector('.g-recaptcha');
    var prenota = document.querySelector('button.prenota');
    if (captcha) captcha.classList.add('amb-target');
    if (prenota) prenota.classList.add('amb-target');

    function goToCaptcha() {
      if (captcha) captcha.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    var go = document.getElementById('amb-go');
    if (go) go.addEventListener('click', goToCaptcha);
    document.getElementById('amb-hide').addEventListener('click', function () { box.remove(); });
    if (ok) setTimeout(goToCaptcha, 600);
  }
})();
