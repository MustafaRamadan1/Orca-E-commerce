import mongoose from "mongoose";
import productModel from "../Db/models/product.model.js";
import categoryModel from '../Db/models/category.model.js';
import subCategoryModel from "../Db/models/sub-Category.model.js";
import products from './json/products.json' assert { type: 'json' };
import categories from './json/categories.json' assert { type: 'json' };
import subCategories from './json/subCategories.json' assert {type: 'json'};
import dotenv from 'dotenv';

dotenv.config();


mongoose.connect(process.env.DB_ATLAS);
mongoose.connection.on('connected',()=>console.log(`DB Connected`))
mongoose.connection.on('error',()=>console.log(`DB Connection Error`))
const importData =  async(Model, data)=>{

    try{
        await Model.create(data);
        console.log(`Upload Success`)
    }
    catch(err){
        console.log(err)
    }
};


const deleteData = async(Model)=>{

        try{

            await Model.deleteMany({});
            console.log(`deleted successfully`)
        }
        catch(err){
            console.log(err)
        }
}



if(process.argv[2] === '--delete'){

    deleteData(productModel);
}
else{
    importData(productModel, products);
}


