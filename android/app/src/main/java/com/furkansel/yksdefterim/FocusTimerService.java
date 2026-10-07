package com.furkansel.yksdefterim;

import android.Manifest;
import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.app.Service;
import android.content.Context;
import android.content.pm.PackageManager;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;

import androidx.annotation.Nullable;
import androidx.core.app.NotificationCompat;
import androidx.core.app.NotificationManagerCompat;
import androidx.core.app.ServiceCompat;
import androidx.core.content.ContextCompat;

public class FocusTimerService extends Service {
    static final String ACTION_SYNC = "com.furkansel.yksdefterim.focus.SYNC";
    static final String ACTION_PAUSE = "com.furkansel.yksdefterim.focus.PAUSE";
    static final String ACTION_RESUME = "com.furkansel.yksdefterim.focus.RESUME";
    static final String ACTION_STOP = "com.furkansel.yksdefterim.focus.STOP";
    static final String CHANNEL_ID = "yks_focus_live";
    static final int NOTIFICATION_ID = 4044;
    private static final String PREFS = "yks_focus_native_v1";

    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable refreshRunnable = new Runnable() {
        @Override public void run() {
            Snapshot state = readState(FocusTimerService.this);
            if (!state.active || !state.running) return;
            if ("pomo".equals(state.mode) && state.currentRemainingMs() <= 0) {
                finishNaturally(state);
                return;
            }
            publish(state);
            scheduleRefresh(state);
        }
    };

    @Override public void onCreate() {
        super.onCreate();
        createChannel();
    }

    @Override public int onStartCommand(Intent intent, int flags, int startId) {
        String action = intent == null ? ACTION_SYNC : intent.getAction();
        if (ACTION_PAUSE.equals(action)) {
            pauseFromNotification();
            return START_STICKY;
        }
        if (ACTION_RESUME.equals(action)) {
            resumeFromNotification();
            return START_STICKY;
        }
        if (ACTION_STOP.equals(action)) {
            stopFromNotification();
            return START_NOT_STICKY;
        }
        syncFromIntent(intent);
        return START_STICKY;
    }

    private void syncFromIntent(Intent intent) {
        if (intent == null) return;
        boolean active = intent.getBooleanExtra("active", false);
        if (!active) {
            clearState(this);
            stopForegroundCompat();
            stopSelf();
            return;
        }
        Snapshot previous = readState(this);
        Snapshot state = new Snapshot();
        state.active = true;
        state.mode = safeMode(intent.getStringExtra("mode"));
        state.running = intent.getBooleanExtra("running", false);
        state.isWork = intent.getBooleanExtra("isWork", true);
        state.totalMs = Math.max(0L, intent.getLongExtra("totalMs", 0L));
        state.remainingMs = Math.max(0L, intent.getLongExtra("remainingMs", 0L));
        state.elapsedMs = Math.max(0L, intent.getLongExtra("elapsedMs", 0L));
        state.startedAt = Math.max(0L, intent.getLongExtra("startedAt", 0L));
        state.subject = trim(intent.getStringExtra("subject"), 80);
        state.topic = trim(intent.getStringExtra("topic"), 100);
        state.task = trim(intent.getStringExtra("task"), 120);
        state.sessionId = trim(intent.getStringExtra("sessionId"), 80);
        state.creditedMinutes = Math.max(0, intent.getIntExtra("creditedMinutes", 0));
        int todayMinutes = Math.max(0, intent.getIntExtra("todayMinutes", 0));
        state.baseTodayMinutes = Math.max(0, todayMinutes - state.creditedMinutes);
        state.updatedAt = System.currentTimeMillis();
        if (previous.sessionId.equals(state.sessionId)) {
            state.revision = previous.revision;
            state.pendingAction = previous.pendingAction;
            state.actionAt = previous.actionAt;
            state.segmentStartedAt = previous.segmentStartedAt;
            state.segmentMs = previous.segmentMs;
        }
        if (state.running) state.segmentStartedAt = state.updatedAt;
        saveState(this, state);
        publish(state);
        scheduleRefresh(state);
    }

    private void pauseFromNotification() {
        Snapshot state = readState(this);
        if (!state.active || !state.running) return;
        long now = System.currentTimeMillis();
        if ("pomo".equals(state.mode)) {
            state.remainingMs = state.currentRemainingMs(now);
            state.elapsedMs = Math.max(0L, state.totalMs - state.remainingMs);
        } else {
            state.elapsedMs = state.currentElapsedMs(now);
        }
        state.segmentMs = Math.max(0L, now - state.segmentStartedAt);
        state.running = false;
        state.updatedAt = now;
        state.actionAt = now;
        state.pendingAction = "pause";
        state.revision++;
        saveState(this, state);
        handler.removeCallbacks(refreshRunnable);
        publish(state);
        FocusTimerPlugin.dispatchState(this);
    }

