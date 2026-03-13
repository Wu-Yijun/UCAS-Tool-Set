// ==UserScript==
// @name         mooc 自动播放
// @namespace    http://tampermonkey.net/
// @version      1.3
// @description  基于 Mutex (互斥锁) 的多 iframe 分组调度器
// @author       Aluria
// @match        https://mooc.mooc.ucas.edu.cn/mooc-ans/mycourse/studentstudy*
// @match        https://mooc.mooc.ucas.edu.cn/ananas/modules/video/*
// @match        https://pan.mooc.ucas.edu.cn/screen/*
// @icon         https://mooc.mooc.ucas.edu.cn/favicon.ico
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==


setTimeout(function () {
  'use strict';
  document.body.addEventListener('mouseout', (e) => e.stopPropagation());

  function add_video_info({ url, chapterId, name }) {
    console.log(name, chapterId, url);
    const videos = GM_getValue('video_urls', {});
    videos[chapterId] ??= {
      chapterId,
      name,
      urls: [],
    };
    videos[chapterId].name ??= name;
    if (url && !videos[chapterId].urls.includes(url)) {
      videos[chapterId].urls.push(url);
    }
    GM_setValue('video_urls', videos);
  }

  function is_outer() {
    return window === window.top;
  }

  // ================= 统一的通信接口 =================
  // 按照你设定的逻辑重写 postTask
  function postTask(name, is_finished = false, mutex = undefined) {
    window.top.postMessage({
      source: 'TM_IFRAME_TASK',
      taskName: name,
      is_finished: is_finished,
      mutex: mutex
    }, '*');
  }

  /** Get Type of current study task
   * @returns {'video'|'pdf'} `video`: 看完视频; `pdf`: 读完 PDF 讲义
   */
  function getType() {
    if (location.href.includes('/ananas/')) {
      return 'video';
    } else if (location.href.includes('/pan.mooc.ucas.edu.cn/')) {
      return 'pdf';
    }
  }

  function doTask(callback) {
    switch (getType()) {
      case "video":
        watchVideo(callback);
        break;
      case "pdf":
        readPDF(callback);
        break;
      default:
        callback();
    }
  }

  /**
 * Removes all query parameters from a URL string.
 * @param {string} urlString The original URL as a string.
 * @returns {string} The modified URL string without any query parameters.
 */
  function removeAllQueryParams(urlString) {
    const url = new URL(urlString);
    url.search = ''; // Set the search property to an empty string
    return url.href;
  }

  function watchVideo(callback) {
    let interval = setInterval(() => {

      const btn = document.querySelector(".vjs-big-play-button");
      // 直接获取底层的 video 标签
      const video = document.querySelector('#video_html5_api') || document.querySelector('video');
      console.log("找到视频元素，准备执行静音与播放...");

      // 1. 强制静音，这是绕过自动播放限制的关键
      video.muted = true;

      // 2. 如果视频处于暂停状态，则尝试播放
      if (video.paused) {
        btn?.click();
      }
      if (video.paused) {
        video.play();
      }
      if (video.paused) return;

      add_video_info({
        url: removeAllQueryParams(video.src),
        chapterId: new URL(window.top.location.href).searchParams.get('chapterId'),
      });

      // 3. 监听视频播放结束事件，实现自动跳转下一集
      video.addEventListener('ended', () => {
        console.log("本集播放结束，准备切换下一集...");
        callback();
      });
      clearInterval(interval);
    }, 3000);
  }

  function readPDF(callback) {
    let lastScrollTop = -1;
    let interval = setInterval(() => {
      window.scrollBy(0, 300);
      const currentScrollTop = window.scrollY || document.documentElement.scrollTop;
      // 如果当前位置和上一次记录的位置一样，说明已经“撞墙”到底部了
      if (currentScrollTop === lastScrollTop) {
        clearInterval(interval);
        console.log("已到底部，停止循环");
        // 触发你的事件
        callback();
      } else {
        lastScrollTop = currentScrollTop;
      }
    }, 200);
  }

  function jumpToNextPage() {
    const nextBtn = document.querySelector('.orientationright') ?? document.querySelector('#right1');
    nextBtn.click();
    setTimeout(() => {
      document.querySelectorAll('a.nextChapter').forEach(x => x.click());
    }, 500);
    setTimeout(() => window.location.reload(), 1000);
  }

  function showDownload() {
    const style = document.createElement('style');
    style.innerHTML = `
    #download-all-videos {
      position: fixed;
      right: 2em;
      top: 2em;
      background-color: rgba(16, 255, 100, 0.827);
      color: rgb(0, 0, 0);
      font-weight: 700;
      width: 3em;
      height: 3em;
      font-size: 1em;
      z-index: calc(infinity);
      border-radius: 1em;
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      cursor: pointer;
      user-select: none;
      transition: background-color 0.5s;
    }
    #download-all-videos:hover {
      background-color: rgba(12, 163, 64, 0.84);
    }`;
    const dl = document.createElement('div');
    dl.id = 'download-all-videos';
    dl.title = '下载全部已观看视频链接地址清单';
    dl.appendChild(style);
    dl.append('下载');
    dl.onclick = () => {
      const data = Object.values(GM_getValue('video_urls', {}));
      console.log(data);
      const json = data
        .map(x => ({ chapterId: parseInt(x.chapterId), urls: x.urls, header: x.name }))
        .sort((a, b) => a.chapterId - b.chapterId);

      // 3. Create a Blob with the JSON string and the correct MIME type
      const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" }); //

      // 4. Generate a URL for the Blob
      const url = URL.createObjectURL(blob); //

      // 5. Create a hidden anchor element and set its attributes
      const anchorEl = document.createElement('a');
      anchorEl.href = url;
      anchorEl.download = 'user_data.json'; // Set the desired file name
      anchorEl.style.display = 'none'; // Hide the element

      // 6. Append the anchor to the body (necessary for Firefox) and click it
      document.body.appendChild(anchorEl);
      anchorEl.click();

      // 7. Clean up: remove the element and revoke the object URL
      document.body.removeChild(anchorEl);
      URL.revokeObjectURL(url); //
    };
    document.body.appendChild(dl);
  }

  // ================= 👑 主页面：带分组的调度中心 =================
  if (is_outer()) {
    console.log("👑 [主页面] 调度中心启动，支持 Mutex 机制...");


    add_video_info({
      chapterId: new URL(window.top.location.href).searchParams.get('chapterId'),
      name: document.querySelector('h1').textContent,
    });

    let mutexQueues = {}; // 分组队列池，结构: { "GroupA": ['url1', 'url2'], "GroupB": ['url3'] }
    let mutexLocks = {};  // 分组锁状态，结构: { "GroupA": true, "GroupB": false } (true代表正在执行)
    let taskNum = 0;
    let taskCompleteNum = 0;

    // 尝试触发特定 mutex 队列中的下一个任务
    function triggerNextInMutex(mutex) {
      // 如果该分组当前没有被锁，且队列里有任务
      if (!mutexLocks[mutex] && mutexQueues[mutex] && mutexQueues[mutex].length > 0) {
        mutexLocks[mutex] = true; // 🔒 上锁
        const nextTask = mutexQueues[mutex].shift(); // 取出队列首个任务

        console.log(`\n🚦 [调度中心] 绿灯！允许 [${mutex}] 组的 ${nextTask.taskName} 开始执行`);

        // 广播发送启动信号
        nextTask.src.postMessage({
          source: 'TM_TASK_MANAGER',
          action: 'START_TASK',
          targetUrl: nextTask.taskName,
          mutex: mutex
        }, '*');
      }
    }

    // 设置任务超时(60 min)
    setTimeout(jumpToNextPage, 1000 * 60 * 60);
    // 设置长时间任务超时(20 min)
    let longTimeout = setTimeout(jumpToNextPage, 1000 * 60 * 20);

    // 监听 iframe 汇报
    window.addEventListener('message', (event) => {
      const data = event.data;
      if (!data || data.source !== 'TM_IFRAME_TASK') return;


      const { taskName, is_finished, mutex } = data;

      // 任何行为刷新 longTimeout
      clearTimeout(longTimeout);
      longTimeout = setTimeout(jumpToNextPage, 1000 * 60 * 20);

      if (!is_finished) {
        taskNum += 1;
        // 1. 任务注册阶段
        if (mutex !== undefined) {
          // 有互斥锁：加入对应分组队列，并尝试触发
          if (!mutexQueues[mutex]) mutexQueues[mutex] = [];
          mutexQueues[mutex].push({ taskName, src: event.source });
          console.log(`📥 [调度中心] 任务 ${taskName} 加入互斥队列 [${mutex}]`);

          triggerNextInMutex(mutex);
        } else {
          // 无互斥锁：直接记录，不需要它等待信号
          console.log(`🕊️ [调度中心] 任务 ${taskName} 无锁，自由执行`);
        }
      } else {
        // 2. 任务完成阶段
        console.log(`✅ [调度中心] 任务完成: ${taskName} (锁: ${mutex || '无'})`);
        if (mutex !== undefined) {
          mutexLocks[mutex] = false; // 🔓 解锁当前分组
          triggerNextInMutex(mutex); // 呼叫当前分组的下一个
        }
        taskCompleteNum += 1;
      }
      if (taskNum === taskCompleteNum && taskNum > 0) {
        jumpToNextPage();
        mutexQueues = {};
        mutexLocks = {};
        taskNum = 0;
        taskCompleteNum = 0;
      }
    });

    // 显示 UI
    showDownload();
  }
  // ================= 📄 子页面：执行者 =================
  else {
    const myUrl = location.href;

    // 假设这里决定当前页面的 mutex。
    // 测试时，你可以根据 URL 动态设置它。比如包含 'a.html' 的设为 'GROUP_A'，有些设为 undefined。
    // const myMutex = Math.random() > 0.5 ? 'API_LIMIT_GROUP' : undefined;
    const taskType = getType();
    let myMutex;
    switch (taskType) {
      case "video":
        myMutex = 'video';
        break;
      case "pdf":
        myMutex = undefined;
        break;
      default:
        throw new Error();
    }

    console.log(`📄 [iframe] 就绪，当前分配的 Mutex: ${myMutex || '无'}`);

    if (myMutex !== undefined) {
      // 【有锁模式】：发送注册消息 (is_finished=false)，并严格等待发令枪
      postTask(myUrl, false, myMutex);

      window.addEventListener('message', (event) => {
        const data = event.data;
        if (data && data.source === 'TM_TASK_MANAGER' && data.action === 'START_TASK') {
          console.log("🔓 当前任务已解锁:", data);
          if (data.targetUrl === myUrl) {
            doTask(() => postTask(myUrl, true, myMutex));
          }
        }
      });
    } else {
      // 【无锁模式】：发送消息仅仅是为了告诉主页面“我开始了”，然后立刻自顾自地执行
      postTask(myUrl, false, undefined);
      doTask(() => postTask(myUrl, true, myMutex));
    }
  }
}, 2000);
