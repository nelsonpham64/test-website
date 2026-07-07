const chapters = Array.from(document.querySelectorAll(".chapter"));
const nextButton = document.querySelector("#next-button");
const backButton = document.querySelector("#back-button");
const counter = document.querySelector("#chapter-counter");
const storyProgressBar = document.querySelector("#story-progress-bar");
const dotsWrap = document.querySelector("#chapter-dots");
const cursorDot = document.querySelector(".cursor-dot");
const letterButton = document.querySelector("#letter-button");
const scrapbookFeature = document.querySelector("#scrapbook-feature");
const scrapbookBook = document.querySelector("#scrapbook-book");
const scrapbookLetterButton = document.querySelector("#scrapbook-letter-next");
const scrapbookLetterLines = Array.from(document.querySelectorAll(".letter-line"));
const scrapbookLetterTexts = scrapbookLetterLines.map((line) =>
  line.textContent.replace(/\s+/g, " ").trim()
);
const lockScreen = document.querySelector("#lock-screen");
const heartLock = document.querySelector("#heart-lock");
const loadingScreen = document.querySelector("#loading-screen");
const letterAnnouncement = document.querySelector("#letter-announcement");
const dateForm = document.querySelector("#date-form");
const dateInput = document.querySelector("#anniversary-date");
const lockHint = document.querySelector("#lock-hint");
const jarStage = document.querySelector("#jar-stage");
const jarShell = document.querySelector("#jar-shell");
const glassJar = document.querySelector("#glass-jar");
const jarShakeButton = document.querySelector("#jar-shake-button");
const jarNotes = Array.from(document.querySelectorAll(".paper-note"));
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const storyState = {
  current: 0,
  hasReachedEnd: false,
  quizComplete: false,
  scrapbookPage: 0,
  scrapbookIntroComplete: false,
  scrapbookLetterStep: 0,
  scrapbookLetterReady: false,
  scrapbookTypingStarted: false,
  scrapbookTypingTimer: null,
  enteringLetter: false
};

const scrapbookHold = {
  direction: 0,
  timer: null,
  pageTimer: null,
  releaseTimer: null
};

const jarPhysics = {
  initialized: false,
  running: false,
  raf: 0,
  lastTime: 0,
  notes: [],
  dragging: false,
  didDrag: false,
  hoveredNote: null,
  lastPointer: { x: 0, y: 0, time: 0 },
  tilt: { x: 0, y: 0 },
  bounds: { width: 0, height: 0 },
  suppressClickUntil: 0
};

const HOLD_TO_FLIP_MS = 660;
const SCRAPBOOK_FLIP_MS = 1120;
const SCRAPBOOK_PAGE_SWAP_MS = 640;
const SCRAPBOOK_PHOTO_PATH = "assets/photos/scrapbook";
const SCRAPBOOK_OPTIMIZED_PHOTO_PATH = "assets/photos/scrapbook-optimized";
const SCRAPBOOK_OPTIMIZED_IMAGE_EXTENSIONS = ["webp"];
const SCRAPBOOK_IMAGE_EXTENSIONS = ["jpg", "JPG", "jpeg", "JPEG", "png", "PNG", "webp", "WEBP"];
const SCRAPBOOK_VIDEO_EXTENSIONS = ["mp4", "MP4", "webm", "WEBM", "mov", "MOV"];
const scrapbookMediaCache = new Map();
const canUsePointerEffects =
  window.matchMedia("(pointer: fine)").matches &&
  !prefersReducedMotion;

