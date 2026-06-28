const chapters = Array.from(document.querySelectorAll(".chapter"));
const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");
const counter = document.querySelector("#chapter-counter");
const storyProgressBar = document.querySelector("#story-progress-bar");
const dotsWrap = document.querySelector("#chapter-dots");
const cursorDot = document.querySelector(".cursor-dot");
const letterButton = document.querySelector("#letter-button");
const scrapbookBook = document.querySelector("#scrapbook-book");
const lockScreen = document.querySelector("#lock-screen");
const heartLock = document.querySelector("#heart-lock");
const loadingScreen = document.querySelector("#loading-screen");
const dateForm = document.querySelector("#date-form");
const dateInput = document.querySelector("#anniversary-date");
const lockHint = document.querySelector("#lock-hint");

const storyState = {
  current: 0,
  hasReachedEnd: false,
  quizComplete: false,
  scrapbookPage: 0,
  enteringLetter: false
};

const scrapbookHold = {
  direction: 0,
  timer: null,
  pageTimer: null,
  releaseTimer: null
};

const HOLD_TO_FLIP_MS = 660;
const SCRAPBOOK_FLIP_MS = 1120;
const SCRAPBOOK_PAGE_SWAP_MS = 640;
const SCRAPBOOK_PHOTO_PATH = "assets/photos/scrapbook";
const SCRAPBOOK_PHOTO_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

const chapterLabels = {
  intro: "Continue",
  scrapbook: "Next",
  wrapped: "Start quiz",
  quiz: "Finish quiz",
  result: "Open jar",
  jar: "Final clue",
  finale: "Reveal ending",
  ending: "Start over"
};

chapters.forEach((_, index) => {
  const dot = document.createElement("span");
  dot.dataset.index = String(index);
  dotsWrap.appendChild(dot);
});

const questions = [
  {
    text: "Pick the opening scene.",
    options: [
      { label: "Soft lights", detail: "Dinner somewhere pretty and calm.", mood: "romantic" },
      { label: "Neon night", detail: "Games, snacks, and a little chaos.", mood: "chaotic" },
      { label: "Back to a favorite", detail: "A place that already means something.", mood: "nostalgia" },
      { label: "Comfy and close", detail: "Low-pressure, cozy, and very us.", mood: "cozy" }
    ]
  },
  {
    text: "Choose the restaurant lane.",
    options: [
      { label: "Sushi or steak", detail: "Dress up and make it sparkle.", mood: "fancy" },
      { label: "Pasta and candles", detail: "Warm, romantic, and slow.", mood: "romantic" },
      { label: "Ramen or pho", detail: "Comfort food with happy silence.", mood: "cozy" },
      { label: "Food hall crawl", detail: "Many tiny decisions, all delicious.", mood: "chaotic" }
    ]
  },
  {
    text: "Pick a dessert rule.",
    options: [
      { label: "Share something chocolate", detail: "Classic for a reason.", mood: "romantic" },
      { label: "Try the weirdest thing", detail: "For science, obviously.", mood: "chaotic" },
      { label: "Go to our old spot", detail: "Nostalgia tastes better.", mood: "nostalgia" },
      { label: "Ice cream walk", detail: "Simple, sweet, and easy.", mood: "cozy" }
    ]
  },
  {
    text: "Pick the photo energy.",
    options: [
      { label: "Main character", detail: "A real outfit and a real backdrop.", mood: "fancy" },
      { label: "Photo booth", detail: "Silly faces are required.", mood: "chaotic" },
      { label: "Recreate an old photo", detail: "Same pose, upgraded year.", mood: "nostalgia" },
      { label: "Candid and cute", detail: "No pressure, just us.", mood: "cozy" }
    ]
  },
  {
    text: "Choose the soundtrack.",
    options: [
      { label: "Soft love songs", detail: "The romantic montage version.", mood: "romantic" },
      { label: "Car karaoke", detail: "Volume up, dignity optional.", mood: "chaotic" },
      { label: "Songs from year one", detail: "A tiny time capsule.", mood: "nostalgia" },
      { label: "Smooth dinner playlist", detail: "A little polished, a little cinematic.", mood: "fancy" }
    ]
  },
  {
    text: "Pick the ending.",
    options: [
      { label: "A handwritten note", detail: "Quiet, sincere, and saved forever.", mood: "romantic" },
      { label: "One more surprise stop", detail: "Because the night has a bonus level.", mood: "chaotic" },
      { label: "Look through photos", detail: "A gentle replay of the year.", mood: "nostalgia" },
      { label: "Movie and dessert", detail: "The soft landing.", mood: "cozy" }
    ]
  }
];

