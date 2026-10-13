package com.furkansel.yksdefterim;

import static org.junit.Assert.*;
import android.Manifest;
import android.app.Notification;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.SystemClock;
import android.service.notification.StatusBarNotification;
import androidx.core.app.NotificationCompat;
import androidx.test.ext.junit.runners.AndroidJUnit4;
import androidx.test.platform.app.InstrumentationRegistry;
import com.getcapacitor.JSObject;
import org.json.JSONObject;
import org.junit.After;
import org.junit.Before;
import org.junit.Test;
import org.junit.runner.RunWith;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;

/** Run on an isolated Android emulator: these tests own the app's native timer. */
@RunWith(AndroidJUnit4.class)
public class FocusNotificationsInstrumentedTest {
    private Context context;
    private NotificationManager manager;

    @Before public void prepare() throws Exception {
        context = InstrumentationRegistry.getInstrumentation().getTargetContext();
        manager = context.getSystemService(NotificationManager.class);
        if (Build.VERSION.SDK_INT >= 33) {
            InstrumentationRegistry.getInstrumentation().getUiAutomation()
                    .grantRuntimePermission(context.getPackageName(), Manifest.permission.POST_NOTIFICATIONS);
        }
        clear();
    }

    @After public void cleanup() throws Exception { if (context != null) clear(); }

    private JSObject read() {
        return FocusNotificationsRuntime.request(context, new JSObject().put("operation", "read"));
    }
    private void clear() throws Exception {
        JSObject current = read();
        assertTrue(current.getBoolean("ok"));
        JSObject result = FocusNotificationsRuntime.request(context, new JSObject().put("operation", "clear")
                .put("expectedRevision", current.getLong("revision")));
        assertTrue(result.toString(), result.getBoolean("ok"));
    }
    private JSObject start(String mode) throws Exception {
        long now = System.currentTimeMillis();
        JSObject snapshot = new JSObject().put("version", 1).put("id", "instrumented:" + mode)
                .put("mode", mode).put("state", "running").put("isWork", true).put("total", 1500).put("left", 1500)
                .put("endAt", now + 1_500_000).put("startedAt", now).put("credited", 0).put("savedAt", now)
                .put("subject", "Türkçe").put("topic", "Paragraf").put("task", "test");
        if ("sw".equals(mode)) snapshot.put("elapsed", 0);
        JSObject result = FocusNotificationsRuntime.request(context, new JSObject().put("operation", "sync")
                .put("expectedRevision", read().getLong("revision")).put("snapshot", snapshot).put("enabled", true)
                .put("reveal", true).put("requestId", "instrumented-start"));
        assertTrue(result.toString(), result.getBoolean("ok"));
        assertFalse(result.toString(), result.has("notificationError"));
        return result;
    }
    private Notification notification() throws Exception {
        for (int attempt = 0; attempt < 40; attempt++) {
            for (StatusBarNotification item : manager.getActiveNotifications()) {
                if (item.getId() == FocusNotificationsRuntime.NOTIFICATION_ID) return item.getNotification();
            }
            Thread.sleep(50);
        }
        throw new AssertionError("Native focus notification did not appear");
    }
    private Notification notificationWithAction(String title) throws Exception {
        for (int attempt = 0; attempt < 40; attempt++) {
            Notification value = notification();
            if (value.actions != null && value.actions.length == 1 && title.contentEquals(value.actions[0].title)) return value;
            Thread.sleep(50);
        }
        throw new AssertionError("Notification action did not become " + title);
    }
    private JSONObject awaitState(String state, long afterRevision) throws Exception {
        for (int attempt = 0; attempt < 40; attempt++) {
            JSObject value = read();
            JSONObject snapshot = value.optJSONObject("snapshot");
            if (value.getLong("revision") > afterRevision && snapshot != null && state.equals(snapshot.getString("state"))) return snapshot;
            Thread.sleep(50);
        }
        throw new AssertionError("Native receiver did not persist " + state);
    }
    private void awaitAbsent() throws Exception {
        for (int attempt = 0; attempt < 40; attempt++) {
            boolean found = false;
            for (StatusBarNotification item : manager.getActiveNotifications()) {
                if (item.getId() == FocusNotificationsRuntime.NOTIFICATION_ID) found = true;
            }
            if (!found) return;
            Thread.sleep(50);
        }
        fail("Focus notification was not removed");
    }

