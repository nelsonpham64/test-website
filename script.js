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
const psLoveTrigger = document.querySelector("#ps-love-trigger");
const psLoveTransition = document.querySelector("#ps-love-transition");
const wrappedTransition = document.querySelector("#wrapped-transition");
const wrappedTransitionNext = document.querySelector("#wrapped-transition-next");
const clawTransition = document.querySelector("#claw-transition");
const ticketRevealTransition = document.querySelector("#ticket-reveal-transition");
const prizeOpenPrompt = document.querySelector("#prize-open-prompt");
const prizeOpenYes = document.querySelector("#prize-open-yes");
const prizeOpenNo = document.querySelector("#prize-open-no");
const psLoveNotes = document.querySelector("#ps-love-notes");
const psLoveBackdrop = document.querySelector("#ps-love-backdrop");
const psLoveClose = document.querySelector("#ps-love-close");
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
const INTRO_LOADING_MS = 3650;
const INTRO_ANNOUNCEMENT_MS = 5600;
const INTRO_LETTER_SETTLE_MS = 6750;
const WRAPPED_TRANSITION_READY_MS = 9200;
const CLAW_TRANSITION_MS = 4300;
const TICKET_REVEAL_TRANSITION_MS = 5000;
const PS_LOVE_TRANSITION_MS = 4500;

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
  revealingPsNotes: false,
  psNotesFound: false,
  enteringLetter: false,
  transitioningToWrapped: false,
  wrappedTransitionReady: false,
  transitioningToClaw: false,
  revealingTicket: false,
  prizePromptOpen: false
};

const scrapbookHold = {
  direction: 0,
  timer: null,
  pageTimer: null,
  releaseTimer: null
};
let wrappedTransitionTimer = null;
let clawTransitionTimer = null;
let ticketRevealTimer = null;

const wrappedDeckState = {
  current: 0,
  startX: 0,
  startY: 0,
  isPointerDown: false,
  transitionTimer: null
};

const clawState = {
  position: 50,
  isDropping: false,
  hasCapsule: false,
  missCount: 0,
  lastOutcome: null,
  lastMissed: null,
  dropToken: 0,
  promptTimer: null
};

const clawCapsules = [
  { id: "one", position: 26, isPrize: false },
  { id: "three", position: 38, isPrize: false },
  { id: "two", position: 62, isPrize: false },
  { id: "mystery", position: 74, isPrize: true }
];

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
const WRAPPED_PHOTO_PATH = "assets/photos/wrapped";
const SCRAPBOOK_OPTIMIZED_IMAGE_EXTENSIONS = ["webp"];
const SCRAPBOOK_IMAGE_EXTENSIONS = ["jpg", "JPG", "jpeg", "JPEG", "png", "PNG", "webp", "WEBP"];
const SCRAPBOOK_VIDEO_EXTENSIONS = ["mp4", "MP4", "webm", "WEBM", "mov", "MOV"];
const scrapbookMediaCache = new Map();
const wrappedPhotoCache = new Map();
const canUsePointerEffects =
  window.matchMedia("(pointer: fine)").matches &&
  !prefersReducedMotion;

const chapterLabels = {
  intro: "Continue",
  scrapbook: "Year wrapped",
  wrapped: "Play machine",
  quiz: "Win prize",
  result: "Next",
  finale: "Next",
  ending: "Start over"
};

chapters.forEach((_, index) => {
  const dot = document.createElement("span");
  dot.dataset.index = String(index);
  dotsWrap.appendChild(dot);
});

const tripResult = {
  title: "SURPRISEEE!!! we're going to Universal Studios Hollywood!",
  tagline: "I know I said we weren't going, but I lied lol.",
  restaurant: "Universal Studios Hollywood",
  theme: "Amusement park trip with rides, shows, and snacks",
  outfit: "park-fit, comfy shoes, and me",
  dessert: "Theme park snacks and more.."
};

