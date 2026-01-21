// ==UserScript==
// @name         UCAS 选课帮助系统(研究生版)
// @namespace    http://tampermonkey.net/
// @version      2.1
// @description  提前输入课程选择, 在选课开通后自动快速勾选
// @author       Aluria
// @match        *://*.ucas.ac.cn:*/*
// @icon         https://ucas.ac.cn/publish/xww/images/icon1.png
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

const VERSION = "2.1";

const state = {
  editing: false,

  searchIndex: -1,
  table_row: [], // HTML Collection
  tableStr: [],
  searchExist: false,
  closed: false,
};

const config = GM_getValue("config", { show_animate: false, enable_system_notify: true });
GM_setValue("config", config);

function saveConfig() {
  GM_setValue("config", config);
};

function myFloatingNotify(text, dt) {
  const defaultDt = 1000;
  const fadeTime = 1000;
  const myFloatingWindowName = "myFloatingWindow";

  dt ??= defaultDt;
  console.log(text);

  let myFloatingWindow = document.getElementById(myFloatingWindowName);
  if (myFloatingWindow == null) {
    const newDiv = document.createElement("div");
    newDiv.id = myFloatingWindowName;
    newDiv.style.position = "fixed";
    newDiv.style.bottom = "10px";
    newDiv.style.left = "10px";
    newDiv.style.display = "flex";
    newDiv.style.flexDirection = "column";
    newDiv.style.backgroundColor = "#b9b9b933";
    newDiv.style.padding = "8px";
    newDiv.style.transition = "width 5s linear";
    newDiv.style.zIndex = 100000;

    document.body.appendChild(newDiv);

    myFloatingWindow = newDiv;
  }

  const newContiner = document.createElement("div");
  newContiner.style.transition = `opacity ${fadeTime}ms ease`;
  newContiner.style.marginTop = `5px`;
  newContiner.style.padding = `3px`;
  newContiner.style.backgroundColor = "#ffffff59";

  const newContent = document.createElement("label");
  newContent.style.width = "200px";
  newContent.style.display = "grid";
  newContent.append(text);

  const newProgressBar = document.createElement("div");
  newProgressBar.style.height = "3px";
  newProgressBar.style.width = "1px";
  newProgressBar.style.backgroundColor = "green";
  newProgressBar.style.transition = `width ${dt}ms ease`;

  newContiner.appendChild(newContent);
  newContiner.appendChild(newProgressBar);

  // progress bar
  setTimeout(() => {
    newProgressBar.style.width = "200px";
  }, 100);
  // fade out
  setTimeout(() => {
    newContiner.style.opacity = 0;
  }, dt);
  // disapper
  setTimeout(() => {
    newContiner.style.display = "none";
  }, dt + fadeTime);

  myFloatingWindow.appendChild(newContiner);
  return;
}

// 这里负责通知
function notifyMe(msg) {
  console.debug("notifyMe:", msg);
  if (config.enable_system_notify === false) {
    myFloatingNotify(msg, 3000);
  } else if (!("Notification" in window)) {
    // Check if the browser supports notifications
    alert("This browser does not support desktop notification");
  } else if (Notification.permission === "granted") {
    // Check whether notification permissions have already been granted;
    // if so, create a notification
    if (!msg) {
      const _ = new Notification("Hi there!\n选上了！");
    } else {
      const _ = new Notification("Hi there!\n" + msg);
    }
    // …
  } else if (Notification.permission !== "denied") {
    // We need to ask the user for permission
    Notification.requestPermission().then((permission) => {
      // If the user accepts, let's create a notification
      if (permission === "granted") {
        const _ = new Notification("Hi there!\n选上了！");
        // …
      }
    });
  } else {
    myFloatingNotify(msg, 5000);
  }
}

/* Typescript
interface Course {
    name: string;
    id: string;
    idFull: string;
    teacher: string;
    department: string;
    selected: boolean;
}

e.g.
const courseList = [
    {
        name: "高等数学",
        id: "123456",
        idFull: "123456-001",
        teacher: "张三",
        department: "张三",
        selected: false,
    },
    {
        name: "线性代数",
        id: "654321",
        idFull: "654321-001",
        teacher: "李四",
        department: "李四",
        selected: true,
    },
];
**/

