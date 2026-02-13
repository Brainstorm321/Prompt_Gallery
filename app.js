(function(){
  const grid = document.getElementById('promptGrid');
  const searchInput = document.getElementById('searchInput');
  const filterFree = document.getElementById('filterFree');
  const filterPremium = document.getElementById('filterPremium');
  const typeSelect = document.getElementById('typeSelect');

  // 获取分类和排序的单选按钮组
  function getSelectedValue(name) {
    const el = document.querySelector(`input[name="${name}"]:checked`);
    return el ? el.value : 'all';
  }

  function matches(p){
    const q = (searchInput?.value || '').trim().toLowerCase();
    const allowFree = !!filterFree?.checked;
    const allowPremium = !!filterPremium?.checked;
    const type = (typeSelect?.value || 'all').toLowerCase();
    
    // 1. 分类筛选 (新增逻辑)
    const selectedCat = getSelectedValue('category');
    if(selectedCat !== 'all' && (p.category || '').toLowerCase() !== selectedCat.toLowerCase()) return false;

    // 2. 权限筛选
    if(p.access?.toLowerCase()==='free' && !allowFree) return false;
    if(p.access?.toLowerCase()==='premium' && !allowPremium) return false;

    // 3. 类型筛选
    if(type!=='all' && (p.type||'image').toLowerCase()!==type) return false;

    // 4. 搜索框筛选
    if(!q) return true;
    const hay=[
      p.title, p.subtitle, p.author, p.model, p.category,
      ...(p.tags||[])
    ].join(' ').toLowerCase();
    return hay.includes(q);
  }

  // 排序逻辑 (新增逻辑)
  function sortPrompts(list) {
    const sortBy = getSelectedValue('sort');
    if (sortBy === 'recent') return list; // 默认顺序
    if (sortBy === 'popular') return list.sort((a, b) => (b.access === 'Premium') - (a.access === 'Premium')); // 模拟流行度
    if (sortBy === 'random') return list.sort(() => Math.random() - 0.5);
    return list;
  }

  function render(){
    let list = PROMPTS.filter(matches);
    list = sortPrompts(list); // 执行排序
    grid.innerHTML = list.map(cardHTML).join('');
    bindCopyButtons(); // 重新绑定复制按钮
  }

  // 之前的 HTML 生成和复制逻辑保持不变...
  function cardHTML(p){
    const tagPills=(p.tags||[]).slice(0,5).map(t=>(
      `<span class="text-xs px-2 py-1 rounded-full bg-gray-700/60 text-gray-200 border border-gray-600/60">${escapeHtml(t)}</span>`
    )).join('');

    const accessBadge = p.access?.toLowerCase()==='premium'
      ? `<span class="text-sm font-semibold text-yellow-400">Premium</span>`
      : `<span class="text-sm font-semibold text-green-400">Free</span>`;

    return `
      <div class="group block bg-gray-800/60 hover:bg-gray-800 rounded-2xl overflow-hidden border border-gray-700/70 transition relative">
        <div class="relative overflow-hidden">
          <img src="${p.image}" alt="${escapeHtml(p.title)}" class="w-full h-44 object-cover transition duration-500 group-hover:scale-110"/>
          
          <div class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-6">
            <a href="detail.html?id=${encodeURIComponent(p.id)}" class="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-gray-900 hover:bg-blue-500 hover:text-white transition shadow-lg">
              <i class="bi bi-eye-fill text-xl"></i>
            </a>
            <button class="copy-btn w-12 h-12 bg-white/90 rounded-full flex items-center justify-center text-gray-900 hover:bg-green-500 hover:text-white transition shadow-lg" 
                    data-id="${escapeHtml(p.id)}" title="快速复制">
              <i class="bi bi-clipboard-fill text-xl"></i>
            </button>
          </div>
        </div>

        <div class="p-5">
          <div class="text-xl font-bold mb-2">${escapeHtml(p.title)}</div>
          <div class="flex flex-wrap gap-2 mb-4">${tagPills}</div>
          <div class="flex items-center justify-between">
            <div class="text-sm text-gray-300">Category: <span class="text-gray-100 font-semibold">${escapeHtml(p.category)}</span></div>
            ${accessBadge}
          </div>
        </div>
      </div>`;
  }
  
  function escapeHtml(s){ return String(s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#039;"}[m])); }

  function bindCopyButtons(){ /* 保持您原有的复制逻辑即可 */ }

  // 监听所有交互控件
  [searchInput, filterFree, filterPremium, typeSelect].forEach(el => {
    if(el) el.addEventListener('input', render);
  });
  
  // 新增：监听分类和排序的点击
  document.querySelectorAll('input[name="category"], input[name="sort"]').forEach(el => {
    el.addEventListener('change', render);
  });

  render();
})();