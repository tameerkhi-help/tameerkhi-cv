// app.js
// SECURE Firebase configuration with error handling
const firebaseConfig = {
    apiKey: "AIzaSyAdOwMj250weD2L_RWBpNplNF5OmM1R6j8",
    authDomain: "cv-build-tameerkhi.firebaseapp.com",
    databaseURL: "https://cv-build-tameerkhi-default-rtdb.firebaseio.com",
    projectId: "cv-build-tameerkhi",
    storageBucket: "cv-build-tameerkhi.firebasestorage.app",
    messagingSenderId: "453337479839",
    appId: "1:453337479839:web:4ef4cd57c9c409aacb80aa",
    measurementId: "G-VNGDH8HB5F"
};

// Enhanced Firebase initialization with domain checking
let auth, database, storage, analytics;
try {
    // Check if we're on the correct domain
    const currentDomain = window.location.hostname;
    const expectedDomains = ['www.tameerkhi.com', 'tameerkhi.com'];

    if (!expectedDomains.includes(currentDomain)) {
        console.warn('Unexpected domain:', currentDomain);
    }

    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
    }
    auth = firebase.auth();
    database = firebase.database();
    storage = firebase.storage();
    analytics = firebase.analytics();

    console.log("Firebase initialized successfully for domain:", currentDomain);

    // Test database connection
    database.ref('.info/connected').on('value', (snap) => {
        if (snap.val() === true) {
            console.log("Firebase Realtime Database connected");
        } else {
            console.warn("Firebase Realtime Database not connected");
        }
    });

} catch (error) {
    console.error("Firebase initialization error:", error);
    // Enhanced fallback
    auth = { 
        currentUser: null,
        signInWithEmailAndPassword: () => Promise.reject(new Error("Firebase not available - Domain configuration issue")),
        createUserWithEmailAndPassword: () => Promise.reject(new Error("Firebase not available - Domain configuration issue")),
        signOut: () => Promise.reject(new Error("Firebase not available - Domain configuration issue")),
        onAuthStateChanged: (callback) => {
            callback(null);
            return () => {};
        }
    };
    database = {
        ref: () => ({ 
            set: () => Promise.reject(new Error("Firebase not available - Domain configuration issue")),
            on: () => {},
            off: () => {}
        })
    };
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("Tameerkhi CV Builder - DOM fully loaded");

    // Domain validation check
    const currentUrl = window.location.href;
    if (!currentUrl.includes('www.tameerkhi.com') && !currentUrl.includes('localhost')) {
        console.warn('Domain mismatch detected. Expected: www.tameerkhi.com, Current:', currentUrl);
        setTimeout(() => {
            showNotification('Warning: You are accessing Tameerkhi from an unexpected domain. Some features may not work correctly.', 'warning');
        }, 5000);
    }
    
    // Initialize auto-save functionality
    initAutoSave();
    
    // Initialize progress bar
    updateProgressBar();
    
    // Initialize the CV builder with default preview
    generatePreview();
    
    // Add event listeners to all form inputs for real-time preview
    document.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', function() {
            generatePreview();
            updateProgressBar();
            // Auto-save after a delay
            clearTimeout(window.autoSaveTimeout);
            window.autoSaveTimeout = setTimeout(autoSaveData, 1000);
        });
    });
    
    // Template selection functionality
    document.querySelectorAll('.template-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Remove active class from all options
            document.querySelectorAll('.template-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Update current template display
            const templateName = this.getAttribute('data-template');
            document.getElementById('currentTemplate').textContent = 
                templateName.charAt(0).toUpperCase() + templateName.slice(1);
            
            // Regenerate preview with new template
            generatePreview();
        });
    });
    
    // Theme selection functionality
    document.querySelectorAll('.theme-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Remove active class from all options
            document.querySelectorAll('.theme-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Apply theme colors
            applyTheme(this.getAttribute('data-theme'));
            
            // Regenerate preview with new theme
            generatePreview();
        });
    });
    
    // Font selection functionality
    document.querySelectorAll('.font-option').forEach(option => {
        option.addEventListener('click', function(e) {
            e.stopPropagation();
            
            // Remove active class from all options
            document.querySelectorAll('.font-option').forEach(opt => {
                opt.classList.remove('active');
            });
            
            // Add active class to clicked option
            this.classList.add('active');
            
            // Apply selected font
            applyFont(this.getAttribute('data-font'));
            
            // Regenerate preview with new font
            generatePreview();
        });
    });
    
    // FONT SIZE FUNCTIONALITY
    const fontSizeSlider = document.getElementById('fontSizeSlider');
    const fontSizePreview = document.getElementById('fontSizePreview');
    
    fontSizeSlider.addEventListener('input', function() {
        const fontSize = this.value + 'px';
        fontSizePreview.style.fontSize = fontSize;
        applyFontSize(fontSize);
        generatePreview();
    });
    
    // Quick action buttons
    document.getElementById('quickPreview').addEventListener('click', function() {
        document.querySelector('.preview-section').scrollIntoView({ behavior: 'smooth' });
        showNotification('CV preview updated successfully', 'success');
    });
    
    document.getElementById('quickDownload').addEventListener('click', function() {
        downloadCV('pdf');
    });
    
    document.getElementById('quickSave').addEventListener('click', function() {
        document.getElementById('saveModal').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('saveModal').classList.add('show');
        }, 10);
    });
    
    // Button functionality
    document.getElementById('startBuildingBtn').addEventListener('click', function() {
        document.getElementById('builder').scrollIntoView({ behavior: 'smooth' });
        showNotification('Start building your professional CV!', 'success');
    });
    
    document.getElementById('viewTemplatesBtn').addEventListener('click', function() {
        document.getElementById('templates').scrollIntoView({ behavior: 'smooth' });
        showNotification('Browse our professional CV templates', 'info');
    });
    
    document.getElementById('previewBtn').addEventListener('click', function() {
        document.querySelector('.preview-section').scrollIntoView({ behavior: 'smooth' });
        showNotification('CV preview updated successfully', 'success');
    });
    
    document.getElementById('downloadBtn').addEventListener('click', function() {
        // Show download options
        const downloadOptions = document.getElementById('downloadOptions');
        downloadOptions.style.display = downloadOptions.style.display === 'block' ? 'none' : 'block';
    });
    
    document.getElementById('saveBtn').addEventListener('click', function() {
        // Show save modal
        document.getElementById('saveModal').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('saveModal').classList.add('show');
        }, 10);
    });
    
    document.getElementById('viewAllTemplatesBtn').addEventListener('click', function() {
        // Show template gallery
        document.getElementById('templateGallery').style.display = 'block';
    });
    
    // FIXED ABOUT BUTTONS - All about buttons now work
    document.getElementById('aboutHeaderBtn').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('aboutModal').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('aboutModal').classList.add('show');
        }, 10);
    });
    
    document.getElementById('mobileAboutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('aboutModal').style.display = 'flex';
        document.getElementById('mobileNav').classList.remove('active');
        setTimeout(() => {
            document.getElementById('aboutModal').classList.add('show');
        }, 10);
    });
    
    document.getElementById('aboutFooterBtn').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('aboutModal').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('aboutModal').classList.add('show');
        }, 10);
    });
    
    document.getElementById('aboutLinkFooter').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('aboutModal').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('aboutModal').classList.add('show');
        }, 10);
    });
    
    // NEW HELP CENTER FUNCTIONALITY
    document.getElementById('helpLink').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('helpModal').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('helpModal').classList.add('show');
        }, 10);
    });
    
    // FAQ functionality
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const faqItem = this.parentElement;
            faqItem.classList.toggle('active');
        });
    });
    
    // Login/Register functionality
    document.getElementById('loginBtn').addEventListener('click', function() {
        document.getElementById('loginModal').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('loginModal').classList.add('show');
        }, 10);
    });
    
    document.getElementById('registerBtn').addEventListener('click', function() {
        document.getElementById('registerModal').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('registerModal').classList.add('show');
        }, 10);
    });
    
    // Mobile login/register buttons
    document.getElementById('mobileLoginBtn').addEventListener('click', function() {
        document.getElementById('loginModal').style.display = 'flex';
        document.getElementById('mobileNav').classList.remove('active');
        setTimeout(() => {
            document.getElementById('loginModal').classList.add('show');
        }, 10);
    });
    
    document.getElementById('mobileRegisterBtn').addEventListener('click', function() {
        document.getElementById('registerModal').style.display = 'flex';
        document.getElementById('mobileNav').classList.remove('active');
        setTimeout(() => {
            document.getElementById('registerModal').classList.add('show');
        }, 10);
    });
    
    // FIXED CLOSE MODAL FUNCTIONALITY - All close buttons now work
    document.querySelectorAll('.modal-close, .gallery-close').forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal') || this.closest('.template-gallery');
            if (modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 400);
            }
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('show');
                setTimeout(() => {
                    this.style.display = 'none';
                }, 400);
            }
        });
    });
    
    // Footer link functionality
    document.getElementById('privacyLink').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('privacyModal').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('privacyModal').classList.add('show');
        }, 10);
    });
    
    document.getElementById('contactLink').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('contactModal').style.display = 'flex';
        setTimeout(() => {
            document.getElementById('contactModal').classList.add('show');
        }, 10);
    });
    
    // Format selection for download
    document.querySelectorAll('.format-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.format-option').forEach(opt => {
                opt.classList.remove('active');
            });
            this.classList.add('active');
        });
    });
    
    // Confirm download button
    document.getElementById('confirmDownload').addEventListener('click', function() {
        const format = document.querySelector('.format-option.active').getAttribute('data-format');
        downloadCV(format);
        
        // Close download options
        document.getElementById('downloadOptions').style.display = 'none';
        
        // Close template gallery if open
        document.getElementById('templateGallery').style.display = 'none';
    });
    
    // Submit login form
    document.getElementById('submitLogin').addEventListener('click', function() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        if (!email || !password) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Show loading spinner
        document.getElementById('loginSpinner').style.display = 'block';
        
        // Firebase login
        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                document.getElementById('loginSpinner').style.display = 'none';
                document.getElementById('loginModal').classList.remove('show');
                setTimeout(() => {
                    document.getElementById('loginModal').style.display = 'none';
                }, 400);
                showNotification('Login successful!', 'success');
                
                // Update UI for logged in user
                document.getElementById('loginBtn').classList.add('d-none');
                document.getElementById('registerBtn').classList.add('d-none');
                document.getElementById('adminBtn').classList.remove('d-none');
                document.getElementById('logoutBtn').classList.remove('d-none');
                
                // Update mobile buttons
                document.getElementById('mobileLoginBtn').classList.add('d-none');
                document.getElementById('mobileRegisterBtn').classList.add('d-none');
                document.getElementById('mobileAdminBtn').classList.remove('d-none');
                document.getElementById('mobileLogoutBtn').classList.remove('d-none');
                
                // Clear form fields
                document.getElementById('loginEmail').value = '';
                document.getElementById('loginPassword').value = '';
            })
            .catch((error) => {
                document.getElementById('loginSpinner').style.display = 'none';
                const errorCode = error.code;
                const errorMessage = error.message;
                showNotification('Login failed: ' + errorMessage, 'error');
            });
    });
    
    // Submit register form
    document.getElementById('submitRegister').addEventListener('click', function() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        
        if (!name || !email || !password || !confirmPassword) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return;
        }
        
        // Show loading spinner
        document.getElementById('registerSpinner').style.display = 'block';
        
        // Firebase registration
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up
                const user = userCredential.user;
                
                // Save user data to database
                database.ref('users/' + user.uid).set({
                    name: name,
                    email: email,
                    createdAt: new Date().toISOString()
                }).then(() => {
                    document.getElementById('registerSpinner').style.display = 'none';
                    document.getElementById('registerModal').classList.remove('show');
                    setTimeout(() => {
                        document.getElementById('registerModal').style.display = 'none';
                    }, 400);
                    showNotification('Registration successful!', 'success');
                    
                    // Clear form fields
                    document.getElementById('registerName').value = '';
                    document.getElementById('registerEmail').value = '';
                    document.getElementById('registerPassword').value = '';
                    document.getElementById('registerConfirmPassword').value = '';
                });
            })
            .catch((error) => {
                document.getElementById('registerSpinner').style.display = 'none';
                const errorCode = error.code;
                const errorMessage = error.message;
                showNotification('Registration failed: ' + errorMessage, 'error');
            });
    });
    
    // Google Sign-In functionality - FIXED AND WORKING
    document.getElementById('googleLogin').addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        auth.signInWithPopup(provider)
            .then((result) => {
                // Signed in
                const user = result.user;
                showNotification('Google Sign-In successful!', 'success');
                
                // Update UI for logged in user
                document.getElementById('loginBtn').classList.add('d-none');
                document.getElementById('registerBtn').classList.add('d-none');
                document.getElementById('adminBtn').classList.remove('d-none');
                document.getElementById('logoutBtn').classList.remove('d-none');
                
                // Update mobile buttons
                document.getElementById('mobileLoginBtn').classList.add('d-none');
                document.getElementById('mobileRegisterBtn').classList.add('d-none');
                document.getElementById('mobileAdminBtn').classList.remove('d-none');
                document.getElementById('mobileLogoutBtn').classList.remove('d-none');
                
                // Close login modal
                document.getElementById('loginModal').classList.remove('show');
                setTimeout(() => {
                    document.getElementById('loginModal').style.display = 'none';
                }, 400);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                showNotification('Google Sign-In failed: ' + errorMessage, 'error');
            });
    });
    
    document.getElementById('googleRegister').addEventListener('click', function() {
        const provider = new firebase.auth.GoogleAuthProvider();
        
        auth.signInWithPopup(provider)
            .then((result) => {
                // Signed in
                const user = result.user;
                showNotification('Google Sign-In successful!', 'success');
                
                // Update UI for logged in user
                document.getElementById('loginBtn').classList.add('d-none');
                document.getElementById('registerBtn').classList.add('d-none');
                document.getElementById('adminBtn').classList.remove('d-none');
                document.getElementById('logoutBtn').classList.remove('d-none');
                
                // Update mobile buttons
                document.getElementById('mobileLoginBtn').classList.add('d-none');
                document.getElementById('mobileRegisterBtn').classList.add('d-none');
                document.getElementById('mobileAdminBtn').classList.remove('d-none');
                document.getElementById('mobileLogoutBtn').classList.remove('d-none');
                
                // Close register modal
                document.getElementById('registerModal').classList.remove('show');
                setTimeout(() => {
                    document.getElementById('registerModal').style.display = 'none';
                }, 400);
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                showNotification('Google Sign-In failed: ' + errorMessage, 'error');
            });
    });
    
    // Submit save CV form - SECURE IMPLEMENTATION
    document.getElementById('submitSave').addEventListener('click', function() {
        const title = document.getElementById('cvTitle').value;
        
        if (!title) {
            showNotification('Please enter a title for your CV', 'error');
            return;
        }
        
        // Show loading spinner
        document.getElementById('saveSpinner').style.display = 'block';
        
        // Get current user
        const user = auth.currentUser;
        if (!user) {
            document.getElementById('saveSpinner').style.display = 'none';
            showNotification('Please log in to save your CV', 'error');
            return;
        }
        
        // Get CV data
        const cvData = getFormData();
        const description = document.getElementById('cvDescription').value;
        
        // Save to Firebase with SECURE structure
        const userCVsRef = database.ref('userCVs/' + user.uid);
        const cvRef = userCVsRef.push();
        
        cvRef.set({
            title: title,
            description: description,
            data: cvData,
            createdAt: new Date().toISOString(),
            userId: user.uid // Additional security: store user ID with data
        }).then(() => {
            document.getElementById('saveSpinner').style.display = 'none';
            document.getElementById('saveModal').classList.remove('show');
            setTimeout(() => {
                document.getElementById('saveModal').style.display = 'none';
            }, 400);
            showNotification('CV saved successfully! You can access it from your dashboard.', 'success');
            
            // Clear form fields
            document.getElementById('cvTitle').value = '';
            document.getElementById('cvDescription').value = '';
        }).catch((error) => {
            document.getElementById('saveSpinner').style.display = 'none';
            showNotification('Failed to save CV: ' + error.message, 'error');
        });
    });
    
    // Submit contact form
    document.getElementById('submitContact').addEventListener('click', function() {
        const name = document.getElementById('contactName').value;
        const email = document.getElementById('contactEmail').value;
        const message = document.getElementById('contactMessage').value;
        
        if (!name || !email || !message) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        // Show loading spinner
        document.getElementById('contactSpinner').style.display = 'block';
        
        // Save contact form data to Firebase
        const contactRef = database.ref('contacts').push();
        contactRef.set({
            name: name,
            email: email,
            message: message,
            timestamp: new Date().toISOString()
        }).then(() => {
            document.getElementById('contactSpinner').style.display = 'none';
            document.getElementById('contactModal').classList.remove('show');
            setTimeout(() => {
                document.getElementById('contactModal').style.display = 'none';
            }, 400);
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            
            // Clear form
            document.getElementById('contactName').value = '';
            document.getElementById('contactEmail').value = '';
            document.getElementById('contactMessage').value = '';
        }).catch((error) => {
            document.getElementById('contactSpinner').style.display = 'none';
            showNotification('Failed to send message: ' + error.message, 'error');
        });
    });
    
    // Logout functionality
    document.getElementById('logoutBtn').addEventListener('click', function() {
        auth.signOut().then(() => {
            document.getElementById('loginBtn').classList.remove('d-none');
            document.getElementById('registerBtn').classList.remove('d-none');
            document.getElementById('adminBtn').classList.add('d-none');
            document.getElementById('logoutBtn').classList.add('d-none');
            
            // Update mobile buttons
            document.getElementById('mobileLoginBtn').classList.remove('d-none');
            document.getElementById('mobileRegisterBtn').classList.remove('d-none');
            document.getElementById('mobileAdminBtn').classList.add('d-none');
            document.getElementById('mobileLogoutBtn').classList.add('d-none');
            
            showNotification('You have been logged out', 'info');
        }).catch((error) => {
            showNotification('Logout failed: ' + error.message, 'error');
        });
    });
    
    // Mobile logout
    document.getElementById('mobileLogoutBtn').addEventListener('click', function() {
        document.getElementById('logoutBtn').click();
        document.getElementById('mobileNav').classList.remove('active');
    });
    
    // Add experience, education, and skill fields
    document.getElementById('addExperience').addEventListener('click', addExperienceField);
    document.getElementById('addEducation').addEventListener('click', addEducationField);
    document.getElementById('addSkill').addEventListener('click', addSkillField);
    
    // Initialize with one of each field
    addExperienceField();
    addEducationField();
    addSkillField();
    
    // Mobile menu functionality
    document.getElementById('mobileMenuBtn').addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('mobileNav').classList.toggle('active');
    });
    
    // Close mobile menu when clicking outside or on links
    document.addEventListener('click', function(event) {
        const mobileNav = document.getElementById('mobileNav');
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        
        if (mobileNav.classList.contains('active') && 
            !mobileNav.contains(event.target) && 
            !mobileMenuBtn.contains(event.target)) {
            mobileNav.classList.remove('active');
        }
    });
    
    // Close mobile menu when clicking on links
    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', function() {
            document.getElementById('mobileNav').classList.remove('active');
        });
    });
    
    // Template gallery functionality
    document.querySelectorAll('.use-template').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const templateCard = this.closest('.template-card');
            const template = templateCard.getAttribute('data-template');
            
            // Set the template as active in main selector
            document.querySelectorAll('.template-option').forEach(option => {
                option.classList.remove('active');
                if (option.getAttribute('data-template') === template) {
                    option.classList.add('active');
                }
            });
            
            // Update current template display
            document.getElementById('currentTemplate').textContent = 
                template.charAt(0).toUpperCase() + template.slice(1);
            
            // Regenerate preview
            generatePreview();
            
            // Close gallery
            document.getElementById('templateGallery').style.display = 'none';
            
            showNotification(`Template changed to ${template}`, 'success');
        });
    });
    
    // Template preview functionality
    document.querySelectorAll('.preview-template').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const templateCard = this.closest('.template-card');
            const template = templateCard.getAttribute('data-template');
            
            // Set the template as active temporarily for preview
            document.querySelectorAll('.template-option').forEach(option => {
                option.classList.remove('active');
                if (option.getAttribute('data-template') === template) {
                    option.classList.add('active');
                }
            });
            
            // Update current template display
            document.getElementById('currentTemplate').textContent = 
                template.charAt(0).toUpperCase() + template.slice(1);
            
            // Regenerate preview
            generatePreview();
            
            // Scroll to preview section
            document.querySelector('.preview-section').scrollIntoView({ behavior: 'smooth' });
            
            // Show notification
            showNotification(`Previewing ${template} template`, 'info');
            
            // Close gallery
            document.getElementById('templateGallery').style.display = 'none';
        });
    });
    
    // Close template gallery
    document.querySelector('.gallery-close').addEventListener('click', function() {
        document.getElementById('templateGallery').style.display = 'none';
    });
    
    // Photo upload functionality - FIXED
    document.getElementById('photoUploadBtn').addEventListener('click', function() {
        document.getElementById('photoUpload').click();
    });
    
    document.getElementById('photoUpload').addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const photoPreview = document.getElementById('photoPreview');
                photoPreview.innerHTML = '';
                const img = document.createElement('img');
                img.src = e.target.result;
                photoPreview.appendChild(img);
                generatePreview();
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
            
            // Close mobile menu after clicking
            document.getElementById('mobileNav').classList.remove('active');
        });
    });

    // Clear placeholder text on focus for new users
    document.querySelectorAll('#certifications, #projects, #interests, #languages').forEach(field => {
        field.addEventListener('focus', function() {
            if (this.value === this.getAttribute('placeholder')) {
                this.value = '';
            }
        });
        
        // Initialize with placeholder text
        if (field.value === '') {
            field.value = field.getAttribute('placeholder');
        }
    });
    
    // Social sharing functionality
    document.querySelectorAll('.share-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.getAttribute('data-platform');
            const url = encodeURIComponent(window.location.href);
            const title = encodeURIComponent(document.title);
            let shareUrl;

            switch(platform) {
                case 'linkedin':
                    shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
                    break;
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
                    break;
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
                    break;
                case 'whatsapp':
                    shareUrl = `https://api.whatsapp.com/send?text=${title} ${url}`;
                    break;
            }

            if(shareUrl) {
                window.open(shareUrl, '_blank', 'width=600,height=400');
            }
        });
    });
});

