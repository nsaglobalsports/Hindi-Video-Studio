package com.hindivideostudio.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hindivideostudio.app.model.NodeConnectionStatus
import com.hindivideostudio.app.model.RenderNodeState
import com.hindivideostudio.app.model.StudioTab
import com.hindivideostudio.app.ui.theme.StudioColors

@Composable
fun StudioHeader(
    activeTab: StudioTab,
    renderNode: RenderNodeState,
    onSelectTab: (StudioTab) -> Unit,
    onNewVideoClick: () -> Unit,
    onNodeStatusClick: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(StudioColors.NavyBase)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.weight(1f)
            ) {
                Box(
                    modifier = Modifier
                        .size(38.dp)
                        .clip(RoundedCornerShape(10.dp))
                        .background(
                            Brush.linearGradient(
                                listOf(StudioColors.BluePrimary, StudioColors.OrangeCta)
                            )
                        ),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Rounded.PlayArrow,
                        contentDescription = "Hindi Video Studio Icon",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                }

                Spacer(modifier = Modifier.width(10.dp))

                Text(
                    text = "Hindi Video Studio",
                    color = StudioColors.TextPrimary,
                    fontSize = 17.sp,
                    fontWeight = FontWeight.Bold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
            }

            Row(
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                val statusColor = when (renderNode.status) {
                    NodeConnectionStatus.ONLINE -> StudioColors.StatusOnline
                    NodeConnectionStatus.CHECKING -> StudioColors.BlueHighlight
                    NodeConnectionStatus.OFFLINE -> StudioColors.StatusOffline
                }
                val statusText = when (renderNode.status) {
                    NodeConnectionStatus.ONLINE -> "Node Online"
                    NodeConnectionStatus.CHECKING -> "Checking"
                    NodeConnectionStatus.OFFLINE -> "Node Offline"
                }

                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(StudioColors.CardSurface)
                        .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(10.dp))
                        .clickable(onClick = onNodeStatusClick)
                        .padding(horizontal = 10.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(8.dp)
                            .clip(RoundedCornerShape(4.dp))
                            .background(statusColor)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = statusText,
                        color = StudioColors.TextPrimary,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        maxLines = 1
                    )
                }

                Row(
                    modifier = Modifier
                        .clip(RoundedCornerShape(10.dp))
                        .background(StudioColors.BluePrimary)
                        .clickable(onClick = onNewVideoClick)
                        .padding(horizontal = 12.dp, vertical = 8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Rounded.Add,
                        contentDescription = "New Video",
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "New Video",
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        maxLines = 1
                    )
                }
            }
        }

        // Top Segmented Studio | Library Tab Switch
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp)
                .padding(bottom = 12.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(StudioColors.DeepNavyCanvas)
                .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(12.dp))
                .padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            StudioTabButton(
                label = "Studio",
                selected = activeTab == StudioTab.STUDIO,
                onClick = { onSelectTab(StudioTab.STUDIO) },
                modifier = Modifier.weight(1f)
            )
            StudioTabButton(
                label = "Library",
                selected = activeTab == StudioTab.LIBRARY,
                onClick = { onSelectTab(StudioTab.LIBRARY) },
                modifier = Modifier.weight(1f)
            )
        }

        HorizontalDivider(color = StudioColors.BorderHairline, thickness = 1.dp)
    }
}

@Composable
private fun StudioTabButton(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Box(
        modifier = modifier
            .height(40.dp)
            .clip(RoundedCornerShape(9.dp))
            .background(
                if (selected) StudioColors.ElevatedSurface else Color.Transparent
            )
            .border(
                width = if (selected) 1.dp else 0.dp,
                color = if (selected) StudioColors.BorderActiveBlue.copy(alpha = 0.5f) else Color.Transparent,
                shape = RoundedCornerShape(9.dp)
            )
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = label,
            color = if (selected) StudioColors.TextPrimary else StudioColors.TextSecondary,
            fontSize = 14.sp,
            fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Medium
        )
    }
}