function deleteClick(event) {
  const index = parseInt(event.target.getAttribute("data-index"));
  if (index === null) return;
  if (state.editing) {
    saveTable([index]);
  } else {
    const courseList = GM_getValue("courseList", []);
    courseList.splice(index, 1);
    GM_setValue("courseList", courseList);
  }
  showTable();
}

function createTable(courseList) {
  const table = document.createElement("table");
  // <table border="1" style="border-collapse: collapse; width: 100%;">
  table.border = "1";
  table.style.cursor = "text";
  table.style.borderCollapse = "collapse";
  table.style.width = "100%";
  table.style.textAlign = "center";
  table.addEventListener("mousedown", (e) => e.stopPropagation());
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");
  const headers = ["#", "课程中文名", "课程ID", "院系", "教师", "状态", "操作"];
  headers.forEach((header) => {
    const th = document.createElement("th");
    th.innerText = header;
    th.style.padding = "10px";
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);
  const tbody = document.createElement("tbody");

  courseList.forEach((course, index) => {
    const row = document.createElement("tr");
    const cells = [
      [(index + 1).toString(), "line_number"],
      [course.name, "name"],
      [course.idFull, "idFull"],
      [course.department, "department"],
      [course.teacher, "teacher"],
      [course.selected, "selected"],
      ["", "delete"],
    ];
    cells.forEach(([cell, identifier]) => {
      cell ??= "";
      const td = document.createElement("td");
      if (identifier === "delete") {
        const button = document.createElement("button");
        button.innerText = "删除";
        button.setAttribute("data-index", index.toString());
        button.addEventListener("click", deleteClick);
        td.appendChild(button);
      } else if (identifier === "selected") {
        if (state.editing) {
          td.innerHTML = `<input type="checkbox" ${cell ? "checked" : ""
            } data-index="${index}" data-field="${identifier}" value="选中">`;
        } else {
          td.innerText = cell ? "已选中" : "待选课";
        }
      } else if (state.editing && identifier !== "line_number") {
        td.innerHTML =
          `<input type="text" value="${cell}" data-index="${index}" data-field="${identifier}">`;
      } else if (
        identifier === "line_number" &&
        index === state.searchIndex
      ) {
        if (state.searchExist) {
          td.innerText = "✅️ " + cell;
        } else {
          td.innerText = "❌ " + cell;
        }
      } else {
        td.innerText = cell;
      }
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });

  table.appendChild(tbody);
  return table;
}

function saveTable(skipped = [], addOne = false) {
  const inputs = document.querySelectorAll(
    "#ucas-course-helper input",
  );
  const courseList = [];
  inputs.forEach((input) => {
    const index = input.getAttribute("data-index");
    const identifier = input.getAttribute("data-field");
    if (index === null || identifier === null) return;
    const i = parseInt(index);
    courseList[i] = courseList[i] ?? {
      name: "",
      idFull: "",
      teacher: "",
      department: "",
      selected: false,
    };
    // ["#", "课程中文名", "课程ID", "教师", "状态", "操作"];
    switch (identifier) {
      case "selected":
        courseList[i].selected = input.checked;
        break;
      default:
        courseList[i][identifier] = input.value;
        break;
    }
  });
  const newList = [];
  for (let i = 0; i < courseList.length; i++) {
    if (courseList[i] && !skipped.includes(i)) {
      courseList[i].id = courseList[i].idFull.split("-")[0];
      newList.push(courseList[i]);
    }
  }
  if (addOne) {
    newList.push({
      name: "",
      id: "",
      idFull: "",
      teacher: "",
      department: "",
      selected: false,
    });
  }
  GM_setValue("courseList", newList);
}

function showTable() {
  if (state.closed) {
    return;
  }
  // |   | 课程中文名 | 课程ID | 教师 | 院系 | 状态 | 操作 |
  // |---|-----------|--------|------|-----|------|
  // | 1 | 高等数学   | 123456 | 张三 | 数学系 | 已选中 | [删除] |
  // | 2 | 线性代数   | 654321 | 李四 | 数学系 | 未选中 | [删除] |
  const div = document.createElement("div");
  div.id = "ucas-course-helper";
  div.style.position = "fixed";
  div.style.top = "10px";
  div.style.right = "10px";
  div.style.backgroundColor = "white";
  div.style.border = "1px solid black";
  div.style.padding = "10px";
  div.style.zIndex = "10000";
  div.style.maxHeight = "80vh";
  div.style.overflowY = "auto";
  div.style.fontSize = "14px";
  div.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
  div.innerHTML = `<h2>UCAS 选课帮助系统(研究生版, v${VERSION})</h2>
    <p>* 目前仅通过课程ID进行自动选课.</p>
    <p>* 如果使用院系, 将启用查询筛选条件(未输入的院系不会被查询)</p>
    <h3>已保存课程列表</h3>`;
  (() => {
    div.style.cursor = "move";
    let isDragging = false, offsetX, offsetY;
    div.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - div.getBoundingClientRect().left;
      offsetY = e.clientY - div.getBoundingClientRect().top;
      div.style.userSelect = "none";
    });
    document.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      div.style.left = (e.clientX - offsetX) + "px";
      div.style.top = (e.clientY - offsetY) + "px";
      div.style.right = "unset";
    });
    document.addEventListener("mouseup", () => {
      isDragging = false;
      div.style.userSelect = "auto";
    });
  })();

  const copyButton = document.createElement("button");
  copyButton.innerText = "导出表格到剪切板";
  copyButton.style.margin = "10px";
  copyButton.onclick = async () => {
    const old = GM_getValue("courseList", []);
    await navigator.clipboard.writeText(JSON.stringify(old));
    myFloatingNotify("复制完成!");
  };
  div.appendChild(copyButton);

  const pasteButton = document.createElement("button");
  pasteButton.innerText = "从剪切板替换表格";
  pasteButton.style.margin = "10px";
  pasteButton.style.backgroundColor = "orangered";
  pasteButton.style.fontWeight = "bold";
  pasteButton.style.color = "white";
  async function replaceClipboard(text) {
    try {
      const json = JSON.parse(text);
      if (
        typeof json !== "object" || !(json instanceof Array) ||
        json.length <= 0
      ) {
        throw new Error("Clipboard text format error");
      }
      for (let i = 0; i < json.length; i++) {
        const d = json[i];
        if (!d || !d.idFull) {
          throw new Error(
            `Clipboard text format error in json[${i}]: ${JSON.stringify(d)
            }`,
          );
        }
      }
      const old = GM_getValue("courseList", []);
      GM_setValue("courseList", json);
      await navigator.clipboard.writeText(JSON.stringify(old));
    } catch (e) {
      console.log(e);
      notifyMe(e.toString());
    }
    showTable();
  }
  pasteButton.onclick = async () => {
    const text = await navigator.clipboard.readText();
    replaceClipboard(text);
  };
  div.appendChild(pasteButton);

  const ani_input = document.createElement("span");
  ani_input.innerHTML = "&emsp;显示滚动动画 <input type='checkbox' style='scale: 1.5;margin: 0 5px;'>";
  const ani_checkbox = ani_input.children[0];
  ani_checkbox.checked = config.show_animate;
  ani_checkbox.addEventListener("change", () => {
    config.show_animate = ani_checkbox.checked;
    saveConfig();
  });
  div.appendChild(ani_input);

  
  const use_notify = document.createElement("span");
  use_notify.innerHTML = "&emsp;使用系统通知 <input type='checkbox' style='scale: 1.5;margin: 0 5px;'>";
  const use_notify_check = use_notify.children[0];
  use_notify_check.checked = config.enable_system_notify;
  use_notify_check.addEventListener("change", () => {
    config.enable_system_notify = use_notify_check.checked;
    saveConfig();
  });
  div.appendChild(use_notify);

  // div.append("或粘贴到此处: ");

  // const pasteArea = document.createElement("div");
  // pasteArea.contentEditable = true;
  // pasteArea.style.display = "inline-block";
  // pasteArea.style.width = "100px";
  // pasteArea.style.height = "1.5rem";
  // pasteArea.style.overflow = "hidden";
  // pasteArea.style.backgroundColor = "lightgray";
  // pasteArea.addEventListener("mouseout", async () => {
  //   console.log(pasteArea.innerText);
  //   JSON.parse(pasteArea.innerText);
  //   await replaceClipboard(pasteArea.innerText);
  // });
  // div.appendChild(pasteArea);

  const courseList = GM_getValue("courseList", []);
  div.appendChild(createTable(courseList));

  if (state.editing) {
    const newButton = document.createElement("button");
    newButton.innerText = "新增课程";
    newButton.style.margin = "10px";
    newButton.onclick = () => {
      saveTable([], true);
      showTable();
    };
    div.appendChild(newButton);

    const editDoneButton = document.createElement("button");
    editDoneButton.innerText = "保存";
    editDoneButton.style.margin = "10px";
    editDoneButton.style.backgroundColor = "lightgreen";
    editDoneButton.onclick = () => {
      state.editing = false;
      saveTable();
      showTable();
    };
    div.appendChild(editDoneButton);
    document.getElementById("ucas-course-helper")?.remove();
    document.body.appendChild(div);
    return;
  }

  const editButton = document.createElement("button");
  editButton.innerText = "编辑课程列表";
  editButton.style.margin = "10px";
  editButton.onclick = () => {
    state.editing = true;
    showTable();
  };
  div.appendChild(editButton);

  const manualQuery = document.createElement("button");
  manualQuery.innerText = "点击一键查询";
  manualQuery.style.margin = "10px";
  manualQuery.style.backgroundColor = "lightblue";
  manualQuery.onclick = autoQuery;
  div.appendChild(manualQuery);

  const manualSelect = document.createElement("button");
  manualSelect.innerText = "点击一键选课";
  manualSelect.style.margin = "10px";
  manualSelect.style.backgroundColor = "lightgreen";
  manualSelect.onclick = () => {
    selCourses();
    // refresh list
    showTable();
  };
  div.appendChild(manualSelect);

  const manualSearch = document.createElement("button");
  manualSearch.innerHTML =
    "<code style='color: darkred;font-weight: bold;background-color: lightgray;padding: 0px 5px;border-radius: 3px;'>～</code> 键依序查找";
  manualSearch.style.margin = "10px";
  manualSearch.onclick = restartSearch;
  div.appendChild(manualSearch);


  const closeButton = document.createElement("button");
  closeButton.innerText = "关闭";
  closeButton.style.margin = "10px";
  closeButton.style.backgroundColor = "orangered";
  closeButton.style.fontWeight = "bold";
  closeButton.style.color = "white";
  closeButton.onclick = () => {
    div.remove();
    state.closed = true;
  };
  div.appendChild(closeButton);

  document.getElementById("ucas-course-helper")?.remove();
  document.body.appendChild(div);
}

