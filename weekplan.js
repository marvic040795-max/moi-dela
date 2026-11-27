/* «План недели» — сетка Пн–Пт: плитки = задачи с plan_start/est_minutes (те же поля, что у «Дня по часам»), рядом полоска факта из журнала.
   Грузится лениво (как «Здоровье»). Отдельного хранилища нет: сдвиг плитки меняет саму задачу. Черновик v1. */
window.WKP_INIT = function (X) {
  const { S, ic, esc, mtopHTML, upd, addTask, isoAt, dayOf, minOf, wkMon, todayISO, addDays, parseISO, pad2, acts, toast, render } = X;
  const W = { mon: null, day: null, sel: null, inl: null, drag: null, q: "", lo: 8, hi: 18 };
  const HP = 56, PM = HP / 60, STEP = 15;
  const PAL = ["#2a78d6", "#eb6834", "#199e70", "#9085e9", "#c98500", "#e07a9d", "#3bb0c6", "#8a9a2b", "#b4533c", "#5c6bc0"];
  const DN = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"], DS = ["Пн", "Вт", "Ср", "Чт", "Пт"];
  const MON = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
  const viewOn = () => X.view() === "wkplan";
  const narrow = () => window.innerWidth < 760;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const snap = m => Math.round(m / STEP) * STEP;
  const hh = m => { m = Math.round(m); return Math.floor(m / 60) + ":" + pad2(m % 60); };
  const fh = m => { const h = m / 60; return (Math.round(h * 10) / 10).toString().replace(".", ",") + " ч"; };
  const hash = s => { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; };
  const colorOf = t => PAL[hash(String(t.list_id || "—")) % PAL.length];
  const startMon = () => { const t = todayISO(), d = parseISO(t).getDay(); const m = wkMon(t); return d === 0 || d === 6 ? addDays(m, 7) : m; };
  const days = () => [0, 1, 2, 3, 4].map(i => addDays(W.mon, i));
  const curDay = () => { const ds = days(); if (W.day && ds.indexOf(W.day) >= 0) return W.day; const t = todayISO(); return ds.indexOf(t) >= 0 ? t : ds[0]; };

  /* --- данные недели --- */
  function planOf(day) { const r = []; for (const id in S.tasks) { const t = S.tasks[id]; if (t.plan_start && dayOf(t.plan_start) === day) { const s = minOf(t.plan_start), d = t.est_minutes || 30; r.push({ t, s, e: Math.min(s + d, 1440), d }); } } return r.sort((a, b) => a.s - b.s); }
  function factOf(day) { const r = []; for (const id in S.time_log) { const l = S.time_log[id]; if (!l.start_at || dayOf(l.start_at) !== day) continue; const s = minOf(l.start_at), d = Math.max(5, Math.round((Date.parse(l.end_at) - Date.parse(l.start_at)) / 60000) || 5); r.push({ l, s, e: Math.min(s + d, 1440), d }); } return r.sort((a, b) => a.s - b.s); }
  function lanes(items) {
    const res = new Map(); let cl = [], ce = -1, ends = [];
    const flush = () => { if (!cl.length) return; const n = Math.max(...cl.map(x => x.l)) + 1; cl.forEach(x => res.set(x.t.id, { l: x.l, n })); cl = []; ce = -1; ends = []; };
    items.slice().sort((a, b) => a.s - b.s || b.e - a.e).forEach(it => { if (cl.length && it.s >= ce) flush(); let l = ends.findIndex(e => e <= it.s); if (l < 0) { l = ends.length; ends.push(0); } ends[l] = it.e; cl.push({ t: it.t, l }); ce = Math.max(ce, it.e); });
    flush(); return res;
  }
  function panelItems() {
    const q = W.q.trim().toLowerCase(), end = addDays(W.mon, 6), out = [];
    for (const id in S.tasks) { const t = S.tasks[id]; if (t.done || t.plan_start || t.parent_id || t.status === "someday") continue;
      if (q) { if ((t.title || "").toLowerCase().indexOf(q) < 0) continue; } else if (!t.due || t.due > end) continue;
      out.push(t); }
    out.sort((a, b) => (a.due || "9") < (b.due || "9") ? -1 : (a.due || "9") > (b.due || "9") ? 1 : 0);
    return out.slice(0, 60);
  }

  /* --- рендер --- */
  const css = '<style>.wp{display:flex;gap:12px;padding:6px 14px 20px;align-items:flex-start}.wp-main{flex:1;min-width:0}.wp-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:4px 0 10px}.wp-bar .lbl{font-weight:600;min-width:150px;text-align:center}.wp-bar .sp{flex:1}'
    + '.wp-b{font:inherit;font-size:calc(13px*var(--z,1));padding:6px 12px;border:1px solid var(--ln);border-radius:16px;background:var(--card);color:var(--tx);cursor:pointer}.wp-b:hover{border-color:var(--acc)}'
    + '.wp-kpi{display:flex;gap:16px;flex-wrap:wrap;color:var(--sub);font-size:calc(13px*var(--z,1));margin:0 0 8px}.wp-kpi b{color:var(--tx)}'
    + '.wp-grid{background:var(--card);border:1px solid var(--ln);border-radius:12px;overflow:hidden}.wp-head,.wp-body{display:flex}.wp-head{border-bottom:1px solid var(--ln)}'
    + '.wp-gut{width:38px;flex:none;position:relative}.wp-gut i{position:absolute;right:5px;font-style:normal;font-size:11px;color:var(--sub);transform:translateY(-6px)}'
    + '.wp-h{flex:1;min-width:0;padding:7px 8px;border-left:1px solid var(--ln);font-size:calc(13px*var(--z,1))}.wp-h.today b{color:var(--acc)}.wp-h em{display:block;font-style:normal;color:var(--sub);font-size:calc(11.5px*var(--z,1))}'
    + '.wp-col{flex:1;min-width:0;position:relative;border-left:1px solid var(--ln);cursor:cell;background-image:linear-gradient(var(--ln) 1px,transparent 1px);background-size:100% ' + HP + 'px}.wp-col.today{background-color:rgba(0,120,212,.04)}'
    + '.wp-pa{position:absolute;left:0;right:30%;top:0;bottom:0}.wp-fl{position:absolute;right:0;width:28%;top:0;bottom:0;border-left:1px dashed var(--ln)}'
    + '.wp-t{position:absolute;box-sizing:border-box;border-radius:7px;padding:3px 6px;background:color-mix(in srgb,var(--c) 18%,var(--card));border-left:4px solid var(--c);overflow:hidden;font-size:calc(12px*var(--z,1));line-height:1.25;cursor:grab;touch-action:none;user-select:none}'
    + '.wp-t b{font-weight:600;display:block;overflow:hidden;text-overflow:ellipsis}.wp-t span{color:var(--sub);font-size:calc(11px*var(--z,1))}.wp-t.sel{outline:2px solid var(--acc);z-index:3}.wp-t.dn{opacity:.55}.wp-t.dn b{text-decoration:line-through}'
    + '.wp-t .wp-x{position:absolute;right:2px;top:1px;width:16px;height:16px;line-height:14px;text-align:center;border-radius:8px;color:var(--sub);display:none;cursor:pointer}.wp-t:hover .wp-x{display:block}.wp-x:hover{background:rgba(0,0,0,.1)}'
    + '.wp-rs{position:absolute;left:0;right:0;bottom:0;height:7px;cursor:ns-resize;touch-action:none}'
    + '.wp-f{position:absolute;left:2px;right:2px;box-sizing:border-box;border-radius:4px;background:color-mix(in srgb,var(--sub) 28%,transparent);font-size:10.5px;color:var(--tx);overflow:hidden;padding:0 3px;min-height:3px}'
    + '.wp-in{width:100%;box-sizing:border-box;font:inherit;border:1px solid var(--acc);border-radius:5px;padding:2px 4px;background:var(--card);color:var(--tx)}'
    + '.wp-now{position:absolute;left:0;right:0;height:2px;background:#e5484d;z-index:4;pointer-events:none}'
    + '.wp-pal{width:250px;flex:none;background:var(--card);border:1px solid var(--ln);border-radius:12px;padding:10px;position:sticky;top:6px}'
    + '.wp-pal input{width:100%;box-sizing:border-box;font:inherit;padding:6px 10px;border:1px solid var(--ln);border-radius:16px;background:var(--bg,var(--card));color:var(--tx);margin-bottom:8px}'
    + '.wp-pl{max-height:60vh;overflow:auto}.wp-pi{display:flex;gap:6px;align-items:center;padding:6px 6px;border-radius:8px;cursor:grab;touch-action:none;user-select:none;font-size:calc(13px*var(--z,1))}.wp-pi:hover{background:rgba(127,127,127,.12)}'
    + '.wp-pi i{width:8px;height:8px;border-radius:50%;flex:none}.wp-pi span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.wp-pi em{font-style:normal;color:var(--sub);font-size:11px;flex:none}.wp-pi em.ov{color:#d13438}'
    + '.wp-hint{color:var(--sub);font-size:calc(11.5px*var(--z,1));margin-top:8px;line-height:1.4}#wp-ghost{position:fixed;z-index:9999;pointer-events:none;background:var(--card);border:1px solid var(--acc);border-radius:8px;padding:4px 9px;font-size:13px;box-shadow:0 4px 14px rgba(0,0,0,.2);max-width:240px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}'
    + '@media(max-width:759px){.wp{flex-direction:column;padding:4px 8px 20px}.wp-main{width:100%}.wp-pal{width:auto;align-self:stretch;position:static}.wp-tabs{display:flex;gap:6px;margin:0 0 8px;overflow:auto}.wp-tabs .wp-b.on{background:var(--acc);color:#fff;border-color:var(--acc)}}</style>';

  function html(vi) {
    if (!W.mon) W.mon = startMon();
    const ds = days(), today = todayISO(), nar = narrow(), cd = curDay(), show = nar ? [cd] : ds;
    const P = {}, F = {}; let pm = 0, fm = 0, lo = 8, hi = 18;
    ds.forEach(d => { P[d] = planOf(d); F[d] = factOf(d); P[d].forEach(x => { lo = Math.min(lo, Math.floor(x.s / 60)); hi = Math.max(hi, Math.ceil(x.e / 60)); pm += x.d; }); F[d].forEach(x => { lo = Math.min(lo, Math.floor(x.s / 60)); hi = Math.max(hi, Math.ceil(x.e / 60)); fm += x.d; }); });
    W.lo = lo; W.hi = clamp(hi, lo + 4, 24); const H = (W.hi - lo) * HP, d0 = parseISO(ds[0]), d4 = parseISO(ds[4]);
    const lbl = d0.getDate() + (d0.getMonth() !== d4.getMonth() ? " " + MON[d0.getMonth()] : "") + " – " + d4.getDate() + " " + MON[d4.getMonth()] + " " + d4.getFullYear();
    const nowM = new Date().getHours() * 60 + new Date().getMinutes();
    let h = css + '<div id="main" class="pane" style="flex:1">' + mtopHTML(vi, 1, "") + '<div class="scroll" id="list"><div class="wp"><div class="wp-main">';
    h += '<div class="wp-bar"><button class="wp-b" data-a="wpprev">‹</button><div class="lbl">' + lbl + '</div><button class="wp-b" data-a="wpnext">›</button><button class="wp-b" data-a="wptoday">Сегодня</button></div>';
    h += '<div class="wp-kpi"><span>В плане <b>' + fh(pm) + '</b></span><span>Факт по журналу <b>' + fh(fm) + '</b></span><span>Задач в плане <b>' + ds.reduce((n, d) => n + P[d].length, 0) + '</b></span></div>';
    if (nar) h += '<div class="wp-tabs">' + ds.map((d, i) => '<button class="wp-b' + (d === cd ? " on" : "") + '" data-a="wpday" data-d="' + d + '">' + DS[i] + " " + parseISO(d).getDate() + "</button>").join("") + "</div>";
    h += '<div class="wp-grid"><div class="wp-head"><div class="wp-gut"></div>';
    show.forEach(d => { const i = ds.indexOf(d), pl = P[d].reduce((s, x) => s + x.d, 0), fa = F[d].reduce((s, x) => s + x.d, 0); h += '<div class="wp-h' + (d === today ? " today" : "") + '"><b>' + DN[i] + "</b> " + parseISO(d).getDate() + "<em>план " + fh(pl) + (d <= today && fa ? " · факт " + fh(fa) : "") + "</em></div>"; });
    h += '</div><div class="wp-body" style="height:' + H + 'px"><div class="wp-gut">';
    for (let k = lo; k <= W.hi; k++) h += '<i style="top:' + (k - lo) * HP + 'px">' + k + ":00</i>";
    h += "</div>";
    show.forEach(d => {
      const pl = P[d], ln = lanes(pl.map(x => ({ t: x.t, s: x.s, e: x.e })));
      h += '<div class="wp-col' + (d === today ? " today" : "") + '" data-d="' + d + '"><div class="wp-pa">';
      pl.forEach(x => {
        const t = x.t, l = ln.get(t.id) || { l: 0, n: 1 }, w = 100 / l.n, top = (x.s - lo * 60) * PM, ht = Math.max(16, x.d * PM - 2);
        const fa = factOf(d).filter(f => f.l.task_id === t.id).reduce((s, f) => s + f.d, 0);
        h += '<div class="wp-t' + (t.done ? " dn" : "") + (W.sel === t.id ? " sel" : "") + '" data-id="' + t.id + '" title="' + esc(t.title || "") + '" style="top:' + top + "px;height:" + ht + "px;left:" + l.l * w + "%;width:calc(" + w + "% - 3px);--c:" + colorOf(t) + '">'
          + (W.inl && W.inl.id === t.id ? '<input class="wp-in" value="' + esc(t.title || "") + '">' : "<b>" + esc(t.title || "(без названия)") + "</b>")
          + (ht > 30 ? "<span>" + hh(x.s) + "–" + hh(x.e) + (fa ? " · факт " + fh(fa) : "") + "</span>" : "") + '<i class="wp-x" data-a="wpunplan" data-id="' + t.id + '" title="Снять с плана">✕</i><i class="wp-rs"></i></div>';
      });
      if (W.inl && W.inl.d === d) h += '<div class="wp-t new" style="top:' + (W.inl.m - lo * 60) * PM + "px;height:" + (60 * PM - 2) + 'px;left:0;width:calc(100% - 3px);--c:#8b919b"><input class="wp-in" placeholder="Название задачи…"></div>';
      h += '</div><div class="wp-fl">';
      F[d].forEach(x => { const top = (x.s - lo * 60) * PM, ht = Math.max(3, x.d * PM - 1); h += '<div class="wp-f" style="top:' + top + "px;height:" + ht + 'px" title="' + esc(hh(x.s) + "–" + hh(x.e) + " " + (x.l.title || "")) + '">' + (ht > 13 ? esc(x.l.title || "") : "") + "</div>"; });
      h += "</div>";
      if (d === today && nowM >= lo * 60 && nowM <= W.hi * 60) h += '<div class="wp-now" style="top:' + (nowM - lo * 60) * PM + 'px"></div>';
      h += "</div>";
    });
    h += "</div></div></div>";   // grid, main
    const pi = panelItems();
    h += '<aside class="wp-pal"><input id="wp-q" type="search" placeholder="Задачи недели · поиск по всем…" value="' + esc(W.q) + '"><div class="wp-pl">'
      + (pi.length ? pi.map(t => { const ov = t.due && t.due < todayISO(); return '<div class="wp-pi" data-id="' + t.id + '"><i style="background:' + colorOf(t) + '"></i><span>' + esc(t.title || "") + "</span><em" + (ov ? ' class="ov"' : "") + ">" + (t.due ? parseISO(t.due).getDate() + " " + MON[parseISO(t.due).getMonth()] : "") + "</em></div>"; }).join("") : '<div style="color:var(--sub);font-size:13px;padding:6px">' + (W.q ? "Ничего не найдено" : "Нет неразмещённых задач со сроком на эту неделю") + "</div>")
      + '</div><div class="wp-hint">Тяни задачу в нужный день и час или кликни — встанет в ближайшее свободное окно. Клик по пустому месту — новая задача на 1 ч. Двойной клик по плитке — переименовать. Края — длительность. Del — снять с плана.</div></aside>';
    h += '</div></div></div><div id="wp-ghost" hidden></div>';
    if (W.inl) setTimeout(() => { const e = document.querySelector(".wp-in"); if (e && document.activeElement !== e) { e.focus(); e.select(); } }, 30);
    return h;
  }

  /* --- действия --- */
  const go = mon => { W.mon = mon; W.inl = null; W.sel = null; render(); };
  Object.assign(acts, {
    wpprev() { go(addDays(W.mon, -7)); }, wpnext() { go(addDays(W.mon, 7)); }, wptoday() { go(startMon()); },
    wpday(a) { W.day = a.dataset.d; render(); },
    wpunplan(a, e) { if (e && e.stopPropagation) e.stopPropagation(); upd(a.dataset.id, { plan_start: null }); W.sel = null; render(); }
  });

  function place(id, day, m, dur) { const t = S.tasks[id]; if (!t) return; upd(id, { plan_start: isoAt(day, clamp(m, 0, 1440 - STEP)), est_minutes: dur || t.est_minutes || 60 }); W.sel = id; W.day = day; render(); }
  function quick(id) {
    const t = S.tasks[id]; if (!t) return; const day = curDay(), dur = t.est_minutes || 60, pl = planOf(day), now = new Date();
    let from = W.lo * 60; if (day === todayISO()) from = Math.max(from, Math.ceil((now.getHours() * 60 + now.getMinutes()) / STEP) * STEP);
    for (let s = from; s + dur <= Math.max(W.hi * 60, 18 * 60); s += STEP) { if (!pl.some(x => x.s < s + dur && s < x.e)) { place(id, day, s, dur); toast(DS[days().indexOf(day)] + " " + hh(s) + "–" + hh(s + dur)); return; } }
    toast("В этот день нет свободного окна на " + fh(dur));
  }
  function inlCommit() {
    const i = W.inl; if (!i) return; const e = document.querySelector(".wp-in"), v = e ? e.value.trim() : ""; W.inl = null;
    if (i.id) { if (v) upd(i.id, { title: v }); }
    else if (v) { const t = addTask({ title: v, due: i.d, plan_start: isoAt(i.d, i.m), est_minutes: 60 }); W.sel = t.id; }
    render();
  }
  const inlCancel = () => { W.inl = null; render(); };

  /* --- мышь / касание (подписка один раз; DOM на лету, в данные пишем при отпускании) --- */
  const colAt = x => [...document.querySelectorAll(".wp-col")].find(c => { const r = c.getBoundingClientRect(); return x >= r.left && x < r.right; });
  const minAt = (col, y) => W.lo * 60 + (y - col.getBoundingClientRect().top) / PM;
  document.addEventListener("pointerdown", ev => {
    if (!viewOn() || ev.button) return;
    if (ev.target.closest(".wp-in")) return;
    if (W.inl) { inlCommit(); return; }
    if (ev.target.closest(".wp-x")) return;
    const pi = ev.target.closest(".wp-pi"), te = ev.target.closest(".wp-t"), col = ev.target.closest(".wp-col");
    if (pi) { W.drag = { mode: "pal", id: pi.dataset.id, sx: ev.clientX, sy: ev.clientY, moved: false }; ev.preventDefault(); return; }
    if (te && col) { const t = S.tasks[te.dataset.id]; if (!t) return; const m = minAt(col, ev.clientY), s = minOf(t.plan_start), dur = t.est_minutes || 30;
      document.querySelectorAll(".wp-t.sel").forEach(x => x.classList.remove("sel")); te.classList.add("sel"); W.sel = t.id; W.day = col.dataset.d;
      W.drag = { mode: ev.target.classList.contains("wp-rs") ? "rz" : "mv", id: t.id, el: te, col, day: col.dataset.d, s, dur, off: m - s, sx: ev.clientX, sy: ev.clientY, moved: false, nd: col.dataset.d, nm: s, ndur: dur }; ev.preventDefault(); return; }
    if (col && !ev.target.closest(".wp-fl")) { const m = clamp(Math.floor(minAt(col, ev.clientY) / STEP) * STEP, W.lo * 60, W.hi * 60 - STEP); W.day = col.dataset.d; W.sel = null; W.drag = { mode: "new", d: col.dataset.d, m, sx: ev.clientX, sy: ev.clientY, moved: false }; ev.preventDefault(); }
  });
  window.addEventListener("pointermove", ev => {
    const g = W.drag; if (!g) return;
    if (!g.moved) { if (Math.hypot(ev.clientX - g.sx, ev.clientY - g.sy) < 4) return; g.moved = true; }
    if (g.mode === "pal") { const gh = document.getElementById("wp-ghost"); if (gh) { gh.hidden = false; gh.textContent = (S.tasks[g.id] || {}).title || ""; gh.style.left = ev.clientX + 14 + "px"; gh.style.top = ev.clientY + 10 + "px"; } return; }
    if (g.mode === "mv") { const c = colAt(ev.clientX) || g.col, lo = W.lo * 60, hi = W.hi * 60; g.nd = c.dataset.d; g.nm = clamp(snap(minAt(c, ev.clientY) - g.off), lo, Math.max(lo, hi - g.dur));
      const pa = c.querySelector(".wp-pa"); if (g.el.parentNode !== pa) pa.appendChild(g.el); g.el.style.top = (g.nm - lo) * PM + "px"; g.el.style.left = "0"; g.el.style.width = "calc(100% - 3px)"; }
    else if (g.mode === "rz") { g.ndur = clamp(snap(minAt(g.col, ev.clientY) - g.s), STEP, W.hi * 60 - g.s); g.el.style.height = Math.max(16, g.ndur * PM - 2) + "px"; }
  });
  window.addEventListener("pointerup", ev => {
    const g = W.drag; if (!g) return; W.drag = null;
    const gh = document.getElementById("wp-ghost"); if (gh) gh.hidden = true;
    if (g.mode === "pal") { if (!g.moved) { quick(g.id); return; } const c = colAt(ev.clientX); const r = document.querySelector(".wp-body"); if (c && r) { const rb = r.getBoundingClientRect(); if (ev.clientY >= rb.top && ev.clientY <= rb.bottom) { const dur = (S.tasks[g.id] || {}).est_minutes || 60; place(g.id, c.dataset.d, clamp(snap(minAt(c, ev.clientY) - dur / 2), W.lo * 60, Math.max(W.lo * 60, W.hi * 60 - dur)), dur); } } return; }
    if (g.mode === "mv") { if (g.moved && (g.nd !== g.day || g.nm !== g.s)) { upd(g.id, { plan_start: isoAt(g.nd, g.nm) }); W.day = g.nd; render(); } else if (g.moved) render(); return; }
    if (g.mode === "rz") { if (g.moved && g.ndur !== g.dur) { upd(g.id, { est_minutes: g.ndur }); render(); } else if (g.moved) render(); return; }
    if (g.mode === "new") { W.inl = { d: g.d, m: g.m }; render(); }
  });
  document.addEventListener("dblclick", ev => { if (!viewOn()) return; const te = ev.target.closest(".wp-t"); if (te && !te.classList.contains("new") && !ev.target.closest(".wp-in")) { W.inl = { id: te.dataset.id }; render(); } });
  window.addEventListener("keydown", ev => {
    if (!viewOn()) return;
    if (ev.target.classList && ev.target.classList.contains("wp-in")) { if (ev.key === "Enter") { ev.preventDefault(); inlCommit(); } else if (ev.key === "Escape") { ev.preventDefault(); inlCancel(); } return; }
    if (/INPUT|TEXTAREA|SELECT/.test(ev.target.tagName)) return;
    if ((ev.key === "Delete" || ev.key === "Backspace") && W.sel && S.tasks[W.sel] && S.tasks[W.sel].plan_start) { ev.preventDefault(); ev.stopImmediatePropagation(); upd(W.sel, { plan_start: null }); W.sel = null; render(); }
  }, true);   // window + захват: общий hkKey (document, захват) иначе перехватывает Del раньше
  document.addEventListener("focusout", ev => { if (viewOn() && ev.target.classList && ev.target.classList.contains("wp-in")) setTimeout(() => { if (W.inl && document.activeElement !== document.querySelector(".wp-in")) inlCommit(); }, 0); });
  document.addEventListener("input", ev => {
    if (!viewOn() || ev.target.id !== "wp-q") return; W.q = ev.target.value; render();
    const q = document.getElementById("wp-q"); if (q) { q.focus(); q.setSelectionRange(q.value.length, q.value.length); }
  });
  return { html };
};
