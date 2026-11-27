
package com.hindivideostudio.app.data

import com.hindivideostudio.app.model.JobStatus
import com.hindivideostudio.app.model.VideoProject
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
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
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(30, TimeUnit.SECONDS)
        .build()

    private val json = Json {
        ignoreUnknownKeys = true
        encodeDefaults = true
        isLenient = true
    }

    suspend fun checkHealth(baseUrl: String): HealthCheckResult =
        withContext(Dispatchers.IO) {

            val normalized = normalizeUrl(baseUrl)

            if (normalized.isEmpty()) {
                return@withContext HealthCheckResult(
                    online = false,
                    message = "No Render Node URL configured"
                )
            }

            val start = System.currentTimeMillis()

            try {
                var response = client.newCall(
                    Request.Builder()
                        .url("$normalized/api/health")
                        .get()
                        .build()
                ).execute()

                if (response.code == 404) {
                    response.close()

                    response = client.newCall(
                        Request.Builder()
                            .url("$normalized/health")
                            .get()
                            .build()
                    ).execute()
                }

                response.use {
                    val elapsed = System.currentTimeMillis() - start

                    if (it.isSuccessful) {
                        HealthCheckResult(
                            online = true,
                            latencyMs = elapsed,
                            message = "Connected (${elapsed} ms)"
                        )
                    } else {
                        HealthCheckResult(
                            online = false,
                            latencyMs = elapsed,
                            message = "Node returned HTTP ${it.code}"
                        )
                    }
                }

            } catch (e: Exception) {
                HealthCheckResult(
                    online = false,
                    message = e.localizedMessage ?: "Connection unreachable"
                )
            }
        }

    suspend fun submitRenderJob(
        baseUrl: String,
        project: VideoProject
    ): Result<RenderJobResponse> =
        withContext(Dispatchers.IO) {

            val normalized = normalizeUrl(baseUrl)

            if (normalized.isEmpty()) {
                return@withContext Result.failure(
                    IllegalStateException("Render Node URL is empty")
                )
            }

            val payload = RenderSubmitPayload(
                topicPrompt = project.topicPrompt,
                scriptText = project.scenes.firstOrNull()
                    ?.voiceScript.orEmpty(),
                formatId = project.format.id,
                aspectRatio = project.format.ratioLabel,
                videoType = project.videoTypeId,
                style = project.style.displayName,
                voiceId = project.voiceId,
                scriptAiProvider = project.scriptAiId,
                sceneCount = project.sceneCount,
                scenes = emptyList()
            )

            val body = json.encodeToString(payload)
                .toRequestBody(
                    "application/json; charset=utf-8".toMediaType()
                )

            val request = Request.Builder()
                .url("$normalized/api/render")
                .post(body)
                .build()

            try {
                client.newCall(request).execute().use { response ->

                    val responseBody =
                        response.body?.string().orEmpty()

                    if (!response.isSuccessful) {
                        return@withContext Result.failure(
                            IllegalStateException(
                                "Render Node HTTP ${response.code}: $responseBody"
                            )
                        )
                    }

                    val parsed =
                        json.decodeFromString<RenderJobResponse>(
                            responseBody
                        )

                    Result.success(
                        parsed.copy(
                            mp4Url = resolveMediaUrl(
                                normalized,
                                parsed.mp4Url
                            )
                        )
                    )
                }

            } catch (e: Exception) {
                Result.failure(e)
            }
        }

    suspend fun pollJobStatus(
        baseUrl: String,
        jobId: String
    ): Result<RenderJobResponse> =
        withContext(Dispatchers.IO) {

            val normalized = normalizeUrl(baseUrl)

            if (normalized.isEmpty()) {
                return@withContext Result.failure(
                    IllegalStateException("Render Node URL is empty")
                )
            }

            if (jobId.isBlank()) {
                return@withContext Result.failure(
                    IllegalStateException("Render Job ID is empty")
                )
            }

            val request = Request.Builder()
                .url("$normalized/api/jobs/$jobId")
                .get()
                .build()

            var lastError: Throwable? = null

            // Retry temporary 404 and server/network errors.
            val retryDelays = listOf(
                1200L,
                2500L,
                5000L
            )

            for (attempt in 0..retryDelays.size) {

                val responseResult = runCatching {

                    client.newCall(request).execute().use { response ->

                        val responseBody =
                            response.body?.string().orEmpty()

                        if (!response.isSuccessful) {
                            throw IllegalStateException(
                                "Poll HTTP ${response.code}: $responseBody"
                            )
                        }

                        val parsed =
                            json.decodeFromString<RenderJobResponse>(
                                responseBody
                            )

                        parsed.copy(
                            mp4Url = resolveMediaUrl(
                                normalized,
                                parsed.mp4Url
                            )
                        )
                    }
                }

                if (responseResult.isSuccess) {
                    return@withContext Result.success(
                        responseResult.getOrThrow()
                    )
                }

                lastError = responseResult.exceptionOrNull()

                val message = lastError?.message.orEmpty()

                val retryable =
                    message.contains("Poll HTTP 404") ||
                    message.contains("Poll HTTP 429") ||
                    message.contains("Poll HTTP 500") ||
                    message.contains("Poll HTTP 502") ||
                    message.contains("Poll HTTP 503") ||
                    message.contains("Poll HTTP 504") ||
                    lastError is java.io.IOException

                if (!retryable || attempt == retryDelays.size) {
                    return@withContext Result.failure(
                        lastError ?: IllegalStateException(
                            "Job polling failed"
                        )
                    )
                }

                delay(retryDelays[attempt])
            }

            Result.failure(
                lastError ?: IllegalStateException(
                    "Job polling failed"
                )
            )
        }

    fun mapRemoteStatus(status: String): JobStatus =
        when (status.lowercase()) {
            "completed", "done" ->
                JobStatus.COMPLETED

            "failed", "error" ->
                JobStatus.FAILED

            "rendering", "processing" ->
                JobStatus.RENDERING

            else ->
                JobStatus.QUEUED
        }

    private fun resolveMediaUrl(
        baseUrl: String,
        mp4Url: String?
    ): String? {

        if (mp4Url.isNullOrBlank()) return null

        if (
            mp4Url.startsWith("http://") ||
            mp4Url.startsWith("https://")
        ) {
            return mp4Url
        }

        val path =
            if (mp4Url.startsWith("/")) mp4Url
            else "/$mp4Url"

        return "$baseUrl$path"
    }

    private fun normalizeUrl(raw: String): String =
        raw.trim().removeSuffix("/")
}