const chapterLabels = {
  intro: "Continue",
  scrapbook: "Open jar",
  jar: "Year wrapped",
  wrapped: "Start quiz",
  quiz: "Finish quiz",
  result: "Final clue",
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
    kicker: "remember when...",
    title: "The first little spark",
    messages: [
      "remember when everything started feeling a little different?",
      "one small moment turned into the beginning of us.",
      "save this one for the memory that still feels like the start."
    ]
  },
  laugh: {
    kicker: "i knew i liked you when...",
    title: "The laugh we kept",
    messages: [
      "i knew i liked you when even the random moments felt fun with you.",
      "like somehow the smallest joke became an inside joke.",
      "this note is for the laugh we kept."
    ]
  },
  dinner: {
    kicker: "date-night receipt",
    title: "The meal that became a memory",
    messages: [
      "one table, one snack, one dessert, or one tiny food sidequest.",
      "whatever memory belongs here deserves its own little award.",
      "total due: another date with you."
    ]
  },
  drive: {
    kicker: "quiet little moment",
    title: "The quiet ride home",
    messages: [
      "some memories are not loud.",
      "they are just a drive, a walk, or a conversation that made the world feel smaller.",
      "this is one of those."
    ]
  },
  future: {
    kicker: "future plan unlocked",
    title: "A note from the next chapter",
    messages: [
      "future plan unlocked:",
      "more trips, more food, more photos, more random memories.",
      "one year is just the opening scene."
    ]
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
    loadingScreen.classList.remove("is-visible");
    loadingScreen.setAttribute("aria-hidden", "true");
    letterAnnouncement.classList.add("is-visible");
    letterAnnouncement.setAttribute("aria-hidden", "false");
  }, 2350);

  window.setTimeout(() => {
    document.body.classList.remove("is-locked");
    document.body.classList.add("is-letter-scene", "is-letter-arriving");
    letterAnnouncement.classList.remove("is-visible");
    letterAnnouncement.setAttribute("aria-hidden", "true");
  }, 3500);

  window.setTimeout(() => {
    document.body.classList.remove("is-letter-arriving");
  }, 4450);
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
  const activeChapterKey = chapters[boundedIndex].dataset.chapter;
  document.body.dataset.activeChapter = activeChapterKey;

  chapters.forEach((chapter, chapterIndex) => {
    chapter.classList.toggle("is-active", chapterIndex === boundedIndex);
    chapter.classList.toggle("is-past", chapterIndex < boundedIndex);
    chapter.setAttribute("aria-hidden", chapterIndex === boundedIndex ? "false" : "true");
  });

  document.body.classList.toggle(
    "is-letter-scene",
    activeChapterKey === "intro" && !document.body.classList.contains("is-locked")
  );

  if (boundedIndex === chapters.length - 1) {
    storyState.hasReachedEnd = true;
  }

  updateStoryControls();

  if (chapters[boundedIndex].dataset.chapter === "wrapped") {
    triggerWrappedReveal();
  }

  if (activeChapterKey === "scrapbook") {
    syncScrapbookIntro();
  } else {
    clearScrapbookTyping();
  }

  if (activeChapterKey === "jar") {
    window.setTimeout(() => {
      if (chapters[storyState.current].dataset.chapter !== "jar") {
        return;
      }

      initializeJarPhysics();
      startJarPhysics();
      bumpJarNotes(0.12);
    }, 120);
  } else {
    stopJarPhysics();
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
  nextButton.classList.toggle(
    "is-hidden",
    chapterKey === "intro" ||
      chapterKey === "finale" ||
      (chapterKey === "scrapbook" && !storyState.scrapbookIntroComplete)
  );
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
    resetScrapbookIntro();
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
  document.body.classList.remove("is-letter-arriving");
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
    const isActiveEra = item.dataset.eraIndex === currentEra;
    item.classList.toggle("is-active", isActiveEra);
    item.setAttribute("aria-pressed", isActiveEra ? "true" : "false");
  });

  loadVisibleScrapbookMedia();
  syncScrapbookVideoPlayback();
}

function getScrapbookPageForEra(eraIndex) {
  const spreads = Array.from(document.querySelectorAll(".scrapbook-spread"));
  return spreads.findIndex((spread) => spread.dataset.eraIndex === eraIndex);
}

