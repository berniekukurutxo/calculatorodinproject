// Variables

let inputEquation = [];
let inputNum = '';
let tempEquation = [];
let disabled = false;

const input = document.getElementById('input');
const output = document.getElementById('output');
const clearButton = document.getElementById('allclear');
const inverse = document.getElementById('inverse');
const decimal = document.getElementById('decimal');
const backspace = document.getElementById('backspace');
const equals = document.getElementById('equals');
const disabledButtons = document.querySelectorAll('.disabled');

const numberButtons = document.querySelectorAll('.number');
const operatorButtons = Array.from(document.querySelectorAll('.operator'));
const operatorArray = operatorButtons.map(operator => operator.dataset['key']);
const operatorMathArray = ['%', '*', '/', '+', '-']

// Event Listeners

numberButtons.forEach((button) =>
  button.onclick = () => attachNumber(button.innerHTML)
);

operatorButtons.forEach((button) =>
  button.onclick = () => attachOperator(button.dataset['key'])
);

// window.onkeydown = () => keyboardInput();
window.onkeydown = (e) => keyboardInput(e);
clearButton.onclick = () => clear();
inverse.onclick = () => invertSign();
decimal.onclick = () => attachDecimal();
backspace.onclick = () => deleteLastInput();
equals.onclick = () => updateEquals();

// Event Listener Functions

function attachNumber(number) {
  /*
    attaches a number to the input display
      if input number is 0 or last element in equation is a number - replace number
      if input number is greater than 1 - concat number, replace with existing number in equation
      else add a new number into the equation
      update output
      check input length
  */
  inputNum = inputNum.replaceAll(',', '');
  const lastElement = inputEquation[inputEquation.length - 1];
  if (inputNum === '0') {
    inputNum = number;
    inputNum = Number(inputNum).toLocaleString('en-US', {maximumFractionDigits: 20});
    inputEquation.splice(-1, 1, inputNum);
  } else if (inputNum > 1 || !operatorArray.includes(lastElement)) {
    inputNum += number;
    inputNum = Number(inputNum).toLocaleString('en-US', {maximumFractionDigits: 20});
    inputEquation.splice(-1, 1, inputNum);
  } else if (inputNum === '') {
    inputNum += number;
    inputNum = Number(inputNum).toLocaleString('en-US', {maximumFractionDigits: 20});
    inputEquation.push(inputNum);
  }
  updateDisplay();
  checkInputLength();
  tempEquation = [];
};

function attachOperator(operator) {
  /*
    attach operator and evaluate input equation into output:
      if operator is last element - replace operator in equation
      if equation is empty or last element is 0 - add 0 and operator to equation
      if number exists, but not operator - add operator to equation
    update input
    check input length
  */
  const lastElement = inputEquation[inputEquation.length - 1];
  if (operatorArray.includes(lastElement)) {
    inputEquation.splice(-1, 1, operator);
    input.innerHTML = inputEquation.join('');
    return;
  } else if (inputEquation.length === 0 || lastElement === '0.' || lastElement === '') {
    inputEquation.pop();
    input.innerHTML = `0${operator}`;
    inputEquation.push('0');
    inputEquation.push(operator);
    inputNum = '';
    output.innerHTML = evaluate(inputEquation);
  } else {
    input.innerHTML += operator;
    inputEquation.push(operator);
    inputNum = '';
  }
  input.innerHTML = inputEquation.join('');
  checkInputLength()
  tempEquation = [];
};

function clear() {
  // clears the output and input display
  input.innerHTML = '';
  output.innerHTML = '';
  inputEquation = [];
  inputNum = '';
  tempEquation = [];
  if (disabled === true) {
    disabledButtons.forEach(button => {
      button.disabled = false;
    });
    disabled = false;
  }
};

function invertSign() {
  /*
    if there is no last number, or is a 0 (with or without decimal) - return
    invert number, and replace into equation
    update output
  */
  if (inputNum === '' || inputNum === '0.') return;
  else if (inputNum[0] === '-') {
    inputNum = inputNum.slice(1);
  } else {
    inputNum = '-' + inputNum;
  }
  inputEquation.splice(-1, 1, inputNum);
  updateDisplay();
  checkInputLength()
};

function attachDecimal() {
  /*
    if last element of equation is an operator - attach decimal as '0.'
    if the last number does not have a decimal - attach decimal to number
    if there is no last number - attach decimal as '0.'
  */
  const lastElement = inputEquation[inputEquation.length - 1];
  if (operatorArray.includes(lastElement)) { // if operator is last element in equation
    inputNum = '0.';
    inputEquation.push(inputNum);
    inputEquation.splice(-1, 1, inputNum);
  } else if (inputNum.length > 0 && !inputNum.includes('.')) { // if number does not have decimal
    inputNum += '.'
    inputEquation.splice(-1, 1, inputNum);
  } else if (inputNum.length === 0) { // if number is empty
    inputNum = '0.'
    inputEquation.splice(-1, 1, inputNum);
  }
  updateDisplay();
  checkInputLength();
  tempEquation = [];
}

