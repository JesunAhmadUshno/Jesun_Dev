// Actions and easter eggs shared by palette and terminal. Copyright Jesun Ahmad Ushno. All rights reserved.
import { toast, copyText, store, href } from './core.js';
import data from '../data/jesun.json';

export function runEgg(name, out) {
  const say = out || (t => toast(t));
  const H = document.documentElement;
  switch (name) {
    case 'replay':
      if (window.__replayBoot) { window.__replayBoot(); return; }
      store.set('jesun.boot', '0');
      location.href = href('/') + '#boot';
      return;
    case 'grid': {
      const on = H.classList.toggle('grid-on');
      store.set('jesun.grid', on ? '1' : '0');
      say(on ? 'Grid overlay on. 12 columns, 24px gutter.' : 'Grid overlay off.');
      return;
    }
    case 'konami':
      H.classList.add('grid-on');
      say('Access level raised. The blueprint is showing.');
      return;
    case 'email':
      copyText(data.site.email).then(ok => say(ok ? 'Copied: ' + data.site.email : data.site.email));
      return;
    case 'rollcall': {
      const seats = data.fleet.departments.reduce((n, d) => n + d.seats.length, 0);
      say('Roll call: ' + seats + ' seats present. Foreman: Jesun. All stations green.');
      return;
    }
    case 'coffee':
      say('Brewing. The foreman thinks in fleets, but runs on coffee.');
      return;
    case 'sign':
      say('Signed: Jesun Ahmad Ushno. Build ' + (window.__FP || 'dev') + '.');
      return;
    default:
      say('Unknown command.');
  }
}
