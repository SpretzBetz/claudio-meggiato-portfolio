// Ricompone l'indirizzo solo dopo che lo script viene eseguito nel browser.
// L'indirizzo non compare in chiaro nei documenti HTML.
const emailUser = 'cla.meggiato';
const emailDomain = 'gmail.com';
const protectedAddress = `${emailUser}@${emailDomain}`;

// Tutti i segnaposto condividono questo script, con azioni diverse.
document.querySelectorAll('.protected-email').forEach(element => {
  const action = element.dataset.action;

  if (action === 'reveal') {
    // Nel testo privacy mostra l'indirizzo soltanto su richiesta esplicita.
    element.addEventListener('click', () => {
      const link = document.createElement('a');
      link.href = `mailto:${protectedAddress}`;
      link.textContent = protectedAddress;
      link.className = 'protected-email';
      link.dataset.action = 'revealed';
      element.replaceWith(link);
    }, { once: true });
    element.setAttribute('role', 'button');
    element.setAttribute('tabindex', '0');
    element.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        element.click();
      }
    });
    return;
  }

  if (action !== 'copy') return;

  const originalLabel = element.textContent.trim();
  let hasCopied = false;
  let isHovered = false;
  let feedbackTimer;
  const showAddress = () => {
    element.textContent = protectedAddress;
    element.href = `mailto:${protectedAddress}`;
    element.setAttribute('aria-label', `Email: ${protectedAddress}`);
  };
  const restoreLabel = () => {
    element.textContent = originalLabel;
    element.href = '#';
    element.removeAttribute('aria-label');
  };

  // Passaggio del mouse o focus: rende visibile l'indirizzo come link mailto.
  element.addEventListener('pointerenter', () => {
    isHovered = true;
    showAddress();
  });
  element.addEventListener('pointerleave', () => {
    isHovered = false;
    if (document.activeElement !== element && element.textContent !== 'Email copiata ✓') restoreLabel();
  });
  element.addEventListener('focus', showAddress);
  element.addEventListener('blur', () => {
    if (!isHovered && element.textContent !== 'Email copiata ✓') restoreLabel();
  });

  // Primo click copia l'indirizzo; i click successivi aprono il client email.
  element.addEventListener('click', async event => {
    if (hasCopied) {
      showAddress();
      return;
    }
    event.preventDefault();
    try {
      await navigator.clipboard.writeText(protectedAddress);
      hasCopied = true;
      element.textContent = 'Email copiata ✓';
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => {
        if (isHovered || document.activeElement === element) showAddress();
        else restoreLabel();
      }, 2500);
    } catch {
      element.textContent = 'Copia non disponibile';
      clearTimeout(feedbackTimer);
      feedbackTimer = setTimeout(() => {
        if (isHovered || document.activeElement === element) showAddress();
        else restoreLabel();
      }, 2500);
    }
  });
});
