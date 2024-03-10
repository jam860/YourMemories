import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config();

let models = {}

await mongoose.connect(process.env.MONGODB_CONNECTION);
  

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    biography: String,
    profilePhoto: String
})

const albumSchema = mongoose.Schema({
    name: String,
    username: String,
    albumName: String,
    description: String,
    photos: [String],
    likes: [String],
    tags: [String],
    uploadDate: { type: Date, default: Date.now },
    isPrivate: Boolean,
    invitedUsers: [String]
});

const commentSchema = mongoose.Schema({
    username: String,
    email: String,
    comment: String,
    album: String,
    uploadDate: { type: Date, default: Date.now }
});

models.User = mongoose.model("User", userSchema);
models.Album = mongoose.model("Album", albumSchema);
models.Comment = mongoose.model("Comment", commentSchema);

export default models;