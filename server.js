import express from "express"
import cors from "cors"
import mongoose from 'mongoose'
import { URL } from './URL.js'
import { customAlphabet } from 'nanoid'

const baseURL = 'http://localhost:3000'
const nanoid = customAlphabet('1234567890abcdef', 6)
const app = express()

app.use(
  cors({
    origin: '*'
  })
)

app.use(express.json())

app.get('/urls', async (req, res) => {
  const urls = await URL.find({}).select('-updatedAt -_id')

  return res.json(urls)
})

app.post('/urls', async (req, res) => {
  const data = req.body

  if (await URL.findOne({ shortUrl: data.customPath })) {
    // generate new custom path
    data.customPath = null
  }

  const urlObject = {
    originalUrl: data.originalUrl,
    shortUrl: data?.customPath || nanoid()
  }

  const newURL = new URL(urlObject)
  await newURL.save()

  res.status(201).json({ ...urlObject, shortUrl: `${baseURL}/${urlObject.shortUrl}` })
})

app.get('/urls/:shortUrl', async (req, res) => {
  const url = await URL.findOne({ shortUrl: req.params.shortUrl }).exec()
  if (!url) {
    return res.status(404).json({ 'message': '404 URL Not Found' })
  }

  return res.redirect(url.originalUrl)
})

app.patch('/urls/:shortUrl', async (req, res) => {
  const data = req.body

  await URL.findOneAndUpdate({ shortUrl: req.params.shortUrl }, { originalUrl: data.newOriginalUrl }).exec()

  return res.json({ 'message': 'URL updated successfully', 'updatedURL': { originalUrl: data.newOriginalUrl, shortUrl: `${baseURL}/${req.params.shortUrl}` } })
})

app.listen(3000, async () => {
  console.log('Server Started...')

  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/url-shortener")
    console.log("Connected to the database...")
  } catch (error) {
    console.log(error)
  }
})