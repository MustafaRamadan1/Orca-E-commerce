import {Resend} from 'resend';
import dotenv from 'dotenv';
dotenv.config();
const resend = new Resend(process.env.RESEND_API_KEY);


const sendEmail = async(mailOptions)=>{

    try{
        const { data, error } = await resend.emails.send({
            from :process.env.RESEND_FROM,
            to: [mailOptions.to],
            subject:mailOptions.subject,
            text:mailOptions.text,
            html:mailOptions.html
        })
    }

    catch(err){

        throw new Error(err.message)
    }
};

export default sendEmail;