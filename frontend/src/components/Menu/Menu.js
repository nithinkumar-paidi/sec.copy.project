import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './Menu.css';

const Menu = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [menuItems, setMenuItems] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [code, setCode] = useState('');
    const [isCodeCorrect, setIsCodeCorrect] = useState(false);
    const [editItem, setEditItem] = useState(null); // For editing an item

    useEffect(() => {
        fetchMenuItems();
    }, []);

    // Fetch menu items from the API
    const fetchMenuItems = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/menuitems');
            setMenuItems(response.data);
        } catch (error) {
            console.error('Error fetching menu items:', error);
        }
    };

    // Handle quantity change for menu items
    const handleQuantityChange = (itemId, value) => {
        setQuantities(prev => ({ ...prev, [itemId]: value }));
    };

    // Add selected menu items to orders
    const handleAddToOrders = async () => {
        // Filter items that have a quantity greater than 0
        const orders = menuItems
            .filter(item => quantities[item._id] > 0)
            .map(item => ({
                itemId: item._id, 
                quantity: quantities[item._id], 
            }));

        // If no items are selected, show an alert
        if (orders.length === 0) {
            alert('Please select at least one item before adding to orders.');
            return;
        }

        try {
            // POST request to create the booking (send orders and tableId)
            const response = await axios.post('http://localhost:5000/api/bookings/orders', {
                orders,
                tableId: location.state.tableId,
            });

            if (response.status === 200) {
                alert('Orders added successfully!');
                setQuantities({}); // Reset quantities after successful order
                navigate('/orders', {
                    state: { tableId: location.state.tableId },
                });
            } else {
                alert('Failed to add orders. Please try again.');
            }
        } catch (error) {
            console.error('Error sending orders:', error);
            alert('There was an error sending your orders. Please try again.');
        }
    };

    // Add a new menu item to the menu
    const handleAddMenuItem = async () => {
        try {
            await axios.post('http://localhost:5000/api/menuitems', newItem);
            setShowModal(false);
            setNewItem({ name: '', price: '', description: '' });
            fetchMenuItems();
        } catch (error) {
            console.error('Error adding menu item:', error);
        }
    };

    // Submit the code to unlock the admin features
    const handleCodeSubmit = () => {
        if (code === '1234') {
            setIsCodeCorrect(true);
            setShowCodeModal(false);
            setShowModal(true);
        } else {
            alert('Incorrect code. Please try again.');
        }
    };

    // Edit an existing menu item
    const handleEditMenuItem = (item) => {
        setEditItem(item); // Set the item to be edited
        setShowModal(true); // Open the modal for editing
    };

    // Save the edited menu item
    const handleSaveEditItem = async () => {
        try {
            await axios.put(`http://localhost:5000/api/menuitems/${editItem._id}`, editItem);
            setEditItem(null); // Reset edit item
            setShowModal(false); // Close modal
            fetchMenuItems(); // Refresh menu items
        } catch (error) {
            console.error('Error editing menu item:', error);
        }
    };

    // Delete a menu item
    const handleDeleteMenuItem = async (itemId) => {
        try {
            await axios.delete(`http://localhost:5000/api/menuitems/${itemId}`);
            fetchMenuItems(); // Refresh menu items
        } catch (error) {
            console.error('Error deleting menu item:', error);
        }
    };

    return (
        <div className="menu-panel">
            <h2>Menu</h2>
            <button onClick={() => setShowCodeModal(true)}>Add Menu Item</button>

            {showCodeModal && (
                <div className="modal">
                    <h3>Enter 4-digit Code</h3>
                    <label>
                        Code:
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            maxLength="4"
                            pattern="\d{4}"
                        />
                    </label>
                    <button onClick={handleCodeSubmit}>Submit</button>
                    <button onClick={() => setShowCodeModal(false)}>Cancel</button>
                </div>
            )}

            {showModal && isCodeCorrect && (
                <div className="modal">
                    <h3>{editItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                    <label>
                        Name:
                        <input
                            type="text"
                            value={editItem ? editItem.name : newItem.name}
                            onChange={(e) => (editItem ? setEditItem({ ...editItem, name: e.target.value }) : setNewItem({ ...newItem, name: e.target.value }))} />
                    </label>
                    <label>
                        Price:
                        <input
                            type="number"
                            value={editItem ? editItem.price : newItem.price}
                            onChange={(e) => (editItem ? setEditItem({ ...editItem, price: e.target.value }) : setNewItem({ ...newItem, price: e.target.value }))} />
                    </label>
                    <label>
                        Description:
                        <textarea
                            value={editItem ? editItem.description : newItem.description}
                            onChange={(e) => (editItem ? setEditItem({ ...editItem, description: e.target.value }) : setNewItem({ ...newItem, description: e.target.value }))} />
                    </label>
                    <button onClick={editItem ? handleSaveEditItem : handleAddMenuItem}>
                        {editItem ? 'Save Changes' : 'Add Item'}
                    </button>
                    <button onClick={() => setShowModal(false)}>Cancel</button>
                </div>
            )}

            <div className="menu-items">
                {menuItems.map(item => (
                    <div key={item._id} className="menu-item">
                        <h3>{item.name}</h3>
                        <p>Price: ${item.price}</p>
                        <label className="quantity-label">Quantity:</label>
                        <div className="quantity-controls">
                            <button onClick={() => handleQuantityChange(item._id, (quantities[item._id] || 0) + 1)}>+</button>
                            <input
                                type="number"
                                value={quantities[item._id] || 0}
                                readOnly
                                min="0"
                            />
                            <button onClick={() => handleQuantityChange(item._id, Math.max((quantities[item._id] || 0) - 1, 0))}>-</button>
                        </div>

                        {isCodeCorrect && (
                            <div className="edit-delete-buttons">
                                <button onClick={() => handleEditMenuItem(item)}>Edit</button>
                                <button onClick={() => handleDeleteMenuItem(item._id)}>Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="button-container">
                <button 
                    onClick={handleAddToOrders} 
                    disabled={!Object.values(quantities).some(q => q > 0)}
                >
                    Add to Orders
                </button>
            </div>
        </div>
    );
};

export default Menu;


// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
// import './Menu.css';

// const Menu = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const [menuItems, setMenuItems] = useState([]);
//     const [quantities, setQuantities] = useState({});
//     const [showModal, setShowModal] = useState(false);
//     const [newItem, setNewItem] = useState({ name: '', price: '', description: '' });
//     const [showCodeModal, setShowCodeModal] = useState(false);
//     const [code, setCode] = useState('');
//     const [isCodeCorrect, setIsCodeCorrect] = useState(false);
//     const [editItem, setEditItem] = useState(null); // For editing an item

//     useEffect(() => {
//         fetchMenuItems();
//     }, []);

//     // Fetch menu items from the API
//     const fetchMenuItems = async () => {
//         try {
//             const response = await axios.get('http://localhost:5000/api/menuitems');
//             setMenuItems(response.data);
//         } catch (error) {
//             console.error('Error fetching menu items:', error);
//         }
//     };

//     // Handle quantity change for menu items
//     const handleQuantityChange = (itemId, value) => {
//         setQuantities(prev => ({ ...prev, [itemId]: value }));
//     };

//     // Add selected menu items to orders
//     const handleAddToOrders = async () => {
//         const orders = menuItems
//             .filter(item => quantities[item._id] > 0)
//             .map(item => ({
//                 itemId: item._id,
//                 quantity: quantities[item._id],
//             }));

//         if (orders.length === 0) {
//             alert('Please select at least one item before adding to orders.');
//             return;
//         }

//         try {
//             const response = await axios.post('http://localhost:5000/api/bookings/orders', {
//                 orders,
//                 tableId: location.state.tableId,
//             });

//             if (response.status === 200) {
//                 alert('Orders added successfully!');
//                 setQuantities({});
//                 navigate('/orders', { state: { tableId: location.state.tableId } });
//             } else {
//                 alert('Failed to add orders. Please try again.');
//             }
//         } catch (error) {
//             console.error('Error sending orders:', error);
//             alert('There was an error sending your orders. Please try again.');
//         }
//     };

//     // Add a new menu item to the menu
//     const handleAddMenuItem = async () => {
//         if (!newItem.name || !newItem.price || !newItem.description) {
//             alert("All fields are required!");
//             return;
//         }

//         try {
//             await axios.post('http://localhost:5000/api/menuitems', newItem);
//             setShowModal(false);
//             setNewItem({ name: '', price: '', description: '' });
//             fetchMenuItems();
//         } catch (error) {
//             console.error('Error adding menu item:', error);
//             alert("Failed to add item. Please try again.");
//         }
//     };

//     // Submit the code to unlock the admin features
//     const handleCodeSubmit = () => {
//         if (code === '1234') {
//             setIsCodeCorrect(true);
//             setShowCodeModal(false);
//             setShowModal(true);
//         } else {
//             alert('Incorrect code. Please try again.');
//         }
//     };

//     // Edit an existing menu item
//     const handleEditMenuItem = (item) => {
//         setEditItem(item);
//         setShowModal(true);
//     };

//     // Save the edited menu item
//     const handleSaveEditItem = async () => {
//         if (!editItem.name || !editItem.price || !editItem.description) {
//             alert("All fields are required!");
//             return;
//         }

//         try {
//             await axios.put(`http://localhost:5000/api/menuitems/${editItem._id}`, editItem);
//             setEditItem(null);
//             setShowModal(false);
//             fetchMenuItems();
//         } catch (error) {
//             console.error('Error editing menu item:', error);
//             alert("Failed to save changes. Please try again.");
//         }
//     };

//     // Delete a menu item
//     const handleDeleteMenuItem = async (itemId) => {
//         try {
//             await axios.delete(`http://localhost:5000/api/menuitems/${itemId}`);
//             fetchMenuItems();
//         } catch (error) {
//             console.error('Error deleting menu item:', error);
//             alert("Failed to delete item. Please try again.");
//         }
//     };

//     return (
//         <div className="menu-panel">
//             <h2>Menu</h2>
//             <button onClick={() => setShowCodeModal(true)}>Add Menu Item</button>

//             {showCodeModal && (
//                 <div className="modal">
//                     <h3>Enter 4-digit Code</h3>
//                     <label>
//                         Code:
//                         <input
//                             type="text"
//                             value={code}
//                             onChange={(e) => setCode(e.target.value)}
//                             maxLength="4"
//                             pattern="\d{4}"
//                         />
//                     </label>
//                     <button onClick={handleCodeSubmit}>Submit</button>
//                     <button onClick={() => setShowCodeModal(false)}>Cancel</button>
//                 </div>
//             )}

//             {showModal && isCodeCorrect && (
//                 <div className="modal">
//                     <h3>{editItem ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
//                     <label>
//                         Name:
//                         <input
//                             type="text"
//                             value={editItem ? editItem.name : newItem.name}
//                             onChange={(e) => (editItem ? setEditItem({ ...editItem, name: e.target.value }) : setNewItem({ ...newItem, name: e.target.value }))} />
//                     </label>
//                     <label>
//                         Price:
//                         <input
//                             type="number"
//                             value={editItem ? editItem.price : newItem.price}
//                             onChange={(e) => (editItem ? setEditItem({ ...editItem, price: e.target.value }) : setNewItem({ ...newItem, price: e.target.value }))} />
//                     </label>
//                     <label>
//                         Description:
//                         <textarea
//                             value={editItem ? editItem.description : newItem.description}
//                             onChange={(e) => (editItem ? setEditItem({ ...editItem, description: e.target.value }) : setNewItem({ ...newItem, description: e.target.value }))} />
//                     </label>
//                     <button onClick={editItem ? handleSaveEditItem : handleAddMenuItem}>
//                         {editItem ? 'Save Changes' : 'Add Item'}
//                     </button>
//                     <button onClick={() => setShowModal(false)}>Cancel</button>
//                 </div>
//             )}

//             <div className="menu-items">
//                 {menuItems.map(item => (
//                     <div key={item._id} className="menu-item">
//                         <h3>{item.name}</h3>
//                         <p>Price: ${item.price}</p>
//                         <label className="quantity-label">Quantity:</label>
//                         <div className="quantity-controls">
//                             <button onClick={() => handleQuantityChange(item._id, (quantities[item._id] || 0) + 1)}>+</button>
//                             <input
//                                 type="number"
//                                 value={quantities[item._id] || 0}
//                                 readOnly
//                                 min="0"
//                             />
//                             <button onClick={() => handleQuantityChange(item._id, Math.max((quantities[item._id] || 0) - 1, 0))}>-</button>
//                         </div>

//                         {isCodeCorrect && (
//                             <div className="edit-delete-buttons">
//                                 <button onClick={() => handleEditMenuItem(item)}>Edit</button>
//                                 <button onClick={() => handleDeleteMenuItem(item._id)}>Delete</button>
//                             </div>
//                         )}
//                     </div>
//                 ))}
//             </div>

//             <div className="button-container">
//                 <button 
//                     onClick={handleAddToOrders} 
//                     disabled={Object.values(quantities).every(q => q === 0)}
//                 >
//                     Add to Orders
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default Menu;

