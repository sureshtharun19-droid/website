/* --------------------------------------------------------------------------
   CONFIG
-------------------------------------------------------------------------- */

const CONFIG = {
  starCount: 78,
  fireflyCount: 14,
  particleCount: 9,
  pageTransitionMs: 700,
  loadingDurationMs: 6000,
  musicFadeStepMs: 120,
  musicFadeStep: 0.045
};

const LETTER_TEXT = `Dear Harshitha,

I was honestly going to write you a proper handwritten letter, but then I remembered you'd actually have to read my handwriting 😂

So here's my slightly more readable version.

I'm really glad I got to know you and I'm grateful for all the random conversations, laughs and memories we've had.

I hope this year brings you a lot of happiness, good food, good people and plenty of reasons to smile.

Happy Birthday ❤️

— Tharun`;

const PASSWORD = "pufferfish";


/* --------------------------------------------------------------------------
   ELEMENTS
-------------------------------------------------------------------------- */

const elements = {
  app: document.getElementById("app"),
  stars: document.getElementById("stars"),
  fireflies: document.getElementById("fireflies"),
  particles: document.getElementById("floating-particles"),

  music: document.getElementById("background-music"),
  musicToggle: document.getElementById("music-toggle"),

  passwordForm: document.getElementById("password-form"),
  passwordInput: document.getElementById("password-input"),
  passwordMessage: document.getElementById("password-message"),

  loadingPage: document.getElementById("loading-page"),
  loadingProgress: document.querySelector(".story-progress"),

  letterEnvelope: document.getElementById("letter-envelope"),
  typedLetter: document.getElementById("typed-letter"),
  letterContinue: document.getElementById("letter-continue"),

  carousel: document.getElementById("memory-carousel"),
  carouselDots: document.getElementById("carousel-dots")
};


/* --------------------------------------------------------------------------
   STATE
-------------------------------------------------------------------------- */

let currentPage = document.querySelector(".app-page.is-active");

let experienceUnlocked = false;

let musicEnabled = true;

let loadingStarted = false;

let currentMemoryIndex = 0;

let activeTypingTimer = null;


/* --------------------------------------------------------------------------
   STORAGE
-------------------------------------------------------------------------- */

const storage = {

  get(key, fallback) {
    try {
      return sessionStorage.getItem(key) ?? fallback;
    } catch {
      return fallback;
    }
  },

  set(key, value) {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Storage optional
    }
  }

};

musicEnabled =
  storage.get("birthdayMusicPreference", "on") !== "off";


/* --------------------------------------------------------------------------
   UTILITIES
-------------------------------------------------------------------------- */

const random = (min, max) =>
  Math.random() * (max - min) + min;


const setStyles = (element, styles) =>
  Object.assign(element.style, styles);


const queryAll = (selector, scope = document) =>
  Array.from(scope.querySelectorAll(selector));


function createAmbientElement(className, parent, styles = {}) {

  const element = document.createElement("span");

  element.className = className;

  setStyles(element, styles);

  parent.appendChild(element);

}


/* --------------------------------------------------------------------------
   AMBIENT VISUALS
-------------------------------------------------------------------------- */

