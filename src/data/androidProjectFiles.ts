import settingsGradle from '../../android/settings.gradle.kts?raw';
import rootBuildGradle from '../../android/build.gradle.kts?raw';
import gradleProperties from '../../android/gradle.properties?raw';
import androidReadme from '../../android/README.md?raw';
import appBuildGradle from '../../android/app/build.gradle.kts?raw';
import proguardRules from '../../android/app/proguard-rules.pro?raw';
import androidManifest from '../../android/app/src/main/AndroidManifest.xml?raw';
import stringsXml from '../../android/app/src/main/res/values/strings.xml?raw';
import themesXml from '../../android/app/src/main/res/values/themes.xml?raw';
import icLauncherXml from '../../android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml?raw';
import icLauncherRoundXml from '../../android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml?raw';
import icLauncherBgXml from '../../android/app/src/main/res/drawable/ic_launcher_background.xml?raw';
import icLauncherFgXml from '../../android/app/src/main/res/drawable/ic_launcher_foreground.xml?raw';
import mainActivityKt from '../../android/app/src/main/java/com/hindivideostudio/app/MainActivity.kt?raw';
import themeKt from '../../android/app/src/main/java/com/hindivideostudio/app/ui/theme/Theme.kt?raw';
import modelsKt from '../../android/app/src/main/java/com/hindivideostudio/app/model/StudioModels.kt?raw';
import renderNodeClientKt from '../../android/app/src/main/java/com/hindivideostudio/app/data/RenderNodeClient.kt?raw';
import localRepoKt from '../../android/app/src/main/java/com/hindivideostudio/app/data/LocalDraftRepository.kt?raw';
import viewModelKt from '../../android/app/src/main/java/com/hindivideostudio/app/viewmodel/StudioViewModel.kt?raw';
import studioHeaderKt from '../../android/app/src/main/java/com/hindivideostudio/app/ui/components/StudioHeader.kt?raw';
import renderNodeSheetKt from '../../android/app/src/main/java/com/hindivideostudio/app/ui/components/RenderNodeSheet.kt?raw';
import studioScreenKt from '../../android/app/src/main/java/com/hindivideostudio/app/ui/screens/StudioScreen.kt?raw';
import progressScreenKt from '../../android/app/src/main/java/com/hindivideostudio/app/ui/screens/GenerationProgressScreen.kt?raw';
import libraryScreenKt from '../../android/app/src/main/java/com/hindivideostudio/app/ui/screens/LibraryScreen.kt?raw';
import previewScreenKt from '../../android/app/src/main/java/com/hindivideostudio/app/ui/screens/VideoPreviewExportScreen.kt?raw';

export interface AndroidSourceFile {
  path: string;
  language: 'kotlin' | 'xml' | 'gradle' | 'markdown' | 'properties';
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidSourceFile[] = [
  { path: 'README.md', language: 'markdown', content: androidReadme },
  { path: 'settings.gradle.kts', language: 'gradle', content: settingsGradle },
  { path: 'build.gradle.kts', language: 'gradle', content: rootBuildGradle },
  { path: 'gradle.properties', language: 'properties', content: gradleProperties },
  { path: 'app/build.gradle.kts', language: 'gradle', content: appBuildGradle },
  { path: 'app/proguard-rules.pro', language: 'properties', content: proguardRules },
  { path: 'app/src/main/AndroidManifest.xml', language: 'xml', content: androidManifest },
  { path: 'app/src/main/res/values/strings.xml', language: 'xml', content: stringsXml },
  { path: 'app/src/main/res/values/themes.xml', language: 'xml', content: themesXml },
  { path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml', language: 'xml', content: icLauncherXml },
  { path: 'app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml', language: 'xml', content: icLauncherRoundXml },
  { path: 'app/src/main/res/drawable/ic_launcher_background.xml', language: 'xml', content: icLauncherBgXml },
  { path: 'app/src/main/res/drawable/ic_launcher_foreground.xml', language: 'xml', content: icLauncherFgXml },
  { path: 'app/src/main/java/com/hindivideostudio/app/MainActivity.kt', language: 'kotlin', content: mainActivityKt },
  { path: 'app/src/main/java/com/hindivideostudio/app/ui/theme/Theme.kt', language: 'kotlin', content: themeKt },
  { path: 'app/src/main/java/com/hindivideostudio/app/model/StudioModels.kt', language: 'kotlin', content: modelsKt },
  { path: 'app/src/main/java/com/hindivideostudio/app/data/RenderNodeClient.kt', language: 'kotlin', content: renderNodeClientKt },
  { path: 'app/src/main/java/com/hindivideostudio/app/data/LocalDraftRepository.kt', language: 'kotlin', content: localRepoKt },
  { path: 'app/src/main/java/com/hindivideostudio/app/viewmodel/StudioViewModel.kt', language: 'kotlin', content: viewModelKt },
  { path: 'app/src/main/java/com/hindivideostudio/app/ui/components/StudioHeader.kt', language: 'kotlin', content: studioHeaderKt },
  { path: 'app/src/main/java/com/hindivideostudio/app/ui/components/RenderNodeSheet.kt', language: 'kotlin', content: renderNodeSheetKt },
  { path: 'app/src/main/java/com/hindivideostudio/app/ui/screens/StudioScreen.kt', language: 'kotlin', content: studioScreenKt },
  { path: 'app/src/main/java/com/hindivideostudio/app/ui/screens/GenerationProgressScreen.kt', language: 'kotlin', content: progressScreenKt },
  { path: 'app/src/main/java/com/hindivideostudio/app/ui/screens/LibraryScreen.kt', language: 'kotlin', content: libraryScreenKt },
  { path: 'app/src/main/java/com/hindivideostudio/app/ui/screens/VideoPreviewExportScreen.kt', language: 'kotlin', content: previewScreenKt },
];
