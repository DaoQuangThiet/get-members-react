import React from 'react';
import { useDependentFetch } from '../hooks/useFetch';
import { getAccessToken, getActId } from '../apis/auth';
import { getCookies } from '../apis/cookies';
import { setSession } from '../apis/session';

const CookieInfo = () => {
  const { data, isLoading } = useDependentFetch<string[]>([
    getCookies,
    setSession,
  ]);
  const { data: accessTokenData, isLoading: loadingAccessToken } =
    useDependentFetch<string[]>([getActId, getAccessToken], {
      onError: (err) => {
        console.log(err);
      },
    });
  console.log(data);

  const [cookie] = data || [];
  
  return (
    <div>
      <p>
        This is Cookie: <strong>{cookie}</strong>
      </p>
    </div>
  );
};

export default CookieInfo;
