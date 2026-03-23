import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import "./App.css";
//import Header from "./components/Header";
//import Footer from "./components/Footer";
//import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
//import Services from "./pages/Services";
//import Workers from "./pages/Workers";
//import Checkout from "./pages/Checkout";
//import Rating from "./pages/Rating";
//import WorkerDashboard from "./pages/WorkerDashboard";
//import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
//import BookingHistory from "./pages/BookingHistory";
//import Contact from "./pages/Contact";
//import Notifications from "./pages/Notifications";
//import FAQ from "./pages/FAQ";
//import Messages from "./pages/Messages";
//import WorkerVerification from "./pages/WorkerVerification";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";

function AppLayout() {
  const [user, setUser] = useState(null);
  const location = useLocation();
  const hideLayoutForAuth =
    location.pathname === "/signin" || location.pathname === "/signup";
  return (
    <div className="app">
      {/*{!hideLayoutForAuth && <Header user={user} setUser={setUser} />}*/}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn setUser={setUser} />} />
          <Route path="/signup" element={<SignUp />} />
          {/*<Route path="/services" element={<Services />} />*/}
          {/*<Route path="/workers" element={<Workers />} />*/}
          {/*<Route path="/checkout" element={<Checkout />} />*/}
          {/*<Route path="/rating" element={<Rating />} />*/}
          {/*<Route path="/worker-dashboard" element={<WorkerDashboard />} />*/}
          {/*<Route path="/admin-dashboard" element={<AdminDashboard />} />*/}
          {/*<Route path="/admin" element={<AdminDashboard />} />*/}
          <Route path="/profile" element={<Profile />} />
          {/*<Route path="/history" element={<BookingHistory />} />*/}
          {/*<Route path="/contact" element={<Contact />} />*/}
          {/*<Route path="/notifications" element={<Notifications />} />*/}
          {/*<Route path="/faq" element={<FAQ />} />*/}
          {/*<Route path="/messages" element={<Messages />} />*/}
          {/*<Route path="/worker-verification" element={<WorkerVerification />} />*/}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </main>
     {/* {!hideLayoutForAuth && <Footer />}*/}
    </div>
  );
}
function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  )
}
export default App;