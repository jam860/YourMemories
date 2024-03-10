import { useState } from "react"
import { useEffect } from "react";
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom'
import CreateTag from "./CreateTag";

export default function Create(props) {
    const [albumName, setAlbumName] = useState("");
    const [albumDescription, setAlbumDescription] = useState("");
    const [photos, setPhotos] = useState([]);
    const [previewUrls, setPreviewUrl] = useState([]);
    const [alert, setAlert] = useState("");
    const [tag, setTag] = useState("");
    const aRef = useRef(null); //reference to file input;
    const [tagsContent, setTagsContent] = useState([]); //for sending to backend
    const [tags, setTags] = useState([]); //for frontend only
    const [isPrivate, setIsPrivate] = useState(false);
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

    useEffect(() => {
        let newTags = [];
        tagsContent.forEach((tag, index) => {
            newTags.push(<CreateTag key={index} tag={tag} deleteTag={deleteTag} />);
        });
        setTags(newTags);
    }, [tagsContent]);


    function albumNameChange(event) {
        let newValue = event.target.value
        setAlbumName(newValue);
    }

    function albumDescriptionChange(event) {
        let newValue = event.target.value;
        setAlbumDescription(newValue);
    }

    function photosChange(event) {
        setPhotos([...event.target.files]);
    }

    function tagsChange(event) {
        let newValue = event.target.value;
        setTag(newValue);
    }

    function deleteTag(tagRemove) {
        let tempTags = [...tagsContent];
        tempTags = tempTags.filter((tag) => {
            return tag !== tagRemove;
        });
        setTagsContent(tempTags);
    }

    function addTag() {
        if (tagsContent.includes(tag) || tag.length == 0) {
            return;
        }
        let tempTags = [...tagsContent];
        tempTags.push(tag);
        setTagsContent(tempTags);
        setTag("");
    }

    function isPrivateChange(event){
        let newValue = event.target.checked;
        console.log(newValue);
        setIsPrivate(newValue);
    }


    function submitAction(event) {
        event.preventDefault();
        event.stopPropagation();
        const formData = new FormData();
        formData.append('name', props.user.userInfo.name);
        formData.append('username', props.user.userInfo.username);
        formData.append('albumName', albumName);
        formData.append('albumDescription', albumDescription);
        formData.append('tags', tagsContent);
        formData.append('isPrivate', isPrivate);
        photos.forEach((photo, index) => {
            formData.append(`photo${index}`, photo);
        })

        setAlert("Uploading your album... this might take a while if you're uploading a lot of photos!");
        fetch("api/albums/create", {
            method: "POST",
            body: formData
        })
            .then((data) => {
                return data.json();
            })
            .then((object) => {
                redirect("/album/" + object.savedAlbum._id);
                setPreviewUrl([]);
                setPhotos([]);
                setAlbumName("");
                setAlbumDescription("");
                setTagsContent([]);
                setTags([]);
                setIsPrivate(false);
                aRef.current.value = null;
                setAlert("Your album has been successfully uploaded!");
            }).catch((err) => console.log(err));
    }


    return (
        <div className="container">
            <h1 className="mt-4 mb-5">Create</h1>
            <div className="create-album row">
                <div className="create-box b-5 col-4">
                    <div>
                        <form onSubmit={submitAction}>
                            <h2 className="mb-4 text-center">Create New Album!</h2>
                            <div className="mb-3">
                                <label htmlFor="albumName" className="form-label">Photo Album Name</label>
                                <input type="text" className="form-control" onChange={albumNameChange} value={albumName} placeholder="Kyoto Adventures" required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="albumDescription" className="form-label">Photo Album Description</label>
                                <input type="text" className="form-control" onChange={albumDescriptionChange} value={albumDescription} required />
                            </div>
                            <div className="mb-3">
                                <label htmlFor="albumDescription" className="form-label">Tags</label>
                                <div className="row">
                                    <div className="col-6">
                                        <input type="text" className="form-control" onChange={tagsChange} value={tag} />
                                    </div>
                                    <div className="col-6">
                                        <button type="button" onClick={addTag} className="btn btn-secondary">Add Tag</button>
                                    </div>
                                </div>
                                <p className="text-muted">Please add tag one at a time.</p>
                                <div className="createTags">
                                    {tags}
                                </div>
                            </div>
                            <div>
                                <label htmlFor="fileUpload" className="form-label">Upload Photos</label>
                            </div>
                            <div className="mb-3">
                                <input ref={aRef} type="file" className="form-control-file" onChange={photosChange} accept="image/*" multiple required />
                            </div>
                            <div className="mb-3">
                                <input className="form-check-input me-1" type="checkbox" onChange={isPrivateChange} value={isPrivate} />
                                <label htmlFor="isPrivate" className="form-label">Should this album be private?</label>
                            </div>
                            <button type="submit" className="btn btn-dark">Submit</button>
                            <p className="alert">{alert}</p>
                        </form>
                    </div>
                </div>
                <div className="col-8">
                    <h2> Preview Photos: </h2>
                    <div className="d-flex flex-wrap">
                        {previewUrls && previewUrls.map((url, index) => {
                            return (
                                <div key={index} className="me-4 mt-4 mb-4">
                                    <img className="imgPreview" src={url} alt="preview" />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}