// FUNCTION: Initialize auto-save - MODIFIED FOR NEW USERS
function initAutoSave() {
    // Don't load any saved data for new users
    // This ensures every new user starts with a clean form
    localStorage.removeItem('tameerkhi-cv-data');
    
    // Clear any existing form data
    document.getElementById('fullName').value = '';
    document.getElementById('profession').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('address').value = '';
    document.getElementById('linkedin').value = '';
    document.getElementById('summary').value = '';
    document.getElementById('languages').value = 'English (Native), Spanish (Intermediate)';
    document.getElementById('certifications').value = 'List your certifications...';
    document.getElementById('projects').value = 'Describe your key projects...';
    document.getElementById('interests').value = 'Photography, Travel, Reading';
    
    // Clear photo
    const photoPreview = document.getElementById('photoPreview');
    photoPreview.innerHTML = '<i class="fas fa-user" style="font-size: 3rem;"></i>';
    
    // Clear dynamic fields
    document.getElementById('experienceContainer').innerHTML = '';
    document.getElementById('educationContainer').innerHTML = '';
    document.getElementById('skillsContainer').innerHTML = '';
    
    // Add initial fields
    addExperienceField();
    addEducationField();
    addSkillField();
    
    // Generate initial preview
    generatePreview();
    updateProgressBar();
}

