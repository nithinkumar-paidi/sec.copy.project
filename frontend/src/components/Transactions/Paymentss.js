import React, { useState } from 'react';
import './Paymentss.css';

const DUMMY_TRANSACTIONS = [
  { _id: '1', amount: 120.00, orderId: 'AUG001', paymentId: 'PAY001', status: 'Success', orderType: 'Takeaway', createdAt: '2024-08-05T10:30:00' },
  { _id: '2', amount: 95.75, orderId: 'AUG002', paymentId: 'PAY002', status: 'Success', orderType: 'Table', createdAt: '2024-08-10T12:45:00' },
  { _id: '3', amount: 150.50, orderId: 'AUG003', paymentId: 'PAY003', status: 'Success', orderType: 'Takeaway', createdAt: '2024-08-15T14:20:00' },
  { _id: '4', amount: 110.25, orderId: 'AUG004', paymentId: 'PAY004', status: 'Success', orderType: 'Table', createdAt: '2024-08-20T09:15:00' },
  { _id: '5', amount: 125.00, orderId: 'AUG005', paymentId: 'PAY005', status: 'Success', orderType: 'Takeaway', createdAt: '2024-08-25T16:30:00' },
  { _id: '6', amount: 80.00, orderId: 'SEP001', paymentId: 'PAY006', status: 'Success', orderType: 'Table', createdAt: '2024-09-01T11:00:00' },
  { _id: '7', amount: 90.50, orderId: 'SEP002', paymentId: 'PAY007', status: 'Failed', orderType: 'Takeaway', createdAt: '2024-09-05T13:00:00' },
  { _id: '8', amount: 110.00, orderId: 'SEP003', paymentId: 'PAY008', status: 'Success', orderType: 'Table', createdAt: '2024-09-10T15:00:00' },
  { _id: '9', amount: 130.75, orderId: 'SEP004', paymentId: 'PAY009', status: 'Success', orderType: 'Table', createdAt: '2024-09-15T17:00:00' },
  { _id: '10', amount: 145.25, orderId: 'SEP005', paymentId: 'PAY010', status: 'Success', orderType: 'Table', createdAt: '2024-09-20T09:30:00' },
  { _id: '11', amount: 70.00, orderId: 'SEP006', paymentId: 'PAY011', status: 'Success', orderType: 'Takeaway', createdAt: '2024-09-25T14:30:00' },
  { _id: '12', amount: 85.00, orderId: 'SEP007', paymentId: 'PAY012', status: 'Success', orderType: 'Table', createdAt: '2024-09-30T19:00:00' },
  { _id: '13', amount: 160.00, orderId: 'OCT001', paymentId: 'PAY013', status: 'Failed', orderType: 'Table', createdAt: '2024-10-02T11:30:00' },
  { _id: '14', amount: 115.75, orderId: 'OCT002', paymentId: 'PAY014', status: 'Success', orderType: 'Takeaway', createdAt: '2024-10-05T13:45:00' },
  { _id: '15', amount: 140.50, orderId: 'OCT003', paymentId: 'PAY015', status: 'Success', orderType: 'Table', createdAt: '2024-10-10T16:10:00' },
  { _id: '16', amount: 150.25, orderId: 'OCT004', paymentId: 'PAY016', status: 'Failed', orderType: 'Takeaway', createdAt: '2024-10-15T18:25:00' },
  { _id: '17', amount: 180.00, orderId: 'OCT005', paymentId: 'PAY017', status: 'Success', orderType: 'Table', createdAt: '2024-10-20T20:45:00' },
  { _id: '18', amount: 200.00, orderId: 'OCT006', paymentId: 'PAY018', status: 'Success', orderType: 'Table', createdAt: '2024-10-25T22:15:00' },
  { _id: '19', amount: 130.00, orderId: 'OCT007', paymentId: 'PAY019', status: 'Success', orderType: 'Takeaway', createdAt: '2024-10-28T10:30:00' },
  { _id: '20', amount: 125.75, orderId: 'OCT008', paymentId: 'PAY020', status: 'Success', orderType: 'Table', createdAt: '2024-10-30T13:50:00' },
  { _id: '21', amount: 110.00, orderId: 'NOV001', paymentId: 'PAY021', status: 'Success', orderType: 'Takeaway', createdAt: '2024-11-01T09:00:00' },
  { _id: '22', amount: 75.25, orderId: 'NOV002', paymentId: 'PAY022', status: 'Pending', orderType: 'Table', createdAt: '2024-11-05T11:45:00' },
  { _id: '23', amount: 95.75, orderId: 'NOV003', paymentId: 'PAY023', status: 'Success', orderType: 'Table', createdAt: '2024-11-10T14:20:00' },
  { _id: '24', amount: 150.00, orderId: 'NOV004', paymentId: 'PAY024', status: 'Success', orderType: 'Takeaway', createdAt: '2024-11-15T16:30:00' }
];

const Transaction = () => {
  const [statusFilter, setStatusFilter] = useState('');
  const [orderTypeFilter, setOrderTypeFilter] = useState('');
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [transactions] = useState(DUMMY_TRANSACTIONS);

  const getFilteredTransactions = () => {
    return transactions.filter(transaction => {
      const matchesStatus = !statusFilter || transaction.status === statusFilter;
      const matchesOrderType = !orderTypeFilter || transaction.orderType === orderTypeFilter;
      const matchesDateRange = !dateRange.startDate || !dateRange.endDate || 
        (new Date(transaction.createdAt) >= new Date(dateRange.startDate) &&
         new Date(transaction.createdAt) <= new Date(dateRange.endDate));
      
      return matchesStatus && matchesOrderType && matchesDateRange;
    });
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'status-success';
      case 'failed':
        return 'status-failed';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  const formatDate = (dateString) => new Date(dateString).toLocaleString();

  const filteredTransactions = getFilteredTransactions();

  return (
    <div className="transaction-container">
      <h1 className="transaction-title">Transactions</h1>
      
      {/* Filters */}
      <div className="filter-section">
        <div className="filter-group">
          <label>Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Success">Success</option>
            <option value="Failed">Failed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Order Type</label>
          <select value={orderTypeFilter} onChange={(e) => setOrderTypeFilter(e.target.value)}>
            <option value="">All</option>
            <option value="Takeaway">Takeaway</option>
            <option value="Table">Table</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Date Range</label>
          <div className="date-range">
            <input type="date" value={dateRange.startDate} onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))} />
            <input type="date" value={dateRange.endDate} onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))} />
          </div>
        </div>
      </div>

      {/* Table */}
      {filteredTransactions.length > 0 ? (
        <div className="table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Amount</th>
                <th>Order ID</th>
                <th>Payment ID</th>
                <th>Status</th>
                <th>Order Type</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction._id} className="transaction-row">
                  <td>{formatCurrency(transaction.amount)}</td>
                  <td>{transaction.orderId}</td>
                  <td>{transaction.paymentId || 'N/A'}</td>
                  <td>
                    <span className={`status-pill ${getStatusColor(transaction.status)}`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td>{transaction.orderType}</td>
                  <td>{formatDate(transaction.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="no-transactions">No transactions found.</div>
      )}
    </div>
  );
};

export default Transaction;
