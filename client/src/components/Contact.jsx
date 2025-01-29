import React from "react";
import axios from "axios";
import { useState } from "react";
// import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import { useEffect } from "react";
const Contact = ({ listing }) => {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");
  //   const { currentUser } = useSelector((state) => state.user);
  const { currentUser} = useSelector((state) => state.user);
  // const buri="http://localhost:3000/api"
  const buri="https://reat-estate-mern-backend.vercel.app/api"
  const onChange = (e) => {
    setMessage(e.target.value);
  };

  useEffect(() => {
    const getLandlord = async () => {
      try {
        const res = await axios.get(buri+`/user/${listing.userRef}`,
          {
            headers: {
              'Content-Type': 'application/json', // Specifies the content type
              'Authorization': `Bearer ${currentUser.token}`, // Sending the token in the Authorization header
            },
            withCredentials: true, // Ensures cookies (if any) are included in cross-origin requests
          });
        const data = await res.data;
        if (data.success === false) {
          console.log(data.message);
          return;
        }
        console.log(data);
        setLandlord(data);
      } catch (err) {
        console.log(err);
      }
    };
    getLandlord();
  }, [listing.userRef]);
  
  return (
    <div className="">
      {landlord && (
        <div className="flex flex-col gap-2">
          <p>
            Contact <span className="font-semibold ">{landlord.username}</span>{" "}
            for{" "}
            <span className="font-semibold ">{listing.name.toLowerCase()}</span>
          </p>
          <textarea
            placeholder="Enter Your Message here"
            name="message"
            id="message"
            rows={2}
            className="w-full border p-3 rounded-lg text-slate-800 "
            value={message}
            onChange={onChange}
          ></textarea>
          
          
          <Link
          to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
          className='bg-slate-700 text-white text-center p-3 uppercase rounded-lg hover:opacity-95'
          >
            Send Message          
          </Link>

          {/* <a target=`${landlord.email}` rel="nofollow" href={`mailto:{email}`}>mail</a> */}
        </div>
      )}
    </div>
  );
};

export default Contact;
