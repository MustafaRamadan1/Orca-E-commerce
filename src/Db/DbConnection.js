import mongoose from "mongoose";
import app from '../app.js'
const dbConnection = ()=>{

    mongoose.connect(process.env.DB_LOCAL);

    mongoose.connection.on('connected', ()=>{
        console.log(`Database Connection Successfully`);
        app.listen(process.env.PORT, ()=> console.log(`Server Listening on PORT ${process.env.PORT}`))
    });
    
    mongoose.connection.on('error', (err)=> console.log(`Error: ${err.message}`));

    mongoose.connection.on('disconnected', ()=>{
        console.log(`DB DisConnected`)
        process.exit();
    })
};

export default dbConnection