    private String javascript(MainActivity activity, String script, long timeoutMs, String phase) throws Exception {
        assertTrue(phase + ": JavaScript deadline expired", timeoutMs > 0);
        CountDownLatch completed = new CountDownLatch(1);
        AtomicReference<String> result = new AtomicReference<>();
        AtomicReference<Throwable> failure = new AtomicReference<>();
        long deadline = SystemClock.elapsedRealtime() + timeoutMs;
        // Posting keeps a busy UI thread inside the same bounded callback wait.
        activity.runOnUiThread(() -> {
            try {
                activity.getBridge().getWebView().evaluateJavascript(script, value -> {
                    result.set(value); completed.countDown();
                });
            } catch (Throwable error) { failure.set(error); completed.countDown(); }
        });
        assertTrue(phase + ": WebView JavaScript callback timed out after " + timeoutMs + " ms",
                completed.await(Math.max(0, deadline - SystemClock.elapsedRealtime()), TimeUnit.MILLISECONDS));
        if (failure.get() != null) throw new AssertionError(phase + ": WebView JavaScript evaluation failed", failure.get());
        return result.get();
    }
    private void awaitJavascript(MainActivity activity, String condition, String label) throws Exception {
        awaitJavascript(activity, condition, label, 20_000, 5_000);
    }
    private void awaitJavascript(MainActivity activity, String condition, String label,
            long totalTimeoutMs, long callbackTimeoutMs) throws Exception {
        long deadline = SystemClock.elapsedRealtime() + totalTimeoutMs;
        String lastResult = "No WebView callback received";
        while (SystemClock.elapsedRealtime() < deadline) {
            long remaining = deadline - SystemClock.elapsedRealtime();
            // Read the condition and error together so navigation cannot split
            // a successful condition probe from its separate error probe.
            lastResult = javascript(activity, "JSON.stringify({ready:Boolean(" + condition
                    + "),error:window.__nativeFocusBridgeError||null,url:location.href})",
                    Math.min(callbackTimeoutMs, remaining), label);
            Object decoded = new org.json.JSONTokener(lastResult).nextValue();
            // A navigation can return null before the new document is ready.
            if (decoded instanceof String) {
                JSONObject state = new JSONObject((String) decoded);
                if (state.optBoolean("ready")) return;
                if (!state.isNull("error")) fail(label + ": " + state);
            }
            remaining = deadline - SystemClock.elapsedRealtime();
            if (remaining > 0) Thread.sleep(Math.min(100, remaining));
        }
        fail(label + ": deadline expired after " + totalTimeoutMs + " ms; last result: " + lastResult);
    }

