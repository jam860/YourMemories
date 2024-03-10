import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './components/Home';
import Navbar from './components/Navbar';
import Create from './components/Create';
import Album from './components/Album';
import Profile from './components/Profile';
import EditProfile from './components/EditProfile'
import About from "./components/About";
import { useState } from 'react';
import { useEffect } from "react";


function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState({status: "loggedout"});
  let redirect = useNavigate();

  function changeSearchBar(term) {
    setSearchTerm(term);
    redirect("/");
  }

  useEffect(() => {
    fetch('/api/users/myInfo')
    .then (res => res.json())
    .then ((data) => {
      if (user != data) {
        setUser(data);
      }
    })
    .catch (err => console.log(err))
  }, []);


  return (
    <>
      <Navbar changeSearchBar={changeSearchBar} user={user}/>
      <Routes>
        <Route index element={<Home searchTerm={searchTerm} user={user}/>} />
        <Route path="/create" element={<Create  user={user}/>}/>
        <Route path="/album/:id" element={<Album user={user}/>}/>
        <Route path="/profile/:id" element={<Profile user={user}/>}/>
        <Route path="/edit" element={<EditProfile user={user}/>}/>
        <Route path="/about" element={<About user={user}/>}/>
      </Routes>
    </>
  );
}

export default App;
