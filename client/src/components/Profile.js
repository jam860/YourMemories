import React, { useState, useEffect } from "react";
import HomeCard from "./HomeCard";
import { useParams } from "react-router-dom";
import { useRef } from 'react';


export default function Profile(props) {

    const [name, setName] = useState("");
    const [userBio, setUserBio] = useState("");
    const [profilePhoto, setProfilePhoto] = useState("");
    const [changeProfilePhoto, setChangeProfilePhoto] = useState();
    const [previewUrl, setPreviewUrl] = useState("");
    const [albums, setAlbums] = useState("");
    const [realName, setRealName] = useState("");
    const param = useParams();
    const [changeUserBio, setChangeUserBio] = useState("");
    const aRef = useRef(null); //reference to file input;ref={aRef}
    const [alert, setAlert] = useState("");


    let user_id = "";
    if (param.id != undefined) {
        user_id = param.id.split("@")[0];
    }
   
    function changeLike(albumID, status) {
        try {
            if (status == "like") {
                console.log("like");
                fetch(`/api/albums/like?id=${albumID}`, {
                    method: "POST",
                    body: JSON.stringify({albumID: albumID}),
                })
                .catch(error => console.log(error))   
            } else if (status == "unlike") {
                console.log("unlike");
                fetch(`/api/albums/unlike?id=${albumID}`, {
                    method: "POST",
                    body: JSON.stringify({albumID: albumID}),
                })
                .catch(error => console.log(error))   
            }
        } catch (error) {
            console.log(error);
        }
    }


    useEffect(() => {
        let photoAlbums = [];
        fetch(`/api/profile?username=${param.id}@uw.edu`)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                if (data.user != null) {
                    photoAlbums = data.albums.toReversed().map((album, index) => {
                        return (
                            <div key={index} className="col-lg-4 mb-4">
                                <HomeCard
                                    key={index}
                                    album={album}
                                    changeLike={changeLike}
                                    user={props.user}
                                />
                            </div>
                        );
                    });
                    setAlbums(photoAlbums);
                    setName(data.user.name.split(" ")[0]);
                    setUserBio(data.user.biography);
                    setProfilePhoto(data.user.profilePhoto);
                    setRealName(data.user.name);
                } else {
                    setName(null);
                }
            })
            .catch((error) => console.log(error));
    }, [param]);

    
    const handleSubmit = (event) => {
        event.preventDefault();
        const formData = new FormData();
        formData.append('username', props.user.userInfo.username);
        formData.append('biography', changeUserBio);
        formData.append('profilePhoto', changeProfilePhoto);
        fetch('/api/profile', {
            method: 'POST',
            body: formData,
        }).then(() => {
            if (previewUrl != undefined) {
                setProfilePhoto(previewUrl);
                setChangeProfilePhoto("");
            } 
            if (changeUserBio.length > 0) {
                setUserBio(changeUserBio);
                setChangeUserBio(""); 
            }
            setAlert("Your information has been saved!")
        }).catch(error => console.log(error))
    }

    useEffect(() => {
        if (!changeProfilePhoto || changeProfilePhoto === 0) {
            setPreviewUrl();
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            // Push the preview URL to the array
            setPreviewUrl(reader.result);
        };
        reader.readAsDataURL(changeProfilePhoto);
        
    }, [changeProfilePhoto]);

    function photosChange(event) {
        setChangeProfilePhoto(event.target.files[0]);
    }

    if (name != null) {
    return (
        <div className="profile-album">
            <h1 className="page-heading">
                {name}'s Albums
            </h1>

            <div className="container row">
                <div className="profile col-4">
                    <div className="photo-username">
                        {(profilePhoto != undefined && profilePhoto.length != 0) ? <img src={profilePhoto} width="300" height="300"/> : <img src={"https://info441photoalbum.blob.core.windows.net/images/981d6b2e0ccb5e968a0618c8d47671da.jpg"} width="300" height="300"/>}
                        <h2 className="profile-name pt-3">{realName}</h2>
                        <h3 className="profile-username">
                            @{user_id}
                        </h3>
                        <h4>{albums.length + " posts"}</h4>
                    </div>
                    <div className="biography">
                        <div className="about-me">
                            <p>{userBio ? userBio : "This user does not have a biography."}</p>
                        </div>
                        {props.user.status == "loggedin" && props.user.userInfo.username == param.id + "@uw.edu"  &&
                        <div className="">
                            <h4 className="mt-5">Edit Biography: </h4>
                            <textarea className="form-control" value={changeUserBio} rows={6} onChange={(event) => {
                                setChangeUserBio(event.target.value);
                            }} />
                            <h4 className="mt-5">Edit Profile Picture: </h4>
                            <div className="mb-3">
                                <div className="mb-3">
                                    <input ref={aRef} type="file" title=" " className="custom-file-input" onChange={photosChange} accept="image/*" />
                                </div>
                            </div>
                            {changeProfilePhoto && <>
                            <p> New Profile Picture: </p>
                            <div className="d-flex flex-wrap">
                                {previewUrl && <img className="imgPreview" src={previewUrl} alt="preview" />}
                            </div>
                            </>
                            }
                            
                            <button type="button" className="btn btn-dark mt-2 mb-4" onClick={handleSubmit}>Save</button>
                            <p>{alert}</p>
                        </div>
                        } 
                    </div>
                </div>

                <div className="albums col-8">
                    <div className="profile-card cards row d-flex d-wrap">
                            {albums}
                    </div>
                </div>
            </div>
        </div>
    )} else if (name == null) {
            return(
            <>
            <div className="profile-album">
                <h1 className="page-heading">This user doesn't exist!</h1>
            </div>
            </>
            )
    }
}
