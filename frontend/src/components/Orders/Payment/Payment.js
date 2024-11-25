import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate,Link } from 'react-router-dom';
import axios from 'axios';

const Payment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderDetails } = location.state || {};

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderDetails) {
      setLoading(false);
    }
  }, [orderDetails]);

  if (loading) {
    return <div>Loading payment details...</div>;
  }

  if (!orderDetails) {
    return <div>Error: No order details found!</div>;
  }

  const { bookingId, tableId, name, orderedItems, totalAmount, paymentQRCode } = orderDetails;

  const handlePaymentDone = async () => {
    try {
      // Mark the order as completed on the backend
      await axios.post(`http://localhost:5000/api/orders/${bookingId}/complete`);

    } catch (error) {
      console.error("Error completing payment:", error);
    }
  };

  return (
    <div className="payment-container">
      <h2>Payment Details</h2>
      <p><strong>Booking ID:</strong> {bookingId}</p>
      <p><strong>Table ID:</strong> {tableId}</p>
      <p><strong>Booked By:</strong> {name}</p>

      <h3>Ordered Items:</h3>
      <ul>
        {orderedItems.map((item, index) => (
          <li key={index}>
            <span>{item.name} (Quantity: {item.quantity})</span>
            <span> - ${item.price.toFixed(2)} each</span>
            <span> = ${item.total.toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <h3>Total Amount: ${totalAmount.toFixed(2)}</h3>

      <div className="payment-qr">
        <h4>Payment QR Code:</h4>
        <img src={paymentQRCode} alt="Payment QR" />
      </div>

      {/* Button to mark the payment as completed */}
      <Link to ='/orders'><button className="payment-done-btn">
        Payment Done
      </button></Link>
    </div>
  );
};

export default Payment;


// import React, { useEffect, useState } from 'react';
// import { useLocation, useNavigate, Link } from 'react-router-dom';
// import axios from 'axios';

// const Payment = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const { orderDetails } = location.state || {};

//   const [loading, setLoading] = useState(true);
//   const [razorpayOrderId, setRazorpayOrderId] = useState(null); // To store the Razorpay order ID

//   useEffect(() => {
//     if (orderDetails) {
//       setLoading(false);
//       createRazorpayOrder(); // Create Razorpay order when the order details are loaded
//     }
//   }, [orderDetails]);

//   const createRazorpayOrder = async () => {
//     try {
//       // Sending request to the backend to create the Razorpay order
//       const response = await axios.post('http://localhost:5000/api/payment/create-order', {
//         amount: orderDetails.totalAmount * 100, // Amount in paise (1 INR = 100 paise)
//         currency: 'INR',
//         receipt: orderDetails.bookingId,
//         notes: {
//           tableId: orderDetails.tableId,
//           bookingId: orderDetails.bookingId
//         }
//       });

//       console.log('Razorpay Order Response:', response); // Log the response for debugging

//       // Store Razorpay order ID in state
//       setRazorpayOrderId(response.data.id);

//       // Initialize Razorpay
//       const options = {
//         key: 'YOUR_RAZORPAY_KEY', // Use your Razorpay public key here
//         amount: orderDetails.totalAmount * 100, // Amount in paise
//         currency: 'INR',
//         name: 'Restaurant Name',
//         description: `Payment for Table ${orderDetails.tableId}`,
//         order_id: response.data.id, // Razorpay Order ID
//         handler: function (paymentResponse) {
//           // This handler is called when payment is successful
//           handlePaymentSuccess(paymentResponse);
//         },
//         prefill: {
//           name: orderDetails.name,
//           email: 'customer@example.com', // Optionally, you can pass the customer’s email
//           contact: '1234567890' // Optionally, pass the customer's phone number
//         },
//         theme: {
//           color: '#F37254' // Custom theme color for the payment modal
//         }
//       };

//       const rzp = new window.Razorpay(options);
//       rzp.open(); // Open the Razorpay payment modal

//     } catch (error) {
//       console.error('Error creating Razorpay order:', error.response ? error.response.data : error.message);
//       alert('Error creating Razorpay order. Please try again later.');
//     }
//   };

//   const handlePaymentSuccess = async (paymentResponse) => {
//     try {
//       // Once payment is successful, mark the order as completed on your backend
//       await axios.post(`http://localhost:5000/api/orders/${orderDetails.bookingId}/complete`, {
//         paymentId: paymentResponse.razorpay_payment_id,
//         signature: paymentResponse.razorpay_signature
//       });

//       // Navigate to orders page or show success message
//       alert('Payment Successful');
//       navigate('/orders');
//     } catch (error) {
//       console.error('Error marking payment as completed:', error);
//     }
//   };

//   const handlePaymentFailure = (paymentResponse) => {
//     console.error('Payment failed:', paymentResponse);
//     alert('Payment failed. Please try again.');
//   };

//   if (loading) {
//     return <div>Loading payment details...</div>;
//   }

//   if (!orderDetails) {
//     return <div>Error: No order details found!</div>;
//   }

//   const { bookingId, tableId, name, orderedItems, totalAmount, paymentQRCode } = orderDetails;

//   return (
//     <div className="payment-container">
//       <h2>Payment Details</h2>
//       <p><strong>Booking ID:</strong> {bookingId}</p>
//       <p><strong>Table ID:</strong> {tableId}</p>
//       <p><strong>Booked By:</strong> {name}</p>

//       <h3>Ordered Items:</h3>
//       <ul>
//         {orderedItems.map((item, index) => (
//           <li key={index}>
//             <span>{item.name} (Quantity: {item.quantity})</span>
//             <span> - ₹{item.price.toFixed(2)} each</span>
//             <span> = ₹{item.total.toFixed(2)}</span>
//           </li>
//         ))}
//       </ul>

//       <h3>Total Amount: ₹{totalAmount.toFixed(2)}</h3>

//       <div className="payment-qr">
//         <h4>Payment QR Code:</h4>
//         <img src={paymentQRCode} alt="Payment QR" />
//       </div>

//       {/* Razorpay Payment Button */}
//       <button className="payment-done-btn" onClick={createRazorpayOrder}>
//         Pay with Razorpay
//       </button>
//     </div>
//   );
// };

// export default Payment;
