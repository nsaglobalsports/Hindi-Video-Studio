package com.hindivideostudio.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hindivideostudio.app.model.JobStatus
import com.hindivideostudio.app.model.VideoProject
import com.hindivideostudio.app.ui.theme.StudioColors
import com.hindivideostudio.app.viewmodel.StudioUiState

@Composable
fun LibraryScreen(
    uiState: StudioUiState,
    onSearchChange: (String) -> Unit,
    onFilterChange: (String) -> Unit,
    onProjectClick: (VideoProject) -> Unit,
    onCreateNewClick: () -> Unit
) {
    val filtered = uiState.libraryProjects.filter { project ->
        val matchesFilter = when (uiState.libraryFilter) {
            "RENDERED" -> project.status == JobStatus.COMPLETED && !project.mp4Url.isNullOrBlank()
            "DRAFTS" -> project.status == JobStatus.LOCAL_DRAFT
            else -> true
        }
        val query = uiState.librarySearchQuery.trim().lowercase()
        val matchesSearch = query.isEmpty() ||
            project.topicPrompt.lowercase().contains(query) ||
            project.style.displayName.lowercase().contains(query)
        matchesFilter && matchesSearch
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(horizontal = 16.dp, vertical = 16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        OutlinedTextField(
            value = uiState.librarySearchQuery,
            onValueChange = onSearchChange,
            placeholder = { Text("Search Hindi prompts or styles...", color = StudioColors.TextMuted) },
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = OutlinedTextFieldDefaults.colors(
                focusedContainerColor = StudioColors.CardSurface,
                unfocusedContainerColor = StudioColors.CardSurface,
                focusedBorderColor = StudioColors.BlueHighlight,
                unfocusedBorderColor = StudioColors.BorderHairline,
                focusedTextColor = StudioColors.TextPrimary,
                unfocusedTextColor = StudioColors.TextPrimary
            )
        )

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf("ALL" to "All", "RENDERED" to "Rendered MP4", "DRAFTS" to "Local Drafts").forEach { (key, label) ->
                val selected = uiState.libraryFilter == key
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(if (selected) StudioColors.BluePrimary else StudioColors.CardSurface)
                        .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(10.dp))
                        .clickable { onFilterChange(key) }
                        .padding(horizontal = 12.dp, vertical = 8.dp)
                ) {
                    Text(
                        text = label,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = if (selected) Color.White else StudioColors.TextSecondary
                    )
                }
            }
        }

        if (filtered.isEmpty()) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(16.dp))
                    .background(StudioColors.CardSurface)
                    .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(16.dp))
                    .padding(24.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text(
                    text = "No saved projects yet",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = StudioColors.TextPrimary
                )
                Text(
                    text = "Draft a Hindi video in Studio or connect a Render Node to save generated MP4 history here.",
                    fontSize = 13.sp,
                    color = StudioColors.TextSecondary
                )
                Button(
                    onClick = onCreateNewClick,
                    modifier = Modifier.height(46.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = StudioColors.OrangeCta)
                ) {
                    Text("Create First Video", color = Color.White, fontWeight = FontWeight.SemiBold)
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(10.dp),
                modifier = Modifier.fillMaxSize()
            ) {
                items(filtered, key = { it.id }) { project ->
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(StudioColors.CardSurface)
                            .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(16.dp))
                            .clickable { onProjectClick(project) }
                            .padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Text(
                            text = project.topicPrompt,
                            fontSize = 15.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = StudioColors.TextPrimary,
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )

                        Text(
                            text = "${project.format.ratioLabel} · ${project.style.displayName} · ${project.sceneCount} scenes · ${project.createdAtIso}",
                            fontSize = 12.sp,
                            color = StudioColors.TextSecondary
                        )

                        val statusText = when (project.status) {
                            JobStatus.COMPLETED -> "Rendered MP4 Ready"
                            JobStatus.LOCAL_DRAFT -> "Local Script Draft (Needs Render Node)"
                            JobStatus.RENDERING -> "Rendering on Node"
                            JobStatus.QUEUED -> "Queued on Node"
                            JobStatus.FAILED -> "Render Failed"
                        }

                        val statusColor = when (project.status) {
                            JobStatus.COMPLETED -> StudioColors.StatusOnline
                            JobStatus.FAILED -> StudioColors.StatusError
                            else -> StudioColors.StatusOffline
                        }

                        Text(
                            text = statusText,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium,
                            color = statusColor
                        )
                    }
                }
            }
        }
    }
}