const results = {
  cozy: {
    title: "Cozy Anniversary Mode",
    tagline: "The night says soft hoodies, favorite bites, and a dessert that somehow fixes everything.",
    restaurant: "Ramen, pho, pizza, or a comfort-food favorite",
    theme: "Soft blue, blush pink, and close-to-home sweetness",
    outfit: "Cute but comfy",
    dessert: "Ice cream walk or bakery stop",
    plan: [
      "Start with a favorite comfort meal and no rushed timeline.",
      "Add a low-key photo, a shared dessert, and a tiny handwritten note.",
      "End with a movie, playlist, or a drive that feels like a reset button."
    ]
  },
  fancy: {
    title: "Fancy Main Character Mode",
    tagline: "A polished date-night result with the kind of outfits that deserve too many photos.",
    restaurant: "Sushi, steak, seafood, or a reservation-only spot",
    theme: "Dress-up dinner with blue-pink sparkle",
    outfit: "Sharp, romantic, camera-ready",
    dessert: "Chocolate, mocktails, or rooftop sweets",
    plan: [
      "Book the dinner that feels a little more special than normal.",
      "Take photos before or after, preferably somewhere with pretty lights.",
      "End with dessert and a final toast to the first year."
    ]
  },
  romantic: {
    title: "Soft Romantic Mode",
    tagline: "Candlelight energy, slow pacing, and one sincere moment saved for the end.",
    restaurant: "Pasta, wine bar, bistro, or candlelit dinner",
    theme: "Flowers, soft lights, and a note worth keeping",
    outfit: "Romantic but relaxed",
    dessert: "Chocolate, cheesecake, or a shared slice",
    plan: [
      "Start with flowers or a small keepsake before dinner.",
      "Keep dinner slow, warm, and phone-light.",
      "End with the note, the dessert, and a memory from the year."
    ]
  },
  nostalgia: {
    title: "Nostalgia Tour Mode",
    tagline: "A little museum of year one, starring the places and moments that already belong to you two.",
    restaurant: "First-date spot, favorite cafe, or meaningful restaurant",
    theme: "Memory lane with upgraded anniversary energy",
    outfit: "Something that matches an old photo or old date",
    dessert: "A treat from a place you already love",
    plan: [
      "Visit one place from your first year together.",
      "Recreate a photo, order a favorite, or replay a tiny tradition.",
      "End by opening the memory jar and picking one note."
    ]
  },
  chaotic: {
    title: "Chaotic Fun Mode",
    tagline: "The algorithm has chosen laughter, snacks, and at least one plan that sounds slightly ridiculous.",
    restaurant: "Food hall, tacos, Korean BBQ, or shareable small plates",
    theme: "Arcade tokens, photo booth faces, and dessert roulette",
    outfit: "Cute enough for photos, practical enough for games",
    dessert: "Whatever looks most fun in the moment",
    plan: [
      "Start with games, mini golf, bowling, an arcade, or a silly challenge.",
      "Eat somewhere with lots of options and very low seriousness.",
      "End with a random dessert stop and one final ridiculous photo."
    ]
  }
};

const memoryNotes = {
  first: {
    title: "The first little spark",
    body: "Replace this with the moment that still feels like the beginning of everything."
  },
  laugh: {
    title: "The laugh we kept",
    body: "A small memory for the joke, face, or moment that still makes both of you smile."
  },
  dinner: {
    title: "The meal that became a memory",
    body: "Put the restaurant, snack, dessert, or kitchen experiment that deserves its own tiny award."
  },
  drive: {
    title: "The quiet ride home",
    body: "For the drive, walk, or late-night conversation that made the world feel smaller."
  },
  future: {
    title: "A note from the next chapter",
    body: "One year is the opening scene. The best part is that there is still so much left to find."
  }
};

const quizState = {
  currentQuestion: 0,
  scores: {
    cozy: 0,
    fancy: 0,
    romantic: 0,
    nostalgia: 0,
    chaotic: 0
  }
};

