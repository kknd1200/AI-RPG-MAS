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
        ${_renderBattleActions(state, currentActor)}
      </div>
    `;

    _bindBattleActions(state);
  }

  function _enemySprite(enemy) {
    const hpPct = enemy.maxHp > 0
      ? Math.max(0, Math.min(100, enemy.hp / enemy.maxHp * 100))
      : 0;
    return `
      <div class="battle-sprite enemy-sprite ${enemy.isAlive ? '' : 'dead'}"
           id="sprite-${enemy.id}" data-target-id="${enemy.id}">
        <div class="sprite-emoji" style="font-size:40px;
             opacity:${enemy.isAlive ? 1 : 0.3}">${enemy.emoji}</div>
        <div style="font-size:10px;color:var(--text-dim)">${enemy.name}</div>
        <div class="stat-bar" style="width:60px">
          <div class="stat-bar-fill hp-bar" style="width:${hpPct}%"></div>
        </div>
        <div class="status-icons">
          ${(enemy.statusEffects||[]).map(s => _statusIcon(s)).join('')}
        </div>
      </div>`;
  }

  function _allySprite(ally) {
    const hpPct = Character.hpPercent(ally) * 100;
    const mpPct = Character.mpPercent(ally) * 100;
    return `
      <div class="battle-sprite ally-sprite ${ally.isAlive ? '' : 'dead'}"
           id="sprite-${ally.id}">
        <div class="sprite-emoji" style="font-size:36px;
             opacity:${ally.isAlive ? 1 : 0.3}">${ally.emoji}</div>
        <div style="font-size:10px;color:var(--gold)">${ally.name}</div>
        <div style="font-size:9px;color:var(--text-dim)">Lv.${ally.level}</div>
        <div class="stat-bar" style="width:56px;margin-bottom:2px">
          <div class="stat-bar-fill hp-bar" style="width:${hpPct}%"></div>
        </div>
        <div class="stat-bar" style="width:56px">
          <div class="stat-bar-fill mp-bar" style="width:${mpPct}%"></div>
        </div>
        <div class="status-icons">
          ${(ally.statusEffects||[]).map(s => _statusIcon(s)).join('')}
        </div>
      </div>`;
  }

  function _statusIcon(status) {
    const icons = {
      poison:'☠️', burn:'🔥', stun:'⭐', slow:'🐌',
      blind:'👁️', curse:'💜', silence:'🤐', paralyze:'⚡',
      fear:'😱', regen:'💚'
    };
    return `<div class="status-icon" title="${status.type}(${status.duration}턴)">
              ${icons[status.type] || '?'}
            </div>`;
  }

  function _renderBattleActions(state, currentActor) {
    if (!currentActor) return '';
    const isPlayerTurn = state.allies.includes(currentActor);
    if (!isPlayerTurn) {
      return `<div style="text-align:center;padding:16px;color:var(--text-dim);">
                적의 턴...
              </div>`;
    }
    return `
      <div class="actor-info">
        <span style="color:var(--gold)">${currentActor.name}</span>의 턴
        <span style="font-size:11px;color:var(--text-dim);margin-left:8px;">
          HP ${currentActor.hp}/${currentActor.maxHp}
          MP ${currentActor.mp}/${currentActor.maxMp}
        </span>
      </div>
      <div class="action-btns">
        <button class="pixel-btn action-btn" data-action="attack">⚔️ 공격</button>
        <button class="pixel-btn action-btn" data-action="skill">✨ 스킬</button>
        <button class="pixel-btn action-btn" data-action="item">🎒 아이템</button>
        <button class="pixel-btn action-btn" data-action="defend">🛡️ 방어</button>
      </div>
      <div id="sub-action-area"></div>
    `;
  }

  function _bindBattleActions(state) {
    document.querySelectorAll('.action-btn').forEach(btn => {
      btn.onclick = () => _handleActionClick(btn.dataset.action, state);
    });
    // 적 선택
    document.querySelectorAll('.enemy-sprite').forEach(el => {
      el.onclick = () => {
        const target = state.enemies.find(e => e.id === el.dataset.targetId);
        if (target && target.isAlive) {
          document.querySelectorAll('.enemy-sprite').forEach(e => e.classList.remove('selected'));
          el.classList.add('selected');
          state._selectedEnemy = target;
        }
      };
    });
  }

  function _handleActionClick(action, state) {
    const actor = Battle.getCurrentActor();
    if (!actor) return;
    const sub = document.getElementById('sub-action-area');

    switch (action) {
      case 'attack': {
        const target = state._selectedEnemy ||
          state.enemies.find(e => e.isAlive);
        if (target) Battle.playerAction({ type: 'attack', target });
        break;
      }
      case 'skill': {
        const skills = actor.learnedSkills.filter(s => s.type !== 'passive');
        sub.innerHTML = `
          <div class="skill-list">
            ${skills.map(s => `
              <button class="pixel-btn skill-btn ${s.currentCooldown > 0 ? 'disabled' : ''}"
                      data-skill="${s.id}"
                      ${s.currentCooldown > 0 ? 'disabled' : ''}>
                ${s.name}
                <span style="font-size:9px;color:var(--text-dim)">MP:${s.mpCost}</span>
                ${s.currentCooldown > 0
                  ? `<span class="skill-cooldown">CD:${s.currentCooldown}</span>`
                  : ''}
              </button>`).join('')}
          </div>`;
        sub.querySelectorAll('.skill-btn:not(.disabled)').forEach(btn => {
          btn.onclick = () => {
            const target = state._selectedEnemy || state.enemies.find(e => e.isAlive);
            Battle.playerAction({ type: 'skill', skillId: btn.dataset.skill, target });
          };
        });
        break;
      }
      case 'item': {
        const inv = StateManager.get('inventory').filter(i => i.type === 'consumable');
        if (inv.length === 0) {
          sub.innerHTML = `<div style="text-align:center;color:var(--text-dim);font-size:12px;">아이템 없음</div>`;
          return;
        }
        sub.innerHTML = `
          <div class="skill-list">
            ${inv.map(item => `
              <button class="pixel-btn skill-btn" data-item="${item.id}">
                ${item.emoji} ${item.name}
              </button>`).join('')}
          </div>`;
        sub.querySelectorAll('.skill-btn').forEach(btn => {
          btn.onclick = () => {
            Battle.playerAction({ type: 'item', itemId: btn.dataset.item, target: actor });
          };
        });
        break;
      }
      case 'defend': {
        Battle.playerAction({ type: 'defend' });
        break;
      }
    }
  }

  // ── 전투 결과 ────────────────────────────────────────
  function renderBattleResult(state) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const isWin = state.result === 'win';
    const gold  = StateManager.get('gold');

    overlay.innerHTML = `
      <div class="modal-box anim-pop" style="text-align:center;">
        <div class="modal-title" style="color:${isWin ? '#f5a623' : '#e74c3c'}">
          ${isWin ? '🏆 전투 승리!' : '💀 전투 패배'}
        </div>
        ${isWin ? `
          <div style="margin:12px 0;font-size:13px;">
            <div>💰 Gold: ${gold}</div>
          </div>
          <div style="margin:12px 0;">
            ${state.allies.filter(a=>a.isAlive).map(a => `
              <div style="font-size:12px;margin:4px 0;">
                ${a.emoji} ${a.name} Lv.${a.level}
                ${a.statPoints > 0 ? '<span style="color:var(--gold)"> ★레벨업!</span>' : ''}
              </div>`).join('')}
          </div>` : ''}
        <div style="display:flex;gap:8px;justify-content:center;margin-top:16px;">
          <button class="pixel-btn" id="btn-result-town">🏠 마을로</button>
          ${isWin ? `<button class="pixel-btn" id="btn-result-continue">▶ 계속</button>` : ''}
        </div>
      </div>`;

    document.body.appendChild(overlay);
    document.getElementById('btn-result-town').onclick = () => {
      overlay.remove();
      // 레벨업 스탯 배분이 필요하면 먼저 처리
      const player = StateManager.get('player');
      if (player && player.statPoints > 0) {
        showStatAllocModal(player, () => GameEngine.goTo('town'));
      } else {
        GameEngine.goTo('town');
      }
    };
    const cont = document.getElementById('btn-result-continue');
    if (cont) cont.onclick = () => {
      overlay.remove();
      GameEngine.goTo('dungeon');
    };
  }

  // ── 데미지 텍스트 ────────────────────────────────────
  function showDamageText(target, amount, type = 'physical') {
    const spriteEl = document.getElementById(`sprite-${target.id}`);
    if (!spriteEl) return;
    const rect = spriteEl.getBoundingClientRect();
    const el = document.createElement('div');
    el.className = `damage-text ${type}`;
    el.textContent = type === 'heal' ? `+${amount}` : `-${amount}`;
    el.style.left = `${rect.left + rect.width/2 - 20}px`;
    el.style.top  = `${rect.top}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  // ── 전투 애니메이션 ──────────────────────────────────
  function animateAttack(actor) {
    const el = document.getElementById(`sprite-${actor.id}`);
    if (!el) return;
    el.classList.remove('anim-shake');
    void el.offsetWidth;
    el.classList.add('anim-shake');
    setTimeout(() => el.classList.remove('anim-shake'), 400);
  }

  function animateSkill(actor, skill) {
    const el = document.getElementById(`sprite-${actor.id}`);
    if (!el) return;
    el.classList.add('anim-pop');
    setTimeout(() => el.classList.remove('anim-pop'), 400);
  }

  // ── 전투 로그 ────────────────────────────────────────
  function appendBattleLog(text) {
    const logEl = document.getElementById('battle-log-mini');
    if (!logEl) return;
    const p = document.createElement('div');
    p.style.cssText = 'font-size:11px;color:var(--text-dim);animation:fadeIn 0.3s ease;';
    p.textContent = text;
    logEl.appendChild(p);
    logEl.scrollTop = logEl.scrollHeight;
    if (logEl.children.length > 5) logEl.removeChild(logEl.firstChild);
  }

  // ── 스탯 배분 모달 ───────────────────────────────────
  function showStatAllocModal(character, onClose) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    function buildContent() {
      return `
        <div class="modal-box anim-pop">
          <div class="modal-title">⭐ 레벨업! - 스탯 배분</div>
          <div style="text-align:center;margin-bottom:12px;font-size:13px;">
            ${character.name} Lv.${character.level}
            <span style="color:var(--gold)"> 남은 포인트: ${character.statPoints}</span>
          </div>
          ${[
            ['str','힘','⚔️'],['agi','민첩','💨'],
            ['int','지력','🔮'],['vit','체력','❤️']
          ].map(([key,label,icon]) => `
            <div class="stat-row">
              <span>${icon} ${label}</span>
              <span>${character.stats[key]}</span>
              <button class="pixel-btn stat-up-btn" data-stat="${key}"
                ${character.statPoints <= 0 ? 'disabled' : ''}>+</button>
            </div>`).join('')}
          <div style="margin-top:12px;text-align:center;">
            <button class="pixel-btn" id="btn-stat-done"
              ${character.statPoints > 0 ? 'disabled' : ''}>확인</button>
          </div>
        </div>`;
    }

    overlay.innerHTML = buildContent();
    document.body.appendChild(overlay);

    function refresh() {
      overlay.innerHTML = buildContent();
      bindButtons();
    }

    function bindButtons() {
      overlay.querySelectorAll('.stat-up-btn').forEach(btn => {
        btn.onclick = () => {
          Character.allocateStat(character, btn.dataset.stat);
          SaveManager.save();
          refresh();
        };
      });
      const done = document.getElementById('btn-stat-done');
      if (done) done.onclick = () => {
        overlay.remove();
        if (onClose) onClose();
      };
    }
    bindButtons();
  }

  // ── 상점 모달 ────────────────────────────────────────
  function showShopModal() {
    const gold = StateManager.get('gold');
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const all = [
      ...ITEM_DATA.consumables,
      ...ITEM_DATA.scrolls
    ];
    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-title">🏪 상점</div>
        <div style="text-align:right;font-size:13px;margin-bottom:8px;">
          💰 ${StateManager.get('gold')}
        </div>
        <div style="max-height:60vh;overflow-y:auto;">
          ${all.map(item => `
            <div class="shop-item">
              <span>${item.emoji} ${item.name}</span>
              <span style="font-size:11px;color:var(--text-dim)">${item.description}</span>
              <button class="pixel-btn buy-btn" data-id="${item.id}"
                      data-price="${item.price}"
                      style="font-size:11px;padding:4px 8px;">
                💰${item.price}
              </button>
            </div>`).join('')}
        </div>
        <button class="pixel-btn" id="btn-shop-close"
                style="width:100%;margin-top:8px;">닫기</button>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelectorAll('.buy-btn').forEach(btn => {
      btn.onclick = () => {
        const price = parseInt(btn.dataset.price);
        const g = StateManager.get('gold');
        if (g < price) { _toast('골드 부족!'); return; }
        const item = all.find(i => i.id === btn.dataset.id);
        if (!item) return;
        StateManager.update('gold', g => g - price);
        StateManager.update('inventory', inv => [...inv, { ...item }]);
        _toast(`${item.name} 구매!`);
        overlay.querySelector('[style*="text-align:right"]').textContent =
          `💰 ${StateManager.get('gold')}`;
        SaveManager.save();
      };
    });
    document.getElementById('btn-shop-close').onclick = () => overlay.remove();
  }

  // ── 여관 모달 ────────────────────────────────────────
  function showInnModal() {
    const player = StateManager.get('player');
    const party  = StateManager.get('party');
    const cost   = 50;
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-title">🏨 여관</div>
        <div style="text-align:center;margin:12px 0;font-size:13px;">
          HP/MP를 완전히 회복합니다<br>
          <span style="color:var(--gold)">비용: 💰${cost}</span>
        </div>
        <button class="pixel-btn" id="btn-inn-rest" style="width:100%">휴식하기</button>
        <button class="pixel-btn" id="btn-inn-close" style="width:100%;margin-top:8px">닫기</button>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('btn-inn-rest').onclick = () => {
      const g = StateManager.get('gold');
      if (g < cost) { _toast('골드 부족!'); return; }
      StateManager.update('gold', g => g - cost);
      Character.heal(player, player.maxHp);
      Character.restoreMP(player, player.maxMp);
      party.forEach(m => {
        Character.heal(m, m.maxHp);
        Character.restoreMP(m, m.maxMp);
      });
      SaveManager.save();
      overlay.remove();
      renderTown();
      _toast('파티가 완전히 회복되었습니다!');
    };
    document.getElementById('btn-inn-close').onclick = () => overlay.remove();
  }

  // ── 길드 모달 ────────────────────────────────────────
  function showGuildModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const quests = StateManager.get('questLog');
    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-title">📋 길드</div>
        <div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;">
          퀘스트 목록
        </div>
        ${quests.length === 0
          ? `<div style="text-align:center;color:var(--text-dim)">진행 중인 퀘스트 없음</div>`
          : quests.map(q => `
              <div class="quest-item">
                <span>${q.name}</span>
                <span style="color:var(--text-dim);font-size:11px">${q.desc}</span>
              </div>`).join('')}
        <div style="margin-top:12px;font-size:11px;color:var(--text-dim)">
          * 퀘스트 시스템은 추후 업데이트 예정
        </div>
        <button class="pixel-btn" id="btn-guild-close"
                style="width:100%;margin-top:8px">닫기</button>
      </div>`;
    document.body.appendChild(overlay);
    document.getElementById('btn-guild-close').onclick = () => overlay.remove();
  }

  // ── 대장간 모달 ──────────────────────────────────────
  function showBlacksmithModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const player = StateManager.get('player');
    const inv = StateManager.get('inventory').filter(i => i.type === 'weapon' || i.type === 'armor' || i.type === 'shield');

    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-title">⚒️ 대장간</div>
        <div class="blacksmith-tabs" style="display:flex;gap:8px;margin-bottom:12px;">
          <button class="pixel-btn bs-tab active" data-tab="enhance">강화</button>
          <button class="pixel-btn bs-tab" data-tab="extract">추출</button>
          <button class="pixel-btn bs-tab" data-tab="craft">제작</button>
        </div>
        <div id="bs-content">
          ${_blacksmithEnhanceTab(inv)}
        </div>
        <button class="pixel-btn" id="btn-bs-close"
                style="width:100%;margin-top:8px">닫기</button>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.bs-tab').forEach(tab => {
      tab.onclick = () => {
        overlay.querySelectorAll('.bs-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const content = document.getElementById('bs-content');
        if (tab.dataset.tab === 'enhance') content.innerHTML = _blacksmithEnhanceTab(inv);
        if (tab.dataset.tab === 'extract') content.innerHTML = `<div style="text-align:center;color:var(--text-dim)">추출 기능 준비 중</div>`;
        if (tab.dataset.tab === 'craft')   content.innerHTML = `<div style="text-align:center;color:var(--text-dim)">제작 기능 준비 중</div>`;
      };
    });

    overlay.querySelectorAll('.enhance-btn').forEach(btn => {
      btn.onclick = () => {
        const cost = parseInt(btn.dataset.cost);
        const idx  = parseInt(btn.dataset.idx);
        const g = StateManager.get('gold');
        if (g < cost) { _toast('골드 부족!'); return; }
        StateManager.update('gold', g => g - cost);
        const item = inv[idx];
        item.enhanceLevel = (item.enhanceLevel || 0) + 1;
        Object.keys(item.stats).forEach(k => {
          item.stats[k] = Math.floor(item.stats[k] * 1.2);
        });
        SaveManager.save();
        _toast(`${item.name} +${item.enhanceLevel} 강화 성공!`);
      };
    });

    document.getElementById('btn-bs-close').onclick = () => overlay.remove();
  }

  function _blacksmithEnhanceTab(inv) {
    if (inv.length === 0)
      return `<div style="text-align:center;color:var(--text-dim)">강화 가능한 장비 없음</div>`;
    return inv.map((item, i) => {
      const cost = 100 * Math.pow(2, item.enhanceLevel || 0);
      return `
        <div class="shop-item">
          <span>${item.emoji} ${item.name} +${item.enhanceLevel||0}</span>
          <span style="font-size:10px;color:var(--text-dim)">
            ${Object.entries(item.stats).map(([k,v]) => `${k}:${v}`).join(' ')}
          </span>
          <button class="pixel-btn enhance-btn"
                  data-idx="${i}" data-cost="${cost}"
                  style="font-size:11px;padding:4px 8px;">
            💰${cost}
          </button>
        </div>`;
    }).join('');
  }

  // ── 주점 모달 ────────────────────────────────────────
  function showTavernModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    const party   = StateManager.get('party');
    const presets = Character.getNPCPresets();

    overlay.innerHTML = `
      <div class="modal-box">
        <div class="modal-title">🍺 주점 - 동료 모집</div>
        <div style="font-size:12px;color:var(--text-dim);margin-bottom:8px;">
          파티 ${party.length}/3
        </div>
        ${presets.map(p => {
          const inParty = party.some(m => m.id === p.id);
          const cls = CLASS_DATA[p.classId];
          return `
            <div class="npc-card">
              <span style="font-size:24px">${cls.emoji}</span>
              <div style="flex:1">
                <div style="color:var(--gold)">${p.name}
                  <span style="font-size:11px;color:${cls.color}">${cls.name}</span>
                </div>
                <div style="font-size:11px;color:var(--text-dim)">${p.desc}</div>
              </div>
              <button class="pixel-btn recruit-btn"
                      data-npc="${p.id}"
                      ${inParty || party.length >= 3 ? 'disabled' : ''}
                      style="font-size:11px;padding:4px 8px;">
                ${inParty ? '동행중' : `💰${p.joinCost}`}
              </button>
            </div>`;
        }).join('')}
        <button class="pixel-btn" id="btn-tavern-close"
                style="width:100%;margin-top:8px">닫기</button>
      </div>`;
    document.body.appendChild(overlay);

    overlay.querySelectorAll('.recruit-btn').forEach(btn => {
      btn.onclick = () => {
        const preset = presets.find(p => p.id === btn.dataset.npc);
        if (!preset) return;
        const g = StateManager.get('gold');
        if (g < preset.joinCost) { _toast('골드 부족!'); return; }
        StateManager.update('gold', g => g - preset.joinCost);
        const npc = Character.createNPC(preset.id);
        StateManager.update('party', p => [...p, npc]);
        SaveManager.save();
        _toast(`${preset.name}이(가) 파티에 합류!`);
        overlay.remove();
        renderTown();
      };
    });
    document.getElementById('btn-tavern-close').onclick = () => overlay.remove();
  }

  // ── 토스트 알림 ──────────────────────────────────────
  function _toast(message) {
    const el = document.createElement('div');
    el.className = 'toast-msg';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  }

  return {
    renderIntro, renderTown, renderDungeon,
    renderBattle, renderBattleResult,
    showDamageText, animateAttack, animateSkill,
    appendBattleLog,
    showStatAllocModal,
    showShopModal, showInnModal, showGuildModal,
    showBlacksmithModal, showTavernModal
  };
})();
