import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    intention_id: {
      type: String,
      required: [true, "Payment intention id is required"],
    },
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: [true, "Payment must belong to a user"],
    },
    cartItems: [
      {
        type: mongoose.Types.ObjectId,
        ref: "CartItem",
        required: [true, "Payment should has cart items"],
      },
    ],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", paymentSchema);