function jumpToScrapbookPage(pageIndex) {
  const spreads = Array.from(document.querySelectorAll(".scrapbook-spread"));
  const targetPage = Math.max(0, Math.min(pageIndex, spreads.length - 1));

  if (targetPage === storyState.scrapbookPage) {
    setScrapbookPage(targetPage);
    return;
  }

  const direction = targetPage > storyState.scrapbookPage ? 1 : -1;
  clearScrapbookHold();
  window.clearTimeout(scrapbookHold.pageTimer);
  window.clearTimeout(scrapbookHold.releaseTimer);
  scrapbookBook.classList.remove("is-flipping-forward", "is-flipping-backward");
  void scrapbookBook.offsetWidth;
  scrapbookBook.classList.add(direction > 0 ? "is-flipping-forward" : "is-flipping-backward");

  scrapbookHold.pageTimer = window.setTimeout(() => {
    setScrapbookPage(targetPage);
  }, SCRAPBOOK_PAGE_SWAP_MS);

  scrapbookHold.releaseTimer = window.setTimeout(() => {
    scrapbookBook.classList.remove("is-flipping-forward", "is-flipping-backward");
  }, SCRAPBOOK_FLIP_MS);
}

function jumpToScrapbookEra(eraIndex) {
  if (!storyState.scrapbookIntroComplete) {
    return;
  }

  const targetPage = getScrapbookPageForEra(eraIndex);

  if (targetPage < 0) {
    return;
  }

  jumpToScrapbookPage(targetPage);
}

function probeImage(url) {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = url;
  });
}

async function probeFile(url) {
  try {
    const response = await fetch(url, {
      method: "HEAD"
    });
    return response.ok;
  } catch {
    return false;
  }
}

function buildMediaUrls(number, path, extensions) {
  return extensions.map((extension) => `${path}/${number}.${extension}`);
}

async function findFirstMediaUrl(urls, probe) {
  for (const url of urls) {
    if (await probe(url)) {
      return url;
    }
  }

  return null;
}

function findScrapbookMedia(number) {
  if (scrapbookMediaCache.has(number)) {
    return scrapbookMediaCache.get(number);
  }

  const imageUrls = [
    ...buildMediaUrls(number, SCRAPBOOK_OPTIMIZED_PHOTO_PATH, SCRAPBOOK_OPTIMIZED_IMAGE_EXTENSIONS),
    ...buildMediaUrls(number, SCRAPBOOK_PHOTO_PATH, SCRAPBOOK_IMAGE_EXTENSIONS)
  ];
  const videoUrls = buildMediaUrls(number, SCRAPBOOK_PHOTO_PATH, SCRAPBOOK_VIDEO_EXTENSIONS);

  const mediaPromise = Promise.all([
    findFirstMediaUrl(imageUrls, probeImage),
    findFirstMediaUrl(videoUrls, probeFile)
  ]).then(([imageUrl, videoUrl]) => {
    if (videoUrl) {
      return {
        posterUrl: imageUrl,
        type: "video",
        url: videoUrl
      };
    }

    if (imageUrl) {
      return {
        type: "image",
        url: imageUrl
      };
    }

    return null;
  });

  scrapbookMediaCache.set(number, mediaPromise);
  return mediaPromise;
}

function buildScrapbookVideo(media, number) {
  const video = document.createElement("video");
  video.autoplay = true;
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.preload = "metadata";
  video.src = media.url;
  video.setAttribute("aria-label", `Live photo ${number}`);
  video.setAttribute("disablepictureinpicture", "");

  if (media.posterUrl) {
    video.poster = media.posterUrl;
  }

  video.addEventListener("loadedmetadata", syncScrapbookVideoPlayback);
  return video;
}

async function loadScrapbookSlot(slot) {
  if (slot.dataset.mediaLoaded === "true" || slot.dataset.mediaLoading === "true") {
    return;
  }

  slot.dataset.mediaLoading = "true";
  const number = slot.dataset.photoNumber;
  const media = await findScrapbookMedia(number);
  slot.dataset.mediaLoading = "false";

  if (!media) {
    return;
  }

  slot.classList.add("has-real-photo");
  slot.dataset.mediaLoaded = "true";

  if (media.type === "video") {
    slot.classList.add("has-video");
    if (media.posterUrl) {
      slot.style.backgroundImage = `url("${media.posterUrl}")`;
    }
    slot.appendChild(buildScrapbookVideo(media, number));
    syncScrapbookVideoPlayback();
    return;
  }

  slot.style.backgroundImage = `url("${media.url}")`;
}