const memoryNotes = {
  first: {
    kicker: "i knew i liked you when...",
    messages: [
      "I knew I liked you when we started getting closer and I looked forward to seeing you more..",
      "At the end of the day, when I finished all my classes, my day wouldn't feel complete enough to go home until I was able to see you. ",
      "That's why I would always ask if you were coming to the library. Sometimes I would even pretend to have work so I could be in your presence. >:)"
    ]
  },
  laugh: {
    kicker: "one thing i love about you is...",
    messages: [
      "One thing I love about you is how supportive you are..",
      "I have a lot of dreams and career ambitions, and I know that it somtimes interferes with our relationship, like my internship for example. ",
      "I know it's not easy for you, so the fact that you tough it out for me, makes me really appreciate and love you so much. I hope you know you're investing into greatness."
    ]
  },
  dinner: {
    kicker: "you make me feel...",
    messages: [
      "You make me feel comfortable..",
      "LOL HEAR ME OUT. you've created a really comfortable enviornment for me to just be myself without worrying about icking you out. ",
      "Crying is a very uncomfortable reaction that I never really want anyone looking at me when I do. But you always encourage it without making me embarrassed. It hurts my male ego, but it's nice letting it out every once in a while."
    ]
  },
  drive: {
    kicker: "something you do that melts me is...",
    messages: [
      "Something you do that melts me are your emojis and texts..",
      "Sometimes you just randomly text that you miss me and it makes me feel so loved, while also making me miss you even more. I just want to be there to comfort and hug you.",
      "The little emojis that you send me are so cute. All the nailong stickers are such accurate representations of how I'd think you look like over text."
    ]
  },
  future: {
    kicker: "one thing i hope you remember is...",
    messages: [
      "One thing I hope you always remember is that I LOVE YOU..",
      "Not just on anniversaries, not just on special occasions, but always. Sometimes you may feel that I'm nonchalant and don't show much emotion, but deep down, I love spending every moment with you.",
      "I may not have money to spoil you the way you want right now, but I'll always try my best. :)"
    ]
  }
};

const questionDetail = document.querySelector("#question-detail");
const quizProgress = document.querySelector("#quiz-progress");
const questionProgressBar = document.querySelector("#question-progress-bar");
const restartButton = document.querySelector("#restart-quiz");
const clawDropButton = document.querySelector("#claw-drop-button");
const clawMachine = document.querySelector("#claw-machine");
const mysteryCapsule = document.querySelector("#mystery-capsule");
const clawLeftButton = document.querySelector("#claw-left-button");
const clawRightButton = document.querySelector("#claw-right-button");
const quizLockNote = document.querySelector("#quiz-lock-note");

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
  }, INTRO_LOADING_MS);

  window.setTimeout(() => {
    document.body.classList.remove("is-locked");
    document.body.classList.add("is-letter-scene", "is-letter-arriving");
    letterAnnouncement.classList.remove("is-visible");
    letterAnnouncement.setAttribute("aria-hidden", "true");
  }, INTRO_ANNOUNCEMENT_MS);

  window.setTimeout(() => {
    document.body.classList.remove("is-letter-arriving");
  }, INTRO_LETTER_SETTLE_MS);
}

