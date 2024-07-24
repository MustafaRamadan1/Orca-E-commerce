import mongoose from "mongoose";

const colorSchema = new mongoose.Schema({
  value: { type: String, required: [true, "Color value is required"] },
  label: { type: String, required: [true, "Color label is required"] },
  color: { type: String, required: [true, "Color is required"] },
  quantity: { type: Number, required: [true, "Color quantity is required"] },
});
const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Types.ObjectId, ref: "Product", required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  color: colorSchema,
});

const orderSchema = new mongoose.Schema(
  {
    transaction_id: {
      type: String,
      required: [true, "Order must has a transaction"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Order must belong to a user"],
    },
    orderPrice: {
      type: Number,
      required: [true, "order must has a price"],
    },
    items: [cartItemSchema],
    orderStatus: {
      type: String,
      enum: {
        values: ["created", "delivering", "delivered", "refund","shipped"],
        message: "Your value not supported",
      },
      default: "created",
    },
    billingData: [
      {
        type: {
          firstName: String,
          lastName: String,
          apartment: String,
          street: String,
          building: String,
          city: String,
          country: String,
          floor: String,
          phoneNumber: String,
        },
      },
    ],
    paymentOrderId: {
      type: String,
      required: [true, "Order must has a payment id"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Order", orderSchema);
