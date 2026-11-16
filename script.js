(() => {
  'use strict';

  const STORAGE_KEY = 'lingospark_progress_v1';

  const COURSES = [
    {
      id: 'hindi-en',
      emoji: '🇮🇳',
      title: 'Hindi → English Basics',
      desc: 'Translate everyday Hindi phrases using multiple choice and word-bank sentence assembly.',
      tag: '5 Questions • Language',
      questions: [
        {
          type: 'mc',
          prompt: 'What does "नमस्ते (Namaste)" mean?',
          options: ['Hello / Greetings', 'Good night', 'Thank you', 'Goodbye'],
          answer: 'Hello / Greetings',
        },
        {
          type: 'wb',
          prompt: 'Translate: "मेरा नाम अन्नू है"',
          words: ['My', 'name', 'is', 'Riya', 'your', 'book'],
          answer: ['My', 'name', 'is', 'Riya'],
        },
        {
          type: 'mc',
          prompt: 'Choose the meaning of "धन्यवाद (Dhanyavaad)"',
          options: ['Please', 'Sorry', 'Thank you', 'Excuse me'],
          answer: 'Thank you',
        },
        {
          type: 'wb',
          prompt: 'Translate: "मुझे संगीत पसंद है"',
          words: ['I', 'like', 'music', 'food', 'very', 'run'],
          answer: ['I', 'like', 'music'],
        },
        {
          type: 'mc',
          prompt: 'What is "पानी (Paani)" in English?',
          options: ['Fire', 'Water', 'Sky', 'Bread'],
          answer: 'Water',
        },
      ],
    },
    {
      id: 'python',
      emoji: '🐍',
      title: 'Python Logic Sprint',
      desc: 'Practice Python fundamentals with interactive code-output checks and syntax word banks.',
      tag: '5 Questions • Coding',
      questions: [
        {
          type: 'mc',
          prompt: 'What is the output of print(2 ** 3) in Python?',
          options: ['6', '8', '9', '5'],
          answer: '8',
        },
        {
          type: 'wb',
          prompt: 'Build a Python list of 3 numbers named nums:',
          words: ['nums', '=', '[1,', '2,', '3]', 'let', '{1, 2}'],
          answer: ['nums', '=', '[1,', '2,', '3]'],
        },
        {
          type: 'mc',
          prompt: 'Which keyword defines a function in Python?',
          options: ['func', 'function', 'def', 'lambda_fn'],
          answer: 'def',
        },
        {
          type: 'wb',
          prompt: 'Write a print statement for "Hello":',
          words: ['print', '("Hello")', 'console.log', 'echo', 'return'],
          answer: ['print', '("Hello")'],
        },
        {
          type: 'mc',
          prompt: 'What does len("SUNOZA") return?',
          options: ['5', '6', '7', 'Error'],
          answer: '6',
        },
      ],
    },
  ];

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : { xp: 0, streak: 1 };
    } catch {
      return { xp: 0, streak: 1 };
    }
  }

  function saveProgress(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore storage restrictions
    }
  }

  const saved = loadProgress();

  const state = {
    totalXp: saved.xp || 0,
    streak: saved.streak || 1,
    soundOn: true,
    course: null,
    queue: [],
    totalInitial: 0,
    completedCount: 0,
    hearts: 5,
    combo: 0,
    bestCombo: 0,
    sessionXp: 0,
    attempts: 0,
    correctAttempts: 0,
    selectedMc: null,
    selectedWords: [],
    checked: false,
  };

  const el = {
    streakCount: document.getElementById('streakCount'),
    totalXpCount: document.getElementById('totalXpCount'),
    soundToggleBtn: document.getElementById('soundToggleBtn'),
    homeView: document.getElementById('homeView'),
    lessonView: document.getElementById('lessonView'),
    resultView: document.getElementById('resultView'),
    courseGrid: document.getElementById('courseGrid'),
    exitLessonBtn: document.getElementById('exitLessonBtn'),
    progressFill: document.getElementById('progressFill'),
    heartsCount: document.getElementById('heartsCount'),
    questionTypeBadge: document.getElementById('questionTypeBadge'),
    reviewBadge: document.getElementById('reviewBadge'),
    questionPrompt: document.getElementById('questionPrompt'),
    mcContainer: document.getElementById('mcContainer'),
    wbContainer: document.getElementById('wbContainer'),
    answerTray: document.getElementById('answerTray'),
    wordBank: document.getElementById('wordBank'),
    bottomBar: document.getElementById('bottomBar'),
    feedbackTitle: document.getElementById('feedbackTitle'),
    feedbackSub: document.getElementById('feedbackSub'),
    checkBtn: document.getElementById('checkBtn'),
    continueBtn: document.getElementById('continueBtn'),
    resultEmoji: document.getElementById('resultEmoji'),
    resultTitle: document.getElementById('resultTitle'),
    resultSubtitle: document.getElementById('resultSubtitle'),
    earnedXpVal: document.getElementById('earnedXpVal'),
    accuracyVal: document.getElementById('accuracyVal'),
    bestComboVal: document.getElementById('bestComboVal'),
    retryCourseBtn: document.getElementById('retryCourseBtn'),
    backHomeBtn: document.getElementById('backHomeBtn'),
  };

  // Web Audio API sound effects (no external MP3 files needed).
  let audioCtx = null;

  function playTone(type) {
    if (!state.soundOn) return;

    try {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }

      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'correct') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now);
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.14);
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.26);
      } else if (type === 'wrong') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(150, now + 0.22);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.start(now);
        osc.stop(now + 0.27);
      } else if (type === 'finish') {
        osc.type = 'sine';
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
        });
        gain.gain.setValueAtTime(0.16, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
        osc.start(now);
        osc.stop(now + 0.46);
      }
    } catch {
      // Audio context blocked or unsupported.
    }
  }

  function updateTopStats() {
    el.streakCount.textContent = String(state.streak);
    el.totalXpCount.textContent = String(state.totalXp);
  }

  function renderHome() {
    el.homeView.classList.remove('hidden');
    el.lessonView.classList.add('hidden');
    el.resultView.classList.add('hidden');
    el.bottomBar.classList.add('hidden');

    el.courseGrid.innerHTML = '';

    COURSES.forEach((course) => {
      const btn = document.createElement('button');
      btn.className = 'course-card';
      btn.type = 'button';

      btn.innerHTML = `
        <span class="course-emoji">${course.emoji}</span>
        <div class="course-title">${course.title}</div>
        <p class="course-desc">${course.desc}</p>
        <span class="course-tag">${course.tag}</span>
      `;

      btn.addEventListener('click', () => startCourse(course));
      el.courseGrid.appendChild(btn);
    });
  }

  function startCourse(course) {
    state.course = course;
    state.queue = course.questions.map((q) => ({ ...q, isReview: false }));
    state.totalInitial = course.questions.length;
    state.completedCount = 0;
    state.hearts = 5;
    state.combo = 0;
    state.bestCombo = 0;
    state.sessionXp = 0;
    state.attempts = 0;
    state.correctAttempts = 0;

    el.homeView.classList.add('hidden');
    el.resultView.classList.add('hidden');
    el.lessonView.classList.remove('hidden');
    el.bottomBar.classList.remove('hidden');

    renderQuestion();
  }

  function renderQuestion() {
    const q = state.queue[0];

    if (!q) {
      finishLesson(true);
      return;
    }

    state.selectedMc = null;
    state.selectedWords = [];
    state.checked = false;

    const pct = Math.min(
      100,
      Math.round((state.completedCount / state.totalInitial) * 100)
    );

    el.progressFill.style.width = `${pct}%`;
    el.heartsCount.textContent = String(state.hearts);

    el.bottomBar.className = 'bottom-bar';
    el.feedbackTitle.textContent = '';
    el.feedbackSub.textContent = '';
    el.checkBtn.classList.remove('hidden');
    el.checkBtn.disabled = true;
    el.continueBtn.classList.add('hidden');

    el.questionTypeBadge.textContent =
      q.type === 'mc' ? 'Multiple Choice' : 'Build the Sentence';

    el.reviewBadge.classList.toggle('hidden', !q.isReview);
    el.questionPrompt.textContent = q.prompt;

    if (q.type === 'mc') {
      el.mcContainer.classList.remove('hidden');
      el.wbContainer.classList.add('hidden');
      el.mcContainer.innerHTML = '';

      q.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'option-card';
        btn.innerHTML = `
          <span class="option-key">${idx + 1}</span>
          <span>${opt}</span>
        `;

        btn.addEventListener('click', () => {
          if (state.checked) return;

          state.selectedMc = opt;

          document.querySelectorAll('.option-card').forEach((card) => {
            card.classList.remove('selected');
          });

          btn.classList.add('selected');
          el.checkBtn.disabled = false;
        });

        el.mcContainer.appendChild(btn);
      });
    } else {
      el.mcContainer.classList.add('hidden');
      el.wbContainer.classList.remove('hidden');
      renderWordBank(q);
    }
  }

  function renderWordBank(q) {
    el.answerTray.innerHTML = '';

    if (state.selectedWords.length === 0) {
      el.answerTray.innerHTML = `
        <span class="answer-tray-placeholder">
          Tap words below to build your answer...
        </span>
      `;
    } else {
      state.selectedWords.forEach((item, trayPos) => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'word-chip';
        chip.textContent = item.word;

        chip.addEventListener('click', () => {
          if (state.checked) return;

          state.selectedWords.splice(trayPos, 1);
          renderWordBank(q);
        });

        el.answerTray.appendChild(chip);
      });
    }

    el.wordBank.innerHTML = '';

    q.words.forEach((word, idx) => {
      const isUsed = state.selectedWords.some((item) => item.idx === idx);
      const chip = document.createElement('button');

      chip.type = 'button';
      chip.className = `word-chip${isUsed ? ' used' : ''}`;
      chip.textContent = word;

      chip.addEventListener('click', () => {
        if (state.checked || isUsed) return;

        state.selectedWords.push({ idx, word });
        renderWordBank(q);
      });

      el.wordBank.appendChild(chip);
    });

    el.checkBtn.disabled = state.selectedWords.length === 0;
  }

  function checkAnswer() {
    const q = state.queue[0];

    if (!q || state.checked) return;

    state.checked = true;
    state.attempts += 1;

    let isCorrect = false;
    let expectedStr = '';

    if (q.type === 'mc') {
      isCorrect = state.selectedMc === q.answer;
      expectedStr = q.answer;
    } else {
      const userWords = state.selectedWords.map((item) => item.word);
      isCorrect = userWords.join(' ') === q.answer.join(' ');
      expectedStr = q.answer.join(' ');
    }

    el.checkBtn.classList.add('hidden');
    el.continueBtn.classList.remove('hidden');

    if (isCorrect) {
      state.correctAttempts += 1;
      state.combo += 1;

      if (state.combo > state.bestCombo) {
        state.bestCombo = state.combo;
      }

      const bonus = state.combo >= 3 ? 5 : 0;
      state.sessionXp += 10 + bonus;

      if (!q.isReview) {
        state.completedCount += 1;
      }

      playTone('correct');
      el.bottomBar.classList.add('correct');
      el.continueBtn.className = 'btn-3d';

      el.feedbackTitle.textContent = bonus
        ? `Great! +10 XP (+${bonus} Combo Bonus)`
        : 'Nicely done! +10 XP';

      el.feedbackSub.textContent = `${state.combo}x streak in this lesson`;

      state.queue.shift();
    } else {
      state.combo = 0;
      state.hearts -= 1;
      el.heartsCount.textContent = String(state.hearts);

      playTone('wrong');
      el.bottomBar.classList.add('wrong');
      el.continueBtn.className = 'btn-3d red';

      el.feedbackTitle.textContent = 'Correct solution:';
      el.feedbackSub.textContent = expectedStr;

      const missed = state.queue.shift();
      missed.isReview = true;
      state.queue.push(missed);
    }
  }

  function nextStep() {
    if (state.hearts <= 0) {
      finishLesson(false);
      return;
    }

    renderQuestion();
  }

  function finishLesson(won) {
    el.lessonView.classList.add('hidden');
    el.bottomBar.classList.add('hidden');
    el.resultView.classList.remove('hidden');

    if (won) {
      el.progressFill.style.width = '100%';
      playTone('finish');

      state.totalXp += state.sessionXp;

      saveProgress({
        xp: state.totalXp,
        streak: state.streak,
      });

      updateTopStats();

      el.resultEmoji.textContent = '🎉';
      el.resultTitle.textContent = 'Lesson Complete!';
      el.resultSubtitle.textContent =
        'You cleared all questions, including any missed reviews.';
    } else {
      el.resultEmoji.textContent = '💔';
      el.resultTitle.textContent = 'Out of Hearts!';
      el.resultSubtitle.textContent =
        'No worries—every mistake is part of learning. Try again!';
    }

    const acc = state.attempts
      ? Math.round((state.correctAttempts / state.attempts) * 100)
      : 0;

    el.earnedXpVal.textContent = `+${state.sessionXp}`;
    el.accuracyVal.textContent = `${acc}%`;
    el.bestComboVal.textContent = `${state.bestCombo}x`;
  }

  // Event listeners / bindings.
  el.soundToggleBtn.addEventListener('click', () => {
    state.soundOn = !state.soundOn;

    el.soundToggleBtn.classList.toggle('on', state.soundOn);

    el.soundToggleBtn.textContent = state.soundOn
      ? '🔊 Sound On'
      : '🔇 Sound Off';
  });

  el.exitLessonBtn.addEventListener('click', renderHome);
  el.backHomeBtn.addEventListener('click', renderHome);

  el.retryCourseBtn.addEventListener('click', () => {
    if (state.course) {
      startCourse(state.course);
    }
  });

  el.checkBtn.addEventListener('click', checkAnswer);
  el.continueBtn.addEventListener('click', nextStep);

  document.addEventListener('keydown', (e) => {
    if (el.lessonView.classList.contains('hidden')) return;

    const q = state.queue[0];
    if (!q) return;

    if (
      q.type === 'mc' &&
      !state.checked &&
      ['1', '2', '3', '4'].includes(e.key)
    ) {
      const cards = document.querySelectorAll('.option-card');
      const idx = Number(e.key) - 1;

      if (cards[idx]) {
        cards[idx].click();
      }
    } else if (e.key === 'Enter') {
      if (!state.checked && !el.checkBtn.disabled) {
        checkAnswer();
      } else if (state.checked) {
        nextStep();
      }
    }
  });

  updateTopStats();
  renderHome();
})();