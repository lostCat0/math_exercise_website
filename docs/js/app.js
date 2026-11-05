/* app.js —— 入口：装配配置面板、标签页、语言切换与历史记录 */
(function (global) {
  'use strict';

  const $ = function (id) { return document.getElementById(id); };
  const i18n = global.MEG.i18n;
  const store = global.MEG.store;

  const FORM_INPUTS = ['count', 'minNum', 'maxNum', 'perLine', 'blankLines'];
  const FORM_CHECKS = ['allowMulDiv', 'allowParentheses', 'allowNegative',
    'allowRemainder', 'allowFraction', 'printAnswer'];

  const PRESETS = {
    easy: { minNum: 1, maxNum: 20, allowMulDiv: false, allowParentheses: false, allowNegative: false, allowRemainder: false, allowFraction: false },
    medium: { minNum: 1, maxNum: 100, allowMulDiv: true, allowParentheses: false, allowNegative: false, allowRemainder: false, allowFraction: false },
    hard: { minNum: 1, maxNum: 200, allowMulDiv: true, allowParentheses: true, allowNegative: true, allowRemainder: true, allowFraction: true }
  };

  const PRACTICE_MAX = 200;

  let els = {};
  let toastId = null;

  /* ---------------- 配置读写 ---------------- */
  function readConfig() {
    const intVal = function (id, def) {
      const v = parseInt($(id).value, 10);
      return isNaN(v) ? def : v;
    };
    const cfg = {
      count: intVal('count', 10),
      minNum: intVal('minNum', 0),
      maxNum: intVal('maxNum', 100),
      perLine: intVal('perLine', 2),
      blankLines: intVal('blankLines', 1)
    };
    FORM_CHECKS.forEach(function (id) { cfg[id] = $(id).checked; });

    cfg.count = Math.min(2000, Math.max(1, cfg.count));
    cfg.perLine = Math.min(5, Math.max(1, cfg.perLine));
    cfg.blankLines = Math.min(5, Math.max(0, cfg.blankLines));
    return cfg;
  }

  function fillForm(cfg) {
    if (!cfg) return;
    FORM_INPUTS.forEach(function (id) {
      if (cfg[id] != null) $(id).value = cfg[id];
    });
    FORM_CHECKS.forEach(function (id) {
      if (cfg[id] != null) $(id).checked = !!cfg[id];
    });
  }

  /* ---------------- 轻提示 ---------------- */
  function toast(msg) {
    let box = document.getElementById('toast');
    if (!box) {
      box = document.createElement('div');
      box.id = 'toast';
      box.className = 'toast';
      box.setAttribute('role', 'status');
      document.body.appendChild(box);
    }
    box.textContent = msg;
    box.classList.add('show');
    clearTimeout(toastId);
    toastId = setTimeout(function () { box.classList.remove('show'); }, 2600);
  }

  /* ---------------- 练习 ---------------- */
  function startPractice() {
    const cfg = readConfig();
    if (cfg.maxNum <= cfg.minNum) { toast(i18n.t('hint.range')); return; }
    if (cfg.count > PRACTICE_MAX) {
      cfg.count = PRACTICE_MAX;
      $('count').value = PRACTICE_MAX;
      toast(i18n.t('hint.cap', { n: PRACTICE_MAX }));
    }
    store.setConfig(cfg);
    global.MEG.practice.start(cfg);
    renderHistory();
  }

  /* ---------------- 练习卷 ---------------- */
  function renderWorksheet() {
    const cfg = readConfig();
    if (cfg.maxNum <= cfg.minNum) { toast(i18n.t('hint.range')); return; }
    store.setConfig(cfg);
    global.MEG.worksheet.render(cfg);
  }

  /* ---------------- 标签页 ---------------- */
  function switchTab(name) {
    document.querySelectorAll('.tab').forEach(function (btn) {
      const on = btn.getAttribute('data-tab') === name;
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    els.viewPractice.classList.toggle('hidden', name !== 'practice');
    els.viewWorksheet.classList.toggle('hidden', name !== 'worksheet');
    if (name === 'worksheet') renderWorksheet();
  }

  /* ---------------- 历史记录 ---------------- */
  function statCell(label, value) {
    const cell = document.createElement('div');
    cell.className = 'result-cell';
    const k = document.createElement('span');
    k.className = 'result-k';
    k.textContent = label;
    const v = document.createElement('span');
    v.className = 'result-v';
    v.textContent = value;
    cell.appendChild(k);
    cell.appendChild(v);
    return cell;
  }

  function renderHistory() {
    const list = store.getHistory();
    const box = els.historyStats;
    box.innerHTML = '';
    els.historyBody.innerHTML = '';

    const hasData = list.length > 0;
    els.historyTable.classList.toggle('hidden', !hasData);
    els.historyEmpty.classList.toggle('hidden', hasData);

    if (!hasData) return;

    const sum = store.summarize(list);
    box.appendChild(statCell(i18n.t('history.sessions'), String(sum.sessions)));
    box.appendChild(statCell(i18n.t('history.totalQuestions'), String(sum.questions)));
    box.appendChild(statCell(i18n.t('history.avgAccuracy'), sum.accuracy + '%'));
    box.appendChild(statCell(i18n.t('history.totalTime'), global.MEG.core.formatDuration(sum.duration)));

    const locale = i18n.getLang() === 'en' ? 'en-US' : 'zh-CN';
    const body = els.historyBody;
    body.innerHTML = '';
    list.forEach(function (r) {
      const tr = document.createElement('tr');
      const cells = [
        new Date(r.ts).toLocaleString(locale, {
          year: 'numeric', month: '2-digit', day: '2-digit',
          hour: '2-digit', minute: '2-digit'
        }),
        String(r.answered) + (r.answered !== r.total ? ' / ' + r.total : ''),
        String(r.correct),
        r.accuracy + '%',
        global.MEG.core.formatDuration(r.duration)
      ];
      cells.forEach(function (text) {
        const td = document.createElement('td');
        td.textContent = text;
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  }

  /* ---------------- 事件绑定 ---------------- */
  function bind() {
    $('langBtn').addEventListener('click', function () {
      const next = i18n.getLang() === 'en' ? 'zh' : 'en';
      i18n.setLang(next);
      store.setLang(next);
    });

    document.querySelectorAll('.tab').forEach(function (btn) {
      btn.addEventListener('click', function () {
        switchTab(btn.getAttribute('data-tab'));
      });
    });

    document.querySelectorAll('[data-preset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        fillForm(PRESETS[btn.getAttribute('data-preset')]);
        startPractice();
        switchTab('practice');
      });
    });

    $('btnRestart').addEventListener('click', startPractice);
    $('btnFinish').addEventListener('click', function () { global.MEG.practice.finish(true); });
    $('btnGenerate').addEventListener('click', renderWorksheet);
    $('btnPrint').addEventListener('click', function () { window.print(); });

    $('btnClearHistory').addEventListener('click', function () {
      if (!store.getHistory().length) return;
      if (!window.confirm(i18n.t('history.clearConfirm'))) return;
      store.clearHistory();
      renderHistory();
    });

    FORM_INPUTS.concat(FORM_CHECKS).forEach(function (id) {
      $(id).addEventListener('change', function () { store.setConfig(readConfig()); });
    });

    i18n.onChange(function () {
      global.MEG.practice.refresh();
      renderHistory();
      if (!els.viewWorksheet.classList.contains('hidden')) renderWorksheet();
    });
  }

  /* ---------------- 启动 ---------------- */
  function boot() {
    els = {
      viewPractice: $('viewPractice'),
      viewWorksheet: $('viewWorksheet'),
      historyStats: $('historyStats'),
      historyTable: $('historyTable'),
      historyBody: $('historyBody'),
      historyEmpty: $('historyEmpty')
    };

    const savedLang = store.getLang();
    i18n.setLang(savedLang, true);

    const savedConfig = store.getConfig();
    fillForm(savedConfig);
    if (savedConfig) $('count').value = Math.min(PRACTICE_MAX, savedConfig.count || 10);

    global.MEG.practice.init({
      list: $('qList'),
      empty: $('practiceEmpty'),
      progress: $('statProgress'),
      correct: $('statCorrect'),
      accuracy: $('statAccuracy'),
      time: $('statTime'),
      fill: $('progressFill'),
      result: $('resultPanel'),
      btnFinish: $('btnFinish'),
      onRestart: startPractice,
      onRecord: renderHistory
    });

    bind();
    startPractice();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})(window);
