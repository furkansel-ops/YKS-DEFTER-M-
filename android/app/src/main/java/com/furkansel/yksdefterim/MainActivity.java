package com.furkansel.yksdefterim;

import com.getcapacitor.BridgeActivity;
import android.os.Bundle;

public class MainActivity extends BridgeActivity {
    @Override public void onCreate(Bundle savedInstanceState) {
        registerPlugin(FocusNotificationsPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
