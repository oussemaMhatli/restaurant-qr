(() => {

  /* ══════════════════════════════════════════
     CONFIG — replace with your Apps Script URL
  ══════════════════════════════════════════ */
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwAhTYKHnkLLPIAhZgw-M-aSs_HGDzUGS09lbvARgq6q6ktgYu0Fryl50SjyjLAeNJu/exec';

  /* ══════════════════════════════════════════
     SCROLL ANIMATIONS
  ══════════════════════════════════════════ */
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.12 }
  );
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
  window.addEventListener('load', () => {
    document.querySelectorAll('.hero-content .fade-up, .hero-food-img.fade-up')
      .forEach(el => el.classList.add('visible'));
  });

  /* ══════════════════════════════════════════
     MENU CATEGORY TABS
  ══════════════════════════════════════════ */
  document.querySelectorAll('.menu-category-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.menu-category-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.menu-category').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(this.getAttribute('data-category')).classList.add('active');
    });
  });

  /* ══════════════════════════════════════════
     INGREDIENTS TOGGLE
  ══════════════════════════════════════════ */
  window.toggleIngredients = function (button) {
    const card = button.closest('.food-card');
    const ingredients = card.querySelector('.food-card-ingredients');
    if (ingredients.classList.contains('visible')) {
      ingredients.classList.remove('visible');
      button.innerText = 'Ingrédients';
    } else {
      ingredients.classList.add('visible');
      button.innerText = 'Masquer';
    }
  };

  /* ══════════════════════════════════════════
     CART STATE
  ══════════════════════════════════════════ */
  let cart = [];   // [{ name, price, qty }]

  function getCartTotal() {
    return cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  function updateCartBadge() {
    const total = cart.reduce((sum, i) => sum + i.qty, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
      badge.textContent = total;
      badge.style.display = total > 0 ? 'flex' : 'none';
    }
  }

  function parsePrice(priceStr) {
    // "10.000 TND" → 10.0
    return parseFloat(priceStr.replace(/[^\d.]/g, '')) || 0;
  }

  function addToCart(name, priceStr) {
    const price = parsePrice(priceStr);
    const existing = cart.find(i => i.name === name);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ name, price, qty: 1 });
    }
    updateCartBadge();
    refreshCartModal();
    showCartToast(`${name} ajouté au panier`);
    // mark card button as in-cart
    updateAddButtons();
  }

  function removeFromCart(name) {
    cart = cart.filter(i => i.name !== name);
    updateCartBadge();
    refreshCartModal();
    updateAddButtons();
  }

  function changeQty(name, delta) {
    const item = cart.find(i => i.name === name);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(name);
    else {
      updateCartBadge();
      refreshCartModal();
    }
  }

  function updateAddButtons() {
    document.querySelectorAll('.btn-add').forEach(btn => {
      const card = btn.closest('.food-card');
      if (!card) return;
      const nameEl = card.querySelector('.food-card-name');
      if (!nameEl) return;
      const name = nameEl.textContent.trim();
      const inCart = cart.some(i => i.name === name);
      if (inCart) {
        btn.classList.add('in-cart');
        btn.innerHTML = '<i class="bi bi-check-lg"></i>';
        btn.title = 'Déjà dans le panier';
      } else {
        btn.classList.remove('in-cart');
        btn.innerHTML = '<i class="bi bi-plus"></i>';
        btn.title = 'Ajouter au panier';
      }
    });
  }

  /* ── Add-to-cart button click ── */
  document.addEventListener('click', function (e) {
    const btn = e.target.closest('.btn-add');
    if (!btn) return;
    const card = btn.closest('.food-card');
    if (!card) return;
    const name = card.querySelector('.food-card-name')?.textContent.trim();
    const priceStr = card.querySelector('.food-price')?.textContent.trim();
    if (!name || !priceStr) return;

    const inCart = cart.some(i => i.name === name);
    if (inCart) {
      openCartModal();
    } else {
      addToCart(name, priceStr);
    }
  });

  /* ══════════════════════════════════════════
     CART MODAL
  ══════════════════════════════════════════ */
  function refreshCartModal() {
    const cartItems = document.getElementById('cartItems');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartTotalSection = document.getElementById('cartTotalSection');
    const orderForm = document.getElementById('orderForm');
    const cartTotal = document.getElementById('cartTotal');

    if (!cartItems || !cartEmpty) return;

    if (cart.length === 0) {
      cartItems.classList.remove('has-items');
      cartItems.innerHTML = '';
      cartEmpty.style.display = 'block';
      if (cartTotalSection) cartTotalSection.style.display = 'none';
      if (orderForm) orderForm.style.display = 'none';
      return;
    }

    // Hide empty message and show items/total/form
    cartEmpty.style.display = 'none';
    cartItems.classList.add('has-items');
    if (cartTotalSection) cartTotalSection.style.display = 'block';
    if (orderForm) orderForm.style.display = 'block';

    // Render cart items
    let html = '';
    cart.forEach(item => {
      const subtotal = (item.price * item.qty).toFixed(3);
      html += `
        <div class="cart-item">
          <div class="cart-item-info">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">${item.price.toFixed(3)} TND × ${item.qty}</div>
          </div>
          <div class="cart-item-qty">
            <button class="btn-qty" onclick="window.changeCartQty('${item.name}', -1)"><i class="bi bi-dash"></i></button>
            <span>${item.qty}</span>
            <button class="btn-qty" onclick="window.changeCartQty('${item.name}', 1)"><i class="bi bi-plus"></i></button>
          </div>
          <button class="btn-remove" onclick="window.removeCartItem('${item.name}')"><i class="bi bi-trash"></i></button>
        </div>`;
    });
    cartItems.innerHTML = html;

    // Update total
    if (cartTotal) cartTotal.textContent = getCartTotal().toFixed(3) + ' TND';
  }

  window.changeCartQty = function (name, delta) { changeQty(name, delta); };
  window.removeCartItem = function (name) { removeFromCart(name); };

  window.openCartModal = function () {
    refreshCartModal();
    const modal = document.getElementById('cartModal');
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
  };

  window.closeCartModal = function () {
    const modal = document.getElementById('cartModal');
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
  };

  document.addEventListener('click', function (e) {
    const modal = document.getElementById('cartModal');
    if (modal && e.target === modal) window.closeCartModal();
  });

  /* ══════════════════════════════════════════
     CART TOAST
  ══════════════════════════════════════════ */
  function showCartToast(msg) {
    let t = document.getElementById('cartToastGlobal');
    if (!t) {
      t = document.createElement('div');
      t.id = 'cartToastGlobal';
      t.className = 'cart-toast-global';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('show'), 2500);
  }

  /* ══════════════════════════════════════════
     SEND TO GOOGLE SHEETS — CORS-safe helper
     Uses no-cors mode (response is opaque but
     data still arrives in the sheet).
  ══════════════════════════════════════════ */
  function sendToSheet(type, data) {
    const payload = JSON.stringify({ type, ...data });
    return fetch(APPS_SCRIPT_URL, {
      method:  'POST',
      mode:    'no-cors',           // bypass CORS — response will be opaque
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body:    payload
    });
    // Note: with no-cors, fetch always resolves (never rejects on network ok).
    // We treat resolve = success since we cannot read the opaque response.
  }

  /* ══════════════════════════════════════════
     PASS ORDER (Cart → Orders sheet)
  ══════════════════════════════════════════ */
  const orderForm = document.getElementById('orderForm');
  if (orderForm) {
    orderForm.addEventListener('submit', function(e) {
      e.preventDefault();
      if (cart.length === 0) return;

      const table = document.getElementById('orderTable')?.value.trim() || 'Non précisée';

      const btn = orderForm.querySelector('.btn-order');
      if (btn) { btn.disabled = true; btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Envoi...'; }

      const itemsStr = cart.map(i => `${i.name} x${i.qty}`).join(', ');
      const total = getCartTotal().toFixed(3);

      sendToSheet('Orders', {
        table:  table,
        items:  itemsStr,
        total:  total + ' TND'
      }).then(() => {
        showCartToast('✓ Commande passée avec succès ! Nos serveurs vous consulteront.');
        cart = [];
        updateCartBadge();
        updateAddButtons();
        orderForm.reset();
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-circle"></i> Confirmer la Commande'; }
        // Close modal immediately and redirect without showing empty cart
        window.closeCartModal();
        window.location.href = '#accueil';
      }).catch(() => {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="bi bi-check-circle"></i> Confirmer la Commande'; }
        showCartToast('Erreur réseau. Réessayez.');
      });
    });
  }

  /* ══════════════════════════════════════════
     RESERVATION MODAL
  ══════════════════════════════════════════ */
  window.openReservationModal = function () {
    const modal = document.getElementById('reservationModal');
    if (modal) { modal.classList.add('active'); document.body.style.overflow = 'hidden'; }
  };

  window.closeReservationModal = function () {
    const modal = document.getElementById('reservationModal');
    if (modal) { modal.classList.remove('active'); document.body.style.overflow = ''; }
  };

  document.addEventListener('click', function (e) {
    const modal = document.getElementById('reservationModal');
    if (modal && e.target === modal) window.closeReservationModal();
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      window.closeReservationModal();
      window.closeCartModal();
    }
  });

  const reservationForm = document.getElementById('reservationForm');
  if (reservationForm) {
    reservationForm.onsubmit = function (e) {
      e.preventDefault();

      const nom    = document.getElementById('r_nom').value.trim();
      const phone  = document.getElementById('r_phone').value.trim();
      const email  = document.getElementById('r_email').value.trim() || '';
      const guests = document.getElementById('r_guests').value;
      const date   = document.getElementById('r_date').value;
      const time   = document.getElementById('r_time').value;
      const msg    = document.getElementById('r_message').value.trim() || '';

      if (!nom || !phone || !guests || !date || !time) {
        showRToast('Veuillez remplir tous les champs obligatoires.', 'error');
        return false;
      }

      const now = new Date();
      const sel = new Date(date + 'T' + time);
      if (sel <= now) {
        showRToast('La date doit être dans le futur.', 'error');
        return false;
      }

      const btn = document.getElementById('btn_reserver');
      btn.disabled = true;
      btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Envoi...';

      sendToSheet('Reservations', {
        name:    nom,
        phone:   phone,
        email:   email,
        people:  guests,
        date:    date,
        time:    time,
        message: msg
      }).then(() => {
        showRToast('✓ Réservation envoyée ! Nous vous contacterons bientôt.', 'success');
        reservationForm.reset();
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-send-fill"></i> Envoyer la Réservation';
        setTimeout(() => window.closeReservationModal(), 2000);
      }).catch(() => {
        showRToast('Erreur réseau. Appelez-nous directement.', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-send-fill"></i> Envoyer la Réservation';
      });

      return false;
    };
  }

  function showRToast(msg, type) {
    const t = document.getElementById('r_toast');
    if (!t) return;
    t.textContent = msg;
    t.className = 'r-toast ' + type;
    t.style.display = 'block';
    setTimeout(() => { t.style.display = 'none'; }, 5000);
  }

  /* ══════════════════════════════════════════
     CONTACT / RÉCLAMATION FORM → Sheet
  ══════════════════════════════════════════ */
  const contactForm = document.getElementById('contactForm');
  const cToast      = document.getElementById('c_toast');

  function showCToast(msg, type) {
    if (!cToast) return;
    cToast.textContent = msg;
    cToast.className = 'c-toast ' + type;
    cToast.style.display = 'block';
    setTimeout(() => { cToast.style.display = 'none'; }, 5000);
  }

  if (contactForm) {
    contactForm.onsubmit = function (e) {
      e.preventDefault();

      const nom     = document.getElementById('c_nom').value.trim() || 'Anonyme';
      const sujet   = document.getElementById('c_sujet').value.trim();
      const message = document.getElementById('c_message').value.trim();

      if (!sujet || !message) {
        showCToast('Veuillez remplir le sujet et le message.', 'error');
        return false;
      }

      const btn = document.getElementById('btn_contact');
      btn.disabled = true;
      btn.innerHTML = '<i class="bi bi-hourglass-split"></i> Envoi...';

      sendToSheet('Reclamations', {
        name:    nom,
        issue:   sujet,
        comment: message
      }).then(() => {
        showCToast('✓ Message envoyé avec succès !', 'success');
        contactForm.reset();
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-send-fill"></i> Contacter';
      }).catch(() => {
        showCToast('Erreur réseau. Réessayez plus tard.', 'error');
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-send-fill"></i> Contacter';
      });

      return false;
    };
  }

})();