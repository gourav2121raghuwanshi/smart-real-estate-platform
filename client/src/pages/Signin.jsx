import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
// import ClipLoader from "react-spinners/ClipLoader";
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from "../redux/user/userSlice"
import OAuth from '../components/OAuth';

const Signin = () => {
  const [formdata, setformdata] = useState({
    email: '',
    password: '',
  });
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleChange = (e) => {
    setformdata({
      ...formdata,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await axios.post('/api/auth/signin', formdata, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.data;
      console.log("data is : ",data)
      console.log(res)

      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      console.log(data.token);
      document.cookie = `access_token=${data.token}; path=/`;
      

      dispatch(signInSuccess(data));
      navigate('/')

    } catch (error) {
      dispatch(signInFailure());
      console.error('Error:', error.message);
    }
  };

  return (
    <div className='p-5 max-w-2xl mx-auto'>
      <h1 className='text-2xl sm:text-4xl text-slate-700 text-center font-semibold my-7 '>
        Sign In
      </h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 '>

        <input type="text" placeholder='email' value={formdata.email} className='sm:text-xl font-semibold border p-3 rounded-lg ' id='email' onChange={handleChange} >
        </input>
        <input type="password" placeholder='password' value={formdata.password} className='sm:text-xl font-semibold border p-3 rounded-lg ' id='password' onChange={handleChange} >
        </input>
        <button disabled={loading} className='bg-slate-700 text-white p-3  py-3  rounded-lg uppercase sm:text-xl hover:opacity-95 disabled:opacity-80 transition-all  duration-200' >
          {loading ? 'Loading...' : 'Sign in'}
        </button>
        <OAuth />
      </form>
      <div className='flex gap-3 mt-5 sm:text-xl font-semibold'>
        <p>Dont have an account? </p>
        <Link to={'/sign-up'}>
          <span className='text-blue-700 ' >
            Sign Up
          </span>
        </Link>
      </div>
      {error && <p className='text-red-500 mt-5 font-semibold text-xl '>{error}</p>}

    </div>
  )
}

export default Signin;