function loadVisibleScrapbookMedia() {
  const spreads = Array.from(document.querySelectorAll(".scrapbook-spread"));
  const pagesToLoad = new Set([
    storyState.scrapbookPage - 1,
    storyState.scrapbookPage,
    storyState.scrapbookPage + 1
  ]);

  spreads.forEach((spread, index) => {
    if (!pagesToLoad.has(index)) {
      return;
    }

    spread.querySelectorAll(".scrap-photo[data-photo-number]").forEach(loadScrapbookSlot);
  });
}

function syncScrapbookVideoPlayback() {
  document.querySelectorAll(".scrap-photo video").forEach((video) => {
    const isCurrent = video.closest(".scrapbook-spread")?.classList.contains("is-current");

    if (isCurrent) {
      const playAttempt = video.play();
      playAttempt?.catch?.(() => {});
      return;
    }

    video.pause();
  });
}

function loadScrapbookPhotos() {
  loadVisibleScrapbookMedia();
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

function clearScrapbookTyping() {
  if (!storyState.scrapbookTypingTimer) {
    return;
  }

  window.clearTimeout(storyState.scrapbookTypingTimer);
  storyState.scrapbookTypingTimer = null;
}

function setScrapbookLetterButtonReady(isReady) {
  storyState.scrapbookLetterReady = isReady;
  scrapbookFeature?.classList.toggle(
    "is-letter-ready",
    isReady && !storyState.scrapbookIntroComplete
  );

  if (!scrapbookLetterButton) {
    return;
  }

  scrapbookLetterButton.hidden = !isReady;
  scrapbookLetterButton.disabled = !isReady;
  scrapbookLetterButton.textContent = "Continue";
}

function fillScrapbookLetter() {
  scrapbookLetterLines.forEach((line, index) => {
    line.textContent = scrapbookLetterTexts[index] || "";
    line.classList.add("is-visible");
    line.classList.remove("is-typing");
  });
  storyState.scrapbookLetterStep = Math.max(scrapbookLetterLines.length - 1, 0);
}

function resetScrapbookLetterText() {
  clearScrapbookTyping();
  storyState.scrapbookLetterStep = 0;
  storyState.scrapbookTypingStarted = false;
  setScrapbookLetterButtonReady(false);

  scrapbookLetterLines.forEach((line, index) => {
    line.textContent = "";
    line.classList.toggle("is-visible", index === 0);
    line.classList.remove("is-typing");
  });
}

function completeScrapbookTyping() {
  clearScrapbookTyping();
  storyState.scrapbookTypingStarted = true;
  fillScrapbookLetter();
  setScrapbookLetterButtonReady(true);
}

function typeScrapbookLine(lineIndex = 0, characterIndex = 0) {
  if (
    storyState.scrapbookIntroComplete ||
    chapters[storyState.current]?.dataset.chapter !== "scrapbook"
  ) {
    return;
  }

  if (lineIndex >= scrapbookLetterLines.length) {
    completeScrapbookTyping();
    return;
  }

  const line = scrapbookLetterLines[lineIndex];
  const fullText = scrapbookLetterTexts[lineIndex] || "";

  storyState.scrapbookLetterStep = lineIndex;
  scrapbookLetterLines.forEach((letterLine, index) => {
    letterLine.classList.toggle("is-visible", index <= lineIndex);
    letterLine.classList.toggle("is-typing", index === lineIndex);
  });
  line.textContent = fullText.slice(0, characterIndex);

  if (prefersReducedMotion) {
    completeScrapbookTyping();
    return;
  }

  if (characterIndex < fullText.length) {
    storyState.scrapbookTypingTimer = window.setTimeout(
      () => typeScrapbookLine(lineIndex, characterIndex + 1),
      16
    );
    return;
  }

  line.classList.remove("is-typing");
  storyState.scrapbookTypingTimer = window.setTimeout(
    () => typeScrapbookLine(lineIndex + 1, 0),
    260
  );
}

function startScrapbookTyping() {
  if (
    !scrapbookFeature ||
    storyState.scrapbookIntroComplete ||
    storyState.scrapbookTypingStarted
  ) {
    return;
  }

  resetScrapbookLetterText();
  storyState.scrapbookTypingStarted = true;
  typeScrapbookLine();
}

function syncScrapbookIntro() {
  if (!scrapbookFeature) {
    return;
  }

  scrapbookFeature.classList.toggle("is-reading-letter", !storyState.scrapbookIntroComplete);
  scrapbookFeature.classList.toggle("is-scrapbook-revealed", storyState.scrapbookIntroComplete);

  if (storyState.scrapbookIntroComplete) {
    clearScrapbookTyping();
    fillScrapbookLetter();
    setScrapbookLetterButtonReady(false);
    return;
  }

  startScrapbookTyping();
}

function revealScrapbookIntro() {
  if (!storyState.scrapbookLetterReady) {
    return;
  }

  clearScrapbookTyping();
  storyState.scrapbookIntroComplete = true;
  fillScrapbookLetter();
  setScrapbookLetterButtonReady(false);
  syncScrapbookIntro();
  setScrapbookPage(storyState.scrapbookPage);
  updateStoryControls();
}

function resetScrapbookIntro() {
  storyState.scrapbookIntroComplete = false;
  resetScrapbookLetterText();
  syncScrapbookIntro();
}

function advanceScrapbookLetter() {
  revealScrapbookIntro();
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(value, max));
}

