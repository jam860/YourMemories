import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Tag from "./Tag";


export default function HomeCard(props) {
    const [likeCounter, setLikesCounter] = useState(props.album.likes.length);
    const [like, changeLike] = useState("");

    useEffect(() => {
        if (props.user.status == "loggedin" && props.album.likes.includes(props.user.userInfo.username)) {
            changeLike("Liked ❤️");
        } else {
            changeLike("Like 🤍");
        }
    }, [props.user]);

    let tempTags = props.album.tags.map((tag, index) => {
        return <Tag tag={tag} key={index}/>
    });    

    let imagePlaceholder;
    let date = new Date(props.album.uploadDate);
    const month = ["January","February","March","April","May","June","July","August","September","October","November","December"]
    for (let i = 0 ; i < props.album.photos.length; i++) {
        const image = new Image();
        image.src = props.album.photos[i];
        if (image.width > image.height) {
            imagePlaceholder = props.album.photos[i];
            break;
        }
    }    

    function onChangeLike(event) {
        if (like == "Like 🤍") {
            props.changeLike(props.album._id, "like");
            setLikesCounter(likeCounter + 1);
            changeLike("Liked ❤️")
        } else if (like == "Liked ❤️") {
            props.changeLike(props.album._id, "unlike");
            setLikesCounter(likeCounter - 1);
            changeLike("Like 🤍")
        }
    }

    
    return (
        <div className="card img-test">
            <img src={props.album.photos[0]} className="card-img-top" alt="album thumbnail"/>
                <div className="card-body">
                    <h5 className="card-title">{props.album.albumName}</h5>
                    <Link className="text-primary text-decoration-none" to={"/profile/" + props.album.username.split("@")[0]}>
                        <p className="card-subtitle card-user">{"@" + props.album.username.split("@")[0]}</p>
                    </Link>
                    <p className="card-text">{likeCounter} Liked</p>
                    {props.album.tags.length !== 0 && <div className="homeCardTags mb-3">
                        {tempTags}
                    </div>
                    }               
                    <p className="card-text"><small className="text-muted">Created: {month[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear()}</small></p>
                    <Link to={"/album/" + props.album._id} className="btn btn-primary me-1" album={props.album}>Open</Link>
                    {props.user.status == "loggedin" && like == "Liked ❤️"
                            && <button onClick={onChangeLike} className="btn btn-secondary">{like}</button>
                    }
                    {props.user.status == "loggedin" && like == "Like 🤍"
                            && <button onClick={onChangeLike} className="btn btn-danger">{like}</button>
                    }
                </div>
        </div>
    )
}