// FUNCTION: Auto-save data
function autoSaveData() {
    const formData = getFormData();
    localStorage.setItem('tameerkhi-cv-data', JSON.stringify(formData));
    
    // Show auto-save indicator
    const indicator = document.getElementById('autoSaveIndicator');
    indicator.style.display = 'flex';
    setTimeout(() => {
        indicator.style.display = 'none';
    }, 2000);
}

// FUNCTION: Update progress bar
function updateProgressBar() {
    const formData = getFormData();
    let progress = 0;
    
    // Calculate progress based on filled fields
    if (formData.personal.fullName) progress += 10;
    if (formData.personal.profession) progress += 10;
    if (formData.personal.email) progress += 10;
    if (formData.personal.phone) progress += 10;
    if (formData.summary) progress += 10;
    if (formData.experiences.length > 0 && formData.experiences[0].title) progress += 20;
    if (formData.education.length > 0 && formData.education[0].degree) progress += 20;
    if (formData.skills.length > 0 && formData.skills[0]) progress += 10;
    
    document.getElementById('cvProgress').style.width = progress + '%';
}

// FUNCTION: Apply theme colors
function applyTheme(theme) {
    const root = document.documentElement;
    
    switch(theme) {
        case 'blue':
            root.style.setProperty('--accent', '#3498db');
            root.style.setProperty('--primary', '#2c3e50');
            break;
        case 'red':
            root.style.setProperty('--accent', '#e74c3c');
            root.style.setProperty('--primary', '#c0392b');
            break;
        case 'green':
            root.style.setProperty('--accent', '#27ae60');
            root.style.setProperty('--primary', '#229954');
            break;
        case 'gold':
            root.style.setProperty('--accent', '#f39c12');
            root.style.setProperty('--primary', '#e67e22');
            break;
        case 'purple':
            root.style.setProperty('--accent', '#9b59b6');
            root.style.setProperty('--primary', '#8e44ad');
            break;
    }
}

