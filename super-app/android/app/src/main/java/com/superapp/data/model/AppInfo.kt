package com.superapp.data.model

import com.google.gson.annotations.SerializedName

data class AppInfo(
    @SerializedName("_id")
    val id: String,
    val name: String,
    val description: String,
    val version: String,
    val icon: String,
    @SerializedName("packageUrl")
    val packageUrl: String,
    @SerializedName("packageSize")
    val packageSize: Long,
    val status: String,
    val developer: String,
    val category: String,
    @SerializedName("downloadCount")
    val downloadCount: Int = 0,
    @SerializedName("createdAt")
    val createdAt: String? = null,
    @SerializedName("updatedAt")
    val updatedAt: String? = null
)

data class AppManifest(
    val name: String,
    val version: String,
    val icon: String?,
    val description: String?,
    val apiBaseUrl: String?,
    val permissions: List<String>?
)
