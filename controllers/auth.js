import { User } from '../models/user.js'
import { Profile } from '../models/profile.js'
import {v2 as cloudinary} from 'cloudinary'
import jwt from 'jsonwebtoken'

function signup(req, res) {
  Profile.findOne({ email: req.body.email })
  .then(profile => {
    if (profile) {
      throw new Error('Account already exists')
    } else if (!process.env.SECRET){
      throw new Error('no SECRET in .env file')
    } else {
      if (req.body.photo === 'undefined' || !req.files['photo']) {
        delete req.body['photo']
        req.body.pilot = {
          canPilot: req.body.pilot, 
          hasKayakSUP: req.body.kayakSUP}
        Profile.create(req.body)
        .then(newProfile => {
          req.body.profile = newProfile._id
          User.create(req.body)
          .then(user => {
            const token = createJWT(user)
            res.status(200).json({ token })
          })
          .catch(err => {
            Profile.findByIdAndDelete(req.body.profile)
            res.status(500).json({err: err.errmsg})
          })
        })
      } else {
        console.log(req.files.photo.path)
        const imageFile = req.files.photo.path
        cloudinary.uploader.upload(imageFile, {tags: `${req.body.name}`})
        .then(image => {
          req.body.photo = image.url
          req.body.pilot = {
            canPilot: req.body.pilot, 
            hasKayakSUP: req.body.kayakSUP}
          Profile.create(req.body)
          .then(newProfile => {
            req.body.profile = newProfile._id
            User.create(req.body)
            .then(user => {
              const token = createJWT(user)
              res.status(200).json({ token })
            })
          .catch(err => {
            Profile.findByIdAndDelete(req.body.profile)
            res.status(500).json({err: err.errmsg})
          })
        })
        })
      }
    }
  })
  .catch(err => {
    res.status(500).json({err: err.message})
  })
}


function login(req, res) {
  User.findOne({ email: req.body.email })
  .then(user => {
    if (!user) return res.status(401).json({ err: 'User not found'})
    user.comparePassword(req.body.pw, (err, isMatch) => {
      if (isMatch) {
        const token = createJWT(user)
        res.json({ token })
      } else {
        res.status(401).json({ err: 'Incorrect password' })
      }
    })
  })
  .catch(err => {
    res.status(500).json(err)
  })
}

function changePassword(req, res) {
  User.findById(req.user._id)
  .then(user => {
    if (!user) return res.status(401).json({ err: 'User not found'})
    user.comparePassword(req.body.pw, (err, isMatch) => {
      if (isMatch) {
        user.password = req.body.newPw
        user.save()
        .then(()=> {
          const token = createJWT(user)
          res.json({ token })
        })
      } else {
        res.status(401).json({ err: 'Incorrect password' })
      }
    })
  })
}

/* --== Helper Functions ==-- */

function createJWT(user) {
  return jwt.sign(
    { user }, 
    process.env.SECRET,
    { expiresIn: '24h' }
  )
}

export {signup, login, changePassword}
