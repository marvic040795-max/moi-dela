package com.moidela.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.media.AudioAttributes;
import android.media.AudioFormat;
import android.media.AudioTrack;

import com.k2fsa.sherpa.onnx.OfflineTts;
import com.k2fsa.sherpa.onnx.OfflineTtsCallback;
import com.k2fsa.sherpa.onnx.OfflineTtsConfig;
import com.k2fsa.sherpa.onnx.OfflineTtsModelConfig;
import com.k2fsa.sherpa.onnx.OfflineTtsVitsModelConfig;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/** РќРµР№СЂРѕРіРѕР»РѕСЃ Piper (РѕС„Р»Р°Р№РЅ, sherpa-onnx). Р“РѕР»РѕСЃ РєР°С‡Р°РµС‚СЃСЏ РѕРґРёРЅ СЂР°Р· (~65 РњР‘) СЃ СЂРµР»РёР·Р° В«voicesВ» Рё Р»РµР¶РёС‚ РІ РїР°РјСЏС‚Рё РїСЂРёР»РѕР¶РµРЅРёСЏ. */
final class Neural {
    static final String[] IDS = {"", "y:filipp", "y:ermil", "y:madirus", "y:zahar", "y:alexander", "y:alena", "y:marina", "denis", "dmitri", "ruslan", "irina"};
    static final String[] NAMES = {"Р’С‹РєР»СЋС‡РµРЅ (СЃРёСЃС‚РµРјРЅС‹Р№ РіРѕР»РѕСЃ)", "вЃ РЇРЅРґРµРєСЃ: Р¤РёР»РёРїРї (РјСѓР¶.)", "вЃ РЇРЅРґРµРєСЃ: Р•СЂРјРёР» (РјСѓР¶.)", "вЃ РЇРЅРґРµРєСЃ: РњР°РґРёСЂСѓСЃ (РјСѓР¶.)", "вЃ РЇРЅРґРµРєСЃ: Р—Р°С…Р°СЂ (РјСѓР¶.)", "вЃ РЇРЅРґРµРєСЃ: РђР»РµРєСЃР°РЅРґСЂ (РјСѓР¶.)", "вЃ РЇРЅРґРµРєСЃ: РђР»С‘РЅР° (Р¶РµРЅ.)", "вЃ РЇРЅРґРµРєСЃ: РњР°СЂРёРЅР° (Р¶РµРЅ.)",
        "РћС„Р»Р°Р№РЅ Piper: Р”РµРЅРёСЃ", "РћС„Р»Р°Р№РЅ Piper: Р”РјРёС‚СЂРёР№", "РћС„Р»Р°Р№РЅ Piper: Р СѓСЃР»Р°РЅ", "РћС„Р»Р°Р№РЅ Piper: РСЂРёРЅР° (Р¶РµРЅ.)"};
    static boolean isCloud(String v) { return v.startsWith("y:"); }
    static final String BASE = "https://github.com/marvic040795-max/moi-dela/releases/download/voices/voice-";

    static volatile String status = "";      // РґР»СЏ СЌРєСЂР°РЅР° РЅР°СЃС‚СЂРѕРµРє
    static volatile boolean busy = false;
    private static OfflineTts eng; private static String engVoice = ""; private static float engSpeed = 0;

    static String selected(SharedPreferences sp) { int i = sp.getInt("v_neural", 0); return i > 0 && i < IDS.length ? IDS[i] : ""; }
    static File dir(Context c, String v) { return new File(c.getFilesDir(), "piper/" + v); }
    static boolean ready(Context c, String v) { if (isCloud(v)) return true; File d = dir(c, v); return v.length() > 0 && new File(d, "model.onnx").exists() && new File(d, "tokens.txt").exists() && new File(d, "espeak-ng-data").isDirectory() && new File(d, ".ok").exists(); }

