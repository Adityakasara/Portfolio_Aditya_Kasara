/**
 * Aditya Kasara — Portfolio JavaScript Controller
 * Includes: Physics Draggable Stickers, Live GitHub Auto-Sync, Interactive Terminal, Filtering, Theme Engine
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMobileMenu();
  initStickerPhysics();
  initProjectFilters();
  initLiveGitHubSync();
  initTerminal();
  initEmailCopy();
  initContactForm();
});

/* ==========================================================================
   1. Theme Management (Dark / Light Mode)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('ak_theme') || 'dark';
  
  document.documentElement.setAttribute('data-theme', savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('ak_theme', newTheme);
    });
  }
}

/* ==========================================================================
   2. Mobile Drawer Navigation
   ========================================================================== */
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const drawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (menuBtn && drawer) {
    menuBtn.addEventListener('click', () => {
      drawer.classList.toggle('open');
    });

    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        drawer.classList.remove('open');
      });
    });

    drawer.addEventListener('click', (e) => {
      if (e.target === drawer) {
        drawer.classList.remove('open');
      }
    });
  }
}

/* ==========================================================================
   3. Draggable Skill Stickers with Physics & Spring Recoil
   ========================================================================== */
function initStickerPhysics() {
  const board = document.getElementById('stickers-board');
  const resetBtn = document.getElementById('reset-stickers-btn');
  if (!board) return;

  const stickersData = [
    { text: 'PyTorch 🧠', colorClass: 'sticker-purple', xPercent: 12, yPercent: 20, rotation: -6 },
    { text: 'YOLOv8 Vision 🦺', colorClass: 'sticker-cyan', xPercent: 32, yPercent: 15, rotation: 8 },
    { text: 'FastAPI ⚡', colorClass: 'sticker-emerald', xPercent: 58, yPercent: 18, rotation: -4 },
    { text: 'Facebook Prophet 📈', colorClass: 'sticker-blue', xPercent: 78, yPercent: 22, rotation: 7 },
    { text: 'Gemini RAG 🤖', colorClass: 'sticker-cyan', xPercent: 16, yPercent: 55, rotation: 5 },
    { text: 'EfficientNetB0 🌱', colorClass: 'sticker-emerald', xPercent: 38, yPercent: 60, rotation: -8 },
    { text: 'Isolation Forest 🌲', colorClass: 'sticker-purple', xPercent: 62, yPercent: 52, rotation: 6 },
    { text: 'Docker 🐳', colorClass: 'sticker-blue', xPercent: 82, yPercent: 62, rotation: -5 },
    { text: 'Python 🐍', colorClass: 'sticker-amber', xPercent: 26, yPercent: 82, rotation: 4 },
    { text: 'Dart / Flutter 📱', colorClass: 'sticker-rose', xPercent: 48, yPercent: 80, rotation: -3 },
    { text: 'Power BI 📊', colorClass: 'sticker-amber', xPercent: 70, yPercent: 80, rotation: 8 },
  ];

  let stickers = [];

  function createStickers() {
    board.innerHTML = '';
    stickers = [];
    const boardRect = board.getBoundingClientRect();
    const boardWidth = boardRect.width || 800;
    const boardHeight = boardRect.height || 340;

    stickersData.forEach((data) => {
      const el = document.createElement('div');
      el.className = `sticker-item ${data.colorClass}`;
      el.textContent = data.text;
      el.setAttribute('tabindex', '0');
      board.appendChild(el);

      const anchorX = (data.xPercent / 100) * (boardWidth - 140) + 10;
      const anchorY = (data.yPercent / 100) * (boardHeight - 60) + 10;

      const stickerObj = {
        el,
        anchorX,
        anchorY,
        x: anchorX,
        y: anchorY,
        vx: 0,
        vy: 0,
        rotation: data.rotation,
        targetRotation: data.rotation,
        isDragging: false,
        dragStartX: 0,
        dragStartY: 0,
        pointerStartX: 0,
        pointerStartY: 0,
        lastPointerX: 0,
        lastPointerY: 0,
        lastTime: 0
      };

      setupDragListeners(stickerObj, board);
      stickers.push(stickerObj);
      updateStickerTransform(stickerObj);
    });
  }

  function setupDragListeners(sticker, boardContainer) {
    const el = sticker.el;

    el.addEventListener('pointerdown', (e) => {
      sticker.isDragging = true;
      el.setPointerCapture(e.pointerId);

      sticker.dragStartX = sticker.x;
      sticker.dragStartY = sticker.y;
      sticker.pointerStartX = e.clientX;
      sticker.pointerStartY = e.clientY;
      sticker.lastPointerX = e.clientX;
      sticker.lastPointerY = e.clientY;
      sticker.lastTime = performance.now();
      sticker.vx = 0;
      sticker.vy = 0;
    });

    el.addEventListener('pointermove', (e) => {
      if (!sticker.isDragging) return;

      const now = performance.now();
      const dt = Math.max((now - sticker.lastTime) / 1000, 0.016);

      const dx = e.clientX - sticker.pointerStartX;
      const dy = e.clientY - sticker.pointerStartY;

      sticker.x = sticker.dragStartX + dx;
      sticker.y = sticker.dragStartY + dy;

      sticker.vx = (e.clientX - sticker.lastPointerX) / dt;
      sticker.vy = (e.clientY - sticker.lastPointerY) / dt;

      sticker.lastPointerX = e.clientX;
      sticker.lastPointerY = e.clientY;
      sticker.lastTime = now;

      sticker.rotation = sticker.targetRotation + (sticker.vx * 0.02);
      updateStickerTransform(sticker);
    });

    const endDrag = (e) => {
      if (!sticker.isDragging) return;
      sticker.isDragging = false;
      try {
        el.releasePointerCapture(e.pointerId);
      } catch (err) {}
      
      const maxSpeed = 1200;
      sticker.vx = Math.max(-maxSpeed, Math.min(maxSpeed, sticker.vx));
      sticker.vy = Math.max(-maxSpeed, Math.min(maxSpeed, sticker.vy));
    };

    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', endDrag);
  }

  function updateStickerTransform(sticker) {
    sticker.el.style.transform = `translate3d(${sticker.x}px, ${sticker.y}px, 0) rotate(${sticker.rotation}deg)`;
  }

  let lastFrame = performance.now();
  function physicsLoop(now) {
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    const boardRect = board.getBoundingClientRect();
    const boardWidth = boardRect.width;
    const boardHeight = boardRect.height;

    stickers.forEach(st => {
      if (!st.isDragging) {
        const k = 14;
        const d = 0.82;

        const fx = (st.anchorX - st.x) * k;
        const fy = (st.anchorY - st.y) * k;

        st.vx = (st.vx + fx * dt) * Math.pow(d, dt * 60);
        st.vy = (st.vy + fy * dt) * Math.pow(d, dt * 60);

        st.x += st.vx * dt;
        st.y += st.vy * dt;

        const elRect = st.el.getBoundingClientRect();
        const stW = elRect.width || 120;
        const stH = elRect.height || 40;

        if (st.x < 0) {
          st.x = 0;
          st.vx = -st.vx * 0.6;
        } else if (st.x + stW > boardWidth) {
          st.x = boardWidth - stW;
          st.vx = -st.vx * 0.6;
        }

        if (st.y < 0) {
          st.y = 0;
          st.vy = -st.vy * 0.6;
        } else if (st.y + stH > boardHeight) {
          st.y = boardHeight - stH;
          st.vy = -st.vy * 0.6;
        }

        st.rotation += (st.targetRotation - st.rotation) * 0.1;
        updateStickerTransform(st);
      }
    });

    requestAnimationFrame(physicsLoop);
  }

  createStickers();
  requestAnimationFrame(physicsLoop);

  window.addEventListener('resize', () => {
    createStickers();
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      createStickers();
    });
  }
}

