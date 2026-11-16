// The voice picker is the whole reason Cortex stopped sounding like a satnav, so it is tested
// against the voice lists real systems actually report.
import { test } from 'node:test';
import assert from 'node:assert/strict';

global.window = { speechSynthesis: { getVoices: () => [], addEventListener() {} } };
global.speechSynthesis = global.window.speechSynthesis;
global.setInterval = () => 0;
const { pickVoice, sentences } = await import('../src/scripts/speech.js');

const V = (name, lang, localService = true) => ({ name, lang, localService });

test('picks a Windows 11 natural voice over the old robotic default', () => {
  const win = [V('Microsoft David - English (United States)', 'en-US'), V('Microsoft Zira - English (United States)', 'en-US'), V('Microsoft Andrew Online (Natural) - English (United States)', 'en-US', false)];
  assert.match(pickVoice(win).name, /Andrew/);
});

test('picks a macOS premium voice over a compact one', () => {
  const mac = [V('Albert', 'en-US'), V('Fred', 'en-US'), V('Samantha', 'en-US'), V('Daniel (Premium)', 'en-GB')];
  assert.match(pickVoice(mac).name, /Premium/);
});

test('falls back to the least bad voice when nothing good is installed', () => {
  const bare = [V('Microsoft David - English (United States)', 'en-US'), V('Samantha', 'en-US')];
  assert.equal(pickVoice(bare).name, 'Samantha');
});

test('ignores voices that are not English', () => {
  assert.equal(pickVoice([V('Google Deutsch', 'de-DE'), V('Kyoko', 'ja-JP')]), null);
});

test('prefers Canadian English when the quality is equal', () => {
  const l = [V('Microsoft Liam Online (Natural) - English (Canada)', 'en-CA', false), V('Microsoft Brian Online (Natural) - English (United States)', 'en-US', false)];
  assert.match(pickVoice(l).name, /Liam/);
});

test('breaks a long answer into breaths, never mid sentence', () => {
  const s = sentences('He ships weekly. The studies page lists every evaluated run with its date. Two papers are published in AIP Conference Proceedings. The rest is on the work page.');
  assert.ok(s.length >= 3, 'a four sentence answer should be read in several breaths');
  for (const line of s) assert.match(line, /[.!?]$/, 'a breath ends on punctuation');
  assert.equal(s.join(' ').replace(/\s+/g, ' '), 'He ships weekly. The studies page lists every evaluated run with its date. Two papers are published in AIP Conference Proceedings. The rest is on the work page.');
});

test('a short answer is one breath, not a stutter of fragments', () => {
  assert.deepEqual(sentences('He ships weekly. Yes.'), ['He ships weekly. Yes.']);
});

test('empty text reads as nothing', () => {
  assert.deepEqual(sentences('   '), []);
});
