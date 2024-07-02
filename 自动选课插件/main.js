// ==UserScript==
// @name         UCAS选课帮助系统
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  自动勾选抢课系统的checkbox
// @author       Me
// @match        https://xkcts.ucas.ac.cn/*
// @icon         data:image/x-icon;base64,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
// @grant        none
// ==/UserScript==

// ori Url Match https://xkcts.ucas.ac.cn/courseManageBachelor/*
(function() {
    'use strict';

    //这里负责通知
    function notifyMe(msg) {
        if (!("Notification" in window)) {
            // Check if the browser supports notifications
            alert("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
            // Check whether notification permissions have already been granted;
            // if so, create a notification
            if(!msg){
                const notification = new Notification("Hi there!\n选上了！");
            }else{
                const notification = new Notification("Hi there!\n"+msg);
            }
            // …
        } else if (Notification.permission !== "denied") {
            // We need to ask the user for permission
            Notification.requestPermission().then((permission) => {
                // If the user accepts, let's create a notification
                if (permission === "granted") {
                    const notification = new Notification("Hi there!\n选上了！");
                    // …
                }
            });
        }
        // At last, if the user has denied notifications, and you
        // want to be respectful there is no need to bother them anymore.
    }

    function tickAcademy(){
        let acLength = Number(localStorage.getItem("storage_ac_length"));
        let academyLists=[];
        for(let i = 0; i < acLength; i++)
            academyLists[i] = localStorage.getItem("storage_ac_array_"+i);
        /* check all academy */
        let acList = document.querySelectorAll('form[id="regfrm2"] .span2');
        let ckcnt = 0;
        for(let i=0;i<acList.length;i++){
            if(academyLists.find((s)=>(acList[i].innerHTML.indexOf(s)!=-1))){
                try{
                    acList[i].querySelector('input[type=checkbox]').checked = true;
                    if(acList[i].querySelector('input[type=checkbox]').checked===true){
                        ckcnt++;
                    }
                }catch(e){
                    console.log(e);
                }
            }
        }

        //notifyMe("共选择了"+ckcnt+"个学院");
    }


    /* Introduce */
    var version = "1.4";
    var tips0 = `-----欢迎使用抢课小助手v${version}-----\n`;
    var tips = tips0;
    var idLength = 0;
    var courseIdLists=[];
    var acLength = 0;
    var academyLists=[];
    if(window.location.href.indexOf("/courseManageBachelor/main") != -1){

        // 可设置30s不再显示
        if(typeof (Storage) != "undefined"){
            var dt1 = new Date().getTime();
            var dt0 = Number(localStorage.getItem("storage_time_mark"));
            var skip= Number(localStorage.getItem("storage_do_skip"));
            if(!dt0){
                localStorage.setItem("storage_time_mark",dt1);
                localStorage.setItem("storage_do_skip",0);
            }else if(dt1 - dt0 <= 30000 && skip){
                /* 30秒内刷新页面，且需要跳过 */
                localStorage.setItem("storage_time_mark",dt1);
                localStorage.setItem("storage_do_skip",1);
                tickAcademy();
                return;
            }else if((dt1 - dt0 < 3600*1000*2 && dt1 - dt0 > 30000 && skip) || (dt1 - dt0 <= 30000 && !skip)){
                /* 两个小时之内刷新页面，且需要跳过；或30秒内刷新页面 */
                skip = confirm("30s内不再显示？");
                localStorage.setItem("storage_time_mark",dt1);
                localStorage.setItem("storage_do_skip",Number(skip));
                if(skip){
                    tickAcademy();
                    return;
                }
            }else{
                localStorage.setItem("storage_time_mark",dt1);
                localStorage.setItem("storage_do_skip",0);
            }
        }

        if(typeof (Storage) == "undefined"){
            tips+="检测到浏览器不支持存储功能(或被禁止)，请直接输入课程编号(一次一条)。\n";
            tips+="(于是乎我迷惑了，既然浏览器不支持储存功能，难道你想进入手动选择页面之后再输入？"
            alert(tips);
        }else{
            let noInput = true;
            if( Number(localStorage.getItem("has_ac_storages")) && (acLength = Number(localStorage.getItem("storage_ac_length")))){
                tips+="检测到过去有输入学院，是否继续使用？\n学院列表为：";
                for(let i = 0; i < acLength; i++){
                    academyLists[i] = localStorage.getItem("storage_ac_array_"+i);
                    tips+= '\"' + academyLists[i] + '\", ';
                }
                if(!confirm(tips)){
                    acLength = 0;
                    academyLists = [];
                }
                tips = tips0;
                noInput = false;
            }
            if( Number(localStorage.getItem("has_id_storages")) && (idLength = Number(localStorage.getItem("storage_id_length")))){
                tips+="检测到过去有输入课程编号，是否继续使用？\n课程编号为：";
                for(let i = 0; i < idLength; i++){
                    courseIdLists[i] = localStorage.getItem("storage_id_array_"+i);
                    tips+= '\"' + courseIdLists[i] + '\", ';
                }
                if(!confirm(tips)){
                    idLength = 0;
                    courseIdLists = [];
                }
                noInput = false;
            }

            if(noInput){
                tips+="没有检测到输入记录，请直接输入学院和课程编号(一次一条)。\n";
                alert(tips);
            }
        }

        /* Get academy ids */
        if(acLength==0){
            tips = "请一次输入一条学院名称(例如物理学院)，不要使用空格等符号。\n点击确认继续输入，完成后点击取消。";
            do{
                (academyLists[acLength] = window.prompt(tips,""))
            }while(academyLists[acLength++] != null);
            acLength--;
            academyLists.length--;

            tips="您目前共选则了 " + acLength + " 个学院，它们的编号为：";
            for(let i = 0; i < acLength; i++){
                tips+= '\"' + academyLists[i] + '\", ';
            }
            alert(tips);
            console.log(tips);

            if(typeof (Storage) != "undefined" && acLength){
                localStorage.setItem("has_ac_storages",1);
                localStorage.setItem("storage_ac_length", acLength);
                acLength = localStorage.getItem("storage_ac_length");

                for(let i = 0; i < acLength; i++){
                    localStorage.setItem("storage_ac_array_"+i,academyLists[i]);
                }
            }
        }


        /* Get course ids */
        if(idLength==0){
            tips = "请一次输入一条课程编号(例如B0211001Y-01)，不要使用空格等符号。\n点击确认继续输入，完成后点击取消。";
            do{
                (courseIdLists[idLength] = window.prompt(tips,""))
            }while(courseIdLists[idLength++] != null);
            idLength--;
            courseIdLists.length--;

            tips="您目前共选则了 " + idLength + " 门课程，它们的编号为：";
            for(let i = 0; i < idLength; i++){
                tips+= '\"' + courseIdLists[i] + '\", ';
            }
            tips+= "\n在进入\"新增加本学期课程\"页面后，会自动滚动到底部，这代表着已完成勾选";
            alert(tips);
            console.log(tips);

            if(typeof (Storage) != "undefined" && idLength){
                localStorage.setItem("has_id_storages",1);
                localStorage.setItem("storage_id_length", idLength);
                idLength = localStorage.getItem("storage_id_length");

                for(let i = 0; i < idLength; i++){
                    localStorage.setItem("storage_id_array_"+i,courseIdLists[i]);
                }
            }
        }


        /* check all academy */
        var acList = document.querySelectorAll('form[id="regfrm2"] .span2');
        var ckcnt = 0;
        for(let i=0;i<acList.length;i++){
            if(academyLists.find((s)=>(acList[i].innerHTML.indexOf(s)!=-1))){
                try{
                    acList[i].querySelector('input[type=checkbox]').checked = true;
                    if(acList[i].querySelector('input[type=checkbox]').checked===true){
                        ckcnt++;
                    }
                }catch(e){
                    console.log(e);
                }
            }
        }

        notifyMe("共选择了"+ckcnt+"个学院");

    }else if(typeof (Storage) != "undefined" && Number(localStorage.getItem("has_id_storages")) && (idLength = Number(localStorage.getItem("storage_id_length")))){
        for(let i = 0; i < idLength; i++){
            courseIdLists[i] = localStorage.getItem("storage_id_array_"+i);
        }

        //var tmout = setTimeout(()=>location.reload(),5000);

        function selectitem(item){
            var able=false;
            try{
                item.children[0].checked = true;
                //if(item.children[0].checked){
                //    able=true;
                //}
                item.children[0].children[0].checked = true;
                //if(item.children[0].children[0].checked){
                //    able=true;
                //}
                //item.children[0].children[0].checked = true;
            }catch(err){
                console.log(err);
            }
            try{
                let a = item.querySelector('input[type="checkbox"]');
                if(a){
                    a.checked = true;
                    if(a.checked){
                        able=true;
                    }
                }
                a = item.querySelector("input[type='checkbox']");
                if(a){
                    a.checked = true;
                    if(a.checked){
                        able=true;
                    }
                }
                a = item.querySelector('input[type=checkbox]');
                if(a){
                    a.checked = true;
                    if(a.checked){
                        able=true;
                    }
                }
            }catch(err){
                console.log(err);
            }
            return able;
        }





        //var tmout2 = setTimeout(()=>notifyMe("你的网页停摆了！！！！"),10000);

        //document.onclick=()=>{
        function selCourses(){

            var sel = false;
            var selList = [];
            var tabletableList = [];
            //alert("??");
            var tabletable=document.getElementsByClassName("table");
            //var tabletable=document.querySelectorAll('table');

            //var frames = document.querySelectorAll('iframe');
            //for(let jj=0;jj < frames.length;jj++){
            //    tabletableList.push(frames[jj].contentWindow.document.querySelectorAll('table'));
            //}

            //for(let kk=0;kk<tabletableList.length;kk++){
                //tabletable=tabletableList[kk];
            for(let jj=0;jj < tabletable.length;jj++){
                try{
                    var items = tabletable[jj].tBodies[0].children;
                    for(let i = 0; i < items.length; i++){
                        //if(courseIdLists.find((a)=>(a==items[i].children[4].firstChild.firstChild.innerHTML))){
                        if(courseIdLists.find((a)=>(items[i].innerHTML.indexOf(a)!=-1))){
                            if(courseIdLists.find((a)=>(items[i].innerHTML.indexOf(a)!=-1))!=courseIdLists.findLast((a)=>(items[i].innerHTML.indexOf(a)!=-1))){
                                continue;
                                // 这是保证一个条目只会有一个序号，否则跳过
                            }
                            //items[i].children[0].children[0].checked = true;
                            if(selectitem(items[i])){
                                selList.push(courseIdLists.find((a)=>(items[i].innerHTML.indexOf(a)!=-1)));
                            }
                            //if(!items[i].children[0].children[0].disabled){
                            //clearTimeout(tmout);
                            //sel=true;
                            //alert("选上了！");
                            //}
                            sel=true;
                        }
                    }
                }catch(err){
                    console.log(err);
                }
            }
            //}

            if(sel){
                notifyMe("选上了！\n共选了"+selList.length+"门课\n"+selList.toString());
            }else{
                notifyMe("啥也没选上！");
            }

            setTimeout( ()=>window.scrollTo(0, document.getElementById("main-content").clientHeight/2),1000);
        };
        selCourses();

       // };
    }
})();
