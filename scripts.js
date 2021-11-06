// Event listeners & display changes
function keypadListeners(){
    // calculator keypad & equation display
    const nums = document.querySelectorAll('.num');
    const operators = document.querySelectorAll('.operator');
    const input = document.querySelector('#equation-display');
    const history = document.querySelector('#history-display');
    const allButtons = document.querySelectorAll('.button');

    // stores and tracks the user input
    let operatorList = [
        '-',
        '+',
        '/',
        '*',
    ];

    let historyLog = [];

    let num1 = '';
    let num2 = '';
    let operation = '';
    let newNum = true;
    let currentKey = '';
    let lastKey = '';
    let prevOperation = ``;
    const maxChar = 16;

    // updates the font size deppending on how many characters are in the display
    function updateFontSize(charCount){
        if (charCount < 11){
            input.setAttribute('style', 'font-size: 3rem');
        } else if (charCount < 13){
            input.setAttribute('style', 'font-size: 2.5rem');
        } else if (charCount <= maxChar){
            input.setAttribute('style', 'font-size: 2rem');
        } else {
            input.setAttribute('style', 'font-size: 1.5rem');
        }
    }

    // keeps track of the last button pressed
    allButtons.forEach((button =>{
        button.addEventListener('click',()=>{
            lastKey = currentKey;
            currentKey = button.dataset.button;
        });
    }));

    function inputNum(num){
        let characterCount = input.innerText.length;

            if (lastKey == "="){
                // if the last key was enter, we need to clear num1 and num2
                num1 = '';
                num2 = '';
            }

            // Add whatever numbers are pressed to the display
            if (newNum === true){
                // ensures that we start fresh when needed
                if (num1 == '' && num2 == ''){
                    history.innerText = '';
                }
                input.innerText = num;
                newNum = false;
            } else if (characterCount < maxChar){
                // ensures that we don't end up with a huge amount of numbers
                input.innerText += num;
            }

            // changes the font size for the display depending on the number of characters
            updateFontSize(characterCount);
    }

    function inputOperator(operator){
        if (operator != ""){
            // checks what numbers we have set
            if (num1 == ''){
                // num1 isn't set
                num1 = input.innerText;
                newNum = true;

            } else if (num2 == '' && lastKey != '='){
                // num1 is set, but num2 isn't, so we should accept a new number
                if (lastKey == 'root' || lastKey == 'sqr' || lastKey == 'reciprocal'){
                    num1 = input.innerText;
                    newNum = true;
                } else {
                    // if we're not using a special operator, we should also set num2
                    num2 = input.innerText;
                    newNum = true;
                }
                
            }

            // if equals wasn't pressed, set the operator
            if (operator != '='){
                if (num1 != '' && num2 != ''){
                    if (lastKey != "%"){
                        // but if both numbers are set, we should apply the equation first
                        updateDisplay();
                    } else {
                        updateDisplay();
                        num1 = input.innerText;
                        history.innerText = `${num1} ${operation}`;
                        return;
                    }
                }
                operation = operator;
            }
            
            // if both nums are set, calculate & update as needed
            updateDisplay(); 
        }
    }

    // keyboard support 
    window.onkeydown = function(e){
        lastKey = currentKey;

        let keyCode = e.keyCode;
        let keyNum = "";

        

        if (e.shiftKey == true){
            if (keyCode == 56){
                // multiplication
                keyCode = 106;
            } else if (keyCode == 43){
                //addition
                keyCode = 107;
            } else if (keyCode == 53){
                // %
                keyCode = 37;
            } else if (keyCode == 61){
                // %
                keyCode = 107;
            } else {
                return
            }
        }
        
        if (keyCode >= 48 && keyCode <= 57 || keyCode >= 96 && keyCode <= 105){
            // numbers
            if (keyCode < 57){
                keyNum = keyCode - 48;
            } else {
                keyNum = keyCode - 96;
            }
            inputNum(keyNum);
        } else {
            if (keyCode == 191){
                // division
            } else if (keyCode == 106){
                // multiplication
                keyNum = "*";
            } else if (keyCode == 61 || keyCode == 13){
                // equals
                keyNum = "=";
            } else if (keyCode == 107){
                // addition
                keyNum = "+";
            } else if (keyCode == 173 || keyCode == 109){
                // subtraction
                keyNum = "-";
            } else if (keyCode == 8){
                // backspace
                keyNum = "backspace";
            } else if (keyCode == 46){
                // delete - clear the screen
                keyNum = "c";
            } else if (keyCode == 110 || keyCode == 190){
                // . and . (period and num period)
                keyNum = ".";
            } else if (keyCode == 37){
                keyNum = "%";
            }else {
                keyNum = "";
            }

            if (keyNum != ""){
                currentKey = keyNum;

                if (operatorList.includes(keyNum) || keyNum == "="){
                    inputOperator(keyNum);
                } else {
                    updateDisplay()
                }
            }
        }
    };

    // display event listeners 
    nums.forEach((num =>{
        num.addEventListener('click', ()=>{
            inputNum(num.dataset.button);
        });
    }));

    /* 
        ----------------------------------------------------------
        | Updates the display and applies the correct math stuff |
        ----------------------------------------------------------

        1. When a user clicks an operator (*-+/=...etc.), it checks if we have two nums set 
        2. If we only have 1 num set, it sets the operator, and waits for the next number
        3. If we have 2 nums set, check if the last operator (other than =) was already applied
            a. If it was already applied, clear num2 and wait for more numbers
            b. If it wasn't already applied, apply it, clear num2, and set the operator
        4. If equals was pressed, calculate num1 and num2
        5. Once we do the calculations, set the first number to the new total and update the display

    */
    
    // updates the display and saved numbers depending on user input
    function updateDisplay(){
        // track and manage history
        function updateHistory(secondNum=num2){
            if (historyLog.length >= 19){
                // remove the first item if the array gets too big
                historyLog.pop()
            } else {
                historyLog.unshift({q: `${num1} ${operation} ${secondNum} =`, a: calculate(operation, num1, num2)});
            }

            // show/hide the window
            let hDump = document.getElementById('history-dump');

            // show/hide the trashcan depending on if there's stuff
            let emptyMsg = `There's no history yet`;
            let tElm = document.getElementById('delete-history');
            if (historyLog.length == 0){
                // it's empty, so we want to hide the trash icon
                tElm.style.visibility = "hidden";
                hDump.innerHTML = emptyMsg;
            } else {
                // if it's not empty, show the trash
                tElm.style.visibility = "visible";
                // populate the history window
                let hTemp = ``;
                
                for (i = 0; i < historyLog.length; i++){
                    hTemp += `<div class="history-item"><span>${historyLog[i].q}</span><span>${historyLog[i].a}</span></div>`;
                }
                hDump.innerHTML = hTemp;
            }
        }

        // if % is pressed, turn the second number into a percentage, or zero out the first one
        if (currentKey == '%'){
            if (history.innerText == ''){
                // if another number was never entered, we always return 0.
                history.innerText = 0;
                input.innerText = 0;
                newNum = true;
            } else {
                num2 = input.innerText;
                if (operation == '*' || operation == "/"){
                    num2 = calculate('*', num2, 0.01);
                } else {
                    let sum = num1 * num2;
                    num2 = calculate('*', sum, 0.01);
                }
                history.innerText = `${num1} ${operation} ${num2}`;
                input.innerText = num2;
                newNum = true;
            }
        }

        function doMath(){
            //add to history log
            updateHistory();

            // update last history
            if (currentKey != '='){
                history.innerText = `${num1} ${operation}`;
            } else {
                history.innerText = `${num1} ${operation} ${num2} =`;
            }

            // do the calculation
            num1 = calculate(operation, num1, num2);
            updateFontSize(num1.toString().length); // update font size before the value to avoid resizing
            input.innerText = num1;
        }

        // For when -+/* or = is pressed 
        if (operatorList.includes(currentKey)){
            // if the user pressed an operator last time, just update the history
            // but if they pressed equals, we need to update num1 and num2
            if (operatorList.includes(lastKey) || lastKey == "="){
                if (lastKey == "="){
                    num1 = input.innerText;
                    num2 = "";
                }
                history.innerText = `${num1} ${operation}`;
                return
            } else if (lastKey == "root" || lastKey == "sqr" || lastKey == "reciprocal"){
                // if the last key was a special operator, we should check for num2
                if (num2 != ""){
                    // and apply it
                    operation = prevOperation;
                    num1 = calculate(operation, num1, num2);
                    updateHistory(history.innerText);

                    // set things to what it should be now
                    operation = currentKey;
                    doMath();
                } else {
                    // otherwise just update the history
                    history.innerText = `${num1} ${operation}`;
                    return
                } 
            }else {
                // ... otherwise, update the display history
                history.innerText = `${num1} ${operation}`;
                
                // and apply the input if we have both numbers
                if (num2 != ''){
                    doMath()

                    // clear inputs
                    num2 = '';
                    newNum = true;
                }
            }
        } else if (currentKey == '='){
            // if user pressed the equals sign, we should check if we have an operator set...
            if (operation != '' && num2 != ''){
                // do the calculation
                doMath()

                // once we do the maths, we should then clear
                num1 = '';
            } else {
                // otherwise we can just update the display
                history.innerText = `${num1} =`;
            }
        }

        // function to clear the display & user inputs
        function clearDisplay(amount){
            input.innerText = '0';
            input.setAttribute('style', 'font-size: 3rem');
            newNum = true;
            if (amount == 'all'){
                history.innerText = '';
                num1 = '';
                num2 = '';
                operation = '';
            }
        }

        // When one of the clear buttons is pressed, clear the display/inputs appropriately
        if (currentKey == 'c' || currentKey == 'ce'){
            if (currentKey == 'c'){
                clearDisplay('all');
            } else {
                clearDisplay('partial');
            }
            
        }

        // When the backspace button is pressed, erase the last character
        if (currentKey == 'backspace'){
            if (lastKey == "."){
                // we want to ignore . for backspacing purposes, so we're going to change it
                lastKey = 'backspace';
            }

            let newInput = ``;
            if (lastKey == '='){
                // if the last input was =, then clear the history and the inputs
                history.innerText = '';
                num1 = input.innerText;
                num2 = "";
                newNum = true;
                currentKey = lastKey;
            } else {
                if (isNaN(lastKey) && lastKey != 'backspace'){
                    // if the last input wasn't a number, don't do anything
                    currentKey = lastKey;
                    alert('ye');
                } else {
                    // otherwise, backspace the last number inputted
                    if (input.innerText.length == 1){
                        newInput = '0';
                        newNum = true;
                        alert('good')
                    } else {
                        for (i = 0; i < input.innerText.length -1; i++){
                            newInput += input.innerText[i];
                        }
                        newNum = false;
                    }
                    input.innerText = newInput;
                }
            }
        }

        // when . is pressed, add a decimal to the number
        if (currentKey == '.'){
            if (lastKey == '='){
                // if enter was the last one pressed, set to 0
                input.innerText = '0.';
                num1 = '';
                num2 = '';
                newNum = false;
            } else if (input.innerText.includes('.') == true){
                // there is a decimal already, so skip
                lastKey == currentKey;
                return;
            } else {
                // otherwise, add a decimal
                input.innerText += '.';
            }
        }

        // When the +/- button is pressed, change whether or not the number is positive or negative
        if (currentKey == '+/-'){
            // temporary values
            let flipMe = input.innerText;
    
            // apply the change
            flipMe = flipMe - flipMe - flipMe;
            input.innerText = flipMe;
        }

        // When the square (x2) button is pressed, multiply the number by itself and update the input/history
        // when reciprocal (1/x) is pressed, divide by 1
        if (currentKey == 'sqr' || currentKey == 'reciprocal' || currentKey == 'root'){
            // set the operation to prevOperation
            prevOperation = operation;

            // to-do: fix it so the characters size down as more are added

            let temp = input.innerText;
            let tempHistory = history.innerText;
            let tag = `sqr`;
            let result = ``;

            if (currentKey == 'reciprocal'){
                tag = `1/`;
            } else if (currentKey == 'root'){
                tag = "√";
            }
        
            // set the nums if needed
            if (num1 == '' || lastKey == '='){
                num1 = temp;
                num2 = "";
            }

            if (lastKey == '='){
                operation = '';
            }
            
            if (tempHistory == '' || lastKey == '='){
                // set the initial history if needed
                tempHistory = `${tag}(${temp})`;
            } else {
                // otherwise, add recursion
                tempHistory = `${tag}(${tempHistory})`;
                
                // clean it up
                tempHistory = tempHistory.replace(' *', '');
                tempHistory = tempHistory.replace(' -', '');
                tempHistory = tempHistory.replace(' +', '');
                tempHistory = tempHistory.replace(' /', '');
                tempHistory = tempHistory.replace(' =', '');

                for (i = 0; i < 10; i++){
                    tempHistory = tempHistory.replace(`${i} `, '');
                }
            }

            if (operation != ''){
                // if we have an operation set, apply it 
                tempHistory = `${num1} ${operation} ${tempHistory}`;
            }

            // update the history
            history.innerHTML = tempHistory;

            if (currentKey == "sqr"){
                // apply square sqr
                result = calculate("*", temp, temp);
            } else if (currentKey == "reciprocal"){
                // apply reciprocal
                result = calculate("/", 1, temp);
            } else if (currentKey == "root"){
                // apply square root
                result = Math.sqrt(temp);
            }
            updateFontSize(result.toString().length);
            input.innerText = result;
        }
    }

    // operator event listners
    operators.forEach((operator =>{
        operator.addEventListener('click', ()=>{
            inputOperator(operator.dataset.button);
        });
    }));

    function toggleSize(setting="default"){
        if (setting == "default"){
            document.getElementById('calculator').classList.toggle('big-boye');
            document.querySelector('body').classList.toggle('light-gray-bg');
            document.querySelector('#history-split').classList.toggle('split');
        } else {
            document.getElementById('calculator').classList.remove('big-boye');
            document.querySelector('body').classList.remove('light-gray-bg');
            document.querySelector('#history-split').classList.remove('split');
        }
    }

    // other event listeners 
    document.querySelector('#clear').addEventListener('click', updateDisplay);
    document.querySelector('#clear-entry').addEventListener('click', updateDisplay);
    document.querySelector('#percent').addEventListener('click', updateDisplay);
    document.querySelector('#backspace').addEventListener('click', updateDisplay);
    document.querySelector('#decimal').addEventListener('click', updateDisplay);
    document.querySelector('#flipper').addEventListener('click', updateDisplay);
    document.querySelector('#sqr').addEventListener('click', updateDisplay);
    document.querySelector('#reciprocal').addEventListener('click', updateDisplay);
    document.querySelector('#root').addEventListener('click', updateDisplay);
    document.querySelector('#desktop-icon').addEventListener('dblclick', ()=>{
        document.getElementById('container').classList.remove('absolute');
        document.getElementById('calculator').style.visibility = "visible";
    });
    document.querySelector('#resize-calculator').addEventListener('click',()=>{
        document.getElementById('container').classList.remove('absolute');
        toggleSize();
    });
    document.querySelector('#calc-text').addEventListener('dblclick',()=>{
        document.getElementById('container').classList.remove('absolute');
        toggleSize();
    });
    document.querySelector('#view-history').addEventListener('click', ()=>{
        // show/hide the window
        let hElm = document.getElementById('history-window');
        hElm.classList.toggle('display-none');
    });

    document.querySelector('#delete-history').addEventListener('click', ()=>{
        historyLog = [];
        document.getElementById('history-dump').innerHTML = `There's no history yet`;
    });

    document.querySelectorAll('.hide-calculator').forEach((hideBtn) =>{
        hideBtn.addEventListener('click', ()=>{
            // hide the calc
            document.getElementById('container').classList.remove('absolute');
            document.getElementById('calculator').style.visibility = "hidden";
            
            // revert the calc
            toggleSize('off');

            if (hideBtn.id == "window-close"){
                currentKey = "c";
                updateDisplay();
                historyLog = [];
            }
        });
    });

    // move the window around
    let mouseDown = false;

    function moveItem(id, offsetX="0", offsetY=""){
        mouseDown = true;

        let cWin = document.getElementById(id); //calculator window

        // ensures the calculator is in the default state
        document.getElementById('calculator').classList.remove('big-boye');
        document.querySelector('body').classList.remove('light-gray-bg');
        document.querySelector('#history-split').classList.remove('split');

        onmousemove = function(e){
            if (mouseDown == true){
                cWin.classList.add('absolute');
                cWin.style.left = `${e.clientX -offsetX}px`;
                cWin.style.top = `${e.clientY-offsetY}px`;
            } else {
                //cWin.classList.remove('absolute');
            }
        }
    }

    document.getElementById('calc-text').addEventListener('mousedown', (e)=>{
        moveItem('container', 110, 50);
    });

    document.getElementById('desktop-icon').addEventListener('mousedown', (e)=>{
        moveItem('desktop-icon', 50, 50);
    });

    window.addEventListener('mouseup', ()=>{
        mouseDown = false;
    });
}

// Math functions
function calculate(operator, firstNumber, secondNumber="n/a"){
    let var1 = parseFloat(firstNumber);
    let var2 = 0;

    if (secondNumber != "n/a"){
        var2 = parseFloat(secondNumber);
    }
    
    let total = 0;

    if (operator === "+"){
        total = var1 + var2;
    } else if (operator === "-"){
        total = var1 - var2;
    } else if (operator === "*"){
        total = var1 * var2;
    } else if (operator === "/"){
        total = var1 / var2;
    } else {
        console.log('invalid operator');
    }

    if (Number.isInteger(total) == false){
        // if we're dealing with a float, limit the decimals to 15
        total = parseFloat(total.toFixed(15));

        // get rid of the extra 0s

    }

    // return the total
    return total;
};

// Required for the Javascript to run
keypadListeners();
