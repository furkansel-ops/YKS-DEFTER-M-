package com.furkansel.yksdefterim;

import android.Manifest;
import android.content.Intent;
import android.os.Build;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.PermissionState;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(name = "FocusNotifications", permissions = {
        @Permission(alias = "notifications", strings = { Manifest.permission.POST_NOTIFICATIONS })
})
public final class FocusNotificationsPlugin extends Plugin implements FocusNotificationsRuntime.Listener {
    private volatile boolean destroyed;
    @Override public void load() {
        FocusNotificationsRuntime.channel(getContext());
        FocusNotificationsRuntime.addListener(this);
        open(getActivity().getIntent());
    }

    @PluginMethod public void request(PluginCall call) {
        FocusNotificationsRuntime.execute(() -> call.resolve(FocusNotificationsRuntime.request(getContext(), call.getData())));
    }

    /** Invoked only by the explicit notification opt-in button in the web layer. */
    @PluginMethod public void requestPermission(PluginCall call) {
        if (Build.VERSION.SDK_INT < 33 || getPermissionState("notifications") == PermissionState.GRANTED) {
            call.resolve(FocusNotificationsRuntime.capabilities(getContext()));
            return;
        }
        FocusNotificationsRuntime.preferences(getContext()).edit().putBoolean("permissionAsked", true).apply();
        requestPermissionForAlias("notifications", call, "notificationPermissionResult");
    }

    @PermissionCallback private void notificationPermissionResult(PluginCall call) {
        call.resolve(FocusNotificationsRuntime.capabilities(getContext()));
    }

    @Override public void stateChanged(JSObject event) {
        // Capacitor adds/removes JS listeners on its bridge thread. Dispatch there
        // too, rather than reading the listener map from the persistence executor.
        getBridge().execute(() -> { if (!destroyed) notifyListeners("stateChanged", event); });
    }
    @Override protected void handleOnNewIntent(Intent intent) { open(intent); }
    private void open(Intent intent) {
        if (intent == null || !FocusNotificationsRuntime.OPEN.equals(intent.getAction())) return;
        intent.setAction(Intent.ACTION_MAIN);
        // Retain a cold-start body tap until the JS adapter has registered.
        getBridge().execute(() -> {
            if (!destroyed) notifyListeners("open", new JSObject().put("type", "YKS_FOCUS_OPEN"), true);
        });
    }
    @Override protected void handleOnDestroy() {
        destroyed = true;
        FocusNotificationsRuntime.removeListener(this);
    }
}
