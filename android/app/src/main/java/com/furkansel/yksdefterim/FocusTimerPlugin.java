package com.furkansel.yksdefterim;

import android.Manifest;
import android.content.Context;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;

import java.lang.ref.WeakReference;

@CapacitorPlugin(
    name = "FocusTimer",
    permissions = {
        @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
    }
)
public class FocusTimerPlugin extends Plugin {
    private static WeakReference<FocusTimerPlugin> instance = new WeakReference<>(null);

    @Override public void load() {
        instance = new WeakReference<>(this);
    }

    @PluginMethod public void sync(PluginCall call) {
        FocusTimerService.Snapshot s = new FocusTimerService.Snapshot();
        s.active = Boolean.TRUE.equals(call.getBoolean("active", false));
        s.mode = "sw".equals(call.getString("mode")) ? "sw" : "pomo";
        s.running = Boolean.TRUE.equals(call.getBoolean("running", false));
        s.isWork = !Boolean.FALSE.equals(call.getBoolean("isWork", true));
        s.totalMs = Math.max(0L, longValue(call, "totalMs"));
        s.remainingMs = Math.max(0L, longValue(call, "remainingMs"));
        s.elapsedMs = Math.max(0L, longValue(call, "elapsedMs"));
        s.startedAt = Math.max(0L, longValue(call, "startedAt"));
        s.subject = text(call.getString("subject"), 80);
        s.topic = text(call.getString("topic"), 100);
        s.task = text(call.getString("task"), 120);
        s.sessionId = text(call.getString("sessionId"), 80);
        s.creditedMinutes = Math.max(0, intValue(call, "creditedMinutes"));
        int todayMinutes = Math.max(0, intValue(call, "todayMinutes"));
        s.baseTodayMinutes = Math.max(0, todayMinutes - s.creditedMinutes);
        FocusTimerService.startOrSync(getContext(), s);
        call.resolve();
    }

    @PluginMethod public void getState(PluginCall call) {
        call.resolve(toJSObject(FocusTimerService.readState(getContext())));
    }

    @PluginMethod public void ack(PluginCall call) {
        FocusTimerService.acknowledge(getContext(), longValue(call, "revision"));
        call.resolve();
    }

    static void dispatchState(Context context) {
        FocusTimerPlugin plugin = instance.get();
        if (plugin == null) return;
        plugin.notifyListeners("focusAction", toJSObject(FocusTimerService.readState(context)), true);
    }

    static JSObject toJSObject(FocusTimerService.Snapshot s) {
        JSObject out = new JSObject();
        out.put("active", s.active);
        out.put("mode", s.mode);
        out.put("running", s.running);
        out.put("isWork", s.isWork);
        out.put("totalMs", s.totalMs);
        out.put("remainingMs", s.currentRemainingMs());
        out.put("elapsedMs", s.currentElapsedMs());
        out.put("startedAt", s.startedAt);
        out.put("updatedAt", s.updatedAt);
        out.put("actionAt", s.actionAt);
        out.put("segmentStartedAt", s.segmentStartedAt);
        out.put("segmentMs", s.segmentMs);
        out.put("revision", s.revision);
        out.put("creditedMinutes", s.creditedMinutes);
        out.put("baseTodayMinutes", s.baseTodayMinutes);
        out.put("subject", s.subject);
        out.put("topic", s.topic);
        out.put("task", s.task);
        out.put("sessionId", s.sessionId);
        out.put("pendingAction", s.pendingAction);
        return out;
    }

    private static long longValue(PluginCall call, String key) {
        Double value = call.getDouble(key);
        return value == null || !Double.isFinite(value) ? 0L : Math.max(0L, value.longValue());
    }
    private static int intValue(PluginCall call, String key) {
        Integer value = call.getInt(key);
        return value == null ? 0 : value;
    }
    private static String text(String value, int max) {
        String out = value == null ? "" : value.trim();
        return out.length() <= max ? out : out.substring(0, max);
    }
}
