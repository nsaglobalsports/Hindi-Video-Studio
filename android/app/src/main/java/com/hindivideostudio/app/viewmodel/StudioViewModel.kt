package com.hindivideostudio.app.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.hindivideostudio.app.data.LocalDraftRepository
import com.hindivideostudio.app.data.RenderNodeClient
import com.hindivideostudio.app.model.ActiveScreen
import com.hindivideostudio.app.model.GenerationProgressState
import com.hindivideostudio.app.model.HindiVoice
import com.hindivideostudio.app.model.JobStatus
import com.hindivideostudio.app.model.NodeConnectionStatus
import com.hindivideostudio.app.model.RenderNodeState
import com.hindivideostudio.app.model.SceneDraftInput
import com.hindivideostudio.app.model.ScenePlan
import com.hindivideostudio.app.model.ScriptAiProvider
import com.hindivideostudio.app.model.StudioCatalog
import com.hindivideostudio.app.model.StudioTab
import com.hindivideostudio.app.model.VideoFormat
import com.hindivideostudio.app.model.VideoProject
import com.hindivideostudio.app.model.VideoStyle
import com.hindivideostudio.app.model.VideoType
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

data class StudioUiState(
    val activeTab: StudioTab = StudioTab.STUDIO,
    val activeScreen: ActiveScreen = ActiveScreen.MAIN_DASHBOARD,
    val validationError: String? = null,
    val selectedFormat: VideoFormat = VideoFormat.SHORTS_9_16,
    val selectedVideoType: VideoType = VideoType.REALISTIC_3D,
    val selectedStyle: VideoStyle = VideoStyle.EDUCATIONAL,
    val selectedVoice: HindiVoice = StudioCatalog.hindiVoices.first(),
    val selectedScriptAi: ScriptAiProvider = StudioCatalog.scriptAiProviders.first(),
    val scriptText: String = "",
    val sceneDrafts: List<SceneDraftInput> = List(StudioCatalog.DEFAULT_SCENE_SLOTS) { SceneDraftInput() },
    val renderNode: RenderNodeState = RenderNodeState(),
    val isNodeSheetOpen: Boolean = false,
    val libraryProjects: List<VideoProject> = emptyList(),
    val librarySearchQuery: String = "",
    val libraryFilter: String = "ALL",
    val generationState: GenerationProgressState = GenerationProgressState(),
    val selectedPreviewProject: VideoProject? = null,
    val statusBannerMessage: String? = null
)

class StudioViewModel(application: Application) : AndroidViewModel(application) {
    private val repository = LocalDraftRepository(application.applicationContext)
    private val renderClient = RenderNodeClient()
    private var pollingJob: Job? = null

    private val _uiState = MutableStateFlow(
        StudioUiState(
            libraryProjects = repository.loadProjects(),
            renderNode = RenderNodeState(endpointUrl = repository.loadEndpointUrl())
        )
    )
    val uiState: StateFlow<StudioUiState> = _uiState.asStateFlow()

    init {
        checkRenderNodeHealth()
    }

    fun selectTab(tab: StudioTab) {
        _uiState.update {
            it.copy(
                activeTab = tab,
                activeScreen = ActiveScreen.MAIN_DASHBOARD,
                statusBannerMessage = null
            )
        }
    }

    fun startNewVideo() {
        pollingJob?.cancel()
        _uiState.update {
            it.copy(
                activeTab = StudioTab.STUDIO,
                activeScreen = ActiveScreen.MAIN_DASHBOARD,
                validationError = null,
                selectedFormat = VideoFormat.SHORTS_9_16,
                selectedVideoType = VideoType.REALISTIC_3D,
                selectedStyle = VideoStyle.EDUCATIONAL,
                selectedVoice = StudioCatalog.hindiVoices.first(),
                selectedScriptAi = StudioCatalog.scriptAiProviders.first(),
                scriptText = "",
                sceneDrafts = List(StudioCatalog.DEFAULT_SCENE_SLOTS) { SceneDraftInput() },
                statusBannerMessage = "Ready for a new Hindi video project"
            )
        }
    }

    fun selectFormat(format: VideoFormat) {
        _uiState.update { it.copy(selectedFormat = format) }
    }