function measureJarBounds() {
  if (!glassJar) {
    return false;
  }

  const rect = glassJar.getBoundingClientRect();
  if (rect.width < 120 || rect.height < 160) {
    return false;
  }

  jarPhysics.bounds = {
    width: rect.width,
    height: rect.height
  };
  return true;
}

function getJarLimits(note) {
  const verticalProgress = clamp(note.y / Math.max(jarPhysics.bounds.height, 1), 0, 1);
  const sideInset = 22 + Math.abs(verticalProgress - 0.56) * 58;

  return {
    minX: sideInset,
    maxX: jarPhysics.bounds.width - note.width - sideInset,
    minY: 54,
    maxY: jarPhysics.bounds.height - note.height - 26
  };
}

function applyJarNoteState(note) {
  note.el.style.setProperty("--jar-x", `${note.x}px`);
  note.el.style.setProperty("--jar-y", `${note.y}px`);
  note.el.style.setProperty("--jar-rotate", `${note.angle}deg`);
  note.el.style.setProperty("--jar-depth", `${note.depth}px`);
  note.el.style.setProperty("--jar-scale", note.scale);
}

function initializeJarPhysics(force = false) {
  if (!measureJarBounds() || jarNotes.length === 0) {
    return false;
  }

  if (jarPhysics.initialized && !force) {
    jarPhysics.notes.forEach((note) => {
      const limits = getJarLimits(note);
      note.x = clamp(note.x, limits.minX, limits.maxX);
      note.y = clamp(note.y, limits.minY, limits.maxY);
      applyJarNoteState(note);
    });
    return true;
  }

  const startingPoints = [
    { x: 0.22, y: 0.36, depth: 10, scale: 0.96 },
    { x: 0.57, y: 0.34, depth: 34, scale: 1.05 },
    { x: 0.39, y: 0.55, depth: 20, scale: 1 },
    { x: 0.24, y: 0.69, depth: 42, scale: 1.08 },
    { x: 0.6, y: 0.68, depth: 14, scale: 0.98 }
  ];

  jarPhysics.notes = jarNotes.map((el, index) => {
    const point = startingPoints[index % startingPoints.length];
    const note = {
      el,
      x: jarPhysics.bounds.width * point.x,
      y: jarPhysics.bounds.height * point.y,
      width: el.offsetWidth || 96,
      height: el.offsetHeight || 82,
      radius: Math.max(el.offsetWidth || 96, el.offsetHeight || 82) * 0.42,
      vx: (index % 2 === 0 ? 0.42 : -0.36) * (1 + index * 0.12),
      vy: -0.15 * index,
      angle: Number.parseFloat(getComputedStyle(el).getPropertyValue("--note-angle")) || 0,
      spin: index % 2 === 0 ? 0.22 : -0.2,
      depth: point.depth,
      scale: point.scale
    };
    const limits = getJarLimits(note);
    note.x = clamp(note.x, limits.minX, limits.maxX);
    note.y = clamp(note.y, limits.minY, limits.maxY);
    applyJarNoteState(note);
    return note;
  });

  jarPhysics.initialized = true;
  return true;
}