function selectItem(item) {
  let able = false;
  try {
    item.children[0].checked = true;
    item.children[0].children[0].checked = true;
  } catch (err) {
    console.log(err);
  }
  try {
    let a = item.querySelector('input[type="checkbox"]');
    if (a) {
      a.checked = true;
      if (a.checked) {
        able = true;
      }
    }
    a = item.querySelector("input[type='checkbox']");
    if (a) {
      a.checked = true;
      if (a.checked) {
        able = true;
      }
    }
    a = item.querySelector("input[type=checkbox]");
    if (a) {
      a.checked = true;
      if (a.checked) {
        able = true;
      }
    }
  } catch (err) {
    console.log(err);
  }
  return able;
}

function findIndex(str, list, starting = 0) {
  for (let i = starting; i < list.length; i++) {
    if (list[i].indexOf(str) !== -1) {
      return i;
    }
  }
  return null;
}

function selCourses() {
  const courseList = GM_getValue("courseList", []);
  let sel = false;
  const selList = [];
  const tableList = document.getElementsByTagName("table");

  // debugger;
  for (let jj = 0; jj < tableList.length; jj++) {
    try {
      const items = tableList[jj].tBodies[0].children;
      console.log(items);
      const itemStr = [];
      for (let i = 0; i < items.length; i++) {
        itemStr.push(items[i].innerText);
      }
      // queryThroughIdFull
      for (const course of courseList) {
        const index = findIndex(course.idFull, itemStr);
        if (index && selectItem(items[index])) {
          if (course.selected) {
            continue;
          }
          course.selected = true;
          sel = true;
          continue;
        }
      }
    } catch (err) {
      console.log(err);
    }
  }
  if (sel) {
    const except = courseList.filter((c) => !c.selected).map((c) => c.name);
    let str = "选上了！\n共选了" + (courseList.length - except.length) +
      "门课\n" + selList.toString();
    if (except.length > 0) {
      str += "\n但是仍有如下课程未选择: \n" + except.join("\n");
    }
    notifyMe(str);

    GM_setValue("courseList", courseList);
  } else {
    let str = "啥也没选上！";
    const except = courseList.filter((c) => c.selected).map((c) => c.name);
    if (except.length === courseList.length) {
      str += "\n但是已全部选中";
    }
    if (except.length >= 0) {
      str += `\n但是已选择好${except.length}门课程: \n` +
        except.join("\n");
    }
    notifyMe(str);
  }

  setTimeout(
    () => {
      console.log("finish");
      window.scrollTo(
        0,
        document.getElementById("main-content").clientHeight,
      );
    },
    1000,
  );
}

