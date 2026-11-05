/* practice.js —— 在线练习：计时、实时批改、进度统计、结果复盘 */
(function (global) {
  'use strict';

  const t = function (k, v) { return global.MEG.i18n.t(k, v); };

  let state = null;
  let els = {};
  let tickId = null;
  const debounce = {};

  function init(refs) {
    els = refs;
  }

  /* ---------------- 计时 ---------------- */
  function ensureTimer() {
    if (!state || state.finished || state.started) return;
    state.started = Date.now();
    tickId = setInterval(tick, 500);
    tick();
  }

  function tick() {
    if (!state || state.finished) return;
    state.elapsed = Date.now() - state.started;
    els.time.textContent = global.MEG.core.formatDuration(state.elapsed);
  }

  function stopTimer() {
    if (tickId) { clearInterval(tickId); tickId = null; }
  }

  /* ---------------- 开始一组 ---------------- */
  function start(config) {
    stopTimer();
    Object.keys(debounce).forEach(function (k) { clearTimeout(debounce[k]); });

    const questions = global.MEG.core.generateQuestions(config);
    state = {
      questions: questions,
      answers: questions.map(function () { return ''; }),
      status: questions.map(function () { return 'idle'; }),
      nodes: [],
      started: 0,
      elapsed: 0,
      finished: false,
      config: config,
      lastRecord: null
    };

    els.result.classList.add('hidden');
    els.result.innerHTML = '';
    els.time.textContent = '00:00';
    els.btnFinish.disabled = false;
    els.empty.classList.toggle('hidden', questions.length > 0);

    rebuild();
    updateStats();
  }

  /* ---------------- 渲染题目行 ---------------- */
  function rebuild() {
    els.list.innerHTML = '';
    state.nodes = [];
    state.questions.forEach(function (q, i) {
      els.list.appendChild(buildRow(q, i));
    });
  }

  function buildRow(q, i) {
    const li = document.createElement('li');
    li.className = 'q-row';

    const no = document.createElement('span');
    no.className = 'q-no';
    no.textContent = String(i + 1);

    const expr = document.createElement('span');
    expr.className = 'q-expr';
    expr.textContent = global.MEG.core.formatExpr(q.expr) + ' =';

    const input = document.createElement('input');
    input.className = 'q-input';
    input.type = 'text';
    input.autocomplete = 'off';
    input.spellcheck = false;
    input.inputMode = 'text';
    input.setAttribute('aria-label', t('practice.questionN', { n: i + 1 }));
    input.placeholder = q.answer.indexOf('...') >= 0
      ? t('placeholder.remainder')
      : (q.answer.indexOf('/') >= 0 ? t('placeholder.fraction') : t('placeholder.answer'));
    input.value = state.answers[i] || '';

    const mark = document.createElement('span');
    mark.className = 'q-mark';

    li.appendChild(no);
    li.appendChild(expr);
    li.appendChild(input);
    li.appendChild(mark);

    input.addEventListener('input', function (e) {
      state.answers[i] = e.target.value;
      ensureTimer();
      clearTimeout(debounce[i]);
      debounce[i] = setTimeout(function () { autoCheck(i); }, 350);
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(debounce[i]);
        judge(i);
      }
    });

    input.addEventListener('blur', function () {
      clearTimeout(debounce[i]);
      judge(i);
    });

    state.nodes[i] = { li: li, input: input, mark: mark };
    paint(i);
    return li;
  }

  /* ---------------- 状态绘制 ---------------- */
  function paint(i) {
    const st = state.status[i];
    const node = state.nodes[i];
    if (!node) return;

    node.li.className = 'q-row' +
      (st === 'correct' ? ' is-correct' : '') +
      (st === 'wrong' ? ' is-wrong' : '') +
      (st === 'corrected' ? ' is-corrected' : '');

    node.mark.textContent = (st === 'correct' || st === 'corrected') ? '✓' : (st === 'wrong' ? '✕' : '');
    node.mark.title = st === 'idle' ? '' : t('state.' + st);
    node.mark.setAttribute('aria-label', node.mark.title);

    const locked = st === 'correct' || st === 'corrected';
    node.input.readOnly = locked;
    node.input.classList.toggle('is-locked', locked);
  }

  function paintAll() {
    state.status.forEach(function (_, i) { paint(i); });
  }

  /* ---------------- 判定 ---------------- */
  function autoCheck(i) {
    if (!state || state.finished) return;
    if (state.status[i] === 'correct' || state.status[i] === 'corrected') return;
    const val = (state.answers[i] || '').trim();
    if (!val) return;
    if (global.MEG.core.equalsAnswer(val, state.questions[i].answer)) accept(i);
  }

  function judge(i) {
    if (!state || state.finished) return;
    const st = state.status[i];
    if (st === 'correct' || st === 'corrected') return;

    const val = (state.answers[i] || '').trim();
    if (!val) return;

    if (global.MEG.core.equalsAnswer(val, state.questions[i].answer)) accept(i);
    else markWrong(i);
  }

  function accept(i) {
    state.status[i] = state.status[i] === 'wrong' ? 'corrected' : 'correct';
    paint(i);
    updateStats();
    focusNext(i);
    maybeFinish();
  }

  function markWrong(i) {
    if (state.status[i] === 'wrong') return;
    state.status[i] = 'wrong';
    paint(i);
    updateStats();
  }

  function focusNext(from) {
    for (let k = from + 1; k < state.status.length; k++) {
      if (state.status[k] === 'idle') {
        const node = state.nodes[k];
        if (node) node.input.focus();
        return;
      }
    }
    for (let k = 0; k < from; k++) {
      if (state.status[k] === 'idle') {
        const node = state.nodes[k];
        if (node) node.input.focus();
        return;
      }
    }
  }

  /* ---------------- 统计 ---------------- */
  function stats() {
    const s = state.status;
    return {
      total: s.length,
      answered: s.filter(function (x) { return x !== 'idle'; }).length,
      correct: s.filter(function (x) { return x === 'correct'; }).length,
      corrected: s.filter(function (x) { return x === 'corrected'; }).length,
      wrong: s.filter(function (x) { return x === 'wrong'; }).length
    };
  }

  function updateStats() {
    if (!state) return;
    const st = stats();
    els.progress.textContent = st.answered + ' / ' + st.total;
    els.correct.textContent = String(st.correct);
    els.accuracy.textContent = st.answered
      ? Math.round((st.correct / st.answered) * 100) + '%'
      : '—';
    els.fill.style.width = st.total ? (st.answered / st.total) * 100 + '%' : '0%';
  }

  function maybeFinish() {
    if (!state || state.finished) return;
    if (state.status.every(function (s) { return s !== 'idle'; })) finish(false);
  }

  /* ---------------- 结束与复盘 ---------------- */
  function finish(early) {
    if (!state || state.finished) return;
    state.finished = true;
    stopTimer();
    if (state.started) state.elapsed = Date.now() - state.started;
    els.time.textContent = global.MEG.core.formatDuration(state.elapsed);
    els.btnFinish.disabled = true;

    state.nodes.forEach(function (node) { if (node) node.input.readOnly = true; });

    const st = stats();
    const record = {
      ts: Date.now(),
      total: st.total,
      answered: st.answered,
      correct: st.correct,
      corrected: st.corrected,
      wrong: st.wrong,
      accuracy: st.answered ? Math.round((st.correct / st.answered) * 100) : 0,
      duration: state.elapsed,
      early: !!early
    };
    state.lastRecord = record;

    if (st.answered > 0) {
      global.MEG.store.addRecord(record);
      if (els.onRecord) els.onRecord();
    }
    renderResult(record);
    updateStats();
    els.result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function renderResult(record) {
    const box = els.result;
    box.innerHTML = '';
    box.classList.remove('hidden');
    if (!record) return;

    const h = document.createElement('h3');
    h.textContent = t('result.title');
    box.appendChild(h);

    const avg = record.answered ? record.duration / record.answered : 0;
    const items = [
      [t('result.total'), String(record.total)],
      [t('result.correct'), String(record.correct)],
      [t('result.accuracy'), record.accuracy + '%'],
      [t('result.time'), global.MEG.core.formatDuration(record.duration)],
      [t('result.avg'), global.MEG.core.formatDuration(Math.max(1000, avg))]
    ];

    const grid = document.createElement('div');
    grid.className = 'result-grid';
    items.forEach(function (pair) {
      const cell = document.createElement('div');
      cell.className = 'result-cell';
      const k = document.createElement('span');
      k.className = 'result-k';
      k.textContent = pair[0];
      const v = document.createElement('span');
      v.className = 'result-v';
      v.textContent = pair[1];
      cell.appendChild(k);
      cell.appendChild(v);
      grid.appendChild(cell);
    });
    box.appendChild(grid);

    const notes = document.createElement('div');
    notes.className = 'result-notes';
    if (record.corrected > 0) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = t('result.correctedNote', { n: record.corrected });
      notes.appendChild(p);
    }
    const unanswered = record.total - record.answered;
    if (unanswered > 0) {
      const p = document.createElement('p');
      p.className = 'muted';
      p.textContent = t('result.earlyNote', { n: unanswered });
      notes.appendChild(p);
    }
    if (record.correct === record.answered && record.answered > 0 && unanswered === 0) {
      const p = document.createElement('p');
      p.className = 'result-praise';
      p.textContent = t('result.allRight');
      notes.appendChild(p);
    }
    box.appendChild(notes);

    const rt = document.createElement('h4');
    rt.textContent = t('result.review');
    box.appendChild(rt);

    const list = document.createElement('ol');
    list.className = 'review';
    state.questions.forEach(function (q, i) {
      const st = state.status[i];
      const li = document.createElement('li');
      li.className = 'review-row' +
        (st === 'correct' ? ' is-correct' : '') +
        (st === 'wrong' ? ' is-wrong' : '') +
        (st === 'corrected' ? ' is-corrected' : '');

      const ex = document.createElement('span');
      ex.className = 'review-expr';
      ex.textContent = (i + 1) + '. ' + global.MEG.core.formatExpr(q.expr) + ' =';

      const yours = document.createElement('span');
      yours.className = 'review-user';
      const val = (state.answers[i] || '').trim();
      yours.textContent = val || t('result.unanswered');

      li.appendChild(ex);
      li.appendChild(yours);

      if (st !== 'correct') {
        const ans = document.createElement('span');
        ans.className = 'review-ans';
        ans.textContent = t('result.correctAnswer') + ' ' + global.MEG.core.formatExpr(q.answer);
        li.appendChild(ans);
      }
      list.appendChild(li);
    });
    box.appendChild(list);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'btn';
    btn.textContent = t('btn.again');
    btn.addEventListener('click', function () {
      if (els.onRestart) els.onRestart();
    });
    box.appendChild(btn);
  }

  /* ---------------- 语言切换后重绘 ---------------- */
  function refresh() {
    if (!state) return;
    rebuild();
    paintAll();
    updateStats();
    els.time.textContent = global.MEG.core.formatDuration(state.elapsed || 0);
    if (state.finished) renderResult(state.lastRecord);
  }

  global.MEG = global.MEG || {};
  global.MEG.practice = {
    init: init,
    start: start,
    finish: finish,
    refresh: refresh,
    hasState: function () { return !!state; }
  };
})(window);
