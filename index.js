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
})();