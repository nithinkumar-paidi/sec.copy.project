import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import './Tpayment.css';

const PaymentPage = () => {
    const location = useLocation();
    const { orderId } = location.state || {};
    const [orderDetails, setOrderDetails] = useState(null);

    useEffect(() => {
        if (orderId) {
            fetchOrderDetails(orderId);
        }
    }, [orderId]);

    const fetchOrderDetails = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/orders/${id}`);
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error fetching order details:', errorText);
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            setOrderDetails(data);
        } catch (error) {
            console.error('Error fetching order details:', error);
            alert('Could not fetch order details. Please try again.');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSendToKitchen = () => {
        const savedOrders = JSON.parse(localStorage.getItem('kitchenOrders')) || [];
        
        const orderToSend = {
            ...orderDetails,
            orderedItems: orderDetails.orderedItems.map(item => ({
                quantity: item.quantity,
                itemId: item.itemId?._id || 'Unknown ID', 
            })),
            orderType: 'takeaway' 
        };

        savedOrders.push(orderToSend);
        localStorage.setItem('kitchenOrders', JSON.stringify(savedOrders));
        
        alert('Order has been sent to the kitchen!');
    };

    if (!orderDetails) {
        return <p>Loading order details...</p>;
    }

    const totalBill = orderDetails.orderedItems.reduce((total, item) => {
        return total + (item.itemId?.price || 0 * item.quantity); 
    }, 0);

    return (
        <div className="payment-container">
            <h2>Payment for Order ID: {orderDetails._id}</h2>
            <div className="order-grid">
                {orderDetails.orderedItems.map(item => (
                    <div key={item.itemId?._id || item._id} className="order-item">
                        <h4>{item.itemId?.name || 'Unknown'}</h4>
                        <p>Quantity: {item.quantity}</p>
                        <p>Price: ${item.itemId?.price?.toFixed(2) || 'N/A'}</p>
                        <p>Total: ${(item.itemId?.price || 0 * item.quantity).toFixed(2)}</p>
                    </div>
                ))}
            </div>
            <h4>Total Bill: ${totalBill.toFixed(2)}</h4>
            <h3>QR Code for Payment:</h3>
            <div className="qr-code">
                <QRCodeSVG value={`Payment for Order ID: ${orderDetails._id} - Total: ${totalBill.toFixed(2)}`} />
            </div>
            <div>
                <button onClick={handlePrint}>Print Bill</button>
                <Link to='/kitchen'>
                    <button onClick={handleSendToKitchen}>Send to Kitchen</button>
                </Link>
            </div>
        </div>
    );
};

export default PaymentPage;
