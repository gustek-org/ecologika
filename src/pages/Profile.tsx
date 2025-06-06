
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProfileSidebar from '@/components/profile/ProfileSidebar';
import ProfileSettings from '@/components/profile/ProfileSettings';
import ChangePassword from '@/components/profile/ChangePassword';
import MyProducts from '@/components/profile/MyProducts';
import PurchaseHistory from '@/components/profile/PurchaseHistory';
import EmissionsReport from '@/components/profile/EmissionsReport';

const Profile = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('profile');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return <ProfileSettings />;
      case 'password':
        return <ChangePassword />;
      case 'products':
        return <MyProducts />;
      case 'purchases':
        return <PurchaseHistory />;
      case 'emissions':
        return <EmissionsReport />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <div className="flex flex-1">
        <ProfileSidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
        />
        
        <main className="flex-1 p-8 min-h-[calc(100vh-200px)]">
          <div className="max-w-4xl">
            {renderContent()}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default Profile;
