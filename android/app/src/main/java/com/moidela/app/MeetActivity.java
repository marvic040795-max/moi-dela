package com.moidela.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.ContentValues;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.graphics.Typeface;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.provider.MediaStore;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TextView;
import android.widget.Toast;
import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.net.HttpURLConnection;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.util.Arrays;
import java.util.Comparator;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/** РЎРѕРІРµС‰Р°РЅРёСЏ: Р·Р°РїРёСЃСЊ (СЃ СЌРєСЂР°РЅРѕРј В«Р¶РёРІРѕР№В» СЃР»СѓР¶Р±С‹), СЃРєР°С‡РёРІР°РЅРёРµ РјРѕРґРµР»Рё, СЂР°СЃС€РёС„СЂРѕРІРєР°, С‚РµРєСЃС‚/РїРѕРґРµР»РёС‚СЊСЃСЏ/СЃРѕС…СЂР°РЅРёС‚СЊ РІ Р—Р°РіСЂСѓР·РєРё. */
public class MeetActivity extends Activity {
    static final String URL_MODEL = "https://github.com/marvic040795-max/moi-dela/releases/download/asr/asr-ru-rnnt.zip";
    static volatile String dlStatus = ""; static volatile boolean dlBusy = false;
    private LinearLayout box;
    private final Handler h = new Handler(Looper.getMainLooper());
    private String sig = "";

    private int dp(int v) { return (int) (v * getResources().getDisplayMetrics().density + .5f); }
    private TextView tv(String s, int sp, String col, boolean bold) { TextView t = new TextView(this); t.setText(s); t.setTextSize(sp); t.setTextColor(Color.parseColor(col)); t.setTypeface(null, bold ? Typeface.BOLD : Typeface.NORMAL); t.setPadding(0, dp(5), 0, dp(5)); return t; }
    private Button bt(String s, View.OnClickListener l) { Button b = new Button(this); b.setText(s); b.setOnClickListener(l); return b; }

    @Override protected void onCreate(Bundle b) {
        super.onCreate(b);
        ScrollView sv = new ScrollView(this); sv.setBackgroundColor(Color.parseColor("#14121f"));
        box = new LinearLayout(this); box.setOrientation(LinearLayout.VERTICAL); box.setPadding(dp(18), dp(22), dp(18), dp(40)); sv.addView(box); setContentView(sv);
    }
    @Override protected void onResume() { super.onResume(); tick.run(); }
    @Override protected void onPause() { super.onPause(); h.removeCallbacks(tick); }

    private final Runnable tick = new Runnable() { public void run() { build(); h.postDelayed(this, 1000); } };

    private File[] wavs() {
        File[] a = MeetService.dir(this).listFiles(); if (a == null) return new File[0];
        java.util.ArrayList<File> r = new java.util.ArrayList<>(); for (File f : a) if (f.getName().endsWith(".wav")) r.add(f);
        File[] x = r.toArray(new File[0]); Arrays.sort(x, new Comparator<File>() { public int compare(File p, File q) { return Long.compare(q.lastModified(), p.lastModified()); } }); return x;
    }

