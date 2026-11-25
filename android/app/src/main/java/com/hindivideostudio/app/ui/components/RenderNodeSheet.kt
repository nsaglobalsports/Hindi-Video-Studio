package com.hindivideostudio.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hindivideostudio.app.model.NodeConnectionStatus
import com.hindivideostudio.app.model.RenderNodeState
import com.hindivideostudio.app.ui.theme.StudioColors

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RenderNodeConfigSheet(
    renderNode: RenderNodeState,
    onUrlChange: (String) -> Unit,
    onTestConnection: () -> Unit,
    onDismiss: () -> Unit
) {
    ModalBottomSheet(
        onDismissRequest = onDismiss,
        containerColor = StudioColors.CardSurface,
        contentColor = StudioColors.TextPrimary
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
                .padding(bottom = 28.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Text(
                text = "Self-Hosted Render Node",
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold,
                color = StudioColors.TextPrimary
            )

            Text(
                text = "Connect a free self-hosted backend (FFmpeg + Piper/Edge-TTS + Ollama) for live MP4 rendering. Local drafting and JSON export work offline without a node.",
                fontSize = 13.sp,
                color = StudioColors.TextSecondary,
                lineHeight = 19.sp
            )

            OutlinedTextField(
                value = renderNode.endpointUrl,
                onValueChange = onUrlChange,
                label = { Text("Render Node URL") },
                placeholder = { Text("http://192.168.1.100:8000") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = StudioColors.BlueHighlight,
                    unfocusedBorderColor = StudioColors.BorderHairline,
                    focusedTextColor = StudioColors.TextPrimary,
                    unfocusedTextColor = StudioColors.TextPrimary
                )
            )

            val statusColor = when (renderNode.status) {
                NodeConnectionStatus.ONLINE -> StudioColors.StatusOnline
                NodeConnectionStatus.CHECKING -> StudioColors.BlueHighlight
                NodeConnectionStatus.OFFLINE -> StudioColors.StatusOffline
            }

            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(StudioColors.DeepNavyCanvas, RoundedCornerShape(12.dp))
                    .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(12.dp))
                    .padding(12.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "Status: ${renderNode.status.name}",
                    color = statusColor,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = renderNode.statusDetail,
                    color = StudioColors.TextSecondary,
                    fontSize = 12.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Expected Endpoints: GET /health · POST /api/render · GET /api/jobs/{id}",
                    color = StudioColors.TextMuted,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                OutlinedButton(
                    onClick = onDismiss,
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Text("Close", color = StudioColors.TextPrimary)
                }
                Button(
                    onClick = onTestConnection,
                    modifier = Modifier
                        .weight(1f)
                        .height(48.dp),
                    shape = RoundedCornerShape(12.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = StudioColors.BluePrimary)
                ) {
                    Text("Test Connection", color = Color.White, fontWeight = FontWeight.SemiBold)
                }
            }
        }
    }
}