/* ==========================================================================
   4. Project Category Filtering
   ========================================================================== */
function initProjectFilters() {
  const filterBtns = document.querySelectorAll('.filter-tab');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      applyFilter(filter);
    });
  });
}

function applyFilter(filter) {
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    const category = card.getAttribute('data-category');
    if (filter === 'all' || category === filter) {
      card.style.display = '';
      card.style.opacity = '0';
      setTimeout(() => {
        card.style.transition = 'opacity 0.3s ease';
        card.style.opacity = '1';
      }, 20);
    } else {
      card.style.display = 'none';
    }
  });
}

/* ==========================================================================
   5. Live GitHub Auto-Sync Engine (Real-Time Auto Updating)
   ========================================================================== */
let latestGithubRepos = [];

async function initLiveGitHubSync() {
  const heroRepoCount = document.getElementById('hero-repo-count');
  const syncBtn = document.getElementById('manual-sync-btn');
  const projectsContainer = document.getElementById('projects-container');

  // Hardcoded curated repo names already showcased manually with custom media
  const knownFeaturedRepos = [
    'petroai_hpcl_internship2026',
    'tomatodx',
    'fraud-detection',
    'shopsphere_ecommerce',
    'campus_pass',
    'retail_dashboard',
    'foodshare',
    'shikshasetu',
    'codexb-code_fusion_ps1',
    'kerala-farmer-bot',
    'adityakasara',
    'portfolio_aditya_kasara'
  ];

  async function fetchLiveGitHubData() {
    if (syncBtn) syncBtn.classList.add('spinning');
    try {
      // 1. Fetch user metadata for live repo count
      const userRes = await fetch('https://api.github.com/users/adityakasara');
      if (userRes.ok) {
        const userData = await userRes.json();
        if (heroRepoCount && userData.public_repos) {
          heroRepoCount.textContent = `${userData.public_repos}+`;
        }
      }

      // 2. Fetch all public repositories sorted by recently updated
      const reposRes = await fetch('https://api.github.com/users/adityakasara/repos?sort=updated&per_page=100');
      if (reposRes.ok) {
        latestGithubRepos = await reposRes.json();
        renderNewDynamicRepos(latestGithubRepos);
      }
    } catch (err) {
      console.warn('GitHub Live Sync notice (offline or rate-limited, rendering cached):', err);
    } finally {
      if (syncBtn) {
        setTimeout(() => syncBtn.classList.remove('spinning'), 600);
      }
    }
  }

  function renderNewDynamicRepos(repos) {
    if (!projectsContainer || !Array.isArray(repos)) return;

    // Remove any previously injected dynamic cards to re-render fresh
    document.querySelectorAll('.dynamic-github-project').forEach(el => el.remove());

    const existingProjectCards = document.querySelectorAll('.project-card');
    let projectCounter = existingProjectCards.length + 1;

    repos.forEach(repo => {
      const lowerName = repo.name.toLowerCase();
      // If repo is not one of the pre-rendered ones, dynamically inject it!
      if (!knownFeaturedRepos.includes(lowerName) && !repo.fork) {
        const card = createDynamicProjectCard(repo, projectCounter++);
        projectsContainer.appendChild(card);
      }
    });

    // Reapply current active filter
    const activeFilterBtn = document.querySelector('.filter-tab.active');
    if (activeFilterBtn) {
      applyFilter(activeFilterBtn.getAttribute('data-filter'));
    }
  }

  function createDynamicProjectCard(repo, index) {
    const card = document.createElement('div');
    const category = inferCategory(repo);
    card.className = 'project-card glass-card dynamic-github-project';
    card.setAttribute('data-category', category);

    const padIndex = String(index).padStart(2, '0');
    const desc = repo.description || 'Open source software project hosted on GitHub.';
    const lang = repo.language || 'Code';
    const stars = repo.stargazers_count || 0;
    const homepage = repo.homepage;

    card.innerHTML = `
      <div class="project-banner">
        <span class="dynamic-repo-badge">✨ Live from GitHub</span>
        <span class="project-number">project #${padIndex}</span>
      </div>
      <div class="project-body">
        <div class="project-title-row">
          <h3 class="project-title">${escapeHTML(repo.name.replace(/[-_]/g, ' '))}</h3>
          <div class="project-links">
            ${homepage ? `
              <a href="${escapeHTML(homepage)}" target="_blank" rel="noopener noreferrer" class="link-icon" title="Live Demo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              </a>
            ` : ''}
            <a href="${escapeHTML(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="link-icon" title="GitHub Repository">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
        <p class="project-desc">${escapeHTML(desc)}</p>
        <div class="project-metrics-row">
          <span class="metric-pill">⭐ ${stars} Stars</span>
          <span class="metric-pill">🔄 Active Repo</span>
        </div>
        <div class="project-tags">
          <span class="tag">${escapeHTML(lang)}</span>
          ${repo.topics ? repo.topics.map(t => `<span class="tag">${escapeHTML(t)}</span>`).join('') : ''}
        </div>
        <div class="project-actions">
          <a href="${escapeHTML(repo.html_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline">Explore on GitHub ↗</a>
        </div>
      </div>
    `;
    return card;
  }

  function inferCategory(repo) {
    const text = ((repo.name || '') + ' ' + (repo.description || '')).toLowerCase();
    const lang = (repo.language || '').toLowerCase();

    if (lang === 'dart' || text.includes('app') || text.includes('mobile') || text.includes('flutter')) {
      return 'mobile';
    }
    if (text.includes('ai') || text.includes('ml') || text.includes('model') || text.includes('vision') || text.includes('detect') || text.includes('rag') || text.includes('yolo') || text.includes('tensor') || text.includes('neural')) {
      return 'ai';
    }
    if (text.includes('dashboard') || text.includes('bi') || text.includes('analytics') || text.includes('report') || text.includes('data')) {
      return 'analytics';
    }
    return 'fullstack';
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Initial fetch
  fetchLiveGitHubData();

  // Manual refresh listener
  if (syncBtn) {
    syncBtn.addEventListener('click', () => {
      fetchLiveGitHubData();
    });
  }
}

/* ==========================================================================
   6. Interactive Developer Terminal
   ========================================================================== */
function initTerminal() {
  const terminalInput = document.getElementById('terminal-input');
  const terminalOutput = document.getElementById('terminal-output');
  const terminalBody = document.getElementById('terminal-body');
  const clearBtn = document.getElementById('clear-term-btn');

  if (!terminalInput || !terminalOutput) return;

  const commands = {
    help: `Available commands:
  • <span class="term-accent">skills</span>     - View core technical stack & competencies
  • <span class="term-accent">projects</span>   - List flagship AI & Full-Stack engineering projects
  • <span class="term-accent">sync</span>       - Check live repositories synced from GitHub (@adityakasara)
  • <span class="term-accent">hpcl</span>       - Deep-dive into HPCL AI/ML Internship & PetroAI architecture
  • <span class="term-accent">tomatodx</span>   - Learn about the TomatoDx deep learning disease classifier
  • <span class="term-accent">fraud</span>      - Inspect FraudShield anomaly detection system
  • <span class="term-accent">contact</span>    - Print email, GitHub, and social links
  • <span class="term-accent">about</span>      - Summary of background, degree, and engineering focus
  • <span class="term-accent">cat resume</span> - Print quick formatted resume summary
  • <span class="term-accent">clear</span>      - Clean up terminal output screen`,

    skills: `Technical Competencies & Toolchain:
  🧠 <span class="term-accent">AI / ML / CV:</span> PyTorch, TensorFlow/Keras, YOLOv8, EfficientNetB0, Scikit-Learn, XGBoost, Prophet, Isolation Forest, Grad-CAM, SHAP, OpenCV
  🤖 <span class="term-accent">GenAI & RAG:</span> Google Gemini API, LangChain, TF-IDF Vector Search, Prompt Engineering
  💻 <span class="term-accent">Languages:</span> Python, C++, JavaScript (ES6+), Dart, SQL, HTML5/CSS3, Go
  ⚙️ <span class="term-accent">Backend & Web:</span> FastAPI, Flask, SQLAlchemy, Pydantic v2, JWT/RBAC, Docker, Power BI, Chart.js`,

    projects: `Flagship Projects:
  1. <span class="term-accent">PetroAI:</span> Industrial Operations Intelligence for HPCL (YOLOv8 + Isolation Forest + Prophet + Gemini RAG)
  2. <span class="term-accent">TomatoDx:</span> Pre-final year tomato disease diagnosis (EfficientNetB0, 95%+ accuracy across 11 classes)
  3. <span class="term-accent">FraudShield:</span> Financial transaction anomaly detector (FastAPI + React + XGBoost + SMOTE + SHAP)
  4. <span class="term-accent">ShopSphere:</span> Enterprise full-stack e-commerce (FastAPI + SQLAlchemy + JWT RBAC + Razorpay gateway)
  5. <span class="term-accent">CampusPass Vizag:</span> University event ticketing & digital QR pass generator (Flask + SQLite)
  6. <span class="term-accent">Reliance Retail Dashboard:</span> Multi-division sales & profitability Power BI suite`,

    sync: () => {
      if (latestGithubRepos.length > 0) {
        return `Live GitHub Repositories (${latestGithubRepos.length} found):\n` +
          latestGithubRepos.slice(0, 8).map(r => `  • <span class="term-accent">${r.name}</span> [${r.language || 'Repo'}] - ⭐ ${r.stargazers_count}`).join('\n') +
          `\n  (Auto-updates on page load and manual sync!)`;
      }
      return `Fetching live repositories from GitHub... Please try again in a moment.`;
    },

    hpcl: `Hindustan Petroleum Corporation Limited (HPCL) — AI/ML Internship 2026:
  • Role: AI / Machine Learning Intern & PetroAI Lead Architect
  • Unsupervised Anomaly Detection on 14,447 machinery sensor telemetry records using Isolation Forest.
  • Real-time PPE Safety Gear Compliance scanning using fine-tuned YOLOv8.
  • Crude Oil Price Forecasting with Facebook Prophet & geopolitical shock simulation.
  • PetroBot RAG assistant querying OISD safety standards via Google Gemini API.
  • Containerized deployment on Hugging Face Spaces.`,

    tomatodx: `TomatoDx (Pre-Final Year Engineering Project):
  • Architecture: Transfer learning with EfficientNetB0 on PlantVillage dataset.
  • Scope: 11 distinct classes (bacterial, fungal, insect, viral, and healthy).
  • Explainability: Integrated Grad-CAM heatmaps to visually isolate infected leaf regions.
  • Performance: ~95–97% test accuracy, precision, and recall.`,

    fraud: `FraudShield (Credit Card Fraud Detection):
  • Stack: FastAPI, React + Vite, XGBoost, Scikit-Learn, SQLite.
  • Class Imbalance: Handled severe imbalance via SMOTE & cost-sensitive weighting.
  • Explainability: SHAP feature attribution bars for instant compliance reasons.`,

    about: `Kasara Aditya:
  • Computer Science Engineer & AI/ML Specialist based in India.
  • Focused on applied deep learning, computer vision pipelines, and resilient backend systems.
  • GitHub: @adityakasara (17+ repositories across AI, Web, Mobile, and IoT).`,

    contact: `Contact & Connect:
  📧 Email: adityakasara2004@gmail.com
  🐙 GitHub: https://github.com/adityakasara
  🤗 Hugging Face: https://huggingface.co/spaces/45ttiana/petroai`,

    'cat resume': `================================================
  KASARA ADITYA — RESUME SUMMARY
================================================
Role: AI/ML Engineer & Full-Stack Developer
Education: B.Tech in Computer Science & Engineering
Internship: HPCL (AI/ML Intern — PetroAI Lead)
Core Skills: Python, PyTorch, YOLOv8, FastAPI, Flask, Docker
Open Source: 17 Repositories | 4 Deployed Production Systems
Status: Open to Full-time Opportunities & Internships
================================================`,

    whoami: `visitor@aditya-portfolio (Guest Developer)`,
    clear: '__CLEAR__'
  };

  function printLine(htmlContent, className = 'term-result') {
    const p = document.createElement('p');
    p.className = `term-line ${className}`;
    p.innerHTML = htmlContent;
    terminalOutput.appendChild(p);
    terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  terminalInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const rawInput = terminalInput.value.trim();
      const input = rawInput.toLowerCase();
      terminalInput.value = '';

      if (!input) return;

      printLine(`<span class="term-prompt">aditya@portfolio:~$</span> <span class="term-cmd-echo">${rawInput}</span>`, 'term-echo-line');

      if (input === 'clear') {
        terminalOutput.innerHTML = '';
        return;
      }

      if (commands[input]) {
        const val = typeof commands[input] === 'function' ? commands[input]() : commands[input];
        printLine(val);
      } else {
        printLine(`Command not found: <span style="color:#ef4444">${rawInput}</span>. Type <span class="term-accent">'help'</span> for list of commands.`, 'term-dim');
      }
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      terminalOutput.innerHTML = '';
    });
  }
}

/* ==========================================================================
   7. Copy Email to Clipboard
   ========================================================================== */
function initEmailCopy() {
  const copyBtn = document.getElementById('copy-email-btn');
  const emailElem = document.getElementById('email-address');

  if (copyBtn && emailElem) {
    copyBtn.addEventListener('click', () => {
      const email = emailElem.textContent.trim();
      navigator.clipboard.writeText(email).then(() => {
        const originalText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span>Copied! 🎉</span>';
        copyBtn.style.borderColor = 'var(--accent-emerald)';
        copyBtn.style.color = 'var(--accent-emerald)';

        setTimeout(() => {
          copyBtn.innerHTML = originalText;
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2200);
      }).catch(() => {
        alert(`Email: ${email}`);
      });
    });
  }
}

/* ==========================================================================
   8. Contact Form Simulation
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  const feedback = document.getElementById('form-feedback');

  if (form && feedback) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name').value;

      feedback.className = 'form-feedback success';
      feedback.textContent = `Thanks ${name}! Your note has been simulated. You can also reach Aditya directly at adityakasara2004@gmail.com 🚀`;

      form.reset();
      setTimeout(() => {
        feedback.textContent = '';
      }, 6000);
    });
  }
}
