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

    // keeps track of the last button pressed
    allButtons.forEach((button =>{
        button.addEventListener('click',()=>{
            lastKey = currentKey;
            currentKey = button.dataset.button;
        });
    }));

    // display event listeners 
    nums.forEach((num =>{
        const maxChar = 16;
        num.addEventListener('click', ()=>{
            let characterCount = input.innerText.length;

            // Add whatever numbers are pressed to the display
            if (newNum === true){
                // ensures that we start fresh when needed
                if (num1 == '' && num2 == ''){
                    history.innerText = '';
                }
                input.innerText = num.dataset.button;
                newNum = false;
            } else if (characterCount < maxChar){
                // ensures that we don't end up with a huge amount of numbers
                input.innerText += num.dataset.button;
            }

            // changes the font size for the display depending on the number of characters
            if (characterCount < 11){
                input.setAttribute('style', 'font-size: 3rem');
            } else if (characterCount < 13){
                input.setAttribute('style', 'font-size: 2.5rem');
            } else if (characterCount <= maxChar){
                input.setAttribute('style', 'font-size: 2rem');
            } else {
                input.setAttribute('style', 'font-size: 1.5rem');
            }
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
                historyLog.shift()
            } else {
                historyLog.push({q: `${num1} ${operation} ${secondNum} =`, a: calculate(operation, num1, num2)});
            }

            console.log(historyLog);
        }

        // if % is pressed, turn the second number into a percentage, or zero out the first one
        if (currentKey == '%'){
            if (num1 == ''){
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
                console.log('!=')
            } else {
                history.innerText = `${num1} ${operation} ${num2} =`;
            }

            // do the calculation
            num1 = calculate(operation, num1, num2);
            input.innerText = num1;
        }

        // For when -+/* or = is pressed 
        if (operatorList.includes(currentKey)){
            // if the user pressed an operator or equals last time, do nothing ...
            if (operatorList.includes(lastKey) || lastKey == '='){
                history.innerText = `${num1} ${operation}`;
                return
            } else if (lastKey == "root" || lastKey == "sqr" || lastKey == "reciprocal"){
                // if the last key was a special operator, we should do the maths before continuing
                operation = prevOperation;
                num1 = calculate(operation, num1, num2);
                updateHistory(history.innerText);

                // set things to what it should be now
                operation = currentKey;
                doMath();
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
                } else {
                    // otherwise, backspace the last number inputted
                    if (input.innerText.length == 1){
                        newInput = '0';
                    } else {
                        for (i = 0; i < input.innerText.length -1; i++){
                            newInput += input.innerText[i];
                        }
                    }
                    input.innerText = newInput;
                    newNum = true;
                }
            }
        }

        // when . is pressed, add a decimal to the number
        if (currentKey == '.'){
            console.log(lastKey)
            if (lastKey == '='){
                // if enter was the last one pressed, set to 0
                input.innerText = '0.';
                num1 = '';
                num2 = '';
                newNum = false;
            } else if (input.innerText.includes('.') == true){
                // there is a decimal already, so skip
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
            if (currentKey == 'reciprocal'){
                tag = `1/`;
            } else if (currentKey == 'root'){
                tag = "√";
            }
        
            // set the nums if needed
            if (num1 == '' || lastKey == '='){
                num1 = temp;
            }

            if (num2 == '' || lastKey == '='){
                num2 = temp;
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
                input.innerText = calculate("*", temp, temp);
            } else if (currentKey == "reciprocal"){
                // apply reciprocal
                input.innerText = calculate("/", 1, temp);
            } else if (currentKey == "root"){
                input.innerText = Math.sqrt(temp);
            }
        }
    }

    // operator event listners
    operators.forEach((operator =>{
        operator.addEventListener('click', ()=>{
            // checks what numbers we have set
            if (num1 == ''){
                // num1 isn't set
                num1 = input.innerText;
                newNum = true;

            } else if (num2 == '' && lastKey != '='){
                // num1 is set, but num2 isn't
                num2 = input.innerText;
                newNum = true;
            }

            // if equals wasn't pressed, set the operator
            if (operator.dataset.button != '='){
                if (num1 != '' && num2 != ''){
                    // but if both numbers are set, we should apply the equation first
                    updateDisplay();
                }
                operation = operator.dataset.button;
            }
            
            // if both nums are set, calculate & update as needed
            updateDisplay(); 
        });
    }));

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
    document.querySelector('#view-history').addEventListener('click', ()=>{
        // show/hide the window
        let hElm = document.getElementById('history-window');
        let hDump = document.getElementById('history-dump');
        hElm.classList.toggle('display-none');

        // show/hide the trashcan depending on if there's stuff
        let emptyMsg = `There's no history yet`;
        let tElm = document.getElementById('delete-history');
        if (historyLog.length == 0){
            // it's empty, so we want to hide the trash icon
            tElm.style.visibility = "hidden";
            hDump.innerHTML = emptyMsg;
            console.log(emptyMsg);
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
    });

    document.querySelector('#delete-history').addEventListener('click', ()=>{
        historyLog = [];
        document.getElementById('history-dump').innerHTML = `There's no history yet`;
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
        // if we're dealing with a float, limit the decimals
        total = total.toFixed(2);

        // to-do: have the decimal amount fill the available space without adding extra 0s....
    }

    // return the total
    return total;
};

// Required for the Javascript to run
keypadListeners();
