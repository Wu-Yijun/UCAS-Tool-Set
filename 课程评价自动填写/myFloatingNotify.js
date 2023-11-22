/**
 * This file is not necessary. I write it so that I can use it at any place.
 * This is a easy tool to Show a Notify inside page. No need to init; 
 * @param {string} text : The text you want to show in your page. 
 * @param {*} dt        : The duration of the text being shown. Default to be 1000 ms.
 * @returns             : No returning Value
 * Notice that the function will automatically log in console.
 */

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
    setTimeout(() => { newProgressBar.style.width = "200px" }, 100);
    // fade out
    setTimeout(() => { newContiner.style.opacity = 0; }, dt);
    // disapper
    setTimeout(() => { newContiner.style.display = "none"; }, dt + fadeTime);


    myFloatingWindow.appendChild(newContiner);
    return;
};