function createAmbientVisuals() {

  const stars = document.createDocumentFragment();

  const fireflies = document.createDocumentFragment();

  const particles = document.createDocumentFragment();

  const shapes = ["✦", "·", "✧"];


  for (
    let index = 0;
    index < CONFIG.starCount;
    index += 1
  ) {

    createAmbientElement("star", stars, {

      left: `${random(0, 100)}%`,

      top: `${random(0, 100)}%`,

      "--size": `${random(1, 2.8)}px`,

      "--opacity": random(0.25, 0.88),

      "--duration": `${random(2, 5.5)}s`,

      "--delay": `${random(-5, 0)}s`

    });

  }


  for (
    let index = 0;
    index < CONFIG.fireflyCount;
    index += 1
  ) {

    createAmbientElement("firefly", fireflies, {

      left: `${random(3, 97)}%`,

      top: `${random(25, 95)}%`,

      "--travel-x": `${random(-80, 80)}px`,

      "--travel-y": `${random(-95, 34)}px`,

      "--duration": `${random(5, 10)}s`,

      "--delay": `${random(-9, 0)}s`

    });

  }


  for (
    let index = 0;
    index < CONFIG.particleCount;
    index += 1
  ) {

    const particle = document.createElement("span");

    particle.className = "particle";

    particle.textContent =
      shapes[index % shapes.length];

    setStyles(particle, {

      left: `${random(0, 100)}%`,

      "--size": `${random(0.7, 1.2)}rem`,

      "--travel-x": `${random(-110, 110)}px`,

      "--duration": `${random(15, 25)}s`,

      "--delay": `${random(-24, 0)}s`

    });

    particles.appendChild(particle);

  }


  elements.stars.appendChild(stars);

  elements.fireflies.appendChild(fireflies);

  elements.particles.appendChild(particles);

}


/* --------------------------------------------------------------------------
   MUSIC
-------------------------------------------------------------------------- */

function updateMusicControl(isPlaying) {

  elements.musicToggle.setAttribute(
    "aria-pressed",
    String(isPlaying)
  );

  elements.musicToggle.setAttribute(
    "aria-label",
    isPlaying
      ? "Turn music off"
      : "Turn music on"
  );

  const label =
    elements.musicToggle.querySelector(".music-label");

  if (label) {

    label.textContent =
      isPlaying
        ? "Music on"
        : "Music off";

  }

}


function setMusicPreference(enabled) {

  musicEnabled = enabled;

  storage.set(
    "birthdayMusicPreference",
    enabled ? "on" : "off"
  );

}


async function playMusic() {

  if (!experienceUnlocked || !musicEnabled) {
    return;
  }

  try {

    await elements.music.play();

    updateMusicControl(true);

  } catch {

    updateMusicControl(false);

  }

}


function toggleMusic() {

  if (!experienceUnlocked) {
    return;
  }

  if (elements.music.paused) {

    setMusicPreference(true);

    playMusic();

  } else {

    elements.music.pause();

    setMusicPreference(false);

    updateMusicControl(false);

  }

}


function fadeOutMusic() {

  if (elements.music.paused) {
    return;
  }

  const fadeTimer =
    window.setInterval(() => {

      const nextVolume =
        elements.music.volume -
        CONFIG.musicFadeStep;

      if (nextVolume <= 0) {

        elements.music.pause();

        elements.music.volume = 1;

        updateMusicControl(false);

        window.clearInterval(fadeTimer);

        return;

      }

      elements.music.volume = nextVolume;

    }, CONFIG.musicFadeStepMs);

}


/* --------------------------------------------------------------------------
   PAGE TRANSITIONS
-------------------------------------------------------------------------- */

function showPage(pageId) {

  const nextPage =
    document.getElementById(pageId);

  if (!nextPage) {
    console.error("Page not found:", pageId);
    return;
  }

  if (nextPage === currentPage) {
    return;
  }


  const previousPage = currentPage;


  nextPage.hidden = false;

  nextPage.scrollTop = 0;


  requestAnimationFrame(() => {

    nextPage.classList.add("is-active");

    nextPage.dispatchEvent(
      new CustomEvent("page:shown")
    );

    const title =
      nextPage.querySelector("h1, h2");

    if (title) {

      title.focus({
        preventScroll: true
      });

    }

  });


  currentPage = nextPage;


  if (previousPage) {

    previousPage.classList.remove(
      "is-active"
    );

    window.setTimeout(() => {

      previousPage.hidden = true;

    }, CONFIG.pageTransitionMs);

  }

}


/* --------------------------------------------------------------------------
   PASSWORD PAGE
-------------------------------------------------------------------------- */

