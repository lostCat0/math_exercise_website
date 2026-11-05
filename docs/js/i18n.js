/* i18n.js —— 中英文文案表与界面翻译 */
(function (global) {
  'use strict';

  var DICT = {
    zh: {
      'app.title': '四则运算练习',
      'app.subtitle': '小学数学 · 在线做题、实时批改',
      'lang.toggle': 'EN',
      'tab.practice': '在线练习',
      'tab.worksheet': '打印练习卷',

      'config.title': '出题设置',
      'preset.easy': '简单',
      'preset.medium': '中等',
      'preset.hard': '困难',
      'config.count': '题目数量',
      'config.min': '数值下限',
      'config.max': '数值上限',
      'config.perLine': '每行题数',
      'config.blankLines': '题间空行',
      'config.allowMulDiv': '允许乘除法',
      'config.allowParentheses': '允许括号',
      'config.allowNegative': '允许负数',
      'config.allowRemainder': '允许余数',
      'config.allowFraction': '支持分数',
      'config.printAnswer': '打印答案',

      'practice.progress': '进度',
      'practice.correct': '答对',
      'practice.accuracy': '准确率',
      'practice.time': '用时',
      'practice.timerHint': '计时从第一次作答开始',
      'practice.questionN': '第 {n} 题',

      'btn.finish': '结束并查看结果',
      'btn.newSet': '再来一组',
      'btn.regenerate': '重新出题',
      'btn.print': '打印',
      'btn.clearHistory': '清空历史',
      'btn.again': '再来一组',

      'placeholder.answer': '答案',
      'placeholder.fraction': '如 3/4',
      'placeholder.remainder': '如 3...1',

      'state.correct': '答对了',
      'state.wrong': '再看看，答错了',
      'state.corrected': '已订正',

      'hint.none': '未能生成任何题目，请放宽限制条件后重试。',
      'hint.short': '注意：只生成了 {n} 道不重复的题目（目标 {total} 道）。',
      'hint.range': '数值上限必须大于下限。',
      'hint.cap': '在线练习每组最多 {n} 题，已自动调整。',

      'worksheet.hint': '生成后可打印成练习卷，打印时自动隐藏设置区与按钮。',

      'result.title': '本组完成',
      'result.total': '题目数',
      'result.correct': '一次答对',
      'result.accuracy': '准确率',
      'result.time': '总用时',
      'result.avg': '平均每题',
      'result.correctedNote': '其中 {n} 道经过订正',
      'result.allRight': '全部答对，真棒！',
      'result.review': '逐题回顾',
      'result.yourAnswer': '你的答案',
      'result.correctAnswer': '正确答案',
      'result.unanswered': '未作答',
      'result.earlyNote': '还有 {n} 道题未作答，已按已完成部分统计。',

      'history.title': '历史记录',
      'history.empty': '还没有练习记录，开始做第一组吧。',
      'history.date': '时间',
      'history.count': '题数',
      'history.correct': '答对',
      'history.accuracy': '准确率',
      'history.duration': '用时',
      'history.sessions': '练习次数',
      'history.totalQuestions': '累计题数',
      'history.avgAccuracy': '平均准确率',
      'history.totalTime': '累计用时',
      'history.clearConfirm': '确定清空全部历史记录？此操作不可撤销。',

      'unit.times': '次',
      'unit.questions': '题'
    },

    en: {
      'app.title': 'Arithmetic Practice',
      'app.subtitle': 'Primary math · practice online with instant feedback',
      'lang.toggle': '中文',
      'tab.practice': 'Practice',
      'tab.worksheet': 'Printable worksheet',

      'config.title': 'Question settings',
      'preset.easy': 'Easy',
      'preset.medium': 'Medium',
      'preset.hard': 'Hard',
      'config.count': 'Questions',
      'config.min': 'Min value',
      'config.max': 'Max value',
      'config.perLine': 'Per line',
      'config.blankLines': 'Blank lines',
      'config.allowMulDiv': 'Allow × and ÷',
      'config.allowParentheses': 'Allow brackets',
      'config.allowNegative': 'Allow negatives',
      'config.allowRemainder': 'Allow remainders',
      'config.allowFraction': 'Allow fractions',
      'config.printAnswer': 'Print answers',

      'practice.progress': 'Progress',
      'practice.correct': 'Correct',
      'practice.accuracy': 'Accuracy',
      'practice.time': 'Time',
      'practice.timerHint': 'Timer starts with your first answer',
      'practice.questionN': 'Question {n}',

      'btn.finish': 'Finish & review',
      'btn.newSet': 'New set',
      'btn.regenerate': 'Regenerate',
      'btn.print': 'Print',
      'btn.clearHistory': 'Clear history',
      'btn.again': 'New set',

      'placeholder.answer': 'Answer',
      'placeholder.fraction': 'e.g. 3/4',
      'placeholder.remainder': 'e.g. 3...1',

      'state.correct': 'Correct',
      'state.wrong': 'Not quite, try again',
      'state.corrected': 'Corrected',

      'hint.none': 'No questions could be generated. Please relax the settings.',
      'hint.short': 'Note: only {n} unique questions generated (target {total}).',
      'hint.range': 'Max value must be greater than min value.',
      'hint.cap': 'Practice sets are limited to {n} questions; adjusted automatically.',

      'worksheet.hint': 'Generate a sheet and print it — settings and buttons are hidden when printing.',

      'result.title': 'Set complete',
      'result.total': 'Questions',
      'result.correct': 'First-try correct',
      'result.accuracy': 'Accuracy',
      'result.time': 'Total time',
      'result.avg': 'Average',
      'result.correctedNote': '{n} fixed after a wrong attempt',
      'result.allRight': 'All correct. Nice work!',
      'result.review': 'Question review',
      'result.yourAnswer': 'Your answer',
      'result.correctAnswer': 'Answer',
      'result.unanswered': 'Not answered',
      'result.earlyNote': '{n} question(s) left unanswered; stats cover what you did.',

      'history.title': 'History',
      'history.empty': 'No practice yet — start your first set.',
      'history.date': 'Date',
      'history.count': 'Questions',
      'history.correct': 'Correct',
      'history.accuracy': 'Accuracy',
      'history.duration': 'Time',
      'history.sessions': 'Sessions',
      'history.totalQuestions': 'Questions done',
      'history.avgAccuracy': 'Avg. accuracy',
      'history.totalTime': 'Total time',
      'history.clearConfirm': 'Clear all history? This cannot be undone.',

      'unit.times': 'sessions',
      'unit.questions': 'questions'
    }
  };

  var lang = 'zh';
  var listeners = [];

  function t(key, vars) {
    var table = DICT[lang] || DICT.zh;
    var s = table[key];
    if (s == null) s = DICT.zh[key];
    if (s == null) return key;
    if (vars && typeof vars === 'object') {
      s = s.replace(/\{(\w+)\}/g, function (m, k) {
        return vars[k] != null ? vars[k] : m;
      });
    }
    return s;
  }

  function apply() {
    document.documentElement.lang = lang === 'en' ? 'en' : 'zh-CN';
    document.title = t('app.title');

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(function (el) {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria')));
    });
  }

  function setLang(next, silent) {
    lang = next === 'en' ? 'en' : 'zh';
    apply();
    if (!silent) {
      listeners.forEach(function (fn) {
        try { fn(lang); } catch (e) { /* 单个订阅出错不影响其它模块 */ }
      });
    }
  }

  function onChange(fn) {
    if (typeof fn === 'function') listeners.push(fn);
  }

  global.MEG = global.MEG || {};
  global.MEG.i18n = {
    t: t,
    apply: apply,
    setLang: setLang,
    getLang: function () { return lang; },
    onChange: onChange
  };
})(window);
