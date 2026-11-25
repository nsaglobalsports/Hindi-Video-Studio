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

    fun loadEndpointUrl(): String =
        prefs.getString(KEY_ENDPOINT_URL, "https://hindi-video-studio.onrender.com")
            ?: "https://hindi-video-studio.onrender.com"

    fun saveEndpointUrl(url: String) {
        prefs.edit().putString(KEY_ENDPOINT_URL, url.trim()).apply()
    }

    fun exportManifestJson(project: VideoProject): String =
        Json { prettyPrint = true; encodeDefaults = true }.encodeToString(project)

    private companion object {
        const val KEY_PROJECTS = "saved_video_projects_v1"
        const val KEY_ENDPOINT_URL = "render_node_endpoint_url"
    }
}
