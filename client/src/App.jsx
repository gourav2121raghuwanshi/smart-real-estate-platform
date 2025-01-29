import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { useEffect } from 'react';
import Home from './pages/Home';
import Signin from './pages/Signin';
import SignUp from './pages/SignUp';
import About from './pages/About';
import Profile from './pages/Profile';
import Header from './components/Header';
import PrivateRoute from './components/PrivateRoute';
import CreateListing from './pages/CreateListing';
import UpdateListing from './pages/UpdateListing';
import Listing from './pages/Listing';
import Search from './pages/Search';
import ReviewPage from './pages/ReviewPage';
export default function App() {
  useEffect(() => {
    const accessToken = document.cookie.split('; ').find(row => row.startsWith('access_token='));

    // If the token is undefined, remove the cookie
    if (!accessToken || accessToken.split('=')[1] === 'undefined') {
      document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    }
  }, []);
  return (
    <BrowserRouter>
    <Header />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/sign-in' element={<Signin />} />
      <Route path='/sign-up' element={<SignUp />} />
      <Route path='/about' element={<About />} />
      <Route path='/search' element={<Search />} />
      <Route path='/listing/:listingId' element={<Listing />} />

      <Route element={<PrivateRoute />}>
        <Route path='/profile' element={<Profile />} />
        <Route path='/create-listing' element={<CreateListing />} />
        <Route path='/rate' element={<ReviewPage />} />
        <Route
          path='/update-listing/:listingId'
          element={<UpdateListing />}
        />
      </Route>
    </Routes>
  </BrowserRouter>
  );
}