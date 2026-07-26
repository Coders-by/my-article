/**
 * Chapbook Engine — 把结构化的文字变成可打印的网页小册
 * 期望 window.CHAPBOOK 数据结构：
 * {
 *   meta: {
 *     title: '书名',
 *     subtitle?: '副标题',
 *     editor?: '编者 / 作者行',
 *     eyeLabel?: '词眼'   // 每页左侧关键词的 label，默认"词眼"
 *   },
 *   volumes: [
 *     {
 *       name: '卷名（如 梦）',
 *       poet?: '作者名',
 *       quote?: '卷首引用',
 *       items: [
 *         {
 *           title: '标题',
 *           subtitle?: '副标题',
 *           eye?: '关键词',
 *           content: [ ['段落1行1', '段落1行2'], ['段落2'] ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 */
(function () {
  const cfg = window.CHAPBOOK;
  if (!cfg) return;
  const container = document.getElementById('sheets');
  if (!container) return;

  const ZH_NUM = '零一二三四五六七八九十';
  const DIVIDER_BG = ['壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖', '拾'];
  const eyeLabel = cfg.meta.eyeLabel || '词眼';

  const toZh = (n) => {
    if (n < 10) return ZH_NUM[n];
    if (n < 20) return '十' + (n % 10 ? ZH_NUM[n % 10] : '');
    return ZH_NUM[Math.floor(n / 10)] + '十' + (n % 10 ? ZH_NUM[n % 10] : '');
  };

  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const displayTitle = (item) => item.subtitle ? `${item.title} · ${item.subtitle}` : item.title;

  const total = cfg.volumes.reduce((s, v) => s + v.items.length, 0);
  const editorLine = cfg.meta.editor || cfg.volumes.map(v => v.poet).filter(Boolean).join(' · ');

  // ---------- 封面 ----------
  const cover = `
    <section class="sheet cover">
      <div class="cover-top">自 选 辑 本</div>
      <div class="cover-main">
        <h1 class="cover-title">${esc(cfg.meta.title)}</h1>
        <div class="cover-line"><span>❦</span></div>
        <p class="cover-sub">${esc(cfg.meta.subtitle || `共 ${toZh(total)} 篇`)}</p>
      </div>
      <div class="cover-poets">${esc(editorLine)}</div>
    </section>`;

  // ---------- 目录 ----------
  let tocIdx = 0;
  const toc = `
    <section class="sheet toc">
      <div class="toc-head"><h2>目录</h2></div>
      <div class="toc-body">
        ${cfg.volumes.map((vol, i) => `
          <div class="toc-group">
            <p class="toc-poet">卷${toZh(i + 1)} · ${esc(vol.name)}${vol.poet ? ' · ' + esc(vol.poet) : ''}</p>
            <div class="toc-items">
              ${vol.items.map(item => `
                <div class="toc-item">
                  <span class="num">${String(++tocIdx).padStart(2, '0')}</span>
                  <span>${esc(displayTitle(item))}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="folio"></div>
    </section>`;

  // ---------- 卷首 + 正文 ----------
  const pages = [];
  cfg.volumes.forEach((vol, volIdx) => {
    const volLabel = `卷${toZh(volIdx + 1)} · ${vol.name}`;

    pages.push(`
      <section class="sheet divider">
        <span class="divider-bg" aria-hidden="true">${DIVIDER_BG[volIdx] || String(volIdx + 1)}</span>
        <div class="divider-inner">
          <p class="divider-label">${esc(volLabel)}</p>
          <h2 class="divider-name">${esc(vol.name)}</h2>
          ${vol.quote ? `<p class="divider-quote">${esc(vol.quote)}</p>` : ''}
          ${vol.poet ? `<p class="divider-poet">${esc(vol.poet)}</p>` : ''}
        </div>
        <div class="folio"></div>
      </section>`);

    vol.items.forEach((item, i) => {
      const lines = item.content.reduce((s, st) => s + st.length, 0);
      const size = lines <= 9 ? '' : lines <= 15 ? 'medium' : 'long';
      pages.push(`
        <section class="sheet poem ${size}">
          <div class="poem-head">
            <span>${esc(volLabel)}</span>
            <span>其${toZh(i + 1)}</span>
          </div>
          <div class="poem-body">
            ${item.eye ? `<div class="eye">${esc(eyeLabel)} · ${esc(item.eye)}</div>` : ''}
            <div>
              <h3 class="pai">${esc(item.title)}</h3>
              ${item.subtitle ? `<p class="ti">${esc(item.subtitle)}</p>` : ''}
              <div class="verses">
                ${item.content.map(stanza => `
                  <div class="stanza">
                    ${stanza.map(line => `<p>${esc(line)}</p>`).join('')}
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="folio" data-vol="${esc(volLabel)}"></div>
        </section>`);
    });
  });

  container.innerHTML = cover + toc + pages.join('');
})();
