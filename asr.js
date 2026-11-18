/* В«Р Р°СЃС€РёС„СЂРѕРІРєР°В» вЂ” Р·Р°РїРёСЃСЊ СЃРѕРІРµС‰Р°РЅРёСЏ в†’ С‚РµРєСЃС‚ РїСЂСЏРјРѕ РІ Р±СЂР°СѓР·РµСЂРµ (GigaAM v3 RNNT РЅР° onnxruntime-web). Р—РІСѓРє РЅРµ СѓС…РѕРґРёС‚ СЃ РєРѕРјРїСЊСЋС‚РµСЂР°.
   Р“СЂСѓР·РёС‚СЃСЏ Р»РµРЅРёРІРѕ (РєР°Рє В«Р—РґРѕСЂРѕРІСЊРµВ»). РўСЏР¶С‘Р»Р°СЏ С‡Р°СЃС‚СЊ вЂ” РІРѕСЂРєРµСЂС‹ asr/asr-worker.js; РјРѕРґРµР»СЊ (в‰€225 РњР‘) С…СЂР°РЅРёС‚СЃСЏ РІ Cache Storage В«moidela-asrВ». */
window.ASR_INIT = function (X) {
  const { ic, esc, $, render, toast, mtopHTML, acts } = X;
  const V = 2;                                                   // РІРµСЂСЃРёСЏ Р±РёР±Р»РёРѕС‚РµРє РІ asr/ (РїРѕРґРЅРёРјР°С‚СЊ РїСЂРё РёС… Р·Р°РјРµРЅРµ вЂ” СЃР±СЂР°СЃС‹РІР°РµС‚ РєСЌС€)
  const BASE = new URL("asr/", location.href).href, KEY = new URL("asr-model/encoder.int8.onnx", location.href).href, MSIZE = 224570820,
    OLD = new URL("asr-model/model.int8.onnx", location.href).href;   // РїСЂРµР¶РЅСЏСЏ CTC-РјРѕРґРµР»СЊ: СѓРґР°Р»СЏРµРј, С‡С‚РѕР±С‹ РЅРµ Р·Р°РЅРёРјР°Р»Р° 225 РњР‘
  const HF = "https://huggingface.co/csukuangfj/sherpa-onnx-nemo-transducer-punct-giga-am-v3-russian-2025-12-16/resolve/main/encoder.int8.onnx";
  const REL = "https://github.com/marvic040795-max/moi-dela/releases/download/asr/encoder.int8.onnx";
  const LS = { hist: "mytasks_asr_hist", dict: "mytasks_asr_dict", thr: "mytasks_asr_thr" };
  const jg = (k, d) => { try { const v = JSON.parse(localStorage.getItem(k)); return v == null ? d : v; } catch (e) { return d; } };
  const js = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { toast("РќРµ С…РІР°С‚РёР»Рѕ РјРµСЃС‚Р° РІ Р±СЂР°СѓР·РµСЂРµ вЂ” СЃС‚Р°СЂС‹Рµ СЂР°СЃС€РёС„СЂРѕРІРєРё Р»СѓС‡С€Рµ СѓРґР°Р»РёС‚СЊ"); } };
  const cores = navigator.hardwareConcurrency || 4, mem = navigator.deviceMemory || 4;
  const autoThr = Math.max(1, Math.min(mem >= 8 ? 3 : 2, Math.floor(cores / 3)));
  const A0 = { model: "unk", pct: 0, msg: "", job: null, hist: jg(LS.hist, []), cur: null, dict: jg(LS.dict, ""), dictOpen: false, thr: jg(LS.thr, 0) || autoThr, busy: false };
  const hms = s => { s = Math.floor(s); const p = n => String(n).padStart(2, "0"); return p(Math.floor(s / 3600)) + ":" + p(Math.floor(s / 60) % 60) + ":" + p(s % 60); };
  const dur = s => s < 90 ? Math.round(s) + " СЃ" : s < 5400 ? Math.round(s / 60) + " РјРёРЅ" : (s / 3600).toFixed(1).replace(".", ",") + " С‡";
  const mb = n => Math.round(n / 1e6);
  const isMob = () => /Android|iPhone|iPad/i.test(navigator.userAgent);

  const css = document.createElement("style");
  css.textContent = ".asr{max-width:860px;margin:0 auto;padding:18px 18px 70px}.asr h1{font-size:1.5em;margin:0 0 2px}.asr .sub{color:var(--sub);font-size:.9em;margin-bottom:16px}" +
    ".asr .cardx{background:var(--card);border:1px solid var(--ln);border-radius:14px;padding:16px;margin-bottom:14px}.asr .drop{border:2px dashed var(--ln);border-radius:14px;padding:26px 16px;text-align:center;color:var(--sub);cursor:pointer}" +
    ".asr .drop:hover{border-color:var(--acc);color:var(--tx)}.asr .bar{height:8px;border-radius:5px;background:var(--hov);overflow:hidden;margin:10px 0 6px}.asr .bar i{display:block;height:100%;width:0;background:var(--acc);transition:width .4s}" +
    ".asr .row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.asr .btnx{font:inherit;padding:7px 13px;border-radius:18px;border:1px solid var(--ln);background:var(--card);color:var(--tx);cursor:pointer}.asr .btnx:hover{background:var(--hov)}" +
    ".asr .btnx.p{background:var(--acc);border-color:var(--acc);color:#fff}.asr .txt{white-space:pre-wrap;line-height:1.55;font-size:.95em;max-height:58vh;overflow:auto;user-select:text;padding:4px 2px}.asr .txt b{color:var(--sub);font-weight:500;font-variant-numeric:tabular-nums}" +
    ".asr .hi{display:flex;gap:8px;align-items:center;padding:8px 6px;border-radius:9px;cursor:pointer}.asr .hi:hover{background:var(--hov)}.asr .hi span.n{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}" +
    ".asr .mut{color:var(--sub);font-size:.85em}.asr textarea{width:100%;min-height:90px;font:inherit;font-size:.9em;border:1px solid var(--ln);border-radius:10px;padding:8px;background:var(--card);color:var(--tx);box-sizing:border-box}";
  document.head.appendChild(css);

  /* ---------- РјРѕРґРµР»СЊ ---------- */
  async function checkModel() { try { const c = await caches.open("moidela-asr"); try { await c.delete(OLD); } catch (e) {} A0.model = (await c.match(KEY)) ? "ok" : "no"; } catch (e) { A0.model = "no"; A0.msg = "Р‘СЂР°СѓР·РµСЂ РЅРµ РґР°С‘С‚ С…СЂР°РЅРёС‚СЊ Р±РѕР»СЊС€РёРµ С„Р°Р№Р»С‹ (СЂРµР¶РёРј РёРЅРєРѕРіРЅРёС‚Рѕ?)"; } render(); }
  async function putModel(blob) { const c = await caches.open("moidela-asr"); await c.put(KEY, new Response(blob, { headers: { "Content-Type": "application/octet-stream" } })); A0.model = "ok"; A0.msg = ""; render(); toast("РњРѕРґРµР»СЊ РіРѕС‚РѕРІР° вЂ” РјРѕР¶РЅРѕ СЂР°СЃС€РёС„СЂРѕРІС‹РІР°С‚СЊ"); }
  async function download() {
    if (A0.model === "dl") return; A0.model = "dl"; A0.pct = 0; A0.msg = "РџРѕРґРєР»СЋС‡Р°СЋСЃСЊвЂ¦"; render();
    const errs = [];
    for (const url of [KEY, HF]) {
      try {
        const r = await fetch(url); if (!r.ok) throw new Error("HTTP " + r.status);
        const total = +r.headers.get("content-length") || MSIZE, rd = r.body.getReader(), parts = []; let got = 0, last = 0;
        for (;;) { const { done, value } = await rd.read(); if (done) break; parts.push(value); got += value.length; if (Date.now() - last > 400) { last = Date.now(); A0.pct = got / total; A0.msg = "РЎРєР°С‡Р°РЅРѕ " + mb(got) + " РёР· " + mb(total) + " РњР‘"; barUpd(); } }
        if (got < MSIZE * 0.98) throw new Error("С„Р°Р№Р» РЅРµРїРѕР»РЅС‹Р№ (" + mb(got) + " РњР‘)");
        return await putModel(new Blob(parts));
      } catch (e) { errs.push((url === KEY ? "СЃ СЃР°Р№С‚Р°" : "СЃ Hugging Face") + ": " + (e.message || e)); }
    }
    A0.model = "no"; A0.msg = "РќРµ СЃРєР°С‡Р°Р»РѕСЃСЊ Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё (" + errs.join("; ") + "). РЎРєР°С‡Р°Р№ С„Р°Р№Р» РІСЂСѓС‡РЅСѓСЋ РїРѕ СЃСЃС‹Р»РєРµ РЅРёР¶Рµ Рё РІС‹Р±РµСЂРё РµРіРѕ Р·РґРµСЃСЊ."; render();
  }
  async function modelFile(f) {
    if (!f) return; if (Math.abs(f.size - MSIZE) > 2e6) { A0.msg = "Р­С‚Рѕ РЅРµ С‚РѕС‚ С„Р°Р№Р»: РЅСѓР¶РµРЅ encoder.int8.onnx СЂР°Р·РјРµСЂРѕРј РѕРєРѕР»Рѕ " + mb(MSIZE) + " РњР‘ (Сѓ РІС‹Р±СЂР°РЅРЅРѕРіРѕ " + mb(f.size) + " РњР‘)."; render(); return; }
    try { await putModel(f); } catch (e) { A0.msg = "РќРµ СѓРґР°Р»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ: " + (e.message || e); render(); }
  }

  /* ---------- Р·РІСѓРє ---------- */
  async function decode(file) {
    const ab = await file.arrayBuffer(), AC = window.AudioContext || window.webkitAudioContext, ac = new AC({ sampleRate: 16000 });
    let buf; try { buf = await ac.decodeAudioData(ab); } finally { try { ac.close(); } catch (e) {} }
    const ch = buf.numberOfChannels, n = buf.length, out = new Float32Array(n);
    for (let c = 0; c < ch; c++) { const d = buf.getChannelData(c); for (let i = 0; i < n; i++) out[i] += d[i] / ch; }
    return out;
  }
  function splitPoints(pcm, N) {   // N РєСѓСЃРєРѕРІ, РіСЂР°РЅРёС†С‹ вЂ” РІ СЃР°РјС‹С… С‚РёС…РёС… РјРµСЃС‚Р°С… (В±20 СЃ РѕС‚ СЂРѕРІРЅРѕР№ РЅР°СЂРµР·РєРё)
    const SR = 16000, pts = [0], F = SR / 4;
    for (let k = 1; k < N; k++) {
      const tg = Math.floor(pcm.length * k / N), a = Math.max(pts[pts.length - 1] + 30 * SR, tg - 20 * SR), b = Math.min(pcm.length - 30 * SR, tg + 20 * SR);
      let best = tg, bv = 1e9; for (let s = a; s + F < b; s += F) { let e = 0; for (let i = s; i < s + F; i += 8) e += pcm[i] * pcm[i]; if (e < bv) { bv = e; best = s + (F >> 1); } }
      pts.push(best);
    }
    pts.push(pcm.length); return pts;
  }
  const dictPairs = () => A0.dict.split("\n").map(l => l.split(/=|в†’|->/)).filter(p => p.length >= 2 && p[0].trim() && p[1].trim()).map(p => [p[0].trim(), p.slice(1).join("=").trim()]);

  /* ---------- Р·Р°РґР°С‡Р° ---------- */
  let wake = null, tick = null;
  function barUpd() {
    const j = A0.job, b = $("asr-bar"), s = $("asr-st"), p = j ? j.pct : A0.pct;
    if (b) b.style.width = Math.round(p * 100) + "%";
    if (s) s.textContent = j ? stText(j) : A0.msg;
  }
  function stText(j) {
    if (j.stage !== "run") return j.msg;
    const el = (Date.now() - j.t0run) / 1000, eta = j.pct > 0.04 ? el / j.pct * (1 - j.pct) : 0;
    return "Р Р°СЃС€РёС„СЂРѕРІРєР° " + Math.round(j.pct * 100) + "%" + (eta ? " В· РѕСЃС‚Р°Р»РѕСЃСЊ РѕРєРѕР»Рѕ " + dur(eta) : "") + " В· Р°Р±Р·Р°С†РµРІ: " + j.lines.length;
  }
  function liveUpd() { const j = A0.job, e = $("asr-live"); if (!j || !e) return; const L = j.lines.slice().sort((a, b) => a.t - b.t); e.innerHTML = L.slice(-400).map(l => "<b>[" + hms(l.t) + "]</b> " + esc(l.text)).join("\n"); e.scrollTop = e.scrollHeight; }
  function finish(j, state) {
    clearInterval(tick); tick = null; try { j.ws.forEach(w => w.terminate()); } catch (e) {} j.ws = []; try { if (wake) wake.release(); } catch (e) {} wake = null;
    const L = j.lines.slice().sort((a, b) => a.t - b.t);
    j.stage = state; j.pct = state === "done" ? 1 : j.pct;
    if (L.length) {
      const it = { id: String(Date.now()), name: j.name, at: new Date().toISOString(), dur: j.dur, partial: state !== "done", text: L.map(l => "[" + hms(l.t) + "] " + l.text).join("\n") };
      A0.hist.unshift(it); A0.hist = A0.hist.slice(0, 15); js(LS.hist, A0.hist); A0.cur = it;
    } else if (state === "done") { j.msg = "Р РµС‡СЊ РЅРµ РЅР°Р№РґРµРЅР° вЂ” РїСЂРѕРІРµСЂСЊ, С‡С‚Рѕ Р·Р°РїРёСЃСЊ РЅРµ РїСѓСЃС‚Р°СЏ Рё Р·РІСѓРє РЅРµ СЃР»РёС€РєРѕРј С‚РёС…РёР№."; j.stage = "err"; }
    if (state === "done" && L.length) { toast("Р Р°СЃС€РёС„СЂРѕРІРєР° РіРѕС‚РѕРІР°: " + j.name); try { new Notification("Р Р°СЃС€РёС„СЂРѕРІРєР° РіРѕС‚РѕРІР°", { body: j.name }); } catch (e) {} }
    A0.job = state === "done" && L.length ? null : j; render();
  }
  async function start(file) {
    if (A0.job && A0.job.stage !== "err") { toast("РЎРµР№С‡Р°СЃ СѓР¶Рµ РёРґС‘С‚ СЂР°СЃС€РёС„СЂРѕРІРєР°"); return; }
    if (A0.model !== "ok") { toast("РЎРЅР°С‡Р°Р»Р° СЃРєР°С‡Р°Р№ РјРѕРґРµР»СЊ"); return; }
    const j = A0.job = { name: file.name, size: file.size, stage: "decode", pct: 0, lines: [], ws: [], msg: "Р§РёС‚Р°СЋ Рё РґРµРєРѕРґРёСЂСѓСЋ Р·РІСѓРєвЂ¦", t0run: 0, dur: 0 }; A0.cur = null; render();
    try { if (navigator.wakeLock) wake = await navigator.wakeLock.request("screen"); } catch (e) {}
    try { if (window.Notification && Notification.permission === "default") Notification.requestPermission(); } catch (e) {}
    let pcm;
    try { pcm = await decode(file); } catch (e) { j.stage = "err"; j.msg = "РќРµ СѓРґР°Р»РѕСЃСЊ РїСЂРѕС‡РёС‚Р°С‚СЊ Р·РІСѓРє: " + (e && e.message || e) + ". Р”Р»СЏ РѕС‡РµРЅСЊ РґР»РёРЅРЅС‹С… Р·Р°РїРёСЃРµР№ РїРѕРїСЂРѕР±СѓР№ С„РѕСЂРјР°С‚ mp3 РёР»Рё СЂР°Р·СЂРµР¶СЊ Р·Р°РїРёСЃСЊ РїРѕРїРѕР»Р°Рј."; try { if (wake) wake.release(); } catch (x) {} render(); return; }
    j.dur = pcm.length / 16000;
    const N = j.dur < 180 ? 1 : A0.thr, pts = splitPoints(pcm, N), parts = [];
    for (let k = 0; k < N; k++) { const sl = pcm.slice(pts[k], pts[k + 1]); parts.push({ off: pts[k] / 16000, pcm: sl, len: sl.length, p: 0 }); }
    pcm = null;
    j.stage = "init"; j.msg = "Р—Р°РїСѓСЃРєР°СЋ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёРµ (" + N + " " + (N === 1 ? "РїРѕС‚РѕРє" : "РїРѕС‚РѕРєР°") + "), Р·Р°РіСЂСѓР¶Р°СЋ РјРѕРґРµР»СЊвЂ¦"; j.parts = parts; render();
    const extra = dictPairs(); let ready = 0, ended = 0, failed = false;
    parts.forEach((pt, k) => {
      const w = new Worker(BASE + "asr-worker.js?v=" + V); j.ws.push(w);
      w.onmessage = e => {
        const m = e.data;
        if (m.type === "ready") {
          pt.ready = true; if (++ready === N) { j.stage = "run"; j.t0run = Date.now(); render(); tick = setInterval(() => { j.pct = parts.reduce((s, q) => s + q.p * q.len, 0) / parts.reduce((s, q) => s + q.len, 0); barUpd(); liveUpd(); }, 700); }
          const cp = pt.pcm; w.postMessage({ type: "run", pcm: cp, off: pt.off, extra }, [cp.buffer]);
        } else if (m.type === "prog") { pt.p = m.p; }
        else if (m.type === "line") { j.lines.push({ t: m.t, text: m.text }); }
        else if (m.type === "done") { pt.p = 1; if (++ended === N && !failed) finish(j, j.cancel ? "cancel" : "done"); }
        else if (m.type === "error") { if (failed) return; failed = true; clearInterval(tick); try { j.ws.forEach(x => x.terminate()); } catch (x) {} j.stage = "err"; j.msg = "РћС€РёР±РєР° СЂР°СЃС€РёС„СЂРѕРІРєРё: " + m.msg + (/memory|alloc/i.test(m.msg) ? ". РќРµ С…РІР°С‚РёР»Рѕ РїР°РјСЏС‚Рё вЂ” РїРѕСЃС‚Р°РІСЊ РјРµРЅСЊС€Рµ РїРѕС‚РѕРєРѕРІ." : ""); try { if (wake) wake.release(); } catch (x) {} render(); }
      };
      w.onerror = e => { if (failed) return; failed = true; j.stage = "err"; j.msg = "РќРµ Р·Р°РїСѓСЃС‚РёР»СЃСЏ РІРѕСЂРєРµСЂ: " + (e.message || "РѕС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё СЃРєСЂРёРїС‚РѕРІ (РЅРµС‚ СЃРІСЏР·Рё?)"); render(); };
      w.postMessage({ type: "init", base: BASE, v: V, modelKey: KEY });
    });
  }
  function cancel() { const j = A0.job; if (!j) return; if (j.stage === "run") { j.cancel = true; j.msg = "РћСЃС‚Р°РЅР°РІР»РёРІР°СЋвЂ¦"; j.ws.forEach(w => w.postMessage({ type: "cancel" })); } else { finish(j, "cancel"); } }

  /* ---------- СЂРµР·СѓР»СЊС‚Р°С‚ ---------- */
  const textOf = () => A0.cur ? A0.cur.text : "";
  const safeName = () => (A0.cur ? A0.cur.name : "СЂР°СЃС€РёС„СЂРѕРІРєР°").replace(/\.[^.]+$/, "").replace(/[\\/:*?"<>|]+/g, "_");
  const A = {
    asrdl() { download(); },
    asrpick() { const e = $("asr-file"); if (e) e.click(); },
    asrmpick(a, e) { if (e && e.preventDefault) e.preventDefault(); const f = $("asr-mfile"); if (f) f.click(); },
    asrcancel() { cancel(); },
    asrcopy() { const t = textOf(); if (!t) return; try { navigator.clipboard.writeText(t).then(() => toast("РЎРєРѕРїРёСЂРѕРІР°РЅРѕ"), () => toast("РќРµ СѓРґР°Р»РѕСЃСЊ СЃРєРѕРїРёСЂРѕРІР°С‚СЊ")); } catch (e) { toast("РќРµ СѓРґР°Р»РѕСЃСЊ СЃРєРѕРїРёСЂРѕРІР°С‚СЊ"); } },
    asrtxt() { const t = textOf(); if (!t) return; const u = URL.createObjectURL(new Blob(["\ufeff" + t.replace(/\n/g, "\r\n")], { type: "text/plain;charset=utf-8" })), a = document.createElement("a"); a.href = u; a.download = safeName() + ".txt"; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 1500); },
    asrprint() {
      const t = textOf(); if (!t) return;
      const body = t.split("\n").map(l => { const m = l.match(/^\[(\d\d:\d\d:\d\d)\]\s*(.*)$/); return m ? "<p><span class=t>" + m[1] + "</span> " + esc(m[2]) + "</p>" : "<p>" + esc(l) + "</p>"; }).join("");
      const doc = "<!doctype html><meta charset=utf-8><title>" + esc(safeName()) + "</title><style>body{font:12pt/1.5 Arial,sans-serif;max-width:760px;margin:24px auto;padding:0 18px}h2{font-size:15pt}p{margin:0 0 7px}.t{color:#777;font-size:10pt;margin-right:6px}</style><h2>" + esc(A0.cur.name) + "</h2>" + body + "<script>setTimeout(function(){print()},300)<\/script>";
      try { const u = URL.createObjectURL(new Blob([doc], { type: "text/html;charset=utf-8" })); if (!window.open(u, "_blank")) toast("Р‘СЂР°СѓР·РµСЂ Р·Р°Р±Р»РѕРєРёСЂРѕРІР°Р» РѕРєРЅРѕ вЂ” СЂР°Р·СЂРµС€Рё РІСЃРїР»С‹РІР°СЋС‰РёРµ РѕРєРЅР° РґР»СЏ СЃР°Р№С‚Р°"); } catch (e) { toast("РќРµ РїРѕР»СѓС‡РёР»РѕСЃСЊ РѕС‚РєСЂС‹С‚СЊ РїРµС‡Р°С‚СЊ"); }
    },
    asropen(a) { const it = A0.hist.find(x => x.id === a.dataset.id); if (it) { A0.cur = it; A0.job = A0.job && A0.job.stage === "err" ? null : A0.job; render(); } },
    asrdel(a, e) { if (e && e.stopPropagation) e.stopPropagation(); const id = a.dataset.id; if (!confirm("РЈРґР°Р»РёС‚СЊ СЌС‚Сѓ СЂР°СЃС€РёС„СЂРѕРІРєСѓ РёР· Р±СЂР°СѓР·РµСЂР°?")) return; A0.hist = A0.hist.filter(x => x.id !== id); js(LS.hist, A0.hist); if (A0.cur && A0.cur.id === id) A0.cur = null; render(); },
    asrdict() { A0.dictOpen = !A0.dictOpen; render(); },
    asrclose() { A0.cur = null; if (A0.job && A0.job.stage === "err") A0.job = null; render(); },
    asrdelmodel(a, e) { if (e && e.preventDefault) e.preventDefault(); if (!confirm("РЈРґР°Р»РёС‚СЊ РјРѕРґРµР»СЊ РёР· Р±СЂР°СѓР·РµСЂР° (в‰€" + mb(MSIZE) + " РњР‘)? РџРѕС‚РѕРј РµС‘ РјРѕР¶РЅРѕ СЃРєР°С‡Р°С‚СЊ СЃРЅРѕРІР°.")) return; caches.delete("moidela-asr").then(() => { A0.model = "no"; render(); }); }
  };
  Object.assign(acts, A);
  document.addEventListener("change", e => {
    const t = e.target; if (!t || !t.id) return;
    if (t.id === "asr-file") { const f = t.files && t.files[0]; t.value = ""; if (f) start(f); }
    else if (t.id === "asr-mfile") { const f = t.files && t.files[0]; t.value = ""; modelFile(f); }
    else if (t.id === "asr-dict") { A0.dict = t.value; js(LS.dict, A0.dict); }
    else if (t.id === "asr-thr") { A0.thr = +t.value || autoThr; js(LS.thr, A0.thr); }
  });

  /* ---------- СЌРєСЂР°РЅ ---------- */
  function modelHTML() {
    if (A0.model === "unk") return '<div class="cardx mut">РџСЂРѕРІРµСЂСЏСЋ, РµСЃС‚СЊ Р»Рё РјРѕРґРµР»СЊвЂ¦</div>';
    if (A0.model === "dl") return '<div class="cardx"><b>РЎРєР°С‡РёРІР°СЋ РјРѕРґРµР»СЊ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ</b><div class="bar"><i id="asr-bar" style="width:' + Math.round(A0.pct * 100) + '%"></i></div><div class="mut" id="asr-st">' + esc(A0.msg) + "</div></div>";
    if (A0.model === "no") return '<div class="cardx"><b>РќСѓР¶РЅР° РјРѕРґРµР»СЊ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂСѓСЃСЃРєРѕР№ СЂРµС‡Рё</b><div class="mut" style="margin:6px 0 12px">GigaAM v3 (в‰€' + mb(MSIZE) + ' РњР‘). РЎРєР°С‡РёРІР°РµС‚СЃСЏ РѕРґРёРЅ СЂР°Р· Рё С…СЂР°РЅРёС‚СЃСЏ РІ Р±СЂР°СѓР·РµСЂРµ. Р”Р°Р»СЊС€Рµ РІСЃС‘ СЂР°Р±РѕС‚Р°РµС‚ Р±РµР· РёРЅС‚РµСЂРЅРµС‚Р° Рё Р·РІСѓРє РЅРёРєСѓРґР° РЅРµ СѓС…РѕРґРёС‚.</div>' +
      '<div class="row"><button class="btnx p" data-a="asrdl">РЎРєР°С‡Р°С‚СЊ РјРѕРґРµР»СЊ</button></div>' +
      (A0.msg ? '<div class="mut" style="margin-top:10px;color:#dc2626">' + esc(A0.msg) + "</div>" : "") +
      '<div class="mut" style="margin-top:12px">РќРµ РєР°С‡Р°РµС‚СЃСЏ? <a href="' + REL + '" target="_blank" rel="noopener">РЎРєР°С‡Р°Р№ С„Р°Р№Р» РІСЂСѓС‡РЅСѓСЋ</a> Рё <a href="#" data-a="asrmpick">РІС‹Р±РµСЂРё РµРіРѕ Р·РґРµСЃСЊ</a>.</div></div>';
    return "";
  }
  function jobHTML(j) {
    const wait = j.stage === "decode" || j.stage === "init";
    if (j.stage === "err") return '<div class="cardx"><b style="color:#dc2626">РќРµ РїРѕР»СѓС‡РёР»РѕСЃСЊ</b><div style="margin:8px 0">' + esc(j.msg) + '</div><button class="btnx" data-a="asrclose">РџРѕРЅСЏС‚РЅРѕ</button></div>';
    return '<div class="cardx"><div class="row"><b style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(j.name) + '</b><span class="mut">' + mb(j.size) + ' РњР‘' + (j.dur ? " В· " + dur(j.dur) : "") + '</span><button class="btnx" data-a="asrcancel">' + (wait ? "РћС‚РјРµРЅР°" : "РћСЃС‚Р°РЅРѕРІРёС‚СЊ") + "</button></div>" +
      '<div class="bar"><i id="asr-bar" style="width:' + Math.round(j.pct * 100) + '%' + (wait ? ";width:100%;opacity:.25" : "") + '"></i></div><div class="mut" id="asr-st">' + esc(stText(j)) + '</div>' +
      '<div class="mut" style="margin-top:6px">Р’РєР»Р°РґРєСѓ РјРѕР¶РЅРѕ РѕСЃС‚Р°РІРёС‚СЊ РІ С„РѕРЅРµ, РЅРѕ РЅРµ Р·Р°РєСЂС‹РІР°Р№. РљРѕРјРїСЊСЋС‚РµСЂ РЅРµ СѓСЃРЅС‘С‚, РїРѕРєР° РёРґС‘С‚ СЂР°СЃС€РёС„СЂРѕРІРєР°.</div>' +
      (j.stage === "run" ? '<div class="txt" id="asr-live" style="margin-top:12px;border-top:1px solid var(--ln);padding-top:10px"></div>' : "") + "</div>";
  }
  function curHTML() {
    const c = A0.cur; if (!c) return "";
    const lines = c.text.split("\n").map(l => { const m = l.match(/^(\[\d\d:\d\d:\d\d\])\s*(.*)$/); return m ? "<b>" + m[1] + "</b> " + esc(m[2]) : esc(l); }).join("\n");
    return '<div class="cardx"><div class="row" style="margin-bottom:8px"><b style="flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + esc(c.name) + (c.partial ? " (РЅРµРїРѕР»РЅР°СЏ)" : "") + '</b><span class="mut">' + dur(c.dur || 0) + "</span></div>" +
      '<div class="row" style="margin-bottom:10px"><button class="btnx p" data-a="asrcopy">РљРѕРїРёСЂРѕРІР°С‚СЊ</button><button class="btnx" data-a="asrtxt">РЎРєР°С‡Р°С‚СЊ .txt</button><button class="btnx" data-a="asrprint">РџРµС‡Р°С‚СЊ / PDF</button><button class="btnx" data-a="asrclose">Р—Р°РєСЂС‹С‚СЊ</button></div>' +
      '<div class="txt">' + lines + "</div></div>";
  }
  function html(vi) {
    if (A0.model === "unk") setTimeout(checkModel, 0);
    const j = A0.job, busy = j && j.stage !== "err", ok = A0.model === "ok";
    let h = '<div id="main" class="pane" style="flex:1">' + mtopHTML(vi, 1, "") + '<div class="scroll" id="list"><div class="asr">' +
      "<h1>Р Р°СЃС€РёС„СЂРѕРІРєР°</h1><div class='sub'>Р—Р°РїРёСЃСЊ СЃРѕРІРµС‰Р°РЅРёСЏ в†’ С‚РµРєСЃС‚ СЃ РјРµС‚РєР°РјРё РІСЂРµРјРµРЅРё. Р’СЃС‘ СЃС‡РёС‚Р°РµС‚СЃСЏ РЅР° СЌС‚РѕРј РєРѕРјРїСЊСЋС‚РµСЂРµ, Р·РІСѓРє РЅРёРєСѓРґР° РЅРµ РѕС‚РїСЂР°РІР»СЏРµС‚СЃСЏ.</div>" +
      (isMob() ? '<div class="cardx mut">РќР° С‚РµР»РµС„РѕРЅРµ СѓРґРѕР±РЅРµРµ РїСЂРёР»РѕР¶РµРЅРёРµ В«РњРѕРё РґРµР»Р°В» РґР»СЏ Android (СЂР°Р·РґРµР» В«РЎРѕРІРµС‰Р°РЅРёРµВ»): РѕРЅРѕ СЃС‡РёС‚Р°РµС‚ Р±С‹СЃС‚СЂРµРµ Рё РЅРµ РіСЂРµРµС‚ Р±СЂР°СѓР·РµСЂ.</div>' : "") +
      modelHTML() +
      '<input type="file" id="asr-file" hidden accept="audio/*,video/mp4,.m4a,.mp3,.wav,.ogg,.opus,.aac,.amr,.flac"><input type="file" id="asr-mfile" hidden accept=".onnx">';
    if (j) h += jobHTML(j);
    if (ok && !busy) h += '<div class="drop" data-a="asrpick"><div style="font-size:1.1em;color:var(--tx)">РџРµСЂРµС‚Р°С‰Рё Р·Р°РїРёСЃСЊ СЃСЋРґР° РёР»Рё РЅР°Р¶РјРё, С‡С‚РѕР±С‹ РІС‹Р±СЂР°С‚СЊ С„Р°Р№Р»</div><div class="mut" style="margin-top:6px">m4a, mp3, wav, oggвЂ¦ РґРѕ 100 РњР‘. Р—Р°РїРёСЃСЊ СЃ С‚РµР»РµС„РѕРЅР° РїРѕРґРѕР№РґС‘С‚ РєР°Рє РµСЃС‚СЊ.</div></div>';
    h += curHTML();
    if (ok) {
      h += '<div class="cardx"><div class="row"><span class="mut" style="flex:1">РџРѕС‚РѕРєРѕРІ: <select id="asr-thr" style="font:inherit">' + [1, 2, 3, 4].map(n => '<option value="' + n + '"' + (n === A0.thr ? " selected" : "") + ">" + n + (n === autoThr ? " (Р°РІС‚Рѕ)" : "") + "</option>").join("") + '</select> <span>вЂ” Р±РѕР»СЊС€Рµ РїРѕС‚РѕРєРѕРІ Р±С‹СЃС‚СЂРµРµ, РЅРѕ РєР°Р¶РґС‹Р№ Р·Р°РЅРёРјР°РµС‚ в‰€0,8 Р“Р‘ РїР°РјСЏС‚Рё</span></span>' +
        '<button class="btnx" data-a="asrdict">РЎР»РѕРІР°СЂСЊ Р·Р°РјРµРЅ ' + (A0.dictOpen ? "в–І" : "в–ј") + '</button></div>' +
        (A0.dictOpen ? '<div class="mut" style="margin:10px 0 6px">РџРѕ РѕРґРЅРѕР№ Р·Р°РјРµРЅРµ РІ СЃС‚СЂРѕРєРµ: В«РєР°Рє СѓСЃР»С‹С€Р°Р» = РєР°Рє РЅР°РґРѕВ». РќР°РїСЂРёРјРµСЂ: <code>СЌР№ Р±Рё Р±Рё = ABB</code>. РђР±Р±СЂРµРІРёР°С‚СѓСЂС‹ РќРљРЈ, Р’Р РЈ, РђР’Р , РЈР—Рћ, РўРљРџ, РўР—, Р“РћРЎРў Рё РґСЂСѓРіРёРµ РёСЃРїСЂР°РІР»СЏСЋС‚СЃСЏ СЃР°РјРё.</div><textarea id="asr-dict" placeholder="РёРІР°РЅРѕРІ = РРІР°РЅРѕРІ Р. Р.">' + esc(A0.dict) + "</textarea>" : "") + "</div>";
    }
    if (A0.hist.length) h += '<div class="cardx"><b>РњРѕРё СЂР°СЃС€РёС„СЂРѕРІРєРё</b><div class="mut" style="margin:2px 0 8px">РҐСЂР°РЅСЏС‚СЃСЏ С‚РѕР»СЊРєРѕ РІ СЌС‚РѕРј Р±СЂР°СѓР·РµСЂРµ</div>' + A0.hist.map(it => '<div class="hi" data-a="asropen" data-id="' + it.id + '"><span class="n">' + esc(it.name) + (it.partial ? " (РЅРµРїРѕР»РЅР°СЏ)" : "") + '</span><span class="mut">' + new Date(it.at).toLocaleDateString("ru-RU") + " В· " + dur(it.dur || 0) + '</span><button class="btnx" data-a="asrdel" data-id="' + it.id + '" title="РЈРґР°Р»РёС‚СЊ">вњ•</button></div>').join("") + "</div>";
    if (ok && !busy) h += '<div class="mut" style="text-align:center"><a href="#" data-a="asrdelmodel">РЈРґР°Р»РёС‚СЊ РјРѕРґРµР»СЊ РёР· Р±СЂР°СѓР·РµСЂР°</a></div>';
    return h + "</div></div></div>";
  }
  return { html, add(files) { const f = files && files[0]; if (f) start(f); }, busy: () => !!(A0.job && A0.job.stage !== "err") };
};