function animateWrappedCounters(scope = document) {
  const wrappedCounters = scope.querySelectorAll("[data-wrapped-count]");

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

function getWrappedDeckParts() {
  const deck = document.querySelector("[data-wrapped-deck]");

  if (!deck) {
    return null;
  }

  return {
    deck,
    slides: Array.from(deck.querySelectorAll("[data-wrapped-slide]")),
    dots: Array.from(deck.querySelectorAll("[data-wrapped-dot]")),
    previousButton: deck.querySelector("[data-wrapped-prev]"),
    nextButton: deck.querySelector("[data-wrapped-next]")
  };
}

function syncWrappedDeckChrome(parts, boundedIndex) {
  parts.dots.forEach((dot, dotIndex) => {
    const isCurrent = dotIndex === boundedIndex;
    dot.classList.toggle("is-current", isCurrent);
    dot.setAttribute("aria-current", isCurrent ? "step" : "false");
  });

  if (parts.previousButton) {
    parts.previousButton.textContent = "Previous";
  }

  if (parts.nextButton) {
    const lastSlideIndex = parts.slides.length - 1;
    parts.nextButton.textContent = boundedIndex === lastSlideIndex ? "Play machine" : "Next";
  }
}

function setWrappedSlide(index, options = {}) {
  const parts = getWrappedDeckParts();

  if (!parts || !parts.slides.length) {
    return;
  }

  const shouldAnimate = options.animate && !prefersReducedMotion;
  const direction = options.direction || 1;
  const boundedIndex =
    ((index % parts.slides.length) + parts.slides.length) % parts.slides.length;
  const previousIndex = wrappedDeckState.current;

  window.clearTimeout(wrappedDeckState.transitionTimer);
  wrappedDeckState.transitionTimer = null;

  if (shouldAnimate && boundedIndex !== previousIndex) {
    const previousSlide = parts.slides[previousIndex];
    const nextSlide = parts.slides[boundedIndex];

    parts.deck.dataset.wrappedDirection = direction < 0 ? "back" : "forward";
    wrappedDeckState.current = boundedIndex;

    parts.slides.forEach((slide) => {
      if (slide !== previousSlide && slide !== nextSlide) {
        slide.hidden = true;
        slide.classList.remove("is-current", "is-entering", "is-exiting");
        slide.setAttribute("aria-hidden", "true");
      }
    });

    previousSlide.hidden = false;
    previousSlide.classList.remove("is-current", "is-entering");
    previousSlide.classList.add("is-exiting");
    previousSlide.setAttribute("aria-hidden", "true");

    nextSlide.hidden = false;
    nextSlide.classList.remove("is-exiting");
    nextSlide.classList.add("is-current", "is-entering");
    nextSlide.setAttribute("aria-hidden", "false");

    syncWrappedDeckChrome(parts, boundedIndex);
    animateWrappedCounters(nextSlide);
    loadWrappedPhotos(nextSlide);

    wrappedDeckState.transitionTimer = window.setTimeout(() => {
      previousSlide.hidden = true;
      previousSlide.classList.remove("is-exiting");
      nextSlide.classList.remove("is-entering");
      delete parts.deck.dataset.wrappedDirection;
      wrappedDeckState.transitionTimer = null;
    }, 1280);

    return;
  }

  wrappedDeckState.current = boundedIndex;

  parts.slides.forEach((slide, slideIndex) => {
    const isCurrent = slideIndex === boundedIndex;

    slide.classList.toggle("is-current", isCurrent);
    slide.classList.toggle("is-before", false);
    slide.classList.toggle("is-after", false);
    slide.classList.remove("is-entering", "is-exiting");
    slide.hidden = !isCurrent;
    slide.setAttribute("aria-hidden", isCurrent ? "false" : "true");
  });

  delete parts.deck.dataset.wrappedDirection;
  syncWrappedDeckChrome(parts, boundedIndex);
  animateWrappedCounters(parts.slides[boundedIndex]);
  loadWrappedPhotos(parts.slides[boundedIndex]);
}

function moveWrappedSlide(direction) {
  const parts = getWrappedDeckParts();
  const onWrappedChapter = chapters[storyState.current]?.dataset.chapter === "wrapped";

  if (
    parts &&
    onWrappedChapter &&
    direction > 0 &&
    wrappedDeckState.current >= parts.slides.length - 1
  ) {
    playClawTransition();
    return;
  }

  setWrappedSlide(wrappedDeckState.current + direction, { animate: true, direction });
}

function setupWrappedDeck() {
  const parts = getWrappedDeckParts();

  if (!parts || !parts.slides.length) {
    return;
  }

  const dotsContainer = parts.deck.querySelector("[data-wrapped-dots]");

  if (dotsContainer && !dotsContainer.children.length) {
    parts.slides.forEach((slide, slideIndex) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.dataset.wrappedDot = String(slideIndex);
      dot.setAttribute("aria-label", `Go to Wrapped card ${slideIndex + 1}`);
      dot.addEventListener("click", () =>
        setWrappedSlide(slideIndex, {
          animate: true,
          direction: slideIndex > wrappedDeckState.current ? 1 : -1
        })
      );
      dotsContainer.append(dot);
    });
  }

  parts.previousButton?.addEventListener("click", () => moveWrappedSlide(-1));
  parts.nextButton?.addEventListener("click", () => moveWrappedSlide(1));

  parts.deck.tabIndex = 0;
  parts.deck.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      moveWrappedSlide(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      moveWrappedSlide(1);
    }
  });

  parts.deck.addEventListener(
    "pointerdown",
    (event) => {
      wrappedDeckState.isPointerDown = true;
      wrappedDeckState.startX = event.clientX;
      wrappedDeckState.startY = event.clientY;
    },
    { passive: true }
  );

  parts.deck.addEventListener(
    "pointerup",
    (event) => {
      if (!wrappedDeckState.isPointerDown) {
        return;
      }

      const deltaX = event.clientX - wrappedDeckState.startX;
      const deltaY = event.clientY - wrappedDeckState.startY;
      wrappedDeckState.isPointerDown = false;

      if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.4) {
        moveWrappedSlide(deltaX < 0 ? 1 : -1);
      }
    },
    { passive: true }
  );

  parts.deck.addEventListener("pointercancel", () => {
    wrappedDeckState.isPointerDown = false;
  });

  setWrappedSlide(0);
}

function triggerWrappedReveal() {
  const wrappedSection = document.querySelector("#wrapped");

  if (!wrappedSection) {
    return;
  }

  wrappedSection.classList.remove("is-wrapped-playing");
  void wrappedSection.offsetWidth;
  wrappedSection.classList.add("is-wrapped-playing");
  setWrappedSlide(wrappedDeckState.current);
  animateWrappedCounters(wrappedSection.querySelector(".wrapped-copy") || wrappedSection);
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

  if (activeChapterKey === "quiz") {
    renderClawMachine();
  }

  stopJarPhysics();
}

