package com.hindivideostudio.app.ui.screens

import android.content.Intent
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.media3.common.MediaItem
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.hindivideostudio.app.model.VideoFormat
import com.hindivideostudio.app.model.VideoProject
import com.hindivideostudio.app.ui.theme.StudioColors

@Composable
fun VideoPreviewExportScreen(
    project: VideoProject,
    exportJson: String,
    onBack: () -> Unit,
    onLoadInStudio: () -> Unit,
    onDelete: () -> Unit
) {
    val context = LocalContext.current
    val hasPlayableMp4 = !project.mp4Url.isNullOrBlank()
    val aspectRatio = if (project.format == VideoFormat.SHORTS_9_16) 9f / 16f else 16f / 9f

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "Preview & Export",
                fontSize = 20.sp,
                fontWeight = FontWeight.Bold,
                color = StudioColors.TextPrimary
            )
            OutlinedButton(onClick = onBack, shape = RoundedCornerShape(10.dp)) {
                Text("Back", color = StudioColors.TextPrimary)
            }
        }

        if (hasPlayableMp4) {
            val exoPlayer = remember(project.mp4Url) {
                ExoPlayer.Builder(context).build().apply {
                    setMediaItem(MediaItem.fromUri(project.mp4Url!!))
                    prepare()
                }
            }

            DisposableEffect(exoPlayer) {
                onDispose { exoPlayer.release() }
            }

            AndroidView(
                factory = { ctx ->
                    PlayerView(ctx).apply {
                        player = exoPlayer
                        useController = true
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(aspectRatio)
                    .clip(RoundedCornerShape(16.dp))
                    .background(Color.Black)
            )
        } else {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(StudioColors.CardSurface)
                    .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(16.dp))
                    .padding(20.dp)
            ) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text(
                        text = "MP4 Preview Pending Render Node",
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = StudioColors.StatusOffline
                    )
                    Text(
                        text = "This item is a saved local script draft. Connect a self-hosted Render Node to synthesize Hindi audio and export the ${project.format.resolution} MP4 file.",
                        fontSize = 13.sp,
                        color = StudioColors.TextSecondary,
                        lineHeight = 19.sp
                    )
                }
            }
        }

        // Storyboard Scenes
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(StudioColors.CardSurface)
                .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(16.dp))
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text(
                text = "Scene Storyboard (${project.sceneCount} Scenes)",
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold,
                color = StudioColors.TextPrimary
            )
            project.scenes.forEach { scene ->
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(10.dp))
                        .background(StudioColors.DeepNavyCanvas)
                        .padding(10.dp),
                    verticalArrangement = Arrangement.spacedBy(2.dp)
                ) {
                    Text(
                        text = "Scene ${scene.sceneNumber} · ${scene.durationSec}s",
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace,
                        color = StudioColors.BlueHighlight
                    )
                    Text(
                        text = scene.visualCue,
                        fontSize = 13.sp,
                        color = StudioColors.TextPrimary
                    )
                    Text(
                        text = scene.narrationPrompt,
                        fontSize = 12.sp,
                        color = StudioColors.TextSecondary
                    )
                    if (scene.screenText.isNotBlank()) {
                        Text(
                            text = "Screen Text: ${scene.screenText}",
                            fontSize = 12.sp,
                            color = StudioColors.StatusOnline
                        )
                    }
                }
            }
        }

        // Export & Share Actions
        Button(
            onClick = {
                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_SUBJECT, "Hindi Video Studio Export: ${project.topicPrompt}")
                    putExtra(Intent.EXTRA_TEXT, exportJson)
                }
                context.startActivity(Intent.createChooser(shareIntent, "Export Production Spec"))
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(50.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = StudioColors.OrangeCta)
        ) {
            Text("Share / Export Production JSON", color = Color.White, fontWeight = FontWeight.Bold)
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            OutlinedButton(
                onClick = onLoadInStudio,
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Edit in Studio", color = StudioColors.TextPrimary)
            }
            OutlinedButton(
                onClick = onDelete,
                modifier = Modifier
                    .weight(1f)
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Delete", color = StudioColors.StatusError)
            }
        }
    }
}
