package com.superapp.service

import android.content.Context
import com.superapp.data.model.AppInfo
import com.superapp.data.remote.ApiService
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileOutputStream
import java.util.zip.ZipInputStream
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AppInstallManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val apiService: ApiService
) {
    private val appsDir: File
        get() = File(context.filesDir, "apps").also { it.mkdirs() }

    suspend fun downloadAndExtract(appInfo: AppInfo): String = withContext(Dispatchers.IO) {
        val appDir = File(appsDir, appInfo.id)
        appDir.mkdirs()

        // Download the package
        val response = apiService.downloadApp(appInfo.id)
        if (!response.isSuccessful) {
            throw Exception("Download failed: ${response.message()}")
        }

        val responseBody = response.body() ?: throw Exception("Empty response body")

        // Save and extract zip
        val zipFile = File(appDir, "package.zip")
        responseBody.byteStream().use { input ->
            FileOutputStream(zipFile).use { output ->
                input.copyTo(output)
            }
        }

        // Extract zip to app directory
        extractZip(zipFile, appDir)

        // Delete the zip file
        zipFile.delete()

        appDir.absolutePath
    }

    private fun extractZip(zipFile: File, targetDir: File) {
        ZipInputStream(zipFile.inputStream()).use { zip ->
            var entry = zip.nextEntry
            while (entry != null) {
                val file = File(targetDir, entry.name)

                // Security check: prevent path traversal
                if (!file.canonicalPath.startsWith(targetDir.canonicalPath)) {
                    throw SecurityException("Path traversal detected: ${entry.name}")
                }

                if (entry.isDirectory) {
                    file.mkdirs()
                } else {
                    file.parentFile?.mkdirs()
                    FileOutputStream(file).use { output ->
                        zip.copyTo(output)
                    }
                }

                zip.closeEntry()
                entry = zip.nextEntry
            }
        }
    }

    fun deleteAppFiles(installPath: String) {
        File(installPath).deleteRecursively()
    }

    fun getAppDir(appId: String): File {
        return File(appsDir, appId)
    }

    fun getManifestFile(appId: String): File {
        return File(getAppDir(appId), "manifest.json")
    }

    fun getIndexFile(appId: String): File {
        return File(getAppDir(appId), "index.html")
    }
}
