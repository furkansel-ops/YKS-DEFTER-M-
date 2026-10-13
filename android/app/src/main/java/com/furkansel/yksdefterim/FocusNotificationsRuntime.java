package com.furkansel.yksdefterim;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.AlarmManager;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Build;
import android.os.SystemClock;
import android.provider.Settings;
import android.service.notification.StatusBarNotification;
import androidx.core.app.NotificationCompat;
import androidx.core.content.ContextCompat;
import com.getcapacitor.JSObject;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import org.json.JSONException;
import org.json.JSONObject;

/** One serialized native owner shared by the bridge and process-restarting receiver. */
final class FocusNotificationsRuntime {
    static final String OPEN = "com.furkansel.yksdefterim.FOCUS_OPEN";
    static final String CONTROL = "com.furkansel.yksdefterim.FOCUS_CONTROL";
    static final String CHANNEL = "yks-focus-timer-v1";
    static final int NOTIFICATION_ID = 41001;
    private static final String PREFS = "yks-focus-native-v1";
    private static final ExecutorService EXECUTOR = Executors.newSingleThreadExecutor();
    interface Listener { void stateChanged(JSObject value); }
    private static final Set<Listener> LISTENERS = new CopyOnWriteArraySet<>();

    static void execute(Runnable action) { EXECUTOR.execute(action); }
    static void addListener(Listener listener) { LISTENERS.add(listener); }
    static void removeListener(Listener listener) { LISTENERS.remove(listener); }
    static SharedPreferences preferences(Context context) { return context.getSharedPreferences(PREFS, Context.MODE_PRIVATE); }

    private static FocusState.Clock now(Context context) {
        return new FocusState.Clock(System.currentTimeMillis(), SystemClock.elapsedRealtime(),
                Settings.Global.getInt(context.getContentResolver(), Settings.Global.BOOT_COUNT, -1));
    }

    static synchronized JSObject request(Context context, JSONObject request) {
        try {
            Object operation = request.opt("operation");
            if (!("read".equals(operation) || "sync".equals(operation) || "clear".equals(operation))) throw error("invalid_operation");
            Object requestId = request.opt("requestId");
            if (requestId != null && (!(requestId instanceof String) || ((String) requestId).length() > 160)) throw error("invalid_request");
            FocusState.Clock now = now(context);
            FocusState.Record before = load(context, now, (String) requestId);
            if ("read".equals(operation)) return response(context, before, true, null, null);
            long expected = FocusState.revision(request.opt("expectedRevision"));
            if (request.has("reveal") && !(request.opt("reveal") instanceof Boolean)) throw error("invalid_request");
            boolean clear = "clear".equals(operation);
            if (!clear && !(request.opt("enabled") instanceof Boolean)) throw error("invalid_request");
            FocusState.Snapshot snapshot = clear ? null : FocusState.Snapshot.parse(map(request.optJSONObject("snapshot")));
            FocusState.Result result = FocusState.update(before, expected, snapshot,
                    !clear && Boolean.TRUE.equals(request.opt("enabled")), Boolean.TRUE.equals(request.opt("reveal")), now);
            if (!result.ok) return response(context, before, false, "revision_conflict", null);
            save(context, result.record);
            String notificationError = render(context, result.record);
            broadcast(context, result.record, (String) requestId);
            return response(context, result.record, true, null, notificationError);
        } catch (IllegalArgumentException exception) {
            return failure(context, exception.getMessage());
        } catch (Exception exception) {
            return failure(context, "storage_unavailable");
        }
    }

    static synchronized void receive(Context context, Intent intent) {
        if (!CONTROL.equals(intent.getAction())) return;
        try {
            FocusState.Clock now = now(context);
            FocusState.Record before = load(context, now, null);
            String id = intent.getStringExtra("id"), action = intent.getStringExtra("control");
            long revision = intent.getLongExtra("revision", -1);
            FocusState.Record after = FocusState.action(before, id, revision, action, now);
            if (before == after) return;
            save(context, after);
            render(context, after);
            broadcast(context, after, null);
        } catch (Exception ignored) {
            // Never launch an Activity or destroy the last durable timer on an
            // action error. The app's next read reports any storage failure.
        }
    }

    private static FocusState.Record load(Context context, FocusState.Clock now, String requestId) throws JSONException {
        String value = preferences(context).getString("record", null);
        if (value == null) return FocusState.Record.empty(now);
        JSONObject data = new JSONObject(value);
        long revision = FocusState.revision(data.opt("revision"));
        FocusState.Snapshot snapshot = data.isNull("snapshot") ? null : FocusState.Snapshot.parse(map(data.getJSONObject("snapshot")));
        FocusState.Record stored = new FocusState.Record(revision, snapshot,
                new FocusState.Clock(data.getLong("wall"), data.getLong("uptime"), data.getInt("boot")),
                data.getBoolean("enabled"), data.getString("dismissedId"));
        FocusState.Record current = FocusState.prune(stored, now);
        if (current != stored) {
            save(context, current);
            render(context, current);
            broadcast(context, current, requestId);
        }
        return current;
    }

