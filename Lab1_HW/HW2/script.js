"use strict";

const drumPads = document.querySelectorAll(".drum-pad");
const audioElements = document.querySelectorAll("audio[data-sound]");

const soundMap = new Map();

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