const dotenv = require('dotenv');

const server = require('./app');

dotenv.config({
    path: 'config.env'
})


const PORT_NUM = process.env.PORT || 3000;

const serverObject = server.listen(PORT_NUM, (error) => {
    if(!error) {
        console.log(`Server is online at port ${PORT_NUM}...`);
    }else {
        console.log(error);
    }
});