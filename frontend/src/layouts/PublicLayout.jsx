import React from 'react';
import { Outlet } from 'react-router-dom';

const PublicLayout = () => {
  return (
    <div className="public-wrapper">
      <Outlet />
    </div>
  );
};

export default PublicLayout;