    /** РЎРєР°С‡Р°С‚СЊ Рё СЂР°СЃРїР°РєРѕРІР°С‚СЊ РіРѕР»РѕСЃ (РІ С„РѕРЅРµ). onEnd вЂ” РІ РїРѕС‚РѕРєРµ Р·Р°РіСЂСѓР·РєРё. */
    static synchronized void download(final Context ctx, final String v, final Runnable onEnd) {
        if (busy) return; busy = true; status = "Р—Р°РіСЂСѓР·РєР°вЂ¦";
        new Thread(new Runnable() { public void run() {
            File zip = new File(ctx.getCacheDir(), "voice-" + v + ".zip");
            try {
                HttpURLConnection cn = (HttpURLConnection) new URL(BASE + v + ".zip").openConnection();
                cn.setConnectTimeout(20000); cn.setReadTimeout(30000); cn.setInstanceFollowRedirects(true);
                int code = cn.getResponseCode(); if (code != 200) throw new Exception("HTTP " + code + " (РіРѕР»РѕСЃ РµС‰С‘ РЅРµ РѕРїСѓР±Р»РёРєРѕРІР°РЅ?)");
                long total = cn.getContentLengthLong(), got = 0; byte[] buf = new byte[65536]; int n; long last = 0;
                InputStream in = cn.getInputStream(); FileOutputStream out = new FileOutputStream(zip);
                while ((n = in.read(buf)) > 0) { out.write(buf, 0, n); got += n; if (System.currentTimeMillis() - last > 400) { last = System.currentTimeMillis(); status = "Р—Р°РіСЂСѓР·РєР°: " + (got >> 20) + (total > 0 ? " РёР· " + (total >> 20) : "") + " РњР‘"; } }
                out.close(); in.close();
                status = "Р Р°СЃРїР°РєРѕРІРєР°вЂ¦";
                File d = dir(ctx, v), tmp = new File(d.getParentFile(), v + ".tmp"); deleteRec(tmp); tmp.mkdirs();
                ZipInputStream zi = new ZipInputStream(new java.io.BufferedInputStream(new java.io.FileInputStream(zip))); ZipEntry e;
                while ((e = zi.getNextEntry()) != null) {
                    File f = new File(tmp, e.getName()); if (!f.getCanonicalPath().startsWith(tmp.getCanonicalPath())) continue;
                    if (e.isDirectory()) { f.mkdirs(); continue; }
                    f.getParentFile().mkdirs(); FileOutputStream fo = new FileOutputStream(f); while ((n = zi.read(buf)) > 0) fo.write(buf, 0, n); fo.close();
                }
                zi.close(); new File(tmp, ".ok").createNewFile();
                deleteRec(d); tmp.renameTo(d); status = "Р“РѕС‚РѕРІРѕ вњ“ (" + dirSize(d) / 1048576 + " РњР‘)";
            } catch (Throwable t) { status = "РќРµ РїРѕР»СѓС‡РёР»РѕСЃСЊ: " + t.getMessage(); }
            finally { zip.delete(); busy = false; if (onEnd != null) onEnd.run(); }
        } }).start();
    }
    private static long dirSize(File f) { if (f.isFile()) return f.length(); long s = 0; File[] a = f.listFiles(); if (a != null) for (File x : a) s += dirSize(x); return s; }
    static void deleteRec(File f) { if (f.isDirectory()) { File[] a = f.listFiles(); if (a != null) for (File x : a) deleteRec(x); } f.delete(); }

    private static synchronized OfflineTts engine(Context c, String v, float speed) {
        if (eng != null && v.equals(engVoice) && speed == engSpeed) return eng;
        try { if (eng != null) eng.release(); } catch (Throwable t) {} eng = null;
        File d = dir(c, v);
        OfflineTtsVitsModelConfig vits = OfflineTtsVitsModelConfig.builder().setModel(new File(d, "model.onnx").getPath()).setTokens(new File(d, "tokens.txt").getPath())
            .setDataDir(new File(d, "espeak-ng-data").getPath()).setLengthScale(1f / speed).build();
        OfflineTtsModelConfig m = OfflineTtsModelConfig.builder().setVits(vits).setNumThreads(2).setDebug(false).build();
        eng = new OfflineTts(OfflineTtsConfig.builder().setModel(m).build()); engVoice = v; engSpeed = speed; return eng;
    }