const questionTitle = document.querySelector("#question-title");
const answerGrid = document.querySelector("#answer-grid");
const quizProgress = document.querySelector("#quiz-progress");
const questionProgressBar = document.querySelector("#question-progress-bar");
const restartButton = document.querySelector("#restart-quiz");

function normalizeDate(value) {
  return value.replace(/\D/g, "");
}

function unlockSite() {
  if (lockScreen.classList.contains("is-unlocking")) {
    return;
  }

  lockScreen.classList.remove("is-typing", "shake");
  lockScreen.classList.add("is-unlocking");
  heartLock.setAttribute("aria-label", "Unlocked heart lock");
  dateInput.blur();

  window.setTimeout(() => {
    lockScreen.classList.add("is-unlocked");
    loadingScreen.classList.add("is-visible");
    loadingScreen.setAttribute("aria-hidden", "false");
  }, 650);

  window.setTimeout(() => {
    document.body.classList.remove("is-locked");
    loadingScreen.classList.remove("is-visible");
    loadingScreen.setAttribute("aria-hidden", "true");
  }, 2350);
}

function animateWrappedCounters() {
  const wrappedCounters = document.querySelectorAll("[data-wrapped-count]");

  wrappedCounters.forEach((counterElement) => {
    const target = Number(counterElement.dataset.target || "0");
    const suffix = counterElement.dataset.suffix || "";
    const duration = 1100;
    let startedAt;

    counterElement.textContent = "0";

    function step(timestamp) {
      if (!startedAt) {
        startedAt = timestamp;
      }

      const elapsed = timestamp - startedAt;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased).toLocaleString();

      counterElement.textContent = `${value}${suffix}`;

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    }

    window.requestAnimationFrame(step);
  });
}

function triggerWrappedReveal() {
  const wrappedSection = document.querySelector("#wrapped");

  if (!wrappedSection) {
    return;
  }

  wrappedSection.classList.remove("is-wrapped-playing");
  void wrappedSection.offsetWidth;
  wrappedSection.classList.add("is-wrapped-playing");
  animateWrappedCounters();
}

function setChapter(index) {
  const boundedIndex = Math.max(0, Math.min(index, chapters.length - 1));
  storyState.current = boundedIndex;

  chapters.forEach((chapter, chapterIndex) => {
    chapter.classList.toggle("is-active", chapterIndex === boundedIndex);
    chapter.classList.toggle("is-past", chapterIndex < boundedIndex);
    chapter.setAttribute("aria-hidden", chapterIndex === boundedIndex ? "false" : "true");
  });

  if (boundedIndex === chapters.length - 1) {
    storyState.hasReachedEnd = true;
  }

  updateStoryControls();

  if (chapters[boundedIndex].dataset.chapter === "wrapped") {
    triggerWrappedReveal();
  }
}

function updateStoryControls() {
  const chapter = chapters[storyState.current];
  const chapterKey = chapter.dataset.chapter;
  const progress = ((storyState.current + 1) / chapters.length) * 100;

  counter.textContent = `Chapter ${storyState.current + 1} of ${chapters.length}`;
  storyProgressBar.style.width = `${progress}%`;

  Array.from(dotsWrap.children).forEach((dot, index) => {
    dot.classList.toggle("is-active", index === storyState.current);
  });
  dotsWrap.classList.toggle("is-hidden", chapterKey === "ending");

  backButton.classList.toggle("is-hidden", !storyState.hasReachedEnd);
  nextButton.classList.toggle("is-hidden", chapterKey === "intro" || chapterKey === "finale");
  nextButton.textContent = chapterLabels[chapterKey] || "Next";

  const onQuiz = chapterKey === "quiz";
  nextButton.disabled = onQuiz && !storyState.quizComplete;

  if (chapterKey === "ending") {
    nextButton.classList.remove("is-hidden");
    nextButton.textContent = "Start over";
  }
}

function nextChapter() {
  const chapterKey = chapters[storyState.current].dataset.chapter;

  if (chapterKey === "ending") {
    setChapter(0);
    return;
  }

  if (chapterKey === "quiz" && !storyState.quizComplete) {
    return;
  }

  setChapter(storyState.current + 1);
}

