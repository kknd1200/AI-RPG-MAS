const SaveManager = (() => {
  const LOCAL_KEY = 'rpg_mas_save';
  let _driveReady = false;
  let _accessToken = null;
  const DRIVE_FILENAME = 'rpg_mas_save.json';
  const CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID';   // Google Cloud Console에서 발급
  const API_KEY   = 'YOUR_GOOGLE_API_KEY';      // Google Cloud Console에서 발급
  const SCOPES    = 'https://www.googleapis.com/auth/drive.appdata';

  // ── 로컬 저장 ──────────────────────────────────────
  function saveLocal(data) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify({
        ...data,
        savedAt: new Date().toISOString()
      }));
      return true;
    } catch (e) {
      console.error('로컬 저장 실패:', e);
      return false;
    }
  }

  function loadLocal() {
    try {
      const raw = localStorage.getItem(LOCAL_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      console.error('로컬 불러오기 실패:', e);
      return null;
    }
  }

  function deleteLocal() {
    localStorage.removeItem(LOCAL_KEY);
  }

  // ── Google Drive 초기화 ────────────────────────────
  function initDrive() {
    return new Promise((resolve) => {
      if (typeof gapi === 'undefined') {
        console.warn('Google API 미로드 - 로컬 전용 모드');
        resolve(false);
        return;
      }
      gapi.load('client:auth2', async () => {
        try {
          await gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            scope: SCOPES,
            discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
          });
          _driveReady = true;
          resolve(true);
        } catch (e) {
          console.warn('Drive 초기화 실패:', e);
          resolve(false);
        }
      });
    });
  }

  async function signInDrive() {
    if (!_driveReady) return false;
    try {
      const authInstance = gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        await authInstance.signIn();
      }
      _accessToken = gapi.auth.getToken().access_token;
      return true;
    } catch (e) {
      console.error('Drive 로그인 실패:', e);
      return false;
    }
  }

  function isSignedIn() {
    if (!_driveReady) return false;
    try {
      return gapi.auth2.getAuthInstance().isSignedIn.get();
    } catch {
      return false;
    }
  }

  // ── Google Drive 저장 ──────────────────────────────
  async function saveDrive(data) {
    if (!_driveReady || !isSignedIn()) return false;
    try {
      const token = gapi.auth.getToken().access_token;
      const content = JSON.stringify({ ...data, savedAt: new Date().toISOString() });
      const fileId = await _findDriveFile(token);

      if (fileId) {
        await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
          method: 'PATCH',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: content
        });
      } else {
        const meta = new Blob(
          [JSON.stringify({ name: DRIVE_FILENAME, parents: ['appDataFolder'] })],
          { type: 'application/json' }
        );
        const body = new FormData();
        body.append('metadata', meta);
        body.append('file', new Blob([content], { type: 'application/json' }));
        await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body
        });
      }
      return true;
    } catch (e) {
      console.error('Drive 저장 실패:', e);
      return false;
    }
  }

  async function loadDrive() {
    if (!_driveReady || !isSignedIn()) return null;
    try {
      const token = gapi.auth.getToken().access_token;
      const fileId = await _findDriveFile(token);
      if (!fileId) return null;
      const res = await fetch(
        `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return await res.json();
    } catch (e) {
      console.error('Drive 불러오기 실패:', e);
      return null;
    }
  }

  async function _findDriveFile(token) {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${DRIVE_FILENAME}'`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
  }

  // ── 통합 저장/불러오기 ─────────────────────────────
  async function save() {
    const data = _buildSaveData();
    saveLocal(data);
    if (isSignedIn()) {
      await saveDrive(data);
      return 'cloud';
    }
    return 'local';
  }

  async function load() {
    if (isSignedIn()) {
      const driveData = await loadDrive();
      if (driveData) return driveData;
    }
    return loadLocal();
  }

  function _buildSaveData() {
    const s = StateManager.get();
    return {
      player: s.player,
      party: s.party,
      gold: s.gold,
      inventory: s.inventory,
      questLog: s.questLog,
      unlockedStages: s.unlockedStages,
      clearedStages: s.clearedStages,
      difficulty: s.difficulty
    };
  }

  function applySaveData(data) {
    if (!data) return false;
    StateManager.set('player', data.player);
    StateManager.set('party', data.party || []);
    StateManager.set('gold', data.gold || 0);
    StateManager.set('inventory', data.inventory || []);
    StateManager.set('questLog', data.questLog || []);
    StateManager.set('unlockedStages', data.unlockedStages || ['1-1']);
    StateManager.set('clearedStages', data.clearedStages || []);
    StateManager.set('difficulty', data.difficulty || 'normal');
    return true;
  }

  return {
    saveLocal, loadLocal, deleteLocal,
    initDrive, signInDrive, isSignedIn,
    saveDrive, loadDrive,
    save, load, applySaveData
  };
})();
