"use strict";

const beatList = document.getElementById("beat-list");
const drumPads = document.querySelectorAll(".drum-pad");
const audioElements = document.querySelectorAll("audio[data-sound]");
const clearRecordingButton = document.getElementById("clear-recording");

const soundMap = new Map();

const keyBindings = new Map([
  ["a", "kick"],
  ["s", "snare"],
  ["d", "hihat"],
  ["f", "clap"],
  ["g", "tom"],
  ["h", "crash"],
]);

audioElements.forEach((audio) => {
  const soundName = audio.dataset.sound;
  soundMap.set(soundName, audio);
});

function playSound(soundName) {
  const sourceAudio = soundMap.get(soundName);

  if (!sourceAudio) {
    return;
  }

  recordBeat(soundName);

  const audioInstance = new Audio(sourceAudio.src);
  audioInstance.play();
}

drumPads.forEach((pad) => {
  pad.addEventListener("click", () => {
    const soundName = pad.dataset.sound;
    playSound(soundName);
  });
});

document.addEventListener("keydown", (event) => {
  if (event.repeat) {
    return;
  }

  const key = event.key.toLowerCase();
  const soundName = keyBindings.get(key);

  if (!soundName) {
    return;
  }

  playSound(soundName);
});

const beatQueue = [];
let recordingStartTime = null;

function recordBeat(soundName) {
  if (recordingStartTime === null) {
    recordingStartTime = performance.now();
  }

  const timestamp = performance.now() - recordingStartTime;

  const beat = {
    sound: soundName,
    timestamp: timestamp,
  };

  beatQueue.push(beat);

  renderBeatQueue();
}

function renderBeatQueue() {
  beatList.replaceChildren();

  beatQueue.forEach((beat) => {
    const item = document.createElement("li");

    item.textContent =
      `${beat.sound} - ${Math.round(beat.timestamp)} ms`;

    beatList.appendChild(item);
  });
}

clearRecordingButton.addEventListener("click", () => {
  beatQueue.length = 0;
  recordingStartTime = null;

  beatList.replaceChildren();

  const emptyMessage = document.createElement("li");
  emptyMessage.textContent = "No beats recorded yet.";

  beatList.appendChild(emptyMessage);
});