    fun selectVideoType(videoType: VideoType) {
        _uiState.update { it.copy(selectedVideoType = videoType) }
    }

    fun selectStyle(style: VideoStyle) {
        _uiState.update { it.copy(selectedStyle = style) }
    }

    fun selectVoice(voice: HindiVoice) {
        _uiState.update { it.copy(selectedVoice = voice) }
    }

    fun selectScriptAi(provider: ScriptAiProvider) {
        _uiState.update { it.copy(selectedScriptAi = provider) }
    }

    fun updateScriptText(value: String) {
        _uiState.update { it.copy(scriptText = value, validationError = null) }
    }

    fun updateSceneVisual(index: Int, value: String) {
        _uiState.update { state ->
            val mutable = state.sceneDrafts.toMutableList()
            if (index in mutable.indices) {
                mutable[index] = mutable[index].copy(visualPrompt = value)
            }
            state.copy(sceneDrafts = mutable, validationError = null)
        }
    }

    fun updateSceneVoice(index: Int, value: String) {
        _uiState.update { state ->
            val mutable = state.sceneDrafts.toMutableList()
            if (index in mutable.indices) {
                mutable[index] = mutable[index].copy(voiceScript = value)
            }
            state.copy(sceneDrafts = mutable, validationError = null)
        }
    }

    fun updateSceneScreenText(index: Int, value: String) {
        _uiState.update { state ->
            val mutable = state.sceneDrafts.toMutableList()
            if (index in mutable.indices) {
                mutable[index] = mutable[index].copy(screenText = value)
            }
            state.copy(sceneDrafts = mutable, validationError = null)
        }
    }

    fun addSceneSlot() {
        _uiState.update { state ->
            state.copy(sceneDrafts = state.sceneDrafts + SceneDraftInput())
        }
    }

    fun clearAllScenes() {
        _uiState.update { state ->
            val size = maxOf(StudioCatalog.DEFAULT_SCENE_SLOTS, state.sceneDrafts.size)
            state.copy(sceneDrafts = List(size) { SceneDraftInput() }, validationError = null)
        }
    }

    fun openNodeConfigSheet(open: Boolean) {
        _uiState.update { it.copy(isNodeSheetOpen = open) }
    }

    fun updateRenderNodeUrl(url: String) {
        repository.saveEndpointUrl(url)
        _uiState.update {
            it.copy(renderNode = it.renderNode.copy(endpointUrl = url.trim().removeSuffix("/")))
        }
        checkRenderNodeHealth()
    }

    fun checkRenderNodeHealth() {
        val currentUrl = _uiState.value.renderNode.endpointUrl
        _uiState.update {
            it.copy(
                renderNode = it.renderNode.copy(
                    status = NodeConnectionStatus.CHECKING,
                    statusDetail = "Checking $currentUrl/api/health..."
                )
            )
        }
        viewModelScope.launch {
            val result = renderClient.checkHealth(currentUrl)
            _uiState.update {
                it.copy(
                    renderNode = it.renderNode.copy(
                        status = if (result.online) NodeConnectionStatus.ONLINE else NodeConnectionStatus.OFFLINE,
                        latencyMs = result.latencyMs,
                        statusDetail = result.message
                    )
                )
            }
        }
    }

