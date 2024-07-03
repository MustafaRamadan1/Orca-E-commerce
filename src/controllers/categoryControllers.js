import slug from "slug";
import { catchAsync } from "../utils/catchAsync.js";
import AppError from "../utils/AppError.js";
import Category from "../Db/models/category.model.js";

// create category , get all categories , get one cateogry , update one , delete one

export const createCategory = catchAsync(async (req, res, next) => {
  const { name, description } = req.body;

  if(!name || !description) return next(new AppError(`Please Provide Required Fields`, 404));
  
  const newCategory = await Category.create({
    name,
    description,
    slug: slug(name, "_"),
  });

  if (!newCategory)
    return next(new AppError(`We Couldn't Create new Category`, 404));

  res.status(200).json({
    status: "success",
    data: newCategory,
  });
});

export const getAllCategories = catchAsync(async (req, res, next) => {

  if(!req.query.letter) return next(new AppError(` Please Provide Letter`,400));
  
  const regex = new RegExp(req.query.letter, 'i');

  const allCategories = await Category.find({name: regex});

  if (!allCategories) return next(new AppError(`No Category in the DB`, 404));

  res.status(200).json({
    status: "success",
    data: allCategories,
  });
});

export const getCategory = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const category = await Category.findById(id);

  if (!category) return next(new AppError(`No Category with this ID`, 404));

  res.status(200).json({
    status: "success",
    data: category,
  });
});

export const updateCategory = catchAsync(async (req, res, next) => {
  if (Object.keys(req.body).length === 0)
    return next(
      new AppError(`Please Provide Values to Update the Category`, 404)
    );

    const {id} = req.params;

    const updatedCategory = await Category.findByIdAndUpdate(id, req.body, {new: true, runValidators: true});

    if(!updatedCategory) return next(new AppError(`Couldn't Update the Category , No Category with this Id `, 404));

    res.status(200).json({
        status:'success',
        data: updatedCategory,
        message: 'Category Updated Successfully'
    })
});

export const deleteCategory = catchAsync(async (req, res ,next)=>{

    const {id} = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id);

    if(!deletedCategory) return next(new AppError('No Category with this Id', 404));

    res.status(204).json({
        status:'success',
        message: 'Category Deleted Successfully'
    })
})
