import mongoose from "mongoose";
import { Password } from "../utils/password";

interface UserAttrs {
  email: string;
  password: string;
}

type UserDoc = mongoose.Document &
  UserAttrs & {
    createdAt: string;
    updatedAt: string;
  };

interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc;
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.password;
        delete ret.__v;
        ret.id = ret._id;
        delete ret._id;
      },
    },
  }
);

userSchema.pre("save", async function (done) {
  if (this.isModified("password")) {
    const hashed = await Password.toHash(this.get("password"));

    this.set("password", hashed);
  }

  done();
});

userSchema.statics.build = (attrs: UserAttrs) => {
  const u = new User(attrs);

  return u;
};

export const User = mongoose.model<UserDoc, UserModel>("User", userSchema);
