// 設定した許可リストがある前提で、storage.sync.rulesを参照

// 許可時間帯判定関数（DNRのisNowInTimeRangeと同じ）
function isNowInTimeRange(start, end) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;
  if (startTime <= endTime) {
    return current >= startTime && current < endTime;
  } else {
    return current >= startTime || current < endTime;
  }
}

// アクセス許可時間外なら強制ブロック画面＋自動タブクローズ
function enforceBlockIfNeeded() {
  chrome.storage.sync.get({ rules: [] }, (data) => {
    const now = new Date();
    const weekday = now.getDay();
    const url = location.href;
    let shouldBlock = false;

    for (const r of data.rules) {
      // このルールにマッチするURLなら
      if (url.startsWith(r.url) || url.includes(r.url)) {
        // 許可時間・曜日内ならOK
        if (
          !(r.weekdays.includes(weekday) && isNowInTimeRange(r.start, r.end))
        ) {
          shouldBlock = true;
          break;
        }
      }
    }

    if (shouldBlock) {
      // まず画面をブロック
      document.body.innerHTML = `
          <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;">
            <h1 style="color:red; font-size:2.5em;">このページへのアクセスは禁止されています</h1>
            <p>許可されていない曜日・時間帯です。</p>
          </div>
        `;
      document.documentElement.style.background = "#fff";
    }
  });
}

// 初回実行
enforceBlockIfNeeded();

// SPA対応：URL変化も監視し続ける
let lastUrl = location.href;
setInterval(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    enforceBlockIfNeeded();
  }
}, 500);
