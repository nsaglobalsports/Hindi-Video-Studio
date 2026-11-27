package com.hindivideostudio.app.data

import com.hindivideostudio.app.model.JobStatus
import com.hindivideostudio.app.model.VideoProject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import java.util.concurrent.TimeUnit

@Serializable
data class HealthCheckResult(
    val online: Boolean,
    val latencyMs: Long? = null,
    val message: String
)

@Serializable
data class ScenePayloadItem(
    val visualPrompt: String = "",
    val voiceScript: String = "",
    val screenText: String = ""
)

@Serializable
data class RenderSubmitPayload(
    val topicPrompt: String,
    val scriptText: String = "",
    val formatId: String,
    val aspectRatio: String,
    val videoType: String,
    val style: String,
    val voiceId: String,
    val scriptAiProvider: String,
    val sceneCount: Int,
    val scenes: List<ScenePayloadItem> = emptyList()
)

@Serializable
data class RenderJobResponse(
    val jobId: String,
    val status: String,
    val progress: Int = 0,
    val stage: String = "Queued on Render Node",
    val mp4Url: String? = null,
    val error: String? = null
)

class RenderNodeClient {
    private val client = OkHttpClient.Builder()
        .connectTimeout(5, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
    }

    suspend fun checkHealth(baseUrl: String): HealthCheckResult = withContext(Dispatchers.IO) {
        val normalized = normalizeUrl(baseUrl)
        if (normalized.isEmpty()) {
            return@withContext HealthCheckResult(
                online = false,
                message = "No Render Node URL configured"
            )
        }

        val start = System.currentTimeMillis()
        val apiHealthRequest = Request.Builder()
            .url("$normalized/api/health")
            .get()
            .build()

        try {
            client.newCall(apiHealthRequest).execute().use { firstResponse ->
                val response = if (firstResponse.code == 404) {
                    firstResponse.close()
                    client.newCall(
                        Request.Builder().url("$normalized/health").get().build()
                    ).execute()
                } else {
                    firstResponse
                }
                response.use { res ->
                    val elapsed = System.currentTimeMillis() - start
                    if (res.isSuccessful) {
                        HealthCheckResult(
                            online = true,
                            latencyMs = elapsed,
                            message = "Connected (${elapsed} ms)"
                        )
                    } else {
                        HealthCheckResult(
                            online = false,
                            latencyMs = elapsed,
                            message = "Node returned HTTP ${res.code}"
                        )
                    }
                }
            }
        } catch (e: Exception) {
            HealthCheckResult(
                online = false,
                message = e.localizedMessage ?: "Connection unreachable"
            )
        }
    }

    suspend fun submitRenderJob(baseUrl: String, project: VideoProject): Result<RenderJobResponse> =
        withContext(Dispatchers.IO) {
            val normalized = normalizeUrl(baseUrl)
            if (normalized.isEmpty()) {
                return@withContext Result.failure(IllegalStateException("Render Node URL is empty"))
            }

            val payload = RenderSubmitPayload(
                topicPrompt = project.topicPrompt,
                scriptText = project.scenes.firstOrNull()?.voiceScript.orEmpty(),
                formatId = project.format.id,
                aspectRatio = project.format.ratioLabel,
                videoType = project.videoTypeId,
                style = project.style.displayName,
                voiceId = project.voiceId,
                scriptAiProvider = project.scriptAiId,
                sceneCount = project.sceneCount,
                // The complete script is sent once; the server performs internal scene splitting.
                scenes = emptyList()
            )

            val body = json.encodeToString(payload)
                .toRequestBody("application/json; charset=utf-8".toMediaType())

            val request = Request.Builder()
                .url("$normalized/api/render")
                .post(body)
                .build()

            try {
                client.newCall(request).execute().use { response ->
                    val responseBody = response.body?.string().orEmpty()
                    if (!response.isSuccessful) {
                        return@withContext Result.failure(
                            IllegalStateException("Render Node HTTP ${response.code}: $responseBody")
                        )
                    }
                    val parsed = json.decodeFromString<RenderJobResponse>(responseBody)
                    Result.success(parsed.copy(mp4Url = resolveMediaUrl(normalized, parsed.mp4Url)))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun pollJobStatus(baseUrl: String, jobId: String): Result<RenderJobResponse> =
        withContext(Dispatchers.IO) {
            val normalized = normalizeUrl(baseUrl)
            val request = Request.Builder()
                .url("$normalized/api/jobs/$jobId")
                .get()
                .build()

            try {
                client.newCall(request).execute().use { response ->
                    val responseBody = response.body?.string().orEmpty()
                    if (!response.isSuccessful) {
                        return@withContext Result.failure(
                            IllegalStateException("Poll HTTP ${response.code}")
                        )
                    }
                    val parsed = json.decodeFromString<RenderJobResponse>(responseBody)
                    Result.success(parsed.copy(mp4Url = resolveMediaUrl(normalized, parsed.mp4Url)))
                }
            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    fun mapRemoteStatus(status: String): JobStatus = when (status.lowercase()) {
        "completed", "done" -> JobStatus.COMPLETED
        "failed", "error" -> JobStatus.FAILED
        "rendering", "processing" -> JobStatus.RENDERING
        else -> JobStatus.QUEUED
    }

    private fun resolveMediaUrl(baseUrl: String, mp4Url: String?): String? {
        if (mp4Url.isNullOrBlank()) return null
        if (mp4Url.startsWith("http://") || mp4Url.startsWith("https://")) return mp4Url
        val path = if (mp4Url.startsWith("/")) mp4Url else "/$mp4Url"
        return "$baseUrl$path"
    }

    private fun normalizeUrl(raw: String): String =
        raw.trim().removeSuffix("/")
}
