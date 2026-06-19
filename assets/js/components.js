document.addEventListener('DOMContentLoaded', () => {
  /* --- Form Validation --- */
  const forms = document.querySelectorAll('.needs-validation');

  forms.forEach(form => {
    form.addEventListener('submit', event => {
      let isValid = true;
      
      const requiredInputs = form.querySelectorAll('[required]');
      
      requiredInputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('is-invalid');
        } else {
          input.classList.remove('is-invalid');
        }
        
        // Email validation
        if (input.type === 'email' && input.value.trim()) {
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(input.value)) {
            isValid = false;
            input.classList.add('is-invalid');
          }
        }
      });

      if (!isValid) {
        event.preventDefault();
        event.stopPropagation();
      }
    }, false);
    
    // Clear validation on input
    form.querySelectorAll('.form-control').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('is-invalid');
      });
    });
  });

  /* --- Skeleton Loader Simulation --- */
  // Simulating fetching data and replacing skeletons with real content
  const skeletonContainers = document.querySelectorAll('.skeleton-wrapper');
  
  if (skeletonContainers.length > 0) {
    setTimeout(() => {
      skeletonContainers.forEach(container => {
        const skeletons = container.querySelectorAll('.skeleton');
        skeletons.forEach(s => s.classList.remove('skeleton', 'skeleton-text', 'skeleton-img'));
        
        // Assuming real content is hidden or injected here. For demo, we just remove the animation class.
        // In a real app, you would populate actual data.
      });
    }, 2000); // 2 seconds simulation
  }
});