function bumpJarNotes(strength = 1) {
  if (!initializeJarPhysics()) {
    return;
  }

  jarPhysics.hoveredNote?.el.classList.remove("is-hover-rest");
  jarPhysics.hoveredNote = null;
  jarShell?.classList.add("is-shaking");
  window.setTimeout(() => jarShell?.classList.remove("is-shaking"), 520);

  jarPhysics.notes.forEach((note, index) => {
    const side = index % 2 === 0 ? 1 : -1;
    note.vx += side * (3.2 + index * 0.42) * strength;
    note.vy -= (4.4 + index * 0.38) * strength;
    note.spin += side * (1.1 + index * 0.12) * strength;
  });
}

function resolveJarCollisions(pinnedNote = null) {
  for (let i = 0; i < jarPhysics.notes.length; i += 1) {
    for (let j = i + 1; j < jarPhysics.notes.length; j += 1) {
      const a = jarPhysics.notes[i];
      const b = jarPhysics.notes[j];
      const aPinned = a === pinnedNote;
      const bPinned = b === pinnedNote;
      const ax = a.x + a.width / 2;
      const ay = a.y + a.height / 2;
      const bx = b.x + b.width / 2;
      const by = b.y + b.height / 2;
      const dx = bx - ax;
      const dy = by - ay;
      const distance = Math.hypot(dx, dy) || 1;
      const minDistance = a.radius + b.radius;

      if (distance >= minDistance) {
        continue;
      }

      const normalX = dx / distance;
      const normalY = dy / distance;
      const correction = minDistance - distance;

      if (aPinned && !bPinned) {
        b.x += normalX * correction;
        b.y += normalY * correction;
      } else if (bPinned && !aPinned) {
        a.x -= normalX * correction;
        a.y -= normalY * correction;
      } else {
        const overlap = correction * 0.5;
        a.x -= normalX * overlap;
        a.y -= normalY * overlap;
        b.x += normalX * overlap;
        b.y += normalY * overlap;
      }

      const relativeVelocity = (b.vx - a.vx) * normalX + (b.vy - a.vy) * normalY;
      if (relativeVelocity < 0) {
        const impulse = relativeVelocity * -0.42;
        if (!aPinned) {
          a.vx -= impulse * normalX;
          a.vy -= impulse * normalY;
        }
        if (!bPinned) {
          b.vx += impulse * normalX;
          b.vy += impulse * normalY;
        }
      }
    }
  }
}

