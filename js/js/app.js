// ============================================================
// app.js — Lógica principal do sistema ECDA v2
// ============================================================

const state = {
  conteudo: [],
  ideias:   [],
  produtos: [],
  calView:  'month',
  calDate:  new Date(),
};

const CAT_CLASS = {
  'Ciência':         'ciencia',
  'Espiritualidade': 'espiritualidade',
  'Filosofia':       'filosofia',
  'Mitologia':       'mitologia',
  'História':        'historia',
};

function badge(cat) {
  return `<span class="badge badge-${CAT_CLASS[cat]||'ciencia'}">${cat}</span>`;
}

function statusEl(s) {
  const map = { 'Publicado':'pub','Em produção':'prod','Planejado':'plan' };
  return `<span class="status"><span class="dot dot-${map[s]||'plan'}"></span>${s}</span>`;
}

function fmtDate(d) {
  if (!d) return '—';
  try { return new Date(d+'T12:00:00').toLocaleDateString('pt-BR'); } catch { return d; }
}

function uid() {
  return Date.now().toString(36)+Math.random().toString(36).slice(2,6);
}

const toast = {
  timer: null,
  show(msg, duration=3000) {
    const el = document.getElementById('toast');
    el.textContent = msg; el.classList.add('show');
    clearTimeout(this.timer);
    this.timer = setTimeout(()=>el.classList.remove('show'), duration);
  }
};