    private static void save(Context context, FocusState.Record record) throws JSONException {
        JSONObject value = new JSONObject();
        value.put("revision", record.revision);
        value.put("snapshot", json(record.snapshot));
        value.put("wall", record.anchor.wall); value.put("uptime", record.anchor.elapsed); value.put("boot", record.anchor.boot);
        value.put("enabled", record.enabled); value.put("dismissedId", record.dismissedId);
        // commit is intentional: acknowledge and render only after durable storage.
        if (!preferences(context).edit().putString("record", value.toString()).commit()) throw error("storage_unavailable");
    }

    private static Map<String, Object> map(JSONObject object) {
        if (object == null) return null;
        Map<String, Object> result = new LinkedHashMap<>();
        Iterator<String> keys = object.keys();
        while (keys.hasNext()) { String key = keys.next(); result.put(key, object.opt(key)); }
        return result;
    }
    private static Object json(FocusState.Snapshot value) { return value == null ? JSONObject.NULL : new JSONObject(value.data()); }
    private static JSObject visible(Context context, FocusState.Record record) {
        return new JSObject().put("revision", record.revision).put("snapshot", json(record.current(now(context))));
    }
    private static JSObject response(Context context, FocusState.Record record, boolean ok, String error, String notificationError) {
        JSObject response = visible(context, record).put("ok", ok).put("capabilities", capabilities(context));
        if (error != null) response.put("error", error);
        if (notificationError != null) response.put("notificationError", notificationError);
        return response;
    }
    private static JSObject failure(Context context, String error) {
        return new JSObject().put("ok", false).put("revision", 0).put("snapshot", JSONObject.NULL)
                .put("error", error).put("capabilities", capabilities(context));
    }
    private static void broadcast(Context context, FocusState.Record record, String requestId) {
        JSObject event = visible(context, record).put("type", "YKS_FOCUS_STATE");
        if (requestId != null) event.put("requestId", requestId);
        for (Listener listener : LISTENERS) {
            try { listener.stateChanged(event); } catch (RuntimeException ignored) { /* A closed web view cannot undo a saved timer. */ }
        }
    }

