// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initForms();
    initCart();
    initMenuItems();
    initAddresses();
    initDashboard();
    
    // Check authentication status
    checkAuthStatus();
    
    // Add event listeners
    addEventListeners();
});

// Navigation initialization
function initNavigation() {
    const currentUser = storage.getCurrentUser();
    const userIcon = document.querySelector('.user-icon');
    
    if (userIcon) {
        if (currentUser) {
            // Show user's first initial
            const initial = currentUser.fullname.charAt(0).toUpperCase();
            userIcon.innerHTML = `<span style="color: var(--coffee-medium); font-weight: bold;">${initial}</span>`;
            userIcon.title = currentUser.fullname;
            
            // Add logout option
            userIcon.addEventListener('click', function(e) {
                if (e.target.closest('.user-icon')) {
                    showUserMenu(e);
                }
            });
        } else {
            userIcon.addEventListener('click', function() {
                window.location.href = 'login.html';
            });
        }
    }
    
    // Update cart count in navigation
    updateCartCount();
}

// Show user menu dropdown
function showUserMenu(event) {
    const menu = document.createElement('div');
    menu.className = 'user-menu';
    menu.style.cssText = `
        position: absolute;
        top: 60px;
        right: 20px;
        background: white;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        padding: 1rem;
        min-width: 200px;
        z-index: 1000;
    `;
    
    const currentUser = storage.getCurrentUser();
    
    menu.innerHTML = `
        <div style="padding: 0.5rem; border-bottom: 1px solid var(--cream);">
            <strong>${currentUser.fullname}</strong>
            <div style="font-size: 0.9rem; color: var(--coffee-medium);">${currentUser.email}</div>
        </div>
        <a href="dashboard.html" style="display: block; padding: 0.5rem; text-decoration: none; color: var(--coffee-dark);">
            📊 Dashboard
        </a>
        <a href="order.html" style="display: block; padding: 0.5rem; text-decoration: none; color: var(--coffee-dark);">
            🛒 My Orders
        </a>
        <button onclick="logout()" style="display: block; width: 100%; padding: 0.5rem; background: none; border: none; text-align: left; color: var(--accent-warm); cursor: pointer;">
            🚪 Logout
        </button>
    `;
    
    document.body.appendChild(menu);
    
    // Close menu when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closeMenu(e) {
            if (!menu.contains(e.target) && !event.target.closest('.user-icon')) {
                menu.remove();
                document.removeEventListener('click', closeMenu);
            }
        });
    }, 100);
}

