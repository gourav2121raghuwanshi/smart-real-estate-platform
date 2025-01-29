import React from 'react'
import { Link } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios'
import { useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';
import { useDispatch, useSelector } from 'react-redux';

import { signUpStart, signUpSuccess, signUpFailure } from "../redux/user/userSlice"
const SignUp = () => {

  const [formdata, setformdata] = useState({
    username: '',
    email: '',
    password: '',
  });
  const buri="https://reat-estate-mern-backend.vercel.app"
 
  const [errorr, setError] = useState(null);
  const [loadingg, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.user);
  const handleChange = (e) => {
    setformdata(
      {
        ...formdata,
        [e.target.id]: e.target.value
      }
    )
  }
    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      dispatch(signUpStart());
      const res = await axios.post(buri+'/auth/signup', formdata, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      const data = await res.data; 
  
      if (data.success === false) {
        setLoading(false);
        dispatch(signUpFailure(data.message));
        setError(data.message);
        return;
      }
  
      setLoading(false);
      setError(null)
      dispatch(signUpSuccess(data));
      // navigate('/sign-in')
      navigate('/')
      // console.log(data);
    } catch (error) {
      setLoading(false);
      dispatch(signUpFailure());
     
      setError(error.message); 
      console.error('Error:', error.message);
    }
  };
    
  return (
    <div className='p-5 max-w-2xl mx-auto'>

     <h1 className='text-2xl sm:text-4xl text-slate-700 text-center font-semibold my-7 '>
        Sign Up
      </h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-4 '>
        <input type="text" placeholder='username' value={formdata.username} className='sm:text-xl font-semibold border p-3 rounded-lg ' id='username' onChange={handleChange} >
        </input>
        <input type="text" placeholder='email' value={formdata.email} className='sm:text-xl font-semibold border p-3 rounded-lg ' id='email' onChange={handleChange} >
        </input>
        <input type="password" placeholder='password' value={formdata.password} className='sm:text-xl font-semibold border p-3 rounded-lg ' id='password' onChange={handleChange} >
        </input>
        <button disabled={loadingg} className='bg-slate-700 text-white p-3 sm:text-xl py-3  rounded-lg uppercase hover:opacity-95 disabled:opacity-80 transition-all  duration-200' >
          {loadingg ? 'Loading...' : 'Sign up'}
        </button>
        <OAuth/>
      </form>
      <div className='flex gap-3 mt-5 sm:text-xl font-semibold'>
        <p>Have an account? </p>
        <Link to={'/sign-in'}>
          <span className='text-blue-700 '>
            Sign in
          </span>
        </Link>
      </div>
      {errorr && <p className='text-red-500 mt-5 font-semibold text-xl'>{errorr}</p>}
    </div>
  )
}

export default SignUp;