    private void resumeFromNotification() {
        Snapshot state = readState(this);
        if (!state.active || state.running) return;
        long now = System.currentTimeMillis();
        state.running = true;
        state.updatedAt = now;
        state.actionAt = now;
        state.segmentStartedAt = now;
        state.segmentMs = 0L;
        state.pendingAction = "resume";
        state.revision++;
        saveState(this, state);
        publish(state);
        scheduleRefresh(state);
        FocusTimerPlugin.dispatchState(this);
    }

    private void stopFromNotification() {
        Snapshot state = readState(this);
        if (!state.active) return;
        long now = System.currentTimeMillis();
        if (state.running) {
            if ("pomo".equals(state.mode)) {
                state.remainingMs = state.currentRemainingMs(now);
                state.elapsedMs = Math.max(0L, state.totalMs - state.remainingMs);
            } else {
                state.elapsedMs = state.currentElapsedMs(now);
            }
            state.segmentMs = Math.max(0L, now - state.segmentStartedAt);
        }
        state.running = false;
        state.active = false;
        state.updatedAt = now;
        state.actionAt = now;
        state.pendingAction = "stop";
        state.revision++;
        saveState(this, state);
        handler.removeCallbacks(refreshRunnable);
        stopForegroundCompat();
        FocusTimerPlugin.dispatchState(this);
        stopSelf();
    }

    private void finishNaturally(Snapshot state) {
        long now = System.currentTimeMillis();
        state.remainingMs = 0L;
        state.elapsedMs = Math.max(state.elapsedMs, state.totalMs);
        state.running = false;
        state.active = false;
        state.updatedAt = now;
        state.actionAt = now;
        state.segmentMs = Math.max(0L, now - state.segmentStartedAt);
        state.pendingAction = "finish";
        state.revision++;
        saveState(this, state);
        handler.removeCallbacks(refreshRunnable);
        stopForegroundCompat();
        if (canPostNotifications()) {
            try {
                NotificationManagerCompat.from(this).notify(NOTIFICATION_ID, buildCompletedNotification(state));
            } catch (SecurityException ignored) {
                // Kullanıcı bildirim iznini servis çalışırken geri çekmiş olabilir.
            }
        }
        FocusTimerPlugin.dispatchState(this);
        stopSelf();
    }

    private void publish(Snapshot state) {
        if (!state.active) return;
        Notification notification = buildOngoingNotification(state);
        if (Build.VERSION.SDK_INT >= 34) {
            ServiceCompat.startForeground(this, NOTIFICATION_ID, notification,
                android.content.pm.ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE);
        } else {
            startForeground(NOTIFICATION_ID, notification);
        }
    }

    private Notification buildOngoingNotification(Snapshot state) {
        long now = System.currentTimeMillis();
        long remaining = state.currentRemainingMs(now);
        long elapsed = state.currentElapsedMs(now);
        String subject = state.subject.isEmpty() ? "Odak" : state.subject;
        String detail = state.topic.isEmpty() ? ("pomo".equals(state.mode) ? (state.isWork ? "Odak çalışması" : "Mola") : "Kronometre") : state.topic;
        int today = state.baseTodayMinutes;
        if (state.isWork || "sw".equals(state.mode)) today += (int)Math.floor(elapsed / 60000d);
        String todayLabel = formatMinutes(today);
        NotificationCompat.Builder builder = new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.yks_launcher_monochrome)
            .setContentTitle("YKS Defterim · " + subject)
            .setContentText(detail + " · Bugün " + todayLabel)
            .setStyle(new NotificationCompat.BigTextStyle().bigText(detail + " · Bugün " + todayLabel))
            .setCategory(NotificationCompat.CATEGORY_STOPWATCH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setSilent(true)
            .setContentIntent(openAppIntent())
            .setRequestPromotedOngoing(state.running);

        if (state.running) {
            builder.setUsesChronometer(true).setShowWhen(true);
            if ("pomo".equals(state.mode)) {
                builder.setWhen(now + remaining);
                builder.setChronometerCountDown(true);
            } else {
                builder.setWhen(now - elapsed);
                builder.setChronometerCountDown(false);
            }
            builder.addAction(0, "Duraklat", serviceAction(ACTION_PAUSE, 11));
        } else {
            builder.setUsesChronometer(false).setShowWhen(false);
            String frozen = "pomo".equals(state.mode) ? formatDuration(remaining) : formatDuration(elapsed);
            builder.setSubText("Duraklatıldı · " + frozen);
            builder.addAction(0, "Devam et", serviceAction(ACTION_RESUME, 12));
        }
        builder.addAction(0, "Bitir", serviceAction(ACTION_STOP, 13));
        return builder.build();
    }

