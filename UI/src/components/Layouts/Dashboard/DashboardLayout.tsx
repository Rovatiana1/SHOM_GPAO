// components/Layout/DashboardLayout.tsx
import React from 'react';
import { User } from '../../../types/Users';

interface DashboardLayoutProps {
  user: User;
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, children }) => {
  return children;
};

export default DashboardLayout;