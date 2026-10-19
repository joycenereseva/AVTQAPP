/* Gera HTML autocontido da avaliação para os pais (sem Firebase) */
(function () {
  const PARENT_PAGE_CSS = `
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      background: #E7EFF2; color: #1A202C; line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    .app { max-width: 640px; margin: 0 auto; padding-bottom: 32px; }
    .hero {
      background: linear-gradient(135deg, #115F76 0%, #1A7A9A 100%);
      color: white; padding: 20px 16px 24px;
    }
    .hero-top { display: flex; gap: 14px; align-items: center; }
    .hero-photo {
      width: 72px; height: 72px; border-radius: 50%; object-fit: cover;
      border: 3px solid rgba(255,255,255,0.85); flex-shrink: 0;
      background: rgba(255,255,255,0.15);
    }
    .hero-photo.placeholder {
      display: flex; align-items: center; justify-content: center; font-size: 28px;
    }
    .hero h1 { font-size: 1.35rem; font-weight: 700; line-height: 1.2; }
    .hero .sub { font-size: 0.9rem; opacity: 0.9; margin-top: 4px; }
    .hero .badge {
      display: inline-block; margin-top: 10px;
      background: rgba(255,255,255,0.18); padding: 4px 10px;
      border-radius: 20px; font-size: 0.8rem; font-weight: 600;
    }
    .dates-bar {
      display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px;
      padding: 12px 16px; background: white; border-bottom: 1px solid #C8DDE8;
      font-size: 0.72rem;
    }
    .dates-bar div { text-align: center; }
    .dates-bar strong { display: block; color: #115F76; font-size: 0.68rem; text-transform: uppercase; }
    .dates-bar span { color: #64748B; }
    .dates-bar .active span { color: #115F76; font-weight: 700; }
    .section {
      margin: 12px 12px 0; background: white; border-radius: 10px;
      overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .section-title {
      background: #115F76; color: white; padding: 10px 14px;
      font-size: 0.82rem; font-weight: 700; text-align: center;
      text-transform: uppercase; letter-spacing: 0.3px;
    }
    .section-body { display: flex; }
    .skills-col { flex: 1; padding: 10px 12px; min-width: 0; }
    .skill-row { font-size: 0.88rem; padding: 4px 0; border-bottom: 1px solid #F1F5F9; }
    .skill-row:last-child { border-bottom: none; }
    .skill-name { color: #334155; }
    .skill-val { font-weight: 700; }
    .nom-col {
      width: 38%; max-width: 150px; background: #EEF4F8;
      border-left: 1px solid #C8DDE8; padding: 8px;
      font-size: 0.62rem; line-height: 1.4;
    }
    .nom-title {
      font-weight: 700; color: #115F76; text-transform: uppercase;
      font-size: 0.58rem; margin-bottom: 4px; padding-bottom: 3px;
      border-bottom: 1px solid #C8DDE8;
    }
    .nom-col strong { color: #115F76; }
    .ntnav { padding: 12px; text-align: center; color: #C0392B; font-weight: 700; font-size: 0.85rem; }
    .text-block {
      margin: 12px 12px 0; background: white; border-radius: 10px;
      overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    }
    .text-block .head { background: #115F76; color: white; padding: 10px 14px; font-size: 0.8rem; font-weight: 700; }
    .text-block .head small { display: block; font-weight: 400; opacity: 0.8; font-size: 0.72rem; margin-top: 2px; }
    .text-block .body { padding: 12px 14px; font-size: 0.92rem; white-space: pre-wrap; }
    .list-block li { margin-left: 18px; margin-bottom: 6px; font-size: 0.92rem; }
    .probe-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
    .probe-table th, .probe-table td { padding: 8px 12px; border-bottom: 1px solid #E2E8F0; text-align: left; }
    .probe-table th { background: #EEF4F8; color: #115F76; font-size: 0.75rem; }
    .chart-wrap { padding: 12px; overflow-x: auto; }
    .chart-bars { display: flex; align-items: flex-end; gap: 8px; min-height: 120px; padding-top: 8px; }
    .chart-bar-col { flex: 1; min-width: 36px; text-align: center; }
    .chart-bar { background: #1A7A9A; border-radius: 4px 4px 0 0; min-height: 4px; margin: 0 auto; width: 80%; }
    .chart-bar.mid { background: #E6A817; }
    .chart-bar.low { background: #E24B4A; }
    .chart-val { font-size: 0.75rem; font-weight: 700; color: #115F76; }
    .chart-lbl { font-size: 0.65rem; color: #64748B; margin-top: 4px; word-break: break-word; }
    .footer {
      margin: 20px 12px 0; padding: 14px; background: #115F76;
      color: rgba(255,255,255,0.9); border-radius: 10px;
      font-size: 0.78rem; text-align: center; line-height: 1.6;
    }
    @media (max-width: 380px) { .nom-col { display: none; } }
  `.trim();

  const PARENT_PAGE_SCRIPT = `
    const SECTIONS_INFANTIL = [
      { title: 'Elementos Essenciais da Psicomotricidade', fields: [
        'Organização espaço temporal','Lateralidade','Tonus elasticidade','Ritmo',
        'Coordenação motora global','Equilíbrio','Coordenação motora fina','Esquema corporal']},
      { title: 'Habilidades Motoras Estabilizadoras', fields: [
        'Equilíbrio dinâmico','Equilíbrio estático','Movimentos axiais']},
      { title: 'Habilidades Motoras Locomotoras na Natação', fields: [
        'Saltos','Apneia','Flutuação ventral','Saltitos','Respiração frontal','Flutuação dorsal',
        'Entradas','Deslocamento','Sustentação','Saídas','Mergulhos','Deslizes']},
      { title: 'Habilidades Manipulativas — Propulsores', fields: [
        'Chutar','Propulsão MMII','Propulsão MMSS','Arremessar objetos']},
      { title: 'Habilidades Manipulativas — Estabilizadores', fields: [
        'Alcançar','Segurar','Soltar','Agarrar']},
      { title: 'Habilidades de Condicionamento', fields: [
        'Resistência cardiovascular','Velocidade','Resistência muscular','Agilidade',
        'Flexibilidade','Coordenação','Capacidade de recuperação','Nado contínuo ritmado','Força dinâmica']},
    ];
    const SECTIONS_AVANCADO = [
      { title: 'Habilidades Motoras Aquáticas Fundamentais', fields: [
        'Respiração frontal','Deslocamento','Apneia','Deslocamento c/ respiração frontal',
        'Propulsão de MMII','Flutuação ventral','Propulsão de MMSS','Flutuação dorsal',
        'Manejo de materiais','Flutuação vertical','Entradas e saídas variadas','Salto']},
      { title: 'Habilidades Introdutórias para os Nados', fields: [
        'Deslize dorsal','Deslocamento subaquático','Deslize ventral','Giro p/ decúbito dorsal',
        'Ondulação','Giro p/ decúbito ventral','Submersão','Mudança de direção variada',
        'Rotação de tronco','Rotação de quadril','Streamline','Equilíbrio']},
      { title: 'Habilidades Específicas — Nado Crawl', fields: [
        'Educativos','Virada simples','Alinhamento corporal total','Propulsão MMII',
        'Virada olímpica','Respiração bilateral','Propulsão MMSS','Deslize',
        'Nado completo coordenado','Respiração lateral','Ondulação']},
      { title: 'Nado Costas', fields: [
        'Educativos','Virada simples','Propulsão MMII','Virada olímpica','Nado completo coordenado',
        'Propulsão MMSS','Deslize dorsal','Controle respiratório','Ondulação dorsal submersa']},
      { title: 'Nado Peito', fields: [
        'Educativos','Respiração frontal','Nado completo coordenado','Propulsão MMII',
        'Virada simples','Propulsão MMSS','Filipina']},
      { title: 'Nado Borboleta', fields: [
        'Educativos','Respiração frontal','Ondulação golfinho','Propulsão MMII',
        'Virada simples','Nado completo','Propulsão MMSS','Virada olímpica','Deslize']},
      { title: 'Habilidades de Condicionamento', fields: [
        'Resistência cardiovascular','Velocidade','Resistência muscular','Agilidade',
        'Flexibilidade','Coordenação','Capacidade de recuperação','Nado contínuo ritmado','Força dinâmica']},
    ];
    const nomAvd = [
      ['CTS','Com técnica simples'], ['CTA','Com técnica acertiva'],
      ['ATS','Autônomo 100%'], ['ATM','Autônomo c/ material'],
      ['RL','Realiza c/ limitação'], ['RDF+','Muita dificuldade'],
      ['CAP','Apoio da profª'], ['SAP','Sem apoio da profª'],
      ['N','Não faz'], ['NT','Não testado'],
    ];
    const nomCond = [
      ['RSNE','Sem esforço'], ['RPE','Pouco esforço'],
      ['RME','Muito esforço'], ['REE','Esforço extremo'],
      ['NR','Não realiza'], ['CAP','Apoio da profª'],
      ['SAP','Sem apoio'], ['CAR','Apoio responsável'],
      ['CAM','Apoio material'],
    ];
    function esc(s) {
      if (s == null) return '';
      return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
    function skillColor(v) {
      if (!v || v === '—') return '#444';
      if (['CTA','ATS','RSNE'].includes(v)) return '#0A7A3A';
      if (['CTS','ATM','RPE','RL','CAP','SAP'].includes(v)) return '#B07800';
      if (['RDF+','RME','REE','N','NT','NR','CAR','N. incluso'].includes(v)) return '#C0392B';
      return '#333';
    }
    function calcAge(nasc) {
      const n = parseInt(nasc, 10);
      return Number.isFinite(n) ? n : '—';
    }
    function nomHtml(arr) {
      const half = Math.ceil(arr.length / 2);
      const c1 = arr.slice(0, half);
      const c2 = arr.slice(half);
      const cell = function(pair) { return '<div><strong>' + esc(pair[0]) + '</strong> ' + esc(pair[1]) + '</div>'; };
      return '<div class="nom-title">Nomenclatura</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:0 4px;"><div>' +
        c1.map(cell).join('') + '</div><div>' + c2.map(cell).join('') + '</div></div>';
    }
    function renderSection(sec, skills, isInf) {
      const isCond = sec.title.indexOf('Condicionamento') >= 0;
      const nomArr = isCond ? nomCond : (isInf ? nomCond : nomAvd);
      const allNTNAV = sec.fields.every(function(f) { return (skills[sec.title + '::' + f] || '') === 'NTNAV'; });
      const rows = sec.fields.map(function(f) {
        const raw = skills[sec.title + '::' + f] || '—';
        const v = raw === 'NTNAV' ? 'N. incluso' : raw;
        return '<div class="skill-row"><span class="skill-name">' + esc(f) + ': </span><span class="skill-val" style="color:' + skillColor(v) + '">' + esc(v) + '</span></div>';
      }).join('');
      const body = allNTNAV
        ? '<div class="ntnav">NÃO INCLUSO NESTA AVALIAÇÃO</div>'
        : '<div class="section-body"><div class="skills-col">' + rows + '</div><div class="nom-col">' + nomHtml(nomArr) + '</div></div>';
      return '<div class="section"><div class="section-title">' + esc(sec.title) + '</div>' + body + '</div>';
    }
    function renderChart(rows) {
      const data = (rows || []).filter(function(r) { return r.habilidade && r.pontuacao !== ''; });
      if (!data.length) return '';
      const maxVal = Math.max.apply(null, data.map(function(r) { return parseFloat(r.pontuacao) || 0; }).concat([1]));
      const bars = data.map(function(r) {
        const val = parseFloat(r.pontuacao) || 0;
        const pct = Math.max((val / maxVal) * 100, 4);
        const cls = val >= maxVal * 0.8 ? '' : val >= maxVal * 0.5 ? 'mid' : 'low';
        return '<div class="chart-bar-col"><div class="chart-val">' + val + '</div><div class="chart-bar ' + cls + '" style="height:' + pct + 'px"></div><div class="chart-lbl">' + esc(r.habilidade) + '</div></div>';
      }).join('');
      return '<div class="chart-wrap"><div class="chart-bars">' + bars + '</div></div>';
    }
    function renderApp(data) {
      const student = data.student;
      const ev = data.eval;
      const cfg = data.config;
      const avDates = data.avDates;
      const isInf = student.modelo === 'infantil';
      const sections = isInf ? SECTIONS_INFANTIL : SECTIONS_AVANCADO;
      const skills = ev.skills || {};
      const foto = student.foto
        ? '<img class="hero-photo" src="' + esc(student.foto) + '" alt="Foto do aluno">'
        : '<div class="hero-photo placeholder">🏊</div>';
      const dateLabels = ['Avaliado', 'Reavaliado', 'Reavaliado', 'Reavaliado'];
      const datesBar = dateLabels.map(function(label, i) {
        const d = (avDates && avDates[i]) || '—';
        const active = i === 0 || d === ev.data ? ' active' : '';
        return '<div class="' + active + '"><strong>' + label + '</strong><span>' + esc(d) + '</span></div>';
      }).join('');
      const prova = ev.probeNaoIncluso
        ? '<div class="text-block"><div class="head">Prova</div><div class="body" style="text-align:center;color:#C0392B;font-weight:700;">Não incluso nesta avaliação</div></div>'
        : '<div class="text-block"><div class="head">Prova <small>Média total: ' + esc(ev.probeTotal || '—') + '</small></div><table class="probe-table"><thead><tr><th>Habilidade</th><th>Pontuação</th></tr></thead><tbody>' +
          (ev.probeRows || []).filter(function(r) { return r.habilidade; }).map(function(r) {
            return '<tr><td>' + esc(r.habilidade) + '</td><td><strong>' + esc(r.pontuacao) + '</strong></td></tr>';
          }).join('') + '</tbody></table>' + renderChart(ev.probeRows) + '</div>';
      function listBlock(title, items) {
        if (!items || !items.length) return '';
        return '<div class="text-block"><div class="head">' + title + '</div><div class="body"><ul class="list-block">' +
          items.map(function(i) { return '<li>' + esc(i) + '</li>'; }).join('') + '</ul></div></div>';
      }
      document.title = 'AVF — ' + student.nome;
      document.getElementById('root').innerHTML =
        '<div class="app"><div class="hero"><div class="hero-top">' + foto +
        '<div><h1>' + esc(student.nome) + '</h1><div class="sub">' + esc(calcAge(student.nasc)) + ' anos · ' + esc(student.turma || '—') + '</div>' +
        '<div class="badge">' + esc(ev.mes) + ' · ' + esc(ev.data) + '</div></div></div></div>' +
        '<div class="dates-bar">' + datesBar + '</div>' +
        sections.map(function(s) { return renderSection(s, skills, isInf); }).join('') +
        prova +
        '<div class="text-block"><div class="head">Classificação Gallahue (2013)<small>Gallahue; Ozmun; Goodway</small></div><div class="body">' + (esc(ev.gallahue) || '—') + '</div></div>' +
        '<div class="text-block"><div class="head">Estágio de Aprendizagem — Morgana (2020)</div><div class="body">' + (esc(ev.morgana) || '—') + '</div></div>' +
        listBlock('Desenvolturas', ev.desenvolturas) +
        listBlock('Dificuldades observadas', ev.dificuldades) +
        '<div class="text-block"><div class="head">Meta reavaliativa</div><div class="body">' + (esc(ev.meta) || '—') + '</div></div>' +
        '<div class="text-block"><div class="head">Considerações finais</div><div class="body">' + (esc(ev.consideracoes) || '—') + '</div></div>' +
        '<div class="footer"><strong>' + esc(cfg.nome || 'Prof.ª Joyce Neres') + '</strong><br>CREF ' + esc(cfg.cref || '—') + ' · ' + esc(cfg.tel || '') + '<br>' +
        esc(cfg.email || '') + '<br><span style="opacity:0.75">Ficha de Avaliação Técnica Qualitativa · Natação Particular</span></div></div>';
    }
    try {
      renderApp(JSON.parse(document.getElementById('avf-data').textContent));
    } catch (e) {
      document.getElementById('root').innerHTML = '<div style="padding:24px;text-align:center;color:#C0392B">Erro ao carregar avaliação.</div>';
    }
  `.trim();

  window.buildParentStandaloneHtml = function (payload) {
    const nome = (payload.student && payload.student.nome) || 'Aluno';
    const dataJson = JSON.stringify(payload).replace(/</g, '\\u003c');
    return '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n<meta charset="UTF-8">\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">\n' +
      '<meta name="theme-color" content="#115F76">\n' +
      '<title>AVF — ' + nome.replace(/</g, '') + '</title>\n<style>' + PARENT_PAGE_CSS + '</style>\n</head>\n<body>\n' +
      '<div id="root"></div>\n<script type="application/json" id="avf-data">' + dataJson + '<' + '/script>\n' +
      '<script>' + PARENT_PAGE_SCRIPT + '<' + '/script>\n</body>\n</html>';
  };
})();
