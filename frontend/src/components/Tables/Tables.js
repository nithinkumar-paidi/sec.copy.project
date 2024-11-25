import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Tables.css";
import Modal from "./Booking/Booking";

const TableBooking = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState({
    AC: [],
    NonAC: [],
    Terrace: [],
    Family: [],
  });

  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);

  // Load tables from local storage on component mount
  useEffect(() => {
    const storedTables = JSON.parse(localStorage.getItem("tables"));
    if (storedTables) {
      setTables(storedTables);
    }
  }, []);

  // Update local storage whenever tables change
  useEffect(() => {
    localStorage.setItem("tables", JSON.stringify(tables));
  }, [tables]);

  const addTable = (area) => {
    const newId = tables[area].length + 1;
    const newTable = { id: newId, status: "unoccupied" };
    setTables((prevTables) => ({
      ...prevTables,
      [area]: [...prevTables[area], newTable],
    }));
  };

  const deleteTable = (area, tableId) => {
    setTables((prevTables) => {
      const updatedArea = prevTables[area]
        .filter((table) => table.id !== tableId)
        .map((table, index) => ({ ...table, id: index + 1 })); // Renumber tables
      return {
        ...prevTables,
        [area]: updatedArea,
      };
    });
  };

  const handleBookTable = async (name, members) => {
    if (selectedTable && selectedTable.area && selectedTable.id) {
      const bookingDate = new Date().toISOString().split("T")[0]; // Get current date
      const updatedTables = tables[selectedTable.area].map((table) => {
        if (table.id === selectedTable.id) {
          return { ...table, status: "occupied", name, members, date: bookingDate }; // Add date here
        }
        return table;
      });

      setTables((prevTables) => ({
        ...prevTables,
        [selectedTable.area]: updatedTables,
      }));
      setModalOpen(false);

      try {
        await axios.post("http://localhost:5000/api/book-table", {
          name,
          members,
          tableId: selectedTable.id,
          area: selectedTable.area,
          date: bookingDate,
        });

        navigate("/orders", {
          state: { name, members, tableId: selectedTable.id, date: bookingDate },
        });
      } catch (error) {
        console.error("Error booking table:", error);
        alert("There was an error booking the table. Please try again.");
      }
    }
  };

  const handleCancelBooking = () => {
    if (selectedTable) {
      const updatedTables = tables[selectedTable.area].map((table) => {
        if (table.id === selectedTable.id) {
          return { ...table, status: "unoccupied", name: "", members: "", date: "" }; // Reset the table
        }
        return table;
      });

      setTables((prevTables) => ({
        ...prevTables,
        [selectedTable.area]: updatedTables,
      }));

      setSelectedTable(null);
    }
  };

  const renderTables = (area) => {
    return tables[area].map((table) => (
      <div key={table.id} className={`table-row ${table.status}`}>
        <span>
          Table {table.id} - Status: {table.status}
        </span>
        {table.status === "unoccupied" ? (
          <>
            <button
              className="btn btn-book"
              onClick={() => {
                setSelectedTable({ area, id: table.id });
                setModalOpen(true);
              }}
            >
              Book
            </button>
            <button
              className="btn btn-delete"
              onClick={() => deleteTable(area, table.id)}
            >
              Delete
            </button>
          </>
        ) : (
          <>
            <button
              className="btn btn-cancel"
              onClick={() => {
                setSelectedTable({ area, id: table.id });
                handleCancelBooking();
              }}
            >
              Cancel Booking
            </button>
            <button
              className="btn btn-delete"
              onClick={() => deleteTable(area, table.id)}
              disabled
            >
              Delete
            </button>
          </>
        )}
      </div>
    ));
  };

  return (
    <div className="table-booking">
      <h2>Table Booking</h2>

      {["AC", "NonAC", "Terrace", "Family"].map((area) => (
        <div key={area} className="area-section">
          <h3>{area} Area</h3>
          <button className="btn btn-add" onClick={() => addTable(area)}>
            Add Table
          </button>
          <div className="tables">{renderTables(area)}</div>
        </div>
      ))}

      {isModalOpen && (
        <Modal onClose={() => setModalOpen(false)} onBook={handleBookTable} />
      )}
    </div>
  );
};

export default TableBooking;