    private Notification buildCompletedNotification(Snapshot state) {
        String subject = state.subject.isEmpty() ? "Odak" : state.subject;
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.drawable.yks_launcher_monochrome)
            .setContentTitle("Odak tamamlandı · " + subject)
            .setContentText("Süre tamamlandı. Kaydı görmek için YKS Defterim'i aç.")
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setAutoCancel(true)
            .setContentIntent(openAppIntent())
            .build();
    }

    private PendingIntent openAppIntent() {
        Intent open = new Intent(this, MainActivity.class);
        open.setFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        return PendingIntent.getActivity(this, 10, open, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private PendingIntent serviceAction(String action, int requestCode) {
        Intent intent = new Intent(this, FocusTimerService.class).setAction(action);
        return PendingIntent.getService(this, requestCode, intent, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    }

    private void scheduleRefresh(Snapshot state) {
        handler.removeCallbacks(refreshRunnable);
        if (!state.active || !state.running) return;
        long delay = 60000L;
        if ("pomo".equals(state.mode)) delay = Math.max(250L, Math.min(delay, state.currentRemainingMs()));
        handler.postDelayed(refreshRunnable, delay);
    }

    private void createChannel() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return;
        NotificationChannel channel = new NotificationChannel(CHANNEL_ID, "Odak canlı kontrolü", NotificationManager.IMPORTANCE_DEFAULT);
        channel.setDescription("Çalışma süresi devam ederken canlı sayaç ve duraklat/devam/bitir kontrolleri.");
        channel.setSound(null, null);
        channel.enableVibration(false);
        NotificationManager manager = getSystemService(NotificationManager.class);
        if (manager != null) manager.createNotificationChannel(channel);
    }

    private boolean canPostNotifications() {
        return Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU
            || ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    private void stopForegroundCompat() {
        handler.removeCallbacks(refreshRunnable);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) stopForeground(STOP_FOREGROUND_REMOVE);
        else stopForeground(true);
        NotificationManagerCompat.from(this).cancel(NOTIFICATION_ID);
    }

    @Override public void onDestroy() {
        handler.removeCallbacks(refreshRunnable);
        super.onDestroy();
    }

    @Nullable @Override public IBinder onBind(Intent intent) { return null; }

    static Intent syncIntent(Context context, Snapshot state) {
        Intent intent = new Intent(context, FocusTimerService.class).setAction(ACTION_SYNC);
        intent.putExtra("active", state.active);
        intent.putExtra("mode", state.mode);
        intent.putExtra("running", state.running);
        intent.putExtra("isWork", state.isWork);
        intent.putExtra("totalMs", state.totalMs);
        intent.putExtra("remainingMs", state.remainingMs);
        intent.putExtra("elapsedMs", state.elapsedMs);
        intent.putExtra("startedAt", state.startedAt);
        intent.putExtra("subject", state.subject);
        intent.putExtra("topic", state.topic);
        intent.putExtra("task", state.task);
        intent.putExtra("sessionId", state.sessionId);
        intent.putExtra("creditedMinutes", state.creditedMinutes);
        intent.putExtra("todayMinutes", state.baseTodayMinutes + state.creditedMinutes);
        return intent;
    }

    static void startOrSync(Context context, Snapshot state) {
        if (!state.active) {
            clearState(context);
            context.stopService(new Intent(context, FocusTimerService.class));
            NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID);
            return;
        }
        ContextCompat.startForegroundService(context, syncIntent(context, state));
    }

    static void acknowledge(Context context, long revision) {
        Snapshot state = readState(context);
        if (state.revision != revision) return;
        state.pendingAction = "";
        state.segmentMs = 0L;
        if (!state.running) state.segmentStartedAt = 0L;
        if (!state.active) {
            clearState(context);
            return;
        }
        saveState(context, state);
    }

    static Snapshot readState(Context context) {
        SharedPreferences p = context.getSharedPreferences(PREFS, MODE_PRIVATE);
        Snapshot s = new Snapshot();
        s.active = p.getBoolean("active", false);
        s.mode = safeMode(p.getString("mode", "pomo"));
        s.running = p.getBoolean("running", false);
        s.isWork = p.getBoolean("isWork", true);
        s.totalMs = p.getLong("totalMs", 0L);
        s.remainingMs = p.getLong("remainingMs", 0L);
        s.elapsedMs = p.getLong("elapsedMs", 0L);
        s.startedAt = p.getLong("startedAt", 0L);
        s.updatedAt = p.getLong("updatedAt", 0L);
        s.actionAt = p.getLong("actionAt", 0L);
        s.segmentStartedAt = p.getLong("segmentStartedAt", 0L);
        s.segmentMs = p.getLong("segmentMs", 0L);
        s.revision = p.getLong("revision", 0L);
        s.creditedMinutes = p.getInt("creditedMinutes", 0);
        s.baseTodayMinutes = p.getInt("baseTodayMinutes", 0);
        s.subject = p.getString("subject", "");
        s.topic = p.getString("topic", "");
        s.task = p.getString("task", "");
        s.sessionId = p.getString("sessionId", "");
        s.pendingAction = p.getString("pendingAction", "");
        return s;
    }

    static void saveState(Context context, Snapshot s) {
        context.getSharedPreferences(PREFS, MODE_PRIVATE).edit()
            .putBoolean("active", s.active)
            .putString("mode", s.mode)
            .putBoolean("running", s.running)
            .putBoolean("isWork", s.isWork)
            .putLong("totalMs", s.totalMs)
            .putLong("remainingMs", s.remainingMs)
            .putLong("elapsedMs", s.elapsedMs)
            .putLong("startedAt", s.startedAt)
            .putLong("updatedAt", s.updatedAt)
            .putLong("actionAt", s.actionAt)
            .putLong("segmentStartedAt", s.segmentStartedAt)
            .putLong("segmentMs", s.segmentMs)
            .putLong("revision", s.revision)
            .putInt("creditedMinutes", s.creditedMinutes)
            .putInt("baseTodayMinutes", s.baseTodayMinutes)
            .putString("subject", s.subject)
            .putString("topic", s.topic)
            .putString("task", s.task)
            .putString("sessionId", s.sessionId)
            .putString("pendingAction", s.pendingAction)
            .apply();
    }

    static void clearState(Context context) {
        context.getSharedPreferences(PREFS, MODE_PRIVATE).edit().clear().apply();
    }

    private static String safeMode(String mode) { return "sw".equals(mode) ? "sw" : "pomo"; }
    private static String trim(String value, int max) {
        String out = value == null ? "" : value.trim();
        return out.length() <= max ? out : out.substring(0, max);
    }
    private static String formatMinutes(int minutes) {
        minutes = Math.max(0, minutes);
        if (minutes < 60) return minutes + " dk";
        return (minutes / 60) + " sa " + (minutes % 60) + " dk";
    }
    private static String formatDuration(long millis) {
        long sec = Math.max(0L, millis / 1000L), h = sec / 3600L, m = (sec % 3600L) / 60L, s = sec % 60L;
        return h > 0 ? String.format(java.util.Locale.ROOT, "%d:%02d:%02d", h, m, s)
            : String.format(java.util.Locale.ROOT, "%02d:%02d", m, s);
    }

    static final class Snapshot {
        boolean active;
        String mode = "pomo";
        boolean running;
        boolean isWork = true;
        long totalMs;
        long remainingMs;
        long elapsedMs;
        long startedAt;
        long updatedAt;
        long actionAt;
        long segmentStartedAt;
        long segmentMs;
        long revision;
        int creditedMinutes;
        int baseTodayMinutes;
        String subject = "";
        String topic = "";
        String task = "";
        String sessionId = "";
        String pendingAction = "";

        long currentRemainingMs() { return currentRemainingMs(System.currentTimeMillis()); }
        long currentRemainingMs(long now) {
            if (!"pomo".equals(mode)) return 0L;
            if (!running) return Math.max(0L, remainingMs);
            return Math.max(0L, remainingMs - Math.max(0L, now - updatedAt));
        }
        long currentElapsedMs() { return currentElapsedMs(System.currentTimeMillis()); }
        long currentElapsedMs(long now) {
            if ("pomo".equals(mode)) return Math.max(0L, totalMs - currentRemainingMs(now));
            if (!running) return Math.max(0L, elapsedMs);
            return Math.max(0L, elapsedMs + Math.max(0L, now - updatedAt));
        }
    }
}