function stepJarPhysics(time) {
  if (!jarPhysics.running) {
    return;
  }

  const delta = clamp((time - jarPhysics.lastTime) / 16.67, 0.5, 2);
  jarPhysics.lastTime = time;

  if (!measureJarBounds()) {
    jarPhysics.raf = window.requestAnimationFrame(stepJarPhysics);
    return;
  }

  const pinnedNote = jarPhysics.hoveredNote;

  jarPhysics.notes.forEach((note) => {
    if (note === pinnedNote) {
      note.vx = 0;
      note.vy = 0;
      note.spin = 0;
      return;
    }

    const hoverDamp = pinnedNote ? 0.28 : 1;
    note.vy += 0.11 * hoverDamp * delta;
    note.vx += jarPhysics.tilt.x * 0.006 * hoverDamp * delta;
    note.vy += jarPhysics.tilt.y * 0.004 * hoverDamp * delta;
    note.x += note.vx * delta;
    note.y += note.vy * delta;
    note.angle += note.spin * delta;
    note.vx *= pinnedNote ? 0.94 : 0.986;
    note.vy *= pinnedNote ? 0.94 : 0.986;
    note.spin *= pinnedNote ? 0.92 : 0.988;

    const limits = getJarLimits(note);
    if (note.x <= limits.minX || note.x >= limits.maxX) {
      note.x = clamp(note.x, limits.minX, limits.maxX);
      note.vx *= -0.48;
      note.spin += note.vx * 0.025;
    }

    if (note.y <= limits.minY || note.y >= limits.maxY) {
      note.y = clamp(note.y, limits.minY, limits.maxY);
      note.vy *= -0.38;
      note.vx *= 0.96;
      note.spin *= 0.68;
    }
  });

  resolveJarCollisions(pinnedNote);
  jarPhysics.notes.forEach((note) => {
    const limits = getJarLimits(note);
    note.x = clamp(note.x, limits.minX, limits.maxX);
    note.y = clamp(note.y, limits.minY, limits.maxY);
    if (note === pinnedNote) {
      note.vx = 0;
      note.vy = 0;
      note.spin = 0;
    }
    applyJarNoteState(note);
  });

  jarPhysics.raf = window.requestAnimationFrame(stepJarPhysics);
}

function startJarPhysics() {
  if (prefersReducedMotion || jarPhysics.running || !initializeJarPhysics()) {
    return;
  }

  jarPhysics.running = true;
  jarPhysics.lastTime = performance.now();
  jarPhysics.raf = window.requestAnimationFrame(stepJarPhysics);
}

function stopJarPhysics() {
  jarPhysics.running = false;
  window.cancelAnimationFrame(jarPhysics.raf);
}

