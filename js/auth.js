class AuthManager {
    constructor(storageManager) {
        this.storage = storageManager;
    }

    // Sign up new user
    signup(userData) {
        // Validation
        if (!userData.fullname || !userData.email || !userData.password) {
            this.storage.showToast('All fields are required', 'error');
            return false;
        }

        if (!this.storage.validateEmail(userData.email)) {
            this.storage.showToast('Please enter a valid email address', 'error');
            return false;
        }

        if (!this.storage.validatePassword(userData.password)) {
            this.storage.showToast('Password must contain at least 8 characters, one uppercase letter, and one number', 'error');
            return false;
        }

        // Check if user already exists
        if (this.storage.getUserByEmail(userData.email)) {
            this.storage.showToast('User with this email already exists', 'error');
            return false;
        }

        // Create user object
        const user = {
            id: Date.now().toString(),
            fullname: userData.fullname,
            email: userData.email,
            password: userData.password, // In real app, hash this!
            createdAt: new Date().toISOString(),
            role: 'customer'
        };

        // Save user
        this.storage.saveUser(user);
        this.storage.setCurrentUser(user);
        
        this.storage.showToast('Account created successfully!', 'success');
        return true;
    }

    // Login user
    login(email, password) {
        if (!email || !password) {
            this.storage.showToast('Email and password are required', 'error');
            return false;
        }

        const user = this.storage.getUserByEmail(email);
        
        if (!user) {
            this.storage.showToast('User not found', 'error');
            return false;
        }

        // In real app, compare hashed passwords
        if (user.password !== password) {
            this.storage.showToast('Invalid password', 'error');
            return false;
        }

        // Set current user
        this.storage.setCurrentUser(user);
        this.storage.showToast('Login successful!', 'success');
        return true;
    }

    // Logout user
    logout() {
        this.storage.logout();
        this.storage.showToast('Logged out successfully', 'info');
        return true;
    }

    // Reset password
    resetPassword(email) {
        if (!email) {
            this.storage.showToast('Email is required', 'error');
            return false;
        }

        const user = this.storage.getUserByEmail(email);
        
        if (!user) {
            this.storage.showToast('User not found', 'error');
            return false;
        }

        // In real app, send reset email
        this.storage.showToast('Password reset instructions sent to your email', 'success');
        return true;
    }

    // Update user profile
    updateProfile(userId, updates) {
        const users = this.storage.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            this.storage.showToast('User not found', 'error');
            return false;
        }

        // Update user
        users[userIndex] = { ...users[userIndex], ...updates };
        localStorage.setItem(this.storage.USER_KEY, JSON.stringify(users));

        // Update current user if it's the same user
        const currentUser = this.storage.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            this.storage.setCurrentUser(users[userIndex]);
        }

        this.storage.showToast('Profile updated successfully', 'success');
        return true;
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.storage.isLoggedIn();
    }

    // Get current user
    getCurrentUser() {
        return this.storage.getCurrentUser();
    }

    // Change password
    changePassword(userId, oldPassword, newPassword) {
        const users = this.storage.getUsers();
        const userIndex = users.findIndex(u => u.id === userId);
        
        if (userIndex === -1) {
            this.storage.showToast('User not found', 'error');
            return false;
        }

        // Verify old password
        if (users[userIndex].password !== oldPassword) {
            this.storage.showToast('Old password is incorrect', 'error');
            return false;
        }

        // Validate new password
        if (!this.storage.validatePassword(newPassword)) {
            this.storage.showToast('New password must contain at least 8 characters, one uppercase letter, and one number', 'error');
            return false;
        }

        // Update password
        users[userIndex].password = newPassword;
        localStorage.setItem(this.storage.USER_KEY, JSON.stringify(users));

        // Update current user
        const currentUser = this.storage.getCurrentUser();
        if (currentUser && currentUser.id === userId) {
            currentUser.password = newPassword;
            this.storage.setCurrentUser(currentUser);
        }

        this.storage.showToast('Password changed successfully', 'success');
        return true;
    }
}

// Create global instance
const auth = new AuthManager(storage);