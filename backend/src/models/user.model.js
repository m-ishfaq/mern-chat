import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      unique: [true, "Email already exists"],
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
      select: false,
      minlength: [6, "Password must be at least 6 characters"],
    },
    avatar: {
      public_id: String,
      url: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  next();
});

const User = mongoose.model("User", userSchema);

export default User;
