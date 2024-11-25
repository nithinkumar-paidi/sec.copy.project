import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Chart as ChartJS } from 'chart.js/auto';
import { Line } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import './Revenue.css';

const Revenue = () => {
  const [revenueData, setRevenueData] = useState({
    day: [],
    week: [],
    month: [],
    year: [],
    overall: [
      { title: 'Total Orders', value: 0, icon: '📦' },
      { title: 'Total Revenue', value: '$0', icon: '💰' },
      { title: 'Customer Feedback', value: 'Loading...', icon: '⭐' },
      { title: 'Pending Orders', value: 0, icon: '⏳' },
    ],
  });

  const [chartData, setChartData] = useState({
    day: {},
    week: {},
    month: {},
    year: {},
  });

  const [selectedPeriod, setSelectedPeriod] = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  const reportRef = useRef();

  const isLeapYear = (year) => {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  };

  const getDaysInMonth = (month, year) => {
    if (month === 1) {
      return isLeapYear(year) ? 29 : 28;
    }
    return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month];
  };

  const generateChartData = (period, date) => {
    let labels = [];
    let numDays;

    if (period === 'day') {
      labels = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    } else if (period === 'week') {
      labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    } else if (period === 'month') {
      numDays = getDaysInMonth(date.getMonth(), date.getFullYear());
      labels = Array.from({ length: numDays }, (_, i) => `Day ${i + 1}`);
    } else if (period === 'year') {
      labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }

    return {
      labels,
      revenue: Array.from({ length: labels.length }, () => Math.floor(Math.random() * 10000)),
      orders: Array.from({ length: labels.length }, () => Math.floor(Math.random() * 100)),
    };
  };

  const fetchOrdersData = async (period, dateRange) => {
    let allOrders = [];
    let allRevenues = 0;

    try {
      const response = await axios.get(`http://localhost:5000/api/orders?period=${period}&from=${dateRange.from}&to=${dateRange.to}`);
      const orders = response.data;

      allOrders = allOrders.concat(orders);
      allRevenues = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    } catch (error) {
      console.error('Error fetching order data:', error);
    }

    return { orders: allOrders, revenue: allRevenues };
  };

  const fetchDataForPeriod = async (period, dateRange) => {
    try {
      const { orders, revenue } = await fetchOrdersData(period, dateRange);
      const menuItemsResponse = await axios.get('http://localhost:5000/api/menuitems');
      const menuItems = menuItemsResponse.data;

      const totalOrders = orders.length;
      const totalRevenue = revenue;

      const itemFrequency = orders
        .flatMap(order => order.orderedItems)
        .reduce((acc, item) => {
          acc[item.itemId] = (acc[item.itemId] || 0) + item.quantity;
          return acc;
        }, {});

      const mostOrderedItemId = Object.keys(itemFrequency).reduce((a, b) =>
        itemFrequency[a] > itemFrequency[b] ? a : b, null);
      const mostOrderedMenuItem = menuItems.find(menu => menu._id === mostOrderedItemId)?.name || 'N/A';

      const takeawayOrders = orders.filter(order => order.type === 'Takeaway').length;

      const chartData = generateChartData(period, new Date(dateRange.from));

      setChartData((prevData) => ({
        ...prevData,
        [period]: chartData,
      }));

      setRevenueData((prevData) => ({
        ...prevData,
        [period]: [
          { title: 'Total Orders', value: totalOrders, icon: '📦' },
          { title: 'Total Revenue', value: `$${totalRevenue.toFixed(2)}`, icon: '💰' },
          { title: 'Most Ordered Item', value: mostOrderedMenuItem, icon: '🍽️' },
          { title: 'Takeaway Orders', value: takeawayOrders, icon: '🚶' },
        ],
      }));
    } catch (error) {
      console.error(`Error fetching ${period} data:`, error);
    }
  };

  const handlePeriodChange = (event) => {
    const selected = event.target.value;
    setSelectedPeriod(selected);
    if (selected === 'day') {
      fetchDataForPeriod(selected, { from: selectedDate.toISOString().split('T')[0], to: selectedDate.toISOString().split('T')[0] });
    } else {
      fetchDataForPeriod(selected, dateRange);
    }
  };

  const handleDateChange = (event) => {
    const date = new Date(event.target.value);
    setSelectedDate(date);
    if (selectedPeriod === 'day') {
      fetchDataForPeriod('day', { from: date.toISOString().split('T')[0], to: date.toISOString().split('T')[0] });
    }
  };

  const handleDateRangeChange = (field, event) => {
    const newRange = { ...dateRange, [field]: event.target.value };
    setDateRange(newRange);
    if (newRange.from && newRange.to) {
      fetchDataForPeriod(selectedPeriod, newRange);
    }
  };

  useEffect(() => {
    if (selectedPeriod === 'day') {
      fetchDataForPeriod(selectedPeriod, { from: selectedDate.toISOString().split('T')[0], to: selectedDate.toISOString().split('T')[0] });
    } else {
      fetchDataForPeriod(selectedPeriod, dateRange);
    }
  }, [selectedPeriod, selectedDate, dateRange]);

  const printReport = () => {
    const input = reportRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save('Revenue_Report.pdf');
    });
  };

  const renderChart = (period) => {
    if (!chartData[period]) return null;

    const data = {
      labels: chartData[period].labels,
      datasets: [
        {
          label: 'Revenue',
          data: chartData[period].revenue,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          yAxisID: 'revenue',
        },
        {
          label: 'Orders',
          data: chartData[period].orders,
          borderColor: 'rgba(153, 102, 255, 1)',
          backgroundColor: 'rgba(153, 102, 255, 0.2)',
          yAxisID: 'orders',
        },
      ],
    };

    const options = {
      responsive: true,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        revenue: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Revenue ($)',
          },
        },
        orders: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Number of Orders',
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };

    return (
      <div className="chart-container">
        <Line data={data} options={options} />
      </div>
    );
  };

  const formatOverviewTitle = (period) => {
    switch (period) {
      case 'day':
        return 'Day Overview';
      case 'week':
        return 'Week Overview';
      case 'month':
        return 'Month Overview';
      case 'year':
        return 'Year Overview';
      default:
        return 'Overview';
    }
  };

  return (
    <div className="revenue-container" ref={reportRef}>
      <div className="revenue-header">
        <h1 className="revenue-title">Revenue Overview</h1>
        <div className="revenue-subtitle">Real-time analytics dashboard</div>
      </div>

      <div className="overall-section">
        <h2 className="section-title">Overall Performance</h2>
        <div className="revenue-cards">
          {revenueData.overall.map((item, index) => (
            <div key={index} className="revenue-card">
              <div className="card-icon">{item.icon}</div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-value">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="period-section">
        <h2 className="section-title">{formatOverviewTitle(selectedPeriod)}</h2>
        <div className="filter-section">
          <label htmlFor="period-select">Select Period: </label>
          <select id="period-select" value={selectedPeriod} onChange={handlePeriodChange}>
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </select>
          {selectedPeriod === 'day' ? (
            <>
              <label htmlFor="date-select" style={{ marginLeft: '20px' }}>Select Date: </label>
              <input type="date" id="date-select" onChange={handleDateChange} />
            </>
          ) : (
            <>
              <label htmlFor="from-date" style={{ marginLeft: '20px' }}>From: </label>
              <input type="date" id="from-date" onChange={(e) => handleDateRangeChange('from', e)} />
              <label htmlFor="to-date" style={{ marginLeft: '10px' }}>To: </label>
              <input type="date" id="to-date" onChange={(e) => handleDateRangeChange('to', e)} />
            </>
          )}
        </div>
        <button className="print-button" onClick={printReport}>Print Report</button>
        <div className="revenue-cards">
          {revenueData[selectedPeriod].map((item, index) => (
            <div key={index} className="revenue-card">
              <div className="card-icon">{item.icon}</div>
              <h3 className="card-title">{item.title}</h3>
              <p className="card-value">{item.value}</p>
            </div>
          ))}
        </div>
        {renderChart(selectedPeriod)}
      </div>
    </div>
  );
};

export default Revenue;
