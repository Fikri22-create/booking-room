import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom"

import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"
import ForgotPassword from "./pages/auth/ForgotPassword"
import ResetPassword from "./pages/auth/ResetPassword"

import Dashboard from "./pages/admin/Dashboard"
import Rooms from "./pages/admin/Rooms"
import AddRoom from "./pages/admin/AddRoom"
import EditRoom from "./pages/admin/EditRoom"
import RoomGallery from "./pages/admin/RoomGallery"
import RoomBookings from "./pages/admin/RoomBookings"
import Bookings from "./pages/admin/Booking"
import Payments from "./pages/admin/Payment"
import Users from "./pages/admin/User"
import AdminReviews from "./pages/admin/Reviews"
import PaymentDetail from "./pages/admin/PaymentDetail"
import BookingDetail from "./pages/admin/BookingDetail"
import UserDetail from "./pages/admin/UserDetail"
import Amenities from "./pages/admin/Amenities"
import AuditLogs from "./pages/admin/AuditLogs"

import UserRooms from "./pages/user/Rooms"
import RoomDetail from "./pages/user/RoomDetail"
import BookingForm from "./pages/user/BookingForm"
import MyBookings from "./pages/user/MyBookings"
import PaymentUpload from "./pages/user/PaymentUpload"
import MyPayments from "./pages/user/MyPayments"
import Profile from "./pages/user/Profile"
import UserDashboard from "./pages/user/Dashboard"
import Wishlist from "./pages/user/Wishlist"
import MyReviews from "./pages/user/MyReviews"

import BaseLayout from "./layouts/BaseLayout"

import PrivateRoute from "./routes/PrivateRoute"
import AdminRoute from "./routes/AdminRoute"
import Landingpage from "./pages/public/LandingPage"

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landingpage/>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                <Route path="/admin/dashboard" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <Dashboard />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                } />
                <Route path="/admin/rooms" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <Rooms />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                } />
                <Route path="/admin/rooms/add" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <AddRoom />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                } />
                <Route path="/admin/rooms/edit/:id" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <EditRoom />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                } />
                <Route path="/admin/rooms/gallery/:id" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <RoomGallery />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                } />
                <Route path="/admin/rooms/:id/bookings" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <RoomBookings />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                } />
                <Route path="/admin/bookings" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <Bookings />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                } />
                <Route path="/admin/payments" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <Payments />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                } />
                <Route path="/admin/users" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <Users />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                } />
                <Route path="/admin/payments/:id" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <PaymentDetail />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                }/>
                <Route path="/admin/bookings/:id" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <BookingDetail />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                }/>
                <Route path="/admin/users/:id" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <UserDetail />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                }/>
                <Route path="/admin/reviews" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <AdminReviews />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                }/>
                <Route path="/admin/amenities" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <Amenities />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                }/>
                <Route path="/admin/audit-logs" element={
                    <PrivateRoute>
                        <AdminRoute>
                            <BaseLayout>
                                <AuditLogs />
                            </BaseLayout>
                        </AdminRoute>
                    </PrivateRoute>
                }/>

                <Route path="/user/dashboard" element={
                    <PrivateRoute>
                        <BaseLayout>
                            <UserDashboard />
                        </BaseLayout>
                    </PrivateRoute>
                } />
                <Route path="/user/wishlist" element={
                    <PrivateRoute>
                        <BaseLayout>
                            <Wishlist />
                        </BaseLayout>
                    </PrivateRoute>
                } />
                <Route path="/user/rooms" element={
                    <PrivateRoute>
                        <BaseLayout>
                            <UserRooms />
                        </BaseLayout>
                    </PrivateRoute>
                } />
                <Route path="/user/rooms/:id" element={
                    <PrivateRoute>
                        <BaseLayout>
                            <RoomDetail />
                        </BaseLayout>
                    </PrivateRoute>
                } />
                <Route path="/user/book/:id" element={
                    <PrivateRoute>
                        <BaseLayout>
                            <BookingForm />
                        </BaseLayout>
                    </PrivateRoute>
                } />
                <Route path="/user/my-bookings" element={
                    <PrivateRoute>
                        <BaseLayout>
                            <MyBookings />
                        </BaseLayout>
                    </PrivateRoute>
                } />
                <Route path="/user/payment/:bookingId" element={
                    <PrivateRoute>
                        <BaseLayout>
                            <PaymentUpload />
                        </BaseLayout>
                    </PrivateRoute>
                } />
                <Route path="/user/payments" element={
                    <PrivateRoute>
                        <BaseLayout>
                            <MyPayments />
                        </BaseLayout>
                    </PrivateRoute>
                } />
                <Route path="/user/profile" element={
                    <PrivateRoute>
                        <BaseLayout>
                            <Profile />
                        </BaseLayout>
                    </PrivateRoute>
                } />
                <Route path="/user/my-reviews" element={
                    <PrivateRoute>
                        <BaseLayout>
                            <MyReviews />
                        </BaseLayout>
                    </PrivateRoute>
                } />
            </Routes>
        </BrowserRouter>
    );
}