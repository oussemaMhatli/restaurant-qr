(() => {
  const observer = new IntersectionObserver(
    (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); }),
    { threshold: 0.12 }
  );

  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

  window.addEventListener('load', () => {
    document.querySelectorAll('.hero-content .fade-up, .hero-food-img.fade-up')
      .forEach(el => el.classList.add('visible'));
  });

  document.querySelectorAll('.menu-category-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.menu-category-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.menu-category').forEach(c => c.classList.remove('active'));
      this.classList.add('active');
      document.getElementById(this.getAttribute('data-category')).classList.add('active');
    });
  });

  // Toggle ingredients visibility (used by inline onclick)
  window.toggleIngredients = function toggleIngredients(button) {
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

  // Gestion du formulaire de réclamation WhatsApp
  const reclamationForm = document.getElementById('reclamationForm');
  if (reclamationForm) {
    reclamationForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const nom = document.getElementById('nom').value.trim() || 'Anonyme';
      const reclamation = document.getElementById('reclamation').value.trim();
      
      if (!reclamation) {
        alert('Veuillez décrire votre réclamation.');
        return;
      }
      
      // Format de la date actuelle
      const now = new Date();
      const dateStr = now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      // Construction du message WhatsApp
      const message = `Nouvelle réclamation de ${nom} au ${dateStr}\n\nLa réclamation est : ${reclamation}`;
      
      // Ouvrir WhatsApp avec le message prérempli
      const whatsappUrl = `https://wa.me/21690712800?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    });
  }
})();