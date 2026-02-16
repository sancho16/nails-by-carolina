// Admin Dashboard with Analytics

let trendChart = null;
let servicesChart = null;

// Theme Toggle
const themeToggleAdmin = document.getElementById('themeToggleAdmin');
if (themeToggleAdmin) {
    themeToggleAdmin.addEventListener('click', () => {
        const htmlElement = document.documentElement;
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        if (newTheme === 'light') {
            htmlElement.setAttribute('data-theme', 'light');
        } else {
            htmlElement.removeAttribute('data-theme');
        }
        
        localStorage.setItem('theme', newTheme);
        
        // Haptic feedback
        if ('vibrate' in navigator) {
            navigator.vibrate(10);
        }
        
        // Reload charts with new theme
        if (trendChart) {
            updateChartTheme(trendChart);
        }
        if (servicesChart) {
            updateChartTheme(servicesChart);
        }
    });
}

function updateChartTheme(chart) {
    const isDark = !document.documentElement.hasAttribute('data-theme');
    const textColor = isDark ? '#ffffff' : '#0a0a0a';
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    chart.options.scales.x.ticks.color = textColor;
    chart.options.scales.y.ticks.color = textColor;
    chart.options.scales.x.grid.color = gridColor;
    chart.options.scales.y.grid.color = gridColor;
    chart.options.plugins.legend.labels.color = textColor;
    chart.update();
}

// Logout functionality
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        sessionStorage.removeItem('adminAuthenticated');
        sessionStorage.removeItem('adminLoginTime');
        window.location.href = 'admin-login.html';
    }
});

// Load dashboard data
async function loadDashboard() {
    try {
        await bookingDB.init();
        
        // Load stats
        await loadStats();
        
        // Load charts
        await loadCharts();
        
        // Load appointments
        await loadAppointments();
        
        // Load clients
        await loadClients();
        
        console.log('✅ Dashboard loaded successfully');
    } catch (error) {
        console.error('❌ Error loading dashboard:', error);
    }
}

// Load statistics
async function loadStats() {
    const bookings = await bookingDB.getAllBookings();
    const clients = await bookingDB.getAllClients();
    const revenue = await bookingDB.getRevenueAnalytics();
    
    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter(b => b.date === today);
    
    // Today's appointments
    document.getElementById('todayCount').textContent = todayBookings.length;
    document.getElementById('todayChange').textContent = `${todayBookings.filter(b => b.status === 'confirmed').length} confirmed`;
    document.getElementById('todayChange').className = 'stat-change positive';
    
    // Today's revenue
    document.getElementById('todayRevenue').textContent = `$${revenue.today.toFixed(0)}`;
    const avgRevenue = revenue.average;
    const revenuePercent = avgRevenue > 0 ? ((revenue.today - avgRevenue) / avgRevenue * 100).toFixed(0) : 0;
    document.getElementById('revenueChange').textContent = `${revenuePercent > 0 ? '+' : ''}${revenuePercent}% from average`;
    document.getElementById('revenueChange').className = `stat-change ${revenuePercent >= 0 ? 'positive' : ''}`;
    
    // Total clients
    document.getElementById('totalClients').textContent = clients.length;
    const thisMonth = new Date().toISOString().substring(0, 7);
    const newClientsThisMonth = clients.filter(c => c.lastVisit?.startsWith(thisMonth)).length;
    document.getElementById('clientsChange').textContent = `+${newClientsThisMonth} this month`;
    document.getElementById('clientsChange').className = 'stat-change positive';
    
    // Month revenue
    document.getElementById('monthRevenue').textContent = `$${revenue.month.toFixed(0)}`;
    const monthBookings = bookings.filter(b => b.date.startsWith(thisMonth)).length;
    document.getElementById('monthChange').textContent = `${monthBookings} bookings`;
    document.getElementById('monthChange').className = 'stat-change';
}

