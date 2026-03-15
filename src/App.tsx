import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import "./components/Skeleton.css";

import { AccountProvider } from "./contexts/AccountContext";
import Footer from "./components/Footer";

import Welcome from "./screens/Welcome/Welcome";
import Login from "./screens/Login/Login";
import Register from "./screens/Register/Register";
import Feed from "./screens/Feed/Feed";
import ItemDetail from "./screens/ItemDetail/ItemDetail";
import AddItem from "./screens/AddItem/AddItem";
import Favorites from "./screens/Wishlist/Wishlist";
import Chat from "./screens/Chat/Chat";
import Exchange from "./screens/Exchange/Exchange";
import Profile from "./screens/Profile/Profile";
import MyListings from "./screens/MyListings/MyListings";

const App: React.FC = () => {
  return (
    <Router>
      <AccountProvider>
      <div className="App">
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/item/:id" element={<ItemDetail />} />
          <Route path="/add-item" element={<AddItem />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Footer />
        <ToastContainer position="top-right" autoClose={4000} theme="light" />
      </div>
      </AccountProvider>
    </Router>
  );
};

export default App;
