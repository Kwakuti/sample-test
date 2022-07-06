const morgan = require('morgan');
const express = require('express');
const compression = require('compression');

// const utils = require('./utilities');
const utils = require('./negative-utilities');

const app = express();

app.use(morgan('dev'));

app.use(compression());

app.use(express.json());

app.post('/split-payments/compute', async (request, response, next) => {
    let { balance, mySplitBreakDown } = utils.performAnalysis(request.body.Amount, request.body.SplitInfo, next);
    return response.status(200).json({
            "ID": request.body.ID,
            "Balance": balance,
            "SplitBreakdown": mySplitBreakDown
        });
});

app.all('*', (request, response, next) => {
    return next({ message: 'Page not found...', status: 404 });
});

app.use((error, request, response, next) => {
    let myError = { status: undefined, message: undefined };
    myError.status = error.status || 500;
    myError.message = error.message || 'An Error has occured Internal Server Error...';
    return response.status(error.status).json({
        status: myError.status,
        message: myError.message
    });
})


module.exports  = app;