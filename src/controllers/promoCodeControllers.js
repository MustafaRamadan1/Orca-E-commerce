import PromoCode from "../Db/models/promoCode.model.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createPromoCode = catchAsync(async (req, res, next) => {
  const { code, expirationDate, discount } = req.body;
  console.log(code);

  const newPromoCode = await PromoCode.create({
    code,
    expirationDate,
    discount,
  });

  if (!newPromoCode)
    return next(new AppError(`Couldn't Create new PromoCode`, 400));

  res.status(201).json({
    status: "success",
    data: newPromoCode,
  });
});

export const getAllPromos = catchAsync(async (req, res, next) => {
  const allPromoCodes = await PromoCode.find();

  if (!Array.isArray(allPromoCodes))
    return next(new AppError(`No promo found `, 404));

  res.status(200).json({
    status: "success",
    length: allPromoCodes.length,
    data: allPromoCodes,
  });
});

export const getPromoCodeByCode = catchAsync(async (req, res, next) => {
  const { code } = req.params;

  const currentPromo = await PromoCode.findOne({ code });

  let allPromoCodes = PromoCode.find();

  if (allPromoCodes.length === 0) {
    allPromoCodes = [];
  }

  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 5;
  const skip = (page - 1) * limit;

  allPromoCodes = await allPromoCodes
    .sort("-createdAt")
    .skip(skip)
    .limit(limit);

  if (!currentPromo)
    return next(new AppError(`No promo found with this code`, 404));

  res.status(200).json({
    status: "success",
    data: currentPromo,
  });
});

export const getPromoCode = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const currentPromo = await PromoCode.findById(id);

  if (!currentPromo)
    return next(new AppError(`No promo found with this id`, 404));

  res.status(200).json({
    status: "success",
    data: currentPromo,
  });
});

export const updatePromoCode = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { code, expirationDate, discount } = req.body;
  const updatedPromoCode = await PromoCode.findByIdAndUpdate(
    id,
    {
      code,
      expirationDate,
      discount,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedPromoCode)
    return next(new AppError(`No promo found with this id to update it `, 404));

  res.status(200).json({
    status: "success",
    data: updatedPromoCode,
  });
});

export const deletePromoCode = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const deletedPromoCode = await PromoCode.findOneAndDelete({
    _id: new Object(id),
  });

  if (!deletedPromoCode)
    return next(new AppError(`No promo found with this id to delete it `, 404));

  res.status(204).json({
    status: "success",
    message: "Promo Deleted Successfully",
  });
});
