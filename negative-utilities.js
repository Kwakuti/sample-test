let mySplitBreakDown = [];

function helperFunction(arrayInput) {
    let ratioSum, flatArray, ratioArray, percentageArray;
    
    ratioSum = 0;
    flatArray = [];
    ratioArray = [];
    percentageArray = [];

    const splitInfoMap = (splitInfoArray) =>  {
        let lastIndex = splitInfoArray.length -1;
        if(splitInfoArray.length <= 0) return;
        switch (splitInfoArray[lastIndex].SplitType) {
            case 'FLAT':
                flatArray.push(splitInfoArray[lastIndex]);
                break;
            case 'PERCENTAGE':
                percentageArray.push(splitInfoArray[lastIndex]);
            break;
            case 'RATIO':
                ratioArray.push(splitInfoArray[lastIndex]);
                ratioSum = ratioSum + splitInfoArray[lastIndex].SplitValue;
            break;
        }
        splitInfoArray.pop();
        return splitInfoMap(splitInfoArray);
    }
    splitInfoMap(arrayInput);
    return {
        ratioSum: ratioSum,
        flatArray: flatArray,
        ratioArray: ratioArray,
        percentageArray: percentageArray
    };
}

function analyseFlatHelper(flatArray) {
    let flatSum = 0;
    function analyseFlat(flatArr) {
        if(flatArr.length <= 0) return;
        flatSum = flatSum + flatArr[flatArr.length-1].SplitValue;
        let removedElement = flatArr.pop();
        //initial mySplitBreakDown.push({"SplitEntityId": removedElement.SplitEntityId,"Amount": removedElement.SplitValue});
        mySplitBreakDown.push({"SplitEntityId": removedElement.SplitEntityId,"Amount": removedElement.SplitValue });
        return analyseFlat(flatArr);
    }
    analyseFlat(flatArray);
    return flatSum;
}

function analysePercentageHelper(amount, percentageArray) {
    let evaluatedAmount = amount;
    function analysePercentage(percentageArr) {
        if(percentageArr.length <= 0) return;
        let calculation = (percentageArr[percentageArr.length-1].SplitValue * 0.01 * evaluatedAmount)
        evaluatedAmount = evaluatedAmount - calculation;
        let removedElement = percentageArr.pop();
        mySplitBreakDown.push({"SplitEntityId": removedElement.SplitEntityId,"Amount": calculation });
        return analysePercentage(percentageArr);
    }
    analysePercentage(percentageArray);
    return evaluatedAmount;
}


function analyseRatioHelper(amount, ratioArray, ratioSum) {
    let evaluatedAmount = amount;
    function analyseRatio(ratioArr) {
        if(ratioArr.length <= 0) return;
        let calculation = ((ratioArr[ratioArr.length-1].SplitValue/ratioSum) * evaluatedAmount);
        evaluatedAmount = evaluatedAmount - calculation;
        let removedElement = ratioArr.pop();
        mySplitBreakDown.push({"SplitEntityId": removedElement.SplitEntityId,"Amount": calculation });
        return analyseRatio(ratioArr);
    }
    analyseRatio(ratioArray);
    return evaluatedAmount;
}


exports.performAnalysis = (amount, splitInfoArray, next) => {
    let { flatArray, percentageArray, ratioArray, ratioSum } = helperFunction(splitInfoArray);

    let currentAmount = amount - analyseFlatHelper(flatArray);

    if(currentAmount <= 0) return next({ message: 'Error found ', status: 404 });

    currentAmount = analysePercentageHelper(currentAmount, percentageArray);

    if(currentAmount <= 0) return next({ message: 'Error found ', status: 404 });
    
    balance = analyseRatioHelper(currentAmount, ratioArray, ratioSum);
    
    if(balance < 0) {
        return next({ message: 'Error found ', status: 404 })
    };

    console.log(mySplitBreakDown);
    return {  
                balance: balance,
                mySplitBreakDown: mySplitBreakDown
            };
}
