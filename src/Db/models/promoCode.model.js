import mongoose from "mongoose";

const promoCodeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, "Code is Required"],
    validate: {
      validator: function (codeValue) {
        return /[a-zA-Z0-9]+$/.test(codeValue);
      },
      message: (props) =>
        `${props.value} is not a valid code! Code must start with 'ORCA-' followed by numbers or letters.`,
    },
  },
  expirationDate: {
    type: Date,
    required: [true, "Expiration Date is Required"],
  },
  discount: {
    type: Number,
    required: [true, "Discount is Required"],
    min: [0, "Discount can not be negative"],
    max: [100, "Discount can not be more than 100"],
  },
},{
  timestamps:true
});

promoCodeSchema.pre("save", function (next) {
  const prefix = "ORCA-";
  if (!this.code.startsWith(prefix)) {
    this.code = `${prefix}${this.code}`;
  }
  next();
});

const PromoCode = mongoose.model("PromoCode", promoCodeSchema);
export default PromoCode;
