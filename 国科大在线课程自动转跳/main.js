// ==UserScript==
// @name         国科大在线(慕课)快捷跳转
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  利用悬浮窗触发跨域多步自动跳转，基于状态机管理生命周期
// @author       Aluria
// @match        https://sep.ucas.ac.cn/appStoreStudent*
// @match        https://mooc.ucas.edu.cn/portal*
// @match        https://i.mooc.ucas.edu.cn/space/index*
// @match        https://mooc.ucas.edu.cn/courselist/mycourse*
// @match        https://mooc.mooc.ucas.edu.cn/mycourse/studentcourse*
// @match        https://mooc.mooc.ucas.edu.cn/mooc-ans/**
// @grant        GM_setValue
// @grant        GM_getValue
// @run-at       document-end
// ==/UserScript==

(function () {
  'use strict';

  const TIMEOUT = 500;

  // Main: Sep > Mooc > MySpace > Class > Files
  // Sub: Class > Files
  // Sub: Class > Tasks
  // Sub: Class > Notifications

  // ==========================================
  // 配置区域 (请根据实际情况修改)
  // ==========================================
  const PAGE_SEP_DOMAIN = 'sep.ucas.ac.cn'; // A 页面的域名
  const PAGE_MOOC_URL = 'https://sep.ucas.ac.cn/portal/site/441/2142'; // Mooc 页面的跳转 URL 或域名
  const PAGE_MOOC_URL_REAL = 'https://mooc.ucas.edu.cn/portal'; // Mooc 页面的确切 URL 或域名
  const PAGE_MY_SPACE_URL = "http://i.mooc.ucas.edu.cn/"; // MySpace 页面的确切 URL 或域名
  const PAGE_MY_SPACE_URL_INNER = "https://mooc.ucas.edu.cn/courselist/mycourse";
  const PAGE_MY_SPACE_URL_OUTER = "https://i.mooc.ucas.edu.cn/space/index";
  const PAGE_MY_COURSE_URL = "https://mooc.mooc.ucas.edu.cn/mycourse";
  const PAGE_MOOC_COURSE_URL = "https://mooc.mooc.ucas.edu.cn/mooc-ans/";


  const SUB_CLASS = ["资料", "作业", "通知", "首页"];

  // 默认目标列表
  const DEFAULT_TARGETS = ['MySpace'];

  // ==========================================
  // 状态管理与存储 API
  // ==========================================
  function getTargets() {
    return GM_getValue('nav_targets', DEFAULT_TARGETS);
  }

  function saveTargets(targets) {
    GM_setValue('nav_targets', targets);
  }

  function getTaskState() {
    return GM_getValue('nav_task_state', { active: false, step: 0, targetName: '', subTarget: '' });
  }

  function updateTaskState(stateUpdates) {
    const currentState = getTaskState();
    GM_setValue('nav_task_state', { ...currentState, ...stateUpdates });
  }

  function clearTaskState() {
    GM_setValue('nav_task_state', { active: false, step: 0, targetName: '', subTarget: '' });
  }

  // 触发跳转任务
  function startNavigation(targetName, subTarget = SUB_CLASS[0], new_page = false, kind = "sep") {
    // 触发第一次跳转：Sep -> Mooc
    let target;
    let step = 1;
    switch (kind) {
      case "sep":
        target = document.querySelector('a[title=国科大在线]').href ?? PAGE_MOOC_URL;
        break;
      case "course":
        target = PAGE_MY_SPACE_URL;
        step = 2;
        break;
    }
    // 初始化任务状态，设定下一步为 1 (前往 Mooc)
    updateTaskState({ active: true, step, targetName, subTarget });
    if (new_page) {
      window.open(target, '_blank');
    } else {
      window.location.href = target;
    }
  }

  // ==========================================
  // 核心跳转逻辑 (状态机)
  // 每次页面加载时都会检查是否有未完成的活跃任务
  // ==========================================
  function checkAndExecuteNavigation() {
    const state = getTaskState();
    if (!state.active) return; // 如果没有活跃任务，作为普通页面加载，不进行任何干预

    const currentHref = window.location.href;

    // Step 1: 已经到达 MOOC 页面，准备前往 MySpace 页面
    if (state.step === 1 && currentHref.includes(PAGE_MOOC_URL_REAL)) {
      console.log(`[自动导航] 到达 Mooc，准备前往 MySpace, 目标: ${state.targetName}`);
      updateTaskState({ step: 2 });
      // 这里演示直接跳转
      setTimeout(() => {
        // history.pushState({ page: 'current' }, "", window.location.href);
        window.location.href = PAGE_MY_SPACE_URL;
      }, TIMEOUT); // 延时1秒防止请求拦截
      return;
    }

    // Step 2: 脚本会在 iframe 内部独立执行此逻辑
    if (state.step === 2 && currentHref.includes(PAGE_MY_SPACE_URL_INNER)) {
      console.log(`[自动导航-iframe内] 到达 MySpace 子页面，准备前往最终目标: ${state.targetName}`);

      // 因为 iframe 内容可能加载稍慢，稍微延长一点时间，或者使用轮询
      setTimeout(() => {
        try {
          // 注意：属性选择器 cname 的值最好加上引号，避免带空格或特殊字符时报错
          const targetLi = document.querySelector(`li[cname="${state.targetName}"]`);

          if (targetLi) {
            const targetA = targetLi.querySelector('a');
            if (targetA && targetA.href) {
              // 成功找到目标链接后，再推进状态机
              updateTaskState({ step: 3 });

              // 【关键修改】使用 window.top.location.href 让最外层主页面进行跳转
              // 如果你仅仅想让 iframe 内部跳转，保持 window.location.href 即可
              // history.pushState({ page: 'current' }, "", window.location.href);
              window.top.location.href = targetA.href;
              return; // 退出
            } else {
              console.error('[自动导航] 找到了 li，但未找到内部的 a 标签或 href 属性');
            }
          } else {
            console.error(`[自动导航] 未在 iframe 中找到目标元素: li[cname="${state.targetName}"]`);
          }
        } catch (e) {
          console.error(`[自动导航] 未在 iframe 中找到目标: ${state.targetName}`, e);
        }
        // 执行失败, 清理状态
        clearTaskState();
      }, TIMEOUT); // 延时 1.5 秒，确保 iframe 的 DOM 已经完全渲染
      return;
    }

    // 可选：为了防止外层页面做多余的事，可以给外层页面加个空判断
    if (state.step === 2 && currentHref.includes(PAGE_MY_SPACE_URL_OUTER)) {
      console.log(`[自动导航-外层] 到达 MySpace 外层页面，正在等待 iframe 内部的脚本接管跳转...`);
      return; // 外层页面什么都不做，安静等待 iframe 里的脚本去提取链接并跳走
    }

    // Step 3: 到达最终目标页面，执行次级目标(ClassA/ClassB)并结束任务
    if (state.step === 3) {
      console.log(`[自动导航] 到达最终目标！执行次级操作: ${state.subTarget}`);

      const target = state.subTarget;
      clearTaskState();

      setTimeout(() => {
        // history.pushState({ page: 'current' }, "", window.location.href);
        document.querySelector(`a[title="${target}"]`).click();
      }, TIMEOUT);

      return;
    }
  }

  // ==========================================
  // 在国科大在线渲染返回按钮
  // (由于没有 tailwind css, 就不做界面了)
  // ==========================================
  function renderBackButton() {
    // 如果不是 A 页面，不渲染悬浮窗
    let kind = null;
    if (window.location.href.includes(PAGE_MY_COURSE_URL)) kind = "course";
    if (window.location.href.includes(PAGE_MOOC_COURSE_URL)) kind = "course";
    if (!kind) return;
    // 避免重复注入
    if (document.getElementById('nav-helper-container')) return;

    // 创建容器 (移除原来的 group class)
    const container = document.createElement('div');
    container.id = 'nav-helper-container';
    container.style.position = "fixed";
    container.style.right = 0;
    container.style.top = "60px";
    container.style.zIndex = 50;
    container.className = 'fixed right-0 top-0 -translate-y-1/2 z-50 flex';

    // 悬浮触发按钮
    const triggerBtn = document.createElement('div');
    triggerBtn.className = 'bg-blue-600 text-white p-3 rounded-l-lg shadow-lg cursor-pointer flex items-center justify-center font-bold writing-vertical-rl relative z-10';
    triggerBtn.style.backgroundColor = "rgba(49, 130, 206, .8)";
    triggerBtn.style.padding = "1rem";
    triggerBtn.style.borderRadius = "0.5rem";
    triggerBtn.style.boxShadow = "0 2px 30px rgba(0, 0, 0, .08)";
    triggerBtn.style.cursor = "pointer";
    triggerBtn.style.fontWeight = 700;
    triggerBtn.style.color = "white";
    triggerBtn.style.fontSize = "1rem";
    triggerBtn.innerText = '返回课程列表';

    triggerBtn.onclick = () => { window.location.href = PAGE_MY_SPACE_URL; };

    container.appendChild(triggerBtn);
    document.body.appendChild(container);
  }

  // ==========================================
  // UI 渲染逻辑 (在 Sep 等页面运行)
  // ==========================================
  function renderUI() {
    // 如果不是 A 页面，不渲染悬浮窗
    let kind = null;
    if (window.location.hostname.includes(PAGE_SEP_DOMAIN)) kind = "sep";
    // if (window.location.href.includes(PAGE_MY_COURSE_URL)) kind = "course";
    // if (window.location.href.includes(PAGE_MOOC_COURSE_URL)) kind = "course";
    if (!kind) return;

    // 避免重复注入
    if (document.getElementById('nav-helper-container')) return;

    // 创建容器 (移除原来的 group class)
    const container = document.createElement('div');
    container.id = 'nav-helper-container';
    container.className = 'fixed right-0 top-0 -translate-y-1/2 z-50 flex';

    // 悬浮触发按钮
    const triggerBtn = document.createElement('div');
    triggerBtn.className = 'bg-blue-600 text-white p-3 rounded-l-lg shadow-lg cursor-pointer flex items-center justify-center font-bold writing-vertical-rl relative z-10';
    triggerBtn.innerText = '快速跳转';

    // 菜单面板
    // 移除 group-hover 相关的类，改用 opacity, pointer-events 和 translate 控制显示与隐藏
    const panel = document.createElement('div');
    panel.className = 'flex flex-col bg-white border border-gray-200 shadow-2xl w-96 rounded-l-lg overflow-hidden transition-all duration-300 transform absolute right-full top-1/2 -translate-y-1 opacity-0 pointer-events-none translate-x-full';

    // === 新增：JS 事件监听器控制显隐 ===
    container.addEventListener('mouseenter', () => {
      panel.classList.remove('opacity-0', 'pointer-events-none', 'translate-x-full');
      panel.classList.add('opacity-100', 'pointer-events-auto', '-translate-x-full');
    });

    container.addEventListener('mouseleave', () => {
      panel.classList.remove('opacity-100', 'pointer-events-auto', '-translate-x-full');
      panel.classList.add('opacity-0', 'pointer-events-none', 'translate-x-full');
    });
    // ==================================

    const listContainer = document.createElement('div');
    listContainer.className = 'max-h-96 overflow-y-auto p-2';

    // 渲染列表的函数 (这部分逻辑保持不变)
    const renderList = (isEditMode = false) => {
      listContainer.innerHTML = '';
      const targets = getTargets();

      targets.forEach((targetName, index) => {
        const row = document.createElement('div');
        row.className = 'flex justify-between items-center py-2 px-3 border-b border-gray-100 hover:bg-blue-50 transition-colors';

        // 左侧文本
        const textSpan = document.createElement('span');
        textSpan.className = 'text-sm font-medium text-gray-700 cursor-pointer flex-1 truncate select-none hover:text-blue-600';
        textSpan.title = `Mooc > MySpace > ${targetName} > ${SUB_CLASS[0]}`;
        textSpan.innerText = targetName;
        if (!isEditMode) {
          textSpan.onclick = (e) => startNavigation(targetName, SUB_CLASS[0], e.ctrlKey, kind);
        }

        row.appendChild(textSpan);

        // 右侧按钮/编辑操作区
        const actionContainer = document.createElement('div');
        actionContainer.className = 'flex gap-2 ml-2';

        if (isEditMode) {
          const delBtn = document.createElement('button');
          delBtn.className = 'text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded shadow-sm';
          delBtn.innerText = '删除';
          delBtn.onclick = () => {
            const newTargets = [...targets];
            newTargets.splice(index, 1);
            saveTargets(newTargets);
            renderList(true);
          };
          actionContainer.appendChild(delBtn);
        } else {
          SUB_CLASS.forEach((name) => {
            const btnA = document.createElement('button');
            btnA.className = 'text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-500 hover:text-white px-2 py-1 rounded shadow-sm transition-colors';
            btnA.innerText = name;
            btnA.onclick = (e) => {
              e.stopPropagation();
              startNavigation(targetName, name, e.ctrlKey, kind);
            };
            actionContainer.appendChild(btnA);
          });
        }

        row.appendChild(actionContainer);
        listContainer.appendChild(row);
      });
    };

    // 底部工具栏
    const footer = document.createElement('div');
    footer.className = 'bg-gray-50 p-3 border-t border-gray-200 flex justify-between items-center gap-x-4';

    const addBtn = document.createElement('button');
    addBtn.className = 'text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded shadow';
    addBtn.innerText = '新建目标';
    addBtn.onclick = () => {
      const newName = prompt('请输入课程的名称 (应精确等于国科大在线中显示的名称):');
      if (newName && newName.trim()) {
        const current = getTargets();
        saveTargets([...current, newName.trim()]);
        renderList(false);
      }
    };

    const toggleEditBtn = document.createElement('button');
    toggleEditBtn.className = 'text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded shadow';
    toggleEditBtn.innerText = '编辑列表';
    let editMode = false;
    toggleEditBtn.onclick = () => {
      editMode = !editMode;
      toggleEditBtn.innerText = editMode ? '退出编辑' : '编辑列表';
      toggleEditBtn.className = editMode
        ? 'text-sm bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded shadow'
        : 'text-sm bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1.5 rounded shadow';
      renderList(editMode);
    };

    footer.appendChild(addBtn);
    footer.appendChild(toggleEditBtn);

    // 组装并注入到页面
    panel.appendChild(listContainer);
    panel.appendChild(footer);
    container.appendChild(panel);
    container.appendChild(triggerBtn);
    document.body.appendChild(container);

    // 初始化渲染列表
    renderList(false);
  }

  // ==========================================
  // 执行入口
  // ==========================================
  checkAndExecuteNavigation(); // 所有匹配到的页面都会执行此检测
  renderUI(); // 仅在 A 页面生效
  renderBackButton();

})();
