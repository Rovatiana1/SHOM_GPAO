import React, { useEffect, useRef } from "react";
import MainLayout from "./MainLayout";
import { useAuthContext } from "../../context/AuthContext";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentLot } from "../../store/slices/processSlice";
import { AppDispatch, RootState } from "../../store/store";

const MainLayoutWrapper: React.FC = () => {
  const { user } = useAuthContext();
  const dispatch: AppDispatch = useDispatch();
  const { currentLot } = useSelector((state: RootState) => state.process);
  const fetchAttempted = useRef(false);

  useEffect(() => {
    // Only fetch if user is logged in, no lot is in state, and we haven't tried yet.
    if (user && !currentLot && !fetchAttempted.current) {
      fetchAttempted.current = true;
      dispatch(fetchCurrentLot(parseInt(user.userId, 10)));
    }
  }, [user, currentLot, dispatch]);
  
  if (!user) {
    return null;
  }

  return <MainLayout user={user} />;
};

export default MainLayoutWrapper;
