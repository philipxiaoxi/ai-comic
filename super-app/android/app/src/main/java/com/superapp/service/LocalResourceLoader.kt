package com.superapp.service

import android.webkit.WebResourceResponse
import com.superapp.data.local.InstalledAppDao
import com.superapp.data.model.AppManifest
import com.google.gson.Gson
import java.io.File
import java.io.FileInputStream
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class LocalResourceLoader @Inject constructor(
    private val installManager: AppInstallManager,
    private val installedAppDao: InstalledAppDao,
    private val gson: Gson
) {
    companion object {
        private val MIME_TYPES = mapOf(
            "html" to "text/html",
            "css" to "text/css",
            "js" to "application/javascript",
            "json" to "application/json",
            "png" to "image/png",
            "jpg" to "image/jpeg",
            "jpeg" to "image/jpeg",
            "gif" to "image/gif",
            "svg" to "image/svg+xml",
            "ico" to "image/x-icon",
            "woff" to "font/woff",
            "woff2" to "font/woff2",
            "ttf" to "font/ttf",
            "eot" to "application/vnd.ms-fontobject"
        )

        private const val LOCAL_PROTOCOL = "superapp"
        private const val LOCAL_HOST = "local"
    }

    fun getLocalUrl(appId: String): String {
        return "$LOCAL_PROTOCOL://$LOCAL_HOST/$appId/index.html"
    }

    fun getManifest(appId: String): AppManifest? {
        return try {
            val manifestFile = installManager.getManifestFile(appId)
            if (manifestFile.exists()) {
                gson.fromJson(manifestFile.readText(), AppManifest::class.java)
            } else {
                null
            }
        } catch (e: Exception) {
            null
        }
    }

    fun interceptRequest(url: String, appId: String): WebResourceResponse? {
        return try {
            val localPath = parseLocalPath(url, appId) ?: return null
            val file = File(localPath)

            if (!file.exists() || !file.canonicalPath.startsWith(
                    installManager.getAppDir(appId).canonicalPath
                )
            ) {
                return null
            }

            val mimeType = getMimeType(file.extension)
            val encoding = if (mimeType.startsWith("text/") || mimeType.contains("javascript") || mimeType.contains("json")) {
                "UTF-8"
            } else {
                null
            }

            WebResourceResponse(
                mimeType,
                encoding,
                FileInputStream(file)
            )
        } catch (e: Exception) {
            null
        }
    }

    private fun parseLocalPath(url: String, appId: String): String? {
        // Handle superapp://local/{appId}/path format
        if (url.startsWith("$LOCAL_PROTOCOL://$LOCAL_HOST/")) {
            val path = url.removePrefix("$LOCAL_PROTOCOL://$LOCAL_HOST/")
            val parts = path.split("/", limit = 2)
            if (parts.size >= 2) {
                val requestAppId = parts[0]
                val resourcePath = parts[1]
                if (requestAppId == appId) {
                    return File(installManager.getAppDir(appId), resourcePath).absolutePath
                }
            }
        }

        // Handle relative paths (when base URL is superapp://)
        if (!url.startsWith("http://") && !url.startsWith("https://")) {
            val cleanPath = url.removePrefix("/")
            return File(installManager.getAppDir(appId), cleanPath).absolutePath
        }

        return null
    }

    private fun getMimeType(extension: String): String {
        return MIME_TYPES[extension.lowercase()] ?: "application/octet-stream"
    }

    fun getApiBaseUrl(appId: String): String? {
        val manifest = getManifest(appId)
        return manifest?.apiBaseUrl
    }
}