function deleteLastInput() {
  /*
    checks to see if equals/enter was pressed
      if yes, uses old equation for deletion
    if equation is empty, return
    deletes last entry depending on decimal, number or operator
    updates output
  */
  if (tempEquation.length >= 1) inputEquation = tempEquation;
  inputEquation = inputEquation.filter(el => el)
  if (inputEquation.length === 0) return;
  let lastElement = inputEquation[inputEquation.length - 1]
    .replaceAll(',', '')
    .slice(0, -1);
  if (lastElement.endsWith('.')) {
    inputEquation.splice(-1, 1, lastElement);
    inputNum = lastElement;
  } else if (lastElement === '' || lastElement === '-') {
    inputEquation.pop();
    if (inputEquation.length === 1) {
      inputNum = inputEquation[0]
    } else {
      inputNum = '';
    }
  } else {
    lastElement = Number(lastElement).toLocaleString('en-US', {maximumFractionDigits: 20})
    inputEquation.splice(-1, 1, lastElement);
    inputNum = lastElement;
  }
  updateDisplay();
  checkInputLength();
  tempEquation = [];
}

function updateEquals() {
  /*
    when enter or equals is pressed:
      if the output is 'Divide by Zero' - reset all, except tempEquation to allow deleteLastInput()
      if the output is empty - return
    sets temp equation
      if the input equation is incomplete - update input, output, equation, number, and return
    updates input, output, number, equation
  */
  if (output.innerHTML === 'Divide by Zero') {
    input.innerHTML = '';
    output.innerHTML = 'Divide by Zero';
    inputEquation = [];
    inputNum = '';
    tempEquation = [];
    if (disabled === true) {
      disabledButtons.forEach(button => {
        button.disabled = false;
      });
      disabled = false;
    }
    return;
  }
  if (output.innerHTML === '') return;
  tempEquation = inputEquation.slice();
  if (inputEquation.length < 3) {
    input.innerHTML = evaluate(inputEquation);
    output.innerHTML = evaluate(inputEquation);
    inputEquation = [`${evaluate(inputEquation)}`];
    tempEquation = inputEquation;
    inputNum = '';
    return;
  }
  input.innerHTML = output.innerHTML;
  output.innerHTML = null;
  inputNum = '';
  inputEquation = [input.innerHTML];
  checkInputLength();
}

// Helper Functions

const operate = (operator, a, b) => {
  a = Number(a);
  b = Number(b);
  switch (operator) {
    case '%': return a % b;
    case '+': return a + b;
    case '-': return a - b;
    case 'x': return a * b;
    case '÷': return a / b;
  };
};

function convertOperator(operator) {
  if (operator == '%') return '%';
  else if (operator == '+') return '+';
  else if (operator == '-') return '-';
  else if (operator == '*') return 'x';
  else if (operator == '/') return '÷';
}

function evaluate(equation) {
  /*
    filters any empty space if any
    if equation length is incomplete and less than 3, return the first number
    if equation ends with an operator, remove operator
    loops calculation to PEMDAS rule
    returns final number
  */
  const calc = equation.slice()
  const lastElement = calc[calc.length - 1];

  if (calc.length < 3) return calc[0];
  else if (operatorArray.includes(lastElement)) calc = calc.slice(-1, 1);

  // loops until first part of PEMDAS is complete
  while (calc.includes('x') || calc.includes('÷') || calc.includes('%')) {
    const operator = calc.find(el => el === 'x' || el === '÷' || el === '%');
    const operatorIdx = calc.indexOf(operator);
    const num1 = calc[operatorIdx - 1].toLocaleString('en-US').replaceAll(',', '');
    const num2 = calc[operatorIdx + 1].toLocaleString('en-US').replaceAll(',', '');
    const total = operate(operator, num1, num2);

    calc.splice(operatorIdx - 1, 3, total);
  }
  // loops until second part of PEMDAS is complete
  while (calc.includes('+') || calc.includes('-')) {
    const operator = calc.find(el => el === '+' || el === '-');
    const operatorIdx = calc.indexOf(operator);
    const num1 = calc[operatorIdx - 1].toLocaleString('en-US').replaceAll(',', '');
    const num2 = calc[operatorIdx + 1].toLocaleString('en-US').replaceAll(',', '');
    const total = operate(operator, num1, num2);

    calc.splice(operatorIdx - 1, 3, total);
  }
  if (calc[0] === Infinity) return 'Divide by Zero';
  return calc;
}

function checkInputLength() {
  // if input display is greater than 19 characters - disable buttons
  const length = input.innerHTML.length;
  if (length >= 19) {
    disabledButtons.forEach(button => {
      button.disabled = true;
      disabled = true;
      return;
    });
  } else if (disabled === true) {
    disabledButtons.forEach(button => {
      button.disabled = false;
      disabled = false;
    });
  }
}

function updateDisplay() {
  /*
    if equation is only 1 number; input and output become the number
    else the input is updated, and output is calculated using evaluate()
  */
  if (inputEquation.length <= 1) {
    input.innerHTML = inputNum;
    output.innerHTML = inputNum;
  } else {
    inputEquation = inputEquation.filter(el => el)
    input.innerHTML = inputEquation.join('');
    output.innerHTML = evaluate(inputEquation).toLocaleString('en-US', {maximumFractionDigits: 4});
  }
}

// Keyboard Support

function keyboardInput(e) {
  e.preventDefault();
  if (e.key >= 0 && e.key <= 9 && disabled === false) attachNumber(e.key);
  else if (operatorMathArray.includes(e.key) && disabled === false) attachOperator(convertOperator(e.key));
  else if (e.key === 'Escape') clear();
  else if (e.key === '.' && disabled === false) attachDecimal();
  else if (e.key === '=' || e.key === 'Enter') updateEquals();
  else if (e.key === 'Backspace') deleteLastInput();
}
