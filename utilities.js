let mySplitBreakDown = [];

function helperFunction(arrayInput) {
    let ratioSum, flatArray, ratioArray, percentageArray;
    
    ratioSum = 0;
    flatArray = [];
    ratioArray = [];
    percentageArray = [];

    const splitInfoMap = (splitInfoArray) =>  {
        if(splitInfoArray.length <= 0) return;
        switch ( splitInfoArray[0].SplitType) {
            case 'FLAT':
                flatArray.push(splitInfoArray[0]);
                break;
            case 'PERCENTAGE':
                percentageArray.push(splitInfoArray[0]);
            break;
            case 'RATIO':
                ratioArray.push(splitInfoArray[0]);
                ratioSum = ratioSum + splitInfoArray[0].SplitValue;
            break;
        }
        return splitInfoMap(splitInfoArray.slice(1));
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
        flatSum = flatSum + flatArr[0].SplitValue;
        mySplitBreakDown.push({"SplitEntityId": flatArr[0].SplitEntityId,
                                "Amount": flatArr[0].SplitValue});
        return analyseFlat(flatArr.splice(1));
    }
    analyseFlat(flatArray);
    return flatSum;
}

function analysePercentageHelper(amount, percentageArray) {
    let evaluatedAmount = amount;
    function analysePercentage(percentageArr) {
        if(percentageArr.length <= 0) return;
        evaluatedAmount = evaluatedAmount - (percentageArr[0].SplitValue * 0.01 * evaluatedAmount);
        mySplitBreakDown.push({"SplitEntityId": percentageArr[0].SplitEntityId,
                                "Amount": percentageArr[0].SplitValue * 0.01 * evaluatedAmount });
        return analysePercentage(percentageArr.splice(1));
    }
    analysePercentage(percentageArray);
    return evaluatedAmount;
}


function analyseRatioHelper(amount, ratioArray, ratioSum) {
    let evaluatedAmount = amount;
    function analyseRatio(ratioArr) {
        if(ratioArr.length <= 0) return;
        evaluatedAmount = evaluatedAmount - ((ratioArr[0].SplitValue/ratioSum) * evaluatedAmount);
        mySplitBreakDown.push({"SplitEntityId": ratioArr[0].SplitEntityId,
                                "Amount": ((ratioArr[0].SplitValue/ratioSum) * evaluatedAmount) });
        return analyseRatio(ratioArr.splice(1));
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
    if(balance <= 0) return next({ message: 'Error found ', status: 404 });
    return { "Balance": balance, "SplitBreakDown" : mySplitBreakDown };
}

//ENSURE amount IS POSITIVE























