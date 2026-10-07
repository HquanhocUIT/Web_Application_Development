"use strict";

const drumPads = document.querySelectorAll(".drum-pad");
const audioElements = document.querySelectorAll("audio[data-sound]");

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