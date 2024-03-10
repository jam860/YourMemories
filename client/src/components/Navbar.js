import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function Navbar(props) {
    let [searchTerm, setSearchTerm] = useState("");

    function buttonSubmit(event) {
        event.preventDefault();
        props.changeSearchBar(searchTerm);
    }

    function changeTerm(event) {
        setSearchTerm(event.target.value);
    }

    function changeHome(event) {
        event.preventDefault();
        setSearchTerm("");
        props.changeSearchBar("");
    }

    let username;
    if (props.user.userInfo != undefined) {
        username = props.user.userInfo.username.split("@")[0];
    }
    

    return (
        <>
            <nav className="navbar navbar-expand-lg bg-body-tertiary bg-dark border-bottom border-body" data-bs-theme="dark">
                <div className="container-fluid">
                    <Link to="/" className="navbar-brand" onClick={changeHome}>YourMemories</Link>
                    <div className="navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link className="nav-link" aria-current="page" to="/" onClick={changeHome}>Gallery</Link>
                            </li>
                            {props.user == "undefined" || props.user.status == "loggedout" && <a className="nav-link" href="http://localhost:3001/signin">Login</a>}
                            {props.user.status == "loggedin" &&
                                <>
                                    <li className="nav-item">
                                        <Link className="nav-link" to="/create" href="#">Create</Link>
                                    </li>
                                    <li className="nav-item">
                                        <Link className="nav-link" to={"/profile/" + username} href="#">Profile</Link>
                                       
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="http://localhost:3001/signout">Logout</a>
                                    </li>
                                </>}
                            <li className="nav-item">
                                <Link className="nav-link" aria-current="page" to="/about">About Us</Link>
                            </li>
                        </ul>
                        <form className="d-flex" role="search" onSubmit={buttonSubmit}>
                            <input className="form-control me-2" type="search" placeholder="Search" aria-label="Search" onChange={changeTerm} value={searchTerm} />
                            <button className="btn btn-outline-success" type="submit">Search</button>
                        </form>
                    </div>
                </div>
            </nav>
        </>
    )

}