function createUnlockBurst() {

  const colors = [
    "#e9c46a",
    "#f6c1d7",
    "#fff8f3",
    "#c9a7eb"
  ];

  const fragment =
    document.createDocumentFragment();


  for (let index = 0; index < 30; index += 1) {

    const particle =
      document.createElement("span");

    particle.className =
      "burst-particle";

    setStyles(particle, {

      left: "50%",

      top: "50%",

      "--burst-x":
        `${random(-190, 190)}px`,

      "--burst-y":
        `${random(-215, 165)}px`,

      "--burst-color":
        colors[index % colors.length]

    });

    fragment.appendChild(particle);

    window.setTimeout(
      () => particle.remove(),
      900
    );

  }


  document.body.appendChild(fragment);

}


function unlockPasswordScreen() {

  const passwordCard =
    document.querySelector(".password-card");

  passwordCard.classList.add(
    "is-unlocked"
  );

  elements.passwordMessage.textContent =
    "The key fits perfectly.";

  experienceUnlocked = true;

  elements.musicToggle.disabled = false;

  createUnlockBurst();

  playMusic();


  window.setTimeout(() => {

    showPage("loading-page");

  }, 1000);

}


function handlePasswordSubmit(event) {

  event.preventDefault();


  if (
    elements.passwordInput.value.trim()
    === PASSWORD
  ) {

    unlockPasswordScreen();

    return;

  }


  elements.passwordMessage.textContent =
    "That key does not seem quite right.";


  elements.passwordForm.classList.remove(
    "is-shaking"
  );

  void elements.passwordForm.offsetWidth;

  elements.passwordForm.classList.add(
    "is-shaking"
  );

  elements.passwordInput.select();

}


/* --------------------------------------------------------------------------
   LOADING PAGE
-------------------------------------------------------------------------- */

function startLoadingStory() {

  if (loadingStarted) {
    return;
  }

  loadingStarted = true;

  const startTime =
    performance.now();


  elements.loadingPage.classList.add(
    "is-loading"
  );


  function updateProgress(now) {

    const progress =
      Math.min(
        100,
        ((now - startTime) /
          CONFIG.loadingDurationMs) *
          100
      );


    elements.loadingProgress.setAttribute(
      "aria-valuenow",
      String(Math.round(progress))
    );


    if (progress < 100) {

      requestAnimationFrame(
        updateProgress
      );

      return;

    }


    elements.loadingPage.classList.remove(
      "is-loading"
    );

    elements.loadingPage.classList.add(
      "is-complete"
    );


    window.setTimeout(() => {

      showPage("hero-page");

    }, 1250);

  }


  requestAnimationFrame(
    updateProgress
  );

}


/* --------------------------------------------------------------------------
   CHILDHOOD PHOTO PAGE
-------------------------------------------------------------------------- */

function initializePolaroids() {

  const polaroids =
    queryAll(".polaroid");

  const gallery =
    document.getElementById(
      "polaroid-gallery"
    );

  const photoPrompt =
    document.getElementById(
      "photo-prompt"
    );

  const reveal =
    document.getElementById(
      "troublemaker-reveal"
    );


  polaroids.forEach((photo) => {

    photo.style.setProperty(
      "--rotation",
      `${random(-7, 7).toFixed(1)}deg`
    );


    photo.addEventListener(
      "click",
      () => {

        polaroids.forEach((item) => {

          item.classList.toggle(
            "is-selected",
            item === photo
          );

        });


        photoPrompt.hidden = true;

        reveal.hidden = false;

        gallery.classList.add(
          "has-selection"
        );

      }
    );

  });

}


/* --------------------------------------------------------------------------
   FUNNY HARSHITHA QUIZ
-------------------------------------------------------------------------- */

const slides =
  queryAll(".memory-card");