// FUNCTION: Apply font family
function applyFont(font) {
    const root = document.documentElement;
    
    switch(font) {
        case 'inter':
            root.style.setProperty('--font-primary', 'Inter, sans-serif');
            break;
        case 'poppins':
            root.style.setProperty('--font-primary', 'Poppins, sans-serif');
            break;
    }
}

// FUNCTION: Apply font size
function applyFontSize(size) {
    document.documentElement.style.setProperty('--base-font-size', size);
}

// Function to show notifications
function showNotification(message, type) {
    const notification = document.getElementById('notification');
    const notificationText = document.getElementById('notification-text');
    
    notificationText.textContent = message;
    notification.className = `notification ${type}`;
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Function to add experience field
function addExperienceField() {
    const container = document.getElementById('experienceContainer');
    const newField = document.createElement('div');
    newField.className = 'item-group';
    newField.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label><i class="fas fa-user-tie"></i> Job Title</label>
                <input type="text" class="form-control experience-title" placeholder="Senior Developer">
            </div>
            <div class="form-group">
                <label><i class="fas fa-building"></i> Company</label>
                <input type="text" class="form-control experience-company" placeholder="Tech Solutions Inc.">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label><i class="fas fa-calendar-alt"></i> Start Date</label>
                <input type="month" class="form-control experience-start">
            </div>
            <div class="form-group">
                <label><i class="fas fa-calendar-alt"></i> End Date</label>
                <input type="month" class="form-control experience-end" placeholder="Present">
            </div>
        </div>
        <div class="form-group">
            <label><i class="fas fa-tasks"></i> Description <span class="optional-badge">Optional</span></label>
            <textarea class="form-control experience-description" rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>
        </div>
        <button class="remove-btn"><i class="fas fa-trash"></i> Remove</button>
    `;
    
    container.appendChild(newField);
    
    // Add event listener to the new remove button
    newField.querySelector('.remove-btn').addEventListener('click', function() {
        container.removeChild(newField);
        generatePreview();
        updateProgressBar();
    });
    
    // Add event listeners to new inputs for real-time preview
    newField.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', function() {
            generatePreview();
            updateProgressBar();
            clearTimeout(window.autoSaveTimeout);
            window.autoSaveTimeout = setTimeout(autoSaveData, 1000);
        });
    });
    
    generatePreview();
    updateProgressBar();
}

// Function to add education field
function addEducationField() {
    const container = document.getElementById('educationContainer');
    const newField = document.createElement('div');
    newField.className = 'item-group';
    newField.innerHTML = `
        <div class="form-row">
            <div class="form-group">
                <label><i class="fas fa-certificate"></i> Degree</label>
                <input type="text" class="form-control education-degree" placeholder="Bachelor of Science">
            </div>
            <div class="form-group">
                <label><i class="fas fa-university"></i> Institution</label>
                <input type="text" class="form-control education-institution" placeholder="University of Example">
            </div>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label><i class="fas fa-calendar-alt"></i> Start Date</label>
                <input type="month" class="form-control education-start">
            </div>
            <div class="form-group">
                <label><i class="fas fa-calendar-alt"></i> End Date</label>
                <input type="month" class="form-control education-end">
            </div>
        </div>
        <div class="form-group">
            <label><i class="fas fa-tasks"></i> Description <span class="optional-badge">Optional</span></label>
            <textarea class="form-control education-description" rows="2" placeholder="Relevant coursework, achievements..."></textarea>
        </div>
        <button class="remove-btn"><i class="fas fa-trash"></i> Remove</button>
    `;
    
    container.appendChild(newField);
    
    // Add event listener to the new remove button
    newField.querySelector('.remove-btn').addEventListener('click', function() {
        container.removeChild(newField);
        generatePreview();
        updateProgressBar();
    });
    
    // Add event listeners to new inputs for real-time preview
    newField.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', function() {
            generatePreview();
            updateProgressBar();
            clearTimeout(window.autoSaveTimeout);
            window.autoSaveTimeout = setTimeout(autoSaveData, 1000);
        });
    });
    
    generatePreview();
    updateProgressBar();
}

// Function to add skill field
function addSkillField() {
    const container = document.getElementById('skillsContainer');
    const newField = document.createElement('div');
    newField.className = 'form-group';
    newField.innerHTML = `
        <input type="text" class="form-control skill-input" placeholder="JavaScript, Project Management, etc.">
        <button class="remove-btn"><i class="fas fa-trash"></i> Remove</button>
    `;
    
    container.appendChild(newField);
    
    // Add event listener to the new remove button
    newField.querySelector('.remove-btn').addEventListener('click', function() {
        container.removeChild(newField);
        generatePreview();
        updateProgressBar();
    });
    
    // Add event listener to new input for real-time preview
    newField.querySelector('input').addEventListener('input', function() {
        generatePreview();
        updateProgressBar();
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(autoSaveData, 1000);
    });
    
    generatePreview();
    updateProgressBar();
}

// Function to generate the CV preview
function generatePreview() {
    const previewContainer = document.getElementById('cvPreview');
    const selectedTemplate = document.querySelector('.template-option.active').getAttribute('data-template');
    
    // Get form data
    const formData = getFormData();
    
    // Generate HTML based on template
    let cvHTML = '';
    
    switch(selectedTemplate) {
        case 'modern':
            cvHTML = generateModernTemplate(formData);
            break;
        case 'minimal':
            cvHTML = generateMinimalTemplate(formData);
            break;
        case 'business':
            cvHTML = generateBusinessTemplate(formData);
            break;
        case 'creative':
            cvHTML = generateCreativeTemplate(formData);
            break;
        case 'professional':
            cvHTML = generateProfessionalTemplate(formData);
            break;
        case 'executive':
            cvHTML = generateExecutiveTemplate(formData);
            break;
        case 'academic':
            cvHTML = generateAcademicTemplate(formData);
            break;
        case 'simple':
            cvHTML = generateSimpleTemplate(formData);
            break;
        case 'elegant':
            cvHTML = generateElegantTemplate(formData);
            break;
        case 'technical':
            cvHTML = generateTechnicalTemplate(formData);
            break;
        default:
            cvHTML = generateModernTemplate(formData);
    }
    
    previewContainer.innerHTML = cvHTML;
    previewContainer.className = `cv-preview template-${selectedTemplate}`;
    
    // Apply font size to preview
    const fontSize = document.getElementById('fontSizeSlider').value + 'px';
    previewContainer.style.fontSize = fontSize;
}

// Function to get form data
function getFormData() {
    const photoPreview = document.getElementById('photoPreview');
    const photoImg = photoPreview.querySelector('img');
    const photoSrc = photoImg ? photoImg.src : null;
    
    return {
        personal: {
            fullName: document.getElementById('fullName').value || '',
            profession: document.getElementById('profession').value || '',
            email: document.getElementById('email').value || '',
            phone: document.getElementById('phone').value || '',
            address: document.getElementById('address').value || '',
            photo: photoSrc,
            linkedin: document.getElementById('linkedin').value || ''
        },
        summary: document.getElementById('summary').value || '',
        experiences: Array.from(document.querySelectorAll('#experienceContainer .item-group')).map(exp => ({
            title: exp.querySelector('.experience-title').value || '',
            company: exp.querySelector('.experience-company').value || '',
            start: exp.querySelector('.experience-start').value || '',
            end: exp.querySelector('.experience-end').value || '',
            description: exp.querySelector('.experience-description').value || ''
        })),
        education: Array.from(document.querySelectorAll('#educationContainer .item-group')).map(edu => ({
            degree: edu.querySelector('.education-degree').value || '',
            institution: edu.querySelector('.education-institution').value || '',
            start: edu.querySelector('.education-start').value || '',
            end: edu.querySelector('.education-end').value || '',
            description: edu.querySelector('.education-description').value || ''
        })),
        skills: Array.from(document.querySelectorAll('#skillsContainer .skill-input')).map(skill => 
            skill.value || ''
        ).filter(skill => skill.trim() !== ''),
        languages: document.getElementById('languages').value || '',
        certifications: document.getElementById('certifications').value || '',
        projects: document.getElementById('projects').value || '',
        interests: document.getElementById('interests').value || ''
    };
}

// Template generation functions - FIXED FOR ALL 10 TEMPLATES
function generateModernTemplate(data) {
    return `
        <div class="cv-template modern">
            <div class="cv-header">
                <div class="cv-name">${data.personal.fullName || 'Your Name'}</div>
                <div class="cv-profession">${data.personal.profession || 'Your Profession'}</div>
            </div>
            <div class="cv-content">
                <div class="cv-sidebar">
                    ${data.personal.photo ? `
                        <div class="cv-photo">
                            <img src="${data.personal.photo}" alt="${data.personal.fullName || 'Your Name'}">
                        </div>
                    ` : ''}
                    
                    <div class="cv-section">
                        <div class="cv-section-title">Contact</div>
                        <div class="cv-contact">
                            <div><i class="fas fa-envelope"></i> ${data.personal.email || 'your.email@example.com'}</div>
                            <div><i class="fas fa-phone"></i> ${data.personal.phone || '+1 (555) 123-4567'}</div>
                            <div><i class="fas fa-map-marker-alt"></i> ${data.personal.address || 'City, Country'}</div>
                            ${data.personal.linkedin ? `<div><i class="fab fa-linkedin"></i> ${data.personal.linkedin}</div>` : ''}
                        </div>
                    </div>
                    
                    ${data.skills.length > 0 ? `
                    <div class="cv-section">
                        <div class="cv-section-title">Skills</div>
                        <div class="cv-skills">
                            ${data.skills.map(skill => `
                                <div class="skill-tag">${skill}</div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    ${data.languages ? `
                    <div class="cv-section">
                        <div class="cv-section-title">Languages</div>
                        <p>${data.languages}</p>
                    </div>
                    ` : ''}
                </div>
                
                <div class="cv-main">
                    <div class="cv-section">
                        <div class="cv-section-title">Professional Summary</div>
                        <div class="cv-summary">${data.summary || 'Experienced professional with a proven track record of success...'}</div>
                    </div>
                    
                    ${data.experiences.length > 0 && data.experiences[0].title ? `
                    <div class="cv-section">
                        <div class="cv-section-title">Work Experience</div>
                        ${data.experiences.map(exp => `
                            <div class="cv-item">
                                <div class="cv-item-title">${exp.title}</div>
                                <div class="cv-item-subtitle">${exp.company} | ${formatDate(exp.start)} - ${formatDate(exp.end)}</div>
                                <p>${exp.description}</p>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    ${data.education.length > 0 && data.education[0].degree ? `
                    <div class="cv-section">
                        <div class="cv-section-title">Education</div>
                        ${data.education.map(edu => `
                            <div class="cv-item">
                                <div class="cv-item-title">${edu.degree}</div>
                                <div class="cv-item-subtitle">${edu.institution} | ${formatDate(edu.start)} - ${formatDate(edu.end)}</div>
                                <p>${edu.description}</p>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function generateProfessionalTemplate(data) {
    return `
        <div class="cv-template professional">
            <div class="cv-header">
                ${data.personal.photo ? `
                    <div class="cv-photo">
                        <img src="${data.personal.photo}" alt="${data.personal.fullName || 'Your Name'}">
                    </div>
                ` : '<div class="cv-photo"><i class="fas fa-user" style="font-size: 3rem; color: white;"></i></div>'}
                <div class="cv-header-text">
                    <div class="cv-name">${data.personal.fullName || 'Your Name'}</div>
                    <div class="cv-profession">${data.personal.profession || 'Your Profession'}</div>
                </div>
            </div>
            <div class="cv-content">
                <div class="cv-sidebar">
                    <div class="cv-section">
                        <div class="cv-section-title">Contact</div>
                        <div class="cv-contact">
                            <div><i class="fas fa-envelope"></i> ${data.personal.email || 'your.email@example.com'}</div>
                            <div><i class="fas fa-phone"></i> ${data.personal.phone || '+1 (555) 123-4567'}</div>
                            <div><i class="fas fa-map-marker-alt"></i> ${data.personal.address || 'City, Country'}</div>
                            ${data.personal.linkedin ? `<div><i class="fab fa-linkedin"></i> ${data.personal.linkedin}</div>` : ''}
                        </div>
                    </div>
                    
                    ${data.skills.length > 0 ? `
                    <div class="cv-section">
                        <div class="cv-section-title">Skills</div>
                        <div class="cv-skills">
                            ${data.skills.map(skill => `
                                <div class="skill-tag">${skill}</div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="cv-main">
                    <div class="cv-section">
                        <div class="cv-section-title">Professional Summary</div>
                        <div class="cv-summary">${data.summary || 'Experienced professional with a proven track record of success...'}</div>
                    </div>
                    
                    ${data.experiences.length > 0 && data.experiences[0].title ? `
                    <div class="cv-section">
                        <div class="cv-section-title">Work Experience</div>
                        ${data.experiences.map(exp => `
                            <div class="cv-item">
                                <div class="cv-item-title">${exp.title}</div>
                                <div class="cv-item-subtitle">${exp.company} | ${formatDate(exp.start)} - ${formatDate(exp.end)}</div>
                                <p>${exp.description}</p>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    ${data.education.length > 0 && data.education[0].degree ? `
                    <div class="cv-section">
                        <div class="cv-section-title">Education</div>
                        ${data.education.map(edu => `
                            <div class="cv-item">
                                <div class="cv-item-title">${edu.degree}</div>
                                <div class="cv-item-subtitle">${edu.institution} | ${formatDate(edu.start)} - ${formatDate(edu.end)}</div>
                                <p>${edu.description}</p>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function generateExecutiveTemplate(data) {
    return `
        <div class="cv-template executive">
            <div class="cv-header">
                <div class="cv-name">${data.personal.fullName || 'Your Name'}</div>
                <div class="cv-profession">${data.personal.profession || 'Your Profession'}</div>
            </div>
            <div class="cv-content">
                <div class="cv-section">
                    <div class="cv-section-title">Executive Summary</div>
                    <div class="cv-summary">${data.summary || 'Experienced professional with a proven track record of success...'}</div>
                </div>
                
                ${data.experiences.length > 0 && data.experiences[0].title ? `
                <div class="cv-section">
                    <div class="cv-section-title">Professional Experience</div>
                    ${data.experiences.map(exp => `
                        <div class="cv-item">
                            <div class="cv-item-title">${exp.title}</div>
                            <div class="cv-item-subtitle">${exp.company} | ${formatDate(exp.start)} - ${formatDate(exp.end)}</div>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.education.length > 0 && data.education[0].degree ? `
                <div class="cv-section">
                    <div class="cv-section-title">Education</div>
                    ${data.education.map(edu => `
                        <div class="cv-item">
                            <div class="cv-item-title">${edu.degree}</div>
                            <div class="cv-item-subtitle">${edu.institution} | ${formatDate(edu.start)} - ${formatDate(edu.end)}</div>
                            <p>${edu.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.skills.length > 0 ? `
                <div class="cv-section">
                    <div class="cv-section-title">Core Competencies</div>
                    <div class="cv-skills">
                        ${data.skills.map(skill => `
                            <div class="skill-tag">${skill}</div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// NEW TEMPLATE GENERATION FUNCTIONS FOR THE 4 MISSING TEMPLATES

function generateAcademicTemplate(data) {
    return `
        <div class="cv-template academic">
            <div class="cv-header">
                <div class="cv-name">${data.personal.fullName || 'Your Name'}</div>
                <div class="cv-profession">${data.personal.profession || 'Your Profession'}</div>
            </div>
            <div class="cv-content">
                <div class="cv-section">
                    <div class="cv-section-title">Academic Profile</div>
                    <div class="cv-summary">${data.summary || 'Experienced professional with a proven track record of success...'}</div>
                </div>
                
                ${data.experiences.length > 0 && data.experiences[0].title ? `
                <div class="cv-section">
                    <div class="cv-section-title">Research & Experience</div>
                    ${data.experiences.map(exp => `
                        <div class="cv-item">
                            <div class="cv-item-title">${exp.title}</div>
                            <div class="cv-item-subtitle">${exp.company} | ${formatDate(exp.start)} - ${formatDate(exp.end)}</div>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.education.length > 0 && data.education[0].degree ? `
                <div class="cv-section">
                    <div class="cv-section-title">Education</div>
                    ${data.education.map(edu => `
                        <div class="cv-item">
                            <div class="cv-item-title">${edu.degree}</div>
                            <div class="cv-item-subtitle">${edu.institution} | ${formatDate(edu.start)} - ${formatDate(edu.end)}</div>
                            <p>${edu.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.skills.length > 0 ? `
                <div class="cv-section">
                    <div class="cv-section-title">Research Skills</div>
                    <div class="cv-skills">
                        ${data.skills.map(skill => `
                            <div class="skill-tag">${skill}</div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateSimpleTemplate(data) {
    return `
        <div class="cv-template simple">
            <div class="cv-header">
                <div class="cv-name">${data.personal.fullName || 'Your Name'}</div>
                <div class="cv-profession">${data.personal.profession || 'Your Profession'}</div>
                <div class="cv-contact">
                    <span>${data.personal.email || 'your.email@example.com'}</span> | 
                    <span>${data.personal.phone || '+1 (555) 123-4567'}</span> | 
                    <span>${data.personal.address || 'City, Country'}</span>
                </div>
            </div>
            
            <div class="cv-section">
                <div class="cv-section-title">Summary</div>
                <div class="cv-summary">${data.summary || 'Experienced professional with a proven track record of success...'}</div>
            </div>
            
            ${data.experiences.length > 0 && data.experiences[0].title ? `
            <div class="cv-section">
                <div class="cv-section-title">Experience</div>
                ${data.experiences.map(exp => `
                    <div class="cv-item">
                        <div class="cv-item-title">${exp.title} - ${exp.company}</div>
                        <div class="cv-item-subtitle">${formatDate(exp.start)} - ${formatDate(exp.end)}</div>
                        <p>${exp.description}</p>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${data.education.length > 0 && data.education[0].degree ? `
            <div class="cv-section">
                <div class="cv-section-title">Education</div>
                ${data.education.map(edu => `
                    <div class="cv-item">
                        <div class="cv-item-title">${edu.degree} - ${edu.institution}</div>
                        <div class="cv-item-subtitle">${formatDate(edu.start)} - ${formatDate(edu.end)}</div>
                        <p>${edu.description}</p>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${data.skills.length > 0 ? `
            <div class="cv-section">
                <div class="cv-section-title">Skills</div>
                <div class="cv-skills">
                    ${data.skills.map(skill => `
                        <div class="skill-tag">${skill}</div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
        </div>
    `;
}

function generateElegantTemplate(data) {
    return `
        <div class="cv-template elegant">
            <div class="cv-header">
                <div class="cv-name">${data.personal.fullName || 'Your Name'}</div>
                <div class="cv-profession">${data.personal.profession || 'Your Profession'}</div>
            </div>
            <div class="cv-content">
                <div class="cv-section">
                    <div class="cv-section-title">Professional Profile</div>
                    <div class="cv-summary">${data.summary || 'Experienced professional with a proven track record of success...'}</div>
                </div>
                
                ${data.experiences.length > 0 && data.experiences[0].title ? `
                <div class="cv-section">
                    <div class="cv-section-title">Career History</div>
                    ${data.experiences.map(exp => `
                        <div class="cv-item">
                            <div class="cv-item-title">${exp.title}</div>
                            <div class="cv-item-subtitle">${exp.company} | ${formatDate(exp.start)} - ${formatDate(exp.end)}</div>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.education.length > 0 && data.education[0].degree ? `
                <div class="cv-section">
                    <div class="cv-section-title">Education</div>
                    ${data.education.map(edu => `
                        <div class="cv-item">
                            <div class="cv-item-title">${edu.degree}</div>
                            <div class="cv-item-subtitle">${edu.institution} | ${formatDate(edu.start)} - ${formatDate(edu.end)}</div>
                            <p>${edu.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.skills.length > 0 ? `
                <div class="cv-section">
                    <div class="cv-section-title">Core Competencies</div>
                    <div class="cv-skills">
                        ${data.skills.map(skill => `
                            <div class="skill-tag">${skill}</div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateTechnicalTemplate(data) {
    return `
        <div class="cv-template technical">
            <div class="cv-header">
                <div class="cv-name">${data.personal.fullName || 'Your Name'}</div>
                <div class="cv-profession">${data.personal.profession || 'Your Profession'}</div>
            </div>
            <div class="cv-content">
                <div class="cv-section">
                    <div class="cv-section-title">Technical Summary</div>
                    <div class="cv-summary">${data.summary || 'Experienced professional with a proven track record of success...'}</div>
                </div>
                
                ${data.experiences.length > 0 && data.experiences[0].title ? `
                <div class="cv-section">
                    <div class="cv-section-title">Technical Experience</div>
                    ${data.experiences.map(exp => `
                        <div class="cv-item">
                            <div class="cv-item-title">${exp.title}</div>
                            <div class="cv-item-subtitle">${exp.company} | ${formatDate(exp.start)} - ${formatDate(exp.end)}</div>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.education.length > 0 && data.education[0].degree ? `
                <div class="cv-section">
                    <div class="cv-section-title">Education & Certifications</div>
                    ${data.education.map(edu => `
                        <div class="cv-item">
                            <div class="cv-item-title">${edu.degree}</div>
                            <div class="cv-item-subtitle">${edu.institution} | ${formatDate(edu.start)} - ${formatDate(edu.end)}</div>
                            <p>${edu.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.skills.length > 0 ? `
                <div class="cv-section">
                    <div class="cv-section-title">Technical Skills</div>
                    <div class="cv-skills">
                        ${data.skills.map(skill => `
                            <div class="skill-tag">${skill}</div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${data.projects ? `
                <div class="cv-section">
                    <div class="cv-section-title">Projects</div>
                    <p>${data.projects}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Additional template functions for Business and Creative
function generateBusinessTemplate(data) {
    return `
        <div class="cv-template executive">
            <div class="cv-header" style="background: linear-gradient(45deg, #c0392b, #e74c3c);">
                <div class="cv-name">${data.personal.fullName || 'Your Name'}</div>
                <div class="cv-profession">${data.personal.profession || 'Your Profession'}</div>
            </div>
            <div class="cv-content">
                <div class="cv-section">
                    <div class="cv-section-title" style="border-bottom-color: #c0392b;">Professional Summary</div>
                    <div class="cv-summary">${data.summary || 'Experienced professional with a proven track record of success...'}</div>
                </div>
                
                ${data.experiences.length > 0 && data.experiences[0].title ? `
                <div class="cv-section">
                    <div class="cv-section-title" style="border-bottom-color: #c0392b;">Work Experience</div>
                    ${data.experiences.map(exp => `
                        <div class="cv-item">
                            <div class="cv-item-title">${exp.title}</div>
                            <div class="cv-item-subtitle" style="color: #c0392b;">${exp.company} | ${formatDate(exp.start)} - ${formatDate(exp.end)}</div>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.education.length > 0 && data.education[0].degree ? `
                <div class="cv-section">
                    <div class="cv-section-title" style="border-bottom-color: #c0392b;">Education</div>
                    ${data.education.map(edu => `
                        <div class="cv-item">
                            <div class="cv-item-title">${edu.degree}</div>
                            <div class="cv-item-subtitle" style="color: #c0392b;">${edu.institution} | ${formatDate(edu.start)} - ${formatDate(edu.end)}</div>
                            <p>${edu.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.skills.length > 0 ? `
                <div class="cv-section">
                    <div class="cv-section-title" style="border-bottom-color: #c0392b;">Skills</div>
                    <div class="cv-skills">
                        ${data.skills.map(skill => `
                            <div class="skill-tag" style="background: #c0392b;">${skill}</div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

function generateCreativeTemplate(data) {
    return `
        <div class="cv-template modern">
            <div class="cv-header" style="background: linear-gradient(45deg, #9b59b6, #8e44ad);">
                <div class="cv-name">${data.personal.fullName || 'Your Name'}</div>
                <div class="cv-profession">${data.personal.profession || 'Your Profession'}</div>
            </div>
            <div class="cv-content">
                <div class="cv-sidebar" style="background: #f9f0ff;">
                    ${data.personal.photo ? `
                        <div class="cv-photo">
                            <img src="${data.personal.photo}" alt="${data.personal.fullName || 'Your Name'}">
                        </div>
                    ` : ''}
                    
                    <div class="cv-section">
                        <div class="cv-section-title" style="border-bottom-color: #9b59b6;">Contact</div>
                        <div class="cv-contact">
                            <div><i class="fas fa-envelope"></i> ${data.personal.email || 'your.email@example.com'}</div>
                            <div><i class="fas fa-phone"></i> ${data.personal.phone || '+1 (555) 123-4567'}</div>
                            <div><i class="fas fa-map-marker-alt"></i> ${data.personal.address || 'City, Country'}</div>
                            ${data.personal.linkedin ? `<div><i class="fab fa-linkedin"></i> ${data.personal.linkedin}</div>` : ''}
                        </div>
                    </div>
                    
                    ${data.skills.length > 0 ? `
                    <div class="cv-section">
                        <div class="cv-section-title" style="border-bottom-color: #9b59b6;">Skills</div>
                        <div class="cv-skills">
                            ${data.skills.map(skill => `
                                <div class="skill-tag" style="background: #9b59b6;">${skill}</div>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                </div>
                
                <div class="cv-main">
                    <div class="cv-section">
                        <div class="cv-section-title" style="border-bottom-color: #9b59b6;">About Me</div>
                        <div class="cv-summary">${data.summary || 'Experienced professional with a proven track record of success...'}</div>
                    </div>
                    
                    ${data.experiences.length > 0 && data.experiences[0].title ? `
                    <div class="cv-section">
                        <div class="cv-section-title" style="border-bottom-color: #9b59b6;">Experience</div>
                        ${data.experiences.map(exp => `
                            <div class="cv-item">
                                <div class="cv-item-title">${exp.title}</div>
                                <div class="cv-item-subtitle" style="color: #9b59b6;">${exp.company} | ${formatDate(exp.start)} - ${formatDate(exp.end)}</div>
                                <p>${exp.description}</p>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                    
                    ${data.education.length > 0 && data.education[0].degree ? `
                    <div class="cv-section">
                        <div class="cv-section-title" style="border-bottom-color: #9b59b6;">Education</div>
                        ${data.education.map(edu => `
                            <div class="cv-item">
                                <div class="cv-item-title">${edu.degree}</div>
                                <div class="cv-item-subtitle" style="color: #9b59b6;">${edu.institution} | ${formatDate(edu.start)} - ${formatDate(edu.end)}</div>
                                <p>${edu.description}</p>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
}

function generateMinimalTemplate(data) {
    return `
        <div class="cv-template minimal">
            <div class="cv-header">
                <div class="cv-name">${data.personal.fullName || 'Your Name'}</div>
                <div class="cv-profession">${data.personal.profession || 'Your Profession'}</div>
            </div>
            <div class="cv-content">
                <div class="cv-section">
                    <div class="cv-section-title">Summary</div>
                    <div class="cv-summary">${data.summary || 'Experienced professional with a proven track record of success...'}</div>
                </div>
                
                ${data.experiences.length > 0 && data.experiences[0].title ? `
                <div class="cv-section">
                    <div class="cv-section-title">Experience</div>
                    ${data.experiences.map(exp => `
                        <div class="cv-item">
                            <div class="cv-item-title">${exp.title} - ${exp.company}</div>
                            <div class="cv-item-dates">${formatDate(exp.start)} - ${formatDate(exp.end)}</div>
                            <p>${exp.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.education.length > 0 && data.education[0].degree ? `
                <div class="cv-section">
                    <div class="cv-section-title">Education</div>
                    ${data.education.map(edu => `
                        <div class="cv-item">
                            <div class="cv-item-title">${edu.degree} - ${edu.institution}</div>
                            <div class="cv-item-dates">${formatDate(edu.start)} - ${formatDate(edu.end)}</div>
                            <p>${edu.description}</p>
                        </div>
                    `).join('')}
                </div>
                ` : ''}
                
                ${data.skills.length > 0 ? `
                <div class="cv-section">
                    <div class="cv-section-title">Skills</div>
                    <div class="cv-skills">
                        ${data.skills.map(skill => `
                            <div class="skill-tag">${skill}</div>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString || dateString === 'Present') return 'Present';
    
    const date = new Date(dateString + '-01');
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
}

// Enhanced Function to download CV
function downloadCV(format) {
    showNotification(`Preparing your CV download in ${format.toUpperCase()} format...`, 'info');
    
    switch(format) {
        case 'pdf':
            downloadAsPDF();
            break;
        case 'docx':
            downloadAsDOCX();
            break;
        case 'txt':
            downloadAsText();
            break;
    }
}

// Enhanced Function to download as PDF - Single Page
function downloadAsPDF() {
    const { jsPDF } = window.jspdf;
    
    // Get the CV preview element
    const element = document.getElementById('cvPreview');
    
    // Store original styles
    const originalWidth = element.style.width;
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    
    // Set A4 dimensions for PDF generation
    element.style.width = '794px';
    element.style.height = 'auto';
    element.style.overflow = 'visible';
    
    // Add single-page class to limit height
    element.classList.add('single-page');
    
    // Use html2canvas with optimized settings for single page
    html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 794,
        height: Math.min(element.scrollHeight, 1122),
        scrollX: 0,
        scrollY: 0,
        windowWidth: 794,
        windowHeight: Math.min(element.scrollHeight, 1122)
    }).then(canvas => {
        // Restore original styles
        element.style.width = originalWidth;
        element.style.height = originalHeight;
        element.style.overflow = originalOverflow;
        element.classList.remove('single-page');
        
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        const pdf = new jsPDF('p', 'mm', 'a4');
        
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        // Add the image to PDF (single page)
        pdf.addImage(imgData, 'JPEG', 0, 0, imgWidth, imgHeight);
        
        // Download the PDF
        const fileName = document.getElementById('fullName').value || 'My_CV';
        pdf.save(`${fileName.replace(/\s+/g, '_')}_CV.pdf`);
        
        showNotification('PDF downloaded successfully!', 'success');
        
    }).catch(error => {
        // Restore original styles in case of error
        element.style.width = originalWidth;
        element.style.height = originalHeight;
        element.style.overflow = originalOverflow;
        element.classList.remove('single-page');
        
        console.error('PDF generation error:', error);
        showNotification('Error generating PDF. Please try again.', 'error');
    });
}

// Function to download as DOCX
function downloadAsDOCX() {
    const formData = getFormData();
    const content = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${formData.personal.fullName} - CV</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 40px; }
                h1 { color: #2c3e50; margin-bottom: 5px; }
                h2 { color: #3498db; margin-top: 0; }
                .section { margin-bottom: 20px; }
                .section-title { border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-bottom: 10px; font-weight: bold; }
            </style>
        </head>
        <body>
            <h1>${formData.personal.fullName || 'Your Name'}</h1>
            <h2>${formData.personal.profession || 'Your Profession'}</h2>
            <p>${formData.personal.email || 'your.email@example.com'} | ${formData.personal.phone || '+1 (555) 123-4567'} | ${formData.personal.address || 'City, Country'}</p>
            
            <div class="section">
                <div class="section-title">PROFESSIONAL SUMMARY</div>
                <p>${formData.summary || 'Experienced professional with a proven track record of success...'}</p>
            </div>
            
            ${formData.experiences.length > 0 && formData.experiences[0].title ? `
            <div class="section">
                <div class="section-title">WORK EXPERIENCE</div>
                ${formData.experiences.map(exp => `
                    <div>
                        <p><strong>${exp.title}</strong> at ${exp.company} (${formatDate(exp.start)} - ${formatDate(exp.end)})</p>
                        <p>${exp.description}</p>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${formData.education.length > 0 && formData.education[0].degree ? `
            <div class="section">
                <div class="section-title">EDUCATION</div>
                ${formData.education.map(edu => `
                    <div>
                        <p><strong>${edu.degree}</strong> from ${edu.institution} (${formatDate(edu.start)} - ${formatDate(edu.end)})</p>
                        <p>${edu.description}</p>
                    </div>
                `).join('')}
            </div>
            ` : ''}
            
            ${formData.skills.length > 0 ? `
            <div class="section">
                <div class="section-title">SKILLS</div>
                <p>${formData.skills.join(', ')}</p>
            </div>
            ` : ''}
        </body>
        </html>
    `;
    
    const blob = new Blob([content], { 
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formData.personal.fullName || 'My'}_CV.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Word document downloaded!', 'success');
}

// Function to download as text
function downloadAsText() {
    const formData = getFormData();
    let textContent = `PROFESSIONAL CV\n`;
    textContent += `================\n\n`;
    textContent += `Name: ${formData.personal.fullName || 'Your Name'}\n`;
    textContent += `Profession: ${formData.personal.profession || 'Your Profession'}\n`;
    textContent += `Email: ${formData.personal.email || 'your.email@example.com'}\n`;
    textContent += `Phone: ${formData.personal.phone || '+1 (555) 123-4567'}\n`;
    textContent += `Address: ${formData.personal.address || 'City, Country'}\n\n`;
    
    textContent += `PROFESSIONAL SUMMARY\n`;
    textContent += `====================\n`;
    textContent += `${formData.summary || 'Experienced professional with a proven track record of success...'}\n\n`;
    
    if (formData.experiences.length > 0 && formData.experiences[0].title) {
        textContent += `WORK EXPERIENCE\n`;
        textContent += `===============\n`;
        formData.experiences.forEach(exp => {
            textContent += `${exp.title} at ${exp.company} (${formatDate(exp.start)} - ${formatDate(exp.end)})\n`;
            textContent += `${exp.description}\n\n`;
        });
    }
    
    if (formData.education.length > 0 && formData.education[0].degree) {
        textContent += `EDUCATION\n`;
        textContent += `=========\n`;
        formData.education.forEach(edu => {
            textContent += `${edu.degree} from ${edu.institution} (${formatDate(edu.start)} - ${formatDate(edu.end)})\n`;
            textContent += `${edu.description}\n\n`;
        });
    }
    
    if (formData.skills.length > 0) {
        textContent += `SKILLS\n`;
        textContent += `======\n`;
        formData.skills.forEach(skill => {
            textContent += `- ${skill}\n`;
        });
        textContent += `\n`;
    }
    
    // Create and download the text file
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Professional_CV.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Text file downloaded successfully!', 'success');
}
