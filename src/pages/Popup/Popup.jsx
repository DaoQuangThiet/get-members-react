import axios from 'axios';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import CookieInfo from '../../components/CookieInfo';
import { useDependentFetch } from '../../hooks/useFetch';
import { getCookies } from '../../apis/cookies';

const Popup = () => {
  const [urlState, setUrlState] = useState(false);
  const [numberProcess, setNumberprocess] = useState(0);
  const [dataProfile, setDataProfile] = useState([]);
  const [trigger, setTrigger] = useState(false);
  const [processing, setProcessing] = useState(false);

  const { data: cookie } = useDependentFetch([getCookies]);
  console.log(cookie);

  useEffect(() => {
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
        }
      );
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.msg === 'getStatusTrigger') {
          sendResponse({ data: trigger });
        } else if (message.msg === 'arrayProfile') {
          const ws = XLSX.utils.json_to_sheet(message.data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, 'link');
          XLSX.writeFile(wb, 'linkProdile.xlsx');
          setProcessing(false);
          sendResponse({
            received: true,
          });
        } else if (message.msg === 'numberProcessing') {
          setNumberprocess(message.data);
        } else {
          sendResponse('Not found');
        }
      });
    };
    handleMounted();
  }, [trigger, processing, numberProcess]);

  const setDomInfo = (res) => {
    console.log('setDom', res);
  };

  const getLinks = () => {
    setTrigger(true);
    setProcessing(true);
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        console.log('tabs getlink:', tabs);
        chrome.tabs.sendMessage(tabs[0].id, { trigger: true }, setDomInfo);
      }
    );
  };

  const exportExcel = () => {
    chrome.tabs.query(
      {
        active: true,
        currentWindow: true,
      },
      (tabs) => {
        chrome.tabs.sendMessage(
          tabs[0].id,
          {
            export: true,
          },
          setDomInfo
        );
      }
    );
  };

  const handleClick = () => {
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      Cookie: cookie,
    };
    const body = {
      fb_dtsg:
        'NAcOzuauavD_yFLqmAgt8q4dbUlVEXnYjFlxCj8yJpS9_LhzDnzbI8g:38:1697507300',
      variables: `{"count":10,"cursor":"AQHRMjtbY5y6Ogy6Ur3KNFG7xgGIZtjYpw-KtZH_josllSBH5P8GlF9_nzJjNxRubu-r_9r7jhrDGDdwa1cBw_F6tQ","groupID":"2948794792004029","recruitingGroupFilterNonCompliant":false,"scale":1,"id":"2948794792004029"}`,
      server_timestamps: true,
      doc_id: '7093752180659727',
    };
    axios
      .post('https://www.facebook.com/api/graphql/', body, { headers: headers })
      .then((response) => {
        // Xử lý dữ liệu trả về từ API
        console.log(response.data);
      })
      .catch((error) => {
        // Xử lý lỗi nếu có
        console.error('Error fetching data:', error);
      });
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
          <button
            className="text-lg font-medium bg-blue-500 hover:bg-blue-600 p-2 rounded-lg"
            disabled={processing}
            onClick={handleClick}
          >
            {processing ? 'Processing...' : 'Get Profile'}
          </button>
        ) : (
          <div className="text-lg font-medium bg-blue-500 p-2 rounded-lg">
            You need to access the group that you have joined in order for the
            tool to work!
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
