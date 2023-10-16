import { http } from '../../utils/http';

const setSession = async (cookie: string | null) => {
  if (cookie) {
    localStorage.setItem('cookie', cookie);
    http.facebookInstance.setCookie(cookie);
  } else {
    localStorage.removeItem('cookie');
    http.facebookInstance.clearAuthorization();
  }

  return Promise.resolve(cookie);
};

export { setSession };