// Update cart count in navigation
function updateCartCount() {
    const cart = storage.getCart();
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // Find or create cart count element
    let cartCountElement = document.querySelector('.cart-count');
    const orderBtn = document.querySelector('.btn-order');
    
    if (orderBtn && cartCount > 0) {
        if (!cartCountElement) {
            cartCountElement = document.createElement('span');
            cartCountElement.className = 'cart-count';
            cartCountElement.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: var(--accent-warm);
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 0.8rem;
                display: flex;
                align-items: center;
                justify-content: center;
            `;
            orderBtn.style.position = 'relative';
            orderBtn.appendChild(cartCountElement);
        }
        cartCountElement.textContent = cartCount;
    } else if (cartCountElement) {
        cartCountElement.remove();
    }
}

// Initialize forms
function initForms() {
    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const userData = {
                fullname: document.getElementById('fullname').value,
                email: document.getElementById('email').value,
                password: document.getElementById('password').value
            };
            
            if (auth.signup(userData)) {
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (auth.login(email, password)) {
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            }
        });
    }
    
    // Forgot password form
    const forgotForm = document.getElementById('forgotForm');
    if (forgotForm) {
        forgotForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            auth.resetPassword(email);
        });
    }
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                reason: document.querySelector('.reason-btn.active')?.dataset.reason || 'enquiry',
                message: document.getElementById('message').value,
                date: new Date().toISOString()
            };
            
            // Save to localStorage
            const contacts = JSON.parse(localStorage.getItem('contact_messages') || '[]');
            contacts.push(formData);
            localStorage.setItem('contact_messages', JSON.stringify(contacts));
            
            storage.showToast('Message sent successfully!', 'success');
            contactForm.reset();
            
            // Reset reason buttons
            const reasonButtons = document.querySelectorAll('.reason-btn');
            if (reasonButtons.length > 0) {
                reasonButtons[0].classList.add('active');
            }
        });
        
        // Reason button functionality
        const reasonButtons = document.querySelectorAll('.reason-btn');
        reasonButtons.forEach(button => {
            button.addEventListener('click', function() {
                reasonButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        });
    }
    
    // Address form
    const addressForm = document.getElementById('addressForm');
    if (addressForm) {
        addressForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const addressData = {
                street: document.getElementById('street').value,
                city: document.getElementById('city').value,
                state: document.getElementById('state').value,
                zip: document.getElementById('zip').value,
                type: document.querySelector('.address-type.active')?.dataset.type || 'home',
                isDefault: document.getElementById('defaultAddress')?.checked || false
            };
            
            const address = storage.saveAddress(addressData);
            storage.showToast('Address saved successfully!', 'success');
            
            // If this is during checkout, proceed to payment
            if (window.location.pathname.includes('delivery-address.html')) {
                setTimeout(() => {
                    window.location.href = 'payment.html';
                }, 1500);
            }
        });
    }
    
    // Payment form
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentUser = storage.getCurrentUser();
            const cart = storage.getCart();
            const total = storage.getCartTotal();
            
            if (cart.length === 0) {
                storage.showToast('Your cart is empty!', 'error');
                return;
            }
            
            const orderData = {
                userId: currentUser?.id || 'guest',
                items: cart,
                total: total,
                paymentMethod: document.getElementById('cardNumber').value.includes('@') ? 'esewa' : 'card',
                billingAddress: document.getElementById('billing').value,
                deliveryAddress: storage.getDefaultAddress()
            };
            
            const order = storage.saveOrder(orderData);
            storage.showToast('Order placed successfully!', 'success');
            
            setTimeout(() => {
                window.location.href = 'thank-you.html?id=' + order.id;
            }, 1500);
        });
    }
}

// Initialize cart functionality
function initCart() {
    // Add to cart buttons
    document.querySelectorAll('.btn-add-cart').forEach(button => {
        button.addEventListener('click', function() {
            const productCard = this.closest('.menu-item, .drink-card, .menu-card');
            const productId = this.dataset.id || Date.now().toString();
            const productName = productCard.querySelector('h3').textContent;
            const productPrice = parseFloat(productCard.querySelector('.price').textContent.replace('Rs.', ''));
            
            const item = {
                id: productId,
                name: productName,
                price: productPrice,
                quantity: 1
            };
            
            storage.addToCart(item);
            updateCartCount();
            storage.showToast(`${productName} added to cart!`, 'success');
        });
    });
    
    // Order now buttons
    document.querySelectorAll('.btn-order-now').forEach(button => {
        button.addEventListener('click', function(e) {
            if (!auth.isAuthenticated()) {
                e.preventDefault();
                storage.showToast('Please login to place an order', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
                }, 1500);
                return false;
            }
        });
    });
}

// Initialize menu items
function initMenuItems() {
    // Menu data
    const menuItems = {
        espressos: [
            { id: 1, name: 'Espresso', price: 300, description: 'Rich and bold espresso shot', badge: 'Bold', image: 'espresso.jpg' },
            { id: 2, name: 'Double Espresso', price: 350, description: 'Double shot of rich espresso', badge: 'Strong', image: 'double-espresso.jpg' },
            { id: 3, name: 'Lungo', price: 320, description: 'Long pulled espresso with more water', badge: 'Smooth', image: 'lungo.jpg' }
        ],
        lattes: [
            { id: 4, name: 'Vanilla Latte', price: 350, description: 'Smooth latte with vanilla flavor', badge: 'Popular', image: 'vanilla-latte.jpg' },
            { id: 5, name: 'Caramel Latte', price: 380, description: 'Creamy latte with caramel drizzle', badge: 'Sweet', image: 'caramel-latte.jpg' }
        ],
        pastries: [
            { id: 6, name: 'Croissant', price: 200, description: 'Fresh butter croissant', badge: 'Fresh', image: 'croissant.jpg' },
            { id: 7, name: 'Chocolate Muffin', price: 180, description: 'Rich chocolate muffin', badge: 'Chocolate', image: 'muffin.jpg' }
        ]
    };
    
    // Render menu if menu grid exists
    const menuGrid = document.getElementById('menuGrid');
    if (menuGrid) {
        renderMenu('espressos');
        
        // Category tabs
        document.querySelectorAll('.category-tab').forEach(tab => {
            tab.addEventListener('click', function() {
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                renderMenu(this.dataset.category);
            });
        });
    }
    
    function renderMenu(category) {
        if (!menuGrid) return;
        
        menuGrid.innerHTML = '';
        const items = menuItems[category] || [];
        
        items.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <div class="menu-item-image">
                    <div class="menu-item-badge">${item.badge}</div>
                    <img src="images/${item.image || 'coffee-default.jpg'}" alt="${item.name}" onerror="this.src='images/coffee-default.jpg'">
                </div>
                <div class="menu-item-content">
                    <div class="menu-item-header">
                        <h3>${item.name}</h3>
                        <div class="menu-item-price">Rs.${item.price}</div>
                    </div>
                    <p>${item.description}</p>
                    <div class="menu-item-actions">
                        <a href="delivery-address.html" class="btn-order-now">Order Now</a>
                        <button class="btn-add-cart" data-id="${item.id}">Add to Cart</button>
                    </div>
                </div>
            `;
            menuGrid.appendChild(menuItem);
        });
        
        // Re-initialize cart buttons for new items
        initCart();
    }
}

