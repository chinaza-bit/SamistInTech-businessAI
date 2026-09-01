document.getElementById('year').textContent = new Date().getFullYear();

// Contact form -> Supabase
(function () {
  const form = document.getElementById('contact-form-el');
  if (!form) return;

  const statusEl = document.getElementById('cf-status');
  const submitBtn = document.getElementById('cf-submit');
  const config = window.SAMISTINTECH_SUPABASE;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const name = form.name.value.trim();
    const phone = form.phone.value.trim();
    const business_name = form.business_name.value.trim();
    const message = form.message.value.trim();

    if (!name || !phone) {
      statusEl.textContent = 'Please fill in your name and WhatsApp number.';
      statusEl.className = 'form-status error';
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';
    statusEl.textContent = '';
    statusEl.className = 'form-status';

    try {
      const res = await fetch(config.url + '/rest/v1/contact_submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: config.anonKey,
          Authorization: 'Bearer ' + config.anonKey,
          Prefer: 'return=minimal'
        },
        body: JSON.stringify({
          name: name,
          phone: phone,
          business_name: business_name || null,
          message: message || null
        })
      });

      if (!res.ok) throw new Error('Request failed: ' + res.status);

      form.reset();
      statusEl.textContent = "Thanks! We've got your details and will reach out on WhatsApp shortly.";
      statusEl.className = 'form-status success';
    } catch (err) {
      statusEl.textContent = "That didn't go through. Please message us directly on WhatsApp instead.";
      statusEl.className = 'form-status error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send my details';
    }
  });
})();
