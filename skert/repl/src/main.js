import { compile } from '@zenparsing/skert';
import { prettyPrint } from './pretty-print.js';
import { html, applyTemplate } from 'straylight';

// Adapted from underscore
const escapeHTML = (function() {
  // List of HTML entities for escaping.
  let escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '`': '&#x60;',
  };

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  function createEscaper(map) {

    function escaper(match) { return map[match] }

    // Regexes for identifying a key that needs to be escaped
    let source = '(?:' + Object.keys(map).join('|') + ')';
    let testRegexp = RegExp(source);
    let replaceRegexp = RegExp(source, 'g');

    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  }

  return createEscaper(escapeMap);

})();

function replEval() {
  self.__replValue__ = undefined;

  let s = document.createElement('script');
  s.innerText = arguments[0].replace(/(^|\n)\s*let\s/g, '\n var ');

  let error = undefined;
  window.onerror = function(message, source, lineno, colno, err) { error = err };
  elem('head').appendChild(s);
  window.onerror = undefined;
  elem('head').removeChild(s);

  if (error) {
    throw error;
  }

  return self.__replValue__;
}

const MAX_CONSOLE_LINES = 100;
const NO_OUTPUT = {};
const NEWLINE = /\r\n?|\n/g;

function Literal(text) { this.text = text }
function HtmlLiteral(html) { this.html = html }

const compilerContext = new Map();

let terminal;
let input;
let hidden;
let prompt;
let bufferedInput = '';
let helpHTML = '';

const replCommands = {
  help() { return new HtmlLiteral(helpHTML) },
  clear() { return clearLines(1), NO_OUTPUT },
  load(url) { return loadScript(url), NO_OUTPUT },
  translate(code) { return new Literal(compile(code).output) },
  translateModule(code) { return new Literal(compile(code, { module: true }).output) },
  link() { return new Literal(generateLink()) }
};

const history = {

  list: [''],
  max: 50,
  current: 0,

  add(str) {
    if (!str) {
      return;
    }

    let len = this.list.length;

    this.list[len - 1] = str;
    this.list.push('');
    this.current = len;
  },

  back(str) {
    this._check(str);

    if (this.current > 0) {
      this.current -= 1;
    }

    return this.list[this.current];
  },

  forward(str) {
    this._check(str);

    if (this.current < this.list.length - 1) {
      this.current += 1;
    }

    return this.list[this.current];
  },

  _check(str) {
    if (str !== this.list[this.current]) {
      this.current = this.list.length - 1;
      this.list[this.current] = str;
    }
  },
};

function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

function loadScript(name) {
  let url = hasOwn(SCRIPT_URLS, name) ? SCRIPT_URLS[name] : name;

  let s = document.createElement('script');
  s.async = true;
  s.src = url;
  elem('head').appendChild(s);

  s.onload = function() {
    addLine(stylize('Script loaded from ' + url, 'ok'));
  };

  s.onerror = function() {
    addLine(stylize('Error: Unable to load script from ' + url, 'error'));
  };

  s = null;
}

function isOpaque(obj) {
  return obj instanceof Node;
}

function elem(s) {
  return document.querySelector(s);
}

function elems(s) {
  return document.querySelectorAll(s);
}

function stylize(str, styleType) {
  str = escapeHTML(str);
  if (styleType) str = '<span class="js-' + styleType + '">' + str + '</span>';
  return str;
}

function isRecoverableError(e, code) {
  if (/(\n[ \t]*){2}$/.test(code)) {
    return false;
  }

  let pattern = /^(Unexpected end of input|Unexpected token )/;
  return e && e.name === 'SyntaxError' && pattern.test(e.message);
}

function formatError(error) {
  return escapeHTML(error.message).replace(/^.+/, m => {
    return '<span class="js-error">' + m + '</span>';
  });
}

function isExpression(code) {
  return !/^\s*(function|class|var|let|const|if|do|while|for|switch|with)[^a-zA-Z0-9]/.test(code);
}

function replRun() {
  let code = input.value;

  if (bufferedInput) {
    code = bufferedInput + '\n' + code;
  }

  advanceInput(async () => {
    let executed = false;
    let output = '';
    let result;
    let error;

    if (code.trim() === '?') {
      code = '.help';
    }

    if (code.charAt(0) === '.') {
      executed = true;
      let cmd = code.slice(1).replace(/\s[\s\S]*/g, '');
      if (typeof replCommands[cmd] === 'function') {
        try { result = replCommands[cmd](code.slice(cmd.length + 1).trim()) }
        catch (x) { error = x || {} }
      } else {
        error = new Error('Invalid REPL command');
      }
    }

    if (!executed) {
      executed = true;
      try {
        if (isExpression(code)) {
          code = `self.__replValue__ = ${ code }`;
        }
        code = compile(code, { context: compilerContext }).output;
        result = await replEval(code);
      } catch (x) {
        error = x || {};
      }
    }

    if (isRecoverableError(error, code)) {
      bufferedInput = code;
    } else if (result !== NO_OUTPUT) {
      bufferedInput = '';
      output =
        error ? formatError(error) :
        result instanceof Literal ? escapeHTML(result.text) :
        result instanceof HtmlLiteral ? result.html :
        prettyPrint(result, { stylize: stylize, isOpaque: isOpaque });
    }

    return output;
  });
}

