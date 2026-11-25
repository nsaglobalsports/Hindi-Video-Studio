package com.hindivideostudio.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object StudioColors {
    val DeepNavyCanvas = Color(0xFF060913)
    val NavyBase = Color(0xFF0A101F)
    val CardSurface = Color(0xFF111A2E)
    val ElevatedSurface = Color(0xFF16223B)
    val BorderHairline = Color(0xFF1E293B)
    val BorderActiveBlue = Color(0xFF3B82F6)
    val BluePrimary = Color(0xFF2563EB)
    val BlueHighlight = Color(0xFF3B82F6)
    val OrangeCta = Color(0xFFF97316)
    val OrangePressed = Color(0xFFEA580C)
    val TextPrimary = Color(0xFFF8FAFC)
    val TextSecondary = Color(0xFF94A3B8)
    val TextMuted = Color(0xFF64748B)
    val StatusOnline = Color(0xFF10B981)
    val StatusOffline = Color(0xFFF59E0B)
    val StatusError = Color(0xFFEF4444)
}

private val StudioDarkColorScheme = darkColorScheme(
    primary = StudioColors.BluePrimary,
    onPrimary = Color.White,
    secondary = StudioColors.OrangeCta,
    onSecondary = Color.White,
    background = StudioColors.DeepNavyCanvas,
    onBackground = StudioColors.TextPrimary,
    surface = StudioColors.CardSurface,
    onSurface = StudioColors.TextPrimary,
    surfaceVariant = StudioColors.ElevatedSurface,
    onSurfaceVariant = StudioColors.TextSecondary,
    outline = StudioColors.BorderHairline,
    error = StudioColors.StatusError
)

private val StudioTypography = Typography(
    headlineMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Bold,
        fontSize = 24.sp,
        lineHeight = 32.sp,
        color = StudioColors.TextPrimary
    ),
    titleMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.SemiBold,
        fontSize = 16.sp,
        lineHeight = 22.sp,
        color = StudioColors.TextPrimary
    ),
    bodyMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Normal,
        fontSize = 14.sp,
        lineHeight = 20.sp,
        color = StudioColors.TextPrimary
    ),
    labelMedium = TextStyle(
        fontFamily = FontFamily.SansSerif,
        fontWeight = FontWeight.Medium,
        fontSize = 12.sp,
        lineHeight = 16.sp,
        color = StudioColors.TextSecondary
    )
)

@Composable
fun HindiVideoStudioTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = StudioDarkColorScheme,
        typography = StudioTypography,
        content = content
    )
}