// Initialize addresses
function initAddresses() {
    const savedAddresses = document.querySelector('.saved-addresses');
    if (savedAddresses) {
        renderAddresses();
    }
    
    // Trace location button
    const traceBtn = document.querySelector('.trace-location-btn');
    if (traceBtn) {
        traceBtn.addEventListener('click', traceLocation);
    }
}

function renderAddresses() {
    const addresses = storage.getAddresses();
    const savedAddresses = document.querySelector('.saved-addresses');
    
    if (!savedAddresses) return;
    
    savedAddresses.innerHTML = '';
    
    if (addresses.length === 0) {
        savedAddresses.innerHTML = '<p class="no-address">No saved addresses. Add one above.</p>';
        return;
    }
    
    addresses.forEach(address => {
        const addressCard = document.createElement('div');
        addressCard.className = 'address-card';
        addressCard.innerHTML = `
            <div class="address-icon">
                <img src="images/${address.type}-icon.svg" alt="${address.type}" onerror="this.src='images/location-icon.svg'">
            </div>
            <div class="address-details">
                <h3>${address.type.charAt(0).toUpperCase() + address.type.slice(1)} ${address.isDefault ? '(Default)' : ''}</h3>
                <p>${address.street}, ${address.city}, ${address.state} ${address.zip}</p>
            </div>
        `;
        
        addressCard.addEventListener('click', () => {
            selectAddress(address.id);
        });
        
        savedAddresses.appendChild(addressCard);
    });
}

function traceLocation() {
    if (navigator.geolocation) {
        storage.showToast('Getting your location...', 'info');
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Simulate reverse geocoding
                const mockAddress = {
                    street: '123 Coffee Lane',
                    city: 'Kathmandu',
                    state: 'Bagmati',
                    zip: '44600'
                };
                
                // Auto-fill form
                document.getElementById('street').value = mockAddress.street;
                document.getElementById('city').value = mockAddress.city;
                document.getElementById('state').value = mockAddress.state;
                document.getElementById('zip').value = mockAddress.zip;
                
                storage.showToast('Location found! Form auto-filled.', 'success');
            },
            (error) => {
                storage.showToast('Unable to get location. Please enter manually.', 'error');
            }
        );
    } else {
        storage.showToast('Geolocation not supported by your browser.', 'error');
    }
}

function selectAddress(addressId) {
    storage.setDefaultAddress(addressId);
    storage.showToast('Address selected!', 'success');
    setTimeout(() => {
        window.location.href = 'payment.html';
    }, 1000);
}

