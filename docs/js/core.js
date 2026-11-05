/* core.js —— 分数、四则运算、题目生成与答案判定（与界面无关） */
(function (global) {
  'use strict';

  /* ---------------- 分数 ---------------- */
  class Fraction {
    constructor(num, den) {
      if (den === 0) throw new Error('denominator must not be 0');
      if (den < 0) { num = -num; den = -den; }
      const g = Fraction.gcd(Math.abs(num), den) || 1;
      this.num = num / g;
      this.den = den / g;
    }
    static gcd(a, b) {
      while (b !== 0) { const t = b; b = a % b; a = t; }
      return a === 0 ? 1 : a;
    }
    add(o) { return new Fraction(this.num * o.den + o.num * this.den, this.den * o.den); }
    sub(o) { return new Fraction(this.num * o.den - o.num * this.den, this.den * o.den); }
    mul(o) { return new Fraction(this.num * o.num, this.den * o.den); }
    div(o) {
      if (o.num === 0) throw new Error('division by zero');
      return new Fraction(this.num * o.den, this.den * o.num);
    }
    isZero() { return this.num === 0; }
    equals(o) { return this.num * o.den === o.num * this.den; }
    toString() { return this.den === 1 ? String(this.num) : this.num + '/' + this.den; }
  }

  function toFraction(n) {
    return n instanceof Fraction ? n : new Fraction(n, 1);
  }

  /* ---------------- 答案解析：支持 12 / -3 / 3/4 / 0.75 / 3...1 ---------------- */
  function parseRemainder(text) {
    const s = String(text).trim().replace(/\s+/g, '');
    const m = /^(-?\d+)(?:\.{2,}|…+|余|r)(-?\d+)$/i.exec(s);
    return m ? { q: Number(m[1]), r: Number(m[2]) } : null;
  }

  function parseNumber(text) {
    if (text == null) return null;
    const s = String(text).trim().replace(/\s+/g, '');
    if (!s) return null;

    let m = /^(-?\d+)\/(\d+)$/.exec(s);
    if (m) {
      const den = parseInt(m[2], 10);
      if (!den) return null;
      return new Fraction(parseInt(m[1], 10), den);
    }
    if (/^-?\d+$/.test(s)) return new Fraction(parseInt(s, 10), 1);
    if (/^-?\d*\.\d+$/.test(s)) {
      const neg = s.charAt(0) === '-';
      const body = neg ? s.slice(1) : s;
      const parts = body.split('.');
      const intPart = parts[0] || '0';
      const fracPart = parts[1];
      const den = Math.pow(10, fracPart.length);
      const num = parseInt(intPart, 10) * den + parseInt(fracPart, 10);
      return new Fraction(neg ? -num : num, den);
    }
    return null;
  }

  function equalsAnswer(input, answer) {
    const wantRem = parseRemainder(answer);
    if (wantRem) {
      const gotRem = parseRemainder(input);
      return !!gotRem && gotRem.q === wantRem.q && gotRem.r === wantRem.r;
    }
    const a = parseNumber(input);
    const b = parseNumber(answer);
    if (!a || !b) return false;
    return a.equals(b);
  }

  /* ---------------- 显示美化：运算符间距替换，分数 3/2 保持原样 ---------------- */
  function formatExpr(expr) {
    return String(expr)
      .replace(/ \* /g, ' × ')
      .replace(/ \/ /g, ' ÷ ')
      .replace(/ - /g, ' − ');
  }

  function formatDuration(ms) {
    const total = Math.max(0, Math.round(ms / 1000));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
  }

  /* ---------------- 默认配置 ---------------- */
  const DEFAULT_CONFIG = {
    count: 10,
    minNum: 0,
    maxNum: 100,
    perLine: 2,
    blankLines: 1,
    allowMulDiv: true,
    allowParentheses: false,
    allowNegative: false,
    allowRemainder: false,
    allowFraction: false,
    printAnswer: false
  };

  /* ---------------- 生成引擎 ---------------- */
  const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  function randomOperator(config) {
    const ops = config.allowMulDiv ? ['+', '-', '*', '/'] : ['+', '-'];
    return ops[randInt(0, ops.length - 1)];
  }

  function randomNumber(config) {
    if (config.allowFraction && Math.random() < 0.5) {
      const den = randInt(1, 9);
      const num = randInt(0, den * 10);
      return new Fraction(num, den);
    }
    return randInt(config.minNum, config.maxNum);
  }

  function calculate(a, b, op, config) {
    if (a instanceof Fraction || b instanceof Fraction) {
      const fa = toFraction(a);
      const fb = toFraction(b);
      try {
        switch (op) {
          case '+': return fa.add(fb);
          case '-': return fa.sub(fb);
          case '*': return fa.mul(fb);
          case '/': return fb.isZero() ? null : fa.div(fb);
          default: return null;
        }
      } catch (e) { return null; }
    }

    let res;
    switch (op) {
      case '+': res = a + b; break;
      case '-':
        res = a - b;
        if (res < 0 && !config.allowNegative) return null;
        break;
      case '*': res = a * b; break;
      case '/':
        if (b === 0) return null;
        /* 不整除一律不在此处截断：要么由调用方按「商...余数」处理，要么丢弃该题 */
        if (a % b !== 0) return null;
        res = Math.trunc(a / b);
        if (res < 0 && !config.allowNegative) return null;
        break;
      default: return null;
    }
    if (res < config.minNum || res > config.maxNum) return null;
    return res;
  }

  function isInRange(answer, config) {
    if (String(answer).indexOf('/') >= 0) return true;
    const v = parseInt(answer, 10);
    if (isNaN(v)) return false;
    return v >= config.minNum && v <= config.maxNum;
  }

  /* 不整除且允许余数时，按小学写法给出「商...余数」 */
  function remainderAnswer(a, b, config) {
    if (!config.allowRemainder) return null;
    if (typeof a !== 'number' || a < 0 || b <= 0) return null;
    if (a % b === 0) return null;
    const q = Math.trunc(a / b);
    const r = a - q * b;
    if (q < config.minNum || q > config.maxNum) return null;
    return q + '...' + r;
  }

  /* 计算最后一步；整数除法不整除时尝试余数写法 */
  function compose(a, b, op, config) {
    const r = calculate(a, b, op, config);
    if (r !== null) return r.toString();
    if (op === '/') return remainderAnswer(a, b, config);
    return null;
  }

  function generateOne(config) {
    const isHigh = function (op) { return op === '*' || op === '/'; };

    /* 允许余数时，穿插两位数除法：45 ÷ 7 = 6...3 */
    if (config.allowRemainder && Math.random() < 0.35) {
      const den = randInt(2, 9);
      const lo = Math.max(config.minNum, den);
      const hi = Math.max(config.maxNum, den + 1);
      const num = randInt(lo, hi);
      if (num % den !== 0) {
        const q2 = Math.trunc(num / den);
        const r2 = num - q2 * den;
        if (q2 >= config.minNum && q2 <= config.maxNum) {
          const e2 = num + ' / ' + den;
          return { expr: e2, answer: q2 + '...' + r2, key: e2.replace(/\s+/g, '') };
        }
      }
      return null;
    }

    const useParen = config.allowParentheses && Math.random() < 0.5;
    const a = randomNumber(config);
    const b = randomNumber(config);
    const c = randomNumber(config);
    const op1 = randomOperator(config);
    const op2 = randomOperator(config);

    let expr;
    let mid;
    let answer;

    /* 乘除遇到 0 的题目没有练习价值（如 82 × 0），直接丢弃 */
    const isZero = function (x) { return x instanceof Fraction ? x.num === 0 : x === 0; };
    if ((isHigh(op1) && (isZero(a) || isZero(b))) || (isHigh(op2) && (isZero(b) || isZero(c)))) {
      return null;
    }

    /* 分数操作数加括号，避免 42 / 3/2 这类歧义写法 */
    const show = function (x) {
      return x instanceof Fraction && x.den !== 1 ? '(' + x + ')' : String(x);
    };

    if (useParen) {
      /* 显式括号：( a op1 b ) op2 c */
      expr = '( ' + show(a) + ' ' + op1 + ' ' + show(b) + ' ) ' + op2 + ' ' + show(c);
      mid = calculate(a, b, op1, config);
      if (mid === null) return null;
      answer = compose(mid, c, op2, config);
    } else {
      /* 不写括号时按数学惯例求值：先乘除后加减 */
      expr = show(a) + ' ' + op1 + ' ' + show(b) + ' ' + op2 + ' ' + show(c);
      if (isHigh(op2) && !isHigh(op1)) {
        mid = calculate(b, c, op2, config);
        if (mid === null) return null;
        answer = compose(a, mid, op1, config);
      } else {
        mid = calculate(a, b, op1, config);
        if (mid === null) return null;
        answer = compose(mid, c, op2, config);
      }
    }

    if (answer === null) return null;
    if (answer.indexOf('...') < 0 && !isInRange(answer, config)) return null;

    return { expr: expr, answer: answer, key: expr.replace(/\s+/g, '') };
  }

  function generateQuestions(rawConfig) {
    const config = Object.assign({}, DEFAULT_CONFIG, rawConfig || {});
    if (config.maxNum < config.minNum) return [];

    const count = Math.max(1, Math.min(2000, parseInt(config.count, 10) || 10));
    const seen = new Set();
    const result = [];
    const maxAttempts = count * 200;
    let attempts = 0;

    while (result.length < count && attempts < maxAttempts) {
      attempts++;
      const q = generateOne(config);
      if (!q) continue;
      if (seen.has(q.key)) continue;
      seen.add(q.key);
      result.push(q);
    }
    return result;
  }

  global.MEG = global.MEG || {};
  global.MEG.core = {
    Fraction: Fraction,
    parseNumber: parseNumber,
    equalsAnswer: equalsAnswer,
    formatExpr: formatExpr,
    formatDuration: formatDuration,
    DEFAULT_CONFIG: DEFAULT_CONFIG,
    generateQuestions: generateQuestions
  };
})(window);
