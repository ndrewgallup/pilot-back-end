import { Location } from "../models/location.js";
import axios from 'axios'


async function index (req, res) {
  try {
    const locations = await Location.find({})
    .populate('owner')
    console.log(locations)
    return res.status(201).json(locations)
  } catch(err) {
    return res.status(500).json(err)
  }
  // Location.find({})
  // .populate('owner')
  // .then(locations => {
  //   return res.json(locations)
  // })
  // .catch(err => {
  //   res.json(err)
  // })
}

async function create(req, res) {
  console.log(req.body)
  try{
    req.body.owner = req.user.profile
    const location = new Location(req.body)
    await location.save()
    return res.status(201).json(location)
  } catch(err) {
    return res.status(500).json(err)
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

  
  // Location.create(req.body)
  //   .populate('owner')
  //   .exec(newLocation => {
  //     return 
  //   })
  // .catch(err => {
  //   console.log(err)
    
  // })


function getLocation(req, res) {
  axios.get(`https://dev.virtualearth.net/REST/v1/Imagery/Map/AerialWithLabels/landmark=${req.params.name}?mapSize=500,400&key=${process.env.API_KEY}`)
  .then(apiResponse => {
    console.log('Loooooooookkkkkkkk', apiResponse)
    res.json(apiResponse.data)
  })
}

export {
  index,
  create,
  getLocation,
  createComment,
}