import express from 'express';
var router = express.Router();

import multer from 'multer';
import MulterAzureStorage from 'multer-azure-storage';

const connectionString = process.env.AZURE_BLOB_STORAGE;
const upload = multer({
  storage: new MulterAzureStorage({
    azureStorageConnectionString: connectionString,
    containerName: 'images',
    containerSecurity: 'blob'
  })
});

router.get("/", async (req, res) => {
    try {
            const existingUser = await req.models.User.findOne({ username: req.query.username });
            let allAlbums;
            if (req.session.isAuthenticated && req.session.account.username == req.query.username) {
                allAlbums = await req.models.Album.find({ username: req.query.username  });  // Filter by user
            } else {
                allAlbums = await req.models.Album.find({ username: req.query.username, isPrivate: "false" });
            }
           

            // Combine the album and user data
            let combinedData = {
                albums: allAlbums,
                user: existingUser
            };

            res.json(combinedData).status(201);
        

    } catch (error) {
        console.log(error);
        res.status(500).json({ status: "erorr", error: error.message });
    }

});


router.post("/", upload.single('profilePhoto'), async (req, res) => {
    const username = req.body.username;
    const biography = req.body.biography;
    try {
        if (!req.session.isAuthenticated) {
            res.json({ status: "error", error: "not logged in" }).status(401);
        } else if (req.session.account.username != req.body.username) {
            res.json({ status: "error", error: "You cannot change another person's account information." }).status(401);
        }
        else {
            if (biography.length > 0 && req.file != undefined) {
                await req.models.User.updateOne({ username }, { $set: { biography: biography, profilePhoto: req.file.url }  });
                res.json({ status: "success", action: "update" });
            } else if (req.file != undefined) {
                await req.models.User.updateOne({ username }, { $set: { profilePhoto: req.file.url }  } );
                res.json({ status: "success", action: "update" });
            } else {
                await req.models.User.updateOne({ username }, { $set: { biography: biography }  } );
                res.json({ status: "success", action: "update" });
            }    
        }


    } catch (error) {
        console.log(error);
        res.json({ status: "error" }).status(500);
    }

});



export default router;