// Load charts
async function loadCharts() {
    // Booking trends chart
    const trends = await bookingDB.getBookingTrends();
    const trendLabels = Object.keys(trends).map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    const trendData = Object.values(trends);
    
    const trendCtx = document.getElementById('trendChart');
    if (trendChart) trendChart.destroy();
    
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: trendLabels,
            datasets: [{
                label: 'Bookings',
                data: trendData,
                borderColor: '#d4af37',
                backgroundColor: 'rgba(212, 175, 55, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
    
    // Services distribution chart
    const services = await bookingDB.getServiceAnalytics();
    const serviceLabels = Object.keys(services).map(key => {
        return key.charAt(0).toUpperCase() + key.slice(1);
    });
    const serviceCounts = Object.values(services).map(s => s.count);
    
    const servicesCtx = document.getElementById('servicesChart');
    if (servicesChart) servicesChart.destroy();
    
    servicesChart = new Chart(servicesCtx, {
        type: 'doughnut',
        data: {
            labels: serviceLabels,
            datasets: [{
                data: serviceCounts,
                backgroundColor: [
                    '#667eea',
                    '#f093fb',
                    '#4facfe',
                    '#43e97b',
                    '#f4d03f'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Load appointments
async function loadAppointments(filter = 'all') {
    const container = document.getElementById('appointmentsList');
    let bookings = await bookingDB.getAllBookings();
    
    // Sort by date and time
    bookings.sort((a, b) => {
        if (a.date === b.date) {
            return a.time.localeCompare(b.time);
        }
        return a.date.localeCompare(b.date);
    });
    
    // Apply filter
    const today = new Date().toISOString().split('T')[0];
    if (filter === 'today') {
        bookings = bookings.filter(b => b.date === today);
    } else if (filter === 'week') {
        const weekFromNow = new Date();
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const weekDate = weekFromNow.toISOString().split('T')[0];
        bookings = bookings.filter(b => b.date >= today && b.date <= weekDate);
    }
    
    if (bookings.length === 0) {
        container.innerHTML = '<div class="empty-state">No appointments found</div>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="appointment-item" data-id="${booking.id}">
            <div class="appointment-time">
                <div class="time">${booking.time}</div>
                <div class="duration">${booking.date}</div>
            </div>
            <div class="appointment-details">
                <h4>${booking.name}</h4>
                <p>${booking.service} - $${booking.price}</p>
                <p class="contact-info">${booking.phone} • ${booking.email}</p>
            </div>
            <div class="appointment-status ${booking.status}">
                ${booking.status}
            </div>
            <div class="appointment-actions">
                <button class="btn-action" onclick="updateStatus(${booking.id}, 'completed')">✓</button>
                <button class="btn-action danger" onclick="cancelBooking(${booking.id})">✕</button>
            </div>
        </div>
    `).join('');
}

// Load clients
async function loadClients() {
    const container = document.getElementById('clientsList');
    const clients = await bookingDB.getAllClients();
    
    // Sort by total bookings
    clients.sort((a, b) => (b.totalBookings || 0) - (a.totalBookings || 0));
    
    if (clients.length === 0) {
        container.innerHTML = '<div class="empty-state">No clients yet</div>';
        return;
    }
    
    container.innerHTML = clients.slice(0, 10).map(client => `
        <div class="client-item">
            <div class="client-avatar">${client.name.charAt(0).toUpperCase()}</div>
            <div class="client-info">
                <h4>${client.name}</h4>
                <p>${client.email}</p>
                <p class="client-phone">${client.phone}</p>
            </div>
            <div class="client-stats">
                <div class="stat">
                    <span class="stat-label">Bookings</span>
                    <span class="stat-value">${client.totalBookings || 0}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Spent</span>
                    <span class="stat-value">$${(client.totalSpent || 0).toFixed(0)}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// Update booking status
async function updateStatus(id, status) {
    try {
        await bookingDB.updateBookingStatus(id, status);
        await loadAppointments();
        await loadStats();
        console.log(`✅ Booking ${id} updated to ${status}`);
    } catch (error) {
        console.error('❌ Error updating booking:', error);
        alert('Error updating booking status');
    }
}

// Cancel booking
async function cancelBooking(id) {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
        await bookingDB.deleteBooking(id);
        await loadAppointments();
        await loadStats();
        console.log(`✅ Booking ${id} cancelled`);
    } catch (error) {
        console.error('❌ Error cancelling booking:', error);
        alert('Error cancelling booking');
    }
}

// Export data
document.getElementById('exportData')?.addEventListener('click', async () => {
    try {
        const data = await bookingDB.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `nails-by-carolina-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        console.log('✅ Data exported successfully');
    } catch (error) {
        console.error('❌ Error exporting data:', error);
        alert('Error exporting data');
    }
});

// Filter buttons
document.getElementById('filterToday')?.addEventListener('click', function() {
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    loadAppointments('today');
});

document.getElementById('filterWeek')?.addEventListener('click', function() {
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    loadAppointments('week');
});

document.getElementById('filterAll')?.addEventListener('click', function() {
    document.querySelectorAll('.btn-filter').forEach(btn => btn.classList.remove('active'));
    this.classList.add('active');
    loadAppointments('all');
});

// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        const page = item.dataset.page;
        const titles = {
            dashboard: 'Dashboard',
            appointments: 'Appointments',
            clients: 'Clients',
            calendar: 'Calendar',
            services: 'Services',
            settings: 'Settings'
        };
        
        document.getElementById('pageTitle').textContent = titles[page];
        
        if (window.innerWidth <= 1024) {
            document.querySelector('.sidebar').classList.remove('mobile-open');
        }
    });
});

// Mobile menu toggle
const createMobileToggle = () => {
    if (document.querySelector('.mobile-menu-toggle')) return;
    
    const toggle = document.createElement('button');
    toggle.className = 'mobile-menu-toggle';
    toggle.innerHTML = '☰';
    toggle.addEventListener('click', () => {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('mobile-open');
        toggle.innerHTML = sidebar.classList.contains('mobile-open') ? '✕' : '☰';
    });
    
    document.body.appendChild(toggle);
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    createMobileToggle();
    
    // Refresh data every 30 seconds
    setInterval(() => {
        loadStats();
        loadAppointments();
    }, 30000);
});

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        if (window.innerWidth > 1024) {
            document.querySelector('.sidebar').classList.remove('mobile-open');
            const toggle = document.querySelector('.mobile-menu-toggle');
            if (toggle) toggle.innerHTML = '☰';
        }
    }, 250);
});

// Make functions global for onclick handlers
window.updateStatus = updateStatus;
window.cancelBooking = cancelBooking;
