import winston from 'winston'
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const logger = winston.createLogger({

    level:'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({
            stack:true
        }),
        winston.format.json(),
        winston.format.prettyPrint()
    ),
    transports:[
        new winston.transports.File({
            filename:`${__dirname}/../logs/infoLogs.log`
        }),
        new winston.transports.File({
            filename:`${__dirname}/../logs/errorLogs.log`,
            level:'error'
        })
    ]
})

export default logger;