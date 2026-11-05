/* worksheet.js —— 打印练习卷：按每行题数、题间空行排版成可打印文本 */
(function (global) {
  'use strict';

  const t = function (k, v) { return global.MEG.i18n.t(k, v); };

  function render(config) {
    const output = document.getElementById('output');
    const hint = document.getElementById('hint');
    const questions = global.MEG.core.generateQuestions(config);

    if (!questions.length) {
      output.textContent = '';
      hint.textContent = t('hint.range');
      return;
    }

    const perLine = Math.max(1, config.perLine);
    const blank = Math.max(0, config.blankLines);

    let text = '';
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      let line = (i + 1) + '. ' + global.MEG.core.formatExpr(q.expr) + ' =';
      if (config.printAnswer) line += ' ' + global.MEG.core.formatExpr(q.answer);
      text += line;

      if ((i + 1) % perLine === 0) {
        text += '\n' + '\n'.repeat(blank);
      } else {
        text += '\t\t';
      }
    }

    output.textContent = text;
    hint.textContent = questions.length < config.count
      ? t('hint.short', { n: questions.length, total: config.count })
      : '';
  }

  global.MEG = global.MEG || {};
  global.MEG.worksheet = { render: render };
})(window);
