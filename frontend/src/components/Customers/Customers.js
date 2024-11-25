import React from 'react';
import { QRCodeCanvas } from 'qrcode.react'; // You can use QRCodeSVG if preferred
import './Customers.css';

const Feedback = () => {
  const googleFormURL = "https://docs.google.com/forms/d/e/1FAIpQLSewMjbnzJ7FuztVmuWhRWoU94vIJMCRJeHiKz5P0kGhRPeH-Q/viewform?usp=sf_link";

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">Restaurant Feedback</h2>
      </div>
      <div className="card-content">
        <p className="description">
          Scan the QR code to provide feedback or answer restaurant-related questions!
        </p>

        <div className="qr-container">
          <QRCodeCanvas value={googleFormURL} size={256} />
        </div>

        <p className="sub-text">
          Scan the QR code above to open the form
        </p>

        <a 
          href={googleFormURL} 
          target="_blank" 
          rel="noopener noreferrer"
          className="button"
        >
          Open Form
        </a>
      </div>
    </div>
  );
};

export default Feedback;