function initializeFunnyQuiz() {

  const quizOptions =
    queryAll(".quiz-option");


  const correctAnswers = [

    "chaos",

    "goldfish",

    "hate",

    "briyani"

  ];


  quizOptions.forEach((button) => {

    button.addEventListener(
      "click",
      () => {

        const card =
          button.closest(
            ".memory-card"
          );

        const result =
          card.querySelector(
            ".quiz-result"
          );


        if (
          card.classList.contains(
            "answered"
          )
        ) {

          return;

        }


        card.classList.add(
          "answered"
        );


        const answer =
          button.dataset.answer;


        const questionNumber =
          Number(
            card.dataset.question
          );


        const correctAnswer =
          correctAnswers[
            questionNumber - 1
          ];


        if (answer === correctAnswer) {

          button.classList.add("correct");


          const correctComments = {

            chaos:
              "😂 Obviously. You know yourself well.",

            goldfish:
              "😂 At least you know yourself.",

            hate:
              "💀 Correct. I don't think there was ever another option.",

            briyani:
              "🍛 Obviously. This one wasn't even a question."

          };


          result.textContent =
            correctComments[answer];


        } else {

          button.classList.add("wrong");


          const wrongComments = {

            innocent:
              "😂 Nice try. We both know the real answer.",

            perfect:
              "Kondruven unna 😭 Olunga vera option choose pannu.",

            love:
              "😭 Since when?? ",

            everything:
              "😂 Nice answer… but we both know biryani ."

          };


          result.textContent =
            wrongComments[answer];


          const correctButton =
            card.querySelector(
              `[data-answer="${correctAnswer}"]`
            );


          if (correctButton) {

            correctButton.classList.add(
              "correct"
            );

          }

        }


        /* Move to next question */

        window.setTimeout(() => {

          if (
            questionNumber <
            slides.length
          ) {

            showMemory(
              questionNumber
            );

          } else {

            showPage(
              "ending-page"
            );

          }

        }, 1200);

      }
    );

  });

}


/* --------------------------------------------------------------------------
   LETTER PAGE
-------------------------------------------------------------------------- */

function typeLetter() {

  let characterIndex = 0;

  elements.typedLetter.textContent = "";


  activeTypingTimer =
    window.setInterval(() => {

      elements.typedLetter.textContent +=
        LETTER_TEXT[
          characterIndex
        ];


      characterIndex += 1;


      if (
        characterIndex >=
        LETTER_TEXT.length
      ) {

        window.clearInterval(
          activeTypingTimer
        );

        elements.letterContinue.hidden =
          false;

      }

    }, 18);

}


function openLetter() {

  if (
    elements.letterEnvelope.classList.contains(
      "is-open"
    )
  ) {

    return;

  }


  elements.letterEnvelope.classList.add(
    "is-open"
  );

  elements.letterEnvelope.setAttribute(
    "aria-expanded",
    "true"
  );


  document.getElementById(
    "letter-instruction"
  ).hidden = true;


  window.setTimeout(
    typeLetter,
    820
  );

}


/* --------------------------------------------------------------------------
   MEMORY CAROUSEL
-------------------------------------------------------------------------- */

function showMemory(requestedIndex) {

  if (
    requestedIndex >=
    slides.length
  ) {

    showPage("ending-page");

    return;

  }


  currentMemoryIndex =
    requestedIndex < 0
      ? slides.length - 1
      : requestedIndex;


  slides.forEach(
    (slide, index) => {

      const isCurrent =
        index === currentMemoryIndex;


      slide.classList.toggle(
        "is-current",
        isCurrent
      );


      slide.setAttribute(
        "aria-hidden",
        String(!isCurrent)
      );

    }
  );


  queryAll(
    ".carousel-dot"
  ).forEach(
    (dot, index) => {

      const isCurrent =
        index === currentMemoryIndex;


      dot.classList.toggle(
        "is-current",
        isCurrent
      );


      dot.setAttribute(
        "aria-current",
        isCurrent
          ? "true"
          : "false"
      );

    }
  );

}


