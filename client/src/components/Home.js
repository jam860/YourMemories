import { useState } from 'react';
import { useEffect } from 'react';
import HomeCard from './HomeCard';

export default function Home(props) {
    const [albums, setAlbums] = useState([]);

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
            //probably faster just to look throuh albums you have already, but just want to make sure to always get updated version from server
            fetch(`/api/albums/view?search=${encodeURIComponent(props.searchTerm)}`)
            .then((res) => {
                return res.json();
            })
            .then((data) => {           
                photoAlbums = data.toReversed().map((album, index) => {
                return <HomeCard key={index} album={album} changeLike={changeLike} user={props.user}/>
            });
                setAlbums(photoAlbums);
            })
            .catch(error => console.log(error));
        
      }, [props.searchTerm, props.user]); //useEffect when component first loads AND, props.user changes OR props.searchTerm changes

    return (
        <div className='justify-content-center container'>
            <h1 className="gallery-title mt-3">Gallery</h1>
            <div className="gallery">
                {albums}
            </div>
        </div>
    )
}