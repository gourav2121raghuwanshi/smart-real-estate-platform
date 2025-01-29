import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaStar } from 'react-icons/fa';

const ReviewPage = () => {

    const [formData, setFormData] = useState({ rating: 0, review: "" });
    const { currentUser } = useSelector(state => state.user);
    const navigate = useNavigate();
    const buri="https://reat-estate-mern-backend.vercel.app/api"
 
    useEffect(() => {
        const getReview = async () => {
            try {
                const res = await axios.get(buri+`/rateus/ReviewOfCurrentUser/${currentUser._id}`);
                const data = await res.data;
                console.log(data);
                const review = data.newReviewAndRating[0].review;
                const rating = data.newReviewAndRating[0].rating;
                console.log(review, " ", rating);
                setFormData(prevData => ({
                    ...prevData,
                    rating: rating,
                    review: review
                }));
            } catch (err) {
                console.log(err);
            }
        };
        getReview();
    }, []);

    const handleStarClick = (selectedRating) => {
        setFormData(prevData => ({
            ...prevData,
            rating: selectedRating,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            console.log('Form data:', formData);
            await axios.post(buri+`/rateus/updateReview/${currentUser._id}`, formData);
            setFormData(prevData => ({
                ...prevData,
                rating: 0,
                review: ""
            }));
            navigate("/");
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className='flex justify-center  mt-10 w-full text-gray-700 h-screen'>
            <div className=''>
                <p className='font-bold text-lg m-4'>Rate us:
                    <div className='flex flex-row gap-3'>
                        {[...Array(5)].map((_, index) => (
                            <label key={index}>
                                <input
                                    className='hidden'
                                    type='radio'
                                    value={index + 1}
                                    name="rating"
                                    checked={formData.rating === index + 1}
                                    onChange={() => handleStarClick(index + 1)}
                                />
                                <FaStar
                                    color={formData.rating >= index + 1 ? '#FFD700' : 'gray'}
                                    key={index}
                                    className='h-[30px] w-[30px] sm:h-[50px] sm:w-[50px]'
                                />
                            </label>
                        ))}
                    </div>
                </p>
                <p className='font-bold text-2xl m-4'>Review Form :</p>
                <form onSubmit={handleSubmit}>
                    <textarea
                        name="review"
                        value={formData.review}
                        className='w-11/12 px-4 py-2 mx-auto rounded-md border-gray-300 focus:border-indigo-500 focus:ring focus:ring-indigo-200'
                        cols="60"
                        rows="5" // Adjusted number of rows to decrease the height
                        placeholder='  Enter Your Review Please..'
                        onChange={(e) => setFormData(prevData => ({ ...prevData, review: e.target.value }))}
                        style={{ margin: "1rem" }}
                    />
                    
                    <button className='bg-slate-700 ml-4 text-white mx-auto sm:text-2xl text-lg font-semibold rounded-lg p-2 sm:p-5 uppercase hover:opacity-95 disabled:opacity-80'>
                        {(formData.review === "" || formData.rating === 0) ? 'Rate Us' : 'Update'}
                    </button>

                </form>
            </div>
        </div>
    );
};

export default ReviewPage;
