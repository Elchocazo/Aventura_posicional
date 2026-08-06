package com.ejemplo.aventuramatematica;

import android.os.Bundle;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // CRÍTICO: Instalar SplashScreen ANTES de super.onCreate()
        // Esto le indica a Android que la Activity tomará control del Splash Screen nativo
        // y evita que la pantalla quede en blanco después del splash del sistema
        SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
    }
}
