
(function () {
  'use strict';
  var email = 'bazzigar764@gmail.com';

  // Theme switch (saved locally in this browser).
  var themeButton = document.getElementById('theme-toggle');
  var savedTheme = null;
  try { savedTheme = localStorage.getItem('rehan-portfolio-theme'); } catch (e) {}
  if (savedTheme === 'light') document.documentElement.classList.add('light-theme');

  function updateThemeLabel() {
    var light = document.documentElement.classList.contains('light-theme');
    themeButton.textContent = light ? '☾ Dark' : '☀ Light';
    themeButton.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
  }

  updateThemeLabel();

  themeButton.addEventListener('click', function () {
    document.documentElement.classList.toggle('light-theme');
    var theme = document.documentElement.classList.contains('light-theme') ? 'light' : 'dark';
    try { localStorage.setItem('rehan-portfolio-theme', theme); } catch (e) {}
    updateThemeLabel();
  });

  // Copy email address.
  document.getElementById('copy-email').addEventListener('click', async function () {
    var button = this;

    try {
      await navigator.clipboard.writeText(email);
      button.textContent = 'Email copied';
    } catch (e) {
      var temp = document.createElement('textarea');
      temp.value = email;
      document.body.appendChild(temp);
      temp.select();

      try {
        document.execCommand('copy');
        button.textContent = 'Email copied';
      } catch (err) {
        button.textContent = email;
      }

      temp.remove();
    }

    window.setTimeout(function () {
      button.textContent = 'Copy email';
    }, 2200);
  });

  // Contact form - Direct email using Formspree.
  var contactForm = document.getElementById('contact-form');
  var contactStatus = document.getElementById('contact-status');
  var contactButton = contactForm.querySelector('button[type="submit"]');

  contactForm.addEventListener('submit', async function (event) {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

    var formData = new FormData(contactForm);

    formData.append(
      '_subject',
      'New Portfolio Message from ' + (formData.get('name') || 'Visitor')
    );

    contactButton.disabled = true;
    contactButton.textContent = 'Sending...';
    contactStatus.textContent = 'Sending your message...';

    try {
      var response = await fetch('https://formspree.io/f/xjyyzoon', {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      var result = await response.json().catch(function () {
        return {};
      });

      if (!response.ok) {
        var errorMessage = result.errors
          ? result.errors.map(function (error) {
              return error.message;
            }).join(' ')
          : 'Please try again.';

        throw new Error(errorMessage);
      }

      contactStatus.textContent =
        'Message sent successfully! Thank you for contacting me.';

      contactForm.reset();

    } catch (error) {
      contactStatus.textContent =
        'Message could not be sent. ' +
        (error.message || 'Please try again or email ' + email + ' directly.');

    } finally {
      contactButton.disabled = false;
      contactButton.textContent = 'Send Message';
    }
  });

  // Resume preview dialog.
  var resumeDialog = document.getElementById('resume-dialog');

  document.getElementById('preview-resume').addEventListener('click', function () {
    resumeDialog.showModal();
  });

  // Project detail dialog.
  var projectInfo = {
    gradebook: {
      title: 'Grade Book dApp',
      category: 'Web3 / dApp',
      description: 'A student-record application built with a React frontend and blockchain smart-contract interactions. The public demo is hosted on Vercel.',
      stack: 'React, JavaScript, ethers.js, Solidity',
      links: [['Live Demo', 'https://grade-book-1odfa0jmq-rehan-8819.vercel.app/']]
    },

    prt: {
      title: 'ERC-20 Token: PRT (Proity)',
      category: 'Solidity',
      description: 'A custom ERC-20 token project deployed to the Sepolia testnet. Token transfers were tested through MetaMask.',
      stack: 'Solidity, OpenZeppelin, Remix IDE, MetaMask, Sepolia',
      links: [['GitHub', 'https://github.com/Rehan-Code764/Solidity_Project']]
    },

    voting: {
      title: 'Blockchain Voting System',
      category: 'Python',
      description: 'A Python project that records voter and candidate activity in a hash-linked chain and tracks duplicate voting attempts.',
      stack: 'Python, SHA-256, Cryptographic Hashing',
      links: [['GitHub', 'https://github.com/Rehan-Code764/Python_Cryptography_Blockchain_Projects']]
    }
  };

  var projectDialog = document.getElementById('project-dialog');
  var projectContent = document.getElementById('project-dialog-content');

  document.querySelectorAll('.detail-btn').forEach(function (button) {
    button.addEventListener('click', function () {
      var item = projectInfo[button.dataset.project];
      if (!item) return;

      projectContent.replaceChildren();

      var title = document.createElement('h2');
      title.textContent = item.title;

      var category = document.createElement('p');
      category.textContent = 'Category: ' + item.category;

      var description = document.createElement('p');
      description.textContent = item.description;

      var stack = document.createElement('p');
      stack.textContent = 'Tech stack: ' + item.stack;

      projectContent.append(title, category, description, stack);

      item.links.forEach(function (entry) {
        var link = document.createElement('a');
        link.className = 'mini-link';
        link.href = entry[1];
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = entry[0] + ' ↗';
        projectContent.appendChild(link);
      });

      projectDialog.showModal();
    });
  });

  // Close dialogs.
  document.querySelectorAll('.dialog-close').forEach(function (button) {
    button.addEventListener('click', function () {
      button.closest('dialog').close();
    });
  });

  [projectDialog, resumeDialog].forEach(function (dialog) {
    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });
  });

  // Back-to-top control.
  var topButton = document.getElementById('back-to-top');

  function updateTopButton() {
    topButton.classList.toggle('visible', window.scrollY > 500);
  }

  window.addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();

  topButton.addEventListener('click', function () {
    window.scrollTo({
      top: 0,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth'
    });
  });

  // GitHub repositories integration.
  var repoContainer = document.getElementById('github-repos');
  var githubStatus = document.getElementById('github-status');

  fetch('https://api.github.com/users/Rehan-Code764/repos?sort=updated&per_page=4')
    .then(function (response) {
      if (!response.ok) throw new Error('GitHub API unavailable');
      return response.json();
    })
    .then(function (repos) {
      if (!Array.isArray(repos) || !repos.length) {
        throw new Error('No public repositories found');
      }

      githubStatus.textContent = 'Recently updated public repositories';

      repos.forEach(function (repo) {
        var card = document.createElement('article');
        card.className = 'github-repo';

        var link = document.createElement('a');
        link.href = repo.html_url;
        link.target = '_blank';
        link.rel = 'noopener';
        link.textContent = repo.name;

        var description = document.createElement('p');
        description.textContent = repo.description || 'No description added yet.';

        var meta = document.createElement('div');
        meta.className = 'github-meta';
        meta.textContent =
          (repo.language || 'Repository') + ' · ★ ' + repo.stargazers_count;

        card.append(link, description, meta);
        repoContainer.appendChild(card);
      });
    })
    .catch(function () {
      githubStatus.textContent =
        'Live repository preview is unavailable right now. Visit GitHub to see all projects.';
    });

})();
