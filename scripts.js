function operate(operator, num1, num2){
    let total = 0;

    if (operator === "+"){
        total = num1 + num2;
    } else if (operator === "-"){
        total = num1 - num2;
    } else if (operator === "*"){
        total = num1 * num2;
    } else if (operator === "%"){
        total = num1 % num2;
    }else {
        console.log('invalid operator');
    }

    return total;
}