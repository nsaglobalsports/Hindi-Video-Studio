package com.hindivideostudio.app

import android.app.DownloadManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.os.Environment
import android.provider.Settings
import android.widget.Toast
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.material3.Scaffold
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.lifecycleScope
import androidx.lifecycle.viewmodel.compose.viewModel
import com.hindivideostudio.app.model.ActiveScreen
import com.hindivideostudio.app.model.StudioTab
import com.hindivideostudio.app.ui.components.RenderNodeConfigSheet
import com.hindivideostudio.app.ui.components.StudioHeader
import com.hindivideostudio.app.ui.screens.GenerationProgressScreen
import com.hindivideostudio.app.ui.screens.LibraryScreen
import com.hindivideostudio.app.ui.screens.StudioScreen
import com.hindivideostudio.app.ui.screens.VideoPreviewExportScreen
import com.hindivideostudio.app.ui.theme.HindiVideoStudioTheme
import com.hindivideostudio.app.ui.theme.StudioColors
import com.hindivideostudio.app.viewmodel.StudioViewModel
import android.app.AlertDialog
import android.os.Build
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder

class MainActivity : ComponentActivity() {

    private val updateApi =
        "https://hindi-video-studio.onrender.com/api/app-update"

    private val updatePrefs = "hindi_video_studio_updates"
    private val downloadKey = "pending_update_download"

    private var installDialogShowing = false
    private var updateDialogShowing = false
    private var downloadChecking = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        enableEdgeToEdge()

        setContent {
            HindiVideoStudioTheme {
                val viewModel: StudioViewModel = viewModel()
                val uiState by viewModel.uiState.collectAsStateWithLifecycle()

                Scaffold(
                    containerColor = StudioColors.DeepNavyCanvas
                ) { innerPadding ->
                    Column(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(StudioColors.DeepNavyCanvas)
                            .statusBarsPadding()
                            .padding(bottom = innerPadding.calculateBottomPadding())
                    ) {
                        StudioHeader(
                            activeTab = uiState.activeTab,
                            renderNode = uiState.renderNode,
                            onSelectTab = viewModel::selectTab,
                            onNewVideoClick = viewModel::startNewVideo,
                            onNodeStatusClick = {
                                viewModel.openNodeConfigSheet(true)
                            }
                        )

                        Box(modifier = Modifier.weight(1f)) {
                            when (uiState.activeScreen) {

                                ActiveScreen.MAIN_DASHBOARD -> {
                                    when (uiState.activeTab) {

                                        StudioTab.STUDIO -> StudioScreen(
                                            uiState = uiState,
                                            onSelectFormat = viewModel::selectFormat,
                                            onSelectVideoType = viewModel::selectVideoType,
                                            onSelectStyle = viewModel::selectStyle,
                                            onSelectVoice = viewModel::selectVoice,
                                            onSelectScriptAi = viewModel::selectScriptAi,
                                            onSceneVisualChange = viewModel::updateSceneVisual,
                                            onSceneVoiceChange = viewModel::updateSceneVoice,
                                            onSceneScreenTextChange = viewModel::updateSceneScreenText,
                                            onAddSceneSlot = viewModel::addSceneSlot,
                                            onClearAllScenes = viewModel::clearAllScenes,
                                            onGenerateClick = viewModel::onGenerateHindiVideoClick
                                        )

                                        StudioTab.LIBRARY -> LibraryScreen(
                                            uiState = uiState,
                                            onSearchChange = viewModel::updateLibrarySearch,
                                            onFilterChange = viewModel::updateLibraryFilter,
                                            onProjectClick = viewModel::openProjectPreview,
                                            onCreateNewClick = viewModel::startNewVideo
                                        )
                                    }
                                }

                                ActiveScreen.GENERATION_PROGRESS -> GenerationProgressScreen(
                                    progressState = uiState.generationState,
                                    renderNode = uiState.renderNode,
                                    onConfigureNode = {
                                        viewModel.openNodeConfigSheet(true)
                                    },
                                    onRetryCheck = viewModel::checkRenderNodeHealth,
                                    onSaveLocalDraft = viewModel::saveCurrentGenerationAsLocalDraft,
                                    onOpenPreview = {
                                        project -> viewModel.openProjectPreview(project)
                                    },
                                    onBackToStudio = viewModel::returnFromProgressToStudio
                                )

                                ActiveScreen.VIDEO_PREVIEW_EXPORT -> {
                                    val project = uiState.selectedPreviewProject

                                    if (project != null) {
                                        VideoPreviewExportScreen(
                                            project = project,
                                            exportJson = viewModel.buildExportJson(project),
                                            onBack = viewModel::closeProjectPreview,
                                            onLoadInStudio = {
                                                viewModel.loadProjectIntoStudio(project)
                                            },
                                            onDelete = {
                                                viewModel.deleteProject(project.id)
                                            }
                                        )
                                    }
                                }
                            }
                        }
                    }

                    if (uiState.isNodeSheetOpen) {
                        RenderNodeConfigSheet(
                            renderNode = uiState.renderNode,
                            onUrlChange = viewModel::updateRenderNodeUrl,
                            onTestConnection = viewModel::checkRenderNodeHealth,
                            onDismiss = {
                                viewModel.openNodeConfigSheet(false)
                            }
                        )
                    }
                }
            }
        }