// ============================================================
const app = {

  async init() {
    this.renderGreeting();
    await this.loadAll();
    this.renderDashboard();
    this.showPage('dashboard');
  },

  async loadAll() {
    const useSheets = SHEETS_CONFIG.SPREADSHEET_ID !== 'SEU_SPREADSHEET_ID_AQUI';
    if (useSheets) {
      try {
        const [c,i,p] = await Promise.all([sheets.conteudo.read(),sheets.ideias.read(),sheets.produtos.read()]);
        state.conteudo = c.filter(r=>r.ID);
        state.ideias   = i.filter(r=>r.ID);
        state.produtos = p.filter(r=>r.ID);
      } catch { this._loadDefaults(); }
    } else { this._loadDefaults(); }
  },

  _loadDefaults() {
    const today = new Date();
    const fmt = d => d.toISOString().split('T')[0];
    const add = n => { const d=new Date(today); d.setDate(d.getDate()+n); return fmt(d); };

    state.conteudo = [
      { ID:uid(), Tema:'Albert Einstein — Vida e Legado', Categoria:'Ciência', Formato:'YouTube', Status:'Em produção', Data:add(2),
        Descricao:'Primeiro vídeo do canal.',
        Roteiro:'ABERTURA (0:00–0:55)\nImagine um garoto que foi reprovado na escola. Que falava tão tarde que seus pais temiam que algo estivesse errado.\nEsse menino cresceu e reescreveu os fundamentos da física. Seu nome era Albert Einstein.\n\nINFÂNCIA (0:55–3:00)\nAlbert Einstein nasceu em 14 de março de 1879, em Ulm, na Alemanha. Desde cedo, era diferente — não de um jeito admirado, mas de um jeito que preocupava.\n\nO ANO MIRACULOSO (3:00–6:00)\nEm 1905 publicou 4 artigos científicos que abalaram a física. Escritos por um funcionário público de 26 anos. Um deles: E = mc².\n\nRELATIVIDADE (6:00–9:00)\nO tempo não é absoluto. O espaço não é fixo. Ambos se dobram dependendo da velocidade e da gravidade.\n\nO HUMANO (9:00–11:00)\nEra pacifista. Tocava violino. Andava descalço em Princeton. Era profundamente humano.\n\nLEGADO (11:00–12:30)\n"A imaginação é mais importante que o conhecimento." — Albert Einstein',
        Imagens:'Foto sépia Einstein jovem;Foto icônica com a língua;Manuscrito E=mc²;Eclipse solar 1919;Einstein em Princeton',
        Recomendacoes:'Trilha orquestral suave. Animação da equação no minuto 5. Thumbnail: rosto + equação dourada sobre fundo escuro.',
        Faltando:'Narração de IA ainda não gerada. Imagens do eclipse solar. Thumbnail final aprovado.',
        Tags:'einstein,ciencia,fisica,legado' },

      { ID:uid(), Tema:'Einstein — Short #1: A Escola o Reprovou', Categoria:'Ciência', Formato:'Short', Status:'Planejado', Data:add(4),
        Descricao:'Corte do vídeo principal — hook de 55 segundos.',
        Roteiro:'Usar trecho 0:00 a 0:55 do vídeo principal. Texto impactante na abertura: "Reprovado. Sem futuro. Genial."',
        Imagens:'Mesmas do vídeo principal.',
        Recomendacoes:'Legenda em todo o vídeo. Texto grande na abertura. Corte rápido.',
        Faltando:'Aguardar vídeo principal. Adicionar legendas.',
        Tags:'einstein,short,motivacao' },

      { ID:uid(), Tema:'Ogum — O Guerreiro de Ferro', Categoria:'Mitologia', Formato:'YouTube', Status:'Planejado', Data:add(14),
        Descricao:'História e simbologia de Ogum no Candomblé e Umbanda.',
        Roteiro:'',
        Imagens:'Arte chibi Ogum;Estatueta dourada;Pintura épica de batalha',
        Recomendacoes:'Trilha com percussão africana. Mostrar estatueta impressa no final do vídeo.',
        Faltando:'Roteiro completo. Narração. Imagens adicionais de rituais.',
        Tags:'ogum,mitologia,candomble,umbanda' },
    ];

    state.ideias = [
      { ID:uid(), Tema:'Oxossi — O Caçador Divino', Categoria:'Espiritualidade', Nota:'Conexões com a natureza e arquétipo do caçador', Prioridade:'Alta', DataCriacao:fmt(today) },
      { ID:uid(), Tema:'Buddha — O Caminho do Meio', Categoria:'Espiritualidade', Nota:'Vida, iluminação e os 4 pilares do budismo', Prioridade:'Alta', DataCriacao:fmt(today) },
      { ID:uid(), Tema:'Nefertiti — A Rainha Esquecida', Categoria:'História', Nota:'Poder feminino no Egito Antigo', Prioridade:'Média', DataCriacao:fmt(today) },
      { ID:uid(), Tema:'Freud — O Inconsciente e os Sonhos', Categoria:'Filosofia', Nota:'Conectar com psicologia prática', Prioridade:'Média', DataCriacao:fmt(today) },
      { ID:uid(), Tema:'Maria — Mãe e Símbolo Universal', Categoria:'Espiritualidade', Nota:'Abordagem ecuménica além do catolicismo', Prioridade:'Alta', DataCriacao:fmt(today) },
    ];

    state.produtos = [
      { ID:uid(), Nome:'Estatueta São Miguel Arcanjo', Tipo:'Impressão 3D', Status:'Disponível', Preco:'', LinkDrive:'', Notas:'Azul, filamento PLA' },
      { ID:uid(), Nome:'Buda Porta-Livros', Tipo:'Impressão 3D', Status:'Disponível', Preco:'', LinkDrive:'', Notas:'Dourado, PLA' },
      { ID:uid(), Nome:'Ogum — Chibi Arte Digital', Tipo:'Arte Digital', Status:'Disponível', Preco:'', LinkDrive:'', Notas:'Chaveiro / imã de geladeira' },
    ];
  },

  renderGreeting() {
    const h=new Date().getHours();
    const s=h<12?'Bom dia':h<18?'Boa tarde':'Boa noite';
    const el=document.getElementById('greeting');
    if(el) el.textContent=`${s}! Aqui está o resumo do seu projeto.`;
  },

  renderDashboard() {
    const pub  = state.conteudo.filter(c=>c.Status==='Publicado').length;
    const prod = state.conteudo.filter(c=>c.Status==='Em produção').length;
    document.getElementById('stats-grid').innerHTML=`
      <div class="stat-card"><div class="stat-num">${state.conteudo.length}</div><div class="stat-label">Conteúdos</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--green)">${pub}</div><div class="stat-label">Publicados</div></div>
      <div class="stat-card"><div class="stat-num" style="color:var(--amber)">${prod}</div><div class="stat-label">Em produção</div></div>
      <div class="stat-card"><div class="stat-num">${state.ideias.length}</div><div class="stat-label">Ideias</div></div>
    `;

    const upcoming = state.conteudo.filter(c=>c.Status!=='Publicado'&&c.Data).sort((a,b)=>a.Data.localeCompare(b.Data)).slice(0,5);
    document.getElementById('upcoming-list').innerHTML = upcoming.length
      ? upcoming.map(c=>{
          const d=new Date(c.Data+'T12:00:00');
          return `<div class="upcoming-item" onclick="app.openDetail('${c.ID}')" style="cursor:pointer">
            <div class="upcoming-date"><div class="day">${d.getDate()}</div><div class="month">${d.toLocaleDateString('pt-BR',{month:'short'})}</div></div>
            <div class="upcoming-info"><div class="title">${c.Tema}</div><div class="meta">${c.Formato} · ${c.Categoria}</div></div>
            ${statusEl(c.Status)}
          </div>`;
        }).join('')
      : '<div class="empty-state">Nenhum conteúdo agendado.</div>';

    document.getElementById('ideas-preview').innerHTML = state.ideias.slice(0,5).map(i=>`
      <div class="upcoming-item">
        <div class="upcoming-info"><div class="title">${i.Tema}</div><div class="meta">${i.Nota||''}</div></div>
        ${badge(i.Categoria)}
      </div>`).join('') || '<div class="empty-state">Nenhuma ideia.</div>';
  },

  renderConteudo() {
    const cat    = document.getElementById('filter-cat')?.value||'';
    const status = document.getElementById('filter-status')?.value||'';
    const fmt    = document.getElementById('filter-fmt')?.value||'';
    const search = (document.getElementById('filter-search')?.value||'').toLowerCase();
    const filtered = state.conteudo.filter(c=>
      (!cat||c.Categoria===cat)&&(!status||c.Status===status)&&
      (!fmt||c.Formato===fmt)&&(!search||c.Tema.toLowerCase().includes(search)||(c.Tags||'').toLowerCase().includes(search))
    );
    const tbody = document.getElementById('conteudo-tbody');
    tbody.innerHTML = filtered.length ? filtered.map(c=>`
      <tr class="conteudo-row" onclick="app.openDetail('${c.ID}')" style="cursor:pointer">
        <td><strong>${c.Tema}</strong>${c.Descricao?`<br><span style="font-size:11px;color:var(--text3)">${c.Descricao}</span>`:''}</td>
        <td>${badge(c.Categoria)}</td>
        <td><span style="font-size:12px;color:var(--text2)">${c.Formato}</span></td>
        <td>${statusEl(c.Status)}</td>
        <td style="font-size:12px;color:var(--text2)">${fmtDate(c.Data)}</td>
        <td onclick="event.stopPropagation()"><button class="btn-ghost" onclick="modals.openConteudo('${c.ID}')">Editar</button></td>
      </tr>`).join('')
      : `<tr><td colspan="6" class="empty-state">Nenhum conteúdo encontrado.</td></tr>`;
  },

  openDetail(id) {
    const c = state.conteudo.find(x=>x.ID===id);
    if (!c) return;
    const faltando = (c.Faltando||'').split('.').filter(Boolean);
    const imagens  = (c.Imagens||'').split(';').filter(Boolean);
    const progItems = [
      { label:'Roteiro',   done:!!(c.Roteiro&&c.Roteiro.trim().length>10) },
      { label:'Imagens',   done:!!(c.Imagens&&c.Imagens.trim()) },
      { label:'Narração',  done: c.Status==='Publicado'||(c.Faltando||'').toLowerCase().indexOf('narra')===-1 },
      { label:'Edição',    done: c.Status==='Publicado' },
      { label:'Publicado', done: c.Status==='Publicado' },
    ];
    const progPct = Math.round(progItems.filter(p=>p.done).length/progItems.length*100);

    document.getElementById('detail-content').innerHTML = `
      <div class="detail-header">
        <button class="btn-ghost" onclick="app.closeDetail()" style="margin-bottom:16px">← Voltar</button>
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap">
          <div>
            <h2 style="font-family:var(--font-display);font-size:26px;font-weight:300;color:var(--text);margin-bottom:8px">${c.Tema}</h2>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
              ${badge(c.Categoria)}
              <span style="font-size:12px;color:var(--text2)">${c.Formato}</span>
              ${statusEl(c.Status)}
              ${c.Data?`<span style="font-size:12px;color:var(--text3)">📅 ${fmtDate(c.Data)}</span>`:''}
            </div>
          </div>
          <button class="btn-primary" onclick="modals.openConteudo('${c.ID}')">Editar</button>
        </div>
        <div class="detail-progress">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--text2)">Progresso de produção</span>
            <span style="font-size:12px;font-weight:500;color:var(--gold)">${progPct}%</span>
          </div>
          <div class="progress-bar"><div class="progress-fill" style="width:${progPct}%"></div></div>
          <div class="progress-steps">
            ${progItems.map(p=>`<div class="progress-step ${p.done?'done':''}"><div class="step-dot"></div><span>${p.label}</span></div>`).join('')}
          </div>
        </div>
      </div>
      <div class="detail-grid">
        <div class="detail-card full-width">
          <div class="detail-card-title">📝 Roteiro</div>
          ${c.Roteiro&&c.Roteiro.trim()?`<pre class="roteiro-text">${c.Roteiro}</pre>`:`<div class="detail-empty">Roteiro ainda não adicionado. Clique em Editar para adicionar.</div>`}
        </div>
        <div class="detail-card">
          <div class="detail-card-title">🖼 Imagens sugeridas</div>
          ${imagens.length?`<ul class="detail-list">${imagens.map(img=>`<li>${img.trim()}</li>`).join('')}</ul>`:`<div class="detail-empty">Nenhuma imagem especificada.</div>`}
        </div>
        <div class="detail-card">
          <div class="detail-card-title">💡 Recomendações</div>
          ${c.Recomendacoes&&c.Recomendacoes.trim()?`<p class="detail-text">${c.Recomendacoes}</p>`:`<div class="detail-empty">Nenhuma recomendação adicionada.</div>`}
        </div>
        <div class="detail-card">
          <div class="detail-card-title" style="color:var(--amber)">⚠ O que está faltando</div>
          ${faltando.length?`<ul class="detail-list missing">${faltando.map(f=>`<li>${f.trim()}</li>`).join('')}</ul>`:`<div class="detail-empty" style="color:var(--green)">✓ Nada faltando!</div>`}
        </div>
        ${c.Tags?`<div class="detail-card"><div class="detail-card-title">Tags</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px">${c.Tags.split(',').map(t=>`<span style="font-size:11px;background:var(--bg3);border:1px solid var(--border);padding:2px 10px;border-radius:20px;color:var(--text2)">#${t.trim()}</span>`).join('')}</div></div>`:''}
      </div>`;

    document.getElementById('page-conteudo').style.display='none';
    document.getElementById('page-detail').style.display='block';
  },

  closeDetail() {
    document.getElementById('page-detail').style.display='none';
    document.getElementById('page-conteudo').style.display='block';
    this.renderConteudo();
  },

  renderIdeias() {
    const grid = document.getElementById('ideias-grid');
    grid.innerHTML = state.ideias.length ? state.ideias.map((idea,i)=>`
      <div class="card">
        <div class="card-title">${idea.Tema}</div>
        ${badge(idea.Categoria)}
        <div class="card-note" style="margin-top:8px">${idea.Nota||''}</div>
        <div class="card-actions">
          <button class="btn-ghost" onclick="app.promoteIdeia(${i})">→ Produzir</button>
          <button class="btn-ghost" onclick="app.deleteIdeia(${i})" style="color:var(--text3)">Excluir</button>
        </div>
      </div>`).join('')
      : '<div class="empty-state" style="grid-column:1/-1">Nenhuma ideia ainda.</div>';
  },

  renderProdutos() {
    const grid = document.getElementById('produtos-grid');
    grid.innerHTML = state.produtos.length ? state.produtos.map((p,i)=>`
      <div class="card">
        <div class="card-title">${p.Nome}</div>
        <div style="display:flex;gap:8px;margin:6px 0"><span class="badge" style="background:var(--gold-dim);color:var(--gold)">${p.Tipo}</span></div>
        <div class="card-note">${p.Notas||''}</div>
        ${p.LinkDrive?`<a href="${p.LinkDrive}" target="_blank" class="file-link">Abrir no Drive ↗</a>`:''}
        <div class="card-actions" style="margin-top:10px">
          <button class="btn-ghost" onclick="app.deleteProduto(${i})" style="color:var(--text3)">Excluir</button>
        </div>
      </div>`).join('')
      : '<div class="empty-state" style="grid-column:1/-1">Nenhum produto cadastrado.</div>';
  },

  // ============================================================
  // CALENDÁRIO
  // ============================================================
  renderCalendario() {
    this._renderCalHeader();
    if (state.calView==='month') this._renderMonthView();
    else this._renderWeekView();
  },

  _renderCalHeader() {
    const d = state.calDate;
    const monthName = d.toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
    document.getElementById('cal-header').innerHTML=`
      <div style="display:flex;align-items:center;gap:10px">
        <button class="btn-ghost cal-nav" onclick="app.calPrev()">‹</button>
        <span class="cal-month-label">${monthName}</span>
        <button class="btn-ghost cal-nav" onclick="app.calNext()">›</button>
        <button class="btn-ghost" onclick="app.calToday()" style="font-size:12px">Hoje</button>
      </div>
      <div class="cal-view-btns">
        <button class="btn-ghost ${state.calView==='month'?'cal-view-active':''}" onclick="app.setCalView('month')">Mês</button>
        <button class="btn-ghost ${state.calView==='week'?'cal-view-active':''}" onclick="app.setCalView('week')">Semana</button>
      </div>`;
  },

  _renderMonthView() {
    const d=state.calDate, year=d.getFullYear(), month=d.getMonth();
    const today=new Date();
    const firstDay=new Date(year,month,1);
    const lastDay=new Date(year,month+1,0);
    let startDow=firstDay.getDay();
    startDow=startDow===0?6:startDow-1;
    const totalCells=Math.ceil((startDow+lastDay.getDate())/7)*7;

    const byDate={};
    state.conteudo.forEach(c=>{ if(c.Data){ if(!byDate[c.Data])byDate[c.Data]=[]; byDate[c.Data].push(c); } });

    const DOW=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
    let html=`<div class="cal-grid-month">`;
    DOW.forEach(d=>{ html+=`<div class="cal-dow">${d}</div>`; });

    for(let i=0;i<totalCells;i++){
      const dayNum=i-startDow+1;
      const isValid=dayNum>=1&&dayNum<=lastDay.getDate();
      const dateStr=isValid?`${year}-${String(month+1).padStart(2,'0')}-${String(dayNum).padStart(2,'0')}`:'';
      const isToday=isValid&&today.getFullYear()===year&&today.getMonth()===month&&today.getDate()===dayNum;
      const events=dateStr?(byDate[dateStr]||[]):[];

      html+=`<div class="cal-day-cell ${isValid?'':'other-month'} ${isToday?'today':''}">`;
      if(isValid){
        html+=`<div class="cal-day-num ${isToday?'today-num':''}">${dayNum}</div>`;
        events.forEach(ev=>{
          const cls=CAT_CLASS[ev.Categoria]||'ciencia';
          html+=`<div class="cal-event cal-event-${cls}" onclick="app.openDetail('${ev.ID}')" title="${ev.Tema} — ${ev.Status}">
            <span class="cal-event-fmt">${ev.Formato.slice(0,2)}</span>
            <span class="cal-event-name">${ev.Tema}</span>
          </div>`;
        });
        html+=`<div class="cal-add-btn" onclick="app.calNewOn('${dateStr}')">+</div>`;
      }
      html+=`</div>`;
    }
    html+=`</div>`;
    document.getElementById('cal-body').innerHTML=html;
  },

  _renderWeekView() {
    const d=new Date(state.calDate);
    const dow=d.getDay()===0?6:d.getDay()-1;
    d.setDate(d.getDate()-dow);
    const today=new Date();
    const days=[];
    for(let i=0;i<7;i++){ const day=new Date(d); day.setDate(d.getDate()+i); days.push(day); }

    const byDate={};
    state.conteudo.forEach(c=>{ if(c.Data){ if(!byDate[c.Data])byDate[c.Data]=[]; byDate[c.Data].push(c); } });

    const DOW=['Seg','Ter','Qua','Qui','Sex','Sáb','Dom'];
    let html=`<div class="cal-grid-week">`;
    days.forEach((day,i)=>{
      const dateStr=day.toISOString().split('T')[0];
      const isToday=day.getFullYear()===today.getFullYear()&&day.getMonth()===today.getMonth()&&day.getDate()===today.getDate();
      const events=byDate[dateStr]||[];
      html+=`<div class="cal-week-col ${isToday?'today':''}">
        <div class="cal-week-header">
          <div class="cal-week-dow">${DOW[i]}</div>
          <div class="cal-week-day ${isToday?'today-num':''}">${day.getDate()}</div>
        </div>
        <div class="cal-week-events">
          ${events.map(ev=>{
            const cls=CAT_CLASS[ev.Categoria]||'ciencia';
            return `<div class="cal-week-event cal-event-${cls}" onclick="app.openDetail('${ev.ID}')">
              <div class="cal-week-event-fmt">${ev.Formato}</div>
              <div class="cal-week-event-name">${ev.Tema}</div>
              ${statusEl(ev.Status)}
            </div>`;
          }).join('')}
          <div class="cal-add-btn" onclick="app.calNewOn('${dateStr}')">+</div>
        </div>
      </div>`;
    });
    html+=`</div>`;
    document.getElementById('cal-body').innerHTML=html;
  },

  calPrev() { if(state.calView==='month')state.calDate.setMonth(state.calDate.getMonth()-1); else state.calDate.setDate(state.calDate.getDate()-7); this.renderCalendario(); },
  calNext() { if(state.calView==='month')state.calDate.setMonth(state.calDate.getMonth()+1); else state.calDate.setDate(state.calDate.getDate()+7); this.renderCalendario(); },
  calToday() { state.calDate=new Date(); this.renderCalendario(); },
  setCalView(v) { state.calView=v; this.renderCalendario(); },
  calNewOn(dateStr) { modals.openConteudo(null, dateStr); },

  showPage(name) {
    document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.remove('active'));
    const det=document.getElementById('page-detail');
    if(det) det.style.display='none';
    document.getElementById(`page-${name}`)?.classList.add('active');
    document.querySelector(`[data-page="${name}"]`)?.classList.add('active');
    if(name==='conteudo')   this.renderConteudo();
    if(name==='ideias')     this.renderIdeias();
    if(name==='produtos')   this.renderProdutos();
    if(name==='calendario') this.renderCalendario();
    if(name==='arquivos')   drive.listFiles();
  },

  promoteIdeia(idx) {
    const idea=state.ideias[idx];
    state.conteudo.push({ ID:uid(), Tema:idea.Tema, Categoria:idea.Categoria, Formato:'YouTube', Status:'Planejado', Data:'', Descricao:idea.Nota||'', Roteiro:'', Imagens:'', Recomendacoes:'', Faltando:'Roteiro. Narração. Imagens. Edição.', Tags:'' });
    state.ideias.splice(idx,1);
    this.renderIdeias(); this.renderDashboard();
    toast.show(`✓ "${idea.Tema}" movida para Conteúdo!`);
  },
  deleteIdeia(idx)   { state.ideias.splice(idx,1);   this.renderIdeias();   this.renderDashboard(); toast.show('Ideia excluída.'); },
  deleteProduto(idx) { state.produtos.splice(idx,1); this.renderProdutos(); toast.show('Produto excluído.'); },
};

// ============================================================
const modals = {
  close(e) { if(e.target===document.getElementById('modal-bg')) document.getElementById('modal-bg').classList.remove('open'); },
  _open(html) { document.getElementById('modal-content').innerHTML=html; document.getElementById('modal-bg').classList.add('open'); },

  openConteudo(id, preDate) {
    const c=id?state.conteudo.find(x=>x.ID===id):{};
    this._open(`
      <h3>${!id?'Novo':'Editar'} Conteúdo</h3>
      <div class="form-row"><label>Personagem / Tema</label><input id="f-tema" value="${c.Tema||''}" placeholder="Ex: Albert Einstein — Vida e Legado"></div>
      <div class="form-row"><label>Categoria</label><select id="f-cat">${['Ciência','Espiritualidade','Filosofia','Mitologia','História'].map(o=>`<option ${c.Categoria===o?'selected':''}>${o}</option>`).join('')}</select></div>
      <div class="form-row"><label>Formato</label><select id="f-fmt">${['YouTube','Short','Reels','Carrossel'].map(o=>`<option ${c.Formato===o?'selected':''}>${o}</option>`).join('')}</select></div>
      <div class="form-row"><label>Status</label><select id="f-status">${['Planejado','Em produção','Publicado'].map(o=>`<option ${c.Status===o?'selected':''}>${o}</option>`).join('')}</select></div>
      <div class="form-row"><label>Data</label><input type="date" id="f-data" value="${c.Data||preDate||''}"></div>
      <div class="form-row"><label>Descrição</label><textarea id="f-desc">${c.Descricao||''}</textarea></div>
      <div class="form-row"><label>Roteiro</label><textarea id="f-roteiro" style="min-height:120px">${c.Roteiro||''}</textarea></div>
      <div class="form-row"><label>Imagens sugeridas (separadas por ;)</label><input id="f-imgs" value="${c.Imagens||''}" placeholder="Foto sépia; Eclipse 1919; Manuscrito"></div>
      <div class="form-row"><label>Recomendações</label><textarea id="f-rec">${c.Recomendacoes||''}</textarea></div>
      <div class="form-row"><label>O que está faltando (separado por .)</label><input id="f-falt" value="${c.Faltando||''}" placeholder="Narração. Thumbnail. Edição final."></div>
      <div class="form-row"><label>Tags (separadas por vírgula)</label><input id="f-tags" value="${c.Tags||''}" placeholder="einstein,ciencia,fisica"></div>
      <div class="modal-btns">
        <button class="btn-cancel" onclick="document.getElementById('modal-bg').classList.remove('open')">Cancelar</button>
        <button class="btn-primary" onclick="modals.saveConteudo('${id||''}')">Salvar</button>
      </div>`);
  },

  async saveConteudo(id) {
    const tema=document.getElementById('f-tema').value.trim();
    if(!tema){toast.show('Preencha o tema.');return;}
    const item={ ID:id||uid(), Tema:tema, Categoria:document.getElementById('f-cat').value, Formato:document.getElementById('f-fmt').value, Status:document.getElementById('f-status').value, Data:document.getElementById('f-data').value, Descricao:document.getElementById('f-desc').value, Roteiro:document.getElementById('f-roteiro').value, Imagens:document.getElementById('f-imgs').value, Recomendacoes:document.getElementById('f-rec').value, Faltando:document.getElementById('f-falt').value, Tags:document.getElementById('f-tags').value };
    if(id){ const idx=state.conteudo.findIndex(x=>x.ID===id); if(idx>=0)state.conteudo[idx]=item; } else { state.conteudo.push(item); }
    document.getElementById('modal-bg').classList.remove('open');
    app.renderConteudo(); app.renderDashboard();
    toast.show('✓ Conteúdo salvo!');
  },

  openIdeia() {
    this._open(`
      <h3>Nova Ideia</h3>
      <div class="form-row"><label>Personagem / Tema</label><input id="fi-tema" placeholder="Ex: Oxossi — O Caçador Divino"></div>
      <div class="form-row"><label>Categoria</label><select id="fi-cat">${['Ciência','Espiritualidade','Filosofia','Mitologia','História'].map(o=>`<option>${o}</option>`).join('')}</select></div>
      <div class="form-row"><label>Nota rápida</label><textarea id="fi-nota" placeholder="Ideias, referências, abordagem..."></textarea></div>
      <div class="form-row"><label>Prioridade</label><select id="fi-prio"><option>Alta</option><option>Média</option><option>Baixa</option></select></div>
      <div class="modal-btns">
        <button class="btn-cancel" onclick="document.getElementById('modal-bg').classList.remove('open')">Cancelar</button>
        <button class="btn-primary" onclick="modals.saveIdeia()">Salvar</button>
      </div>`);
  },

  saveIdeia() {
    const tema=document.getElementById('fi-tema').value.trim();
    if(!tema){toast.show('Preencha o tema.');return;}
    state.ideias.push({ ID:uid(), Tema:tema, Categoria:document.getElementById('fi-cat').value, Nota:document.getElementById('fi-nota').value, Prioridade:document.getElementById('fi-prio').value, DataCriacao:new Date().toISOString().split('T')[0] });
    document.getElementById('modal-bg').classList.remove('open');
    app.renderIdeias(); app.renderDashboard();
    toast.show('✓ Ideia salva!');
  },

  openProduto() {
    this._open(`
      <h3>Novo Produto</h3>
      <div class="form-row"><label>Nome</label><input id="fp-nome" placeholder="Ex: Estatueta São Miguel"></div>
      <div class="form-row"><label>Tipo</label><select id="fp-tipo"><option>Impressão 3D</option><option>Arte Digital</option><option>E-book</option><option>Curso</option><option>Outro</option></select></div>
      <div class="form-row"><label>Status</label><select id="fp-status"><option>Disponível</option><option>Em desenvolvimento</option><option>Descontinuado</option></select></div>
      <div class="form-row"><label>Preço (R$)</label><input id="fp-preco" placeholder="45.00"></div>
      <div class="form-row"><label>Link no Drive</label><input id="fp-link" placeholder="https://drive.google.com/..."></div>
      <div class="form-row"><label>Notas</label><textarea id="fp-notas" placeholder="Material, cor, tamanho..."></textarea></div>
      <div class="modal-btns">
        <button class="btn-cancel" onclick="document.getElementById('modal-bg').classList.remove('open')">Cancelar</button>
        <button class="btn-primary" onclick="modals.saveProduto()">Salvar</button>
      </div>`);
  },

  saveProduto() {
    const nome=document.getElementById('fp-nome').value.trim();
    if(!nome){toast.show('Preencha o nome.');return;}
    state.produtos.push({ ID:uid(), Nome:nome, Tipo:document.getElementById('fp-tipo').value, Status:document.getElementById('fp-status').value, Preco:document.getElementById('fp-preco').value, LinkDrive:document.getElementById('fp-link').value, Notas:document.getElementById('fp-notas').value });
    document.getElementById('modal-bg').classList.remove('open');
    app.renderProdutos();
    toast.show('✓ Produto salvo!');
  },
};
