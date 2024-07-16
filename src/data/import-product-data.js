import mongoose from "mongoose";
import productModel from "../Db/models/product.model.js";
import products from './json/products.json' assert { type: 'json' };
import dotenv from 'dotenv';

dotenv.config();


mongoose.connect(process.env.DB_ATLAS);
mongoose.connection.on('connected',()=>console.log(`DB Connected`))
mongoose.connection.on('error',()=>console.log(`DB Connection Error`))
const importData =  async()=>{

    try{
        await productModel.create(products);
        console.log(`Upload Success`)
    }
    catch(err){
        console.log(err)
    }
};


const deleteData = async()=>{

        try{

            await productModel.deleteMany({});
            console.log(`deleted successfully`)
        }
        catch(err){
            console.log(err)
        }
}



if(process.argv[2] === '--delete'){

    deleteData();
}
else{
    importData();
}