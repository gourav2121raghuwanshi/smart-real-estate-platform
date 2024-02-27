import { useState } from 'react'
import { app } from '../firebase'
import {
    getDownloadURL,
    getStorage,
    ref,
    uploadBytesResumable,
} from 'firebase/storage';
import axios from 'axios';
import { useSelector } from 'react-redux';

import { useNavigate } from 'react-router-dom';
const CreateListing = () => {
    const { currentUser } = useSelector((state) => state.user);
    const [files, setFiles] = useState([]);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({

        name: "",
        description: "",
        address: "",
        type: "rent",
        regularPrice: 1550,
        discountPrice: 1550,
        bathroom: 1,
        bedroom: 1,
        furnished: false,
        parking: false,
        offer: false,
        imageUrls: [],
        userRef: "",
    })
    const [imageUploadError, setImageUploadError] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    // console.log("file is ", files);
    console.log(formData);

    const handleImageSubmit = (e) => {
        if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
            setUploading(true);
            setImageUploadError(false);
            const promises = [];

            for (let i = 0; i < files.length; i++) {
                promises.push(storeImage(files[i]));
            }
            Promise.all(promises)
                .then((urls) => {
                    setFormData({
                        ...formData,
                        imageUrls: formData.imageUrls.concat(urls),
                    });
                    setImageUploadError(false);
                    setUploading(false);
                })
                .catch((err) => {
                    // console.log(err);
                    setImageUploadError('Image upload failed (2 mb max per image)');
                    setUploading(false);
                });
        } else {
            console.log('You can only upload 6 images per listing');
            setImageUploadError('You can only upload 6 images per listing');
            setUploading(false);
        }
    };


    const storeImage = async (file) => {
        return new Promise((resolve, reject) => {
            const storage = getStorage(app);
            const fileName = new Date().getTime() + file.name;
            const storageRef = ref(storage, fileName);
            const uploadTask = uploadBytesResumable(storageRef, file);
            uploadTask.on(
                'state_changed',
                (snapshot) => {
                    const progress =
                        (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    console.log(`Upload is ${progress}% done`);
                },
                (error) => {
                    reject(error);
                },
                () => {
                    getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
                        resolve(downloadURL);
                    });
                }
            );
        });
    };

    const handleRemoveImage = (index) => {
        setFormData({
            ...formData,
            imageUrls: formData.imageUrls.filter((_, i) => i !== index),
        });
    };
    const handleChange = (e) => {
        if (e.target.id === 'sale' || e.target.id === 'rent') {
            setFormData({
                ...formData,
                type: e.target.id
            })
        }
        if (e.target.id === 'parking' || e.target.id === 'furnished' || e.target.id === 'offer') {
            setFormData({
                ...formData,
                [e.target.id]: e.target.checked
            })
        }
        if (e.target.type === 'number' || e.target.type === "text" || e.target.type === 'textarea') {
            setFormData({
                ...formData,
                [e.target.id]: e.target.value
            })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // console.log(currentUser);
            // console.log(currentUser.username);
            // console.log(currentUser._id);
            setLoading(true);
            setError(false);
            const res = await axios.post("/api/listing/create", {
                ...formData,
                userRef: currentUser._id,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.data;
            console.log("output of listing is ", data);
            setLoading(false);
            if (data.success === false) {
                setError(data.message);
                return;
            }
            navigate(`/listing/${data._id}`);
        }
        catch (err) {
            setError(err.message);
            setLoading(false);
        }
    }
    // changes : 
    const selectAsMainPhoto = (e, fileName) => {
        e.preventDefault();
        const photoWIthoutSelected = formData.imageUrls.filter(file => file !== fileName);
        const newAddedPhotos = [fileName, ...photoWIthoutSelected];
        setFormData({
            ...formData,
            imageUrls: newAddedPhotos
        });
    }

    return (
        <main className='p-5 max-w-6xl mx-auto'>
            <h1 className='sm:text-4xl text-xl text-gray-700 sm:font-bold font-semibold text-center my-7 '>
                Create a Listing
            </h1>

            <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row sm:gap-8 gap-5'>
                {/*  first side*/}
                <div className='flex flex-col gap-4 sm:gap-6 flex-1 '>
                    <input
                        onChange={handleChange}
                        value={formData.name}
                        className='border p-3 rounded-lg md:text-2xl sm:text-xl text-lg ' type="text" placeholder='Name' id='name' maxLength='62' minLength='10' required />
                    <textarea
                        type='text'
                        placeholder='Description'
                        className='border p-3 rounded-lg  md:text-2xl sm:text-xl text-lg'
                        id='description'
                        required
                        onChange={handleChange}
                        value={formData.description}
                        maxLength={600}
                    />
                    <input
                        onChange={handleChange}
                        value={formData.address}
                        className='border p-3 rounded-lg  md:text-2xl sm:text-xl text-lg'
                        type="text"
                        placeholder='Address'
                        id='address'
                        required />
                    <div className='flex flex-wrap gap-5 '>
                        <div className='flex gap-5 items-center'>
                            <input
                                onChange={handleChange}
                                checked={formData.type === 'sale'}
                                type='checkbox'
                                id='sale'
                                className='w-8 h-8' />
                            <span className='sm:text-xl text-lg font-semibold  text-slate-700'>Sale</span>
                        </div>
                        <div className='flex gap-5 items-center'>
                            <input
                                type='checkbox'
                                id='rent'
                                className='w-8 h-8'
                                onChange={handleChange}
                                checked={formData.type === 'rent'}
                            />
                            <span className='sm:text-xl text-lg font-semibold  text-slate-700'>Rent</span>
                        </div>
                        <div className='flex gap-5 items-center'>
                            <input
                                onChange={handleChange}
                                checked={formData.parking}
                                type='checkbox'
                                id='parking'
                                className='w-8 h-8' />
                            <span className='sm:text-xl text-lg font-semibold  text-slate-700'>Parking Spot</span>
                        </div>
                        <div className='flex gap-5 items-center'>
                            <input
                                type='checkbox'
                                id='furnished'
                                className='w-8 h-8'
                                onChange={handleChange}
                                checked={formData.furnished}

                            />
                            <span className='sm:text-xl text-lg font-semibold  text-slate-700'>Furnished</span>
                        </div>
                        <div className='flex gap-5 items-center'>
                            <input
                                onChange={handleChange}
                                value={formData.offer}
                                type='checkbox'
                                id='offer'
                                className='w-8 h-8  ' />
                            <span className='sm:text-xl text-lg font-semibold text-slate-700 '>Offer</span>
                        </div>
                    </div>


                    <div className='flex  gap-5 flex-wrap '>
                        <div className='flex gap-5 items-center '>
                            <input
                                onChange={handleChange}
                                value={formData.bedroom}
                                id="bedroom"
                                type="number"
                                min='1'
                                max='10'
                                required
                                className='p-3  md:text-2xl sm:text-xl text-lg border border-gray-300 rounded-lg ' />
                            <p className='sm:text-xl text-lg font-semibold  text-slate-700'>Beds</p>
                        </div>
                        <div className='flex gap-5 items-center text-lg'>
                            <input id="bathroom"
                                type="number"
                                min='1'
                                max='10'
                                required
                                onChange={handleChange}
                                value={formData.bathroom}

                                className='p-3  md:text-2xl sm:text-xl text-lg border border-gray-300 rounded-lg ' />
                            <p className='sm:text-xl text-lg font-semibold  text-slate-700'>Baths</p>
                        </div>
                        <div className='flex gap-5 items-center '>
                            <input id="regularPrice"
                                onChange={handleChange}
                                value={formData.regularPrice}
                                type="number"
                                min='1500'
                                max='50000000'
                                required
                                className='p-3 border  md:text-2xl sm:text-xl text-lg border-gray-300 rounded-lg ' />

                            <div className='text-xl font-semibold text-slate-700 flex flex-col gap-1 items-center' >
                                <p className='sm:text-xl text-lg font-semibold  text-slate-700'>  Regular Price </p>

                                <p className='sm:text-lg text-sm'>(₹ / Month)</p>
                            </div>

                        </div>
                        <div className='flex gap-5 items-center '>
                            <input
                                onChange={handleChange}
                                value={formData.discountPrice}
                                id="discountPrice"
                                type="number"
                                min='1500'
                                max='50000000'
                                required
                                className='p-3  md:text-2xl sm:text-xl  border text-lg border-gray-300 rounded-lg ' />
                            <div className='text-xl font-semibold text-slate-700 flex flex-col items-center gap-1' >
                                <p className='sm:text-xl text-lg font-semibold  text-slate-700'>  Discount Price </p>
                                <p className='sm:text-lg text-sm'>(₹ / Month)</p>
                            </div>
                        </div>
                    </div>
                </div>
                {/* second side */}
                <div className='flex flex-col items-center gap-6 flex-1'>
                    <p className='sm:font-bold font-semibold sm:text-2xl text-lg'>
                        Images:
                        <span className='font-normal text-gray-600 text-sm sm:text-xl  ml-3 '>The first image will be the cover (max 6)</span>
                    </p>
                    <div className='flex gap-5 border p-1 border-gray-200 '>
                        <input
                            onChange={(e) => setFiles(e.target.files)}
                            type='file'
                            id='images'
                            accept='image/*'
                            multiple
                            className='sm:p-4 p-2  border  rounded sm:text-xl md:text-2xl text-lg  w-full'
                        />

                        <button
                            type='button'
                            onClick={handleImageSubmit}
                            className='sm:p-4 p-2 text-green-700 font-semibold sm:text-xl md:text-2xl text-lg  border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80 '>
                            {uploading ? "Uploading..." : "Upload"}
                        </button>
                    </div>

                    <p className='text-red-600 sm:text-xl text-lg md:text-2xl font-semibold '>{imageUploadError && imageUploadError}</p>

                    <div className='flex flex-col w-full md:gap-10 sm:gap-6 gap-4'>
                        {
                            formData.imageUrls.length > 0 && formData.imageUrls.map((url, index) => (
                                <div
                                    className='flex  flex-row justify-around md:gap-6 gap-3 sm:gap-4  items-center border   p-4'
                                    key={url}
                                >
                                    <div className='relative'>
                                        <img
                                            src={url}
                                            alt="listing image"
                                            className=' h-28 w-28  md:h-52 md:w-52 sm:h-36  sm:w-36 object-cover  rounded-lg '

                                        />

                                        <button
                                            onClick={(e) => { selectAsMainPhoto(e, url) }}
                                            className='cursor-pointer absolute bottom-1 left-1 p-2 bg-black bg-opacity-60 text-white rounded-2xl ' >
                                            {
                                                url === formData.imageUrls[0] && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                                                        <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
                                                    </svg>
                                                )
                                            }
                                            {
                                                url !== formData.imageUrls[0] && (
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 ">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                                                    </svg>
                                                )
                                            }
                                        </button>
                                    </div>

                                    <button type='button' onClick={() => handleRemoveImage(index)} className='sm:p-4 p-2 bg-red-600 sm:text-xl font-semibold rounded-lg uppercase hover:opacity-75 text-white'>
                                        Delete
                                    </button>

                                </div>
                            ))}
                    </div>

                    <button className='sm:p-4 p-2 w-full sm:text-2xl text-lg  bg-slate-700 text-white rounded-lg shadow-lg uppercase hover:opacity-95 disabled:opacity-80 '>
                        {loading ? "Creating..." : 'Create Listing'}
                    </button>
                    {error && <p className='text-red-700 text-sm sm:text-lg md:text-xl '>{error}</p>}
                </div>
            </form>
        </main >
    )
}

export default CreateListing;