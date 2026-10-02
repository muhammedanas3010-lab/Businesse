const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// In-memory data structures with priority/queue order
let orders = [
    { id: 1, customerName: 'Alice', status: 'Completed', orderAmount: 1000, ownerEarnings: 300, employeeName: 'John', employeeEarnings: 200, dateAdded: '2026-06-01' },
    { id: 2, customerName: 'Bob', status: 'Pending', orderAmount: 1200, ownerEarnings: 400, employeeName: 'Unassigned', employeeEarnings: 0, dateAdded: '2026-06-02' },
    { id: 3, customerName: 'Charlie', status: 'Pending', orderAmount: 1000, ownerEarnings: 300, employeeName: 'Unassigned', employeeEarnings: 0, dateAdded: '2026-06-03' },
    { id: 4, customerName: 'David', status: 'Pending', orderAmount: 1500, ownerEarnings: 500, employeeName: 'Unassigned', employeeEarnings: 0, dateAdded: '2026-06-04' },
    { id: 5, customerName: 'Emma', status: 'Completed', orderAmount: 1000, ownerEarnings: 300, employeeName: 'Smith', employeeEarnings: 200, dateAdded: '2026-06-05' }
];

let expenses = [
    { id: 1, title: 'Shop Rent', amount: 2000 },
    { id: 2, title: 'Electricity', amount: 500 }
];

// API to get overall summary & next delivery queue
app.get('/api/summary', (req, res) => {
    let grossProfit = 0;
    const ownerBreakdownMap = {};
    const employeeBreakdownMap = {};
    
    // Filter out pending/active orders for delivery queue
    const pendingOrders = orders.filter(o => o.status !== 'Completed');
    const nextTwoDeliveries = pendingOrders.slice(0, 2); // Get exact next 2 customers

    orders.forEach(order => {
        if (order.status === 'Completed') {
            const ownerAmt = order.ownerEarnings;
            grossProfit += ownerAmt;

            // Owner Earnings Breakdown
            if (!ownerBreakdownMap[ownerAmt]) {
                ownerBreakdownMap[ownerAmt] = { amount: ownerAmt, orderCount: 0, totalEarned: 0 };
            }
            ownerBreakdownMap[ownerAmt].orderCount += 1;
            ownerBreakdownMap[ownerAmt].totalEarned += ownerAmt;

            // Employee Performance Breakdown
            const empName = order.employeeName || 'Unassigned';
            const empAmt = order.employeeEarnings || 0;
            if (!employeeBreakdownMap[empName]) {
                employeeBreakdownMap[empName] = { employeeName: empName, completedOrders: 0, totalEarned: 0 };
            }
            employeeBreakdownMap[empName].completedOrders += 1;
            employeeBreakdownMap[empName].totalEarned += empAmt;
        }
    });

    const ownerOrderBreakdown = Object.values(ownerBreakdownMap);
    const employeePerformance = Object.values(employeeBreakdownMap);

    // Expenses & Net Profit
    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const netProfit = grossProfit - totalExpenses;

    res.json({
        grossProfit,
        totalExpenses,
        netProfit,
        pendingOrdersCount: pendingOrders.length,
        nextTwoDeliveries,
        ownerOrderBreakdown,
        employeePerformance,
        expenses,
        orders
    });
});

// API to add a new order
app.post('/api/orders', (req, res) => {
    const { customerName, status, orderAmount, ownerEarnings, employeeName, employeeEarnings } = req.body;
    const newOrder = {
        id: orders.length + 1,
        customerName,
        status: status || 'Pending',
        orderAmount: Number(orderAmount),
        ownerEarnings: Number(ownerEarnings),
        employeeName: employeeName || 'Unassigned',
        employeeEarnings: Number(employeeEarnings || 0),
        dateAdded: new Date().toISOString().split('T')[0]
    };
    orders.push(newOrder);
    res.json({ success: true, newOrder });
});

// API to add an expense
app.post('/api/expenses', (req, res) => {
    const { title, amount } = req.body;
    const newExpense = {
        id: expenses.length + 1,
        title,
        amount: Number(amount)
    };
    expenses.push(newExpense);
    res.json({ success: true, newExpense });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
