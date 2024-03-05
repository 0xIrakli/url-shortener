import mongoose from "mongoose"

const urlSchema = new mongoose.Schema(
  {
    originalUrl: String,
    shortUrl: String
  },
  {
    timestamps: true,
    // versionKey: false
  }
)

export const URL = mongoose.model("URL", urlSchema)