const init = () => {
  /* --- Theme Toggle (Dark/Light) --- */
  const themeToggle = document.getElementById('themeToggle');
  
  // Check for saved theme or system preference
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('theme');
  } catch (e) {
    console.warn('localStorage theme read failed:', e);
  }
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else if (systemPrefersDark) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const targetTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', targetTheme);
      try {
        localStorage.setItem('theme', targetTheme);
      } catch (e) {
        console.warn('localStorage theme write failed:', e);
      }
    });
  }

  /* --- RTL Toggle --- */
  const rtlToggle = document.getElementById('rtlToggle');
  
  let savedDir = null;
  try {
    savedDir = localStorage.getItem('dir');
  } catch (e) {
    console.warn('localStorage dir read failed:', e);
  }
  if (savedDir) {
    document.documentElement.setAttribute('dir', savedDir);
  }

  if (rtlToggle) {
    rtlToggle.addEventListener('click', () => {
      const currentDir = document.documentElement.getAttribute('dir');
      const targetDir = currentDir === 'rtl' ? 'ltr' : 'rtl';
      
      document.documentElement.setAttribute('dir', targetDir);
      try {
        localStorage.setItem('dir', targetDir);
      } catch (e) {
        console.warn('localStorage dir write failed:', e);
      }
    });
  }

  /* --- Mobile Menu Toggle --- */
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('is-open');
    });
  }

  /* --- Navbar Scroll Effect --- */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.classList.add('header-scrolled');
      } else {
        header.classList.remove('header-scrolled');
      }
    });
  }

  /* --- Cart Storage Helpers --- */
  const getCart = () => {
    let cart = [];
    
    // 1. Try reading from localStorage
    try {
      const storage = localStorage.getItem('cart');
      if (storage) {
        cart = JSON.parse(storage) || [];
      }
    } catch (error) {
      console.warn('localStorage read failed, falling back to window.name.', error);
    }
    
    // 2. If empty or failed, try reading from window.name (for file:// protocol cross-page sync)
    if (!Array.isArray(cart) || cart.length === 0) {
      try {
        const nameVal = window.name;
        if (nameVal && nameVal.startsWith('apothecary_cart:')) {
          const jsonStr = nameVal.substring('apothecary_cart:'.length);
          cart = JSON.parse(jsonStr) || [];
        }
      } catch (error) {
        console.warn('window.name read failed.', error);
      }
    }
    
    if (Array.isArray(cart)) {
      return cart.filter(item => item && typeof item === 'object' && item.name && item.price);
    }
    return [];
  };

  const saveCart = (cart) => {
    const cartArr = Array.isArray(cart) ? cart : [];
    
    // 1. Write to localStorage
    try {
      localStorage.setItem('cart', JSON.stringify(cartArr));
    } catch (error) {
      console.warn('localStorage write failed.', error);
    }
    
    // 2. Write to window.name for cross-directory sync under file:// protocol
    try {
      window.name = 'apothecary_cart:' + JSON.stringify(cartArr);
    } catch (error) {
      console.warn('window.name write failed.', error);
    }
  };

  const parsePrice = (text) => {
    if (!text) return null;
    const cleaned = text.replace(/[^0-9\.]/g, '');
    const match = cleaned.match(/\d+(?:\.\d+)?/);
    return match ? parseFloat(match[0]) : null;
  };

  const findProductDetails = (button) => {
    const datasetName = button.dataset.product?.trim();
    const datasetPrice = button.dataset.price?.trim();
    if (datasetName && datasetPrice) {
      return { name: datasetName, price: parseFloat(datasetPrice).toFixed(2) };
    }

    const container = button.closest('.product-card, .card, .product-info, .card-content, .product-details, .product-block, section, article, .container');
    const nameEl = container?.querySelector('h1, h2, h3, .product-title, .card-title, .title, .product-name, .product-heading');
    const priceEl = Array.from(container?.querySelectorAll('p, span, div') || [])
      .find(el => /\$\s*\d/.test(el.textContent));

    const name = datasetName || nameEl?.textContent?.trim();
    const price = datasetPrice || parsePrice(priceEl?.textContent);
    if (!name || !price) return null;

    return { name, price: price.toFixed(2) };
  };

  const addProductToCart = ({ name, price }) => {
    const cart = getCart();
    const existing = cart.find(item => item.name === name);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ name, price, quantity: 1 });
    }
    saveCart(cart);
  };

  const ensureCartToastStyles = () => {
    if (document.getElementById('cart-toast-animations')) return;
    const style = document.createElement('style');
    style.id = 'cart-toast-animations';
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(400px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(400px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  };

  const showCartToast = (message) => {
    ensureCartToastStyles();
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--color-primary);
      color: white;
      padding: 12px 20px;
      border-radius: 4px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 1800);
  };

  document.body.addEventListener('click', (e) => {
    const source = e.target instanceof Element ? e.target : e.target?.parentElement;
    const button = source?.closest('button[data-add-to-cart], button.add-to-cart-btn');
    if (!button) return;

    const buttonText = button.textContent?.trim().toLowerCase();
    const isCartButton = button.dataset.addToCart === 'true' || button.classList.contains('add-to-cart-btn') || buttonText === 'add to cart' || buttonText === 'add';
    if (!isCartButton) return;

    const product = findProductDetails(button);
    if (!product) return;

    addProductToCart(product);
    console.info('Cart add:', product, getCart());
    showCartToast(`${product.name} added to cart!`);

    if (buttonText === 'add') {
      const originalText = button.textContent;
      const originalBg = button.style.background;
      button.textContent = '✓ Added';
      button.style.background = 'var(--color-primary-hover)';
      setTimeout(() => {
        button.textContent = originalText;
        button.style.background = originalBg;
      }, 1500);
    }
  });

  /* --- Modal Functionality --- */
  // Open modal
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-trigger')) {
      const modalId = e.target.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }
  });

  // Close modal
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-close')) {
      const modal = e.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    }
  });

  // Close modal on background click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.remove('active');
      document.body.style.overflow = 'auto';
    }
  });

  // Close modal on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal.active');
      if (activeModal) {
        activeModal.classList.remove('active');
        document.body.style.overflow = 'auto';
      }
    }
  });

  /* --- Accordion Functionality --- */
  document.addEventListener('click', (e) => {
    const header = e.target.closest('.accordion-header');
    if (header) {
      const accordionItem = header.closest('.accordion-item');
      if (!accordionItem) return;

      const accordionBody = accordionItem.querySelector('.accordion-body');
      if (!accordionBody) return;

      // Close other items in the same accordion
      const accordion = accordionItem.closest('.accordion');
      if (accordion) {
        accordion.querySelectorAll('.accordion-header').forEach(h => {
          if (h !== header) {
            h.classList.remove('active');
            const item = h.closest('.accordion-item');
            if (item) {
              const body = item.querySelector('.accordion-body');
              if (body) body.classList.remove('active');
            }
          }
        });
      }

      // Toggle current item
      header.classList.toggle('active');
      accordionBody.classList.toggle('active');
    }
  });

  /* --- Initialize AOS (Animate on Scroll) --- */
  if (typeof AOS !== 'undefined') {
    AOS.init({
      duration: 800,
      once: true,
      offset: 100,
      easing: 'ease-out-cubic'
    });
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