    fun onGenerateHindiVideoClick() {
        val state = _uiState.value
        val script = state.scriptText.trim()
        if (script.isEmpty()) {
            _uiState.update { it.copy(validationError = "कृपया पूरी हिंदी स्क्रिप्ट लिखें या पेस्ट करें।") }
            return
        }
        val draftProject = buildProjectFromState(state, JobStatus.LOCAL_DRAFT)
        // Save immediately so a failed/slow render request never loses the user's project.
        upsertProjectInLibrary(draftProject)

        if (state.renderNode.status != NodeConnectionStatus.ONLINE) {
            _uiState.update {
                it.copy(
                    activeScreen = ActiveScreen.GENERATION_PROGRESS,
                    generationState = GenerationProgressState(
                        project = draftProject,
                        stageLabel = "Render Node Offline — Backend Required for MP4 Synthesis",
                        progressPercent = 0,
                        isSubmitting = false,
                        errorMessage = "Your Render Node is offline (${state.renderNode.statusDetail})."
                    )
                )
            }
            return
        }

        _uiState.update {
            it.copy(
                activeScreen = ActiveScreen.GENERATION_PROGRESS,
                generationState = GenerationProgressState(
                    project = draftProject.copy(status = JobStatus.QUEUED),
                    stageLabel = "Submitting active scenes to Render Node...",
                    progressPercent = 10,
                    isSubmitting = true,
                    errorMessage = null
                )
            )
        }

        viewModelScope.launch {
            val submitResult = renderClient.submitRenderJob(state.renderNode.endpointUrl, draftProject)
            submitResult.onSuccess { jobResp ->
                val queuedProject = draftProject.copy(
                    status = renderClient.mapRemoteStatus(jobResp.status),
                    remoteJobId = jobResp.jobId,
                    mp4Url = jobResp.mp4Url
                )
                upsertProjectInLibrary(queuedProject)
                _uiState.update {
                    it.copy(
                        generationState = GenerationProgressState(
                            project = queuedProject,
                            stageLabel = jobResp.stage,
                            progressPercent = jobResp.progress,
                            isSubmitting = false
                        )
                    )
                }
                startPollingJob(state.renderNode.endpointUrl, queuedProject)
            }.onFailure { err ->
                _uiState.update {
                    it.copy(
                        generationState = GenerationProgressState(
                            project = draftProject,
                            stageLabel = "Render Node Request Failed",
                            progressPercent = 0,
                            isSubmitting = false,
                            errorMessage = err.localizedMessage ?: "Failed to submit job to Render Node"
                        )
                    )
                }
            }
        }
    }

    private fun startPollingJob(endpointUrl: String, project: VideoProject) {
        val jobId = project.remoteJobId ?: return
        pollingJob?.cancel()
        pollingJob = viewModelScope.launch {
            var consecutiveFailures = 0
            while (isActive) {
                delay(2500L)
                val poll = renderClient.pollJobStatus(endpointUrl, jobId)
                poll.onSuccess { resp ->
                    consecutiveFailures = 0
                    val mappedStatus = renderClient.mapRemoteStatus(resp.status)
                    val updatedProject = project.copy(
                        status = mappedStatus,
                        mp4Url = resp.mp4Url ?: project.mp4Url
                    )
                    upsertProjectInLibrary(updatedProject)
                    _uiState.update {
                        it.copy(
                            generationState = GenerationProgressState(
                                project = updatedProject,
                                stageLabel = resp.stage,
                                progressPercent = resp.progress.coerceIn(0, 100),
                                errorMessage = resp.error
                            )
                        )
                    }
                    if (mappedStatus == JobStatus.COMPLETED || mappedStatus == JobStatus.FAILED) {
                        pollingJob?.cancel()
                    }
                }.onFailure { err ->
                    consecutiveFailures += 1
                    _uiState.update {
                        it.copy(
                            generationState = it.generationState.copy(
                                stageLabel = "Reconnecting to Render Server…",
                                errorMessage = if (consecutiveFailures >= 5)
                                    "Render server से संपर्क नहीं हो पा रहा। फिर से जाँच जारी है: ${err.localizedMessage}"
                                else
                                    "Connection retry $consecutiveFailures/5…"
                            )
                        )
                    }
                    // Keep polling: temporary mobile-network changes must not abandon a render.
                }
            }
        }
    }

    fun saveCurrentGenerationAsLocalDraft() {
        val project = _uiState.value.generationState.project ?: return
        val saved = project.copy(status = JobStatus.LOCAL_DRAFT)
        upsertProjectInLibrary(saved)
        _uiState.update {
            it.copy(
                activeTab = StudioTab.LIBRARY,
                activeScreen = ActiveScreen.MAIN_DASHBOARD,
                statusBannerMessage = "Saved script draft to Library"
            )
        }
    }

    fun returnFromProgressToStudio() {
        // Keep the job monitor alive while the user navigates to the Studio or Library.
        _uiState.update { it.copy(activeScreen = ActiveScreen.MAIN_DASHBOARD) }
    }

    fun openProjectPreview(project: VideoProject) {
        _uiState.update {
            it.copy(
                selectedPreviewProject = project,
                activeScreen = ActiveScreen.VIDEO_PREVIEW_EXPORT
            )
        }
    }

