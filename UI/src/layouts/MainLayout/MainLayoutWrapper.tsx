
import React, { useEffect, useRef } from "react";
import MainLayout from "./MainLayout";
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentLot } from "../../store/slices/processSlice";
import { AppDispatch, RootState } from "../../store/store";

const MainLayoutWrapper: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  // FIX: Use generic `useDispatch` for correct thunk action type inference.
  const dispatch = useDispatch<AppDispatch>();
  const fetchAttempted = useRef(false);

  useEffect(() => {
    // If a user is logged in and we haven't tried to fetch the lot status yet, do it.
    // This ensures we sync with the backend on every page load/refresh to get the
    // authoritative processing state and clear any stale "loading" flags from a previous session.
    if (user && !fetchAttempted.current) {
      fetchAttempted.current = true;
      dispatch(fetchCurrentLot(parseInt(user.userId, 10)));
    }
  }, [user, dispatch]);
  
  if (!user) {
    return null;
  }

  return <MainLayout user={user} />;
};

export default MainLayoutWrapper;