import nodemailer from 'nodemailer'
import logger from './logger.js';

const sendEmail = async (mailOptions) => {

    let transporter;
    if(process.env.NODE_ENV === 'Development'){
        transporter =  nodemailer.createTransport({
            host:process.env.MAIL_TRAP_HOSTNAME,
            port: process.env.MAIL_TRAP_PORT,
            auth: {
                user: process.env.MAIL_TRAP_USERNAME,
                pass: process.env.MAIL_TRAP_PASSWORD
            }
        });
    } 
    else {
        transporter = nodemailer.createTransport({
            host: process.env.SENDGRID_SERVERNAME,
            port: process.env.SENDGRID_PORT,
            auth:{
                user: process.env.SENDGRID_USERNAME,
                pass: process.env.SENDGRID_PASSWORD
            }
        })
    }

    const options = {
        from :process.env.NODE_ENV === 'Development'? process.env.MAIL_TRAP_FROM : process.env.SENDGRID_FROM,
        to: mailOptions.to,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html:mailOptions.html
    };

    await transporter.sendMail(options);
    console.log('Email Sent');
    logger.info(`Email Sent to ${mailOptions.to}`)
};

export default sendEmail;