function scrollHighlight(elem) {
  if (!elem) return;

  const bh = config.show_animate ? "smooth" : "instant";
  // 滚动到元素位置
  elem.scrollIntoView({ behavior: bh, block: "center" });

  // 保存原始背景色
  const oldBg = elem.style.backgroundColor;
  const oldShadow = elem.style.boxShadow;

  // 设置临时高亮
  elem.style.backgroundColor = "yellow";
  elem.style.boxShadow = "0 0 10px 2px yellow";

  // 渐变恢复
  let opacity = 1.0;
  const step = 0.025; // 每次降低的透明度
  const interval = 50; // 每次间隔(ms)

  const timer = setInterval(() => {
    opacity -= step;
    elem.style.backgroundColor = `rgba(255, 255, 0, ${opacity})`;

    if (opacity <= 0) {
      clearInterval(timer);
      // 恢复原始背景色
      elem.style.backgroundColor = oldBg;
      elem.style.boxShadow = oldShadow;
    }
  }, interval);
}

function searchWithIndex() {
  const id = state.searchIndex;
  const courseList = GM_getValue("courseList", []);
  const course = courseList[id];
  if (!course) {
    state.searchExist = false;
    return false;
  }
  const index = findIndex(course.idFull, state.tableStr);
  if (!index) {
    myFloatingNotify(
      `Cannot find ${course.name} with id ${course.idFull}!`,
    );
    state.searchExist = false;
    return false;
  }
  scrollHighlight(state.table_row[index]);
  state.searchExist = true;
  return true;
}