    static void channel(Context context) {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL, "Odak sayacı", NotificationManager.IMPORTANCE_LOW);
        channel.setDescription("Odak ve kronometreyi bildirimden duraklatıp devam ettir.");
        channel.setSound(null, null); channel.enableVibration(false);
        context.getSystemService(NotificationManager.class).createNotificationChannel(channel);
    }

    static JSObject capabilities(Context context) {
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        boolean runtime = Build.VERSION.SDK_INT < 33 || ContextCompat.checkSelfPermission(context, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
        boolean available = runtime && manager.areNotificationsEnabled();
        if (Build.VERSION.SDK_INT >= 26) {
            NotificationChannel channel = manager.getNotificationChannel(CHANNEL);
            available = available && (channel == null || channel.getImportance() != NotificationManager.IMPORTANCE_NONE);
        }
        String permission = available ? "granted" : !runtime && !preferences(context).getBoolean("permissionAsked", false) ? "prompt" : "denied";
        boolean supported = Build.VERSION.SDK_INT >= 36, allowed = false, promoted = false;
        if (supported) {
            allowed = manager.canPostPromotedNotifications();
            for (StatusBarNotification notification : manager.getActiveNotifications()) {
                if (notification.getId() == NOTIFICATION_ID) promoted = (notification.getNotification().flags & Notification.FLAG_PROMOTED_ONGOING) != 0;
            }
        }
        return new JSObject().put("permission", permission).put("liveUpdatesSupported", supported)
                .put("promotionAllowed", available && allowed).put("promoted", promoted);
    }

    @SuppressLint("MissingPermission") // Runtime permission and channel are checked immediately below.
    private static String render(Context context, FocusState.Record record) {
        NotificationManager manager = context.getSystemService(NotificationManager.class);
        cancelAlarm(context);
        if (!record.visible()) {
            manager.cancel(NOTIFICATION_ID);
            cancelControl(context, 1); cancelControl(context, 2);
            return null;
        }
        channel(context);
        if (!"granted".equals(capabilities(context).getString("permission"))) {
            manager.cancel(NOTIFICATION_ID);
            cancelControl(context, 1); cancelControl(context, 2);
            return "notification_unavailable";
        }
        try {
            FocusState.Snapshot snapshot = record.current(now(context));
            boolean running = snapshot.running() && !snapshot.expired();
            String subject = snapshot.subject.isEmpty() ? snapshot.isWork ? "Odak oturumu" : "Mola" : snapshot.subject;
            String title = snapshot.stopwatch() ? running ? "Kronometre sürüyor" : "Kronometre duraklatıldı"
                    : snapshot.expired() ? snapshot.isWork ? "Odak süresi doldu" : "Mola süresi doldu"
                    : snapshot.isWork ? running ? "Odak sürüyor" : "Odak duraklatıldı"
                    : running ? "Mola sürüyor" : "Mola duraklatıldı";
            String detail = snapshot.expired() ? "Tamamlamak için bildirime dokun"
                    : running ? "Duraklatmak için aşağıdaki düğmeyi kullan"
                    : (snapshot.stopwatch() ? "Geçen süre: " : "Kalan süre: ") + duration(snapshot.stopwatch() ? snapshot.elapsed / 1000 : snapshot.left);
            NotificationCompat.Builder builder = new NotificationCompat.Builder(context, CHANNEL)
                    .setSmallIcon(R.drawable.ic_focus_notification).setContentTitle(title)
                    .setContentText(subject + " · " + detail).setCategory(NotificationCompat.CATEGORY_PROGRESS)
                    .setVisibility(NotificationCompat.VISIBILITY_PRIVATE).setOnlyAlertOnce(true).setSilent(true)
                    .setOngoing(!snapshot.expired()).setAutoCancel(false)
                    .setContentIntent(openIntent(context)).setDeleteIntent(controlIntent(context, record, "dismiss", 2));
            if (running) {
                builder.setWhen(snapshot.stopwatch() ? System.currentTimeMillis() - snapshot.elapsed : snapshot.endAt)
                        .setUsesChronometer(true).setChronometerCountDown(!snapshot.stopwatch()).setShowWhen(true);
            } else builder.setShowWhen(false).setUsesChronometer(false);
            if (!snapshot.expired()) {
                String control = running ? "pause" : "resume";
                builder.addAction(new NotificationCompat.Action.Builder(0, running ? "Duraklat" : "Devam et",
                        controlIntent(context, record, control, 1)).setShowsUserInterface(false).build());
            }
            // Android/OEM settings decide actual promotion. Only running sessions
            // request a live chip; pausing leaves an ordinary resumable notification.
            if (Build.VERSION.SDK_INT >= 36) builder.setRequestPromotedOngoing(running);
            manager.notify(NOTIFICATION_ID, builder.build());
            if (running && !snapshot.stopwatch()) scheduleExpiry(context, record, snapshot.left);
            return null;
        } catch (RuntimeException exception) { return "notification_unavailable"; }
    }

    private static PendingIntent openIntent(Context context) {
        Intent intent = new Intent(context, MainActivity.class).setAction(OPEN)
                .addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        return PendingIntent.getActivity(context, 41001, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
    private static PendingIntent controlIntent(Context context, FocusState.Record record, String control, int code) {
        Intent intent = new Intent(context, FocusNotificationReceiver.class).setAction(CONTROL)
                .setData(Uri.parse("yks-focus://control/" + code))
                .putExtra("control", control).putExtra("id", record.snapshot.id).putExtra("revision", record.revision);
        // Replacing the token cancels old visible actions rather than retargeting
        // an old pause tap to the new session's resume action.
        return PendingIntent.getBroadcast(context, 41000 + code, intent, PendingIntent.FLAG_CANCEL_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }
    private static void cancelAlarm(Context context) {
        Intent intent = new Intent(context, FocusNotificationReceiver.class).setAction(CONTROL)
                .setData(Uri.parse("yks-focus://control/3"));
        PendingIntent pending = PendingIntent.getBroadcast(context, 41003, intent, PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
        if (pending != null) { context.getSystemService(AlarmManager.class).cancel(pending); pending.cancel(); }
    }
    private static void cancelControl(Context context, int code) {
        Intent intent = new Intent(context, FocusNotificationReceiver.class).setAction(CONTROL)
                .setData(Uri.parse("yks-focus://control/" + code));
        PendingIntent pending = PendingIntent.getBroadcast(context, 41000 + code, intent,
                PendingIntent.FLAG_NO_CREATE | PendingIntent.FLAG_IMMUTABLE);
        if (pending != null) pending.cancel();
    }
    private static void scheduleExpiry(Context context, FocusState.Record record, int left) {
        // Inexact by design: SystemUI drives the timer continuously; this callback
        // only retires the chip. Doze may delay it; no exact-alarm permission.
        context.getSystemService(AlarmManager.class).setAndAllowWhileIdle(AlarmManager.ELAPSED_REALTIME_WAKEUP,
                SystemClock.elapsedRealtime() + left * 1000L, controlIntent(context, record, "expire", 3));
    }
    private static String duration(long seconds) {
        return String.format(Locale.forLanguageTag("tr-TR"), "%d dk %02d sn", seconds / 60, seconds % 60);
    }
    private static IllegalArgumentException error(String code) { return new IllegalArgumentException(code); }
}
