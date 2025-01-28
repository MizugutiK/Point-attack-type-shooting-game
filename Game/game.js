// ゲームのメインコード
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let bullets = [];
let enemies = [];
let player = { x: canvas.width / 2 - 10, y: canvas.height / 2 - 10, width: 20, height: 20, speed: 5 };
let keys = {};
let spawnChance = { left: 0.25, right: 0.25, top: 0.25, bottom: 0.25 }; // 各方向からの敵出現頻度

const MAX_MOVE_DISTANCE = 20;  // 最大移動距離（ピクセル）

// キー入力のイベントリスナー
document.addEventListener("keydown", (e) => {
    keys[e.key] = true;

    if (e.key === "a" || e.key === "A") {
        spawnChance.left -= 0.05;  // Aキーで左からの敵の出現頻度を減らす
        spawnChance.right += 0.05; // 右からの敵の出現頻度を増やす
    }
    if (e.key === "d" || e.key === "D") {
        spawnChance.right -= 0.05; // Dキーで右からの敵の出現頻度を減らす
        spawnChance.left += 0.05;  // 左からの敵の出現頻度を増やす
    }
});

document.addEventListener("keyup", (e) => {
    keys[e.key] = false;
});

// 弾の発射
function shoot(targetX, targetY) {
    const angle = Math.atan2(targetY - player.y, targetX - player.x); // プレイヤーからクリック位置への角度を計算
    const bulletSpeed = 5; // 弾の速度

    // 弾を作成して配列に追加
    bullets.push({
        x: player.x + player.width / 2,
        y: player.y + player.height / 2,
        speedX: Math.cos(angle) * bulletSpeed, // 速度のX成分
        speedY: Math.sin(angle) * bulletSpeed, // 速度のY成分
        width: 5,
        height: 5
    });
}

// キャンバス内でのクリックイベント
canvas.addEventListener("click", (e) => {
    // クリックした位置を取得
    const clickX = e.offsetX;
    const clickY = e.offsetY;

    shoot(clickX, clickY); // 弾を発射
});

// 敵を生成
function spawnEnemy() {
    const randomEdge = Math.floor(Math.random() * 4); // 0: 上, 1: 右, 2: 下, 3: 左

    let x, y;

    // AキーやDキーの入力によって出現頻度を調整
    if (randomEdge === 0 && Math.random() < spawnChance.top) { // 上
        x = Math.random() * (canvas.width - 30);
        y = 0; // 上から
    } else if (randomEdge === 1 && Math.random() < spawnChance.right) { // 右
        x = canvas.width - 30; // 右端
        y = Math.random() * (canvas.height - 30); // 高さはランダム
    } else if (randomEdge === 2 && Math.random() < spawnChance.bottom) { // 下
        x = Math.random() * (canvas.width - 30);
        y = canvas.height - 30; // 下から
    } else if (randomEdge === 3 && Math.random() < spawnChance.left) { // 左
        x = 0; // 左端
        y = Math.random() * (canvas.height - 30); // 高さはランダム
    }

    if (x !== undefined && y !== undefined) {
        enemies.push({ x, y, width: 30, height: 30, speed: 1 });
    }
}

// 敵の移動
function moveEnemies() {
    enemies.forEach((enemy) => {
        // プレイヤーの位置に向かって進む角度を計算
        const angle = Math.atan2(player.y - enemy.y, player.x - enemy.x);
        const speedX = Math.cos(angle) * enemy.speed;
        const speedY = Math.sin(angle) * enemy.speed;

        // 敵の位置を更新
        enemy.x += speedX;
        enemy.y += speedY;
    });
}

// 弾の移動
function moveBullets() {
    bullets.forEach((bullet) => {
        bullet.x += bullet.speedX;
        bullet.y += bullet.speedY;
    });
}

// 衝突判定
function isColliding(obj1, obj2) {
    return (
        obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.y + obj1.height > obj2.y
    );
}

// 弾と敵の衝突判定
function checkCollisions() {
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (isColliding(bullet, enemy)) {
                bullets.splice(bulletIndex, 1); // 弾を削除
                enemies.splice(enemyIndex, 1); // 敵を削除
                score++;
                document.getElementById("score").innerText = `Score: ${score}`;
            }
        });
    });
}

// ゲームの更新
function update() {
    // キャンバスの中央座標
    const canvasCenterX = canvas.width / 2 - 10;
    const canvasCenterY = canvas.height / 2 - 10;

    // Aキーを押している間、少しだけ左に移動
    if (keys["a"] || keys["A"]) {
        if (player.x > canvasCenterX - MAX_MOVE_DISTANCE) {  // 左方向の移動制限
            player.x -= MAX_MOVE_DISTANCE;  // 少しだけ左に移動
            console.log(`Player moved left. Current position: x = ${player.x}, y = ${player.y}`);
        }
    }

    // Dキーを押している間、少しだけ右に移動
    if (keys["d"] || keys["D"]) {
        if (player.x < canvasCenterX + MAX_MOVE_DISTANCE) {  // 右方向の移動制限
            player.x += MAX_MOVE_DISTANCE;  // 少しだけ右に移動
            console.log(`Player moved right. Current position: x = ${player.x}, y = ${player.y}`);
        }
    }


    // 弾の移動
    moveBullets();

    // 敵の移動
    moveEnemies();

    // 弾と敵の衝突判定
    checkCollisions();

    // 新しい敵を追加する
    if (Math.random() < 0.02) {  // 2%の確率で敵がスポーン
        spawnEnemy();
    }
}

// 描画
function draw() {
    // 画面をクリア
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // プレイヤーを描画（キャンバスの中央に固定）
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
    // キャンバスの中央に黒い点を描画
    ctx.fillStyle = "black";  // 黒い色を設定
    ctx.beginPath();          // 新しいパスを開始
    ctx.arc(canvas.width / 2, canvas.height / 2, 2, 0, Math.PI * 2);  // 中央に半径5の円を描画
    ctx.fill();               // 塗りつぶし
}

// メインループ
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ゲームの初期化
function init() {
    gameLoop(); // ゲーム開始
}

init();
