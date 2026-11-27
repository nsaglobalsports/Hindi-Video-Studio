package com.hindivideostudio.app.ui.screens

import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material.icons.rounded.AutoAwesome
import androidx.compose.material.icons.rounded.KeyboardArrowDown
import androidx.compose.material.icons.rounded.MovieCreation
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.Icon
import androidx.compose.material3.MenuAnchorType
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.hindivideostudio.app.R
import com.hindivideostudio.app.model.HindiVoice
import com.hindivideostudio.app.model.ScriptAiProvider
import com.hindivideostudio.app.model.StudioCatalog
import com.hindivideostudio.app.model.VideoFormat
import com.hindivideostudio.app.model.VideoStyle
import com.hindivideostudio.app.model.VideoType
import com.hindivideostudio.app.ui.theme.StudioColors
import com.hindivideostudio.app.viewmodel.StudioUiState

@Composable
fun StudioScreen(
    uiState: StudioUiState,
    onSelectFormat: (VideoFormat) -> Unit,
    onSelectVideoType: (VideoType) -> Unit,
    onSelectStyle: (VideoStyle) -> Unit,
    onSelectVoice: (HindiVoice) -> Unit,
    onSelectScriptAi: (ScriptAiProvider) -> Unit,
    onScriptChange: (String) -> Unit,
    onGenerateClick: () -> Unit
) {
    val scriptLength = uiState.scriptText.length

    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 16.dp, vertical = 18.dp),
        verticalArrangement = Arrangement.spacedBy(18.dp)
    ) {
        // Heading
        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
            Text(
                text = "अपनी पूरी स्क्रिप्ट से वीडियो बनाएँ",
                fontSize = 24.sp,
                lineHeight = 32.sp,
                fontWeight = FontWeight.Bold,
                color = StudioColors.TextPrimary
            )
            Text(
                text = "पूरी हिंदी स्क्रिप्ट एक बार पेस्ट करें। विजुअल, वॉइसओवर, स्क्रीन टेक्स्ट और सबटाइटल अपने-आप तैयार होंगे।",
                fontSize = 13.sp,
                lineHeight = 19.sp,
                color = StudioColors.TextSecondary
            )
        }

        // Video Format Selection + Permanent 9:16 Header & Footer Preview
        Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
            Text(
                text = "Video Format",
                fontSize = 13.sp,
                fontWeight = FontWeight.SemiBold,
                color = StudioColors.TextPrimary
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                VideoFormat.entries.forEach { format ->
                    val selected = uiState.selectedFormat == format
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(16.dp))
                            .background(
                                if (selected) {
                                    Brush.linearGradient(
                                        listOf(
                                            StudioColors.BluePrimary.copy(alpha = 0.28f),
                                            StudioColors.CardSurface
                                        )
                                    )
                                } else {
                                    Brush.linearGradient(
                                        listOf(StudioColors.CardSurface, StudioColors.CardSurface)
                                    )
                                }
                            )
                            .border(
                                width = if (selected) 1.5.dp else 1.dp,
                                color = if (selected) StudioColors.BlueHighlight else StudioColors.BorderHairline,
                                shape = RoundedCornerShape(16.dp)
                            )
                            .clickable { onSelectFormat(format) }
                            .padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Box(
                                modifier = Modifier
                                    .width(if (format == VideoFormat.SHORTS_9_16) 18.dp else 28.dp)
                                    .height(if (format == VideoFormat.SHORTS_9_16) 28.dp else 18.dp)
                                    .clip(RoundedCornerShape(4.dp))
                                    .border(
                                        1.5.dp,
                                        if (selected) StudioColors.BlueHighlight else StudioColors.TextMuted,
                                        RoundedCornerShape(4.dp)
                                    )
                            )
                            Text(
                                text = format.ratioLabel,
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.SemiBold,
                                color = if (selected) StudioColors.BlueHighlight else StudioColors.TextSecondary
                            )
                        }
                        Text(
                            text = format.title,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold,
                            color = StudioColors.TextPrimary
                        )
                        Text(
                            text = format.resolution,
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            color = StudioColors.TextMuted
                        )
                    }
                }
            }

            if (uiState.selectedFormat == VideoFormat.SHORTS_9_16) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .clip(RoundedCornerShape(14.dp))
                        .background(StudioColors.NavyBase)
                        .border(1.dp, StudioColors.BlueHighlight.copy(alpha = 0.4f), RoundedCornerShape(14.dp))
                        .padding(10.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text(
                        text = "9:16 Permanent Header & Footer (Locked)",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = StudioColors.TextPrimary
                    )
                    Image(
                        painter = painterResource(id = R.drawable.brand_header_9_16),
                        contentDescription = "Permanent 9:16 Disha Manch Header",
                        contentScale = ContentScale.FillWidth,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                    )
                    Image(
                        painter = painterResource(id = R.drawable.brand_footer_9_16),
                        contentDescription = "Permanent 9:16 Disha Manch Footer",
                        contentScale = ContentScale.FillWidth,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(8.dp))
                    )
                }
            }
        }

        // Dropdown Controls Card
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(StudioColors.CardSurface)
                .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(16.dp))
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            StudioDropdownSelector(
                label = "Video Type (वीडियो स्टाइल)",
                selectedText = uiState.selectedVideoType.displayName,
                items = VideoType.entries,
                itemText = { "${it.displayName} — ${it.hindiSubtitle}" },
                onSelect = onSelectVideoType
            )

            StudioDropdownSelector(
                label = "Content Style",
                selectedText = "${uiState.selectedStyle.displayName} · ${uiState.selectedStyle.hindiSubtitle}",
                items = VideoStyle.entries,
                itemText = { "${it.displayName} — ${it.hindiSubtitle}" },
                onSelect = onSelectStyle
            )

            StudioDropdownSelector(
                label = "Hindi Voice",
                selectedText = "${uiState.selectedVoice.name} (${uiState.selectedVoice.gender}) · ${uiState.selectedVoice.tone}",
                items = StudioCatalog.hindiVoices,
                itemText = { "${it.name} (${it.gender}) · ${it.tone} · ${it.engineLabel}" },
                onSelect = onSelectVoice
            )

            StudioDropdownSelector(
                label = "Script AI",
                selectedText = "${uiState.selectedScriptAi.name} (${uiState.selectedScriptAi.costLabel})",
                items = StudioCatalog.scriptAiProviders,
                itemText = { "${it.name} · ${it.costLabel}" },
                onSelect = onSelectScriptAi
            )
        }

        // Single direct-script input. Scene planning is handled internally by the Render Node.
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(16.dp))
                .background(StudioColors.CardSurface)
                .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(16.dp))
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text("पूरी हिंदी स्क्रिप्ट", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = StudioColors.TextPrimary)
            Text("कोई Scene बनाने की जरूरत नहीं। स्क्रिप्ट के अनुसार विजुअल और टेक्स्ट अपने-आप बनेंगे।", fontSize = 12.sp, color = StudioColors.TextSecondary)
            OutlinedTextField(
                value = uiState.scriptText,
                onValueChange = onScriptChange,
                modifier = Modifier.fillMaxWidth().height(260.dp),
                placeholder = { Text("यहाँ अपनी पूरी स्क्रिप्ट लिखें या पेस्ट करें...", color = StudioColors.TextMuted) },
                minLines = 8,
                maxLines = 16,
                shape = RoundedCornerShape(12.dp),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = StudioColors.NavyBase,
                    unfocusedContainerColor = StudioColors.NavyBase,
                    focusedBorderColor = StudioColors.BlueHighlight,
                    unfocusedBorderColor = StudioColors.BorderHairline,
                    focusedTextColor = StudioColors.TextPrimary,
                    unfocusedTextColor = StudioColors.TextPrimary
                )
            )
            Text("$scriptLength अक्षर · पूरी स्क्रिप्ट प्रोसेस होगी", fontSize = 11.sp, color = StudioColors.TextSecondary)
        }

        if (uiState.validationError != null) {
            Text(
                text = uiState.validationError,
                color = StudioColors.StatusError,
                fontSize = 12.sp
            )
        }

        // Primary Orange Action CTA
        Button(
            onClick = onGenerateClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = StudioColors.OrangeCta,
                contentColor = Color.White
            )
        ) {
            Icon(
                imageVector = Icons.Rounded.MovieCreation,
                contentDescription = null,
                modifier = Modifier.size(20.dp)
            )
            Spacer(modifier = Modifier.width(10.dp))
            Text(
                text = "पूरी स्क्रिप्ट से वीडियो बनाएँ",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Row(
            modifier = Modifier
                .fillMaxWidth()
                .clip(RoundedCornerShape(12.dp))
                .background(StudioColors.NavyBase)
                .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(12.dp))
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Icon(
                imageVector = Icons.Rounded.AutoAwesome,
                contentDescription = null,
                tint = StudioColors.BlueHighlight,
                modifier = Modifier.size(18.dp)
            )
            Text(
                text = "Renders active scenes in your chosen Video Type with Edge Neural Hindi Voice & locked 9:16 branding.",
                fontSize = 11.sp,
                lineHeight = 16.sp,
                color = StudioColors.TextSecondary
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun <T> StudioDropdownSelector(
    label: String,
    selectedText: String,
    items: List<T>,
    itemText: (T) -> String,
    onSelect: (T) -> Unit
) {
    var expanded by remember { mutableStateOf(false) }

    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(
            text = label,
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            color = StudioColors.TextSecondary
        )

        ExposedDropdownMenuBox(
            expanded = expanded,
            onExpandedChange = { expanded = !expanded }
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .menuAnchor(MenuAnchorType.PrimaryNotEditable, enabled = true)
                    .height(48.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(StudioColors.DeepNavyCanvas)
                    .border(1.dp, StudioColors.BorderHairline, RoundedCornerShape(12.dp))
                    .padding(horizontal = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = selectedText,
                    color = StudioColors.TextPrimary,
                    fontSize = 14.sp,
                    maxLines = 1,
                    modifier = Modifier.weight(1f)
                )
                Icon(
                    imageVector = Icons.Rounded.KeyboardArrowDown,
                    contentDescription = "Select $label",
                    tint = StudioColors.TextSecondary
                )
            }

            ExposedDropdownMenu(
                expanded = expanded,
                onDismissRequest = { expanded = false },
                modifier = Modifier.background(StudioColors.ElevatedSurface)
            ) {
                items.forEach { item ->
                    DropdownMenuItem(
                        text = {
                            Text(
                                text = itemText(item),
                                color = StudioColors.TextPrimary,
                                fontSize = 13.sp
                            )
                        },
                        onClick = {
                            onSelect(item)
                            expanded = false
                        }
                    )
                }
            }
        }
    }
}
