// ============================================================
// auth.js — Google OAuth 2.0 (PKCE implicit flow)
// ============================================================
// CONFIGURAÇÃO: Preencha CLIENT_ID com o seu Google OAuth Client ID
// Veja o guia de configuração no README.md
// ============================================================

const CONFIG = {
  CLIENT_ID: '84397126664-kbs6qtpa8sob5bs34lsr8esviu7078q6.apps.googleusercontent.com',
  SCOPES: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive.file',
    'profile',
    'email'
  ].join(' '),
};

const auth = {
  token: null,
  user:  null,

  init() {
    const stored = sessionStorage.getItem('ecda_token');
    const user   = sessionStorage.getItem('ecda_user');
    if (stored && user) {
      this.token = stored;
      this.user  = JSON.parse(user);
      this._showApp();
    } else {
      document.getElementById('login-screen').style.display = 'flex';
    }

    // Captura token após redirect OAuth
    const hash = window.location.hash;
    if (hash.includes('access_token')) {
      const params = new URLSearchParams(hash.slice(1));
      this.token   = params.get('access_token');
      sessionStorage.setItem('ecda_token', this.token);
      window.history.replaceState({}, document.title, window.location.pathname);
      this._fetchUser();
    }
  },

  login() {
    if (CONFIG.CLIENT_ID === 'SEU_CLIENT_ID_AQUI.apps.googleusercontent.com') {
      toast.show('⚠️ Configure o CLIENT_ID no arquivo js/auth.js antes de fazer login.', 5000);
      return;
    }
    const base   = 'https://accounts.google.com/o/oauth2/v2/auth';
    const params = new URLSearchParams({
      client_id:     CONFIG.CLIENT_ID,
      redirect_uri:  window.location.origin + window.location.pathname,
      response_type: 'token',
      scope:         CONFIG.SCOPES,
      prompt:        'select_account',
    });
    window.location.href = `${base}?${params}`;
  },

  logout() {
    sessionStorage.clear();
    this.token = null;
    this.user  = null;
    document.getElementById('app').style.display = 'none';
    document.getElementById('login-screen').style.display = 'flex';
  },

  async _fetchUser() {
    try {
      const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      this.user = await r.json();
      sessionStorage.setItem('ecda_user', JSON.stringify(this.user));
      this._showApp();
    } catch {
      toast.show('Erro ao buscar dados do usuário.');
    }
  },

  _showApp() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'flex';
    const el = document.getElementById('user-info');
    if (el && this.user) {
      el.innerHTML = this.user.picture
        ? `<img src="${this.user.picture}" alt=""> <span>${this.user.given_name || ''}</span>`
        : `<span>${this.user.email || ''}</span>`;
    }
    app.init();
  },

  getToken() { return this.token; }
};

window.addEventListener('DOMContentLoaded', () => auth.init());
