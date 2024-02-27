import React from 'react'
import { Link } from 'react-router-dom'
import { MdLocationOn } from 'react-icons/md'
const ListingItem = ({ listing }) => {
    return <div
        className='bg-white shadow-md hover:shadow-lg  
    transition-shadow duration-300 overflow-hidden rounded-lg w-full sm:w-[330px] p-3   '>
        <Link
            to={`/listing/${listing._id}`}
        >
            <img
                src={listing.imageUrls[0] || "https://cdn.pixabay.com/photo/2017/06/16/15/58/luxury-home-2409518_640.jpg"}
                className='md:h-[200px] sm:h-[150px] h-[100px] w-full object-cover
             rounded-sm   hover:scale-105 transition-scale duration-300'
             loading='lazy'
              >
            </img>
            <div className='p-3 flex flex-col gap-2 w-full'>
                <p className='text-lg font-semibold truncate text-slate-700 '>{listing.name}</p>
            </div>
            <div className='flex  items-center gap-1'>
                <MdLocationOn className='text-green-800 h-4 w-4 ' />
                <p className='truncate text-sm text-gray-700 w-full'>
                    {listing.address}
                </p>
            </div>
            <div>
                <p className='line-clamp-2 mt-2 text-gray-600 text-sm'>
                    {listing.description}
                </p>
                <p className='text-slate-500 mt-2 font-semibold'>
                    ₹{listing.offer ?
                        listing.discountPrice.toLocaleString('en-US') :
                        listing.regularPrice.toLocaleString('en-US')}
                    {listing.type === 'rent' && ' / month'}
                </p>
                <div className='text-slate-700 flex gap-4 '>
                    <div className='font-bold text-xs '>
                        {listing.bedroom > 1 ?
                            `${listing.bedroom} beds` :
                            `${listing.bedroom} bed`
                        }
                    </div>
                    <div className='font-bold text-xs '>
                        {listing.bathroom > 1 ?
                            `${listing.bathroom} baths` :
                            `${listing.bathroom} bath`
                        }
                    </div>
                </div>


            </div>



        </Link>
    </div>
}

export default ListingItem