    @Test public void realWebViewBootstrapStartsAndReceivesNativeTimerThroughCapacitor() throws Throwable {
        MainActivity activity = (MainActivity) InstrumentationRegistry.getInstrumentation().startActivitySync(
                new Intent(context, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        Throwable failure = null;
        try {
            // Cold API 36 CI logs showed system ANRs and delayed renderer frames
            // before bridge setup. Allow startup time without weakening assertions.
            awaitJavascript(activity,
                    "window.YKSFocusNotifications?.native && window.Capacitor?.Plugins?.FocusNotifications && typeof window.startPomo === 'function'",
                    "Packaged page did not install the real native adapter", 60_000, 15_000);
            javascript(activity, "(async()=>{try{"
                    + "await window.YKSFocusNotifications.restore(()=>{});"
                    + "if(await window.YKSFocusNotifications.enable()!=='granted')throw new Error('native notification permission unavailable');"
                    + "window.startPomo();await window.YKSFocusNotifications.refresh();window.__nativeFocusBridgeReady=true;"
                    + "}catch(error){window.__nativeFocusBridgeError=String(error?.stack||error);}})()",
                    5_000, "Start native timer through the WebView");
            awaitJavascript(activity, "window.__nativeFocusBridgeReady === true", "Real native request did not settle");
            JSObject current = read();
            JSONObject snapshot = current.getJSONObject("snapshot");
            assertEquals("pomo", snapshot.getString("mode"));
            assertEquals("running", snapshot.getString("state"));
            // This real native broadcast must reach the JS addListener callback;
            // separate state-machine or mocked-browser tests cannot prove that.
            notificationWithAction("Duraklat").actions[0].actionIntent.send();
            awaitState("paused", current.getLong("revision"));
            awaitJavascript(activity, "window.YKSFocusNotifications.snapshot()?.state === 'paused'",
                    "Native stateChanged event did not reach the real WebView");
        } catch (Throwable error) { failure = error; }
        finally {
            try {
                javascript(activity, "delete window.__nativeFocusBridgeError;(async()=>{try{await window.YKSFocusNotifications?.shutdown();}finally{window.__nativeFocusBridgeClosed=true;}})()",
                        5_000, "Shut down the native adapter");
                awaitJavascript(activity, "window.__nativeFocusBridgeClosed === true", "Native adapter did not shut down");
            } catch (Throwable cleanupError) {
                if (failure == null) failure = cleanupError; else failure.addSuppressed(cleanupError);
            }
            try {
                InstrumentationRegistry.getInstrumentation().runOnMainSync(activity::finish);
            } catch (Throwable finishError) {
                if (failure == null) failure = finishError; else failure.addSuppressed(finishError);
            }
        }
        if (failure != null) throw failure;
    }

    @Test public void controlsAreBroadcastsAndBodyIsTheOnlyActivityIntent() throws Exception {
        start("pomo");
        Notification notification = notification();
        assertEquals(1, notification.actions.length);
        assertNotNull(notification.contentIntent);
        if (Build.VERSION.SDK_INT >= 31) {
            assertTrue(notification.actions[0].actionIntent.isBroadcast());
            assertFalse(notification.actions[0].actionIntent.isActivity());
            assertTrue(notification.contentIntent.isActivity());
            assertTrue(notification.deleteIntent.isBroadcast());
        }
        assertFalse(NotificationCompat.getAction(notification, 0).getShowsUserInterface());
        assertTrue(notification.extras.getBoolean(Notification.EXTRA_SHOW_CHRONOMETER));
        assertTrue(notification.extras.getBoolean(Notification.EXTRA_CHRONOMETER_COUNT_DOWN));
        assertNotEquals(0, notification.flags & Notification.FLAG_ONGOING_EVENT);
        if (Build.VERSION.SDK_INT >= 36) assertTrue(notification.extras.getBoolean("android.requestPromotedOngoing"));
    }

    @Test public void actualPauseAndResumeReceiverPersistWithoutOpeningActivity() throws Exception {
        long revision = start("sw").getLong("revision");
        Thread.sleep(150);
        notification().actions[0].actionIntent.send();
        JSONObject paused = awaitState("paused", revision);
        long elapsed = paused.getLong("elapsed");
        assertTrue(elapsed > 0);
        Thread.sleep(250);
        // A fresh request reloads the durable SharedPreferences record every time;
        // no live Activity or in-memory timer object participates in this result.
        assertEquals(elapsed, read().getJSONObject("snapshot").getLong("elapsed"));
        Notification pauseNotification = notificationWithAction("Devam et");
        assertFalse(pauseNotification.extras.getBoolean(Notification.EXTRA_SHOW_CHRONOMETER));
        assertEquals("Devam et", pauseNotification.actions[0].title.toString());
        revision = read().getLong("revision");
        pauseNotification.actions[0].actionIntent.send();
        awaitState("running", revision);
        Thread.sleep(100);
        assertTrue(read().getJSONObject("snapshot").getLong("elapsed") >= elapsed + 100);
    }

    @Test public void dismissalSurvivesSyncUntilExplicitRevealAndClearCancelsEverything() throws Exception {
        start("pomo");
        notification().deleteIntent.send();
        awaitAbsent();
        JSObject current = read();
        JSObject request = new JSObject().put("operation", "sync").put("expectedRevision", current.getLong("revision"))
                .put("snapshot", current.getJSONObject("snapshot")).put("enabled", true);
        assertTrue(FocusNotificationsRuntime.request(context, request).getBoolean("ok"));
        awaitAbsent();
        request.put("expectedRevision", read().getLong("revision")).put("reveal", true);
        assertTrue(FocusNotificationsRuntime.request(context, request).getBoolean("ok"));
        Notification visible = notification();
        clear();
        awaitAbsent();
        assertTrue(read().isNull("snapshot"));
        // A token obtained before deleting all focus data cannot restore a session.
        try { visible.actions[0].actionIntent.send(); } catch (android.app.PendingIntent.CanceledException ignored) { }
        Thread.sleep(100);
        assertTrue(read().isNull("snapshot"));
    }

    @Test public void capabilitiesReflectActualSystemPermissionAndPromotion() throws Exception {
        start("pomo");
        Notification notification = notification();
        JSONObject capabilities = read().getJSONObject("capabilities");
        assertEquals("granted", capabilities.getString("permission"));
        assertEquals(Build.VERSION.SDK_INT >= 36, capabilities.getBoolean("liveUpdatesSupported"));
        if (Build.VERSION.SDK_INT >= 36) {
            assertEquals(manager.canPostPromotedNotifications(), capabilities.getBoolean("promotionAllowed"));
            assertEquals((notification.flags & Notification.FLAG_PROMOTED_ONGOING) != 0, capabilities.getBoolean("promoted"));
        }
    }

    @Test public void openingAnAbandonedNativeRecordClearsItWithoutNewCredit() throws Exception {
        long revision = start("sw").getLong("revision");
        JSONObject persisted = new JSONObject(FocusNotificationsRuntime.preferences(context).getString("record", ""));
        long oldWall = System.currentTimeMillis() - 7 * 86_400_000L;
        persisted.put("wall", oldWall).put("boot", -1);
        persisted.getJSONObject("snapshot").put("savedAt", oldWall).put("startedAt", oldWall);
        assertTrue(FocusNotificationsRuntime.preferences(context).edit().putString("record", persisted.toString()).commit());
        JSObject reopened = read();
        assertTrue(reopened.getBoolean("ok")); assertTrue(reopened.isNull("snapshot"));
        assertEquals(revision + 1, reopened.getLong("revision"));
        awaitAbsent();
        assertTrue(new JSONObject(FocusNotificationsRuntime.preferences(context).getString("record", "")).isNull("snapshot"));
    }
}
