package com.superapp.ui.viewmodel

import android.content.Context
import android.webkit.WebView
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.superapp.data.repository.AppRepository
import com.superapp.service.LocalResourceLoader
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AppRunnerViewModel @Inject constructor(
    @ApplicationContext private val context: Context,
    private val repository: AppRepository,
    private val resourceLoader: LocalResourceLoader
) : ViewModel() {
    private val _isLoading = MutableStateFlow(true)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    private val _pageTitle = MutableStateFlow("加载中...")
    val pageTitle: StateFlow<String> = _pageTitle.asStateFlow()

    var webView: WebView? = null
        private set

    private var currentAppId: String? = null

    fun loadApp(appId: String) {
        currentAppId = appId
        viewModelScope.launch {
            _isLoading.value = true

            // Update last opened timestamp
            repository.updateLastOpened(appId)

            // Create and configure WebView
            webView = createWebView(appId)

            // Load the app
            val localUrl = resourceLoader.getLocalUrl(appId)
            webView?.loadUrl(localUrl)
        }
    }

    private fun createWebView(appId: String): WebView {
        return WebView(context).apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                mixedContentMode = android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                cacheMode = android.webkit.WebSettings.LOAD_DEFAULT
            }

            webViewClient = object : android.webkit.WebViewClient() {
                override fun shouldInterceptRequest(
                    view: WebView?,
                    request: android.webkit.WebResourceRequest?
                ): android.webkit.WebResourceResponse? {
                    val url = request?.url?.toString() ?: return null

                    resourceLoader.interceptRequest(url, appId)?.let {
                        return it
                    }

                    return super.shouldInterceptRequest(view, request)
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    _isLoading.value = false
                }
            }

            webChromeClient = object : android.webkit.WebChromeClient() {
                override fun onReceivedTitle(view: WebView?, title: String?) {
                    super.onReceivedTitle(view, title)
                    title?.let { _pageTitle.value = it }
                }
            }

            addJavascriptInterface(
                com.superapp.ui.screens.SuperAppBridge(context, appId),
                "SuperApp"
            )
        }
    }

    fun refresh() {
        webView?.reload()
    }

    override fun onCleared() {
        super.onCleared()
        webView?.destroy()
        webView = null
    }
}