        // Automatically check updates
        checkForAppUpdate()
    }

    // Check latest version from Render Backend
    private fun checkForAppUpdate() {

        lifecycleScope.launch {

            val result = withContext(Dispatchers.IO) {

                try {
                    val packageInfo = packageManager.getPackageInfo(packageName, 0)
                    val currentVersion = packageInfo.versionName ?: "1.0.0"

                    val encodedVersion =
                        URLEncoder.encode(currentVersion, "UTF-8")

                    val connection = URL(
                        "$updateApi?version=$encodedVersion"
                    ).openConnection() as HttpURLConnection

                    connection.requestMethod = "GET"
                    connection.connectTimeout = 15000
                    connection.readTimeout = 15000

                    try {
                        if (connection.responseCode == 200) {
                            val response = connection.inputStream
                                .bufferedReader()
                                .use { it.readText() }

                            JSONObject(response)
                        } else {
                            null
                        }
                    } finally {
                        connection.disconnect()
                    }

                } catch (e: Exception) {
                    null
                }
            }

            if (result != null &&
                result.optBoolean("success") &&
                result.optBoolean("updateAvailable") &&
                !isFinishing && !isDestroyed && !updateDialogShowing
            ) {

                val latestVersion =
                    result.optString("latestVersion")

                val downloadUrl =
                    result.optString("downloadUrl")

                val releaseNotes =
                    result.optString("releaseNotes")

                if (downloadUrl.startsWith("https://")) {
                    showUpdateDialog(
                        latestVersion,
                        downloadUrl,
                        releaseNotes
                    )
                }
            }
        }
    }

    // Show update available dialog
    private fun showUpdateDialog(
        version: String,
        downloadUrl: String,
        notes: String
    ) {
        if (isFinishing || isDestroyed || updateDialogShowing) return
        updateDialogShowing = true

        AlertDialog.Builder(this)
            .setTitle("नया अपडेट उपलब्ध है!")
            .setMessage(
                "Hindi Video Studio का नया Version $version उपलब्ध है।\n\n" +
                    (notes.ifBlank {
                        "नए अपडेट को डाउनलोड करके इंस्टॉल करें।"
                    })
            )
            .setCancelable(false)
            .setPositiveButton("अभी अपडेट करें") { _, _ ->
                updateDialogShowing = false
                downloadUpdate(downloadUrl, version)
            }
            .setNegativeButton("बाद में") { dialog, _ ->
                updateDialogShowing = false
                dialog.dismiss()
            }
            .setOnCancelListener { updateDialogShowing = false }
            .show()
    }

    // Download new APK
    private fun downloadUpdate(
        downloadUrl: String,
        version: String
    ) {

        try {

            val request = DownloadManager.Request(
                Uri.parse(downloadUrl)
            )

            request.setTitle("Hindi Video Studio Update")
            request.setDescription("नया Version डाउनलोड हो रहा है...")
            request.setNotificationVisibility(
                DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED
            )

            request.setDestinationInExternalFilesDir(
                this,
                Environment.DIRECTORY_DOWNLOADS,
                "Hindi-Video-Studio-$version.apk"
            )

            val manager =
                getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager

            val downloadId = manager.enqueue(request)

            getSharedPreferences(updatePrefs, MODE_PRIVATE)
                .edit()
                .putLong(downloadKey, downloadId)
                .apply()

            Toast.makeText(
                this,
                "अपडेट डाउनलोड शुरू हो गया है।",
                Toast.LENGTH_LONG
            ).show()

            waitForDownload(downloadId)

        } catch (e: Exception) {

            Toast.makeText(
                this,
                "डाउनलोड शुरू नहीं हो सका।",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    // Monitor APK download
    private fun waitForDownload(downloadId: Long) {

        if (downloadChecking) return

        downloadChecking = true

        lifecycleScope.launch {

            try {

                while (true) {

                    val status = withContext(Dispatchers.IO) {

                        val manager =
                            getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager

                        val query = DownloadManager.Query()
                            .setFilterById(downloadId)

                        manager.query(query).use { cursor ->

                            if (cursor.moveToFirst()) {
                                cursor.getInt(
                                    cursor.getColumnIndexOrThrow(
                                        DownloadManager.COLUMN_STATUS
                                    )
                                )
                            } else {
                                -1
                            }
                        }
                    }

                    when (status) {

                        DownloadManager.STATUS_SUCCESSFUL -> {
                            installDownloadedApk()
                            break
                        }

                        DownloadManager.STATUS_FAILED -> {

                            clearPendingDownload()

                            Toast.makeText(
                                this@MainActivity,
                                "अपडेट डाउनलोड नहीं हो सका।",
                                Toast.LENGTH_LONG
                            ).show()

                            break
                        }
                    }

                    delay(1500)
                }

            } finally {
                downloadChecking = false
            }
        }
    }

    // Install downloaded APK
    private fun installDownloadedApk() {

        if (installDialogShowing) return

        val downloadId = getSharedPreferences(
            updatePrefs,
            MODE_PRIVATE
        ).getLong(downloadKey, -1L)

        if (downloadId == -1L) return

        val manager =
            getSystemService(Context.DOWNLOAD_SERVICE) as DownloadManager

        val apkUri = manager.getUriForDownloadedFile(downloadId)

        if (apkUri == null) {
            Toast.makeText(
                this,
                "APK फाइल नहीं मिली।",
                Toast.LENGTH_LONG
            ).show()
            return
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O &&
            !packageManager.canRequestPackageInstalls()
        ) {

            installDialogShowing = true

            AlertDialog.Builder(this)
                .setTitle("Install Permission")
                .setMessage(
                    "Hindi Video Studio अपडेट इंस्टॉल करने के लिए " +
                        "इस ऐप को Install Unknown Apps की अनुमति दें।"
                )
                .setPositiveButton("Settings") { _, _ ->

                    installDialogShowing = false

                    val intent = Intent(
                        Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES,
                        Uri.parse("package:$packageName")
                    )

                    startActivity(intent)
                }
                .setNegativeButton("बाद में") { _, _ ->
                    installDialogShowing = false
                }
                .setOnDismissListener {
                    installDialogShowing = false
                }
                .show()

            return
        }

        try {

            val installIntent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(
                    apkUri,
                    "application/vnd.android.package-archive"
                )

                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }

            clearPendingDownload()

            startActivity(installIntent)

        } catch (e: Exception) {

            Toast.makeText(
                this,
                "APK इंस्टॉल नहीं हो सका।",
                Toast.LENGTH_LONG
            ).show()
        }
    }

    private fun clearPendingDownload() {

        getSharedPreferences(updatePrefs, MODE_PRIVATE)
            .edit()
            .remove(downloadKey)
            .apply()
    }

    override fun onResume() {
        super.onResume()
        if (!isFinishing && !isDestroyed) checkForAppUpdate()

        val downloadId = getSharedPreferences(
            updatePrefs,
            MODE_PRIVATE
        ).getLong(downloadKey, -1L)

        if (downloadId != -1L && !downloadChecking) {
            waitForDownload(downloadId)
        }
    }
}
