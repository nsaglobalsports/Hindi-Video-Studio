import test from 'node:test';
import assert from 'node:assert/strict';
import { splitFullScriptIntoScenes } from '../server/scriptChunker.ts';
import { build3DSceneBackgroundSvg, buildAnimatedScreenTextAss } from '../server/scene3dRenderer.ts';

test('long Hindi scripts are split without dropping or reordering words', () => {
  const script = ('नमस्कार दोस्तों! पूरी जानकारी ध्यान से सुनिए। ').repeat(250);
  const scenes = splitFullScriptIntoScenes(script);
  const sourceWords = script.trim().split(/\s+/u);
  const renderedWords = scenes.flatMap((scene) => scene.voiceScript.split(/\s+/u));
  assert.ok(scenes.length > 1);
  assert.deepEqual(renderedWords, sourceWords);
  assert.ok(scenes.every((scene) => scene.voiceScript.length <= 560));
});

test('very long sentences are split at word boundaries and retained', () => {
  const script = 'लंबा शब्द परीक्षण '.repeat(500);
  const scenes = splitFullScriptIntoScenes(script);
  assert.deepEqual(
    scenes.flatMap((scene) => scene.voiceScript.split(/\s+/u)),
    script.trim().split(/\s+/u)
  );
});

test('Hindi captions generate ASS dialogue for each script chunk', () => {
  const script = 'नमस्कार दोस्तों! यह हिंदी सबटाइटल की जाँच है।';
  const scene = splitFullScriptIntoScenes(script)[0];
  const ass = buildAnimatedScreenTextAss({
    width: 1080,
    height: 1920,
    isVertical: true,
    screenText: scene.screenText,
    voiceScript: scene.voiceScript,
    sceneDurationSec: 8,
    wordTimings: [],
  });
  assert.ok(ass);
  assert.match(ass, /Noto Sans Devanagari/);
  assert.match(ass, /Dialogue:/);
});


test('automatic fallback visuals detect farming, education and sports subjects', () => {
  const farm = build3DSceneBackgroundSvg({ width: 1080, height: 1600, visualPrompt: 'किसान खेती और ट्रैक्टर', voiceScript: 'किसान खेती और ट्रैक्टर', style: 'Educational', sceneNumber: 1 });
  const education = build3DSceneBackgroundSvg({ width: 1080, height: 1600, visualPrompt: 'छात्रों की परीक्षा और पढ़ाई', voiceScript: 'छात्रों की परीक्षा और पढ़ाई', style: 'Educational', sceneNumber: 1 });
  const sports = build3DSceneBackgroundSvg({ width: 1080, height: 1600, visualPrompt: 'बैडमिंटन खिलाड़ी का खेल', voiceScript: 'बैडमिंटन खिलाड़ी का खेल', style: 'Educational', sceneNumber: 1 });
  assert.match(farm, /#15803D/);
  assert.match(education, /#2563EB/);
  assert.match(sports, /#1E293B/);
});


test('decimal values and version numbers are not split at internal dots', () => {
  const script = 'संस्करण 1.5 में 2.75 प्रतिशत की वृद्धि दर्ज हुई। अगला अपडेट v2.1 में आएगा।';
  const scenes = splitFullScriptIntoScenes(script);
  const spoken = scenes.map((scene) => scene.voiceScript).join(' ');
  assert.match(spoken, /1\.5/);
  assert.match(spoken, /2\.75/);
  assert.match(spoken, /v2\.1/);
});
