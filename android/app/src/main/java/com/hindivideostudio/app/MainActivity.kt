package com.hindivideostudio.app

import android.os.Bundle
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

class MainActivity : ComponentActivity() {
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
                            onNodeStatusClick = { viewModel.openNodeConfigSheet(true) }
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
                                    onConfigureNode = { viewModel.openNodeConfigSheet(true) },
                                    onRetryCheck = viewModel::checkRenderNodeHealth,
                                    onSaveLocalDraft = viewModel::saveCurrentGenerationAsLocalDraft,
                                    onOpenPreview = { project -> viewModel.openProjectPreview(project) },
                                    onBackToStudio = viewModel::returnFromProgressToStudio
                                )

                                ActiveScreen.VIDEO_PREVIEW_EXPORT -> {
                                    val project = uiState.selectedPreviewProject
                                    if (project != null) {
                                        VideoPreviewExportScreen(
                                            project = project,
                                            exportJson = viewModel.buildExportJson(project),
                                            onBack = viewModel::closeProjectPreview,
                                            onLoadInStudio = { viewModel.loadProjectIntoStudio(project) },
                                            onDelete = { viewModel.deleteProject(project.id) }
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
                            onDismiss = { viewModel.openNodeConfigSheet(false) }
                        )
                    }
                }
            }
        }
    }
}