function openLetter(event) {
  if (event) {
    event.preventDefault();
  }

  if (chapters[storyState.current].dataset.chapter !== "intro" || storyState.enteringLetter) {
    return;
  }

  storyState.enteringLetter = true;
  letterButton.classList.add("is-entering");
  document.querySelector("#intro").classList.add("is-entering");

  window.setTimeout(() => {
    setChapter(getChapterIndex("scrapbook"));

    window.setTimeout(() => {
      letterButton.classList.remove("is-entering");
      document.querySelector("#intro").classList.remove("is-entering");
      storyState.enteringLetter = false;
    }, 220);
  }, 1380);
}

function previousChapter() {
  if (!storyState.hasReachedEnd) {
    return;
  }
  setChapter(storyState.current - 1);
}

function renderQuestion() {
  const question = questions[quizState.currentQuestion];
  const questionNumber = quizState.currentQuestion + 1;

  quizProgress.textContent = `Question ${questionNumber} of ${questions.length}`;
  questionProgressBar.style.width = `${(questionNumber / questions.length) * 100}%`;
  questionTitle.textContent = question.text;
  answerGrid.innerHTML = "";

  question.options.forEach((option) => {
    const button = document.createElement("button");
    button.className = "answer-option";
    button.type = "button";
    button.innerHTML = `<strong>${option.label}</strong><span>${option.detail}</span>`;
    button.addEventListener("click", () => chooseAnswer(option.mood));
    answerGrid.appendChild(button);
  });
}

function chooseAnswer(mood) {
  quizState.scores[mood] += 1;

  if (quizState.currentQuestion < questions.length - 1) {
    quizState.currentQuestion += 1;
    renderQuestion();
    return;
  }

  storyState.quizComplete = true;
  document.querySelector("#quiz-lock-note").textContent = "Result unlocked.";
  showResult();
  setChapter(getChapterIndex("result"));
}

function getWinningMood() {
  return Object.entries(quizState.scores).sort((a, b) => b[1] - a[1])[0][0];
}

function showResult() {
  const result = results[getWinningMood()];
  document.querySelector("#result-title").textContent = result.title;
  document.querySelector("#result-tagline").textContent = result.tagline;
  document.querySelector("#result-restaurant").textContent = result.restaurant;
  document.querySelector("#result-theme").textContent = result.theme;
  document.querySelector("#result-outfit").textContent = result.outfit;
  document.querySelector("#result-dessert").textContent = result.dessert;

  const planList = document.querySelector("#result-plan");
  planList.innerHTML = "";
  result.plan.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    planList.appendChild(listItem);
  });
}

function restartQuiz() {
  quizState.currentQuestion = 0;
  Object.keys(quizState.scores).forEach((key) => {
    quizState.scores[key] = 0;
  });
  storyState.quizComplete = false;
  document.querySelector("#quiz-lock-note").textContent = "Finish the quiz to unlock the next chapter.";
  renderQuestion();
  updateStoryControls();
}

function setScrapbookPage(pageIndex) {
  const spreads = Array.from(document.querySelectorAll(".scrapbook-spread"));
  storyState.scrapbookPage = Math.max(0, Math.min(pageIndex, spreads.length - 1));

  spreads.forEach((spread, index) => {
    spread.classList.toggle("is-current", index === storyState.scrapbookPage);
    spread.classList.toggle("is-before", index < storyState.scrapbookPage);
  });

  document.querySelector("#scrap-count").textContent = `Page ${storyState.scrapbookPage + 1} of ${spreads.length}`;
  document.querySelector("#scrap-prev").disabled = storyState.scrapbookPage === 0;
  document.querySelector("#scrap-next").disabled = storyState.scrapbookPage === spreads.length - 1;
  scrapbookBook.dataset.page = storyState.scrapbookPage;

  const currentEra = spreads[storyState.scrapbookPage]?.dataset.eraIndex ?? "0";
  document.querySelectorAll(".era-index-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.eraIndex === currentEra);
  });
}

function findScrapbookPhoto(number) {
  const candidates = SCRAPBOOK_PHOTO_EXTENSIONS.map(
    (extension) => `${SCRAPBOOK_PHOTO_PATH}/${number}.${extension}`
  );

  return new Promise((resolve) => {
    let index = 0;

    function tryNext() {
      if (index >= candidates.length) {
        resolve(null);
        return;
      }

      const url = candidates[index];
      index += 1;
      const image = new Image();
      image.onload = () => resolve(url);
      image.onerror = tryNext;
      image.src = `${url}?v=${Date.now()}`;
    }

    tryNext();
  });
}

