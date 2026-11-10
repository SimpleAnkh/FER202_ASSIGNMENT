import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import SiteNavbar from './SiteNavbar';

export default function SiteLayout() {
  return (
    <>
      <SiteNavbar />
      <Outlet />
      <Footer />
    </>
  );
}