function initializeMemoryCarousel() {

  let pointerStartX = null;


  slides.forEach(
    (_, index) => {

      const dot =
        document.createElement(
          "button"
        );


      dot.className =
        "carousel-dot";

      dot.type = "button";


      dot.setAttribute(
        "aria-label",
        `Show memory ${index + 1}`
      );


      dot.addEventListener(
        "click",
        () => {

          showMemory(index);

        }
      );


      elements.carouselDots.appendChild(
        dot
      );

    }
  );


  document
    .getElementById("gallery-previous")
    .addEventListener(
      "click",
      () => {

        showMemory(
          currentMemoryIndex - 1
        );

      }
    );


  document
    .getElementById("gallery-next")
    .addEventListener(
      "click",
      () => {

        showMemory(
          currentMemoryIndex + 1
        );

      }
    );


  elements.carousel.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "ArrowLeft" ||
        event.key === "ArrowRight"
      ) {

        event.preventDefault();


        showMemory(
          currentMemoryIndex +
          (
            event.key === "ArrowRight"
              ? 1
              : -1
          )
        );

      }

    }
  );


  elements.carousel.addEventListener(
    "pointerdown",
    (event) => {

      pointerStartX =
        event.clientX;

    }
  );


  elements.carousel.addEventListener(
    "pointerup",
    (event) => {

      if (
        pointerStartX === null
      ) {

        return;

      }


      const distance =
        event.clientX -
        pointerStartX;


      if (
        Math.abs(distance) > 42
      ) {

        showMemory(
          currentMemoryIndex +
          (
            distance < 0
              ? 1
              : -1
          )
        );

      }


      pointerStartX = null;

    }
  );


  elements.carousel.addEventListener(
    "pointercancel",
    () => {

      pointerStartX = null;

    }
  );


  showMemory(0);

}


/* --------------------------------------------------------------------------
   WELCOME + YES / NO
-------------------------------------------------------------------------- */

function initializeWelcomeAndQuestion() {

  const beginButton =
    document.querySelector(
      "#welcome-page .hero-continue"
    );


  const yesButton =
    document.getElementById(
      "yes-btn"
    );


  const noButton =
    document.getElementById(
      "no-btn"
    );


  /* Welcome → Question */

  beginButton.addEventListener(
    "click",
    () => {

      showPage(
        "question-page"
      );

    }
  );


  /* YES → Password */

  yesButton.addEventListener(
    "click",
    () => {

      showPage(
        "password-page"
      );

    }
  );


  /* NO button */

  function moveNoButton() {

    const container =
      document.querySelector(
        ".question-buttons"
      );


    const maxX =
      Math.max(
        0,
        container.offsetWidth -
        noButton.offsetWidth
      );


    const maxY = 120;


    noButton.style.position =
      "absolute";


    noButton.style.left =
      Math.random() * maxX +
      "px";


    noButton.style.top =
      Math.random() * maxY +
      "px";

  }


  noButton.addEventListener(
    "mouseenter",
    moveNoButton
  );


  noButton.addEventListener(
    "touchstart",
    (event) => {

      event.preventDefault();

      moveNoButton();

    }
  );

}


/* --------------------------------------------------------------------------
   INITIALIZE
-------------------------------------------------------------------------- */

function initializeApp() {

  createAmbientVisuals();

  initializeWelcomeAndQuestion();

  initializePolaroids();

  initializeFunnyQuiz();

  initializeMemoryCarousel();


  elements.musicToggle.addEventListener(
    "click",
    toggleMusic
  );


  elements.passwordForm.addEventListener(
    "submit",
    handlePasswordSubmit
  );


  elements.loadingPage.addEventListener(
    "page:shown",
    startLoadingStory,
    { once: true }
  );


  elements.letterEnvelope.addEventListener(
    "click",
    openLetter
  );


  document
    .getElementById("ending-page")
    .addEventListener(
      "page:shown",
      fadeOutMusic,
      { once: true }
    );


  queryAll("[data-next]")
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          showPage(
            button.dataset.next
          );

        }
      );

    });

}


/* --------------------------------------------------------------------------
   PUBLIC API
-------------------------------------------------------------------------- */

window.BirthdayApp = {

  showPage,

  fadeOutMusic

};


/* START */

initializeApp();