function updateJarTilt(event) {
  if (!jarStage || !jarShell) {
    return;
  }

  if (event.target?.closest?.(".paper-note")) {
    return;
  }

  const rect = jarStage.getBoundingClientRect();
  const relX = clamp((event.clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
  const relY = clamp((event.clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);

  jarPhysics.tilt = { x: relX, y: relY };
  jarShell.style.setProperty("--jar-tilt-x", `${relY * -3.5}deg`);
  jarShell.style.setProperty("--jar-tilt-y", `${relX * 4.5}deg`);
}

function settleJarNoteHover(event) {
  if (!initializeJarPhysics()) {
    return;
  }

  const hovered = jarPhysics.notes.find((note) => note.el === event.currentTarget);
  if (!hovered) {
    return;
  }

  jarPhysics.hoveredNote?.el.classList.remove("is-hover-rest");
  jarPhysics.hoveredNote = hovered;
  jarPhysics.tilt = { x: 0, y: 0 };
  jarShell?.style.setProperty("--jar-tilt-x", "0deg");
  jarShell?.style.setProperty("--jar-tilt-y", "0deg");

  jarPhysics.notes.forEach((note) => {
    note.vx *= 0.16;
    note.vy *= 0.16;
    note.spin *= 0.12;
  });

  hovered.vx = 0;
  hovered.vy = 0;
  hovered.spin = 0;
  hovered.el.classList.add("is-hover-rest");
  applyJarNoteState(hovered);
}

function releaseJarNoteHover(event) {
  event.currentTarget.classList.remove("is-hover-rest");
  if (jarPhysics.hoveredNote?.el === event.currentTarget) {
    jarPhysics.hoveredNote = null;
  }
}

function startJarDrag(event) {
  if (event.button !== undefined && event.button !== 0) {
    return;
  }

  if (event.target.closest(".paper-note")) {
    return;
  }

  event.preventDefault();
  startJarPhysics();
  jarPhysics.dragging = true;
  jarPhysics.didDrag = false;
  jarPhysics.lastPointer = {
    x: event.clientX,
    y: event.clientY,
    time: performance.now()
  };
  jarShell?.setPointerCapture?.(event.pointerId);
  jarShell?.classList.add("is-grabbing");
}

function dragJar(event) {
  updateJarTilt(event);

  if (!jarPhysics.dragging || !initializeJarPhysics()) {
    return;
  }

  const now = performance.now();
  const dx = event.clientX - jarPhysics.lastPointer.x;
  const dy = event.clientY - jarPhysics.lastPointer.y;
  const elapsed = Math.max(now - jarPhysics.lastPointer.time, 16);

  if (Math.abs(dx) + Math.abs(dy) > 4) {
    jarPhysics.didDrag = true;
  }

  jarPhysics.notes.forEach((note, index) => {
    const depthBoost = 1 + note.depth / 64;
    note.vx += (dx / elapsed) * 9.5 * depthBoost;
    note.vy += (dy / elapsed) * 5.6 * depthBoost;
    note.spin += (dx / elapsed) * (1.8 + index * 0.08);
  });

  jarPhysics.lastPointer = {
    x: event.clientX,
    y: event.clientY,
    time: now
  };
}

function endJarDrag(event) {
  if (!jarPhysics.dragging) {
    return;
  }

  jarPhysics.dragging = false;
  jarShell?.classList.remove("is-grabbing");
  if (event?.pointerId !== undefined && jarShell?.hasPointerCapture?.(event.pointerId)) {
    jarShell.releasePointerCapture(event.pointerId);
  }

  if (jarPhysics.didDrag) {
    jarPhysics.suppressClickUntil = performance.now() + 260;
    document.querySelector("#jar-message").textContent = "The notes are mixed. Pick one when it feels right.";
  }
}

function openNote(key, sourceEl) {
  if (performance.now() < jarPhysics.suppressClickUntil) {
    return;
  }

  const note = memoryNotes[key];
  if (!note) {
    return;
  }

  sourceEl?.classList.add("is-opening");
  window.setTimeout(() => sourceEl?.classList.remove("is-opening"), 460);
  document.querySelector("#note-modal-kicker").textContent = note.kicker || "Memory note";
  document.querySelector("#note-modal-title").textContent = note.title;
  const thread = document.querySelector("#note-modal-thread");
  thread.textContent = "";
  (note.messages || [note.body]).forEach((message, index) => {
    const bubble = document.createElement("p");
    bubble.className = "sticky-line";
    bubble.textContent = message;
    bubble.style.setProperty("--bubble-delay", `${index * 130}ms`);
    thread.appendChild(bubble);
  });
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
  if (!canUsePointerEffects) {
    return;
  }

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

document.querySelectorAll(".era-index-item").forEach((item) => {
  item.addEventListener("click", () => jumpToScrapbookEra(item.dataset.eraIndex));
});

scrapbookLetterButton?.addEventListener("click", advanceScrapbookLetter);

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
  note.addEventListener("pointerenter", settleJarNoteHover);
  note.addEventListener("pointerleave", releaseJarNoteHover);
  note.addEventListener("focus", settleJarNoteHover);
  note.addEventListener("blur", releaseJarNoteHover);
  note.addEventListener("click", () => openNote(note.dataset.note, note));
});

jarShakeButton?.addEventListener("click", () => {
  startJarPhysics();
  bumpJarNotes(0.62);
  document.querySelector("#jar-message").textContent = "Shuffled. Pick a note from the jar.";
});
window.addEventListener("resize", () => {
  if (chapters[storyState.current].dataset.chapter === "jar") {
    initializeJarPhysics(true);
  }
});

letterButton.addEventListener("pointerdown", openLetter);
letterButton.addEventListener("click", openLetter);
if (canUsePointerEffects) {
  jarStage?.addEventListener("pointermove", updateJarTilt, { passive: true });
  window.addEventListener("pointermove", scheduleCursorUpdate, { passive: true });
} else if (cursorDot) {
  cursorDot.hidden = true;
}
document.querySelector("#note-close").addEventListener("click", closeNote);
document.querySelector("#note-backdrop").addEventListener("click", closeNote);
document.querySelector("#reveal-button").addEventListener("click", () => {
  setChapter(getChapterIndex("ending"));
});

nextButton.addEventListener("click", nextChapter);
backButton.addEventListener("click", previousChapter);
restartButton.addEventListener("click", restartQuiz);

renderQuestion();
setScrapbookPage(0);
setChapter(0);
