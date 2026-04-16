import { useState } from "react";
import { createContext } from "react";
import { useAuth, useClerk, useUser } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const [credit, setCredit] = useState(0);
  const [image, setImage] = useState(null);
  const [resultImage, setResultImage] = useState(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const { getToken } = useAuth();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();

  const loadCreditsData = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/credits`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (data.success) {
        setCredit(typeof data.credits === 'number' ? data.credits : 0);
        console.log(data.credits);
      } else {
        toast.error(data.message || 'Failed to load credits');
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message || 'Failed to load credits');
    }
  };

  const removeBg = async (imageFile) => {
    try {
      if (!isSignedIn) {
        return openSignIn();
      }

      if (!imageFile) {
        toast.error('Please select an image first');
        return;
      }

      setImage(imageFile);
      setResultImage(null);
      navigate('/result');

      const token = await getToken();
      const formData = new FormData();
      formData.append('image', imageFile);

      const { data } = await axios.post(
        `${backendUrl}/api/image/remove-bg`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );

      if (typeof data.creditBalance === 'number') {
        setCredit(data.creditBalance);
      }

      if (data.success) {
        setResultImage(data.resultImage);
      } else {
        toast.error(data.message || 'Failed to remove background');
        if (data.creditBalance === 0) {
          navigate('/buycredit');
        }
      }
    } catch (error) {
      console.log(error);
      toast.error(error?.response?.data?.message || error.message || 'Something went wrong');
    }
  };

  const value = {
    credit,
    setCredit,
    loadCreditsData,
    backendUrl,
    image,
    setImage,
    removeBg,
    resultImage,
    setResultImage,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;