function restartSearch() {
  state.table_row = document.querySelectorAll(
    "tr:not(#ucas-course-helper tr)",
  );
  state.tableStr = [];
  for (let i = 0; i < state.table_row.length; i++) {
    state.tableStr.push(
      state.table_row[i].innerText,
    );
  }
  state.searchIndex = 0;
  searchWithIndex();
  showTable();
}

function autoQuery() {
  const courseList = GM_getValue("courseList", []);
  $("#courseType>option").prop("selected", true);
  const deptSet = new Set(courseList.map((c) => c.department?.trim() ?? "").filter((d) => d.length > 0));
  // debugger;
  if (deptSet.size > 0) {
    $("#deptIds>option").filter((_, x) => deptSet.has(x.textContent)).prop("selected", true);
  }
  $("#submitBtn").click();
}

function main() {
  // GM_setValue
  if (GM_getValue("courseList", []).length === 0) {
    GM_setValue(
      "courseList",
      JSON.parse(localStorage.getItem("courseList") || "[]"),
    );
  }

  window.addEventListener("keydown", function (e) {
    if (e.code !== "Backquote" && e.key !== "`") {
      return;
    }
    if (state.searchIndex === -1) {
      restartSearch();
      return;
    }
    state.searchIndex += 1;
    searchWithIndex();
    showTable();
  });
  showTable();
}

GM_setValue = GM_setValue ?? function (key, val) {
  localStorage.setItem(key, JSON.stringify(val));
};
GM_getValue = GM_getValue ?? function (key, val) {
  JSON.parse(localStorage.getItem(key) ?? JSON.stringify(val));
};

setTimeout(main, 50);

// selCourses();
console.log(main);