    /** РћР·РІСѓС‡РёС‚СЊ С‚РµРєСЃС‚ (РІ С„РѕРЅРµ, РїРѕС‚РѕРєРѕРІРѕ). onEnd РІС‹Р·С‹РІР°РµС‚СЃСЏ РІСЃРµРіРґР°; ok=false вЂ” РЅРµ РІС‹С€Р»Рѕ (РјРѕР¶РЅРѕ РїСЂРѕС‡РёС‚Р°С‚СЊ СЃРёСЃС‚РµРјРЅС‹Рј РіРѕР»РѕСЃРѕРј). */
    interface Done { void end(boolean ok); }
    private static volatile int token = 0; private static volatile android.media.MediaPlayer curMp = null; private static volatile AudioTrack curAt = null;
    /** РїСЂРµСЂРІР°С‚СЊ Р»СЋР±СѓСЋ С‚РµРєСѓС‰СѓСЋ РѕР·РІСѓС‡РєСѓ (С‡С‚РѕР±С‹ РіРѕР»РѕСЃР° РЅРµ РЅР°РєР»Р°РґС‹РІР°Р»РёСЃСЊ) */
    static void stopAll() { token++; try { if (curMp != null) curMp.stop(); } catch (Throwable e) {} try { if (curAt != null) { curAt.pause(); curAt.flush(); } } catch (Throwable e) {} }
    private static void cloud(final Context ctx, final String v, final String text, final float speed, final Done end) {
        final int my = ++token;
        new Thread(new Runnable() { public void run() {
            boolean ok = false; File f = null;
            try {
                // РєСЌС€ РѕР·РІСѓС‡РєРё РЅР° РґРёСЃРєРµ: РѕРґРёРЅР°РєРѕРІР°СЏ С„СЂР°Р·Р° (С‚РµРєСЃС‚+РіРѕР»РѕСЃ+СЃРєРѕСЂРѕСЃС‚СЊ) СЃРёРЅС‚РµР·РёСЂСѓРµС‚СЃСЏ РІ РѕР±Р»Р°РєРµ РѕРґРёРЅ СЂР°Р· Рё РїР»Р°С‚РёС‚СЃСЏ РѕРґРёРЅ СЂР°Р·
                File cd = new File(ctx.getCacheDir(), "ttsc"); cd.mkdirs();
                String key; try { java.security.MessageDigest md = java.security.MessageDigest.getInstance("SHA-1"); byte[] h = md.digest((v + "|" + speed + "|" + text).getBytes("UTF-8")); StringBuilder sb = new StringBuilder(); for (byte x : h) sb.append(String.format("%02x", x)); key = sb.toString(); } catch (Throwable e) { key = "x" + (v + speed + text).hashCode(); }
                f = new File(cd, key + ".mp3");
                if (f.exists() && f.length() > 0) { f.setLastModified(System.currentTimeMillis()); }
                else {
                    String r = Net.post(Store.api(ctx.getApplicationContext(), "tts", ""), new org.json.JSONObject().put("text", text).put("voice", v.substring(2)).put("speed", speed).toString());
                    String b64 = r == null ? "" : new org.json.JSONObject(r).optString("audio", "");
                    if (b64.length() == 0) throw new Exception("no audio");
                    File tmp = new File(cd, key + ".tmp"); FileOutputStream o = new FileOutputStream(tmp); o.write(android.util.Base64.decode(b64, android.util.Base64.DEFAULT)); o.close();
                    if (!tmp.renameTo(f)) f = tmp;
                    long tot = 0; File[] all = cd.listFiles(); if (all != null) for (File x : all) tot += x.length();
                    if (tot > 30L * 1024 * 1024 && all != null) {   // Р±РѕР»СЊС€Рµ 30 РњР‘ вЂ” СѓРґР°Р»СЏРµРј СЃР°РјС‹Рµ СЃС‚Р°СЂС‹Рµ, РїРѕРєР° РЅРµ СЃС‚Р°РЅРµС‚ ~20 РњР‘
                        java.util.Arrays.sort(all, new java.util.Comparator<File>() { public int compare(File x, File y) { return Long.compare(x.lastModified(), y.lastModified()); } });
                        for (File x : all) { if (tot <= 20L * 1024 * 1024) break; if (x.equals(f)) continue; tot -= x.length(); x.delete(); }
                    }
                }
                final Object lock = new Object(); final boolean[] fin = {false};
                android.media.MediaPlayer mp = new android.media.MediaPlayer();
                mp.setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ASSISTANT).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build());
                mp.setDataSource(f.getPath()); mp.prepare(); if (my != token) { try { mp.release(); } catch (Throwable e) {} return; } curMp = mp;
                mp.setOnCompletionListener(new android.media.MediaPlayer.OnCompletionListener() { public void onCompletion(android.media.MediaPlayer m) { synchronized (lock) { fin[0] = true; lock.notifyAll(); } } });
                mp.start();
                synchronized (lock) { long t0 = System.currentTimeMillis(); while (!fin[0] && System.currentTimeMillis() - t0 < 25000) lock.wait(500); }
                try { mp.release(); } catch (Throwable e) {}
                if (curMp == mp) curMp = null; ok = my == token;
            } catch (Throwable e) { ok = false; }
            finally { end.end(ok); }
        } }).start();
    }
    static void speak(final Context ctx, final String v, final String text, final float speed, final Done end) {
        if (isCloud(v)) { cloud(ctx, v, text, speed, end); return; }
        new Thread(new Runnable() { public void run() {
            boolean ok = false; AudioTrack at = null;
            try {
                final OfflineTts t = engine(ctx.getApplicationContext(), v, speed);
                final int sr = t.getSampleRate();
                int min = AudioTrack.getMinBufferSize(sr, AudioFormat.CHANNEL_OUT_MONO, AudioFormat.ENCODING_PCM_FLOAT);
                at = new AudioTrack.Builder().setAudioAttributes(new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ASSISTANT).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
                    .setAudioFormat(new AudioFormat.Builder().setEncoding(AudioFormat.ENCODING_PCM_FLOAT).setSampleRate(sr).setChannelMask(AudioFormat.CHANNEL_OUT_MONO).build())
                    .setBufferSizeInBytes(Math.max(min, sr * 4)).setTransferMode(AudioTrack.MODE_STREAM).build();
                final AudioTrack tr = at; tr.play();
                t.generateWithCallback(text, 0, 1.0f, new OfflineTtsCallback() { public Integer invoke(float[] s) { tr.write(s, 0, s.length, AudioTrack.WRITE_BLOCKING); return 1; } });
                // РґРѕР¶РёРґР°РµРјСЃСЏ, РїРѕРєР° РґРѕРёРіСЂР°РµС‚ С…РІРѕСЃС‚
                Thread.sleep(250); at.stop(); ok = true;
            } catch (Throwable e) { ok = false; }
            finally { try { if (at != null) at.release(); } catch (Throwable e) {} end.end(ok); }
        } }).start();
    }
}
