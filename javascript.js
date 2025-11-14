(() => {
  const questionEl = document.getElementById('question');
  const opLabel = document.getElementById('opLabel');
  const answersEl = document.getElementById('answers');
  const timeLeftEl = document.getElementById('timeLeft');
  const scoreEl = document.getElementById('score');
  const highScoreEl = document.getElementById('highScore');
  const startBtn = document.getElementById('startBtn');
  const exportBtn = document.getElementById('exportBtn');
  const endPanel = document.getElementById('endPanel');
  const endText = document.getElementById('endText');
  const progressEl = document.getElementById('progress');
  const roundsDoneEl = document.getElementById('roundsDone');
  const modeSel = document.getElementById('mode');
  const livesEl = document.getElementById('lives');
  const resetHigh = document.getElementById('resetHigh');
  const roundCapSel = document.getElementById('roundCap');

  let state = {
    timeLeft: 60,
    timerId: null,
    running: false,
    score: 0,
    highScore: 0,
    roundsDone: 0,
    roundCap: parseInt(roundCapSel.value,10),
    lives: 3,
    currentAnswer: null,
    totalTime: 60
  };

  function loadHigh() {
    const v = parseInt(localStorage.getItem('beginner_qm_high')||'0',10);
    state.highScore = isNaN(v)?0:v;
    highScoreEl.textContent = state.highScore;
  }
  loadHigh();

  function saveHigh() {
    if (state.score > state.highScore) {
      state.highScore = state.score;
      localStorage.setItem('beginner_qm_high', String(state.highScore));
      highScoreEl.textContent = state.highScore;
    }
  }

  function rand(min,max){ return Math.floor(Math.random()*(max-min+1))+min }

  function generateQuestion(){
    const mode = modeSel.value;
    let op = mode;
    if (op === 'mixed') {
      const arr = ['add','sub','mul','div'];
      op = arr[rand(0,arr.length-1)];
    }

    let a,b,question,answer,label;
    if (op === 'add') {
      a = rand(1,12); b = rand(1,12);
      answer = a + b; question = `${a} + ${b}`; label = 'Addition';
    } else if (op === 'sub') {
      a = rand(1,20); b = rand(1, Math.min(a,10));
      if (b > a) [a,b] = [b,a];
      answer = a - b; question = `${a} - ${b}`; label = 'Subtraction';
    } else if (op === 'mul') {
      a = rand(1,10); b = rand(1,10);
      answer = a * b; question = `${a} × ${b}`; label = 'Multiplication';
    } else {
      b = rand(1,10);
      const q = rand(1,10);
      a = b * q;
      answer = q; question = `${a} ÷ ${b}`; label = 'Division';
    }

    state.currentAnswer = answer;
    questionEl.textContent = question;
    opLabel.textContent = label;
    generateChoices(answer);
  }

  function generateChoices(correct){
    const choices = new Set([correct]);

    while (choices.size < 4) {
      let delta = rand(-3,3);
      if (delta === 0) delta = Math.random() > 0.5 ? 1 : -1;
      let cand = correct + delta;
      if (cand < 0) cand = Math.abs(cand) + rand(1,2);
      if (choices.has(cand)) cand = correct + rand(4,7);
      choices.add(cand);
    }

    const arr = Array.from(choices);
    for (let i = arr.length -1; i>0; i--){
      const j = Math.floor(Math.random()*(i+1));
      [arr[i],arr[j]] = [arr[j],arr[i]];
    }

    answersEl.innerHTML = '';
    arr.forEach(val => {
      const btn = document.createElement('button');
      btn.className = 'ans-btn';
      btn.textContent = val;
      btn.dataset.value = val;
      btn.addEventListener('click', answerClicked);
      answersEl.appendChild(btn);
    });
  }

  function answerClicked(e){
    if (!state.running) return;
    const btn = e.currentTarget;
    const val = Number(btn.dataset.value);

    Array.from(answersEl.querySelectorAll('button')).forEach(b => b.disabled = true);

    if (val === state.currentAnswer) {
      btn.classList.add('correct');
      state.score += 1;
      scoreEl.textContent = state.score;
    } else {
      btn.classList.add('wrong');
      state.lives -= 1;
      livesEl.textContent = state.lives;

      const correctBtn = Array.from(answersEl.querySelectorAll('button'))
        .find(b => Number(b.dataset.value) === state.currentAnswer);
      if (correctBtn) correctBtn.classList.add('correct');
    }

    state.roundsDone++;
    roundsDoneEl.textContent = state.roundsDone;
    updateProgressBar();

    setTimeout(() => {
      Array.from(answersEl.querySelectorAll('button')).forEach(b => { 
        b.className = 'ans-btn'; 
        b.disabled = false; 
      });
      if (state.lives <= 0) return endGame(false);
      if (!state.running) return;
      if (state.roundsDone >= state.roundCap) return endGame(true);
      generateQuestion();
    }, 400);
  }

  function startTimer(){
    clearInterval(state.timerId);
    state.timeLeft = state.totalTime;
    timeLeftEl.textContent = state.timeLeft;
    state.timerId = setInterval(() => {
      state.timeLeft--;
      timeLeftEl.textContent = state.timeLeft;
      updateProgressBar();
      if (state.timeLeft <= 0) {
        clearInterval(state.timerId);
        endGame(true);
      }
    }, 1000);
  }

  function stopTimer(){
    clearInterval(state.timerId);
  }

  function updateProgressBar(){
    const percent = Math.round(((state.totalTime - state.timeLeft) / state.totalTime) * 100);
    progressEl.style.width = percent + '%';
  }

  function startGame(){
    stopTimer();
    state.running = true;
    state.score = 0;
    state.roundsDone = 0;
    state.lives = 3;
    state.roundCap = parseInt(roundCapSel.value,10);

    scoreEl.textContent = '0';
    roundsDoneEl.textContent = '0';
    livesEl.textContent = state.lives;
    endPanel.style.display = 'none';

    startTimer();
    generateQuestion();
  }

  function endGame(byTime){
    state.running = false;
    stopTimer();
    saveHigh();

    Array.from(answersEl.querySelectorAll('button')).forEach(b => b.disabled = true);

    endPanel.style.display = 'block';
    if (byTime) {
      endText.innerHTML = `<strong>Time's up!</strong><br>Your score: <strong>${state.score}</strong>`;
    } else {
      endText.innerHTML = `<strong>Game Over</strong><br>Your score: <strong>${state.score}</strong> (out of ${state.roundsDone} attempts)`;
    }

    if (state.score >= state.highScore) {
      endText.innerHTML += `<br><em>New high score!</em>`;
    } else {
      endText.innerHTML += `<br>High score: <strong>${state.highScore}</strong>`;
    }
  }

  function exportResult(){
    const data = {
      date: new Date().toISOString(),
      score: state.score,
      highScore: state.highScore,
      roundsDone: state.roundsDone,
      mode: modeSel.value,
      timeLimit: state.totalTime
    };
    const blob = new Blob([JSON.stringify(data,null,2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; 
    a.download = 'beginner-quickmath-result.json';
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(url); a.remove(); }, 600);
  }

  resetHigh.addEventListener('click', () => {
    localStorage.removeItem('beginner_qm_high');
    state.highScore = 0;
    highScoreEl.textContent = 0;
  });

  startBtn.addEventListener('click', startGame);
  exportBtn.addEventListener('click', exportResult);

  loadHigh();
  generateQuestion();
})();
