// ============================================================
// drive.js — Upload de arquivos para o Google Drive
// ============================================================

const DRIVE_CONFIG = {
  // ID da pasta no Drive onde os arquivos serão salvos.
  // Deixe vazio para salvar na raiz do Drive.
  // Para usar uma pasta: abra a pasta no Drive, copie o ID da URL.
  FOLDER_ID: '',
  UPLOAD_URL: 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
  LIST_URL:   'https://www.googleapis.com/drive/v3/files',
};

const drive = {

  _headers(extra = {}) {
    return { Authorization: `Bearer ${auth.getToken()}`, ...extra };
  },

  // Upload de um arquivo File object
  async upload(file) {
    if (!file) return;
    const status = document.getElementById('drive-status');
    if (status) status.textContent = `Enviando "${file.name}"...`;

    const meta = {
      name:    file.name,
      parents: DRIVE_CONFIG.FOLDER_ID ? [DRIVE_CONFIG.FOLDER_ID] : undefined,
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
    form.append('file', file);

    try {
      const r = await fetch(DRIVE_CONFIG.UPLOAD_URL, {
        method: 'POST',
        headers: this._headers(),
        body: form,
      });
      if (!r.ok) throw new Error(`Drive upload error: ${r.status}`);
      const data = await r.json();
      toast.show(`✓ "${file.name}" enviado ao Drive!`);
      if (status) status.textContent = '';
      drive.listFiles();
      return data;
    } catch (e) {
      toast.show('Erro ao enviar arquivo. Verifique as permissões.');
      if (status) status.textContent = '';
    }
  },

  // Lista arquivos da pasta ECDA no Drive
  async listFiles() {
    const el = document.getElementById('arquivos-list');
    if (!el) return;
    el.innerHTML = '<div class="empty-state">Carregando arquivos...</div>';

    const query = DRIVE_CONFIG.FOLDER_ID
      ? `'${DRIVE_CONFIG.FOLDER_ID}' in parents and trashed=false`
      : `name contains 'ecda' and trashed=false`;

    const params = new URLSearchParams({
      q:        query,
      fields:   'files(id,name,size,mimeType,webViewLink,modifiedTime)',
      orderBy:  'modifiedTime desc',
      pageSize: 50,
    });

    try {
      const r    = await fetch(`${DRIVE_CONFIG.LIST_URL}?${params}`, { headers: this._headers() });
      const data = await r.json();
      const files = data.files || [];

      if (!files.length) {
        el.innerHTML = '<div class="empty-state">Nenhum arquivo encontrado. Faça upload do primeiro!</div>';
        return;
      }

      el.innerHTML = files.map(f => `
        <div class="file-item">
          <span class="file-icon">${drive._icon(f.mimeType)}</span>
          <span class="file-name">${f.name}</span>
          <span class="file-size">${drive._size(f.size)}</span>
          <a class="file-link" href="${f.webViewLink}" target="_blank">Abrir ↗</a>
        </div>
      `).join('');
    } catch {
      el.innerHTML = '<div class="empty-state">Erro ao carregar arquivos. Verifique as permissões.</div>';
    }
  },

  // Upload de texto (roteiros, scripts)
  async uploadText(filename, content) {
    const file = new Blob([content], { type: 'text/plain' });
    const meta = {
      name:    filename,
      parents: DRIVE_CONFIG.FOLDER_ID ? [DRIVE_CONFIG.FOLDER_ID] : undefined,
    };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(meta)], { type: 'application/json' }));
    form.append('file', file);
    const r = await fetch(DRIVE_CONFIG.UPLOAD_URL, {
      method: 'POST', headers: this._headers(), body: form,
    });
    if (!r.ok) throw new Error('Drive text upload failed');
    return r.json();
  },

  _icon(mime) {
    if (mime.includes('video'))  return '🎬';
    if (mime.includes('image'))  return '🖼️';
    if (mime.includes('pdf'))    return '📄';
    if (mime.includes('text'))   return '📝';
    if (mime.includes('audio'))  return '🎵';
    if (mime.includes('zip'))    return '📦';
    return '📁';
  },

  _size(bytes) {
    if (!bytes) return '';
    const b = parseInt(bytes);
    if (b < 1024)       return `${b} B`;
    if (b < 1048576)    return `${(b/1024).toFixed(1)} KB`;
    return `${(b/1048576).toFixed(1)} MB`;
  },
};
