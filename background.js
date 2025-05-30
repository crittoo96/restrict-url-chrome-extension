function isNowInTimeRange(start, end) {
  const now = new Date();
  const current = now.getHours() * 60 + now.getMinutes();
  const [startHour, startMin] = start.split(":").map(Number);
  const [endHour, endMin] = end.split(":").map(Number);
  const startTime = startHour * 60 + startMin;
  const endTime = endHour * 60 + endMin;

  // 例: 22:00～07:00（日またぎ対応）
  if (startTime <= endTime) {
    return current >= startTime && current < endTime;
  } else {
    return current >= startTime || current < endTime;
  }
}

// DNRルールの更新（「許可された時間以外はブロック」）
function updateDnrRules() {
  chrome.storage.sync.get({ rules: [] }, (data) => {
    const now = new Date();
    const weekday = now.getDay();
    let rules = [];
    let ruleId = 1;
    console.log("Updating DNR rules...");
    console.log(rules.join("\n"));
    console.log(data.rules);

    for (const r of data.rules) {
      // 今が「許可された曜日・時間帯」なら→ブロックしない
      // それ以外なら→ブロック
      if (!(r.weekdays.includes(weekday) && isNowInTimeRange(r.start, r.end))) {
        // アクセス許可時間“外”ならブロック
        rules.push({
          id: ruleId,
          priority: 1,
          action: { type: "block" },
          condition: {
            urlFilter: r.url,
            // initiatorDomains: [location.hostname],
            resourceTypes: ["main_frame"],
          },
        });
        ruleId++;
      }
    }
    // 既存の動的ルールを全削除→新規追加
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: Array.from({ length: 1000 }, (_, i) => i + 1),
      addRules: rules,
    });
  });
}

// 1分ごとにDNRルールを再計算
setInterval(updateDnrRules, 60000);
updateDnrRules();
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "sync" && changes.rules) {
    updateDnrRules();
  }
});
