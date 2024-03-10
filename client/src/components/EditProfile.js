import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom'
import { useRef } from 'react';

export default function Profile(props) {
    // const [user, setUser] = useState("");
    const [userBio, setUserBio] = useState("");
    const [alert, setAlert] = useState("");
  

    const [photos, setPhotos] = useState([]);
    const [previewUrls, setPreviewUrl] = useState([]);
    const aRef = useRef(null); //reference to file input;ref={aRef}

    const redirect = useNavigate();

    if (props.user == undefined || props.user.status == "loggedout") {
        redirect("/")
    }

    useEffect(() => {
        if (!photos || photos.length === 0) {
            setPreviewUrl([]);
            return;
        }

        const previewUrlsCopy = [];
        for (let i = 0; i < photos.length; i++) {
            const reader = new FileReader();

            reader.onloadend = () => {
                // Push the preview URL to the array
                previewUrlsCopy.push(reader.result);

                // If all photos have been processed, update state with all preview URLs
                if (previewUrlsCopy.length === photos.length) {
                    setPreviewUrl(previewUrlsCopy);
                }
            };
            reader.readAsDataURL(photos[i]);
        }


    }, [photos]);

    function photosChange(event) {
        setPhotos([...event.target.files]);
    }


    const handleSubmit = (event) => {
        event.preventDefault();
        fetch('/api/profile', {
            method: 'POST',
            body: JSON.stringify({ username: props.user.userInfo.username, biography: userBio, profilePhoto: photos}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            setAlert("Your album has been successfully uploaded!");
            return new Promise(resolve => setTimeout(resolve, 1000));  
        }).then(() => {
            redirect("/profile")
        }
           
        ).catch(error => console.log(error))
    }


    return (
        <div className="container">
            <h1 className="mt-4 mb-5">Edit Profile</h1>
            <div className="row">
                <div className="createBox d-flex mb-5 col-4">
                    <div>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label htmlFor="fileUpload" className="form-label"><strong>Upload Profile</strong></label>
                                <div className="mb-3">
                                    <input ref={aRef} type="file" className="form-control-file" onChange={photosChange} accept="image/*" />
                                </div>
                            </div>

                            <p> Preview Photos: </p>
                            <div className="d-flex flex-wrap">
                                {previewUrls && previewUrls.map((url, index) => {
                                    return (
                                        <div key={index} className="me-4 mt-4 mb-4">
                                            <img className="imgPreview" src={url} alt="preview" />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mb-3">
                                <label htmlFor="username" className="form-label"><strong>Username</strong></label>
                                <p>{props.user.userInfo.username}</p>

                            </div>
                            <div className="mb-3">
                                <label htmlFor="biography" className="form-label"><strong>About Me</strong></label>
                                <input type="text" rows="5" className="form-control" onChange={(e) => setUserBio(e.target.value)} />
                            </div>


                            <button type="submit" className="btn btn-primary">Submit</button>
                            <p className="alert">{alert}</p>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
