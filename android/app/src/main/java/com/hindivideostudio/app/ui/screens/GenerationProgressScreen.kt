package com.hindivideostudio.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hindivideostudio.app.model.GenerationProgressState
import com.hindivideostudio.app.model.JobStatus
import com.hindivideostudio.app.model.NodeConnectionStatus
import com.hindivideostudio.app.model.RenderNodeState
import com.hindivideostudio.app.model.VideoProject
import com.hindivideostudio.app.ui.theme.StudioColors

@Composable
fun GenerationProgressScreen(
    progressState: GenerationProgressState,
    renderNode: RenderNodeState,
    onConfigureNode: () -> Unit,
    onRetryCheck: () -> Unit,
    onSaveLocalDraft: () -> Unit,
    onOpenPreview: (VideoProject) -> Unit,
    onBackToStudio: () -> Unit
) {
    val project = progressState.project
    val isOffline = renderNode.status != NodeConnectionStatus.ONLINE

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = if (isOffline) "Backend Integration Required" else "Video Generation Progress",
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold,
            color = StudioColors.TextPrimary
        )

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(StudioColors.CardSurface)
                .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(16.dp))
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Text(
                text = progressState.stageLabel,
                fontSize = 15.sp,
                fontWeight = FontWeight.SemiBold,
                color = if (isOffline) StudioColors.StatusOffline else StudioColors.BlueHighlight
            )

            if (!isOffline) {
                LinearProgressIndicator(
                    progress = { progressState.progressPercent / 100f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = StudioColors.OrangeCta,
                    trackColor = StudioColors.DeepNavyCanvas
                )
                Text(
                    text = "${progressState.progressPercent}% complete",
                    fontSize = 12.sp,
                    fontFamily = FontFamily.Monospace,
                    color = StudioColors.TextSecondary
                )
            }

            if (progressState.errorMessage != null) {
                Text(
                    text = progressState.errorMessage,
                    fontSize = 13.sp,
                    lineHeight = 19.sp,
                    color = StudioColors.TextSecondary
                )
            }
        }

        if (project != null) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(StudioColors.CardSurface)
                    .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(16.dp))
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Text(
                    text = "Production Spec Summary",
                    fontSize = 14.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = StudioColors.TextPrimary
                )
                Text(
                    text = project.topicPrompt,
                    fontSize = 14.sp,
                    color = StudioColors.TextPrimary
                )
                Text(
                    text = "${project.format.title} (${project.format.ratioLabel}) · ${project.style.displayName} · ${project.voiceLabel} · ${project.sceneCount} scenes",
                    fontSize = 12.sp,
                    color = StudioColors.TextSecondary
                )
            }
        }

        if (isOffline) {
            Button(
                onClick = onSaveLocalDraft,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = StudioColors.OrangeCta)
            ) {
                Text("Save Script Draft to Library", color = Color.White, fontWeight = FontWeight.Bold)
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onConfigureNode,
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Configure Node", color = StudioColors.TextPrimary)
                }
                OutlinedButton(
                    onClick = onRetryCheck,
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Retry Ping", color = StudioColors.TextPrimary)
                }
            }
        } else if (project != null && project.status == JobStatus.COMPLETED) {
            Button(
                onClick = { onOpenPreview(project) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = StudioColors.OrangeCta)
            ) {
                Text("Open MP4 Preview & Export", color = Color.White, fontWeight = FontWeight.Bold)
            }
        }

        Spacer(modifier = Modifier.height(4.dp))

        OutlinedButton(
            onClick = onBackToStudio,
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("Back to Studio", color = StudioColors.TextSecondary)
        }
    }
}
