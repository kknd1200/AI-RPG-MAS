const CACHE_NAME = 'rpg-mas-v1';
const ASSETS = [
  '/AI-RPG-MAS/',
  '/AI-RPG-MAS/index.html',
  '/AI-RPG-MAS/css/main.css',
  '/AI-RPG-MAS/css/pixel.css',
  '/AI-RPG-MAS/js/data/classes.js',
  '/AI-RPG-MAS/js/data/skills.js',
  '/AI-RPG-MAS/js/data/monsters.js',
  '/AI-RPG-MAS/js/data/items.js',
  '/AI-RPG-MAS/js/core/StateManager.js',
  '/AI-RPG-MAS/js/core/SaveManager.js',
  '/AI-RPG-MAS/js/core/GameEngine.js',
  '/AI-RPG-MAS/js/game/Character.js',
  '/AI-RPG-MAS/js/game/Battle.js',
  '/AI-RPG-MAS/js/game/Dungeon.js',
  '/AI-RPG-MAS/js/ui/Renderer.js',
  '/AI-RPG-MAS/js/ui/CharacterCreate.js',
  '/AI-RPG-MAS/js/ui/Town.js',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
