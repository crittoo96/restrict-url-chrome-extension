function loadRules() {
  chrome.storage.sync.get({ rules: [] }, function (data) {
    const ruleList = document.getElementById("ruleList");
    ruleList.innerHTML = "";
    const dayNames = ["日", "月", "火", "水", "木", "金", "土"];
    data.rules.forEach((rule, idx) => {
      const li = document.createElement("li");

      const urlSpan = document.createElement("span");
      urlSpan.classList.add("rule-url");
      urlSpan.textContent = rule.url;

      const weekdaysSpan = document.createElement("span");
      weekdaysSpan.classList.add("rule-weekdays");
      weekdaysSpan.textContent = rule.weekdays
        .map((day) => dayNames[day])
        .join(", ");

      const timeSpan = document.createElement("span");
      timeSpan.classList.add("rule-time");
      timeSpan.textContent = `${rule.start} 〜 ${rule.end}`;

      li.appendChild(urlSpan);
      li.appendChild(document.createTextNode(" – "));
      li.appendChild(weekdaysSpan);
      li.appendChild(document.createTextNode(" – "));
      li.appendChild(timeSpan);

      // 編集ボタン
      const editBtn = document.createElement("button");
      editBtn.classList.add("edit-btn");
      editBtn.textContent = "編集";
      editBtn.onclick = function () {
        document.getElementById("url").value = rule.url;
        // 曜日チェックをセット
        document.querySelectorAll('input[name="weekday"]').forEach((cb) => {
          cb.checked = rule.weekdays.includes(parseInt(cb.value));
        });
        document.getElementById("start").value = rule.start;
        document.getElementById("end").value = rule.end;
        document.getElementById("editIndex").value = idx;
        document.getElementById("saveBtn").textContent = "保存";
        document.getElementById("cancelEditBtn").style.display = "";
      };
      li.appendChild(editBtn);

      // 削除ボタン
      const delBtn = document.createElement("button");
      delBtn.classList.add("delete-btn");
      delBtn.textContent = "削除";
      delBtn.onclick = function () {
        data.rules.splice(idx, 1);
        chrome.storage.sync.set({ rules: data.rules }, loadRules);
      };
      li.appendChild(delBtn);

      ruleList.appendChild(li);
    });
  });
}

// 編集キャンセル
document.getElementById("cancelEditBtn").onclick = function () {
  document.getElementById("addForm").reset();
  document.getElementById("editIndex").value = -1;
  document.getElementById("saveBtn").textContent = "追加";
  this.style.display = "none";
};

document.getElementById("addForm").onsubmit = function (e) {
  e.preventDefault();
  const url = document.getElementById("url").value;
  const weekdays = Array.from(
    document.querySelectorAll('input[name="weekday"]:checked')
  ).map((cb) => parseInt(cb.value));
  const start = document.getElementById("start").value;
  const end = document.getElementById("end").value;
  const editIndex = parseInt(document.getElementById("editIndex").value);

  chrome.storage.sync.get({ rules: [] }, function (data) {
    if (editIndex === -1) {
      // 新規追加
      data.rules.push({ url, weekdays, start, end });
    } else {
      // 既存編集
      data.rules[editIndex] = { url, weekdays, start, end };
    }
    chrome.storage.sync.set({ rules: data.rules }, function () {
      loadRules();
      document.getElementById("addForm").reset();
      document.getElementById("editIndex").value = -1;
      document.getElementById("saveBtn").textContent = "追加";
      document.getElementById("cancelEditBtn").style.display = "none";
    });
  });
};

loadRules();