function loadScrapbookPhotos() {
  document.querySelectorAll(".scrap-photo[data-photo-number]").forEach(async (slot) => {
    const number = slot.dataset.photoNumber;
    const photoUrl = await findScrapbookPhoto(number);

    if (!photoUrl) {
      return;
    }

    slot.classList.add("has-real-photo");
    slot.dataset.photoFile = photoUrl.split("/").pop();
    slot.style.backgroundImage = `url("${photoUrl}")`;
  });
}

function canFlipScrapbook(direction) {
  const spreads = document.querySelectorAll(".scrapbook-spread");
  return (
    (direction < 0 && storyState.scrapbookPage > 0) ||
    (direction > 0 && storyState.scrapbookPage < spreads.length - 1)
  );
}

function clearScrapbookHold() {
  window.clearTimeout(scrapbookHold.timer);
  scrapbookHold.timer = null;
  scrapbookHold.direction = 0;
  scrapbookBook.classList.remove("is-holding-next", "is-holding-prev", "is-denied");
}

function finishScrapbookHold(direction) {
  if (!canFlipScrapbook(direction)) {
    clearScrapbookHold();
    return;
  }

  scrapbookHold.timer = null;
  scrapbookHold.direction = 0;
  scrapbookBook.classList.remove("is-holding-next", "is-holding-prev", "is-denied");
  scrapbookBook.classList.remove("is-flipping-forward", "is-flipping-backward");
  scrapbookBook.classList.add(direction > 0 ? "is-flipping-forward" : "is-flipping-backward");

  window.clearTimeout(scrapbookHold.pageTimer);
  window.clearTimeout(scrapbookHold.releaseTimer);
  scrapbookHold.pageTimer = window.setTimeout(() => {
    setScrapbookPage(storyState.scrapbookPage + direction);
  }, SCRAPBOOK_PAGE_SWAP_MS);

  scrapbookHold.releaseTimer = window.setTimeout(() => {
    scrapbookBook.classList.remove("is-flipping-forward", "is-flipping-backward");
  }, SCRAPBOOK_FLIP_MS);
}

function triggerScrapbookFlip(direction) {
  if (!canFlipScrapbook(direction)) {
    scrapbookBook.classList.add("is-denied");
    window.setTimeout(() => scrapbookBook.classList.remove("is-denied"), 260);
    return;
  }

  clearScrapbookHold();
  scrapbookBook.classList.add(direction > 0 ? "is-holding-next" : "is-holding-prev");
  scrapbookHold.timer = window.setTimeout(() => finishScrapbookHold(direction), 120);
}

function getScrapbookDirection(event) {
  const bounds = scrapbookBook.getBoundingClientRect();
  return event.clientX < bounds.left + bounds.width / 2 ? -1 : 1;
}

function startScrapbookHold(event) {
  if (event.button !== undefined && event.button !== 0) {
    return;
  }

  if (chapters[storyState.current].dataset.chapter !== "scrapbook") {
    return;
  }

  const direction = getScrapbookDirection(event);

  if (!canFlipScrapbook(direction)) {
    scrapbookBook.classList.add("is-denied");
    window.setTimeout(() => scrapbookBook.classList.remove("is-denied"), 260);
    return;
  }

  event.preventDefault();
  clearScrapbookHold();
  scrapbookHold.direction = direction;
  scrapbookBook.setPointerCapture?.(event.pointerId);
  scrapbookBook.classList.add(direction > 0 ? "is-holding-next" : "is-holding-prev");
  scrapbookHold.timer = window.setTimeout(() => finishScrapbookHold(direction), HOLD_TO_FLIP_MS);
}

function cancelScrapbookHold(event) {
  if (!scrapbookHold.timer) {
    return;
  }

  if (event?.pointerId !== undefined && scrapbookBook.hasPointerCapture?.(event.pointerId)) {
    scrapbookBook.releasePointerCapture(event.pointerId);
  }

  clearScrapbookHold();
}

function getChapterIndex(key) {
  return chapters.findIndex((chapter) => chapter.dataset.chapter === key);
}

function openNote(key) {
  const note = memoryNotes[key];
  if (!note) {
    return;
  }

  document.querySelector("#note-modal-title").textContent = note.title;
  document.querySelector("#note-modal-body").textContent = note.body;
  document.querySelector("#jar-message").textContent = `Opened: ${note.title}`;
  document.querySelector("#note-modal").classList.add("is-open");
  document.querySelector("#note-modal").setAttribute("aria-hidden", "false");
}

