import otpGenerator from 'otp-generator';


const generatorOTP = ()=>{

    return otpGenerator.generate(6,{lowerCaseAlphabets:false,specialChars:false});
};


export default generatorOTP;