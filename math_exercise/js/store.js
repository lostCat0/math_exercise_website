/* store.js —— 本地存储：练习历史、语言、上次配置 */
(function (global) {
  'use strict';

  const KEY_HISTORY = 'meg.history.v1';
  const KEY_LANG = 'meg.lang.v1';
  const KEY_CONFIG = 'meg.config.v1';
  const MAX_RECORDS = 50;

  /* localStorage 在 file:// 或隐私模式下可能不可用，降级为内存存储 */
  const memory = {};
  let available = true;
  try {
    const probe = '__meg_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
  } catch (e) {
    available = false;
  }

  function read(key, fallback) {
    try {
      const raw = available ? localStorage.getItem(key) : memory[key];
      if (raw == null) return fallback;
      return JSON.parse(raw);
    } catch (e) {
      return fallback;
    }
  }

  function write(key, value) {
    const raw = JSON.stringify(value);
    try {
      if (available) localStorage.setItem(key, raw);
      else memory[key] = raw;
    } catch (e) {
      memory[key] = raw;
    }
  }

  function getHistory() {
    const list = read(KEY_HISTORY, []);
    return Array.isArray(list) ? list : [];
  }

  function addRecord(record) {
    const list = getHistory();
    list.unshift(record);
    write(KEY_HISTORY, list.slice(0, MAX_RECORDS));
    return list.slice(0, MAX_RECORDS);
  }

  function clearHistory() {
    write(KEY_HISTORY, []);
  }

  function summarize(list) {
    const sessions = list.length;
    let questions = 0;
    let correct = 0;
    let answered = 0;
    let duration = 0;
    list.forEach(function (r) {
      questions += r.answered || 0;
      correct += r.correct || 0;
      answered += r.answered || 0;
      duration += r.duration || 0;
    });
    return {
      sessions: sessions,
      questions: questions,
      correct: correct,
      accuracy: answered ? Math.round((correct / answered) * 100) : 0,
      duration: duration
    };
  }

  global.MEG = global.MEG || {};
  global.MEG.store = {
    getHistory: getHistory,
    addRecord: addRecord,
    clearHistory: clearHistory,
    summarize: summarize,
    getLang: function () { return read(KEY_LANG, 'zh'); },
    setLang: function (lang) { write(KEY_LANG, lang); },
    getConfig: function () { return read(KEY_CONFIG, null); },
    setConfig: function (config) { write(KEY_CONFIG, config); }
  };
})(window);
