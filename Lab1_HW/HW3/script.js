"use strict";

/* =========================
   M1: Drift-Free Countdown
========================= */

const TARGET_TIME_UTC = "2026-12-31T23:59:59Z";
const targetTimestamp = new Date(TARGET_TIME_UTC).getTime();

const daysElement = document.getElementById("days");
const hoursElement = document.getElementById("hours");
const minutesElement = document.getElementById("minutes");
const secondsElement = document.getElementById("seconds");

function getRemainingTime() {
  const remainingTime = targetTimestamp - Date.now();

  if (remainingTime <= 0) {
    return 0;
  }

  return remainingTime;
}

function renderCountdown() {
  const remainingTime = getRemainingTime();

  if (remainingTime === 0) {
    daysElement.textContent = "00";
    hoursElement.textContent = "00";
    minutesElement.textContent = "00";
    secondsElement.textContent = "00";
    return;
  }

  const totalSeconds = Math.floor(remainingTime / 1000);

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  daysElement.textContent = String(days).padStart(2, "0");
  hoursElement.textContent = String(hours).padStart(2, "0");
  minutesElement.textContent = String(minutes).padStart(2, "0");
  secondsElement.textContent = String(seconds).padStart(2, "0");
}

renderCountdown();

const countdownInterval = setInterval(() => {
  renderCountdown();

  if (getRemainingTime() === 0) {
    clearInterval(countdownInterval);
  }
}, 1000);


/* =========================
   M2: State-Machine Form
========================= */

const FORM_STATES = {
  IDLE: "idle",
  SUBMITTING: "submitting",
  SUCCESS: "success",
  ERROR: "error",
};

let formState = FORM_STATES.IDLE;

const registrationForm = document.getElementById("registration-form");
const submitButton = document.getElementById("submit-button");
const formStatus = document.getElementById("form-status");

function setFormState(nextState) {
  formState = nextState;
  registrationForm.dataset.state = formState;

  if (formState === FORM_STATES.IDLE) {
    submitButton.textContent = "Register";
    formStatus.textContent = "";
  }

  if (formState === FORM_STATES.SUBMITTING) {
    submitButton.textContent = "Submitting...";
    formStatus.textContent = "Processing your registration...";
  }

  if (formState === FORM_STATES.SUCCESS) {
    submitButton.textContent = "Register";
    formStatus.textContent = "Registration successful.";
  }

  if (formState === FORM_STATES.ERROR) {
    submitButton.textContent = "Register";
    formStatus.textContent = "Registration failed. Please try again.";
  }
}

async function submitRegistration() {
  /*
   * Temporary submission layer.
   * A real API request can replace this later.
   */
  return Promise.resolve();
}
const allowedTransitions = {
  [FORM_STATES.IDLE]: [FORM_STATES.SUBMITTING],
  [FORM_STATES.SUBMITTING]: [
    FORM_STATES.SUCCESS,
    FORM_STATES.ERROR,
  ],
  [FORM_STATES.SUCCESS]: [],
  [FORM_STATES.ERROR]: [],
};

function setFormState(nextState) {
  if (nextState === formState) {
    return;
  }

  const validNextStates = allowedTransitions[formState];

  if (!validNextStates || !validNextStates.includes(nextState)) {
    console.error(
      `Invalid form state transition: ${formState} -> ${nextState}`,
    );
    return;
  }

  formState = nextState;
  registrationForm.dataset.state = formState;

  if (formState === FORM_STATES.SUBMITTING) {
    submitButton.textContent = "Submitting...";
    formStatus.textContent = "Processing your registration...";
  }

  if (formState === FORM_STATES.SUCCESS) {
    submitButton.textContent = "Register";
    formStatus.textContent = "Registration successful.";
  }

  if (formState === FORM_STATES.ERROR) {
    submitButton.textContent = "Register";
    formStatus.textContent = "Registration failed. Please try again.";
  }
}