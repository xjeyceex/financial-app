package com.jcmiguel.pesowise;

import android.os.Build;
import android.os.Bundle;
import android.view.Display;
import android.view.WindowManager;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Display display = getWindowManager().getDefaultDisplay();
            Display.Mode[] modes = display.getSupportedModes();
            Display.Mode bestMode = null;
            float highestRefreshRate = 0f;

            for (Display.Mode mode : modes) {
                if (mode.getRefreshRate() > highestRefreshRate) {
                    highestRefreshRate = mode.getRefreshRate();
                    bestMode = mode;
                }
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R && bestMode != null) {
                WindowManager.LayoutParams params = getWindow().getAttributes();
                params.preferredDisplayModeId = bestMode.getModeId();
                getWindow().setAttributes(params);
            }
        }
    }
}
