(function () {
  const resultEl = document.getElementById('result');
  const expressionEl = document.getElementById('expression');
  const opButtons = document.querySelectorAll('[data-op]');

  let display = '0';
  let previousValue = null;
  let operator = null;
  let waitingForOperand = false;
  let justEvaluated = false;

  const MAX_DIGITS = 12;

  function formatNumber(numStr) {
    if (numStr === 'Error') return numStr;
    const num = Number(numStr);
    if (!isFinite(num)) return 'Error';
    let str = String(num);
    if (str.length > MAX_DIGITS) {
      str = num.toPrecision(8);
      str = Number(str).toString();
    }
    return str;
  }

  function render() {
    resultEl.textContent = formatNumber(display);
    if (operator && previousValue !== null) {
      expressionEl.textContent = `${formatNumber(String(previousValue))} ${operator}`;
    } else {
      expressionEl.textContent = '\u00A0';
    }
    opButtons.forEach(btn => {
      btn.classList.toggle('is-active', operator === btn.dataset.op && waitingForOperand);
    });
  }

  function inputDigit(digit) {
    if (waitingForOperand || justEvaluated) {
      display = digit;
      waitingForOperand = false;
      justEvaluated = false;
    } else {
      display = display === '0' ? digit : display + digit;
    }
    if (display.replace('-', '').replace('.', '').length > MAX_DIGITS) {
      display = display.slice(0, -1);
    }
    render();
  }

  function inputDecimal() {
    if (waitingForOperand || justEvaluated) {
      display = '0.';
      waitingForOperand = false;
      justEvaluated = false;
    } else if (!display.includes('.')) {
      display += '.';
    }
    render();
  }

  function backspace() {
    if (waitingForOperand || justEvaluated) return;
    display = display.length > 1 ? display.slice(0, -1) : '0';
    render();
  }

  function allClear() {
    display = '0';
    previousValue = null;
    operator = null;
    waitingForOperand = false;
    justEvaluated = false;
    render();
  }

  function percent() {
    const val = parseFloat(display);
    if (isNaN(val)) return;
    display = String(val / 100);
    render();
  }

  function calculate(a, b, op) {
    switch (op) {
      case '+': return a + b;
      case '−': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? NaN : a / b;
      default: return b;
    }
  }

  function setOperator(nextOp) {
    const inputValue = parseFloat(display);

    if (operator && waitingForOperand) {
      operator = nextOp;
      render();
      return;
    }

    if (previousValue === null) {
      previousValue = inputValue;
    } else if (operator) {
      const outcome = calculate(previousValue, inputValue, operator);
      if (isNaN(outcome) || !isFinite(outcome)) {
        display = 'Error';
        previousValue = null;
        operator = null;
        waitingForOperand = true;
        justEvaluated = true;
        render();
        return;
      }
      previousValue = outcome;
      display = String(outcome);
    }

    waitingForOperand = true;
    justEvaluated = false;
    operator = nextOp;
    render();
  }

  function equals() {
    if (operator === null || previousValue === null) return;
    const inputValue = parseFloat(display);
    const outcome = calculate(previousValue, inputValue, operator);

    if (isNaN(outcome) || !isFinite(outcome)) {
      display = 'Error';
    } else {
      display = String(outcome);
    }

    previousValue = null;
    operator = null;
    waitingForOperand = false;
    justEvaluated = true;
    render();
  }

  document.querySelector('.keys').addEventListener('click', (e) => {
    const btn = e.target.closest('button.key');
    if (!btn) return;

    if (btn.dataset.digit !== undefined) {
      inputDigit(btn.dataset.digit);
    } else if (btn.dataset.op !== undefined) {
      setOperator(btn.dataset.op);
    } else if (btn.dataset.action === 'decimal') {
      inputDecimal();
    } else if (btn.dataset.action === 'backspace') {
      backspace();
    } else if (btn.dataset.action === 'all-clear') {
      allClear();
    } else if (btn.dataset.action === 'percent') {
      percent();
    } else if (btn.dataset.action === 'equals') {
      equals();
    }
  });

  function flashKey(selector) {
    const btn = document.querySelector(selector);
    if (!btn) return;
    btn.classList.add('pressed');
    setTimeout(() => btn.classList.remove('pressed'), 110);
  }

  const keyOpMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };

  window.addEventListener('keydown', (e) => {
    const { key } = e;

    if (key >= '0' && key <= '9') {
      inputDigit(key);
      flashKey(`[data-digit="${key}"]`);
    } else if (key === '.') {
      inputDecimal();
      flashKey('[data-action="decimal"]');
    } else if (keyOpMap[key]) {
      setOperator(keyOpMap[key]);
      flashKey(`[data-op="${keyOpMap[key]}"]`);
    } else if (key === 'Enter' || key === '=') {
      e.preventDefault();
      equals();
      flashKey('[data-action="equals"]');
    } else if (key === 'Backspace') {
      backspace();
      flashKey('[data-action="backspace"]');
    } else if (key === 'Escape' || key === 'c' || key === 'C') {
      allClear();
      flashKey('[data-action="all-clear"]');
    } else if (key === '%') {
      percent();
      flashKey('[data-action="percent"]');
    }
  });

  render();
})();