function autoIndent(last) {
  let indent = last.split(NEWLINE).pop().replace(/\S[\s\S]*/, '');

  if (/[\{\[]\s*$/.test(last)) {
    indent += '  ';
  }

  return indent;
}

async function advanceInput(fn) {
  let value = input.value;

  history.add(value);

  addLine(escapeHTML(value), prompt.className);
  setInputValue('');

  let output = fn && await fn() || '';

  if (output) {
    addLine(output);
  }

  prompt.className = bufferedInput ? 'prompt cont' : 'prompt';

  clearLines(MAX_CONSOLE_LINES);

  if (bufferedInput) {
    setInputValue(autoIndent(value));
  }

  input.focus();
  input.scrollIntoView();
}

function clearLines(max) {
  let list = elems('#terminal > div');
  let count = Math.max(0, list.length - max);
  for (let i = 0; i < count; ++i) {
    terminal.removeChild(list[i]);
  }
}

function addLine(html, promptClass) {
  let line = document.createElement('div');
  line.className = 'output-line';
  line.innerHTML = html || ' ';

  if (promptClass) {
    let span = document.createElement('span');
    span.className = promptClass;
    line.insertBefore(span, line.firstChild);
    line.className += ' echo';
  }

  terminal.insertBefore(line, input.parentNode);
  prompt.scrollIntoView();
}

function abort() {
  bufferedInput = '';
  advanceInput();
}

let resizeTimer = 0;

function resizeInput() {
  if (resizeTimer) {
    return;
  }

  resizeTimer = setTimeout(() => {
    resizeTimer = 0;

    let value = input.value;
    if (value === '') {
      input.style.height = 'auto';
    } else {
      hidden.style.width = input.scrollWidth;
      hidden.value = value;
      input.style.height = (hidden.scrollHeight + hidden.clientHeight) + 'px';
    }
  }, 50);
}

function onKeyPress(evt) {
  // Enter
  if (evt.keyCode === 13) {
    if (!evt.shiftKey && !evt.ctrlKey) {
      replRun();
      evt.preventDefault();
      return;
    }

    if (evt.shiftKey) {
      setInputValue(input.value + '\n' + autoIndent(input.value));
      evt.preventDefault();
    }
  }

  resizeInput();
}

function setInputValue(value) {
  input.value = value;
  input.selectionStart = value.length;
  input.selectionEnd = value.length;
  prompt.scrollIntoView();
  resizeInput();
}

function isCursorRow(row) {
  let val = input.value;

  if (!val) {
      return true;
  }

  let start = input.selectionStart;

  if (start !== input.selectionEnd) {
    return false;
  }

  if (row === 'first') {
    let index = val.search(NEWLINE);
    return index < 0 || index >= start;
  } else if (row === 'last') {
    return start >= val.length - val.split(NEWLINE).pop().length;
  } else {
    return false;
  }
}

function onKeyDown(evt) {
  // CTL-C, ESC
  if (evt.ctrlKey && evt.keyCode === 67 || evt.keyCode === 27) {
    abort();
    evt.preventDefault();
    return;
  }

  // Up arrow
  if (evt.keyCode === 38 && isCursorRow('first')) {
    setInputValue(history.back(input.value));
    evt.preventDefault();
    return;
  }

  // Down arrow
  if (evt.keyCode === 40 && isCursorRow('last')) {
    setInputValue(history.forward(input.value));
    evt.preventDefault();
    return;
  }
}

function onClick() {
  if (!window.getSelection || window.getSelection().isCollapsed) {
    input.focus();
  }
}

function onPaste() {
  resizeInput();
}

function createHidden() {
  let e = document.createElement(input.nodeName);
  e.className = 'hidden';
  e.rows = 1;
  input.parentNode.appendChild(e);
  return e;
}

function loadFromHash() {
  let m = /____(.+)/.exec(window.location.hash);
  if (m) {
    input.value = decodeURIComponent(m[1]);
    resizeInput();
  }
}

function generateLink() {
  let out = Array.from(elems('div.echo')).map(e => {
    return e.innerText.trim();
  }).filter(text => {
    return text.charAt(0) !== '.';
  }).join('\n');

  out = '____' + encodeURIComponent(out);
  window.location.hash = out;
  return window.location.toString().replace(/#[\s\S]*/, '') + '#' + out;
}

function main() {
  terminal = elem('#terminal');
  input = elem('#terminal-input');
  hidden = createHidden();
  prompt = elem('#terminal div.input-line span');
  helpHTML = '<div class="repl-help">' + elem('#repl-help-template').innerHTML + '</div>';

  terminal.addEventListener('click', onClick, false);
  input.addEventListener('keypress', onKeyPress, false);
  input.addEventListener('keydown', onKeyDown, false);
  input.addEventListener('paste', onPaste, false);

  input.focus();

  window.contentElement = elem('#content');

  let consoleLog = window.console.log;

  window.console.log = function(arg) {
    addLine(prettyPrint(arg, { stylize: stylize, isOpaque: isOpaque }));

    if (consoleLog) {
      consoleLog.apply(this, arguments);
    }
  };

  window.onerror = function(error) {
    addLine(formatError(error));
  };

  addLine(helpHTML);

  loadFromHash();
}

window.onload = main;
