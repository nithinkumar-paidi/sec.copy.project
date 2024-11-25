import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Bookings from './components/Tables/Booking/Booking';
import Orders from './components/Orders/Orders';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import Tables from './components/Tables/Tables';
import Menu from './components/Menu/Menu';
import Revenue from './components/Revenue/Revenue';
import Kitchen from './components/Kitchen/Kitchen';
import './App.css';
import Takeaway from './components/Takeaway/Takeaway';
import Paymentss from './components/Transactions/Paymentss'
import Customers from './components/Customers/Customers';
import Torders from './components/Takeaway/Torders/Torders'
import Tpayment from './components/Takeaway/Tpayment/Tpayment'
import Payment from './components/Orders/Payment/Payment';

const App = () => {
    return (
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/tables" element={<Tables/>} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/menu" element={<Menu />} />
                <Route path="/revenue" element={<Revenue />} />
                <Route path="/bookings" element={<Bookings />} />
                <Route path="/kitchen" element={<Kitchen />} />
                <Route path="/Customers" element={<Customers />} />
                <Route path="/takeaway" element={<Takeaway />} />
                <Route path="/paymentss" element={<Paymentss />} />
                <Route path="/torders" element={<Torders />} />
                <Route path="/tpayment" element={<Tpayment />} />
                <Route path="/payment" element={<Payment />} />
            </Routes>
    );
};

export default App;
