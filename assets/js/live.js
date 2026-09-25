/* Live data: GitHub stats, ship log, Medium writing. All graceful on failure. */
(function () {
  'use strict';

  function relDate(iso) {
    var d = new Date(iso), now = new Date();
    var s = Math.floor((now - d) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    var days = Math.floor(s / 86400);
    if (days < 30) return days + 'd ago';
    return d.toISOString().slice(0, 10);
  }

  /* ---- GitHub stats ---- */
  var statsEl = document.getElementById('gh-stats');
  if (statsEl) {
    fetch('https://api.github.com/users/JesunAhmadUshno').then(function (r) {
      if (!r.ok) throw new Error('gh api ' + r.status);
      return r.json();
    }).then(function (u) {
      statsEl.innerHTML = [
        ['Public repos', u.public_repos],
        ['Followers', u.followers],
        ['Following', u.following],
        ['Gists', u.public_gists]
      ].map(function (s) {
        return '<div class="stat"><div class="stat-num">' + s[1] + '</div>' +
               '<div class="stat-label">' + s[0] + ' (live)</div></div>';
      }).join('');
    }).catch(function () {
      statsEl.innerHTML = '<p class="mono muted">GitHub stats are offline right now. The numbers above are cached highlights.</p>';
    });
  }

  /* ---- Ship log: latest public pushes ---- */
  var shipEl = document.getElementById('ship-log');
  if (shipEl) {
    fetch('https://api.github.com/users/JesunAhmadUshno/events/public?per_page=30').then(function (r) {
      if (!r.ok) throw new Error('gh api ' + r.status);
      return r.json();
    }).then(function (events) {
      var pushes = events.filter(function (e) { return e.type === 'PushEvent'; }).slice(0, 8);
      if (!pushes.length) throw new Error('no pushes');
      shipEl.innerHTML = pushes.map(function (p) {
        var repo = String(p.repo.name).split('/')[1];
        var ref = String(p.payload.ref || '').split('/').pop();
        var n = (p.payload.commits || []).length;
        return '<div class="ship-row">' +
          '<span class="mono ship-repo">' + repo + '</span>' +
          '<span class="ship-meta">' + n + ' commit' + (n === 1 ? '' : 's') + ' to ' + ref + '</span>' +
          '<span class="mono ship-date">' + relDate(p.created_at) + '</span></div>';
      }).join('');
    }).catch(function () {
      shipEl.innerHTML = '<p class="mono muted">Ship log is offline right now. Recent work: Jesun_Dev redesign, Jesun.Code v0.6.0.</p>';
    });
  }

  /* ---- Writing: Medium RSS via rss2json ---- */
  var medEl = document.getElementById('medium-posts');
  if (medEl) {
    var rss = encodeURIComponent('https://medium.com/feed/@jesunahmadushno');
    fetch('https://api.rss2json.com/v1/api.json?rss_url=' + rss).then(function (r) {
      if (!r.ok) throw new Error('rss ' + r.status);
      return r.json();
    }).then(function (d) {
      var items = (d.items || []).slice(0, 6);
      if (!items.length) throw new Error('no posts');
      medEl.innerHTML = items.map(function (it) {
        var desc = String(it.description || '').replace(/<[^>]+>/g, '').slice(0, 160);
        return '<a class="glass post reveal in" href="' + it.link + '" target="_blank" rel="noopener">' +
          '<div class="mono post-date">' + new Date(it.pubDate).toISOString().slice(0, 10) + '</div>' +
          '<h3>' + it.title + '</h3><p>' + desc + '...</p>' +
          '<span class="read-more">Read on Medium</span></a>';
      }).join('');
    }).catch(function () {
      medEl.innerHTML = '<a class="glass post" href="https://medium.com/@jesunahmadushno" target="_blank" rel="noopener">' +
        '<div class="mono post-date">2025-11-12</div>' +
        '<h3>Beyond the Firewall: How Data-Driven Six Sigma is Quietly Solving the Multi-Billion Dollar Problem</h3>' +
        '<p>On Medium at @jesunahmadushno. The live feed could not load, but the essays are there.</p>' +
        '<span class="read-more">Read on Medium</span></a>';
    });
  }
})();
