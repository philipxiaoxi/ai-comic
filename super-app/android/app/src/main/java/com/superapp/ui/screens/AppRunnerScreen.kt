package com.superapp.ui.screens

import android.annotation.SuppressLint
import android.webkit.*
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView
import androidx.hilt.navigation.compose.hiltViewModel
import com.superapp.service.LocalResourceLoader
import com.superapp.ui.viewmodel.AppRunnerViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AppRunnerScreen(
    appId: String,
    onBack: () -> Unit,
    viewModel: AppRunnerViewModel = hiltViewModel()
) {
    val isLoading by viewModel.isLoading.collectAsState()
    val pageTitle by viewModel.pageTitle.collectAsState()

    LaunchedEffect(appId) {
        viewModel.loadApp(appId)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(pageTitle) },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "返回")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.refresh() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "刷新")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.layout { measurable, constraints ->
                        val placeable = measurable.measure(constraints)
                        layout(placeable.width, placeable.height) {
                            placeable.placeRelative(
                                (constraints.maxWidth - placeable.width) / 2,
                                (constraints.maxHeight - placeable.height) / 2
                            )
                        }
                    }
                )
            }

            viewModel.webView?.let { webView ->
                AndroidView(
                    factory = { webView },
                    modifier = Modifier.fillMaxSize()
                )
            }
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun AppWebView(
    appId: String,
    resourceLoader: LocalResourceLoader,
    onPageTitleChanged: (String) -> Unit,
    onLoadingChanged: (Boolean) -> Unit
): WebView {
    val context = androidx.compose.ui.platform.LocalContext.current

    val webView = remember {
        WebView(context).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                cacheMode = WebSettings.LOAD_DEFAULT
            }

            webViewClient = object : WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView?,
                    request: WebResourceRequest?
                ): WebResourceResponse? {
                    val url = request?.url?.toString() ?: return null

                    // Try to load from local storage first
                    resourceLoader.interceptRequest(url, appId)?.let {
                        return it
                    }

                    // Fall back to network for API calls or external resources
                    return super.shouldInterceptRequest(view, request)
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    onLoadingChanged(false)
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onReceivedTitle(view: WebView?, title: String?) {
                    super.onReceivedTitle(view, title)
                    title?.let { onPageTitleChanged(it) }
                }
            }

            // Add JavaScript bridge
            addJavascriptInterface(
                SuperAppBridge(context, appId),
                "SuperApp"
            )
        }
    }

    return webView
}

class SuperAppBridge(
    private val context: android.content.Context,
    private val appId: String
) {
    @JavascriptInterface
    fun getAppId(): String = appId

    @JavascriptInterface
    fun getApiBaseUrl(): String {
        // Return configured API base URL for this app
        return "https://api.example.com" // TODO: Get from manifest
    }

    @JavascriptInterface
    fun showToast(message: String) {
        android.widget.Toast.makeText(context, message, android.widget.Toast.LENGTH_SHORT).show()
    }

    @JavascriptInterface
    fun close() {
        // Close the WebView activity
        (context as? android.app.Activity)?.finish()
    }
}
