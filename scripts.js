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
    let num1 = '';
    let num2 = '';
    let operation = '';
    let newNum = true;
    let currentKey = '';
    let lastKey = '';

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

        // For when -+/* or = is pressed 
        if (operatorList.includes(currentKey)){
            // if the user pressed an operator or equals last time, do nothing ...
            if (operatorList.includes(lastKey) || lastKey == '='){
                history.innerText = `${num1} ${operation}`;
                return
            } else {
                // ... otherwise, apply the input
                history.innerText = `${num1} ${operation}`;
                if (num2 != ''){
                    num1 = calculate(operation, num1, num2);
                    input.innerText = num1;
                    num2 = '';
                    newNum = true;
                }
            }
        } else if (currentKey == '='){
            // if user pressed the equals sign, we should check if we have an operator set...
            if (operation != '' && num2 != ''){
                history.innerText = `${num1} ${operation} ${num2} =`;
                num1 = calculate(operation, num1, num2);
                input.innerText = num1;

                // once we do the maths, we should then clear everything
                num1 = '';
                num2 = '';
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

        // When the square root button is pressed, multiply the number by itself and update the input/history
        if (currentKey == 'root'){
            let temp = input.innerText;
            let tempHistory = document.getElementById('equation-display').innerText;
        
            // set the nums if needed
            if (num1 == ''){
                num1 = temp;
            }
            if (num2 == ''){
                num2 = temp;
            }

            if (tempHistory == ''){
                // set the initial history if needed
                tempHistory = temp;
            } else {
                // otherwise, add recursion
                tempHistory = `sqr(${tempHistory})`;
                
                // clean it up
                tempHistory = tempHistory.replace(' ', '');
                tempHistory = tempHistory.replace('*', '');
                tempHistory = tempHistory.replace('-', '');
                tempHistory = tempHistory.replace('+', '');
                tempHistory = tempHistory.replace('/', '');
            }
               
            
            if (operation != ''){
                // if we have an operation set, apply it 
                tempHistory = `${num1} ${operation} ${tempHistory}`;
            }

            // update the history
            history.innerHTML = tempHistory;

            input.innerText = calculate("*", temp, temp);
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
    document.querySelector('#root').addEventListener('click', updateDisplay);
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
