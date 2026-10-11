package com.furkansel.yksdefterim;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;

/** Explicit, non-exported control receiver; never opens or resumes an Activity. */
public final class FocusNotificationReceiver extends BroadcastReceiver {
    @Override public void onReceive(Context context, Intent intent) {
        if (intent == null || !FocusNotificationsRuntime.CONTROL.equals(intent.getAction())) return;
        PendingResult pending = goAsync();
        Context application = context.getApplicationContext();
        FocusNotificationsRuntime.execute(() -> {
            try { FocusNotificationsRuntime.receive(application, intent); }
            finally { pending.finish(); }
        });
    }
}
