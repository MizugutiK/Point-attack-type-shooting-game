// WebAssemblyを使うための準備（必要であれば追加）
async function loadWasm() {
    const response = await fetch('./build/release.wasm');
    const wasmBinary = await response.arrayBuffer();
    const { instance } = await WebAssembly.instantiate(wasmBinary);
    return instance.exports;
  }
  
  // ゲームのメインコード
  const canvas = document.getElementById("gameCanvas");
  const ctx = canvas.getContext("2d");
  
  let score = 0;
  let bullets = [];
  let enemies = [];
  let player = { x: 400, y: 550, width: 20, height: 20, speed: 5 };
  let keys = {};
  
  // キー入力のイベントリスナー
  document.addEventListener("keydown", (e) => (keys[e.key] = true));
  document.addEventListener("keyup", (e) => (keys[e.key] = false));
  
  // 弾の発射
  function shoot() {
    bullets.push({ x: player.x + 10, y: player.y, width: 5, height: 10 });
  }
  
  // 敵を生成
  function spawnEnemy() {
    const x = Math.random() * (canvas.width - 30);
    enemies.push({ x, y: 0, width: 30, height: 30, speed: 2 });
  }
  
  // 当たり判定
  function isColliding(obj1, obj2) {
    return (
      obj1.x < obj2.x + obj2.width &&
      obj1.x + obj1.width > obj2.x &&
      obj1.y < obj2.y + obj2.height &&
      obj1.y + obj1.height > obj2.y
    );
  }
  
  // ゲームの更新
  function update() {
    // プレイヤーの移動
    if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x < canvas.width - player.width) player.x += player.speed;
    if (keys[" "] || keys["Space"]) shoot();
  
    // 弾の移動
    bullets = bullets.filter((bullet) => bullet.y > 0);
    bullets.forEach((bullet) => (bullet.y -= 5));
  
    // 敵の移動
    enemies.forEach((enemy) => (enemy.y += enemy.speed));
  
    // 弾と敵の衝突判定
    bullets.forEach((bullet, bulletIndex) => {
      enemies.forEach((enemy, enemyIndex) => {
        if (isColliding(bullet, enemy)) {
          bullets.splice(bulletIndex, 1);
          enemies.splice(enemyIndex, 1);
          score++;
          document.getElementById("score").innerText = `Score: ${score}`;
        }
      });
    });
  
    // 敵が画面外に出たらゲームオーバー
    enemies = enemies.filter((enemy) => enemy.y < canvas.height);
  }
  
  // 描画
  function draw() {
    // 画面をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    // プレイヤーを描画
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
  
    // 弾を描画
    ctx.fillStyle = "red";
    bullets.forEach((bullet) => {
      ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
  
    // 敵を描画
    ctx.fillStyle = "green";
    enemies.forEach((enemy) => {
      ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
  }
  
  // メインループ
  function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
  }
  
  // ゲームの初期化
  async function init() {
    const wasmExports = await loadWasm(); // WebAssemblyのロード（必要に応じて）
    setInterval(spawnEnemy, 1000); // 毎秒敵を生成
    gameLoop();
  }
  
  init();
  