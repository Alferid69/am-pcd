const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name field is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name field is required"],
      trim: true,
    },
    username: {
      type: String,
      required: [true, "Username field is required"],
      unique: true,
      trim: true,
      maxlength: 20,
      minlength: 5,
    },
    phone: {
      type: String,
      required: [true, "Phone field is required"],
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email field is required"],
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password field is required"],
      minlength: 8,
      maxlength: 20,
    },

    passwordChangedAt: Date,
    role: {
      type: String,
      enum: ["admin", "user"], // TODO: add more roles
      default: "user",
    },
    worksAt: { type: mongoose.Schema.Types.ObjectId},
  },
  {
    timestamps: true,
  }
);

userSchema.pre(/^find/, function () {
  this.populate("role", "name");
});

userSchema.pre("save", async function () {
  // to only run this if password field is changed
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.pre("save", function () {
  if (!this.isModified("password") || this.isNew) return;

  this.passwordChangedAt = Date.now() - 1000;
});

// This function will be available for every doc created using User model
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // FALSE means not changed
  return false;
};

const User = mongoose.model("User", userSchema);

module.exports = User;