function getScrapbookSpreadCount() {
  return document.querySelectorAll(".scrapbook-spread").length;
}

function isOnFinalScrapbookPage() {
  return storyState.scrapbookPage >= getScrapbookSpreadCount() - 1;
}

function updateStoryControls() {
  const chapter = chapters[storyState.current];
  const chapterKey = chapter.dataset.chapter;
  const progress = ((storyState.current + 1) / chapters.length) * 100;
  const shouldHideScrapbookNext =
    chapterKey === "scrapbook" &&
    (!storyState.scrapbookIntroComplete ||
      !isOnFinalScrapbookPage() ||
      storyState.transitioningToWrapped ||
      storyState.transitioningToClaw ||
      storyState.revealingTicket);

  counter.textContent = `Chapter ${storyState.current + 1} of ${chapters.length}`;
  storyProgressBar.style.width = `${progress}%`;

  Array.from(dotsWrap.children).forEach((dot, index) => {
    dot.classList.toggle("is-active", index === storyState.current);
  });
  dotsWrap.classList.toggle("is-hidden", chapterKey === "ending" || chapterKey === "wrapped");

  backButton.classList.toggle("is-hidden", !storyState.hasReachedEnd);
  nextButton.classList.toggle(
    "is-hidden",
    chapterKey === "intro" ||
      chapterKey === "wrapped" ||
      chapterKey === "quiz" ||
      chapterKey === "finale" ||
      shouldHideScrapbookNext
  );
  nextButton.textContent = chapterLabels[chapterKey] || "Next";

  const onQuiz = chapterKey === "quiz";
  nextButton.disabled =
    storyState.transitioningToWrapped ||
    storyState.transitioningToClaw ||
    storyState.revealingTicket ||
    (onQuiz && !storyState.quizComplete);

  if (chapterKey === "ending") {
    nextButton.classList.remove("is-hidden");
    nextButton.textContent = "Start over";
  }
}

