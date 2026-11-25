package com.hindivideostudio.app.model

import kotlinx.serialization.Serializable

@Serializable
enum class StudioTab {
    STUDIO,
    LIBRARY
}

@Serializable
enum class ActiveScreen {
    MAIN_DASHBOARD,
    GENERATION_PROGRESS,
    VIDEO_PREVIEW_EXPORT
}

@Serializable
enum class VideoFormat(
    val id: String,
    val title: String,
    val ratioLabel: String,
    val resolution: String
) {
    SHORTS_9_16("shorts_9_16", "Shorts / Reels", "9:16", "1080×1920"),
    YOUTUBE_16_9("youtube_16_9", "YouTube Explainer", "16:9", "1920×1080")
}

@Serializable
enum class VideoType(val id: String, val displayName: String, val hindiSubtitle: String) {
    REALISTIC_3D("3d_realistic", "3D Realistic Graphics Motion", "गहरे 3D रेंडर, वॉल्यूमेट्रिक लाइट और कैमरा डेप्थ"),
    PARALLAX_2_5D("2_5d_parallax", "2.5D Parallax Depth Motion", "मल्टी-लेयर डेप्थ, ग्लास कार्ड और पैरेलैक्स मोशन"),
    CARTOON_2D("cartoon_2d", "Cartoon / 2D Illustrated Style", "चमकदार रंग, बोल्ड आउटलाइन और कार्टून एनीमेशन"),
    INFOGRAPHIC("cinematic_infographic", "Kinetic Infographic / Broadcast", "डेटा चार्ट, मोशन ग्राफ़िक्स और स्टूडियो HUD")
}

@Serializable
enum class VideoStyle(val displayName: String, val hindiSubtitle: String) {
    EDUCATIONAL("Educational / Explainer", "शैक्षिक और सरल व्याख्या"),
    NEWS("News", "ताज़ा समाचार और बुलेटिन"),
    DOCUMENTARY("Documentary", "गहन कहानी और तथ्य"),
    ANIMATED_INFOGRAPHIC("Animated Infographic", "डेटा और विज़ुअल चार्ट")
}

@Serializable
data class HindiVoice(
    val id: String,
    val name: String,
    val gender: String,
    val tone: String,
    val engineLabel: String
)

@Serializable
data class ScriptAiProvider(
    val id: String,
    val name: String,
    val costLabel: String,
    val notes: String
)

@Serializable
enum class NodeConnectionStatus {
    CHECKING,
    ONLINE,
    OFFLINE
}

@Serializable
data class RenderNodeState(
    val endpointUrl: String = "http://192.168.1.100:8000",
    val status: NodeConnectionStatus = NodeConnectionStatus.OFFLINE,
    val latencyMs: Long? = null,
    val statusDetail: String = "Not connected — configure self-hosted Render Node URL"
)

@Serializable
enum class JobStatus {
    LOCAL_DRAFT,
    QUEUED,
    RENDERING,
    COMPLETED,
    FAILED
}

@Serializable
data class SceneDraftInput(
    val visualPrompt: String = "",
    val voiceScript: String = "",
    val screenText: String = ""
)

@Serializable
data class ScenePlan(
    val sceneNumber: Int,
    val durationSec: Int,
    val visualPrompt: String = "",
    val voiceScript: String = "",
    val screenText: String = "",
    val visualCue: String,
    val narrationPrompt: String
)

@Serializable
data class VideoProject(
    val id: String,
    val topicPrompt: String,
    val format: VideoFormat,
    val videoTypeId: String = VideoType.REALISTIC_3D.id,
    val videoTypeLabel: String = VideoType.REALISTIC_3D.displayName,
    val style: VideoStyle,
    val voiceId: String,
    val voiceLabel: String,
    val scriptAiId: String,
    val scriptAiLabel: String,
    val sceneCount: Int,
    val createdAtIso: String,
    val status: JobStatus,
    val mp4Url: String? = null,
    val remoteJobId: String? = null,
    val scenes: List<ScenePlan> = emptyList()
)

@Serializable
data class GenerationProgressState(
    val project: VideoProject? = null,
    val stageLabel: String = "Waiting for Render Node",
    val progressPercent: Int = 0,
    val isSubmitting: Boolean = false,
    val errorMessage: String? = null
)

object StudioCatalog {
    const val DEFAULT_SCENE_SLOTS = 5

    val hindiVoices = listOf(
        HindiVoice("hi_swara_f", "Swara", "Female", "Warm & Clear", "Edge Neural TTS (hi-IN)"),
        HindiVoice("hi_madhur_m", "Madhur", "Male", "Broadcast Studio", "Edge Neural TTS (hi-IN)"),
        HindiVoice("hi_ananya_f", "Ananya", "Female", "Energetic Shorts", "Edge Neural TTS (hi-IN)"),
        HindiVoice("hi_aarav_m", "Aarav", "Male", "Calm Documentary", "Edge Neural TTS (hi-IN)")
    )

    val scriptAiProviders = listOf(
        ScriptAiProvider("ollama_local", "Ollama (Local Llama 3 / Qwen)", "Free · Self-Hosted", "Runs on your Render Node"),
        ScriptAiProvider("hf_free", "HuggingFace Free Inference", "Free Tier", "Open-weight Hindi/multilingual models"),
        ScriptAiProvider("openrouter_free", "OpenRouter (Free Models)", "Free Quota", "Zero-cost community endpoints"),
        ScriptAiProvider("manual_script", "Manual / Direct Prompt", "100% Offline", "No external AI required")
    )
}
