import crypto from "crypto";
import User from "../Db/models/user.model.js";
import AppError from "../utils/AppError.js";
import { catchAsync } from "../utils/catchAsync.js";
import jwt from "jsonwebtoken";
import { signToken, compileTemplate } from "../utils/helperFunc.js";
import sendEmail from "../utils/sendEmail.js";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const signUp = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const newUser = await User.create({
    name,
    email,
    password,
  });

  if (!newUser) return next(new AppError(`Couldn't create new User`, 400));

  const otp = newUser.createOTP();
  await newUser.save();

  const html = compileTemplate(`${__dirname}/../views/activateAccount.pug`, {
    firstName: newUser.name,
    otpCode: otp,
  });

  await sendEmail({
    to: newUser.email,
    subject: "Verify Your Email",
    text: `To Verfiy your account in our site , It's your OTP : ${otp}`,
    html,
  });

  const token = signToken({ id: newUser._id });

  res.status(200).json({
    status: "success",
    token,
    data: newUser,
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).populate("cart");

  if (!user) return next(new AppError(`Invalid email or password`, 404));

  if (!(await user.CheckPassword(password)))
    return next(new AppError(`Invalid email or password`, 404));

  if (!user.isActive)
    return next(new AppError("Please Active your account", 401));

  const token = signToken({ id: user._id });

  res.status(200).json({
    status: "success",
    token,
    data: user,
  });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: "success",
    data: users,
  });
});

export const forgetPassword = catchAsync(async (req, res, next) => {
  const { email, locale } = req.body;
  // if(!email) return next(new AppError(`Please Provide Email`, 404));

  const user = await User.findOne({ email });
  if (!user) return next(new AppError(`No User with This Email`, 404));

  const token = user.createResetPasswordToken();

  await user.save();

  await sendEmail({
    to: user.email,
    subject: "Forget Your Password , Please Check Email to reset it again",
    text: `If you forget your Password Please click on the link below\n
          ${req.protocol}://${
      req.get("host").split(":")[0]
    }:3000/${locale}/user/resetPassword/${token}`,
  });

  res.status(200).json({
    status: "success",
    message: "Email Sent Successfully",
  });
});

export const resetPassword = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const { newPassword } = req.body;

  // if (!token || !newPassword)
  //   return next(new AppError(`Please provide a token and a new password`, 400));

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gte: Date.now() },
  });

  if (!user)
    return next(
      new AppError(`Expired or Invalid Reset Token , Please Try again`, 400)
    );

  user.password = newPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password Reset Successfully",
  });
});

export const activateUser = catchAsync(async (req, res, next) => {
  const { otp } = req.body;

  const otpCode = crypto.createHash("sha256").update(otp).digest("hex");

  const user = await User.findOne({
    otpCode,
    otpExpired: { $gte: Date.now() },
  });

  if (!user)
    return next(new AppError(`Expired or Invalid OTP , Please Try again`, 400));

  user.isActive = true;
  user.otpCode = undefined;
  user.otpExpired = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    // message: "User Activated Successfully",
    data: user,
  });
});

export const updateUserPassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) return next(new AppError(` User Not Found`, 404));

  if (!(await user.CheckPassword(oldPassword)))
    return next(new AppError(` Invalid Password`, 400));

  user.password = newPassword;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password Changed Successfully",
  });
});


export const getUserById = catchAsync(async (req, res, next) => {

  const {id} = req.params;

  const user = await User.findById(id).populate('cart');

  if(!user) return next( new AppError(`No User with this id`, 404));

  res.status(200).json({
    status:'success',
    data:user
  });
})


export const deleteUser = catchAsync(async (req, res, next) => {

  
})