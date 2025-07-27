// /lib/models/User.ts
import mongoose, { Schema, models, model } from 'mongoose'

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed password!
  name: { type: String }
})

const User = models.User || model('User', UserSchema)
export default User
