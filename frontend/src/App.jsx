import { Route, Routes } from 'react-router-dom'
import PublicLayout from './layouts/PublicLayout'
import AdminLayout from './layouts/AdminLayout'
import { RequireAdmin, RequireAuth, ScrollToTop } from './components/Guards'

import Home from './pages/Home'
import Cars from './pages/Cars'
import CarDetail from './pages/CarDetail'
import Booking from './pages/Booking'
import BookingSuccess from './pages/BookingSuccess'
import Compare from './pages/Compare'
import { About, Contact, Credits, Faq, NotFound } from './pages/Info'
import { Login, Register } from './pages/Auth'
import { AccountLayout, Profile, MyBookings, Favorites } from './pages/Account'

import Dashboard from './pages/admin/Dashboard'
import AdminCars from './pages/admin/AdminCars'
import AdminBookings from './pages/admin/AdminBookings'
import AdminCustomers from './pages/admin/AdminCustomers'
import AdminDrivers from './pages/admin/AdminDrivers'
import AdminCoupons from './pages/admin/AdminCoupons'

export default function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="cars" element={<Cars />} />
          <Route path="cars/:id" element={<CarDetail />} />
          <Route path="booking/:id" element={<RequireAuth><Booking /></RequireAuth>} />
          <Route path="booking/success/:code" element={<RequireAuth><BookingSuccess /></RequireAuth>} />
          <Route path="compare" element={<Compare />} />
          <Route path="about" element={<About />} />
          <Route path="faq" element={<Faq />} />
          <Route path="contact" element={<Contact />} />
          <Route path="credits" element={<Credits />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="account" element={<RequireAuth><AccountLayout /></RequireAuth>}>
            <Route index element={<Profile />} />
            <Route path="bookings" element={<MyBookings />} />
            <Route path="favorites" element={<Favorites />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
          <Route index element={<Dashboard />} />
          <Route path="cars" element={<AdminCars />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="drivers" element={<AdminDrivers />} />
          <Route path="coupons" element={<AdminCoupons />} />
        </Route>
      </Routes>
    </>
  )
}
