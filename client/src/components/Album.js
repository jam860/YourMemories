import { useState } from 'react';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Link } from "react-router-dom";
import Comment from './Comment';
import Tag from "./Tag";
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Fullscreen from "yet-another-react-lightbox/plugins/fullscreen";
import Slideshow from "yet-another-react-lightbox/plugins/slideshow";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import { useNavigate } from 'react-router-dom';


export default function Album(props) {
    let params = useParams();
    let albumID = params.id;
    const [album, setAlbum] = useState({ likes: [] });
    const [photos, setPhotos] = useState([]);
    const [tags, setTags] = useState([]);
    const [index, setIndex] = useState(-1);
    const [commentInput, setComment] = useState("");
    const [comments, setComments] = useState([]);
    const [like, changeLike] = useState("");
    const redirect = useNavigate();

    useEffect(() => {
        fetch(`/api/albums/view?id=${albumID}`)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                setAlbum(data);
                if (data.status == "error") {
                    return;
                }
                if (props.user.status == "loggedin" && data.likes.includes(props.user.userInfo.username)) {
                    changeLike("Liked ❤️");
                } else {
                    changeLike("Like 🤍");
                }
                //adding tags
                let tempTags = data.tags.map((tag, index) => {
                    return <Tag tag={tag} key={index} />
                });
                setTags(tempTags);

                //adding photos
                let tempPhotos = []
                data.photos.forEach((photo) => {
                    const image = new Image();
                    image.src = photo;
                    image.onload = () => {
                        tempPhotos.push({ src: photo, width: image.width, height: image.height });

                        if (tempPhotos.length === data.photos.length) {
                            setPhotos(tempPhotos); // Once all images are loaded, update state
                        }
                    };
                });
            })
            .catch(error => console.log(error));

        fetch(`/api/albums/comment?id=${albumID}`)
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                let tempComments = data.toReversed().map((comment, index) => {
                    return <Comment key={index} comment={comment} />
                })
                setComments(tempComments);
            })
    }, [props.user]);

    function likeChange(event) {
        try {
            if (like == "Liked ❤️") {
                changeLike("Like 🤍");
                fetch(`/api/albums/unlike?id=${albumID}`, {
                    method: "POST",
                    body: JSON.stringify({ albumID: albumID }),
                })
                .catch(error => console.log(error));
            } else {
                changeLike("Liked ❤️");
                fetch(`/api/albums/like?id=${albumID}`, {
                    method: "POST",
                    body: JSON.stringify({ albumID: albumID }),
                })
                .catch(error => console.log(error));
            }
        } catch (error) {
            console.log(error);
        }
    }

    function commentChange(event) {
        setComment(event.target.value);
    }

    function submitAction(event) {
        event.preventDefault();
        event.stopPropagation();
        fetch('/api/albums/comment', {
            method: 'POST',
            body: JSON.stringify({ comment: commentInput, album: albumID, username: props.user.userInfo.name, email: props.user.userInfo.username }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(() => {
            let tempComments = comments;
            fetch(`/api/albums/comment?id=${albumID}`)
                .then((res) => res.json())
                .then((data) => {
                    let tempComments = data.toReversed().map((comment, index) => {
                        return (<Comment key={index} comment={comment} />)
                    });
                    setComments(tempComments);
                    setComment("");
                })
        })
            .catch(error => console.log(error));
    }

    function deleteAlbum() {
        fetch(`/api/albums/`, {
            method: "DELETE",
            body: JSON.stringify({ albumID: albumID }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(() => {
                redirect("/");
            })
            .catch((err) => console.log(err))
    }

    if (album.status == "error") {
        return(
            <>
            <div className="profile-album">
                <h1 className="page-heading">This album doesn't exist!</h1>
            </div>
            </>
            )
    }

    if (album != undefined) {
    return (
        <div className='row container py-3'>
            <div>
                <div className="d-flex row">
                    <div className="col-4">
                        <h1>{album.albumName}</h1>
                        {album.username != undefined &&
                        <Link className="user text-decoration-none" to={"/profile/" + album.username.split("@")[0]}>
                            <h2 className="fs-4">@{album.username.split("@")[0]}</h2>
                        </Link>
                        }
                        <p>{album.description}</p>
                        {props.user.status == "loggedin" && album.username == props.user.userInfo.username
                            && <button onClick={deleteAlbum} className="btn btn-dark mb-3 me-2">Delete 🗑️</button>
                        }
                        {props.user.status == "loggedin" && like == "Liked ❤️"
                            && <button onClick={likeChange} className="btn btn-secondary mb-3">{like}</button>
                        }
                        {props.user.status == "loggedin" && like == "Like 🤍"
                            && <button onClick={likeChange} className="btn btn-danger mb-3">{like}</button>
                        }
                    </div>
                    {tags.length != 0 &&
                    <div className="align-self-end col-8">
                        <h3 className="mt-0">Tags: </h3>
                        <div> 
                            <div className="albumTags">
                                {tags}
                            </div>
                        </div>
                    </div>
                    }
                </div>

            </div>
            <div className='col-8'>
                <PhotoAlbum
                    layout='rows'
                    photos={photos}
                    targetRowHeight={300}
                    onClick={({ index: current }) => setIndex(current)}
                />
                <Lightbox
                    index={index}
                    slides={photos}
                    open={index >= 0}
                    close={() => setIndex(-1)}
                    plugins={[Fullscreen, Slideshow, Zoom, Thumbnails]}
                />
            </div>
            <div className='col-4'>
                <h3>Comment Section</h3>
                <div className='border border-3 rounded-3 right'>
                    <div className='p-2'>
                        {comments.length == 0 && props.user.status == "loggedout" && <p>No comments yet. Login to add a comment!</p>}
                        {comments.length == 0 && props.user && props.user.status == "loggedin" && <p>No comments yet. Add a comment!</p>}
                        {comments}
                    </div>
                </div>
                {props.user.status == "loggedin" &&
                    <div className='py-4'>
                        <form onSubmit={submitAction}>
                            <textarea type="text" className='form-control' placeholder='Add comment' onChange={commentChange} value={commentInput} required />
                            <div className='py-3'>
                                <button type="submit" className="btn btn-dark">Submit</button>
                            </div>
                        </form>
                    </div>
                }
            </div>
        </div>
    )}
}