    fun closeProjectPreview() {
        _uiState.update {
            it.copy(
                selectedPreviewProject = null,
                activeScreen = ActiveScreen.MAIN_DASHBOARD
            )
        }
    }

    fun loadProjectIntoStudio(project: VideoProject) {
        val totalSlots = maxOf(StudioCatalog.DEFAULT_SCENE_SLOTS, project.scenes.size)
        val restored = List(totalSlots) { idx ->
            val s = project.scenes.getOrNull(idx)
            SceneDraftInput(
                visualPrompt = s?.visualPrompt ?: "",
                voiceScript = s?.voiceScript ?: s?.narrationPrompt ?: "",
                screenText = s?.screenText ?: ""
            )
        }
        _uiState.update {
            it.copy(
                activeTab = StudioTab.STUDIO,
                activeScreen = ActiveScreen.MAIN_DASHBOARD,
                selectedFormat = project.format,
                selectedVideoType = VideoType.entries.find { vt -> vt.id == project.videoTypeId }
                    ?: VideoType.REALISTIC_3D,
                selectedStyle = project.style,
                selectedVoice = StudioCatalog.hindiVoices.find { v -> v.id == project.voiceId }
                    ?: StudioCatalog.hindiVoices.first(),
                selectedScriptAi = StudioCatalog.scriptAiProviders.find { p -> p.id == project.scriptAiId }
                    ?: StudioCatalog.scriptAiProviders.first(),
                sceneDrafts = restored,
                selectedPreviewProject = null,
                statusBannerMessage = "Loaded project settings into Studio"
            )
        }
    }

    fun deleteProject(projectId: String) {
        val updated = _uiState.value.libraryProjects.filterNot { it.id == projectId }
        repository.saveProjects(updated)
        _uiState.update {
            it.copy(
                libraryProjects = updated,
                selectedPreviewProject = null,
                activeScreen = ActiveScreen.MAIN_DASHBOARD,
                statusBannerMessage = "Removed project from Library"
            )
        }
    }

    fun updateLibrarySearch(query: String) {
        _uiState.update { it.copy(librarySearchQuery = query) }
    }

    fun updateLibraryFilter(filter: String) {
        _uiState.update { it.copy(libraryFilter = filter) }
    }

    fun buildExportJson(project: VideoProject): String = repository.exportManifestJson(project)

    private fun upsertProjectInLibrary(project: VideoProject) {
        val existing = _uiState.value.libraryProjects.filterNot { it.id == project.id }
        val updated = listOf(project) + existing
        repository.saveProjects(updated)
        _uiState.update { it.copy(libraryProjects = updated) }
    }

    private fun buildProjectFromState(
        state: StudioUiState,
        status: JobStatus
    ): VideoProject {
        val dateStr = SimpleDateFormat("dd MMM yyyy, HH:mm", Locale.getDefault()).format(Date())
        val perSceneDuration = if (state.selectedFormat == VideoFormat.SHORTS_9_16) 4 else 5
        val fullScript = state.scriptText.trim()
        val scenes = listOf(
            ScenePlan(
                sceneNumber = 1,
                durationSec = perSceneDuration,
                visualPrompt = "",
                voiceScript = fullScript,
                screenText = "",
                visualCue = "Automatic visuals from full script",
                narrationPrompt = fullScript
            )
        )
        val title = fullScript.lineSequence().firstOrNull()?.take(80)?.ifBlank { "Hindi Video" } ?: "Hindi Video"
        return VideoProject(
            id = UUID.randomUUID().toString(),
            topicPrompt = title,
            format = state.selectedFormat,
            videoTypeId = state.selectedVideoType.id,
            videoTypeLabel = state.selectedVideoType.displayName,
            style = state.selectedStyle,
            voiceId = state.selectedVoice.id,
            voiceLabel = "${state.selectedVoice.name} (${state.selectedVoice.gender})",
            scriptAiId = state.selectedScriptAi.id,
            scriptAiLabel = state.selectedScriptAi.name,
            sceneCount = 1,
            createdAtIso = dateStr,
            status = status,
            scenes = scenes
        )
    }
}
