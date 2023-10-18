import axios from 'axios';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import CookieInfo from '../../components/CookieInfo';
import { useDependentFetch } from '../../hooks/useFetch';
import { getCookies } from '../../apis/cookies';
import { getInformationAccount } from '../../apis/getAuthentication';

const Popup = () => {
  const [urlState, setUrlState] = useState(false);
  const [dataProfile, setDataProfile] = useState([]);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [buttonText, setButtonText] = useState('Get Profiles');
  const [groupId, setGroupId] = useState();
  const [currentUrl, setcurentUrl] = useState('');

  const { data: cookie } = useDependentFetch([getCookies]);

  useEffect(() => {
    getInformationAccount();
    const handleMounted = () => {
      chrome.tabs.query(
        {
          active: true,
          currentWindow: true,
        },
        (tabs) => {
          const url = tabs[0].url;
          const checkUrlFb = /https:\/\/www.facebook.com\/groups\/*/;
          if (checkUrlFb.test(url)) {
            setUrlState(true);
          }
          setcurentUrl(url);
          const fetchData = async () => {
            try {
              const res = await axios.get(currentUrl);
              const resData = res.data;
              console.log('Dtaa', resData);
              const regex = /"groupID":"(\d+)"/;
              const match = resData.match(regex);
              if (match && match[1]) {
                const getId = match[1];
                setGroupId(getId);
              } else {
                console.log('No match found');
              }
            } catch (error) {
              console.log('erorrrrrrr', error);
            }
          };
          fetchData();
        }
      );
    };
    handleMounted();
  }, [currentUrl, groupId]);

  const handleClick = async () => {
    console.log(groupId);
    let endCursor = '';
    const fbDtsg = localStorage.getItem('fb_dtsg');
    console.log('fbDtsgfbDtsgfbDtsgfbDtsgfbDtsgfbDtsgfbDtsgfbDtsg', fbDtsg);
    while (hasNextPage) {
      setButtonText('Processing...');
      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Cookie: cookie,
      };
      const body = {
        fb_dtsg: fbDtsg,
        variables: `{"count":10,"cursor": "${endCursor}","groupID":"${groupId}","recruitingGroupFilterNonCompliant":false,"scale":1,"id":"${groupId}"}`,
        doc_id: '7093752180659727',
      };
      try {
        const response = await axios.post(
          'https://www.facebook.com/api/graphql/',
          body,
          { headers }
        );
        const responseData = response.data;
        setDataProfile((prevData) =>
          prevData.concat(responseData.data.node.new_members.edges)
        );
        setButtonText('Done');

        if (!responseData.data.node.new_members.page_info.has_next_page) {
          setHasNextPage(false);
          break;
        } else {
          endCursor = responseData.data.node.new_members.page_info.end_cursor;
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        break;
      }
    }
  };

  const handleExport = () => {
    const filteredData = dataProfile.map((item) => {
      return { id: item.node.id, name: item.node.name, url: item.node.url };
    });
    const ws = XLSX.utils.json_to_sheet(filteredData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'LinkProfilew.xlsx');
  };
  return (
    <div className="container">
      <div className="bg-blue-500 p-6">
        <h2 className="text-center text-xl font-bold">
          Get Members Groups Facebook
        </h2>
      </div>
      <div className="p-6 text-center m-8">
        {urlState ? (
          <div className="block">
            <button
              className={`text-lg font-medium ${
                buttonText === 'Processing...' || buttonText === 'Done'
                  ? ''
                  : 'hover:bg-blue-600'
              } bg-blue-500  p-2 rounded-lg m-3 text-white`}
              disabled={buttonText === 'Processing...' || buttonText === 'Done'}
              onClick={handleClick}
            >
              {buttonText}
            </button>
            {buttonText === 'Done' && (
              <button
                className="text-lg font-medium bg-blue-500 hover:bg-blue-600 p-2 rounded-lg m-3 text-white"
                onClick={handleExport}
              >
                Export File
              </button>
            )}
            <div>
              <p className="rounded-full text-green-400 text-4xl">
                {dataProfile.length}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-lg font-medium bg-blue-500 p-2 rounded-lg">
            You need to access the group that you have joined in order for the
            tool to work!
          </div>
        )}
        {dataProfile && (
          <div className="bg-pink-200 block">
            {dataProfile.map((items, index) => (
              <React.Fragment key={index}>
                <p>{items.node.id}</p>
                <p>{items.node.name}</p>
                <p>{items.node.url}</p>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>

      <div className="p-2 bg-slate-400 block">
        <CookieInfo />
      </div>
    </div>
  );
};

export default Popup;
