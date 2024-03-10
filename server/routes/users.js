import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get("/myInfo", async (req, res) => {
    try {
        if (!req.session.isAuthenticated) {
            res.json({ status: "loggedout" });
        } else {
            if (req.session.account != null) {
                const existingUser = await req.models.User.findOne({ username: req.session.account.username });
                if (!existingUser) {
                    let newUser = new req.models.User({
                        username: req.session.account.username,
                        name: req.session.account.name,
                        biography: "",
                        profilePhoto: "",
                    })
                    newUser.save()
                    .then((newUser) => {
                        res.json({
                            status: "loggedin",
                            userInfo: {
                                name: req.session.account.name,
                                username: req.session.account.username,
                                name: req.session.account.name,
                                id: newUser._id,
                            }
                        });
                    })
                } else {
                    res.json({
                        status: "loggedin",
                        userInfo: {
                            name: req.session.account.name,
                            username: req.session.account.username,
                            name: req.session.account.name,
                            id: existingUser._id,
                        }
                    });
                }
            }
            
        }
    } catch (err) {
        console.log(err);
    }
});

export default router;
