import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Kitchen.css';

const Kitchen = () => {
    const location = useLocation();
    const { orderDetails } = location.state || {};
    const [orders, setOrders] = useState([]);
    const [menuItems, setMenuItems] = useState({});
    const [activeOrders, setActiveOrders] = useState([]);  // Track active orders for background color change

    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/menuitems');
                const items = await response.json();
                const itemMap = items.reduce((acc, item) => {
                    acc[item._id] = item; 
                    return acc;
                }, {});
                setMenuItems(itemMap);
            } catch (error) {
                console.error("Error fetching menu items:", error);
            }
        };

        const savedOrders = JSON.parse(localStorage.getItem('kitchenOrders')) || [];

        if (orderDetails) {
            const orderExists = savedOrders.some(order => order.bookingId === orderDetails.bookingId);
            if (!orderExists) {
                savedOrders.push(orderDetails);
                localStorage.setItem('kitchenOrders', JSON.stringify(savedOrders));
            }
        }

        setOrders(savedOrders);
        fetchMenuItems();
    }, [orderDetails]);

    const handleRemoveOrder = (index) => {
        const updatedOrders = orders.filter((_, i) => i !== index);
        setOrders(updatedOrders);
        localStorage.setItem('kitchenOrders', JSON.stringify(updatedOrders));
    };

    const handleStartOrder = (orderId) => {
        setActiveOrders(prevActiveOrders => [...prevActiveOrders, orderId]);
    };

    const tableOrders = orders.filter(order => order.orderType === 'table');
    const takeawayOrders = orders.filter(order => order.orderType === 'takeaway');

    return (
        <div className="kitchen-container">
            <h2>Kitchen Orders</h2>
            <div className="orders-flex">
                <div className="orders-section">
                    <h3>Table Orders</h3>
                    {tableOrders.length > 0 ? (
                        tableOrders.map((order, index) => (
                            <div
                                key={index}
                                className={`order-card ${activeOrders.includes(order.bookingId) ? 'active' : ''}`}  // Apply active class to entire card
                            >
                                <h4>Table ID: {order.tableId}</h4>
                                <p><strong>Booking ID:</strong> {order.bookingId}</p>
                                <p><strong>Booked By:</strong> {order.name}</p>
                                <p><strong>Members:</strong> {order.members}</p>
                                <div>
                                    <strong>Ordered Items:</strong>
                                    {order.orderedItems.length > 0 ? (
                                        <ul>
                                            {order.orderedItems.map((item, idx) => {
                                                const menuItem = menuItems[item.itemId];
                                                return (
                                                    <li key={idx}>
                                                        {menuItem ? `${menuItem.name} (Quantity: ${item.quantity})` : 'Unknown Item'}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p>No items ordered.</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleStartOrder(order.bookingId)}
                                >
                                    Start
                                </button>
                                <button onClick={() => handleRemoveOrder(orders.indexOf(order))}>Remove Order</button>
                            </div>
                        ))
                    ) : (
                        <p>No table orders in the kitchen.</p>
                    )}
                </div>

                <div className="orders-section">
                    <h3>Takeaway Orders</h3>
                    {takeawayOrders.length > 0 ? (
                        takeawayOrders.map((order, index) => (
                            <div
                                key={index}
                                className={`order-card ${activeOrders.includes(order.bookingId) ? 'active' : ''}`}  // Apply active class to entire card
                            >
                                <h4>Takeaway Order ID: {order.bookingId}</h4>
                                <p><strong>Booked By:</strong> {order.name}</p>
                                <div>
                                    <strong>Ordered Items:</strong>
                                    {order.orderedItems.length > 0 ? (
                                        <ul>
                                            {order.orderedItems.map((item, idx) => {
                                                const menuItem = menuItems[item.itemId]; 
                                                return (
                                                    <li key={idx}>
                                                        {menuItem ? `${menuItem.name} (Quantity: ${item.quantity})` : 'Unknown Item'}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p>No items ordered.</p>
                                    )}
                                </div>
                                <button
                                    onClick={() => handleStartOrder(order.bookingId)}
                                >
                                    Start
                                </button>
                                <button onClick={() => handleRemoveOrder(orders.indexOf(order))}>Remove Order</button>
                            </div>
                        ))
                    ) : (
                        <p>No takeaway orders in the kitchen.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Kitchen;