function closeNote() {
  document.querySelector("#note-modal").classList.remove("is-open");
  document.querySelector("#note-modal").setAttribute("aria-hidden", "true");
}

let cursorRaf = 0;
let latestPointer = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
function scheduleCursorUpdate(event) {
  latestPointer = { x: event.clientX, y: event.clientY };

  if (cursorRaf) {
    return;
  }

  cursorRaf = window.requestAnimationFrame(() => {
    cursorRaf = 0;
    const x = `${latestPointer.x}px`;
    const y = `${latestPointer.y}px`;
    document.documentElement.style.setProperty("--cursor-x", x);
    document.documentElement.style.setProperty("--cursor-y", y);

    if (cursorDot) {
      cursorDot.style.transform = `translate3d(${latestPointer.x}px, ${latestPointer.y}px, 0)`;
    }
  });
}

function moveJarNotes(event) {
  const jarStage = document.querySelector("#jar-stage");
  if (!jarStage) {
    return;
  }

  const rect = jarStage.getBoundingClientRect();
  const relX = (event.clientX - rect.left) / rect.width - 0.5;
  const relY = (event.clientY - rect.top) / rect.height - 0.5;

  jarStage.querySelectorAll(".paper-note").forEach((note, index) => {
    const strength = 9 + index * 2;
    note.style.setProperty("--float-x", `${relX * strength}px`);
    note.style.setProperty("--float-y", `${relY * strength}px`);
  });
}

dateForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const entered = normalizeDate(dateInput.value);

  if (entered === "08092025") {
    lockHint.textContent = "Unlocked. Loading the good part...";
    unlockSite();
    return;
  }

  lockHint.textContent = "Almost. Try it as MM/DD/YYYY.";
  lockScreen.classList.remove("shake");
  void lockScreen.offsetWidth;
  lockScreen.classList.add("shake");
});

dateInput.addEventListener("input", () => {
  lockScreen.classList.toggle("is-typing", dateInput.value.length > 0);
});

heartLock.addEventListener("click", () => {
  dateInput.focus();
});

letterButton.addEventListener("pointerenter", () => {
  letterButton.classList.add("is-open");
});

letterButton.addEventListener("pointerleave", () => {
  if (!storyState.enteringLetter) {
    letterButton.classList.remove("is-open");
  }
});

letterButton.addEventListener("focus", () => {
  letterButton.classList.add("is-open");
});

letterButton.addEventListener("blur", () => {
  if (!storyState.enteringLetter) {
    letterButton.classList.remove("is-open");
  }
});

document.querySelector("#scrap-prev").addEventListener("click", () => {
  triggerScrapbookFlip(-1);
});

document.querySelector("#scrap-next").addEventListener("click", () => {
  triggerScrapbookFlip(1);
});

scrapbookBook.addEventListener("pointerdown", startScrapbookHold);
scrapbookBook.addEventListener("pointerup", cancelScrapbookHold);
scrapbookBook.addEventListener("pointercancel", cancelScrapbookHold);
scrapbookBook.addEventListener("pointerleave", cancelScrapbookHold);
scrapbookBook.addEventListener("keydown", (event) => {
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    triggerScrapbookFlip(-1);
  }

  if (event.key === "ArrowRight") {
    event.preventDefault();
    triggerScrapbookFlip(1);
  }
});

document.querySelectorAll(".paper-note").forEach((note) => {
  note.addEventListener("click", () => openNote(note.dataset.note));
});

letterButton.addEventListener("pointerdown", openLetter);
letterButton.addEventListener("click", openLetter);
document.querySelector("#jar-stage").addEventListener("mousemove", moveJarNotes);
document.querySelector("#note-close").addEventListener("click", closeNote);
document.querySelector("#note-backdrop").addEventListener("click", closeNote);
document.querySelector("#reveal-button").addEventListener("click", () => {
  setChapter(getChapterIndex("ending"));
});

window.addEventListener("pointermove", scheduleCursorUpdate, { passive: true });
nextButton.addEventListener("click", nextChapter);
backButton.addEventListener("click", previousChapter);
restartButton.addEventListener("click", restartQuiz);

renderQuestion();
loadScrapbookPhotos();
setScrapbookPage(0);
setChapter(0);