// Initialize dashboard
function initDashboard() {
    const dashboardContent = document.getElementById('dashboardContent');
    if (!dashboardContent) return;
    
    const currentUser = storage.getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const stats = storage.getOrderStats();
    const orders = storage.getUserOrders(currentUser.id);
    
    // Render dashboard
    dashboardContent.innerHTML = `
        <div class="welcome-section">
            <h1>Welcome back, ${currentUser.fullname}!</h1>
            <p>Here's what's happening with your orders</p>
        </div>
        
        <div class="dashboard-stats">
            <div class="stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-content">
                    <h3>Total Orders</h3>
                    <div class="stat-value">${stats.totalOrders}</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">⏳</div>
                <div class="stat-content">
                    <h3>Pending</h3>
                    <div class="stat-value">${stats.pendingOrders}</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                    <h3>Completed</h3>
                    <div class="stat-value">${stats.completedOrders}</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-content">
                    <h3>Total Spent</h3>
                    <div class="stat-value">Rs.${stats.totalSpent}</div>
                </div>
            </div>
        </div>
        
        <div class="recent-orders">
            <h2>Recent Orders</h2>
            ${orders.length > 0 ? `
                <div class="orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Order ID</th>
                                <th>Date</th>
                                <th>Items</th>
                                <th>Total</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${orders.slice(0, 5).map(order => `
                                <tr>
                                    <td>#${order.id.slice(-6)}</td>
                                    <td>${storage.formatDate(order.date)}</td>
                                    <td>${order.items.length} items</td>
                                    <td>Rs.${order.total}</td>
                                    <td><span class="status-badge ${order.status}">${order.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : '<p class="no-orders">No orders yet. <a href="order.html">Start ordering!</a></p>'}
        </div>
        
        <div class="quick-actions">
            <h2>Quick Actions</h2>
            <div class="action-buttons">
                <a href="order.html" class="action-btn">
                    <span>☕</span>
                    Order Coffee
                </a>
                <a href="menu.html" class="action-btn">
                    <span>📋</span>
                    View Menu
                </a>
                <a href="delivery-address.html" class="action-btn">
                    <span>📍</span>
                    Manage Addresses
                </a>
                <button onclick="editProfile()" class="action-btn">
                    <span>👤</span>
                    Edit Profile
                </button>
            </div>
        </div>
    `;
    
    // Add dashboard-specific CSS
    const style = document.createElement('style');
    style.textContent = `
        .dashboard-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }
        
        .stat-card {
            background: white;
            padding: 1.5rem;
            border-radius: 15px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            display: flex;
            align-items: center;
            gap: 1rem;
        }
        
        .stat-icon {
            font-size: 2rem;
            width: 60px;
            height: 60px;
            background: var(--cream);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: bold;
            color: var(--coffee-dark);
        }
        
        .orders-table {
            overflow-x: auto;
            margin-top: 1rem;
        }
        
        .orders-table table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
        }
        
        .orders-table th,
        .orders-table td {
            padding: 1rem;
            text-align: left;
            border-bottom: 1px solid var(--cream);
        }
        
        .orders-table th {
            background: var(--cream-light);
            font-weight: 600;
            color: var(--coffee-dark);
        }
        
        .status-badge {
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
        }
        
        .status-badge.pending {
            background: #FFF3CD;
            color: #856404;
        }
        
        .status-badge.completed {
            background: #D4EDDA;
            color: #155724;
        }
        
        .quick-actions {
            margin-top: 3rem;
        }
        
        .action-buttons {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 1rem;
        }
        
        .action-btn {
            background: white;
            padding: 1.5rem;
            border-radius: 15px;
            text-decoration: none;
            color: var(--coffee-dark);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            transition: all 0.3s ease;
            border: 2px solid transparent;
        }
        
        .action-btn:hover {
            border-color: var(--accent-gold);
            transform: translateY(-2px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        
        .action-btn span {
            font-size: 2rem;
        }
        
        @media (max-width: 768px) {
            .dashboard-stats {
                grid-template-columns: 1fr;
            }
            
            .action-buttons {
                grid-template-columns: repeat(2, 1fr);
            }
        }
    `;
    document.head.appendChild(style);
}

// Add event listeners
function addEventListeners() {
    // Mobile menu toggle
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        const mobileMenu = document.querySelector('.mobile-menu');
        if (mobileMenu && !e.target.closest('.mobile-menu') && !e.target.closest('.mobile-menu-btn')) {
            mobileMenu.classList.remove('show');
        }
    });
    
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
    
    // Form validation
    document.querySelectorAll('input[required], textarea[required]').forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
    });
}

// Mobile menu toggle
function toggleMobileMenu() {
    const mobileMenu = document.querySelector('.mobile-menu');
    if (mobileMenu) {
        mobileMenu.classList.toggle('show');
    } else {
        createMobileMenu();
    }
}

function createMobileMenu() {
    const nav = document.querySelector('nav');
    const navLinks = document.querySelector('.nav-links');
    
    if (!nav || !navLinks) return;
    
    const mobileMenu = document.createElement('div');
    mobileMenu.className = 'mobile-menu';
    mobileMenu.innerHTML = navLinks.cloneNode(true).innerHTML;
    
    mobileMenu.style.cssText = `
        position: fixed;
        top: 80px;
        left: 0;
        right: 0;
        background: white;
        padding: 1rem;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        display: none;
        flex-direction: column;
        gap: 1rem;
        z-index: 999;
    `;
    
    document.body.appendChild(mobileMenu);
    mobileMenu.classList.add('show');
    
    // Animate in
    setTimeout(() => {
        mobileMenu.style.display = 'flex';
    }, 10);
}

// Field validation
function validateField(field) {
    if (field.validity.valid) {
        field.classList.remove('invalid');
        field.classList.add('valid');
    } else {
        field.classList.remove('valid');
        field.classList.add('invalid');
    }
}

