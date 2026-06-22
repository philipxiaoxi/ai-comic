package com.superapp.data.repository

import com.superapp.data.local.InstalledApp
import com.superapp.data.local.InstalledAppDao
import com.superapp.data.model.AppInfo
import com.superapp.data.remote.ApiService
import com.superapp.service.AppInstallManager
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class AppRepository @Inject constructor(
    private val apiService: ApiService,
    private val installedAppDao: InstalledAppDao,
    private val installManager: AppInstallManager
) {
    // Remote operations
    suspend fun getMarketApps(category: String? = null, search: String? = null): Result<List<AppInfo>> {
        return try {
            val response = apiService.getApps(category, search)
            if (response.isSuccessful) {
                Result.success(response.body() ?: emptyList())
            } else {
                Result.failure(Exception("Failed to fetch apps: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getAppDetail(appId: String): Result<AppInfo> {
        return try {
            val response = apiService.getAppById(appId)
            if (response.isSuccessful) {
                response.body()?.let { Result.success(it) }
                    ?: Result.failure(Exception("App not found"))
            } else {
                Result.failure(Exception("Failed to fetch app: ${response.message()}"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    // Local operations
    fun getInstalledApps(): Flow<List<InstalledApp>> {
        return installedAppDao.getAllInstalledApps()
    }

    suspend fun isAppInstalled(appId: String): Boolean {
        return installedAppDao.isAppInstalled(appId)
    }

    suspend fun installApp(appInfo: AppInfo): Result<Unit> {
        return try {
            val installPath = installManager.downloadAndExtract(appInfo)
            val installedApp = InstalledApp(
                appId = appInfo.id,
                name = appInfo.name,
                icon = appInfo.icon,
                version = appInfo.version,
                installPath = installPath
            )
            installedAppDao.insertApp(installedApp)
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun uninstallApp(appId: String): Result<Unit> {
        return try {
            installedAppDao.getAppById(appId)?.let { app ->
                installManager.deleteAppFiles(app.installPath)
                installedAppDao.deleteAppById(appId)
                Result.success(Unit)
            } ?: Result.failure(Exception("App not installed"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun updateLastOpened(appId: String) {
        installedAppDao.getAppById(appId)?.let { app ->
            installedAppDao.updateApp(app.copy(lastOpenedAt = System.currentTimeMillis()))
        }
    }

    suspend fun getInstalledApp(appId: String): InstalledApp? {
        return installedAppDao.getAppById(appId)
    }
}
