import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  BackHandler,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { SvgXml } from 'react-native-svg';

const APP_URL = 'https://blui.online/home';
const BRAND = '#172653';
const LOGO = "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 512 288\"><path fill=\"#172653\" fill-rule=\"evenodd\" d=\"M10,148 L10,151 L29,167 L80,201 L102,212 L123,220 L158,230 L170,231 L185,252 L199,263 L214,271 L238,277 L243,277 L244,275 L243,264 L245,262 L244,259 L246,252 L252,240 L262,228 L267,225 L295,216 L322,204 L362,178 L384,161 L390,164 L413,184 L435,207 L439,209 L464,237 L476,227 L473,222 L473,158 L479,156 L501,157 L500,141 L473,140 L473,114 L458,115 L459,140 L457,142 L433,141 L431,143 L432,157 L457,157 L459,159 L459,203 L456,204 L443,190 L399,150 L406,142 L425,126 L462,89 L476,73 L465,62 L461,64 L419,109 L384,139 L374,131 L380,110 L393,97 L408,92 L407,89 L390,72 L382,67 L373,64 L357,65 L343,72 L323,93 L315,76 L300,61 L283,52 L236,35 L216,22 L203,10 L202,42 L204,44 L203,47 L205,49 L205,53 L211,65 L210,67 L195,64 L177,57 L176,55 L170,53 L143,34 L141,34 L142,50 L146,67 L146,71 L144,73 L118,80 L76,100 L50,116Z M34,149 L57,131 L79,117 L117,98 L151,87 L170,124 L190,147 L205,157 L220,164 L240,169 L256,171 L238,190 L222,202 L206,209 L189,214 L169,215 L142,209 L127,203 L119,202 L83,184 L76,178 L53,164Z M190,237 L185,230 L186,228 L197,226 L214,220 L234,209 L250,197 L267,179 L273,170 L281,153 L268,156 L254,157 L237,155 L218,149 L202,139 L189,127 L181,117 L182,116 L185,116 L203,125 L226,130 L240,131 L244,129 L244,119 L224,117 L211,114 L186,103 L170,87 L165,80 L158,65 L159,61 L178,72 L195,78 L222,84 L237,84 L260,87 L272,90 L283,95 L292,101 L302,112 L307,123 L309,138 L316,138 L322,136 L321,123 L317,112 L330,105 L352,82 L362,77 L371,77 L378,80 L386,86 L379,91 L370,101 L364,115 L365,116 L363,118 L364,119 L362,121 L363,122 L355,148 L347,163 L340,172 L320,188 L289,202 L273,206 L255,217 L239,236 L234,247 L235,248 L231,261 L229,262 L213,256 L202,249Z M215,39 L216,38 L243,52 L281,65 L291,71 L303,82 L308,92 L308,95 L307,96 L294,85 L269,75 L233,71 L221,56Z\"/></svg>";
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
          <View style={styles.brandMark}><SvgXml xml={LOGO} width={31} height={18} /></View>
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
