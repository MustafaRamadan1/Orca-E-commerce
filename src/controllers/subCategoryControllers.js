import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import SubCategory from "../Db/models/sub-Category.model.js";
import slug from "slug";


export const createSubCategory = catchAsync(async (req, res ,next)=>{
    const {name, description, category} = req.body;

    if(!name || !description || !category) 
        return next(new AppError(`Please Provide Required Fields`, 404));

    const newSubCategory = await subCategory.create({
        name, description, category
    });


    if(!newSubCategory) return next(new AppError(`Couldn't Create new Category`, 400));

    res.status(201).json({
        status: 'success',
        data: newSubCategory
    })
});

export const getAllSubCategories =  catchAsync(async (req, res ,next)=>{

    const allSubCategories = await SubCategory.find().populate({
        path: 'category',
        select: '-__v -updatedAt -createdAt'
    });

    if(!allSubCategories) return next( new AppError(`No SubCategories Found`, 404));

    res.status(200).json({
        status:'success',
        data: allSubCategories
    })
});

export const getSubCategory = catchAsync(async (req, res ,next)=>{

    const {id} = req.params;

    const subCategory = await SubCategory.findById(id).populate({
        path: 'category',
        select: '-__v -updatedAt -createdAt'
    });

    if(!subCategory) return next(new AppError(`No SubCategory with this ID`, 404));

    res.status(200).json({
        status: 'success',
        data: subCategory
    })

});


export const updateSubCategory = catchAsync(async (req, res, next) => {
    if (Object.keys(req.body).length === 0)
      return next(
        new AppError(`Please Provide Values to Update the Category`, 404)
      );
  
      const {id} = req.params;
  
      const updatedSubCategory = await SubCategory.findByIdAndUpdate(id, req.body, {new: true, runValidators: true}).populate('category')
  
      if(!updatedSubCategory) return next(new AppError(`Couldn't Update the SubCategory , No SubCategory with this Id `, 404));
  
      res.status(200).json({
          status:'success',
          data: updatedSubCategory,
          message: 'SubCategory Updated Successfully'
      })
  });


  export const deleteSubCategory = catchAsync(async (req, res ,next)=>{

    const {id} = req.params;

    const deletedSubCategory = await SubCategory.findByIdAndDelete(id);

    if(!deletedSubCategory) return next(new AppError(`No SubCategory with this ID`, 404));

    res.status(204).json({
        status: 'success',
        message: 'SubCategory Deleted Successfully'
    })
  })