// IndexedDB Database Manager for Nails by Carolina
class BookingDatabase {
    constructor() {
        this.dbName = 'NailsByCarolinaDB';
        this.version = 1;
        this.db = null;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Bookings store
                if (!db.objectStoreNames.contains('bookings')) {
                    const bookingStore = db.createObjectStore('bookings', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    bookingStore.createIndex('date', 'date', { unique: false });
                    bookingStore.createIndex('time', 'time', { unique: false });
                    bookingStore.createIndex('service', 'service', { unique: false });
                    bookingStore.createIndex('status', 'status', { unique: false });
                    bookingStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                // Clients store
                if (!db.objectStoreNames.contains('clients')) {
                    const clientStore = db.createObjectStore('clients', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    clientStore.createIndex('email', 'email', { unique: true });
                    clientStore.createIndex('phone', 'phone', { unique: false });
                    clientStore.createIndex('name', 'name', { unique: false });
                }

                // Analytics store
                if (!db.objectStoreNames.contains('analytics')) {
                    const analyticsStore = db.createObjectStore('analytics', { 
                        keyPath: 'id', 
                        autoIncrement: true 
                    });
                    analyticsStore.createIndex('date', 'date', { unique: false });
                    analyticsStore.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    // Add booking
    async addBooking(booking) {
        const transaction = this.db.transaction(['bookings', 'clients'], 'readwrite');
        const bookingStore = transaction.objectStore('bookings');
        const clientStore = transaction.objectStore('clients');

        // Add booking
        const bookingData = {
            ...booking,
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            id: undefined
        };

        const bookingRequest = bookingStore.add(bookingData);

        // Add or update client
        const clientData = {
            name: booking.name,
            email: booking.email,
            phone: booking.phone,
            lastVisit: booking.date,
            totalBookings: 1,
            totalSpent: parseFloat(booking.price) || 0
        };

        // Check if client exists
        const emailIndex = clientStore.index('email');
        const existingClient = await this.getByIndex('clients', 'email', booking.email);

        if (existingClient) {
            clientData.id = existingClient.id;
            clientData.totalBookings = (existingClient.totalBookings || 0) + 1;
            clientData.totalSpent = (existingClient.totalSpent || 0) + (parseFloat(booking.price) || 0);
            clientStore.put(clientData);
        } else {
            clientStore.add(clientData);
        }

        // Log analytics
        await this.logAnalytics('booking_created', {
            service: booking.service,
            price: booking.price,
            date: booking.date
        });

        return new Promise((resolve, reject) => {
            bookingRequest.onsuccess = () => resolve(bookingRequest.result);
            bookingRequest.onerror = () => reject(bookingRequest.error);
        });
    }

    // Get all bookings
    async getAllBookings() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bookings'], 'readonly');
            const store = transaction.objectStore('bookings');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get bookings by date
    async getBookingsByDate(date) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bookings'], 'readonly');
            const store = transaction.objectStore('bookings');
            const index = store.index('date');
            const request = index.getAll(date);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get booking by ID
    async getBooking(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bookings'], 'readonly');
            const store = transaction.objectStore('bookings');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Update booking status
    async updateBookingStatus(id, status) {
        const booking = await this.getBooking(id);
        if (!booking) return false;

        booking.status = status;

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bookings'], 'readwrite');
            const store = transaction.objectStore('bookings');
            const request = store.put(booking);

            request.onsuccess = () => {
                this.logAnalytics('booking_status_changed', { id, status });
                resolve(true);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Delete booking
    async deleteBooking(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['bookings'], 'readwrite');
            const store = transaction.objectStore('bookings');
            const request = store.delete(id);

            request.onsuccess = () => {
                this.logAnalytics('booking_deleted', { id });
                resolve(true);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Get all clients
    async getAllClients() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['clients'], 'readonly');
            const store = transaction.objectStore('clients');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get client by email
    async getByIndex(storeName, indexName, value) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const index = store.index(indexName);
            const request = index.get(value);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Log analytics event
    async logAnalytics(type, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['analytics'], 'readwrite');
            const store = transaction.objectStore('analytics');
            
            const analyticsData = {
                type,
                data,
                date: new Date().toISOString().split('T')[0],
                timestamp: new Date().toISOString()
            };

            const request = store.add(analyticsData);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get analytics data
    async getAnalytics(startDate, endDate) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['analytics'], 'readonly');
            const store = transaction.objectStore('analytics');
            const request = store.getAll();

            request.onsuccess = () => {
                let results = request.result;
                
                if (startDate && endDate) {
                    results = results.filter(item => {
                        return item.date >= startDate && item.date <= endDate;
                    });
                }
                
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    // Get revenue analytics
    async getRevenueAnalytics() {
        const bookings = await this.getAllBookings();
        
        const today = new Date().toISOString().split('T')[0];
        const thisMonth = new Date().toISOString().substring(0, 7);
        
        const todayRevenue = bookings
            .filter(b => b.date === today && b.status === 'confirmed')
            .reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);
        
        const monthRevenue = bookings
            .filter(b => b.date.startsWith(thisMonth) && b.status === 'confirmed')
            .reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);
        
        const totalRevenue = bookings
            .filter(b => b.status === 'confirmed')
            .reduce((sum, b) => sum + (parseFloat(b.price) || 0), 0);

        return {
            today: todayRevenue,
            month: monthRevenue,
            total: totalRevenue,
            average: bookings.length > 0 ? totalRevenue / bookings.length : 0
        };
    }

    // Get service analytics
    async getServiceAnalytics() {
        const bookings = await this.getAllBookings();
        const services = {};

        bookings.forEach(booking => {
            if (!services[booking.service]) {
                services[booking.service] = {
                    count: 0,
                    revenue: 0
                };
            }
            services[booking.service].count++;
            services[booking.service].revenue += parseFloat(booking.price) || 0;
        });

        return services;
    }

    // Get booking trends (last 30 days)
    async getBookingTrends() {
        const bookings = await this.getAllBookings();
        const trends = {};
        
        const today = new Date();
        for (let i = 29; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            trends[dateStr] = 0;
        }

        bookings.forEach(booking => {
            if (trends.hasOwnProperty(booking.date)) {
                trends[booking.date]++;
            }
        });

        return trends;
    }

    // Export data as JSON
    async exportData() {
        const bookings = await this.getAllBookings();
        const clients = await this.getAllClients();
        const analytics = await this.getAnalytics();

        return {
            bookings,
            clients,
            analytics,
            exportDate: new Date().toISOString()
        };
    }

    // Clear all data (for testing)
    async clearAllData() {
        const stores = ['bookings', 'clients', 'analytics'];
        const transaction = this.db.transaction(stores, 'readwrite');

        stores.forEach(storeName => {
            transaction.objectStore(storeName).clear();
        });

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => resolve(true);
            transaction.onerror = () => reject(transaction.error);
        });
    }
}

// Create global database instance
const bookingDB = new BookingDatabase();

// Initialize on load
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        try {
            await bookingDB.init();
            console.log('✅ Database initialized successfully');
        } catch (error) {
            console.error('❌ Database initialization failed:', error);
        }
    });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BookingDatabase, bookingDB };
}