function nextChapter() {
  const chapterKey = chapters[storyState.current].dataset.chapter;

  if (chapterKey === "ending") {
    closeWrappedTransition();
    closeClawTransition();
    closeTicketRevealTransition();
    closePrizeOpenPrompt();
    closePsLoveNotes();
    closeNote();
    storyState.psNotesFound = false;
    restartQuiz();
    resetScrapbookIntro();
    setChapter(0);
    return;
  }

  if (chapterKey === "quiz" && !storyState.quizComplete) {
    return;
  }

  if (chapterKey === "scrapbook") {
    if (!storyState.scrapbookIntroComplete || !isOnFinalScrapbookPage()) {
      return;
    }

    playWrappedTransition();
    return;
  }

  if (chapterKey === "wrapped") {
    playClawTransition();
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

function closeWrappedTransition() {
  window.clearTimeout(wrappedTransitionTimer);
  wrappedTransitionTimer = null;
  wrappedTransition?.classList.remove("is-playing", "is-ready", "is-finishing");
  wrappedTransition?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-transitioning-to-wrapped");
  storyState.transitioningToWrapped = false;
  storyState.wrappedTransitionReady = false;

  if (wrappedTransitionNext) {
    wrappedTransitionNext.hidden = true;
    wrappedTransitionNext.disabled = true;
  }

  if (chapters[storyState.current]) {
    updateStoryControls();
  }
}

function finishWrappedTransition() {
  if (
    !storyState.transitioningToWrapped ||
    !storyState.wrappedTransitionReady ||
    !wrappedTransition
  ) {
    return;
  }

  const wrappedIndex = getChapterIndex("wrapped");

  storyState.wrappedTransitionReady = false;
  if (wrappedTransitionNext) {
    wrappedTransitionNext.disabled = true;
  }
  wrappedTransition.classList.remove("is-ready");
  wrappedTransition.classList.add("is-finishing");
  window.clearTimeout(wrappedTransitionTimer);

  wrappedTransitionTimer = window.setTimeout(() => {
    wrappedTransition.classList.remove("is-playing", "is-ready", "is-finishing");
    wrappedTransition.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-transitioning-to-wrapped");
    storyState.transitioningToWrapped = false;
    wrappedTransitionTimer = null;
    if (wrappedTransitionNext) {
      wrappedTransitionNext.hidden = true;
    }
    setChapter(wrappedIndex >= 0 ? wrappedIndex : storyState.current + 1);
  }, 1050);
}

function playWrappedTransition() {
  if (storyState.transitioningToWrapped) {
    return;
  }

  const wrappedIndex = getChapterIndex("wrapped");

  if (wrappedIndex < 0 || prefersReducedMotion || !wrappedTransition) {
    setChapter(wrappedIndex >= 0 ? wrappedIndex : storyState.current + 1);
    return;
  }

  storyState.transitioningToWrapped = true;
  storyState.wrappedTransitionReady = false;
  clearScrapbookHold();
  updateStoryControls();

  document.body.classList.add("is-transitioning-to-wrapped");
  wrappedTransition.classList.remove("is-playing", "is-ready", "is-finishing");
  wrappedTransition.setAttribute("aria-hidden", "false");
  if (wrappedTransitionNext) {
    wrappedTransitionNext.hidden = true;
    wrappedTransitionNext.disabled = true;
  }
  void wrappedTransition.offsetWidth;
  wrappedTransition.classList.add("is-playing");

  window.clearTimeout(wrappedTransitionTimer);
  wrappedTransitionTimer = window.setTimeout(() => {
    storyState.wrappedTransitionReady = true;
    if (wrappedTransitionNext) {
      wrappedTransitionNext.hidden = false;
      wrappedTransitionNext.disabled = false;
    }
    window.requestAnimationFrame(() => wrappedTransition.classList.add("is-ready"));
  }, WRAPPED_TRANSITION_READY_MS);
}

function closeClawTransition() {
  window.clearTimeout(clawTransitionTimer);
  clawTransitionTimer = null;
  clawTransition?.classList.remove("is-playing");
  clawTransition?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-transitioning-to-claw");
  storyState.transitioningToClaw = false;

  if (chapters[storyState.current]) {
    updateStoryControls();
  }
}

function playClawTransition() {
  if (storyState.transitioningToClaw) {
    return;
  }

  const clawIndex = getChapterIndex("quiz");

  if (clawIndex < 0 || prefersReducedMotion || !clawTransition) {
    setChapter(clawIndex >= 0 ? clawIndex : storyState.current + 1);
    return;
  }

  storyState.transitioningToClaw = true;
  updateStoryControls();
  document.body.classList.add("is-transitioning-to-claw");
  clawTransition.classList.remove("is-playing");
  clawTransition.setAttribute("aria-hidden", "false");
  void clawTransition.offsetWidth;
  clawTransition.classList.add("is-playing");

  window.clearTimeout(clawTransitionTimer);
  clawTransitionTimer = window.setTimeout(() => {
    clawTransition.classList.remove("is-playing");
    clawTransition.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-transitioning-to-claw");
    storyState.transitioningToClaw = false;
    clawTransitionTimer = null;
    setChapter(clawIndex);
  }, CLAW_TRANSITION_MS);
}

function closeTicketRevealTransition() {
  window.clearTimeout(ticketRevealTimer);
  ticketRevealTimer = null;
  ticketRevealTransition?.classList.remove("is-playing");
  ticketRevealTransition?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-ticket-revealing");
  storyState.revealingTicket = false;

  if (chapters[storyState.current]) {
    updateStoryControls();
  }
}

function resetRunawayNoButton() {
  if (!prizeOpenNo) {
    return;
  }

  prizeOpenNo.textContent = "No";
  prizeOpenNo.style.setProperty("--no-x", "0px");
  prizeOpenNo.style.setProperty("--no-y", "0px");
  prizeOpenNo.classList.remove("is-dodging");
}

function closePrizeOpenPrompt() {
  window.clearTimeout(clawState.promptTimer);
  clawState.promptTimer = null;
  storyState.prizePromptOpen = false;
  prizeOpenPrompt?.classList.remove("is-open");
  prizeOpenPrompt?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-prize-prompt-open");
  resetRunawayNoButton();
}

function dodgeNoButton(event) {
  if (!prizeOpenNo || !prizeOpenPrompt?.classList.contains("is-open")) {
    return;
  }

  const angle = event?.clientX
    ? Math.atan2(
        prizeOpenNo.getBoundingClientRect().top + prizeOpenNo.offsetHeight / 2 - event.clientY,
        prizeOpenNo.getBoundingClientRect().left + prizeOpenNo.offsetWidth / 2 - event.clientX
      )
    : Math.random() * Math.PI * 2;
  const distance = 92 + Math.random() * 74;
  const jitterX = (Math.random() - 0.5) * 58;
  const jitterY = (Math.random() - 0.5) * 42;
  const x = Math.max(-145, Math.min(165, Math.cos(angle) * distance + jitterX));
  const y = Math.max(-82, Math.min(96, Math.sin(angle) * distance + jitterY));

  prizeOpenNo.textContent = Math.random() > 0.5 ? "Nope" : "Too slow";
  prizeOpenNo.classList.add("is-dodging");
  prizeOpenNo.style.setProperty("--no-x", `${x}px`);
  prizeOpenNo.style.setProperty("--no-y", `${y}px`);
}

function openPrizeOpenPrompt() {
  if (!clawState.hasCapsule || storyState.quizComplete || !prizeOpenPrompt) {
    return;
  }

  storyState.prizePromptOpen = true;
  resetRunawayNoButton();
  setQuizNote("You got the capsule. Do you want to open it?");
  document.body.classList.add("is-prize-prompt-open");
  prizeOpenPrompt.classList.add("is-open");
  prizeOpenPrompt.setAttribute("aria-hidden", "false");
  window.setTimeout(() => prizeOpenYes?.focus(), 240);
}

function confirmPrizeOpen() {
  if (!clawState.hasCapsule || storyState.quizComplete) {
    return;
  }

  closePrizeOpenPrompt();
  revealCapsulePrize();
}

function playTicketRevealTransition() {
  const resultIndex = getChapterIndex("result");

  if (resultIndex < 0) {
    return;
  }

  if (prefersReducedMotion || !ticketRevealTransition) {
    document.querySelector("#result")?.classList.add("is-prize-revealed");
    setChapter(resultIndex);
    return;
  }

  storyState.revealingTicket = true;
  updateStoryControls();
  document.body.classList.add("is-ticket-revealing");
  ticketRevealTransition.classList.remove("is-playing");
  ticketRevealTransition.setAttribute("aria-hidden", "false");
  void ticketRevealTransition.offsetWidth;
  ticketRevealTransition.classList.add("is-playing");

  window.clearTimeout(ticketRevealTimer);
  ticketRevealTimer = window.setTimeout(() => {
    ticketRevealTransition.classList.remove("is-playing");
    ticketRevealTransition.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-ticket-revealing");
    storyState.revealingTicket = false;
    ticketRevealTimer = null;
    document.querySelector("#result")?.classList.add("is-prize-revealed");
    setChapter(resultIndex);
  }, TICKET_REVEAL_TRANSITION_MS);
}

function openPsLoveNotes() {
  if (!psLoveNotes) {
    return;
  }

  psLoveNotes.classList.add("is-open");
  psLoveNotes.setAttribute("aria-hidden", "false");
  document.querySelector("#jar-message").textContent = "Pick any P.S. note from the bouquet.";
}

function closePsLoveNotes() {
  psLoveNotes?.classList.remove("is-open");
  psLoveNotes?.setAttribute("aria-hidden", "true");
  psLoveTransition?.classList.remove("is-playing");
  psLoveTransition?.setAttribute("aria-hidden", "true");
  document.body.classList.remove("is-finding-ps");
  storyState.revealingPsNotes = false;
}

function playPsLoveTransition() {
  if (storyState.revealingPsNotes) {
    return;
  }

  if (storyState.psNotesFound || prefersReducedMotion || !psLoveTransition) {
    storyState.psNotesFound = true;
    openPsLoveNotes();
    return;
  }

  storyState.revealingPsNotes = true;
  storyState.psNotesFound = true;
  document.body.classList.add("is-finding-ps");
  psLoveTransition.classList.remove("is-playing");
  psLoveTransition.setAttribute("aria-hidden", "false");
  void psLoveTransition.offsetWidth;
  psLoveTransition.classList.add("is-playing");

  window.setTimeout(() => {
    psLoveTransition.classList.remove("is-playing");
    psLoveTransition.setAttribute("aria-hidden", "true");
    document.body.classList.remove("is-finding-ps");
    storyState.revealingPsNotes = false;
    openPsLoveNotes();
  }, PS_LOVE_TRANSITION_MS);
}

function setQuizNote(message) {
  if (quizLockNote) {
    quizLockNote.textContent = message;
  }
}

function getNearestClawCapsule() {
  return clawCapsules.reduce((nearest, capsule) => {
    const nearestDistance = Math.abs(clawState.position - nearest.position);
    const capsuleDistance = Math.abs(clawState.position - capsule.position);
    return capsuleDistance < nearestDistance ? capsule : nearest;
  }, clawCapsules[0]);
}

function isWinningClawDrop(capsule) {
  return Boolean(capsule?.isPrize && Math.abs(clawState.position - capsule.position) <= 7);
}

function renderClawMachine() {
  const progress = storyState.quizComplete
    ? 100
    : clawState.hasCapsule
      ? 72
      : clawState.lastOutcome === "miss"
        ? Math.min(62, 38 + clawState.missCount * 8)
        : 30;

  if (clawMachine) {
    clawMachine.style.setProperty("--claw-x", clawState.position);
    clawMachine.classList.toggle("is-dropping", clawState.isDropping);
    clawMachine.classList.toggle("is-captured", clawState.hasCapsule);
    clawMachine.classList.toggle("is-unlocked", storyState.quizComplete);
    clawCapsules.forEach((capsule) => {
      clawMachine.classList.toggle(`missed-capsule-${capsule.id}`, clawState.lastMissed === capsule.id);
    });
  }

  quizProgress.textContent = storyState.quizComplete
    ? "Prize unlocked"
    : clawState.hasCapsule
      ? "Capsule won"
      : clawState.lastOutcome === "miss"
        ? "Try again"
        : "Prize waiting";
  questionProgressBar.style.width = `${progress}%`;
  questionDetail.textContent = storyState.quizComplete
    ? "Prize opened. Your next adventure is waiting."
    : clawState.hasCapsule
      ? "Nice catch. Open the capsule to see what you won."
      : clawState.lastOutcome === "miss"
        ? "That capsule was empty. Move the claw and try another one."
        : "Line up the claw, drop it, and test a capsule.";

  if (clawDropButton) {
    clawDropButton.textContent = clawState.hasCapsule ? "Open capsule" : "Drop claw";
    clawDropButton.disabled = clawState.isDropping || storyState.quizComplete;
  }

  if (mysteryCapsule) {
    mysteryCapsule.disabled = !clawState.hasCapsule || storyState.quizComplete;
    mysteryCapsule.setAttribute(
      "aria-label",
      clawState.hasCapsule ? "Open mystery capsule" : "Mystery capsule is still inside the machine"
    );
  }

  [clawLeftButton, clawRightButton].forEach((button) => {
    if (button) {
      button.disabled = clawState.isDropping || clawState.hasCapsule || storyState.quizComplete;
    }
  });
}

function moveClaw(direction) {
  if (clawState.isDropping || clawState.hasCapsule || storyState.quizComplete) {
    return;
  }

  clawState.lastOutcome = null;
  clawState.lastMissed = null;
  setQuizNote("Move the claw and try a capsule.");
  clawState.position = Math.max(18, Math.min(82, clawState.position + direction * 12));
  renderClawMachine();
}

function dropClaw() {
  if (clawState.isDropping || clawState.hasCapsule || storyState.quizComplete) {
    return;
  }

  const capsule = getNearestClawCapsule();
  const dropToken = clawState.dropToken + 1;

  clawState.dropToken = dropToken;
  clawState.isDropping = true;
  clawState.lastOutcome = null;
  clawState.lastMissed = null;
  setQuizNote("The claw is dropping...");
  renderClawMachine();

  window.setTimeout(() => {
    if (dropToken !== clawState.dropToken) {
      return;
    }

    clawState.isDropping = false;
    if (isWinningClawDrop(capsule)) {
      clawState.hasCapsule = true;
      clawState.lastOutcome = "hit";
      setQuizNote("Capsule won. Open it.");
      renderClawMachine();
      window.clearTimeout(clawState.promptTimer);
      clawState.promptTimer = window.setTimeout(
        openPrizeOpenPrompt,
        prefersReducedMotion ? 80 : 640
      );
      return;
    }

    clawState.missCount += 1;
    clawState.lastOutcome = "miss";
    clawState.lastMissed = capsule.id;
    setQuizNote("Not that one. Try another capsule.");
    renderClawMachine();

    window.setTimeout(() => {
      if (clawState.lastMissed === capsule.id && !clawState.isDropping) {
        clawState.lastMissed = null;
        renderClawMachine();
      }
    }, prefersReducedMotion ? 120 : 720);
  }, prefersReducedMotion ? 120 : 960);
}

function openCapsulePrize() {
  if (!clawState.hasCapsule || storyState.quizComplete) {
    return;
  }

  openPrizeOpenPrompt();
}

function revealCapsulePrize() {
  if (!clawState.hasCapsule || storyState.quizComplete) {
    return;
  }

  storyState.quizComplete = true;
  setQuizNote("Prize unlocked.");
  showResult();
  renderClawMachine();
  playTicketRevealTransition();
}

function showResult() {
  const result = tripResult;
  document.querySelector("#result-title").textContent = result.title;
  document.querySelector("#result-tagline").textContent = result.tagline;
  document.querySelector("#result-restaurant").textContent = result.restaurant;
  document.querySelector("#result-theme").textContent = result.theme;
  document.querySelector("#result-outfit").textContent = result.outfit;
  document.querySelector("#result-dessert").textContent = result.dessert;
}

function restartQuiz() {
  storyState.quizComplete = false;
  clawState.position = 50;
  clawState.isDropping = false;
  clawState.hasCapsule = false;
  clawState.missCount = 0;
  clawState.lastOutcome = null;
  clawState.lastMissed = null;
  clawState.dropToken += 1;
  closePrizeOpenPrompt();
  closeTicketRevealTransition();
  document.querySelector("#result")?.classList.remove("is-prize-revealed");
  setQuizNote("Move the claw and try a capsule.");
  renderClawMachine();
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

  if (chapters[storyState.current]?.dataset.chapter === "scrapbook") {
    updateStoryControls();
  }
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

function findWrappedPhoto(letter) {
  if (wrappedPhotoCache.has(letter)) {
    return wrappedPhotoCache.get(letter);
  }

  const urls = buildMediaUrls(letter, WRAPPED_PHOTO_PATH, SCRAPBOOK_IMAGE_EXTENSIONS);
  const photoPromise = findFirstMediaUrl(urls, probeImage);
  wrappedPhotoCache.set(letter, photoPromise);
  return photoPromise;
}

function loadWrappedPhotos(scope = document) {
  const frames = Array.from(scope.querySelectorAll("[data-wrapped-photo]"));

  frames.forEach(async (frame) => {
    if (frame.dataset.photoLoaded === "true" || frame.dataset.photoLoading === "true") {
      return;
    }

    const letter = frame.dataset.wrappedPhoto;

    if (!letter) {
      return;
    }

    frame.dataset.photoLoading = "true";
    const photoUrl = await findWrappedPhoto(letter);
    frame.dataset.photoLoading = "false";

    if (!photoUrl) {
      return;
    }

    frame.dataset.photoLoaded = "true";
    frame.style.backgroundImage = `url("${photoUrl}")`;
  });
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
  scrapbookFeature?.classList.add("is-reading-letter");
  scrapbookFeature?.classList.remove("is-scrapbook-revealed", "is-letter-ready");

  if (chapters[storyState.current]?.dataset.chapter === "scrapbook") {
    syncScrapbookIntro();
  }
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
  const openNoteEl = document.querySelector(".open-note");
  const noteColor = sourceEl ? getComputedStyle(sourceEl).getPropertyValue("--note-color").trim() : "";
  openNoteEl?.style.setProperty("--open-note-color", noteColor || "#ffe97b");
  document.querySelector("#note-modal-kicker").textContent = note.kicker || "Love note";
  const thread = document.querySelector("#note-modal-thread");
  thread.textContent = "";
  (note.messages || [note.body]).forEach((message, index) => {
    const bubble = document.createElement("p");
    bubble.className = "sticky-line";
    bubble.textContent = message;
    bubble.style.setProperty("--bubble-delay", `${index * 130}ms`);
    thread.appendChild(bubble);
  });
  document.querySelector("#jar-message").textContent = "Opened a P.S. note.";
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
wrappedTransitionNext?.addEventListener("click", finishWrappedTransition);

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
  document.querySelector("#jar-message").textContent = "Shuffled. Pick a love note from the P.S.";
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
psLoveTrigger?.addEventListener("click", playPsLoveTransition);
psLoveBackdrop?.addEventListener("click", closePsLoveNotes);
psLoveClose?.addEventListener("click", closePsLoveNotes);
document.querySelector("#reveal-button").addEventListener("click", () => {
  setChapter(getChapterIndex("ending"));
});

nextButton.addEventListener("click", nextChapter);
backButton.addEventListener("click", previousChapter);
restartButton.addEventListener("click", restartQuiz);
clawDropButton?.addEventListener("click", () => {
  if (clawState.hasCapsule) {
    openCapsulePrize();
    return;
  }

  dropClaw();
});
clawLeftButton?.addEventListener("click", () => moveClaw(-1));
clawRightButton?.addEventListener("click", () => moveClaw(1));
mysteryCapsule?.addEventListener("click", openCapsulePrize);
prizeOpenYes?.addEventListener("click", confirmPrizeOpen);
prizeOpenNo?.addEventListener("pointerenter", dodgeNoButton);
prizeOpenNo?.addEventListener("pointermove", dodgeNoButton);
prizeOpenNo?.addEventListener("focus", dodgeNoButton);
prizeOpenNo?.addEventListener("click", (event) => {
  event.preventDefault();
  dodgeNoButton(event);
  setQuizNote("No is running away. I think that means yes.");
});

renderClawMachine();
setupWrappedDeck();
setScrapbookPage(0);
setChapter(0);
