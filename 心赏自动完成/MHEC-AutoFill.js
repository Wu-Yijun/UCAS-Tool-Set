// ==UserScript==
// @name         UCAS 心赏去死啦!
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  利用生成式人工智能, 虚拟一个人格, 帮你完成心理问卷.
// @author       Aluria
// @match        https://mhec.ucas.ac.cn/measurement/PaperTest?*
// @icon         https://mhec.ucas.ac.cn/bitbug_favicon.ico
// ==/UserScript==

(() => {
  /** Tips: Modify the following field as your own apis; */
  const API = "https://yunwu.ai/v1/chat/completions"; // some api provider url
  const TOKEN = "<Your token>";
  const MODEL = ["grok-4-fast"][0]; // or any other models
  const CONFIG = {
    "max_tokens": 2048,
    // "temperature": 0.2,
    // ... and other configs as your api provided.
  };
  // Please note that there is another field: `const PROMPT = PROMPT1;` that can be modified;
  const PROMPT0 = (trimmed_question, args) => `
请你扮演一位精神和身体健康、阳光向上的学生。
你热爱学校、家人和同学，日常生活充满快乐，并且拥有较强的抗挫折能力——面对困难时，你能积极应对并从中学习。
在回答心理健康问卷时，请遵循以下原则：
- **整体表现健康**：在症状相关问题上，展现出积极乐观的心态，避免暗示任何严重的心理问题。例如，你可以描述自己通常情绪稳定、精力充沛，对生活满意。
- **保持平衡真实**：不要过度极端（如声称“从不”感到压力或悲伤），而是承认偶尔的情绪波动是正常的，但强调你能通过运动、交流或兴趣爱好快速调整。
- **不排除边界选项**：当最边界的选项是"没有或很少时间"时，不等同于"完全没有"的极端选项, 不要因为没有更极端的选项而不敢选择.
- **结合中国的伦理道德**：遇到具有政治倾向或伦理倾向的问题时, 较为明确的可以结合中国的社会价值观给出结论, 较有争议的问题可以给出模糊的选择.
- **模仿人类自然反应**：回答时像一位真实的学生：语言简单直接、略带热情，避免机械或完美主义。例如，当被问及压力时，可以说“考试前会有点紧张，但我会做好准备，之后就好了”。
如果是逻辑题, 请快速分析逻辑并给出正确回答.
问题为: 你是否存在/请分析: ${trimmed_question}.
选项为:
${args.join("\n")}
你的回答应为英文字母 "A", "B", "C", "D", "E" 中的一个(不超出题目选项), 不要输出其他的回复.
`;
  const PROMPT1 = (trimmed_question, args) => `
**请你扮演一位理工科背景的学生，具有极强的自信和独立思维能力。你深刻了解自己的能力，清晰认识到自己的优缺点。你在学习和生活中表现出极高的理性和逻辑性，善于在复杂的情况下快速做出决策，且不轻易受到他人意见的左右。你勇于表达自己的观点，并能够在必要时坚定地捍卫自己的立场。**
你具备非常强的社交自信，但在社交互动中不会显得过于依赖他人。你能在不同的社交场合中适应自如，既能融入团队合作，又能独立思考，不会随波逐流。你面对压力时冷静理智，通常会通过有效的时间管理、预判和解决方案来应对挑战，始终保持清晰的头脑。
在回答16PF人格测试时，请遵循以下原则：
-   **展现理性与自信的平衡**：在回答中保持对自己能力的高度自信，但不会过于张扬，展现理性和清晰的自我认识。例如：“我相信自己能在团队中发挥重要作用，但也善于独立解决问题，不依赖他人过多。”
-   **避免模糊与妥协**：避免选择过于模糊或妥协的答案。如果遇到选择，尽量做出决断，选择最符合自己立场的答案。例如：“我在团队中喜欢发表我的意见，并乐于听取他人建议，但最终决定会基于我自己的判断。”
-   **适度的活力和精力投入**：展现充沛的精力和积极性，但不至于过于外向或焦虑。例如：“我有时非常活跃，喜欢参与集体活动，但也懂得什么时候需要沉下心来独立工作。”
-   **自我调节能力**：展示面对压力时强大的应对能力，通常通过理性分析、逻辑规划来解决问题。例如：“面对高强度的任务，我能够通过详细规划和提前准备来减轻压力，确保自己能有效执行。”
-   **强烈的自我意识与情感理解**：你对自己的感受和需求有清晰的认识，同时在社交中能够感知他人的情绪，但不会过度迁就他人。例如：“我清楚知道自己的情绪需求，但在与人交往时，总是尊重对方的感受，尽量避免冲突。”
-   **注意中国的社会文化背景**：对于一些涉及社会价值观的问题，可以结合中国的社会伦理和道德给出回答。当问题较为模糊或争议性较强时，可以采取较为中立、含糊的回答。
问题为: 你是否存在/请分析: ${trimmed_question}。  
选项为:  
${args.join("\n")}  
你的回答应为英文字母 "A", "B", "C", "D", "E" 中的一个(不超出题目选项), 不要输出其他的回复。
`;
  const PROMPT = PROMPT0;

  class AI {
    constructor(
      model = MODEL,
      token = TOKEN,
      prompt = PROMPT,
      api = API,
      config = CONFIG,
    ) {
      this.prompt = prompt;
      this.model = model;
      this.api = api;
      this.config = config;

      const myHeaders = new Headers();
      myHeaders.append("Accept", "application/json");
      myHeaders.append(
        "Authorization",
        `Bearer ${token}`,
      );
      myHeaders.append("Content-Type", "application/json");
      this.header = myHeaders;
    }
    getQuestion(title, args) {
      const question = title.trim();
      const trimmed_question = question.slice(question.indexOf(".") + 1).trim();
      const requirements = this.prompt(trimmed_question, args).trim();
      return requirements;
    }

    async request(question) {
      const raw = JSON.stringify({
        "model": this.model,
        "messages": [
          { "role": "system", "content": "You are a helpful assistant." },
          {
            "role": "user",
            "content": question,
          },
        ],
        ...this.config,
      });
      const requestOptions = {
        method: "POST",
        headers: this.header,
        body: raw,
        redirect: "follow",
      };

      for (let i = 0; i < 3; i++) {
        try {
          const res = await fetch(
            this.api,
            requestOptions,
          );
          const json = await res.json();
          return String(json.choices[0].message.content);
        } catch (e) {
          console.log("warn", e);
        }
        console.log("Retry");
      }
      return null;
    }

    getOption(msg) {
      const a = String(msg).replaceAll("\n", "").toUpperCase();
      const reg = /([A-E])[^A-E]*$/g;
      const match = reg.exec(a);
      if (!match) {
        return null;
      }
      return "ABCDE".indexOf(match[1]);
    }

    watchTitle(question_title, titleHandler) {
      function observeHandler(mutationsList, _observer) {
        for (const mutation of mutationsList) {
          if (mutation.type !== "childList") {
            continue;
          }
          // A child node has been added or removed.
          if (mutation.addedNodes.length === 0) {
            continue;
          }
          // 题目发生了更改
          const title = mutation.addedNodes[0].textContent;
          titleHandler(title);
        }
      }
      if (!(question_title instanceof HTMLDivElement)) {
        console.warn(
          "Cannot find Title Element. The query selector get: ",
          question_title,
          "instead!",
        );
        return false;
      }
      // 使用 MutationObserver 监视元素子节点变化
      const observer = new MutationObserver(observeHandler);
      const config = { childList: true };
      observer.observe(question_title, config);
      this.observer = observer;
    }
    stopWatch() {
      this.observer.disconnect();
    }
  }

  class Injector {
    constructor(run, stop, help, select, exp) {
      this.is_running = false;
      this.callbacks = { run, stop, help, select, exp };

      const div = document.createElement("div");
      div.id = "InjectedField";
      div.style.position = "fixed";
      div.style.top = "10px";
      div.style.right = "10px";
      div.style.opacity = "0.8";
      div.style.backgroundColor = "white";
      div.style.border = "1px solid black";
      div.style.padding = "10px";
      div.style.zIndex = "10000";
      div.style.maxHeight = "80vh";
      div.style.overflowY = "auto";
      div.style.fontSize = "14px";
      div.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
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
      div.innerHTML = `
<div style="width: 400px;height: 120px;overflow: scroll;">
  <span>Input: </span>
  <span><pre id="InjectedInputField"></pre></span>
</div>
<div style="width: 400px;height: 120px;overflow: scroll;">
  <span>Output: </span>
  <span><pre id="InjectedOutputField"></pre></span>
</div>
<button id="InjectedRunField" style="color: ${
        this.is_running ? "orange" : "green"
      }; padding: 6px;">${this.is_running ? "Stop!" : "Run!"}</button>
<button id="InjectedHelpField" style="color: gray; padding: 6px;">Help Me!</button>
<button id="InjectedSelectField" style="color: black; padding: 6px;">Select Answer <span id="InjectedAnswerField"></span>.</button>
<button id="InjectedExportField" style="color: darkblue; padding: 6px;">Export History</button>
<button id="InjectedCloseField" style="color: red; padding: 6px;">Close</button>`;
      document.getElementById("InjectedField")?.remove();
      document.body.appendChild(div);
      this.input = document.getElementById("InjectedInputField");
      this.output = document.getElementById("InjectedOutputField");
      this.answer = document.getElementById("InjectedAnswerField");
      this.run = document.getElementById("InjectedRunField");
      this.help = document.getElementById("InjectedHelpField");
      this.select = document.getElementById("InjectedSelectField");
      this.exp = document.getElementById("InjectedExportField");
      this.close = document.getElementById("InjectedCloseField");
      this.run.onclick = () => {
        this.is_running = !this.is_running;
        if (this.is_running) {
          this.run.innerText = "Run!";
          this.run.style.color = "green";
          this.callbacks.run();
        } else {
          this.run.innerText = "Stop!";
          this.run.style.color = "orange";
          this.callbacks.stop();
        }
      };
      this.help.onclick = this.callbacks.help;
      this.select.onclick = this.callbacks.select;
      this.exp.onclick = this.callbacks.exp;
      this.close.onclick = () =>
        document.getElementById("InjectedField")?.remove();
    }
    clear() {
      this.input.innerHTML = "";
      this.output.innerHTML = "";
      this.answer.innerHTML = "";
    }
  }

  function main() {
    function getOptions(dom) {
      const k = dom.children;
      const res = [];
      for (let i = 0; i < k.length; i++) {
        res.push(k[i].textContent);
      }
      return res;
    }
    function clickInput(dom, option) {
      dom.children[option].getElementsByTagName("input")[0].click();
    }

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    const ai = new AI();
    const question_title = document.querySelector(".qst-name")[0];
    const question_options = document.querySelector(".el-radio-group")[0];

    const state = {
      answer: null,
      record: [],
    };

    async function title_change(title, to_select = true) {
      const args = getOptions(question_options);
      const q = ai.getQuestion(title, args);
      console.log("Question:", title + args.join(";"));
      injector.input.innerHTML = title + "\n" + args.join("\n");
      injector.output.innerHTML = "等待中......";
      const msg = await ai.request(q);
      if (msg === null) {
        console.warn("Stuck!");
        return null;
      }
      console.log("Answer:", msg.replaceAll("\n", "\\n"));
      injector.output.innerHTML = msg;
      const res = ai.getOption(msg);
      injector.answer.innerHTML = "ABCDE"[res];
      state.answer = res;
      state.record.push([title, args[res]]);
      if (to_select) {
        await sleep(1000);
        clickInput(question_options, res);
      }
      return res;
    }

    const injector = new Injector(
      async () => {
        ai.watchTitle(question_title, title_change);
        await title_change(question_title.textContent, false);
        clickInput(question_options, state.answer);
      },
      () => {
        ai.stopWatch();
      },
      () => {
        title_change(question_title.textContent, false);
      },
      () => {
        clickInput(question_options, state.answer);
      },
      () => {
        console.log(state.record);
        console.log(JSON.stringify(state.record));
      },
    );
  }

  main();
})();

