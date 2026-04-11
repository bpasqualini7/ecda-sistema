// ============================================================
// sheets.js — Leitura e escrita no Google Sheets
// ============================================================
// CONFIGURAÇÃO: Preencha SPREADSHEET_ID após criar sua planilha.
// Veja o guia de configuração no README.md
// ============================================================

const SHEETS_CONFIG = {
  SPREADSHEET_ID: 'SEU_SPREADSHEET_ID_AQUI',
  BASE: 'https://sheets.googleapis.com/v4/spreadsheets',

  // Abas da planilha (crie estas abas manualmente ou use sheets.setup())
  TABS: {
    CONTEUDO: 'Conteudo',
    IDEIAS:   'Ideias',
    PRODUTOS: 'Produtos',
  },

  // Colunas de cada aba
  COLS: {
    CONTEUDO: ['ID', 'Tema', 'Categoria', 'Formato', 'Status', 'Data', 'Descricao', 'LinkYT', 'LinkIG', 'Tags'],
    IDEIAS:   ['ID', 'Tema', 'Categoria', 'Nota', 'Prioridade', 'DataCriacao'],
    PRODUTOS: ['ID', 'Nome', 'Tipo', 'Status', 'Preco', 'LinkDrive', 'Notas'],
  }
};

const sheets = {

  _headers() {
    return {
      Authorization: `Bearer ${auth.getToken()}`,
      'Content-Type': 'application/json',
    };
  },

  _url(tab, range) {
    const id = SHEETS_CONFIG.SPREADSHEET_ID;
    const r  = range ? `${tab}!${range}` : tab;
    return `${SHEETS_CONFIG.BASE}/${id}/values/${encodeURIComponent(r)}`;
  },

  // Lê todos os dados de uma aba
  async read(tab) {
    const r = await fetch(this._url(tab, 'A:Z'), { headers: this._headers() });
    if (!r.ok) throw new Error(`Sheets read error: ${r.status}`);
    const data = await r.json();
    const rows = data.values || [];
    if (rows.length < 2) return [];
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i] || '');
      return obj;
    });
  },

  // Adiciona uma linha ao final de uma aba
  async append(tab, rowObj, cols) {
    const row = cols.map(c => rowObj[c] || '');
    const body = { values: [row] };
    const url  = this._url(tab, 'A:Z') + '?valueInputOption=USER_ENTERED';
    const r = await fetch(url.replace('/values/', '/values/').replace('?', ':append?'), {
      method: 'POST', headers: this._headers(), body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(`Sheets append error: ${r.status}`);
    return r.json();
  },

  // Atualiza uma linha pelo índice (rowIndex = 1-based, sem header)
  async update(tab, rowIndex, rowObj, cols) {
    const row  = cols.map(c => rowObj[c] || '');
    const body = { values: [row] };
    const range = `${tab}!A${rowIndex + 1}`;
    const url = this._url(tab, `A${rowIndex+1}:Z${rowIndex+1}`) + '?valueInputOption=USER_ENTERED';
    const r = await fetch(url, {
      method: 'PUT', headers: this._headers(), body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(`Sheets update error: ${r.status}`);
    return r.json();
  },

  // Deleta uma linha (substitui por linha vazia — Sheets não tem delete de linha)
  async deleteRow(tab, rowIndex) {
    const body = { values: [Array(10).fill('')] };
    const url = this._url(tab, `A${rowIndex+1}:J${rowIndex+1}`) + '?valueInputOption=USER_ENTERED';
    const r = await fetch(url, {
      method: 'PUT', headers: this._headers(), body: JSON.stringify(body)
    });
    if (!r.ok) throw new Error(`Sheets delete error: ${r.status}`);
  },

  // Inicializa a planilha com os headers de cada aba
  async setup() {
    const id = SHEETS_CONFIG.SPREADSHEET_ID;
    if (id === 'SEU_SPREADSHEET_ID_AQUI') {
      toast.show('⚠️ Configure o SPREADSHEET_ID em js/sheets.js');
      return;
    }
    for (const [key, tab] of Object.entries(SHEETS_CONFIG.TABS)) {
      const cols = SHEETS_CONFIG.COLS[key];
      const body = { values: [cols] };
      const url  = this._url(tab, 'A1') + '?valueInputOption=USER_ENTERED';
      await fetch(url, {
        method: 'PUT', headers: this._headers(), body: JSON.stringify(body)
      }).catch(() => {});
    }
    toast.show('✓ Planilha inicializada com sucesso.');
  },

  // Helpers por módulo
  conteudo: {
    read:   () => sheets.read(SHEETS_CONFIG.TABS.CONTEUDO),
    append: (obj) => sheets.append(SHEETS_CONFIG.TABS.CONTEUDO, obj, SHEETS_CONFIG.COLS.CONTEUDO),
  },
  ideias: {
    read:   () => sheets.read(SHEETS_CONFIG.TABS.IDEIAS),
    append: (obj) => sheets.append(SHEETS_CONFIG.TABS.IDEIAS, obj, SHEETS_CONFIG.COLS.IDEIAS),
  },
  produtos: {
    read:   () => sheets.read(SHEETS_CONFIG.TABS.PRODUTOS),
    append: (obj) => sheets.append(SHEETS_CONFIG.TABS.PRODUTOS, obj, SHEETS_CONFIG.COLS.PRODUTOS),
  },
};
