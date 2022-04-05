import mongoose from 'mongoose'

const Schema = mongoose.Schema

const profileSchema = new mongoose.Schema({
  email: {type: String, required: true, lowercase: true, unique: true},
  name: String,
  location: String, 
  skillLevel: Number, 
  pilot: {type: Boolean},
  kayakSUP: {type: Boolean},
  photo: String,
  contact: {type: String},
  favLocations: {type: mongoose.Schema.Types.ObjectId, ref: "Location"}, 
},{
    timestamps: true,
})

const Profile = mongoose.model('Profile', profileSchema)

export {Profile}

