import { Location } from "../models/location.js";
import axios from 'axios'
import {v2 as cloudinary} from 'cloudinary'


async function index (req, res) {
  console.log('yo')
  try {
    Location.find({})
    .populate('owner')
    .populate({path: 'comments', populate: {path:'owner'}})
    .then(locations => res.json(locations))
  } catch(err) {
    return res.status(500).json(err)
  }
}

function create(req, res) {
  req.body.owner = req.user.profile
  if (!req.files['pictures']) {
    Location.create(req.body)
    .then(location => {
      location.populate('owner')
      .then(populatedLocation => {
        res.status(201).json(populatedLocation)
      })
    })
    .catch(err => {
      console.log(err)
      res.status(500).json(err)
    })
  } else {
    cloudinary.uploader.upload(req.files.pictures.path)
    .then(picture => {
      console.log(picture)
      req.body.pictures = picture.url
      Location.create(req.body)
      .then(location => {
        location.populate('owner')
        .then(populatedLocation => {
          console.log(populatedLocation)
          res.status(201).json(populatedLocation)
        })
      })
      .catch(err => {
        console.log(err)
        res.status(500).json(err)
      })
    })
  }
}

  async function createComment(req, res) {
    try {
      req.body.owner = req.user.profile
      const location = await Location.findById(req.params.id)
      await location.comments.push(req.body)
      await location.save()
      return res.status(201).json(location)
    } catch(err) {
      return res.status(500).json(err)
    }
  }

function getLocation(req, res) {
  axios.get(`https://dev.virtualearth.net/REST/v1/Imagery/Map/AerialWithLabels/landmark=${req.params.name}?mapSize=500,400&key=${process.env.API_KEY}&o=json`)
  .then(apiResponse => {
    res.set('Content-Type', 'image/jpeg')
    res.send(Buffer.from(apiResponse.data, 'binary').toString('base64'))
    res.send(apiResponse.data)
  })
}

function update(req, res) {
  Location.findByIdAndUpdate(req.params.id, req.body, {new: true})
  .then(location => res.json(location))
  .catch(err => res.json(err))
}

function show(req, res) {
  Location.findById(req.params.id)
  .populate('owner')
  .populate({path: 'comments', populate: {path:'owner'}})
  .then(location => res.json(location))
  .catch(err => res.json(err))
}

function deleteComment(req, res) {
  Location.findById(req.params.locationId)
  .then(location => {
  location.comments.remove({_id: req.params.commentId})
  location.save()
  .then(location => {
  res.json(location)}) 
  
  })
  .catch(err => res.json(err))
}

export {
  index,
  create,
  getLocation,
  createComment,
  update,
  show,
  deleteComment as delete
}