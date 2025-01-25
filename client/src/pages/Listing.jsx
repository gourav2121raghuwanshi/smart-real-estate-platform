import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';
import axios from 'axios'
import { Swiper, SwiperSlide } from 'swiper/react'
import SwiperCore from 'swiper';
import { Navigation } from 'swiper/modules'
import 'swiper/css/bundle';
import { useSelector } from 'react-redux';
import {
    FaBath,
    FaBed,
    FaChair,
    FaMapMarkerAlt,
    FaParking,
    FaShare,
} from 'react-icons/fa';
import { MdSquareFoot } from "react-icons/md";
import Contact from '../components/Contact';
const Listing = () => {

    SwiperCore.use([Navigation]);
    const { currentUser } = useSelector((state) => state.user);
    const params = useParams();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [copied, setCopied] = useState(false);
    const [contact, setContact] = useState(false);
    // console.log(listing.userRef);
    // console.log(currentUser._id)
    useEffect(() => {
        const fetchListing = async () => {

            try {
                setLoading(true);
                const listingId = params.listingId;
                console.log(listingId)
                const res = await axios.get(`/api/listing/get/${listingId}`);
                const data = res.data;
                console.log("in listing : ", data);
                if (data.success === false) {
                    setLoading(false);
                    setError(true);
                    console.log("error in getting listing");
                    return;
                }
                setLoading(false);
                setError(false);
                setListing(data);
            }
            catch (err) {
                console.log(err);
                setError(true);
                setLoading(false);
            }
        }
        fetchListing();
    }, [params.listingId]);
    return (
        <main>
            {error &&
                <p className='text-center my-7 text-xl sm:text-2xl md:text-4xl font-semibold text-slate-700 '>
                    Something went Wrong
                </p>
            }
            {loading &&
                <p className='text-center my-7 text-xl sm:text-2xl md:text-4xl font-semibold text-slate-700 '>
                    Loading...</p>
            }
            {listing && !loading && !error && (
                <div>
                    <Swiper navigation>
                        {listing.imageUrls.map((url) => (
                            <SwiperSlide key={url}>
                                <div
                                    className='md:h-[550x] sm:h-[400px] h-[200px] w-full  ' style={{
                                        background: `url(${url}) center no-repeat`, backgroundSize: 'cover', width: '100%', objectFit: 'cover',
                                    }}
                                ></div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    <div className='fixed top-[13%] right-[3%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-slate-100 cursor-pointer'>
                        <FaShare
                            className='text-slate-500'
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                                setCopied(true);
                                setTimeout(() => {
                                    setCopied(false);
                                }, 2000);
                            }}
                        />
                    </div>
                    {copied && (
                        <p className='fixed top-[23%] right-[5%] z-10 rounded-md bg-slate-100 p-2'>
                            Link copied!
                        </p>
                    )}
                    <div className='flex flex-col max-w-4xl mx-auto p-3  md:gap-4 sm:gap-3 gap-2'>
                        <p className='text-2xl font-semibold'>
                            {listing.name} - ₹{' '}
                            {listing.offer
                                ? listing.discountPrice.toLocaleString('en-US')
                                : listing.regularPrice.toLocaleString('en-US')}
                            {listing.type === 'rent' && ' / month'}

                        </p>
                        <p className='flex items-center   gap-2 text-slate-600  text-sm font-semibold'>
                            <FaMapMarkerAlt className='text-green-700 ' />
                            {listing.address}
                        </p>
                        <p className='flex items-center   gap-2 text-slate-600  text-sm font-semibold'>
                            <MdSquareFoot  className='text-green-700 text-md size-5 font-semibold' />
                            {listing.area} sq ft
                        </p>
                        <div className='flex gap-4'>
                            <p className='bg-red-900 w-full max-w-[200px] text-white 
                        text-center p-1 rounded-md '>
                                {listing.type === 'rent' ? 'For Rent ' : 'For Sale'}
                            </p>
                            {
                                listing.offer && (
                                    <p className='bg-green-900 w-full max-w-[200px] text-white 
                        text-center p-1 rounded-md '> ₹{+listing.regularPrice - +listing.discountPrice} OFF</p>
                                )
                            }
                        </div>
                        <p className='text-slate-800 '>
                            <span className=''>Description - </span>    {listing.description}
                        </p>
                        <ul className='text-green-900 font-semibold text-sm flex items-center flex-wrap gap-4 sm:gap-6'>
                            <li className='flex items-center gap-1 whitespace-nowrap  '><FaBed className='text-lg' /> {listing.bedroom > 1 ? `${listing.bedroom} beds` : `${listing.bedroom} bed`}</li>
                            <li className='flex items-center gap-1 whitespace-nowrap  '><FaBath className='text-lg' /> {listing.bathroom > 1 ? `${listing.bathroom} baths` : `${listing.bathroom} bath`}</li>
                            <li className='flex items-center gap-1 whitespace-nowrap  '><FaParking className='text-lg' /> {listing.parking ? `Parking Spot ` : `No Parking`}</li>
                            <li className='flex items-center gap-1 whitespace-nowrap  '><FaChair className='text-lg' /> {listing.furnished ? `Furnished` : `Unfurnished`}</li>
                        </ul>

                        {currentUser && listing.userRef !== currentUser._id &&
                            !contact && (
                                <button onClick={() => setContact(true)} className='bg-slate-700 md:p-2 sm:p-1 p-[3px]  text-white rounded-lg uppercase hover:opacity-95'>
                                    Contact Landlord
                                </button>
                            )}
                        {contact && <Contact listing={listing} />}
                    </div>
                </div>
            )}

        </main>
    )
}

export default Listing;