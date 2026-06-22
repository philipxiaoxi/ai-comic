package com.superapp.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "installed_apps")
data class InstalledApp(
    @PrimaryKey
    val appId: String,
    val name: String,
    val icon: String,
    val version: String,
    val installPath: String,
    val installedAt: Long = System.currentTimeMillis(),
    val lastOpenedAt: Long = System.currentTimeMillis()
)
