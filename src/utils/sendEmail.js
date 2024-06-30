import nodemailer from 'nodemailer'

const sendEmail = async (mailOptions) => {


    const transporter = nodemailer.createTransport({
        host:process.env.MAIL_TRAP_HOSTNAME,
        port: process.env.MAIL_TRAP_PORT,
        auth: {
            user: process.env.MAIL_TRAP_USERNAME,
            pass: process.env.MAIL_TRAP_PASSWORD
        }
    });

    const options = {
        from :process.env.MAIL_TRAP_FROM,
        to: mailOptions.to,
        subject: mailOptions.subject,
        text: mailOptions.text
    };

    await transporter.sendMail(options);
    console.log('Email Sent');
};

export default sendEmail;