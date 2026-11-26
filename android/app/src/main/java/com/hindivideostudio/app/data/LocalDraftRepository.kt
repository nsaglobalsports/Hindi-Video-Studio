package com.hindivideostudio.app.data

import android.content.Context
import com.hindivideostudio.app.model.VideoProject
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json

class LocalDraftRepository(context: Context) {
    private val prefs = context.getSharedPreferences("hindi_video_studio_prefs", Context.MODE_PRIVATE)
    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    fun loadProjects(): List<VideoProject> {
        val raw = prefs.getString(KEY_PROJECTS, null) ?: return emptyList()
        return try {
            json.decodeFromString<List<VideoProject>>(raw)
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun saveProjects(projects: List<VideoProject>) {
        prefs.edit().putString(KEY_PROJECTS, json.encodeToString(projects)).apply()
    }

    fun loadEndpointUrl(): String {
        val saved = prefs.getString(KEY_ENDPOINT_URL, null)?.trim().orEmpty()
        // Migrate the old sample LAN address and local development URLs to production.
        val shouldMigrate = saved.isBlank() ||
            saved == "http://192.168.1.100:8000" ||
            saved == "http://localhost:3000" ||
            saved == "http://localhost:8000"
        if (shouldMigrate) {
            prefs.edit().putString(KEY_ENDPOINT_URL, DEFAULT_RENDER_URL).apply()
            return DEFAULT_RENDER_URL
        }
        return saved.removeSuffix("/")
    }

    fun saveEndpointUrl(url: String) {
        prefs.edit().putString(KEY_ENDPOINT_URL, url.trim()).apply()
    }

    fun exportManifestJson(project: VideoProject): String =
        Json { prettyPrint = true; encodeDefaults = true }.encodeToString(project)

    private companion object {
        const val KEY_PROJECTS = "saved_video_projects_v1"
        const val KEY_ENDPOINT_URL = "render_node_endpoint_url"
        const val DEFAULT_RENDER_URL = "https://hindi-video-studio.onrender.com"
    }
}
