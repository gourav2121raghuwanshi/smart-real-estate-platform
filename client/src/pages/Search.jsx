import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';
const Search = () => {

    const navigate = useNavigate();
    const [sideBardata, setSideBarData] = useState({
        searchTerm: '',
        type: 'all',
        parking: false,
        furnished: false,
        offer: false,
        sort: 'created_at',
        order: 'desc'
    });
    const [loading, setLoading] = useState(false);
    const [listings, setListings] = useState([]);
    const buri="https://reat-estate-mern-backend.vercel.app/api"
    //  const buri="http://localhost:3000/api"
 
    const [showMore, setShowMore] = useState(false);
    // console.log("listings are : ", listings);
    // console.log(sideBardata)
    const handleChange = (e) => {
        if (e.target.id === 'all' || e.target.id === 'rent' || e.target.id === 'sale') {
            setSideBarData({ ...sideBardata, type: e.target.id });
        }
        if (e.target.id === 'searchTerm') {
            setSideBarData({ ...sideBardata, searchTerm: e.target.value });
        }
        if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
            setSideBarData({ ...sideBardata, [e.target.id]: e.target.checked || e.target.checked === 'true' ? true : false });
        }
        if (e.target.id === 'sort_order') {
            const sort = e.target.value.split('_')[0] || 'created_at';
            const order = e.target.value.split('_')[1] || 'desc';
            setSideBarData({ ...sideBardata, sort, order });
        }
        // console.log(sideBardata)
    }
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const searchTermFromUrl = urlParams.get('searchTerm');
        const typeFromUrl = urlParams.get('type');
        const parkingFormUrl = urlParams.get('parking');
        const furnishedFromUrl = urlParams.get('furnished');
        const offerFromUrl = urlParams.get('offer');
        const sortFromUrl = urlParams.get('sort');
        const orderFromUrl = urlParams.get('order');

        if (
            searchTermFromUrl ||
            typeFromUrl ||
            parkingFormUrl ||
            furnishedFromUrl ||
            offerFromUrl ||
            sortFromUrl ||
            orderFromUrl
        ) {
            setSideBarData({
                searchTerm: searchTermFromUrl || '',
                type: typeFromUrl || 'all',
                parking: parkingFormUrl === 'true' ? true : false,
                furnished: furnishedFromUrl === 'true' ? true : false,
                offer: offerFromUrl === 'true' ? true : false,
                sort: sortFromUrl || 'created_at',
                order: orderFromUrl || 'desc'
            });
        }
        const fetchListings = async () => {
            try {
                setLoading(true);
                setShowMore(false);
                const searchQuery = urlParams.toString();
                const res = await axios.get(buri+`/listing/get?${searchQuery}`,{
                    withCredentials:true
                });
                const data = await res.data;
                if (data.success === false) {
                    setLoading(false);
                    return;
                }
                if (data.length > 8) {
                    setShowMore(true);
                }
                else setShowMore(false);

                setLoading(false);
                console.log("data is ", data);
                setListings(data);
            }
            catch (err) {
                console.log(err)
                setLoading(false);
            }
        }
        fetchListings();


    }, [location.search]);

    const onShowMoreClick = async () => {
        const numberOfListings = listings.length;
        const startIndex = numberOfListings;
        const urlParams = new URLSearchParams(location.search);
        urlParams.set('startIndex', startIndex);
        const searchQuery = urlParams.toString();

        const res = await axios.get(buri+`/listing/get?${searchQuery}`,{
            withCredentials:true
        });
        const data = await res.data;
        if (data.length < 9) {
            setShowMore(false);
        }
        setListings([...listings, ...data]);


    }
    const handleSubmit = (e) => {
        e.preventDefault();
        const urlParams = new URLSearchParams();
        urlParams.set('searchTerm', sideBardata.searchTerm);
        urlParams.set('type', sideBardata.type);
        urlParams.set('parking', sideBardata.parking);
        urlParams.set('furnished', sideBardata.furnished);
        urlParams.set('offer', sideBardata.offer);
        urlParams.set('sort', sideBardata.sort);
        urlParams.set('order', sideBardata.order);

        const searchQuery = urlParams.toString();
        navigate(`/search?${searchQuery}`);


    }
    return (
        <div className='flex flex-col md:flex-row'>
            {/* left */}
            <div className='p-7 border-b-2 md:border-r-2 md:min-h-screen'>
                <form
                    onSubmit={handleSubmit}
                    className='flex flex-col gap-8'>
                    <div className='flex items-center gap-2'>
                        <label className=' whitespace-nowrap font-semibold '>
                            Search Term :
                        </label>
                        <input
                            value={sideBardata.searchTerm}
                            onChange={handleChange}
                            type='text'
                            id='searchTerm'
                            name='searchTerm'
                            placeholder='Search...'
                            className='w-full border rounded-lg p-3'>
                        </input>
                    </div>
                    <div className='flex gap-2 flex-wrap items-center'>
                        <label className='font-semibold'>Type:</label>
                        <div className='flex gap-2'>
                            <input
                                checked={sideBardata.type === 'all'}
                                onChange={handleChange}
                                type='checkbox'
                                id='all'
                                className='w-5 '

                            />
                            <span>Rent & Sell</span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                checked={sideBardata.type === 'rent'}
                                onChange={handleChange}

                                type='checkbox'
                                id='rent'
                                className='w-5 '

                            />
                            <span>Rent  </span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                checked={sideBardata.type === 'sale'}
                                onChange={handleChange}

                                type='checkbox'
                                id='sale'
                                className='w-5 '

                            />
                            <span> Sale</span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                checked={sideBardata.offer === true}
                                onChange={handleChange}

                                type='checkbox'
                                id='offer'
                                className='w-5 '
                            />
                            <span>Offer</span>
                        </div>
                    </div>
                    <div className='flex gap-2 flex-wrap items-center'>
                        <label className='font-semibold'>Amenities:</label>
                        <div className='flex gap-2'>
                            <input
                                onChange={handleChange}
                                checked={sideBardata.parking}
                                type='checkbox'
                                id='parking'
                                className='w-5 ' />
                            <span>Parking</span>
                        </div>
                        <div className='flex gap-2'>
                            <input
                                onChange={handleChange}
                                checked={sideBardata.furnished}
                                type='checkbox'
                                id='furnished'
                                className='w-5 ' />
                            <span>furnished</span>
                        </div>
                    </div>
                    <div className='flex items-center gap-2 '>
                        <label className='font-semibold'>Sort:</label>
                        <select
                            onChange={handleChange}
                            defaultValue={'created_at_desc'}
                            id="sort_order"
                            className='border rounded-lg p-3 '
                        >
                            <option
                                value='regularPrice_desc'>
                                Price high to low
                            </option>
                            <option
                                value='regularPrice_asc'>
                                Price low to high
                            </option>
                            <option
                                value='createdAt_desc'>
                                Latest
                            </option>
                            <option
                                value='createdAt_asc'>
                                Oldest
                            </option>
                        </select>
                    </div>
                    <button className='bg-slate-800 text-white p-3 rounded-lg uppercase hover:opacity-95 '>Search</button>
                </form>
            </div>
            {/* right */}
            <div className='flex-1'>
                <h1 className='text-3xl font-semibold border-b p-3 mt-5 text-slate-700 '>
                    Listing Results:
                </h1>
                <div className='p-7 flex flex-wrap gap-4 '>
                    {!loading && listings.length === 0 && (
                        <p className='text-xl  p-3 font-semibold   text-slate-900 '>
                            No Listing found!
                        </p>
                    )}
                    {loading && (
                        <p className='text-xl text-slate-700 text-center w-full'>Loading...</p>
                    )}
                    {
                        loading === false && listings && listings.map((listing) => (
                            <ListingItem key={listing._id} listing={listing} />
                        ))}
                    {showMore && (
                        <button
                            className='text-xl text-green-800 hover:underline p-7 text-center w-full '
                            onClick={onShowMoreClick}>
                            Show More
                        </button>
                    )}
                </div>
            </div>
        </div >
    )
}

export default Search