import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:  { type: String, required: true, minlength: 6, select: false },
    phone:     { type: String, trim: true },
    role: {
      type: String,
      enum: ["admin", "doctor", "patient"],
      default: "patient",
    },
    avatar:   { type: String, default: null },
   isActive: {
  type: Boolean,
  default: true,
},

isDeleted: {
  type: Boolean,
  default: false,
},

deletedAt: {
  type: Date,
  default: null,
},
  },
  { timestamps: true }
);


// Virtual: full name
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});
// Allow virtual fields to appear in JSON responses
userSchema.set("toJSON", {
  virtuals: true,
});

const User = mongoose.model("User", userSchema);
export default User;


