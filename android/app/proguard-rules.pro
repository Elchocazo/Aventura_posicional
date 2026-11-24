# ============================================================
# ProGuard / R8 rules for Capacitor + Android WebView app
# ============================================================

# --- Capacitor core ---
-keep class com.getcapacitor.** { *; }
-keep interface com.getcapacitor.** { *; }
-dontwarn com.getcapacitor.**

# --- WebView JavaScript Interface ---
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}
-keepattributes JavascriptInterface

# --- AndroidX / AppCompat ---
-keep class androidx.** { *; }
-dontwarn androidx.**

# --- Google AdMob ---
-keep class com.google.android.gms.ads.** { *; }
-dontwarn com.google.android.gms.**

# --- Google Play Billing ---
-keep class com.android.billingclient.** { *; }
-dontwarn com.android.billingclient.**

# --- Cordova plugins ---
-keep class org.apache.cordova.** { *; }
-dontwarn org.apache.cordova.**

# --- Keep app entry point ---
-keep class com.ejemplo.aventuramatematica.** { *; }

# --- Preserve line numbers for crash reports ---
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# --- Keep enums ---
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# --- Parcelable ---
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# --- Serializable ---
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
