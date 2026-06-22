package com.superapp.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface InstalledAppDao {
    @Query("SELECT * FROM installed_apps ORDER BY lastOpenedAt DESC")
    fun getAllInstalledApps(): Flow<List<InstalledApp>>

    @Query("SELECT * FROM installed_apps WHERE appId = :appId")
    suspend fun getAppById(appId: String): InstalledApp?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertApp(app: InstalledApp)

    @Update
    suspend fun updateApp(app: InstalledApp)

    @Delete
    suspend fun deleteApp(app: InstalledApp)

    @Query("DELETE FROM installed_apps WHERE appId = :appId")
    suspend fun deleteAppById(appId: String)

    @Query("SELECT EXISTS(SELECT 1 FROM installed_apps WHERE appId = :appId)")
    suspend fun isAppInstalled(appId: String): Boolean
}