// Check authentication status
function checkAuthStatus() {
    const protectedPages = ['dashboard.html', 'payment.html', 'delivery-address.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage) && !auth.isAuthenticated()) {
        storage.showToast('Please login to access this page', 'error');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.href);
        }, 1500);
    }
}

// Logout function
function logout() {
    auth.logout();
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 1000);
}

// Edit profile function
function editProfile() {
    const currentUser = storage.getCurrentUser();
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white; padding: 2rem; border-radius: 15px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <h2 style="margin-bottom: 1.5rem;">Edit Profile</h2>
            <form id="editProfileForm">
                <div class="form-group">
                    <label for="editFullname">Full Name</label>
                    <input type="text" id="editFullname" value="${currentUser.fullname}" required>
                </div>
                
                <div class="form-group">
                    <label for="editEmail">Email</label>
                    <input type="email" id="editEmail" value="${currentUser.email}" required>
                </div>
                
                <div class="form-actions">
                    <button type="button" onclick="closeModal()" class="btn-secondary">Cancel</button>
                    <button type="submit" class="btn-primary">Save Changes</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    modal.querySelector('#editProfileForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const updates = {
            fullname: document.getElementById('editFullname').value,
            email: document.getElementById('editEmail').value
        };
        
        if (auth.updateProfile(currentUser.id, updates)) {
            closeModal();
            // Reload dashboard
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    });
}

function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Add to cart from product page
function addToCartFromPage(productId, productName, productPrice) {
    const item = {
        id: productId,
        name: productName,
        price: parseFloat(productPrice),
        quantity: 1
    };
    
    storage.addToCart(item);
    updateCartCount();
    storage.showToast(`${productName} added to cart!`, 'success');
}

// Checkout function
function proceedToCheckout() {
    if (!auth.isAuthenticated()) {
        storage.showToast('Please login to checkout', 'error');
        setTimeout(() => {
            window.location.href = 'login.html?redirect=delivery-address.html';
        }, 1500);
        return;
    }
    
    const cart = storage.getCart();
    if (cart.length === 0) {
        storage.showToast('Your cart is empty!', 'error');
        return;
    }
    
    window.location.href = 'delivery-address.html';
}

// View cart function
function viewCart() {
    const cart = storage.getCart();
    
    if (cart.length === 0) {
        storage.showToast('Your cart is empty!', 'info');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    `;
    
    let cartHTML = cart.map(item => `
        <div class="cart-item" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; border-bottom: 1px solid var(--cream);">
            <div>
                <h4 style="margin: 0;">${item.name}</h4>
                <p style="margin: 0.5rem 0; color: var(--coffee-medium);">Rs.${item.price} x ${item.quantity}</p>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button onclick="updateCartQuantity('${item.id}', ${item.quantity - 1})" style="background: none; border: none; cursor: pointer; font-size: 1.2rem;">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateCartQuantity('${item.id}', ${item.quantity + 1})" style="background: none; border: none; cursor: pointer; font-size: 1.2rem;">+</button>
                <button onclick="removeFromCart('${item.id}')" style="background: none; border: none; cursor: pointer; color: var(--accent-warm); margin-left: 1rem;">✕</button>
            </div>
        </div>
    `).join('');
    
    const total = storage.getCartTotal();
    
    modal.innerHTML = `
        <div class="modal-content" style="background: white; padding: 2rem; border-radius: 15px; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <h2 style="margin-bottom: 1.5rem;">Your Cart</h2>
            <div class="cart-items" style="max-height: 300px; overflow-y: auto;">
                ${cartHTML}
            </div>
            <div style="padding: 1.5rem 0; border-top: 2px solid var(--cream);">
                <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 1.2rem;">
                    <span>Total:</span>
                    <span>Rs.${total}</span>
                </div>
            </div>
            <div class="form-actions">
                <button onclick="closeModal()" class="btn-secondary">Continue Shopping</button>
                <button onclick="proceedToCheckout()" class="btn-primary">Checkout</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function updateCartQuantity(itemId, newQuantity) {
    if (newQuantity < 1) {
        removeFromCart(itemId);
    } else {
        storage.updateCartItem(itemId, newQuantity);
        updateCartCount();
        viewCart(); // Refresh cart view
    }
}

function removeFromCart(itemId) {
    storage.removeFromCart(itemId);
    updateCartCount();
    viewCart(); // Refresh cart view
}

// Make functions globally available
window.logout = logout;
window.closeModal = closeModal;
window.editProfile = editProfile;
window.addToCartFromPage = addToCartFromPage;
window.viewCart = viewCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.proceedToCheckout = proceedToCheckout;