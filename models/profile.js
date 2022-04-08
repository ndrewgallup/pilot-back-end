import mongoose from 'mongoose'

const Schema = mongoose.Schema

const pilotSchema = new mongoose.Schema({
  canPilot: {type: Boolean},
  hasKayakSUP: {type: Boolean},
})

const profileSchema = new mongoose.Schema({
  email: {type: String, required: true, lowercase: true, unique: true},
  name: String,
  location: String, 
  skillLevel: Number, 
  pilot: [pilotSchema],
  photo: String,
  contact: {type: String},
  favLocations: {type: mongoose.Schema.Types.ObjectId, ref: "Location"}, 
},{
    timestamps: true,
})

const Profile = mongoose.model('Profile', profileSchema)

export {Profile}

