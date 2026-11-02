import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Linking,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';

const APP_URL = 'https://blui.online/home';
const BRAND = '#172653';
const ALLOWED_HOSTS = ['blui.online', 'www.blui.online'];

function isInternal(url: string) {
  try {
    const host = new URL(url).hostname;
    return ALLOWED_HOSTS.includes(host);
  } catch {
    return false;
  }
}

function BiblesynApp() {
  const web = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [loadingError, setLoadingError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleBack = useCallback(() => {
    if (canGoBack && web.current) {
      web.current.goBack();
      return true;
    }
    return false;
  }, [canGoBack]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBack);
    return () => subscription.remove();
  }, [handleBack]);

  const handleNavigation = useCallback((request: WebViewNavigation) => {
    if (request.url.startsWith('about:') || isInternal(request.url)) return true;
    if (/^(https?:|mailto:|tel:)/i.test(request.url)) {
      Linking.openURL(request.url).catch(() => undefined);
      return false;
    }
    return false;
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <StatusBar style="dark" backgroundColor="#FFFFFF" />
        <View style={styles.header}>
          <View style={styles.brandMark}><Text style={styles.brandInitial}>B</Text></View>
          <View style={styles.brandCopy}>
            <Text style={styles.brandName}>Biblesyn</Text>
            <Text style={styles.brandTagline}>Entenda a Palavra. Fortaleça o seu Espírito.</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Recarregar" onPress={() => { setLoadingError(false); web.current?.reload(); }} style={styles.reload}>
            <Text style={styles.reloadText}>↻</Text>
          </Pressable>
        </View>

        {loadingError ? (
          <View style={styles.error}>
            <Text style={styles.errorTitle}>Não foi possível ligar ao Biblesyn</Text>
            <Text style={styles.errorBody}>Verifique a sua ligação à Internet e tente novamente.</Text>
            <Pressable style={styles.retry} onPress={() => { setLoadingError(false); setIsLoading(true); web.current?.reload(); }}>
              <Text style={styles.retryText}>Tentar novamente</Text>
            </Pressable>
          </View>
        ) : (
          <WebView
            ref={web}
            source={{ uri: APP_URL }}
            style={styles.webview}
            onNavigationStateChange={(state) => setCanGoBack(state.canGoBack)}
            onShouldStartLoadWithRequest={handleNavigation}
            onLoadStart={() => { setIsLoading(true); setLoadingError(false); }}
            onLoadEnd={() => setIsLoading(false)}
            onError={() => { setIsLoading(false); setLoadingError(true); }}
            onHttpError={(event) => {
              if (event.nativeEvent.statusCode >= 500) setLoadingError(true);
            }}
            javaScriptEnabled
            domStorageEnabled
            sharedCookiesEnabled
            thirdPartyCookiesEnabled
            allowsBackForwardNavigationGestures
            setSupportMultipleWindows={false}
            pullToRefreshEnabled
            applicationNameForUserAgent="BiblesynAndroid/1.0"
            originWhitelist={['https://*', 'http://*', 'about:*']}
            mixedContentMode="never"
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
          />
        )}

        {isLoading && !loadingError && (
          <View pointerEvents="none" style={styles.loading}>
            <View style={styles.loadingBar} />
          </View>
        )}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

export default function App() {
  return <BiblesynApp />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    height: 64, paddingHorizontal: 16, flexDirection: 'row',
    alignItems: 'center', borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E8EAF0', backgroundColor: '#FFFFFF',
  },
  brandMark: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: BRAND,
    alignItems: 'center', justifyContent: 'center',
  },
  brandInitial: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  brandCopy: { flex: 1, marginLeft: 10 },
  brandName: { color: BRAND, fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  brandTagline: { color: '#73798A', fontSize: 10, marginTop: 1 },
  reload: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  reloadText: { color: BRAND, fontSize: 28 },
  webview: { flex: 1, backgroundColor: '#FFFFFF' },
  loading: { position: 'absolute', top: 63, left: 0, right: 0, height: 2, backgroundColor: '#E8EAF0' },
  loadingBar: { width: '38%', height: 2, backgroundColor: BRAND },
  error: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  errorTitle: { color: BRAND, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  errorBody: { color: '#687086', fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 10 },
  retry: { marginTop: 22, backgroundColor: BRAND, paddingHorizontal: 22, paddingVertical: 13, borderRadius: 12 },
  retryText: { color: '#FFFFFF', fontWeight: '700' },
});
