const Renderer = (() => {

  // ── 인트로 화면 ─────────────────────────────────────
  function renderIntro() {
    const screen = document.getElementById('screen-intro');
    screen.innerHTML = `
      <div class="intro-bg">
        <canvas id="starCanvas"></canvas>
        <div class="intro-content anim-slideup">
          <div class="title-logo">⚔️ AI-RPG-MAS ⚔️</div>
          <div class="title-sub">~ 도트 턴제 RPG ~</div>
          <div class="intro-buttons">
            <button class="pixel-btn intro-btn" id="btn-newgame">새 게임</button>
            <button class="pixel-btn intro-btn" id="btn-continue" style="display:none">이어하기</button>
            <button class="pixel-btn intro-btn" id="btn-drive">☁️ 클라우드 연동</button>
          </div>
          <div id="drive-status" class="drive-status"></div>
        </div>
      </div>
    `;
    _startStarAnimation();
    _bindIntroButtons();
    _checkSaveExists();
  }

  function _checkSaveExists() {
    const save = SaveManager.loadLocal();
    if (save && save.player) {
      document.getElementById('btn-continue').style.display = 'block';
    }
  }

  function _bindIntroButtons() {
    document.getElementById('btn-newgame').onclick = () => {
      StateManager.reset();
      GameEngine.goTo('create');
    };
    const cont = document.getElementById('btn-continue');
    if (cont) cont.onclick = async () => {
      const save = await SaveManager.load();
      if (save) {
        SaveManager.applySaveData(save);
        GameEngine.goTo('town');
      }
    };
    document.getElementById('btn-drive').onclick = async () => {
      const ok = await SaveManager.signInDrive();
      const el = document.getElementById('drive-status');
      el.textContent = ok ? '☁️ 클라우드 연결됨' : '❌ 연결 실패';
      el.style.color  = ok ? '#2ecc71' : '#e74c3c';
    };
  }

  // ── 별 애니메이션 ────────────────────────────────────
  function _startStarAnimation() {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.parentElement.offsetWidth  || 480;
    canvas.height = canvas.parentElement.offsetHeight || 800;

    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      alpha: Math.random()
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      stars.forEach(s => {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
        ctx.fill();
        s.alpha += s.speed * 0.05;
        if (s.alpha > 1 || s.alpha < 0) s.speed *= -1;
      });
      requestAnimationFrame(draw);
    }
    draw();
  }

  // ── 마을 화면 ────────────────────────────────────────
  function renderTown() {
    const player = StateManager.get('player');
    const gold   = StateManager.get('gold');
    const screen = document.getElementById('screen-town');

    screen.innerHTML = `
      <div class="town-header">
        <div class="player-info">
          <span class="player-emoji">${player?.emoji || '⚔️'}</span>
          <span class="player-name">${player?.name || ''}</span>
          <span class="player-level">Lv.${player?.level || 1}</span>
        </div>
        <div class="gold-display">💰 ${gold}</div>
      </div>
      <div class="town-hp-bar">
        <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;">
          <span>HP ${player?.hp || 0}/${player?.maxHp || 0}</span>
          <span>MP ${player?.mp || 0}/${player?.maxMp || 0}</span>
        </div>
        <div class="stat-bar" style="margin-bottom:4px;">
          <div class="stat-bar-fill hp-bar"
               style="width:${Character.hpPercent(player)*100}%"></div>
        </div>
        <div class="stat-bar">
          <div class="stat-bar-fill mp-bar"
               style="width:${Character.mpPercent(player)*100}%"></div>
        </div>
      </div>
      <div class="town-scene">
        <canvas id="townCanvas"></canvas>
      </div>
      <div class="town-grid">
        ${_buildingCard('🏰','던전','dungeon')}
        ${_buildingCard('🏪','상점','shop')}
        ${_buildingCard('🏨','여관','inn')}
        ${_buildingCard('📋','길드','guild')}
        ${_buildingCard('⚒️','대장간','blacksmith')}
        ${_buildingCard('🍺','주점','tavern')}
      </div>
    `;

    _bindTownButtons();
    _renderTownScene();
  }

  function _buildingCard(icon, name, id) {
    return `
      <div class="town-building" data-building="${id}">
        <div class="building-icon">${icon}</div>
        <div class="building-name">${name}</div>
      </div>`;
  }

  function _bindTownButtons() {
    document.querySelectorAll('.town-building').forEach(el => {
      el.onclick = () => {
        const b = el.dataset.building;
        switch (b) {
          case 'dungeon':    GameEngine.goTo('dungeon'); break;
          case 'shop':       showShopModal();     break;
          case 'inn':        showInnModal();      break;
          case 'guild':      showGuildModal();    break;
          case 'blacksmith': showBlacksmithModal(); break;
          case 'tavern':     showTavernModal();   break;
        }
      };
    });
  }

  function _renderTownScene() {
    const canvas = document.getElementById('townCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = canvas.parentElement.offsetWidth  || 480;
    canvas.height = 120;

    // 간단한 마을 배경 도트 드로잉
    ctx.fillStyle = '#1a3a5c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 땅
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 90, canvas.width, 30);

    // 건물들
    const buildings = [
      { x: 20,  y: 50, w: 60, h: 40, color: '#8B4513', roof: '#c0392b' },
      { x: 100, y: 40, w: 70, h: 50, color: '#6b3a2a', roof: '#8e44ad' },
      { x: 190, y: 55, w: 55, h: 35, color: '#5a3825', roof: '#2980b9' },
      { x: 265, y: 45, w: 65, h: 45, color: '#7a4030', roof: '#27ae60' },
      { x: 350, y: 50, w: 60, h: 40, color: '#8B4513', roof: '#e67e22' }
    ];

    buildings.forEach(b => {
      // 벽
      ctx.fillStyle = b.color;
      ctx.fillRect(b.x, b.y, b.w, b.h);
      // 지붕
      ctx.fillStyle = b.roof;
      ctx.beginPath();
      ctx.moveTo(b.x - 5, b.y);
      ctx.lineTo(b.x + b.w / 2, b.y - 20);
      ctx.lineTo(b.x + b.w + 5, b.y);
      ctx.fill();
      // 문
      ctx.fillStyle = '#2c1810';
      ctx.fillRect(b.x + b.w/2 - 8, b.y + b.h - 18, 16, 18);
    });

    // 구름
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    [[60,15,30],[200,20,25],[370,12,35]].forEach(([x,y,r]) => {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(x+20, y+5, r*0.7, 0, Math.PI*2); ctx.fill();
    });
  }

  // ── 던전 화면 ────────────────────────────────────────
  function renderDungeon() {
    const screen    = document.getElementById('screen-dungeon');
    const stages    = Dungeon.getAllStages();
    const difficulty= StateManager.get('difficulty') || 'normal';

    screen.innerHTML = `
      <div class="dungeon-header">
        <button class="pixel-btn back-btn" id="btn-dungeon-back">← 마을</button>
        <span style="color:var(--gold);font-size:15px;">⚔️ 던전</span>
        <div class="difficulty-select">
          ${['normal','nightmare','hell'].map(d => {
            const info = Dungeon.getDifficultyInfo(d);
            return `<button class="diff-btn ${d === difficulty ? 'active' : ''}"
                      data-diff="${d}" style="color:${info.color}">${info.label}</button>`;
          }).join('')}
        </div>
      </div>
      <div class="stage-grid">
        ${stages.map(s => _stageCard(s, difficulty)).join('')}
      </div>
    `;

    document.getElementById('btn-dungeon-back').onclick = () => GameEngine.goTo('town');
    document.querySelectorAll('.diff-btn').forEach(btn => {
      btn.onclick = () => {
        StateManager.set('difficulty', btn.dataset.diff);
        renderDungeon();
      };
    });
    document.querySelectorAll('.stage-card:not(.locked)').forEach(card => {
      card.onclick = () => Dungeon.enter(card.dataset.stage, difficulty);
    });
  }

  function _stageCard(stage, difficulty) {
    const unlocked = Dungeon.isUnlocked(stage.id);
    const cleared  = Dungeon.isCleared(stage.id);
    const recLv    = Dungeon.getRecommendedLevel(stage.id);
    const typeClass= stage.type === 'final' ? 'final-boss' : stage.type === 'boss' ? 'boss' : '';
    const icon     = stage.type === 'final' ? '💀' : stage.type === 'boss' ? '⚔️' : '🗡️';
    const clearMark= cleared ? ' ✓' : '';

    return `
      <div class="stage-card ${typeClass} ${unlocked ? '' : 'locked'}"
           data-stage="${stage.id}">
        <div class="stage-icon">${unlocked ? icon : '🔒'}</div>
        <div class="stage-id" style="color:var(--gold);font-size:12px;">${stage.id}${clearMark}</div>
        <div class="stage-name" style="font-size:11px;">${stage.name}</div>
        <div class="stage-rec" style="font-size:10px;color:var(--text-dim);">
          권장 Lv.${recLv}
          ${stage.bossName ? `<br><span style="color:var(--accent)">${stage.bossName}</span>` : ''}
        </div>
      </div>`;
  }

  // ── 전투 화면 ────────────────────────────────────────
  function renderBattle(state) {
    const screen = document.getElementById('screen-battle');
    const stageInfo = Dungeon.getStageInfo(state.stageId);
    const currentActor = Battle.getCurrentActor();

    screen.innerHTML = `
      <div class="battle-header">
        <span style="color:var(--gold);font-size:13px;">${stageInfo?.name || state.stageId}</span>
        <span class="diff-badge">${Dungeon.getDifficultyInfo(state.difficulty).label}</span>
      </div>
      <div class="battle-field">
        <div class="enemy-area" id="enemy-area">
          ${state.enemies.map(e => _enemySprite(e)).join('')}
        </div>
        <div class="battle-log-mini" id="battle-log-mini"></div>
        <div class="party-area" id="party-area">
          ${state.allies.map(a => _allySprite(a)).join('')}
        </div>
      </div>
      <div class="battle-ui" id="battle-ui">
        ${
