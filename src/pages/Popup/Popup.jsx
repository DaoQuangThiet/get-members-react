import axios from 'axios';
import React, { useEffect, useState } from 'react';

const Popup = () => {
  const [urlState, setUrlState] = useState(false);
  const [numberProcess, setNumberprocess] = useState(0);
  const [dataProfile, setDataProfile] = useState([]);

  const handleClick = async () => {
    try {
      const response = await axios.get(
        'https://jsonplaceholder.typicode.com/posts'
      );
      setDataProfile(response.data);
    } catch (error) {
      // Xử lý lỗi tại đây
      console.error('Error fetching profile data:', error);
    }
  };

  useEffect(() => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      function (tabs) {
        console.log(tabs);
        const url = tabs[0].url;
        const checkUrlFb = /https:\/\/www.facebook.com\/groups\/*/;
        if (checkUrlFb.test(url)) {
          setUrlState(true);
        }
      }
    );
  });

  return (
    <div className="container">
      <div className="bg-blue-500 p-6">
        <h2 className="text-center text-xl font-bold">
          Get Members Groups Facebook
        </h2>
      </div>
      <div className="p-6 text-center m-8">
        {urlState ? (
          <button
            className="text-lg font-medium bg-blue-500 hover:bg-blue-600 p-2 rounded-lg"
            onClick={handleClick}
          >
            Get Profile
          </button>
        ) : (
          <div className="text-lg font-medium bg-blue-500 hover:bg-blue-600 p-2 rounded-lg">
            You need to access the group that you have joined in order for the
            tool to work!
          </div>
        )}
      </div>
      {dataProfile && (
        <div className="bg-pink-400 text-yellow-300 flex">{dataProfile.id}</div>
      )}
    </div>
  );
};

export default Popup;
