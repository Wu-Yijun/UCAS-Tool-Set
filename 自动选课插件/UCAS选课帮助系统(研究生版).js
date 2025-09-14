// ==UserScript==
// @name         UCAS 选课帮助系统(研究生版)
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  提前输入课程选择, 在选课开通后自动快速勾选
// @author       Aluria
// @match        https://xkgodj.ucas.ac.cn/*
// @match        http://xkgo.ucas.ac.cn:3000/*
// @icon         https://ucas.ac.cn/publish/xww/images/icon1.png
// @grant        none
// ==/UserScript==

const VERSION = "1.5";

const config = {
    site: ["https://xkgodj.ucas.ac.cn/", "http://xkgo.ucas.ac.cn:3000/"],
    url: "/courseManage/main",
    urlSj: "/courseManageSj/main",
    storageKey: "courseList",

    selectButton: "新增加本学期研究生课程",
    selectButtonSj: ["新增本所课程", "新增基地课程", "新增跨所课程"],
};

const state = {
    editing: false,
};

function myFloatingNotify(text, dt) {
    const defaultDt = 1000;
    const fadeTime = 1000;
    const myFloatingWindowName = "myFloatingWindow";

    if (dt) dt = dt;
    else dt = defaultDt;
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
    if (!("Notification" in window)) {
        // Check if the browser supports notifications
        alert("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        // Check whether notification permissions have already been granted;
        // if so, create a notification
        if (!msg) {
            const notification = new Notification("Hi there!\n选上了！");
        } else {
            const notification = new Notification("Hi there!\n" + msg);
        }
        // …
    } else if (Notification.permission !== "denied") {
        // We need to ask the user for permission
        Notification.requestPermission().then((permission) => {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
                const notification = new Notification(
                    "Hi there!\n选上了！",
                );
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
    selected: boolean;
}

e.g.
const courseList = [
    {
        name: "高等数学",
        id: "123456",
        idFull: "123456-001",
        teacher: "张三",
        selected: false,
    },
    {
        name: "线性代数",
        id: "654321",
        idFull: "654321-001",
        teacher: "李四",
        selected: true,
    },
];
**/

function deleteClick(event) {
    const index = parseInt(event.target.getAttribute("data-index"));
    if (index === null) return;
    saveTable([index]);
    showTable();
}

function createTable(courseList) {
    const table = document.createElement("table");
    // <table border="1" style="border-collapse: collapse; width: 100%;">
    table.border = "1";
    table.style.borderCollapse = "collapse";
    table.style.width = "100%";
    table.style.textAlign = "center";
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");
    const headers = ["#", "课程中文名", "课程ID", "教师", "状态", "操作"];
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
            [course.teacher, "teacher"],
            [course.selected, "selected"],
            ["", "delete"],
        ];
        cells.forEach(([cell, identifier]) => {
            const td = document.createElement("td");
            if (identifier === "delete") {
                const button = document.createElement("button");
                button.innerText = "删除";
                button.setAttribute("data-index", index.toString());
                button.addEventListener("click", deleteClick);
                td.appendChild(button);
            } else if (identifier === "selected") {
                if (state.editing) {
                    td.innerHTML = `<input type="checkbox" ${
                        cell ? "checked" : ""
                    } data-index="${index}" data-field="${identifier}" value="选中">`;
                } else {
                    td.innerText = cell ? "已选中" : "待选课";
                }
            } else if (state.editing && identifier !== "line_number") {
                td.innerHTML =
                    `<input type="text" value="${cell.toString()}" data-index="${index}" data-field="${identifier}">`;
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
            selected: false,
        });
    }
    localStorage.setItem("courseList", JSON.stringify(newList));
}

function showTable() {
    // |   | 课程中文名 | 课程ID | 教师 | 状态 | 操作 |
    // |---|-----------|--------|------|-----|------|
    // | 1 | 高等数学   | 123456 | 张三 | 已选中 | [删除] |
    // | 2 | 线性代数   | 654321 | 李四 | 未选中 | [删除] |
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
    * 目前仅通过课程ID进行自动选课.
    <h3>已保存课程列表</h3>`;

    const courseList = JSON.parse(localStorage.getItem("courseList") || "[]");
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

    const closeButton = document.createElement("button");
    closeButton.innerText = "关闭";
    closeButton.style.margin = "10px";
    closeButton.onclick = () => {
        div.remove();
    };
    div.appendChild(closeButton);

    const manualSelect = document.createElement("button");
    manualSelect.innerText = "手动触发选课";
    manualSelect.style.margin = "10px";
    manualSelect.onclick = () => {
        selCourses();
        // refresh list
        showTable();
    };
    div.appendChild(manualSelect);

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
    const courseList = JSON.parse(localStorage.getItem("courseList") || "[]");
    let sel = false;
    const selList = [];
    const tableList = document.getElementsByClassName("table");

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
                if (course.selected) {
                    continue;
                }
                const index = findIndex(course.idFull, itemStr);
                if (index && selectItem(items[index])) {
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

        localStorage.setItem("courseList", JSON.stringify(courseList));
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

function main() {
    const href = window.location.href;
    if (href.endsWith(config.url) || href.endsWith(config.urlSj)) {
        showTable();
    } else {
        selCourses();
    }
}

setTimeout(main, 1000);

// selCourses();
