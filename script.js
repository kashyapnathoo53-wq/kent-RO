document.addEventListener('DOMContentLoaded', () => {
    // ═══════════════════════════════════════════════════════════
    // 1. PAGE LOADER DISMISSAL
    // ═══════════════════════════════════════════════════════════
    const pageLoader = document.getElementById('pageLoader');
    const loaderBar = document.getElementById('loaderBar');
    if (loaderBar) {
        loaderBar.style.width = '100%';
        loaderBar.style.transition = 'width 0.4s ease';
    }
    setTimeout(() => {
        if (pageLoader) {
            pageLoader.classList.add('hidden');
            setTimeout(() => {
                pageLoader.style.display = 'none';
            }, 400);
        }
    }, 450);

    // ═══════════════════════════════════════════════════════════
    // 2. REAL-TIME NAVIGATION SCROLL SPY & ACCESSIBLE MOBILE DRAWER
    // ═══════════════════════════════════════════════════════════
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    const navBackdrop = document.getElementById('navBackdrop');
    const navLinks = navMenu ? Array.from(navMenu.querySelectorAll('a[href^="#"]')) : [];

    const closeMobileMenu = () => {
        if (!navMenu) return;
        navMenu.classList.remove('active');
        if (hamburger) {
            hamburger.classList.remove('active');
            hamburger.setAttribute('aria-expanded', 'false');
        }
        if (navBackdrop) navBackdrop.classList.remove('active');
        document.body.classList.remove('nav-menu-open');
    };

    const openMobileMenu = () => {
        if (!navMenu) return;
        navMenu.classList.add('active');
        if (hamburger) {
            hamburger.classList.add('active');
            hamburger.setAttribute('aria-expanded', 'true');
        }
        if (navBackdrop) navBackdrop.classList.add('active');
        document.body.classList.add('nav-menu-open');
    };

    const toggleMobileMenu = () => {
        if (navMenu && navMenu.classList.contains('active')) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    };

    const setActiveNav = (targetHref) => {
        navLinks.forEach(link => {
            if (link.getAttribute('href') === targetHref) {
                link.classList.add('nav-current', 'active');
            } else {
                link.classList.remove('nav-current', 'active');
            }
        });
    };

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
        if (navBackdrop) navBackdrop.addEventListener('click', closeMobileMenu);

        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                closeMobileMenu();
                const targetHref = link.getAttribute('href');
                if (targetHref) {
                    setActiveNav(targetHref);
                }
            });
        });
    }

    // Scroll spy section mapping from bottom to top
    const spySections = [
        { id: 'contact', nav: '#contact' },
        { id: 'faq', nav: '#social-proof' },
        { id: 'social-proof', nav: '#social-proof' },
        { id: 'book-demo', nav: '#book-demo' },
        { id: 'story', nav: '#story' },
        { id: 'product-browser', nav: '#product-browser' },
        { id: 'product-top', nav: '#product-top' }
    ];

    let ticking = false;
    const handleScrollSpy = () => {
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;
        const windowHeight = window.innerHeight;
        const docHeight = document.documentElement.scrollHeight;

        // Bottom of the page: highlight Contact
        if (windowHeight + scrollY >= docHeight - 80) {
            setActiveNav('#contact');
            return;
        }

        // Top of the page: highlight Home
        if (scrollY < 120) {
            setActiveNav('#product-top');
            return;
        }

        // Find active section from bottom to top
        const headerOffset = 160;
        for (let i = 0; i < spySections.length; i++) {
            const sec = document.getElementById(spySections[i].id);
            if (sec && (scrollY + headerOffset >= sec.offsetTop)) {
                setActiveNav(spySections[i].nav);
                return;
            }
        }

        setActiveNav('#product-top');
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                handleScrollSpy();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Initial check on load
    handleScrollSpy();

    // ═══════════════════════════════════════════════════════════
    // 3. PRODUCTS DATA LOOKUP
    // ═══════════════════════════════════════════════════════════
    const products = window.KENT_PRODUCTS || [];
    const productMap = new Map(products.map(p => [p.slug, p]));

    // Helper: Parse numerical price from string e.g. "₹17,499" -> 17499
    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        const num = priceStr.replace(/[^0-9]/g, '');
        return parseInt(num, 10) || 0;
    };

    // Helper: Format number to Indian Currency string e.g. 17499 -> "₹17,499"
    const formatPrice = (num) => {
        return '₹' + num.toLocaleString('en-IN');
    };

    // ═══════════════════════════════════════════════════════════
    // 4. TOAST NOTIFICATION SYSTEM
    // ═══════════════════════════════════════════════════════════
    const toastContainer = document.getElementById('toastContainer');
    const showToast = (message, iconSvg = '') => {
        if (!toastContainer) return;
        const toast = document.createElement('div');
        toast.className = 'toast-item';
        toast.innerHTML = `
            ${iconSvg ? `<span class="toast-icon">${iconSvg}</span>` : ''}
            <span>${message}</span>
        `;
        toastContainer.appendChild(toast);

        // Animate entrance
        requestAnimationFrame(() => {
            toast.classList.add('is-visible');
        });

        // Auto dismiss after 2.8s
        setTimeout(() => {
            toast.classList.remove('is-visible');
            setTimeout(() => {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 300);
        }, 2800);
    };

    // ═══════════════════════════════════════════════════════════
    // 5. CART STATE MANAGEMENT (WITH LOCALSTORAGE)
    // ═══════════════════════════════════════════════════════════
    let cart = []; // Array of { slug: string, qty: number }

    try {
        const savedCart = localStorage.getItem('kent_cart');
        if (savedCart) cart = JSON.parse(savedCart);
    } catch (e) {
        console.warn('Storage sync unavailable', e);
    }

    const saveState = () => {
        try {
            localStorage.setItem('kent_cart', JSON.stringify(cart));
        } catch (e) {}
    };

    // UI Badges
    const navCartCountEl = document.getElementById('navCartCount');
    const cartItemsCountText = document.getElementById('cartItemsCountText');
    const cartItemsList = document.getElementById('cartItemsList');
    const cartSubtotalEl = document.getElementById('cartSubtotal');

    const updateBadges = () => {
        const totalCartItems = cart.reduce((acc, item) => acc + item.qty, 0);
        if (navCartCountEl) navCartCountEl.textContent = totalCartItems;
        if (cartItemsCountText) cartItemsCountText.textContent = `${totalCartItems} item${totalCartItems === 1 ? '' : 's'}`;
    };

    // Render Cart Drawer Contents
    const renderCartUI = () => {
        if (!cartItemsList) return;

        if (cart.length === 0) {
            cartItemsList.innerHTML = `
                <div class="drawer-empty-state">
                    <div class="drawer-empty-icon">
                        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                    </div>
                    <h4>Your Cart is Empty</h4>
                    <p>Explore our pure water purifiers and add your favorite model to the cart.</p>
                </div>
            `;
            if (cartSubtotalEl) cartSubtotalEl.textContent = '₹0';
            return;
        }

        let subtotal = 0;
        cartItemsList.innerHTML = cart.map(item => {
            const prod = productMap.get(item.slug);
            if (!prod) return '';
            const itemPrice = parsePrice(prod.price);
            subtotal += itemPrice * item.qty;

            return `
                <article class="drawer-item-card" data-slug="${item.slug}">
                    <div class="drawer-item-media">
                        <img src="${prod.image}" alt="${prod.name}">
                    </div>
                    <div class="drawer-item-info">
                        <h4 class="drawer-item-title">${prod.name}</h4>
                        <div class="drawer-item-price">${prod.price}</div>
                        <div class="drawer-item-controls">
                            <div class="drawer-qty-pill">
                                <button type="button" class="drawer-qty-btn cart-qty-minus" data-slug="${item.slug}" aria-label="Decrease quantity">−</button>
                                <span class="drawer-qty-val">${item.qty}</span>
                                <button type="button" class="drawer-qty-btn cart-qty-plus" data-slug="${item.slug}" aria-label="Increase quantity">+</button>
                            </div>
                            <button type="button" class="drawer-item-remove cart-item-remove" data-slug="${item.slug}">Remove</button>
                        </div>
                    </div>
                </article>
            `;
        }).join('');

        if (cartSubtotalEl) cartSubtotalEl.textContent = formatPrice(subtotal);
    };

    // Cart Actions
    const addToCart = (slug, qty = 1) => {
        const prod = productMap.get(slug);
        if (!prod) return;

        const existing = cart.find(item => item.slug === slug);
        if (existing) {
            existing.qty += qty;
        } else {
            cart.push({ slug, qty });
        }
        saveState();
        updateBadges();
        renderCartUI();
        showToast(
            `<strong>${prod.name}</strong> added to cart!`,
            `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
        );
        openCartDrawer();
    };

    const updateCartQty = (slug, delta) => {
        const item = cart.find(i => i.slug === slug);
        if (!item) return;
        item.qty += delta;
        if (item.qty <= 0) {
            removeFromCart(slug);
            return;
        }
        saveState();
        updateBadges();
        renderCartUI();
    };

    const removeFromCart = (slug) => {
        cart = cart.filter(i => i.slug !== slug);
        saveState();
        updateBadges();
        renderCartUI();
        showToast('Item removed from cart.');
    };

    // ═══════════════════════════════════════════════════════════
    // 6. SLIDE-OVER CART DRAWER CONTROLLER
    // ═══════════════════════════════════════════════════════════
    const cartDrawer = document.getElementById('cartDrawer');
    const cartDrawerBackdrop = document.getElementById('cartDrawerBackdrop');
    const cartDrawerClose = document.getElementById('cartDrawerClose');
    const navCartBtn = document.getElementById('navCartBtn');

    const openCartDrawer = () => {
        if (!cartDrawer) return;
        renderCartUI();
        cartDrawer.classList.add('is-open');
        cartDrawer.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closeCartDrawer = () => {
        if (!cartDrawer) return;
        cartDrawer.classList.remove('is-open');
        cartDrawer.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
    };

    if (navCartBtn) navCartBtn.addEventListener('click', openCartDrawer);
    if (cartDrawerClose) cartDrawerClose.addEventListener('click', closeCartDrawer);
    if (cartDrawerBackdrop) cartDrawerBackdrop.addEventListener('click', closeCartDrawer);

    // Cart Drawer Click Delegation (qty & remove)
    if (cartItemsList) {
        cartItemsList.addEventListener('click', (e) => {
            const plusBtn = e.target.closest('.cart-qty-plus');
            if (plusBtn) {
                const slug = plusBtn.dataset.slug;
                updateCartQty(slug, 1);
                return;
            }
            const minusBtn = e.target.closest('.cart-qty-minus');
            if (minusBtn) {
                const slug = minusBtn.dataset.slug;
                updateCartQty(slug, -1);
                return;
            }
            const removeBtn = e.target.closest('.cart-item-remove');
            if (removeBtn) {
                const slug = removeBtn.dataset.slug;
                removeFromCart(slug);
                return;
            }
        });
    }

    // Checkout Button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) {
                showToast('Your cart is empty. Add a purifier first.');
                return;
            }
            closeCartDrawer();
            showToast('Redirecting to secure payment page...');
            setTimeout(() => {
                window.location.href = 'checkout.html';
            }, 400);
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 7. PRODUCT QUICK-VIEW MODAL (ONCE CLICKED PRODUCT CARD)
    // ═══════════════════════════════════════════════════════════
    const modalEl = document.getElementById('productModal');
    const modalBackdropEl = document.getElementById('productModalBackdrop');
    const modalCloseEl = document.getElementById('productModalClose');
    const modalImageEl = document.getElementById('modalImage');
    const modalBrandEl = document.getElementById('modalBrand');
    const modalTitleEl = document.getElementById('modalTitle');
    const modalTextEl = document.getElementById('modalText');
    const modalPriceEl = document.getElementById('modalPrice');
    const modalMrpEl = document.getElementById('modalMrp');
    const modalSaveEl = document.getElementById('modalSave');
    const modalFeaturesEl = document.getElementById('modalFeatures');
    const modalPillsEl = document.getElementById('modalPills');
    const modalBuyNowButtonEl = document.getElementById('modalBuyNowButton');
    const modalAmazonButtonEl = document.getElementById('modalAmazonButton');

    // Modal Commerce Controls
    const modalQtyVal = document.getElementById('modalQtyVal');
    const modalQtyMinus = document.getElementById('modalQtyMinus');
    const modalQtyPlus = document.getElementById('modalQtyPlus');
    const modalAddToCartBtn = document.getElementById('modalAddToCartBtn');

    let currentProduct = null;
    let modalSelectedQty = 1;

    if (modalQtyMinus) {
        modalQtyMinus.addEventListener('click', () => {
            if (modalSelectedQty > 1) {
                modalSelectedQty--;
                if (modalQtyVal) modalQtyVal.textContent = modalSelectedQty;
            }
        });
    }

    if (modalQtyPlus) {
        modalQtyPlus.addEventListener('click', () => {
            modalSelectedQty++;
            if (modalQtyVal) modalQtyVal.textContent = modalSelectedQty;
        });
    }

    if (modalAddToCartBtn) {
        modalAddToCartBtn.addEventListener('click', () => {
            if (currentProduct) {
                addToCart(currentProduct.slug, modalSelectedQty);
                closeModal();
            }
        });
    }

    const renderFeatureItems = (product) => {
        const specs = product.highlights || product.featureSpecs || [];
        if (!specs.length) {
            if (product.description) {
                return `<article class="detail-feature-item"><p>${product.description}</p></article>`;
            }
            return '';
        }
        return specs.map(item => `
            <article class="detail-feature-item">
                <p>${item}</p>
            </article>
        `).join('');
    };

    const renderPills = (product) => {
        return (product.metrics || []).slice(0, 3).map(item => `
            <span class="detail-pill">${item.value} ${item.label}</span>
        `).join('');
    };

    const openModal = (product) => {
        if (!product || !modalEl) return;
        currentProduct = product;
        modalSelectedQty = 1;
        if (modalQtyVal) modalQtyVal.textContent = '1';

        modalImageEl.src = product.image;
        modalImageEl.alt = product.alt || product.name;
        modalBrandEl.textContent = product.brand || 'KENT';
        modalTitleEl.textContent = product.name;
        modalTextEl.textContent = product.description || product.summary || '';
        
        // Price details
        if (modalPriceEl) modalPriceEl.textContent = product.price || '';
        if (modalMrpEl) modalMrpEl.textContent = product.mrp || '';
        if (modalSaveEl) modalSaveEl.textContent = product.save || '';

        modalFeaturesEl.innerHTML = renderFeatureItems(product);
        modalPillsEl.innerHTML = renderPills(product);
        if (modalBuyNowButtonEl) modalBuyNowButtonEl.href = product.officialUrl || 'https://www.kent.co.in/water-purifiers/ro/';
        if (modalAmazonButtonEl) modalAmazonButtonEl.href = product.amazonUrl || `https://www.amazon.in/s?k=${encodeURIComponent(product.name)}`;

        modalEl.style.display = 'flex';
        modalEl.classList.add('is-open');
        modalEl.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
    };

    const closeModal = () => {
        if (!modalEl) return;
        modalEl.classList.remove('is-open');
        modalEl.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        setTimeout(() => {
            if (!modalEl.classList.contains('is-open')) {
                modalEl.style.display = 'none';
            }
        }, 300);
        currentProduct = null;
    };

    // Product Card Click Delegation (Card Add to Cart and Card Click to Open Modal)
    const catalogGrid = document.getElementById('brandCatalogGrid');
    if (catalogGrid) {
        catalogGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.catalog-card');
            if (!card) return;
            const slug = card.dataset.productSlug;

            // If Add to Cart button was clicked
            const addCartBtn = e.target.closest('.catalog-card-cart-btn');
            if (addCartBtn) {
                e.stopPropagation();
                addToCart(slug, 1);
                return;
            }

            // Otherwise, open product modal
            const product = productMap.get(slug);
            if (product) {
                openModal(product);
            }
        });
    }

    if (modalCloseEl) modalCloseEl.addEventListener('click', closeModal);
    if (modalBackdropEl) modalBackdropEl.addEventListener('click', closeModal);

    // ═══════════════════════════════════════════════════════════
    // 8. INLINE BOOK A DEMO FORM HANDLER & VALIDATION (WITH CALENDAR)
    // ═══════════════════════════════════════════════════════════
    const inlineDemoForm = document.getElementById('inlineDemoForm');
    const inlineDemoSuccess = document.getElementById('inlineDemoSuccess');
    const inlineDemoResetBtn = document.getElementById('inlineDemoResetBtn');
    const demoPhoneInput = document.getElementById('demoPhone');
    const demoDateInput = document.getElementById('demoDate');
    const demoDatePreview = document.getElementById('demoDatePreview');
    const demoQuickChips = document.getElementById('demoQuickDateChips');

    // Helper: format Date object to YYYY-MM-DD
    function toISODate(d) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Helper: format date for readable display
    function formatDisplayDate(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const target = new Date(d);
        target.setHours(0, 0, 0, 0);

        const diffDays = Math.round((target - today) / (1000 * 60 * 60 * 24));
        const dayName = d.toLocaleDateString('en-IN', { weekday: 'short' });
        const dayNum = d.getDate();
        const monthName = d.toLocaleDateString('en-IN', { month: 'short' });

        if (diffDays === 0) return `Today (${dayName}, ${dayNum} ${monthName})`;
        if (diffDays === 1) return `Tomorrow (${dayName}, ${dayNum} ${monthName})`;
        return `${dayName}, ${dayNum} ${monthName}`;
    }

    // Initialize Calendar Date Picker & Quick Day Chips
    function initDemoDatePicker() {
        if (!demoDateInput) return;

        const now = new Date();
        const todayStr = toISODate(now);

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = toISODate(tomorrow);

        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 30);
        const maxStr = toISODate(maxDate);

        demoDateInput.min = todayStr;
        demoDateInput.max = maxStr;
        demoDateInput.value = tomorrowStr;

        if (demoDatePreview) {
            demoDatePreview.textContent = formatDisplayDate(tomorrowStr);
        }

        // Generate next 6 days quick chips
        if (demoQuickChips) {
            demoQuickChips.innerHTML = '';
            for (let i = 0; i <= 5; i++) {
                const cur = new Date();
                cur.setDate(cur.getDate() + i);
                const isoStr = toISODate(cur);

                const chip = document.createElement('button');
                chip.type = 'button';
                chip.className = 'demo-date-chip' + (isoStr === tomorrowStr ? ' is-active' : '');
                chip.dataset.date = isoStr;

                const dayLabel = i === 0 ? 'Today' : (i === 1 ? 'Tomorrow' : cur.toLocaleDateString('en-IN', { weekday: 'short' }));
                const dateLabel = `${cur.getDate()} ${cur.toLocaleDateString('en-IN', { month: 'short' })}`;

                chip.innerHTML = `<strong>${dayLabel}</strong><span>${dateLabel}</span>`;
                chip.setAttribute('aria-label', `Select ${dayLabel}, ${dateLabel}`);

                chip.addEventListener('click', () => {
                    demoDateInput.value = isoStr;
                    document.querySelectorAll('.demo-date-chip').forEach(c => c.classList.remove('is-active'));
                    chip.classList.add('is-active');
                    if (demoDatePreview) {
                        demoDatePreview.textContent = formatDisplayDate(isoStr);
                    }
                    const err = document.getElementById('dateError');
                    if (err) err.textContent = '';
                });

                demoQuickChips.appendChild(chip);
            }
        }

        // When user interacts with the calendar picker input directly:
        demoDateInput.addEventListener('change', () => {
            const val = demoDateInput.value;
            if (demoDatePreview) {
                demoDatePreview.textContent = formatDisplayDate(val);
            }
            // Update active state on chips
            if (demoQuickChips) {
                document.querySelectorAll('.demo-date-chip').forEach(chip => {
                    if (chip.dataset.date === val) {
                        chip.classList.add('is-active');
                    } else {
                        chip.classList.remove('is-active');
                    }
                });
            }
            const err = document.getElementById('dateError');
            if (err) err.textContent = '';
        });
    }

    initDemoDatePicker();

    // Strict 10-digit mobile enforcement on demo form
    if (demoPhoneInput) {
        demoPhoneInput.addEventListener('keydown', (e) => {
            const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End', 'Enter'];
            if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
            if (!/^[0-9]$/.test(e.key)) {
                e.preventDefault();
                return;
            }
            const sel = (demoPhoneInput.selectionEnd || 0) - (demoPhoneInput.selectionStart || 0);
            if (demoPhoneInput.value.replace(/\D/g, '').length >= 10 && sel === 0) {
                e.preventDefault();
            }
        });

        demoPhoneInput.addEventListener('input', () => {
            let digits = demoPhoneInput.value.replace(/\D/g, '');
            if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
            else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
            demoPhoneInput.value = digits.slice(0, 10);
            const err = document.getElementById('phoneError');
            if (err) err.textContent = '';
        });

        demoPhoneInput.addEventListener('paste', (e) => {
            e.preventDefault();
            const text = (e.clipboardData || window.clipboardData)?.getData('text') || '';
            let digits = text.replace(/\D/g, '');
            if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
            else if (digits.length === 11 && digits.startsWith('0')) digits = digits.slice(1);
            const start = demoPhoneInput.selectionStart || 0;
            const end = demoPhoneInput.selectionEnd || 0;
            const cur = demoPhoneInput.value;
            const comb = (cur.slice(0, start) + digits + cur.slice(end)).replace(/\D/g, '');
            demoPhoneInput.value = comb.slice(0, 10);
            demoPhoneInput.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }

    if (inlineDemoForm) {
        inlineDemoForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const fullNameInput = document.getElementById('demoFullName');
            const phoneInput = document.getElementById('demoPhone');
            const addressInput = document.getElementById('demoAddress');
            const cityInput = document.getElementById('demoCityPincode');
            const dateInput = document.getElementById('demoDate');
            const phoneError = document.getElementById('phoneError');
            const fullNameError = document.getElementById('fullNameError');
            const addressError = document.getElementById('addressError');
            const cityError = document.getElementById('cityPincodeError');
            const dateError = document.getElementById('dateError');

            let isValid = true;
            if (phoneError) phoneError.textContent = '';
            if (fullNameError) fullNameError.textContent = '';
            if (addressError) addressError.textContent = '';
            if (cityError) cityError.textContent = '';
            if (dateError) dateError.textContent = '';

            // Name validation
            if (!fullNameInput || !fullNameInput.value.trim()) {
                if (fullNameError) fullNameError.textContent = 'Please enter your full name';
                if (fullNameInput) fullNameInput.focus();
                isValid = false;
            }

            // Phone validation
            if (phoneInput) {
                const phoneDigits = phoneInput.value.trim().replace(/\D/g, '');
                if (phoneDigits.length !== 10 || !/^[6-9]\d{9}$/.test(phoneDigits)) {
                    if (phoneError) phoneError.textContent = 'Please enter a valid 10-digit Indian mobile number';
                    if (isValid) phoneInput.focus();
                    isValid = false;
                }
            }

            // Address validation
            if (!addressInput || !addressInput.value.trim()) {
                if (addressError) addressError.textContent = 'Please enter your doorstep address';
                if (isValid && addressInput) addressInput.focus();
                isValid = false;
            }

            // City/Pincode validation
            if (!cityInput || !cityInput.value.trim()) {
                if (cityError) cityError.textContent = 'Please enter your city or pincode';
                if (isValid && cityInput) cityInput.focus();
                isValid = false;
            }

            // Date validation
            if (!dateInput || !dateInput.value) {
                if (dateError) dateError.textContent = 'Please select a preferred demo date';
                if (isValid && dateInput) dateInput.focus();
                isValid = false;
            }

            if (!isValid) return;

            const submitBtn = document.getElementById('inlineDemoSubmitBtn');
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<span>Scheduling your demo...</span>';
            }

            setTimeout(() => {
                const selectedSlot = document.querySelector('input[name="demoSlot"]:checked')?.value || 'morning';
                const slotMap = {
                    morning: 'Morning Slot (9:00 AM – 1:00 PM)',
                    afternoon: 'Afternoon Slot (1:00 PM – 5:00 PM)',
                    evening: 'Evening Slot (5:00 PM – 8:00 PM)'
                };
                const formattedDate = formatDisplayDate(dateInput.value) || dateInput.value;
                const successDesc = document.getElementById('inlineDemoSuccessDesc');
                if (successDesc) {
                    successDesc.textContent = `Thank you! Your free doorstep demo is booked for ${formattedDate} during the ${slotMap[selectedSlot]}. Our certified water technician will call you shortly to verify your visit.`;
                }

                inlineDemoForm.style.display = 'none';
                if (inlineDemoSuccess) {
                    inlineDemoSuccess.style.display = 'block';
                    inlineDemoSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                showToast(
                    '<strong>Free Demo scheduled!</strong> Our team will contact you shortly.',
                    '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
                );
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.innerHTML = `
                        <span>Schedule My Free Demo</span>
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    `;
                }
            }, 600);
        });
    }

    if (inlineDemoResetBtn) {
        inlineDemoResetBtn.addEventListener('click', () => {
            if (inlineDemoForm) {
                inlineDemoForm.reset();
                initDemoDatePicker();
                inlineDemoForm.style.display = 'block';
            }
            if (inlineDemoSuccess) inlineDemoSuccess.style.display = 'none';
        });
    }

    // Escape key closes modals, mobile drawer, and cart drawer
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (navMenu && navMenu.classList.contains('active')) closeMobileMenu();
            if (modalEl && modalEl.classList.contains('is-open')) closeModal();
            if (cartDrawer && cartDrawer.classList.contains('is-open')) closeCartDrawer();
        }
    });

    // ═══════════════════════════════════════════════════════════
    // 9. STORY FEATURE SLIDESHOW WITH LEFT & RIGHT NAVIGATION
    // ═══════════════════════════════════════════════════════════
    const showcaseImages = [
        'https://www.kent.co.in/cdn/shop/files/Grand-IoT-400.png',
        'images/kent-supreme-plus.webp',
        'images/kent-pearl-left.webp',
        'https://www.kent.co.in/cdn/shop/files/kent-new-grand-info-1.webp',
        'https://www.kent.co.in/cdn/shop/files/kent-sterling-iot-1.webp'
    ];
    const showcaseDotsEl = document.getElementById('detailShowcaseDots');
    const showcaseImageEl = document.getElementById('detailShowcaseImage');
    const showcasePrevBtn = document.getElementById('showcasePrev');
    const showcaseNextBtn = document.getElementById('showcaseNext');
    let currentShowcaseIdx = 0;

    const goToShowcaseSlide = (idx) => {
        currentShowcaseIdx = (idx + showcaseImages.length) % showcaseImages.length;
        if (showcaseImageEl) {
            showcaseImageEl.style.opacity = '0.3';
            showcaseImageEl.style.transform = 'scale(0.96)';
            showcaseImageEl.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
            setTimeout(() => {
                showcaseImageEl.src = showcaseImages[currentShowcaseIdx];
                showcaseImageEl.style.opacity = '1';
                showcaseImageEl.style.transform = 'scale(1)';
            }, 120);
        }
        renderShowcaseDots();
    };

    const renderShowcaseDots = () => {
        if (!showcaseDotsEl) return;
        showcaseDotsEl.innerHTML = showcaseImages.map((_, i) => `
            <button type="button" class="detail-showcase-dot${i === currentShowcaseIdx ? ' is-active' : ''}" aria-label="Show slide ${i + 1}" aria-current="${i === currentShowcaseIdx}"></button>
        `).join('');

        showcaseDotsEl.querySelectorAll('.detail-showcase-dot').forEach((dot, i) => {
            dot.addEventListener('click', () => {
                goToShowcaseSlide(i);
            });
        });
    };
    renderShowcaseDots();

    // Hook up Previous and Next buttons (bottom controls)
    const prevSlideHandler = () => goToShowcaseSlide(currentShowcaseIdx - 1);
    const nextSlideHandler = () => goToShowcaseSlide(currentShowcaseIdx + 1);

    if (showcasePrevBtn) showcasePrevBtn.addEventListener('click', prevSlideHandler);
    if (showcaseNextBtn) showcaseNextBtn.addEventListener('click', nextSlideHandler);

    // Keyboard navigation when hovering or focusing on the showcase
    const showcaseTrackEl = document.querySelector('[data-showcase-slideshow]');
    if (showcaseTrackEl) {
        showcaseTrackEl.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                prevSlideHandler();
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                nextSlideHandler();
            }
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 9.5 HERO PURIFIER STAGE CAROUSEL (CLEAN SLIDER WITH ARROWS)
    // ═══════════════════════════════════════════════════════════
    const heroStageTrack = document.getElementById('heroStageTrack');
    const heroStagePrev = document.getElementById('heroStagePrev');
    const heroStageNext = document.getElementById('heroStageNext');

    if (heroStageTrack && heroStagePrev && heroStageNext) {
        heroStagePrev.addEventListener('click', () => {
            heroStageTrack.scrollBy({ left: -360, behavior: 'smooth' });
        });
        heroStageNext.addEventListener('click', () => {
            heroStageTrack.scrollBy({ left: 360, behavior: 'smooth' });
        });

        // Mouse Drag-to-Scroll support
        let isHeroDown = false;
        let heroStartX = 0;
        let heroScrollLeft = 0;

        heroStageTrack.addEventListener('mousedown', (e) => {
            isHeroDown = true;
            heroStageTrack.style.cursor = 'grabbing';
            heroStageTrack.style.scrollBehavior = 'auto';
            heroStartX = e.pageX - heroStageTrack.offsetLeft;
            heroScrollLeft = heroStageTrack.scrollLeft;
        });

        heroStageTrack.addEventListener('mouseleave', () => {
            if (isHeroDown) {
                isHeroDown = false;
                heroStageTrack.style.cursor = 'grab';
                heroStageTrack.style.scrollBehavior = 'smooth';
            }
        });

        heroStageTrack.addEventListener('mouseup', () => {
            if (isHeroDown) {
                isHeroDown = false;
                heroStageTrack.style.cursor = 'grab';
                heroStageTrack.style.scrollBehavior = 'smooth';
            }
        });

        heroStageTrack.addEventListener('mousemove', (e) => {
            if (!isHeroDown) return;
            e.preventDefault();
            const x = e.pageX - heroStageTrack.offsetLeft;
            const walk = (x - heroStartX) * 1.5;
            heroStageTrack.scrollLeft = heroScrollLeft - walk;
        });
    }

    // ═══════════════════════════════════════════════════════════
    // 10. CUSTOMER REVIEWS AUTO-SCROLL (LEFT TO RIGHT EVERY 2s)
    // ═══════════════════════════════════════════════════════════
    const reviewsTrack = document.getElementById('customerReviewsTrack');
    const scrollPrevBtn = document.getElementById('reviewScrollPrev');
    const scrollNextBtn = document.getElementById('reviewScrollNext');

    if (reviewsTrack) {
        const getScrollStep = () => {
            const firstCard = reviewsTrack.querySelector('.review-carousel-card');
            return firstCard ? firstCard.offsetWidth + 20 : 370;
        };

        const scrollNext = () => {
            const maxScroll = reviewsTrack.scrollWidth - reviewsTrack.clientWidth;
            if (reviewsTrack.scrollLeft >= maxScroll - 15) {
                reviewsTrack.scrollTo({ left: 0, behavior: 'smooth' });
            } else {
                reviewsTrack.scrollBy({ left: getScrollStep(), behavior: 'smooth' });
            }
        };

        const scrollPrev = () => {
            if (reviewsTrack.scrollLeft <= 15) {
                reviewsTrack.scrollTo({ left: reviewsTrack.scrollWidth, behavior: 'smooth' });
            } else {
                reviewsTrack.scrollBy({ left: -getScrollStep(), behavior: 'smooth' });
            }
        };

        if (scrollPrevBtn) {
            scrollPrevBtn.addEventListener('click', () => {
                scrollPrev();
                resetAutoScroll();
            });
        }
        if (scrollNextBtn) {
            scrollNextBtn.addEventListener('click', () => {
                scrollNext();
                resetAutoScroll();
            });
        }

        // Auto-scroll every 2 seconds
        let autoScrollTimer = null;
        const startAutoScroll = () => {
            if (!autoScrollTimer) {
                autoScrollTimer = setInterval(scrollNext, 2000);
            }
        };

        const stopAutoScroll = () => {
            if (autoScrollTimer) {
                clearInterval(autoScrollTimer);
                autoScrollTimer = null;
            }
        };

        const resetAutoScroll = () => {
            stopAutoScroll();
            startAutoScroll();
        };

        startAutoScroll();

        // Pause on hover or touch so users can read comfortably
        reviewsTrack.addEventListener('mouseenter', stopAutoScroll);
        reviewsTrack.addEventListener('mouseleave', startAutoScroll);
        reviewsTrack.addEventListener('touchstart', stopAutoScroll, { passive: true });
        reviewsTrack.addEventListener('touchend', startAutoScroll, { passive: true });
    }

    // ═══════════════════════════════════════════════════════════
    // 11. NAVBAR SEARCH BAR (LIVE SEARCH & FILTER)
    // ═══════════════════════════════════════════════════════════
    const navSearchInput = document.getElementById('navSearchInput');
    const navSearchClear = document.getElementById('navSearchClear');
    const navSearchDropdown = document.getElementById('navSearchDropdown');
    const navSearchForm = document.getElementById('navSearchForm');

    if (navSearchInput && navSearchDropdown) {
        const catalogCards = document.querySelectorAll('.catalog-card');

        const filterCatalogCards = (query) => {
            const q = query.trim().toLowerCase();
            catalogCards.forEach(card => {
                if (!q) {
                    card.style.display = '';
                    return;
                }
                const slug = card.getAttribute('data-product-slug') || '';
                const p = productMap.get(slug);
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const desc = card.querySelector('p')?.textContent.toLowerCase() || '';
                const cat = (p?.category || '').toLowerCase();
                const matches = title.includes(q) || desc.includes(q) || cat.includes(q) || slug.includes(q);
                card.style.display = matches ? '' : 'none';
            });
        };

        const renderSearchResults = (query) => {
            const q = query.trim().toLowerCase();
            if (!q) {
                navSearchDropdown.style.display = 'none';
                navSearchDropdown.innerHTML = '';
                if (navSearchClear) navSearchClear.style.display = 'none';
                filterCatalogCards('');
                return;
            }

            if (navSearchClear) navSearchClear.style.display = 'inline-flex';
            filterCatalogCards(q);

            const matches = products.filter(p => {
                const nameMatch = (p.name || '').toLowerCase().includes(q);
                const catMatch = (p.category || '').toLowerCase().includes(q);
                const descMatch = (p.shortDesc || '').toLowerCase().includes(q);
                const featMatch = (p.features || []).some(f => f.toLowerCase().includes(q));
                return nameMatch || catMatch || descMatch || featMatch;
            });

            if (matches.length === 0) {
                navSearchDropdown.innerHTML = `<div class="nav-search-empty">No purifiers found for "<strong>${escapeHtml(query)}</strong>"</div>`;
            } else {
                navSearchDropdown.innerHTML = matches.map(p => `
                    <div class="nav-search-item" data-slug="${p.slug}" tabindex="0" role="button">
                        <img class="nav-search-item-thumb" src="${p.image}" alt="${escapeHtml(p.name)}" loading="lazy">
                        <div class="nav-search-item-info">
                            <div class="nav-search-item-title">${escapeHtml(p.name)}</div>
                            <div class="nav-search-item-meta">
                                <span class="nav-search-item-price">${p.price}</span>
                                <span class="nav-search-item-cat">${escapeHtml(p.category)}</span>
                            </div>
                        </div>
                    </div>
                `).join('');

                navSearchDropdown.querySelectorAll('.nav-search-item').forEach(item => {
                    item.addEventListener('click', () => {
                        const slug = item.getAttribute('data-slug');
                        const p = productMap.get(slug);
                        navSearchDropdown.style.display = 'none';
                        if (p) {
                            openProductModal(p);
                        }
                    });
                });
            }

            navSearchDropdown.style.display = 'block';
        };

        navSearchInput.addEventListener('input', (e) => {
            renderSearchResults(e.target.value);
        });

        navSearchInput.addEventListener('focus', () => {
            if (navSearchInput.value.trim()) {
                renderSearchResults(navSearchInput.value);
            }
        });

        if (navSearchClear) {
            navSearchClear.addEventListener('click', () => {
                navSearchInput.value = '';
                renderSearchResults('');
                navSearchInput.focus();
            });
        }

        if (navSearchForm) {
            navSearchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                navSearchDropdown.style.display = 'none';
                const productBrowser = document.getElementById('product-browser');
                if (productBrowser) {
                    productBrowser.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#navSearchWrapper')) {
                navSearchDropdown.style.display = 'none';
            }
        });
    }

    // Initialize badges on load
    updateBadges();
});
