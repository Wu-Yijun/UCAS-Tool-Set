// ==UserScript==
// @name         国科大课程评价自动完成工具
// @namespace    http://tampermonkey.net/
// @version      0.8.5
// @description  try to take over the world!
// @author       You
// @match        https://bkkcpj.ucas.ac.cn/*
// @icon         data:image/x-icon;base64,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
// @grant        none
// ==/UserScript==


(function () {
    const text = "挺好的，很满意。";
    const courseList = "https://bkkcpj.ucas.ac.cn/#/myCoursePoll/page";
    const FormPageUrl = "https://bkkcpj.ucas.ac.cn/#/myPoll/fill/";
    // const hostName = window.location.protocol + "//" + window.location.host + "/";
    // 网络不佳时要延长这些数据 单位：毫秒
    // 初始界面的加载时间   如果初始界面未完成加载，延长此处
    const timeout1 = 5000;
    // 填表界面的加载时间   如果填写界面未完成加载，延长此处
    const timeout2 = 3000;
    // 转跳前等待时间       如果电脑差，来不及成功提交，延长此处
    const timeout3 = 1000;
    // 设置是否要跳过已完成的问卷。
    const skipFinishedForm = true;
    // 设置是否要手动打开填写界面，不自动转跳
    const enableManualOpenForm = true;

    var links = [];

    function myFloatingNotify(text, dt) {
        const defaultDt = 1000;
        const fadeTime = 1000;
        const myFloatingWindowName = "myFloatingWindow";
        const defaultWidth = "350px";

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
            // f*K ** 页面的最下方的“版权所有”不要脸，z-index 开大。
            // 你不讲武德，我也不讲了...
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
        newContent.style.width = defaultWidth;
        newContent.style.display = "grid";
        newContent.append(text);

        const newProgressBar = document.createElement("div");
        newProgressBar.style.height = "3px";
        newProgressBar.style.width = "3px";
        newProgressBar.style.backgroundColor = "green";
        newProgressBar.style.transition = `width ${dt}ms ease`;

        newContiner.appendChild(newContent);
        newContiner.appendChild(newProgressBar);

        // progress bar (100ms delay is used to active animation)
        setTimeout(() => { newProgressBar.style.width = defaultWidth }, 100);
        // fade out
        setTimeout(() => { newContiner.style.opacity = 0; }, dt);
        // disapper
        setTimeout(() => { newContiner.style.display = "none"; }, dt + fadeTime);


        myFloatingWindow.appendChild(newContiner);
        return;
    };

    function Waiting(f, time, str) {
        console.log(str, "Waiting for " + time / 1000 + " sec...");
        if (str) {
            myFloatingNotify(str, time);
        }
        setTimeout(() => { f(); }, time);
    }

    function AutoFill(f) {
        if (typeof FunName !== "function") f = () => { };
        // console.log(text);
        var form = document.getElementsByClassName("el-form");
        if (form.length == 0) return f();

        // fill the form
        var list = form[0].getElementsByClassName("el-card box-card");
        for (let i = 0; i < list.length; i++) {
            var card = list[i].getElementsByClassName("el-form-item");
            if (card.length == 0) continue;
            var checklist = card[0].getElementsByClassName("el-form-item__content");
            if (card.length == 0) continue;
            // single choice
            var checkbox = checklist[0].getElementsByClassName("el-radio__inner");
            if (checkbox.length > 0) {
                checkbox[0].click();
                console.log("Single Check: " + i);
                continue;
            }
            // multi choice
            var checkboxs = checklist[0].getElementsByClassName("el-checkbox__inner");
            if (checkboxs.length > 0) {
                if(!checkboxs[0].parentElement.classList.contains("is-checked"))
                    checkboxs[0].click();
                console.log("Multi Check: " + i);
                continue;
            }
            // input text
            var inputarea = checklist[0].getElementsByClassName("el-textarea");
            if (inputarea.length > 0) {
                var textarea = inputarea[0].getElementsByTagName("textarea");
                if (textarea.length != 0) {
                    textarea = textarea[0];
                    textarea.value = text;
                    textarea.dispatchEvent(new InputEvent("input", { inputType: "insertFromDrop" }));
                    console.log("Text Area: " + i);
                    continue;
                }
            }
        }
        // submit the form
        var btn = form[0].getElementsByClassName("el-button");
        if (btn.length > 0) {
            btn[0].click();
        } else {
            btn = form[0].getElementsByTagName("button");
            if (btn.length > 0) {
                for (let i of btn) i.click();
            } else {
                alert("Can not find submit button!\nTry submit by hand.");
                return f();
            }
        }
        // go back to last page
        // console.log("This Form is Done");
        myFloatingNotify("This Form is Done");
        return f();
    };
    function FindUnfinished() {
        myFloatingNotify("Finding links of forms...");
        var form = document.getElementsByClassName("app-container");
        if (form.length == 0) return;
        var table = form[0].getElementsByClassName("el-table");
        if (table.length == 0) return;

        var tablebody = table[0].getElementsByClassName("el-table__body");
        if (tablebody.length == 0) return;

        var rows = tablebody[0].getElementsByClassName("el-table__row");
        for (let i of rows) {
            if (skipFinishedForm && i.innerHTML.indexOf("已完成") != -1) {
                let name = "";
                try {
                    name = i.firstChild.firstChild.innerHTML;
                } catch (e) { }
                myFloatingNotify(`Skip a form ${name}!`);
                continue;
            }
            var cell = i.lastChild;
            let href = cell.getElementsByTagName("a");
            if (href.length == 0) continue;
            links.push(href[0].href);
        }
        myFloatingNotify(`Find ${links.length} new forms!`);
        console.log("Forms to fill:", links);

        // go to next page
        function fillNext(i) {
            if (i >= links.length) {
                myFloatingNotify("All forms are filled! Back to homepage.");
                window.location.href = courseList;
                return;
            }
            window.location.href = links[i];
            // AutoFill();
            Waiting(() => {
                AutoFill(() => {
                    Waiting(() => {
                        fillNext(i + 1);
                    }, timeout3, "Ready to leave");
                });
            }, timeout2, `Loading Form No.${i + 1} ...`);
        };
        Waiting(() => { fillNext(0) }, timeout3);
    };
    if (window.location.href == courseList) {
        if (enableManualOpenForm) {
            myFloatingNotify("Manual Open Form Mode Enabled!");
            return;
        }
        Waiting(FindUnfinished, timeout1, "Waiting For page loading...");
    }
    if (enableManualOpenForm && window.location.href.indexOf(FormPageUrl) != -1) {
        Waiting(AutoFill, timeout2, "Waiting For page loading...");
    }
})();
