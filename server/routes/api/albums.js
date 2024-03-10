import express from 'express';
var router = express.Router();

import multer from 'multer';
import MulterAzureStorage from 'multer-azure-storage';

// Set up Azure Blob Storage
const connectionString = process.env.AZURE_BLOB_STORAGE;
const containerName = 'images';

const upload = multer({
  storage: new MulterAzureStorage({
    azureStorageConnectionString: connectionString,
    containerName: 'images',
    containerSecurity: 'blob'
  })
});


//create a new album
router.post('/create', upload.any(), async (req, res) => { //any() just uploads everything in formData from the client side
  try {
    if (!req.session.isAuthenticated) {
      res.json({ status: "error", error: "not logged in" }).status(401);
    }
    else {
      const files = req.files; //after uploading, its put in files field
      let photoURLS = [];
      for (let file of files) {
        photoURLS.push(file.url);
      }
      
      let tags = [];
      if (req.body.tags != undefined && req.body.tags.length != 0) {
        tags = req.body.tags.split(",");
        tags = tags.map((tag) => {
          return "#" + tag;
        });
      } 
      

      let newAlbum = new req.models.Album({
        name: req.body.name,
        username: req.body.username,
        albumName: req.body.albumName,
        description: req.body.albumDescription,
        tags: tags,
        photos: photoURLS,
        likes: [],
        isPrivate: req.body.isPrivate,
        invitedUsers: []
      }) //date is already placed in because of model

      newAlbum.save()
        .then((savedAlbum) => {
          res.status(201).json({ status: "success", savedAlbum: savedAlbum })
        })
        .catch((error) => {
          console.log(error);
          res.json({ status: "error" }).status(500);
        });
    }


  } catch (error) {
    console.log(error);
    res.json({ status: "error" }).status(500);
  }
  //create client blob beforehand in models, attach blob connection to models, use middleware to help read files, then upload to database
  //once uploaded, return successful
});

router.get("/view", async (req, res) => {
  // this one gets all the photo albums and displays on home screen UNLESS THERE IS A QUERY PARAMETER!!!
  let albumID = req.query.id;
  let albumSearch = req.query.search;
  let username = "";
  if(req.session.account){
    username = req.session.account.username;
  }
  try {
    if (albumID) {
      let album = await req.models.Album.findById(albumID);
      if(album && checkIfAlbumShouldBeShown(album, username)){
        res.json(album).status(201);
      }
      else{
        res.json({status:"error"}).status(400)
      }
    } else if (albumSearch) {
      let allAlbums = await req.models.Album.find({$or: [{ isPrivate: false }, { username: username }]});
      let albumsMatch = [];
      for (let album of allAlbums) {

        if (album.albumName.toLowerCase().includes(albumSearch.toLowerCase()) || ("@" + album.username.toLowerCase()).includes(albumSearch.toLowerCase())
        ) {
          albumsMatch.push(album);
        }

        if (!albumsMatch.includes(album)) {
          for (let tag of album.tags) {
            if (tag.toLowerCase().includes(albumSearch.toLowerCase())) {
              albumsMatch.push(album);
              break;
            }
          }
        } 
      }
      res.json(albumsMatch).status(201);
    } else {
      let allAlbums = await req.models.Album.find({$or: [{ isPrivate: false }, { username: username }]});
      res.json(allAlbums).status(201);
    }
  } catch (error) {
    console.log(error);
    res.json({ status: "error" }).status(500);
  }
});

router.delete('/', async (req, res) => {
  let albumID = req.body.albumID;
  if (!req.session.isAuthenticated) {
    res.json({ status: "error", error: "not logged in" }).status(401);
  } else {
    try {
      let album = await req.models.Album.findById(albumID);
      if (req.session.account.username != album.username) {
        res.json({
          status: 'error',
          error: "you can only delete your own posts"
        }).status(403);
      } else {
        await req.models.Comment.deleteMany({ album: albumID });
        await req.models.Album.deleteOne({ _id: albumID });
        res.json({ status: "success" }).status(201);
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ "status": "error", "error": error });

    }
  }

});

router.post('/like', async (req, res) => {
  let albumID = req.query.id;
  if (!req.session.isAuthenticated) {
    res.json({ status: "error", error: "not logged in" }).status(401);
  } else {
    try {
      await req.models.Album.updateOne(
        { _id: albumID, likes: {$ne: req.session.account.username} },
        { $push: { likes: req.session.account.username } }
      )
      res.json({ status: "success" }).status(201);
    } catch (error) {
      console.log(error);
      res.status(500).json({ "status": "error", "error": error });
    }
  }
});

router.post('/unlike', async (req, res) => {
  let albumID = req.query.id;
  if (!req.session.isAuthenticated) {
    res.json({ status: "error", error: "not logged in" }).status(401);
  } else {
    try {
      await req.models.Album.updateOne(
        { _id: albumID, likes: req.session.account.username },
        { $pull: { likes: req.session.account.username } }
      );
      res.json({ status: "success" }).status(201);
    } catch (error) {
      console.log(error);
      res.status(500).json({ "status": "error", "error": error });
    }
  }
});

router.post("/comment", async (req, res) => {
  try {
    if (!req.session.isAuthenticated) {
      res.json({ status: "error", error: "not logged in" }).status(401);
    }
    let newComment = new req.models.Comment({
      username: req.body.username,
      email: req.body.email,
      comment: req.body.comment,
      album: req.body.album,
    });
    await newComment.save();
    res.json({ status: "success" }).status(201);
  } catch (error) {
    res.json({ status: "error" }).status(500);
    console.log(error);
  }
});

router.get("/comment", async (req, res) => {
  let albumID = req.query.id;
  try {
    let comments = await req.models.Comment.find({
      album: albumID
    });
    res.json(comments).status(201);
  } catch (error) {
    res.json({ status: "error" }).status(500);
    console.log(error);
  }
})

function checkIfAlbumShouldBeShown(album, username){
  return !album.isPrivate || album.username === username || album.invitedUsers.includes(username)
}


export default router;