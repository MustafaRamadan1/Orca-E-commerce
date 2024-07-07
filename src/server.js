import dotenv from 'dotenv';
import logger from './utils/logger.js'
dotenv.config();

import dbConnection from './Db/DbConnection.js';

dbConnection();


process.on('uncaughtException', (err) => {

    logger.error(err.name, err.message);
    console.log(err);
    process.exit(0);
})