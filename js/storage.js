class StorageManager {
    constructor() {
        this.USER_KEY = 'cafe_users';
        this.CURRENT_USER_KEY = 'current_user';
        this.CART_KEY = 'cart_items';
        this.ORDERS_KEY = 'user_orders';
        this.ADDRESSES_KEY = 'user_addresses';
    }

    // User Management
    saveUser(userData) {
        const users = this.getUsers();
        users.push(userData);
        localStorage.setItem(this.USER_KEY, JSON.stringify(users));
        return userData;
    }

    getUsers() {
        const users = localStorage.getItem(this.USER_KEY);
        return users ? JSON.parse(users) : [];
    }

    getUserByEmail(email) {
        const users = this.getUsers();
        return users.find(user => user.email === email);
    }

    setCurrentUser(user) {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
    }

    getCurrentUser() {
        const user = localStorage.getItem(this.CURRENT_USER_KEY);
        return user ? JSON.parse(user) : null;
    }

    logout() {
        localStorage.removeItem(this.CURRENT_USER_KEY);
    }

    // Cart Management
    addToCart(item) {
        const cart = this.getCart();
        const existingItem = cart.find(cartItem => cartItem.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += item.quantity || 1;
        } else {
            cart.push({ ...item, quantity: item.quantity || 1 });
        }
        
        this.saveCart(cart);
        return cart;
    }

    getCart() {
        const cart = localStorage.getItem(this.CART_KEY);
        return cart ? JSON.parse(cart) : [];
    }

    updateCartItem(itemId, quantity) {
        const cart = this.getCart();
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            if (quantity <= 0) {
                cart.splice(itemIndex, 1);
            } else {
                cart[itemIndex].quantity = quantity;
            }
            this.saveCart(cart);
        }
        return cart;
    }

    removeFromCart(itemId) {
        const cart = this.getCart();
        const updatedCart = cart.filter(item => item.id !== itemId);
        this.saveCart(updatedCart);
        return updatedCart;
    }

    clearCart() {
        localStorage.removeItem(this.CART_KEY);
        return [];
    }

    saveCart(cart) {
        localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    }

    getCartTotal() {
        const cart = this.getCart();
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // Order Management
    saveOrder(orderData) {
        const orders = this.getOrders();
        const order = {
            ...orderData,
            id: Date.now().toString(),
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        orders.push(order);
        localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
        
        // Clear cart after order
        this.clearCart();
        
        return order;
    }

    getOrders() {
        const orders = localStorage.getItem(this.ORDERS_KEY);
        return orders ? JSON.parse(orders) : [];
    }

    getUserOrders(userId) {
        const orders = this.getOrders();
        return orders.filter(order => order.userId === userId);
    }

    updateOrderStatus(orderId, status) {
        const orders = this.getOrders();
        const orderIndex = orders.findIndex(order => order.id === orderId);
        
        if (orderIndex !== -1) {
            orders[orderIndex].status = status;
            localStorage.setItem(this.ORDERS_KEY, JSON.stringify(orders));
        }
        return orders[orderIndex];
    }

    // Address Management
    saveAddress(addressData) {
        const addresses = this.getAddresses();
        const address = {
            ...addressData,
            id: Date.now().toString(),
            isDefault: addresses.length === 0
        };
        
        addresses.push(address);
        localStorage.setItem(this.ADDRESSES_KEY, JSON.stringify(addresses));
        return address;
    }

    getAddresses() {
        const addresses = localStorage.getItem(this.ADDRESSES_KEY);
        return addresses ? JSON.parse(addresses) : [];
    }

    setDefaultAddress(addressId) {
        const addresses = this.getAddresses();
        addresses.forEach(address => {
            address.isDefault = address.id === addressId;
        });
        localStorage.setItem(this.ADDRESSES_KEY, JSON.stringify(addresses));
        return addresses;
    }

    deleteAddress(addressId) {
        const addresses = this.getAddresses();
        const updatedAddresses = addresses.filter(address => address.id !== addressId);
        localStorage.setItem(this.ADDRESSES_KEY, JSON.stringify(updatedAddresses));
        return updatedAddresses;
    }

    // Utility Methods
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        const hasMinLength = password.length >= 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        return hasMinLength && hasUpperCase && hasNumber;
    }

    formatPrice(price) {
        return `Rs.${price.toFixed(2)}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // Check if user is logged in
    isLoggedIn() {
        return this.getCurrentUser() !== null;
    }

    // Get user's default address
    getDefaultAddress() {
        const addresses = this.getAddresses();
        return addresses.find(address => address.isDefault) || addresses[0];
    }

    // Get order statistics
    getOrderStats() {
        const orders = this.getOrders();
        const currentUser = this.getCurrentUser();
        const userOrders = currentUser ? orders.filter(order => order.userId === currentUser.id) : [];
        
        return {
            totalOrders: userOrders.length,
            pendingOrders: userOrders.filter(order => order.status === 'pending').length,
            completedOrders: userOrders.filter(order => order.status === 'completed').length,
            totalSpent: userOrders.reduce((total, order) => total + order.total, 0)
        };
    }
}

// Create global instance
const storage = new StorageManager();