    private void build() {
        String s = new File(MeetService.dir(this), "log.txt").length() + "|" + MeetService.rec + "|" + MeetService.tr + "|" + (MeetService.rec ? (System.currentTimeMillis() - MeetService.recStart) / 1000 : 0) + "|" + MeetService.prog + "|" + MeetService.status + "|" + dlStatus + "|" + dlBusy + "|" + wavs().length + "|" + MeetService.modelReady(this);
        for (File f : wavs()) s += f.getName() + f.lastModified() + new File(f.getPath().replace(".wav", ".txt")).exists();
        if (s.equals(sig)) return; sig = s;
        box.removeAllViews();
        box.addView(tv("РЎРѕРІРµС‰Р°РЅРёСЏ", 22, "#ffffff", true));
        box.addView(tv("Р—Р°РїРёСЃСЊ в†’ СЂР°СЃС€РёС„СЂРѕРІРєР° РЅР° СЃР°РјРѕРј С‚РµР»РµС„РѕРЅРµ, Р±РµР· РёРЅС‚РµСЂРЅРµС‚Р°. РўРµРєСЃС‚ РЅРёРєСѓРґР° РЅРµ РѕС‚РїСЂР°РІР»СЏРµС‚СЃСЏ.", 13, "#9a93b8", false));
        if (!MeetService.modelReady(this)) {
            box.addView(tv(dlBusy ? dlStatus : "Р”Р»СЏ СЂР°СЃС€РёС„СЂРѕРІРєРё РЅСѓР¶РЅР° РјРѕРґРµР»СЊ СЂР°СЃРїРѕР·РЅР°РІР°РЅРёСЏ СЂСѓСЃСЃРєРѕР№ СЂРµС‡Рё (в‰€232 РњР‘, СЃРєР°С‡РёРІР°РµС‚СЃСЏ РѕРґРёРЅ СЂР°Р·; GigaAM v3 RNNT вЂ” С‚РѕС‡РЅРµРµ РїСЂРµР¶РЅРµР№, СЃРѕ Р·РЅР°РєР°РјРё РїСЂРµРїРёРЅР°РЅРёСЏ).", 14, "#e6e1ff", false));
            if (!dlBusy) box.addView(bt("РЎРєР°С‡Р°С‚СЊ РјРѕРґРµР»СЊ", new View.OnClickListener() { public void onClick(View v) { download(); } }));
        }
        if (MeetService.rec) {
            long sec = (System.currentTimeMillis() - MeetService.recStart) / 1000;
            box.addView(tv("в—Џ РРґС‘С‚ Р·Р°РїРёСЃСЊ: " + String.format("%d:%02d:%02d", sec / 3600, (sec / 60) % 60, sec % 60), 18, "#ff6b6b", true));
            box.addView(bt("в–  РћСЃС‚Р°РЅРѕРІРёС‚СЊ Р·Р°РїРёСЃСЊ", new View.OnClickListener() { public void onClick(View v) { startService(new Intent(MeetActivity.this, MeetService.class).setAction("stop")); } }));
        } else if (!MeetService.tr) {
            box.addView(bt("пј‹ РРјРїРѕСЂС‚ РёР· С„Р°Р№Р»Р° (РґРёРєС‚РѕС„РѕРЅ, РіР°Р»РµСЂРµСЏ)", new View.OnClickListener() { public void onClick(View v) { pick(); } }));
            box.addView(bt("в—Џ РќР°С‡Р°С‚СЊ Р·Р°РїРёСЃСЊ СЃРѕРІРµС‰Р°РЅРёСЏ", new View.OnClickListener() { public void onClick(View v) { startRec(); } }));
        }
        if (MeetService.tr) {
            box.addView(tv("Р Р°СЃС€РёС„СЂРѕРІРєР°: " + MeetService.trName + " вЂ” " + MeetService.prog + "%", 15, "#a99bff", true));
            box.addView(tv("РњРѕР¶РЅРѕ Р·Р°РєСЂС‹С‚СЊ СЌРєСЂР°РЅ Рё СѓР±СЂР°С‚СЊ С‚РµР»РµС„РѕРЅ: РёРґС‘С‚ РІ С„РѕРЅРµ, РІ С€С‚РѕСЂРєРµ РІРёРґРЅРѕ РїСЂРѕРіСЂРµСЃСЃ.", 12, "#9a93b8", false));
            box.addView(bt("в–  РџСЂРµСЂРІР°С‚СЊ", new View.OnClickListener() { public void onClick(View v) { startService(new Intent(MeetActivity.this, MeetService.class).setAction("stop")); } }));
        }
        String lg = read(new File(MeetService.dir(this), "log.txt")); if (lg.length() > 0) { String[] ls = lg.trim().split("\n"); StringBuilder sb2 = new StringBuilder(); for (int i = Math.max(0, ls.length - 12); i < ls.length; i++) sb2.append(ls[i]).append('\n'); box.addView(tv("Р–СѓСЂРЅР°Р»:\n" + sb2, 11, "#7d76a0", false)); }
        if (MeetService.status.length() > 0) box.addView(tv(MeetService.status, 13, "#9a93b8", false));
        box.addView(tv("Р—Р°РїРёСЃРё", 17, "#ffffff", true));
        File[] ws = wavs();
        if (ws.length == 0) box.addView(tv("РџРѕРєР° РЅРµС‚ Р·Р°РїРёСЃРµР№.", 13, "#9a93b8", false));
        for (final File f : ws) {
            final File txt = new File(f.getPath().replace(".wav", ".txt"));
            long sec = Math.max(0, (f.length() - 44) / 32000);
            box.addView(tv(f.getName().replace("meet-", "").replace(".wav", "") + " В· " + (sec < 60 ? sec + " СЃ" : sec / 60 + " РјРёРЅ " + sec % 60 + " СЃ") + " В· " + (f.length() < (1 << 20) ? (f.length() >> 10) + " РљР‘" : (f.length() >> 20) + " РњР‘") + (txt.exists() ? " В· вњ“ С‚РµРєСЃС‚ РіРѕС‚РѕРІ" : ""), 14, "#e6e1ff", false));
            LinearLayout row = new LinearLayout(this); row.setOrientation(LinearLayout.HORIZONTAL);
            if (!txt.exists() && !MeetService.tr && !MeetService.rec && MeetService.modelReady(this)) row.addView(bt("Р Р°СЃС€РёС„СЂРѕРІР°С‚СЊ", new View.OnClickListener() { public void onClick(View v) { startForegroundSvc(new Intent(MeetActivity.this, MeetService.class).setAction("tr").putExtra("wav", f.getAbsolutePath())); } }));
            if (txt.exists()) {
                row.addView(bt("РўРµРєСЃС‚", new View.OnClickListener() { public void onClick(View v) { showText(txt); } }));
                row.addView(bt("РџРѕРґРµР»РёС‚СЊСЃСЏ", new View.OnClickListener() { public void onClick(View v) { share(txt); } }));
                row.addView(bt(new File(f.getPath().replace(".wav", ".exp")).exists() ? "PDF" : "Р’ В«Р”РѕРєСѓРјРµРЅС‚С‹В»", new View.OnClickListener() { public void onClick(View v) { saveDocs(f, txt); } }));
            }
            row.addView(bt(playing != null && playing.equals(f.getName()) ? "в–  РЎС‚РѕРї" : "в–¶ РЎР»СѓС€Р°С‚СЊ", new View.OnClickListener() { public void onClick(View v) { play(f); } }));
            if (!MeetService.tr && !MeetService.rec) row.addView(bt("РЈРґР°Р»РёС‚СЊ", new View.OnClickListener() { public void onClick(View v) { confirmDel(f, txt); } }));
            box.addView(row);
        }
    }


