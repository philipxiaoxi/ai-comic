package com.superapp.data.remote

import com.superapp.data.model.AppInfo
import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.Response
import retrofit2.http.*

interface ApiService {
    @GET("api/v1/apps")
    suspend fun getApps(
        @Query("category") category: String? = null,
        @Query("search") search: String? = null
    ): Response<List<AppInfo>>

    @GET("api/v1/apps/{id}")
    suspend fun getAppById(@Path("id") appId: String): Response<AppInfo>

    @GET("api/v1/apps/{id}/download")
    suspend fun downloadApp(@Path("id") appId: String): Response<okhttp3.ResponseBody>

    @Multipart
    @POST("api/v1/apps")
    suspend fun uploadApp(
        @Part("name") name: RequestBody,
        @Part("description") description: RequestBody,
        @Part("version") version: RequestBody,
        @Part("developer") developer: RequestBody,
        @Part("category") category: RequestBody,
        @Part packageFile: MultipartBody.Part,
        @Part iconFile: MultipartBody.Part?
    ): Response<AppInfo>

    @PUT("api/v1/apps/{id}")
    suspend fun updateApp(
        @Path("id") appId: String,
        @Body updateData: Map<String, Any>
    ): Response<AppInfo>

    @DELETE("api/v1/apps/{id}")
    suspend fun deleteApp(@Path("id") appId: String): Response<Unit>

    @GET("api/v1/config/api-base-url")
    suspend fun getApiBaseUrl(): Response<Map<String, String>>
}