    // ---- РёРјРїРѕСЂС‚ / РІРѕСЃРїСЂРѕРёР·РІРµРґРµРЅРёРµ / РґРѕРєСѓРјРµРЅС‚С‹ ----
    private String playing = null; private android.media.MediaPlayer mp = null;
    private void pick() {
        Intent i = new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE).setType("audio/*").putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"audio/*", "video/mp4", "application/ogg"});
        try { startActivityForResult(i, 77); } catch (Throwable e) { Toast.makeText(this, "РќРµС‚ РїСЂРѕРіСЂР°РјРјС‹ РІС‹Р±РѕСЂР° С„Р°Р№Р»РѕРІ", Toast.LENGTH_LONG).show(); }
    }
    @Override protected void onActivityResult(int rq, int rs, Intent d) {
        super.onActivityResult(rq, rs, d);
        if (rq != 77 || rs != RESULT_OK || d == null || d.getData() == null) return;
        Uri u = d.getData(); String nm = "С„Р°Р№Р»";
        try { android.database.Cursor c = getContentResolver().query(u, null, null, null, null); if (c != null) { if (c.moveToFirst()) { int ix = c.getColumnIndex(android.provider.OpenableColumns.DISPLAY_NAME); if (ix >= 0) nm = c.getString(ix); } c.close(); } } catch (Throwable e) { }
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 2);
        startForegroundSvc(new Intent(this, MeetService.class).setAction("imp").putExtra("uri", u.toString()).putExtra("name", nm));
        sig = "";
    }
    private void play(File f) {
        try {
            boolean same = playing != null && playing.equals(f.getName());
            if (mp != null) { try { mp.stop(); } catch (Throwable e) { } mp.release(); mp = null; playing = null; }
            if (!same) { mp = new android.media.MediaPlayer(); mp.setDataSource(f.getPath()); mp.prepare(); mp.start(); playing = f.getName();
                mp.setOnCompletionListener(new android.media.MediaPlayer.OnCompletionListener() { public void onCompletion(android.media.MediaPlayer m) { playing = null; sig = ""; } }); }
            sig = "";
        } catch (Throwable e) { Toast.makeText(this, "РќРµ РІРѕСЃРїСЂРѕРёР·РІРѕРґРёС‚СЃСЏ: " + e.getMessage(), Toast.LENGTH_LONG).show(); }
    }
    @Override protected void onDestroy() { super.onDestroy(); if (mp != null) { try { mp.release(); } catch (Throwable e) { } } }
    private void saveDocs(final File wav, final File txt) {
        final File pu = new File(wav.getPath().replace(".wav", ".pdfuri"));
        try {
            if (new File(wav.getPath().replace(".wav", ".exp")).exists() && pu.exists()) {   // СѓР¶Рµ СЃРѕС…СЂР°РЅРµРЅРѕ в†’ РїРѕРґРµР»РёС‚СЊСЃСЏ PDF
                Intent i = new Intent(Intent.ACTION_SEND).setType("application/pdf").putExtra(Intent.EXTRA_STREAM, Uri.parse(read(pu).trim())).addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                startActivity(Intent.createChooser(i, "PDF СЃРѕРІРµС‰Р°РЅРёСЏ")); return;
            }
            MeetStore.export(this, wav, txt); Toast.makeText(this, "РЎРѕС…СЂР°РЅРµРЅРѕ РІ Р”РѕРєСѓРјРµРЅС‚С‹/РЎРѕРІРµС‰Р°РЅРёСЏ: Р°СѓРґРёРѕ, С‚РµРєСЃС‚, PDF", Toast.LENGTH_LONG).show(); sig = "";
        } catch (Throwable e) { Toast.makeText(this, "РќРµ РїРѕР»СѓС‡РёР»РѕСЃСЊ: " + e.getMessage(), Toast.LENGTH_LONG).show(); }
    }

    private void startForegroundSvc(Intent i) { if (Build.VERSION.SDK_INT >= 26) startForegroundService(i); else startService(i); }

    private void startRec() {
        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) { requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, 1); return; }
        if (Build.VERSION.SDK_INT >= 33 && checkSelfPermission("android.permission.POST_NOTIFICATIONS") != PackageManager.PERMISSION_GRANTED) requestPermissions(new String[]{"android.permission.POST_NOTIFICATIONS"}, 2);
        startForegroundSvc(new Intent(this, MeetService.class).setAction("rec"));
    }
    @Override public void onRequestPermissionsResult(int rc, String[] p, int[] r) { if (rc == 1 && r.length > 0 && r[0] == PackageManager.PERMISSION_GRANTED) startRec(); }

    private String read(File f) { try { FileInputStream in = new FileInputStream(f); ByteArrayOutputStream b = new ByteArrayOutputStream(); byte[] x = new byte[8192]; int n; while ((n = in.read(x)) > 0) b.write(x, 0, n); in.close(); return b.toString("UTF-8"); } catch (Throwable e) { return ""; } }

    private void showText(File txt) {
        ScrollView sv = new ScrollView(this); TextView t = new TextView(this); t.setText(read(txt)); t.setTextIsSelectable(true); t.setTextSize(15); t.setPadding(dp(16), dp(10), dp(16), dp(10)); sv.addView(t);
        new AlertDialog.Builder(this).setTitle(txt.getName()).setView(sv).setPositiveButton("Р—Р°РєСЂС‹С‚СЊ", null).show();
    }
    private void share(File txt) { Intent i = new Intent(Intent.ACTION_SEND).setType("text/plain").putExtra(Intent.EXTRA_SUBJECT, "РЎРѕРІРµС‰Р°РЅРёРµ " + txt.getName()).putExtra(Intent.EXTRA_TEXT, read(txt)); startActivity(Intent.createChooser(i, "РћС‚РїСЂР°РІРёС‚СЊ С‚РµРєСЃС‚")); }
    private void toDownloads(File txt) {
        try {
            if (Build.VERSION.SDK_INT >= 29) {
                ContentValues cv = new ContentValues(); cv.put(MediaStore.Downloads.DISPLAY_NAME, txt.getName()); cv.put(MediaStore.Downloads.MIME_TYPE, "text/plain"); cv.put(MediaStore.Downloads.RELATIVE_PATH, "Download");
                Uri u = getContentResolver().insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, cv); OutputStream o = getContentResolver().openOutputStream(u); o.write(read(txt).getBytes("UTF-8")); o.close();
                Toast.makeText(this, "РЎРѕС…СЂР°РЅРµРЅРѕ РІ Р—Р°РіСЂСѓР·РєРё: " + txt.getName(), Toast.LENGTH_LONG).show();
            } else Toast.makeText(this, "РСЃРїРѕР»СЊР·СѓР№С‚Рµ В«РџРѕРґРµР»РёС‚СЊСЃСЏВ»", Toast.LENGTH_LONG).show();
        } catch (Throwable e) { Toast.makeText(this, "РќРµ РїРѕР»СѓС‡РёР»РѕСЃСЊ СЃРѕС…СЂР°РЅРёС‚СЊ: " + e.getMessage(), Toast.LENGTH_LONG).show(); }
    }
    private void confirmDel(final File wav, final File txt) {
        new AlertDialog.Builder(this).setTitle("РЈРґР°Р»РёС‚СЊ Р·Р°РїРёСЃСЊ?").setMessage(txt.exists() ? "Р‘СѓРґРµС‚ СѓРґР°Р»РµРЅРѕ Р°СѓРґРёРѕ Рё СЂР°СЃС€РёС„СЂРѕРІРєР°. Р•СЃР»Рё С‚РµРєСЃС‚ РЅСѓР¶РµРЅ, СЃРЅР°С‡Р°Р»Р° СЃРѕС…СЂР°РЅРёС‚Рµ РµРіРѕ РІ В«Р—Р°РіСЂСѓР·РєРёВ» РёР»Рё РїРѕРґРµР»РёС‚РµСЃСЊ." : "Р‘СѓРґРµС‚ СѓРґР°Р»РµРЅРѕ Р°СѓРґРёРѕ. Р Р°СЃС€РёС„СЂРѕРІРєРё РЅРµС‚.")
            .setPositiveButton("РЈРґР°Р»РёС‚СЊ", new DialogInterface.OnClickListener() { public void onClick(DialogInterface d, int w) { wav.delete(); txt.delete(); new File(wav.getPath().replace(".wav", ".exp")).delete(); new File(wav.getPath().replace(".wav", ".pdfuri")).delete(); sig = ""; build(); } }).setNegativeButton("РћС‚РјРµРЅР°", null).show();
    }

    private void download() {
        if (dlBusy) return; dlBusy = true; dlStatus = "Р—Р°РіСЂСѓР·РєР°вЂ¦"; final File dst = MeetService.modelDir(this); final File tmp = new File(getFilesDir(), "asr.tmp"); final File zip = new File(getCacheDir(), "asr-ru.zip");
        new Thread(new Runnable() { public void run() {
            try {
                HttpURLConnection cn = (HttpURLConnection) new URL(URL_MODEL).openConnection(); cn.setConnectTimeout(20000); cn.setReadTimeout(30000); cn.setInstanceFollowRedirects(true);
                int code = cn.getResponseCode(); if (code != 200) throw new Exception("HTTP " + code + " (РјРѕРґРµР»СЊ РµС‰С‘ РЅРµ РѕРїСѓР±Р»РёРєРѕРІР°РЅР°?)");
                long total = cn.getContentLengthLong(), got = 0, last = 0; byte[] buf = new byte[65536]; int n;
                InputStream in = cn.getInputStream(); FileOutputStream out = new FileOutputStream(zip);
                while ((n = in.read(buf)) > 0) { out.write(buf, 0, n); got += n; if (System.currentTimeMillis() - last > 500) { last = System.currentTimeMillis(); dlStatus = "Р—Р°РіСЂСѓР·РєР°: " + (got >> 20) + (total > 0 ? " РёР· " + (total >> 20) : "") + " РњР‘"; } }
                out.close(); in.close(); dlStatus = "Р Р°СЃРїР°РєРѕРІРєР°вЂ¦";
                rec(tmp); tmp.mkdirs();
                ZipInputStream zi = new ZipInputStream(new BufferedInputStream(new FileInputStream(zip))); ZipEntry e;
                while ((e = zi.getNextEntry()) != null) { if (e.isDirectory()) continue; File f = new File(tmp, new File(e.getName()).getName()); FileOutputStream fo = new FileOutputStream(f); while ((n = zi.read(buf)) > 0) fo.write(buf, 0, n); fo.close(); }
                zi.close(); new File(tmp, ".ok").createNewFile(); rec(dst); tmp.renameTo(dst); zip.delete(); dlStatus = "РњРѕРґРµР»СЊ РіРѕС‚РѕРІР°";
            } catch (Throwable e) { dlStatus = "РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё: " + e.getMessage(); }
            dlBusy = false;
        } }).start();
    }
    private static void rec(File f) { if (f.isDirectory()) { File[] a = f.listFiles(); if (a != null) for (File x : a) rec(x); } f.delete(); }
}
