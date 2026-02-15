"use strict";(()=>{function $(t,e){let n;return(...o)=>{n!==void 0&&window.clearTimeout(n),n=window.setTimeout(()=>t(...o),e)}}function z(t,e={}){let n=e.root??document,o=e.timeoutMs??15e3,s=n.querySelector(t);return s?Promise.resolve(s):new Promise((a,r)=>{let i=new MutationObserver(()=>{let c=n.querySelector(t);c&&(i.disconnect(),a(c))});i.observe(n,{childList:!0,subtree:!0}),window.setTimeout(()=>{i.disconnect(),r(new Error(`Timed out waiting for ${t}`))},o)})}var ae=/[\u200B-\u200D\uFEFF]/g;function E(t){return t.replace(ae,"").replace(/\s+/g," ").trim()}function M(t){let e=E(t);if(!e)return"unknown";let n=e.match(/[\u0400-\u04FF]/g)?.length??0,o=e.match(/[A-Za-z]/g)?.length??0;return n>0&&o>0?"mixed":n>0?"ru":o>0?"en":"unknown"}function q(t){let e=[],n=document.createTreeWalker(t,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT),o=n.currentNode;for(;o;){if(o.nodeType===Node.TEXT_NODE)e.push(o.textContent??"");else if(o instanceof HTMLElement){let s=o.tagName.toLowerCase();if(s==="br"&&e.push(`
`),s==="img"&&e.push(o.getAttribute("alt")??""),s==="a"){let a=o.textContent??o.getAttribute("href")??"";e.push(a)}}o=n.nextNode()}return E(e.join(" "))}function C(t){let e=E(t),n=e.match(/[A-Za-z\u0400-\u04FF]/g)?.length??0,o=e.match(/[A-Z\u0410-\u042F]/g)?.length??0,s=e.match(/[.!?…,:;]/g)?.length??0;return{capsRatio:n===0?0:o/n,punctuationCount:s,length:e.length}}var N={autoAnalyzeIncoming:!1,autoAnalyzeOutgoing:!0,interfaceLanguage:"en",detectionSensitivity:"medium",categories:{insults:!0,threats:!0,harassment:!0,profanity:!0},minSeverity:0,autoSuggestThreshold:80,theme:"auto",badgePosition:"auto",showUnderline:!0,animations:!0,anonymousMode:!1,enableWhatsApp:!0,enableTelegram:!0,enableVK:!0,enableDiscord:!0,backendUrl:"http://127.0.0.1:8000",backendApiKey:"",contextScoring:!1,onboardingCompleted:!1},K={analyzedCount:0,conflictsPrevented:0,sumSeverityBefore:0,sumSeverityAfter:0,replacementCount:0},Y=100;function D(){return{...N,categories:{...N.categories}}}async function L(){return chrome.storage?.sync?new Promise(t=>{chrome.storage.sync.get(D(),e=>{let n={...D(),...e,categories:{...N.categories,...e.categories}};t(n)})}):D()}async function ce(){return chrome.storage?.local?new Promise(t=>{chrome.storage.local.get(["analysisHistory"],e=>{t(e.analysisHistory??[])})}):[]}async function le(t){if(chrome.storage?.local)return new Promise(e=>{chrome.storage.local.set({analysisHistory:t},()=>e())})}async function V(){return chrome.storage?.local?new Promise(t=>{chrome.storage.local.get(["analysisStats"],e=>{t({...K,...e.analysisStats})})}):{...K}}async function X(t){if(chrome.storage?.local)return new Promise(e=>{chrome.storage.local.set({analysisStats:t},()=>e())})}async function O(t,e){let n=await V(),o={...n,analyzedCount:n.analyzedCount+1,sumSeverityBefore:n.sumSeverityBefore+t.severity};if(await X(o),e)return;let s=await ce();s.push(t),s.length>Y&&s.splice(0,s.length-Y),await le(s)}async function H(t,e){let n=await V(),o=t>e?n.conflictsPrevented+1:n.conflictsPrevented,s={...n,conflictsPrevented:o,sumSeverityAfter:n.sumSeverityAfter+e,replacementCount:n.replacementCount+1};await X(s)}var G="ct-ui-style",Z=100,I=44,te=220,de=80;function _(t){return new Promise((e,n)=>{if(!chrome.runtime?.sendMessage){n(new Error("runtime.sendMessage is unavailable"));return}try{chrome.runtime.sendMessage(t,o=>{let s=chrome.runtime.lastError;if(s){n(new Error(s.message));return}e(o)})}catch(o){n(o instanceof Error?o:new Error(String(o)))}})}function ne(t,e){ue();let n=document.createElement("div");n.className="ct-root";let o=document.createElement("button");o.className="ct-badge",o.type="button",o.textContent="0/100";let s=document.createElement("div");s.className="ct-popup ct-hidden";let a=document.createElement("div");a.className="ct-sidebar",n.appendChild(o),n.appendChild(s),n.appendChild(a),document.body.appendChild(n);let r={severity:0,text:"",emotions:[],needs:[],alternatives:ee("")},i=e.minSeverity??0,c=e.autoSuggestThreshold??de,d=e.showUnderline??!0,g=e.animations??!0,x="",w="",h=[];o.addEventListener("click",()=>{s.classList.toggle("ct-hidden"),J(s,r,t,a,h,i,c,e.onReplace)});let v=()=>u(),T=()=>u();window.addEventListener("resize",v),window.addEventListener("scroll",T,!0);function S(l){r={severity:l.severity,text:l.text,emotions:l.emotions??[],needs:l.needs??[],alternatives:l.alternatives??ee(l.text)},l.text&&h.at(-1)?.text!==l.text&&(h.push({text:l.text,severity:l.severity,emotions:r.emotions,needs:r.needs,timestamp:Date.now()}),h.length>Z&&h.splice(0,h.length-Z));let y=`${l.text}:${l.severity}`;l.severity>=Math.max(i,c)&&l.text.trim().length>0&&y!==w&&y!==x&&(s.classList.remove("ct-hidden"),x=y),j(o,l.severity,i,g),Q(t,l.severity,i,d),J(s,r,t,a,h,i,c,e.onReplace,b=>{w=b}),u()}function u(){let l=t.getBoundingClientRect();he(o,l,e.badgePlacement??"right"),be(s,l,e.badgePlacement??"right"),W(a)}function p(){window.removeEventListener("resize",v),window.removeEventListener("scroll",T,!0),n.remove()}function m(l){typeof l.minSeverity=="number"&&(i=l.minSeverity),typeof l.showUnderline=="boolean"&&(d=l.showUnderline),typeof l.autoSuggestThreshold=="number"&&(c=l.autoSuggestThreshold),typeof l.animations=="boolean"&&(g=l.animations),l.badgePlacement&&(e.badgePlacement=l.badgePlacement),j(o,r.severity,i,g),Q(t,r.severity,i,d),u()}return{update:S,updateSettings:m,destroy:p}}function ue(){if(document.getElementById(G))return;let t=document.createElement("style");t.id=G,t.textContent=`
.ct-root {
  position: fixed;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  z-index: 2147483646;
  pointer-events: none;
  font-family: "Segoe UI", Arial, sans-serif;
}

.ct-badge {
  position: fixed;
  pointer-events: auto;
  border: none;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 600;
  color: #101010;
  background: #c7f2c2;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
  transition: transform 150ms ease, box-shadow 150ms ease, filter 150ms ease;
}

.ct-badge:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
  filter: saturate(1.05);
}

.ct-badge:focus-visible {
  outline: 2px solid #1c1c1c;
  outline-offset: 2px;
}

.ct-badge.ct-mid {
  background: #ffd9a1;
}

.ct-badge.ct-high {
  background: #ffb0a6;
}

.ct-pulse {
  animation: ct-pulse 1.4s ease-in-out infinite;
}

@keyframes ct-pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.ct-popup {
  position: fixed;
  width: 360px;
  max-width: min(92vw, 380px);
  max-height: 60vh;
  background: #f6f3eb;
  color: #171717;
  border-radius: 14px;
  padding: 14px 16px;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.2);
  pointer-events: auto;
  overflow: auto;
  transition: opacity 200ms ease, transform 200ms ease;
}

.ct-popup.ct-hidden {
  opacity: 0;
  transform: translateY(8px);
  pointer-events: none;
}

.ct-popup h4 {
  margin: 0 0 8px;
  font-size: 14px;
  letter-spacing: 0.2px;
}

.ct-popup .ct-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  margin: 4px 0;
  gap: 10px;
}

.ct-popup .ct-actions {
  margin-top: 10px;
  display: grid;
  gap: 6px;
}

.ct-popup .ct-suggestions {
  margin-top: 10px;
  display: grid;
  gap: 8px;
}

.ct-popup .ct-suggestion-item {
  background: #ffffff;
  border: 1px solid #ddd2c1;
  border-radius: 10px;
  padding: 8px 10px;
  font-size: 12px;
  line-height: 1.35;
  display: grid;
  gap: 6px;
}

.ct-popup .ct-suggestion-title {
  font-weight: 600;
  display: flex;
  gap: 6px;
  align-items: center;
}

.ct-popup .ct-suggestion-text {
  white-space: pre-wrap;
  word-break: break-word;
}

.ct-popup .ct-suggestion-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.ct-button {
  border: 1px solid #1c1c1c;
  background: #ffffff;
  color: #1c1c1c;
  border-radius: 10px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
  transition: transform 120ms ease, box-shadow 120ms ease;
}

.ct-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}

.ct-button:focus-visible {
  outline: 2px solid #1c1c1c;
  outline-offset: 2px;
}

.ct-button.ct-primary {
  background: #1c1c1c;
  color: #ffffff;
}

.ct-button.ct-secondary {
  border-color: #555555;
  color: #333333;
}

.ct-sidebar {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 420px;
  max-width: calc(100vw - 32px);
  max-height: calc(100vh - 32px);
  overflow: auto;
  z-index: 2147483646;
  background: #f9f7f2;
  color: #1c1c1c;
  border-radius: 16px;
  border: 2px solid #1c1c1c;
  padding: 16px 16px 18px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.2);
  transform: translateX(110%);
  transition: transform 220ms ease;
  pointer-events: auto;
}

.ct-sidebar.ct-visible {
  transform: translateX(0%);
}

.ct-sidebar h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.ct-sidebar .ct-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.ct-sidebar .ct-tab {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid #1c1c1c;
  background: #ffffff;
}

.ct-sidebar .ct-metrics {
  background: #ffffff;
  border: 1px solid #1c1c1c;
  border-radius: 12px;
  padding: 10px 12px;
  font-size: 12px;
  line-height: 1.4;
  margin-bottom: 12px;
}

.ct-context {
  margin: 12px 0;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #1c1c1c;
  padding: 10px 12px;
}

.ct-context-title {
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.ct-context-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  padding: 8px 0;
  border-bottom: 1px solid #e8e1d3;
  font-size: 12px;
}

.ct-context-row:last-child {
  border-bottom: none;
}

.ct-context-text {
  color: #1c1c1c;
}

.ct-context-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #5a5247;
  white-space: nowrap;
}

.ct-context-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 18px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  background: #d7efd2;
  border: 1px solid #1c1c1c;
}

.ct-context-badge.ct-mid {
  background: #ffe0b6;
}

.ct-context-badge.ct-high {
  background: #ffc3bc;
}

.ct-history {
  margin: 12px 0;
  background: #161616;
  border-radius: 12px;
  padding: 8px;
}

.ct-history-viewport {
  position: relative;
  overflow-y: auto;
  max-height: 220px;
}

.ct-history-spacer {
  width: 100%;
}

.ct-history-items {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
}

.ct-history-row {
  display: grid;
  grid-template-columns: 64px 1fr 64px;
  gap: 8px;
  padding: 6px 8px;
  font-size: 11px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.ct-history-score {
  font-weight: 600;
}

.ct-history-text {
  color: #d7d1c4;
}

.ct-history-time {
  text-align: right;
  color: #a59f92;
}

.ct-underline {
  text-decoration-line: underline;
  text-decoration-style: wavy;
  text-decoration-color: #ff5c5c;
  text-decoration-thickness: 2px;
}
`,document.head.appendChild(t)}function j(t,e,n,o){let s=e>=n;t.style.display=s?"inline-flex":"none",t.textContent=`${e}/100`,t.classList.remove("ct-mid","ct-high","ct-pulse"),e>=70?(t.classList.add("ct-high"),o&&t.classList.add("ct-pulse")):e>=40&&t.classList.add("ct-mid")}function Q(t,e,n,o){if(t instanceof HTMLElement){if(!o||e<Math.max(50,n)){t.classList.remove("ct-underline");return}e>=50?t.classList.add("ct-underline"):t.classList.remove("ct-underline")}}function J(t,e,n,o,s,a,r,i,c){if(t.classList.contains("ct-hidden"))return;if(e.severity<a){t.classList.add("ct-hidden");return}let d=ve(e.severity),g=e.alternatives,x=e.emotions[0]??ye(e.severity),w=e.needs[0]??xe(e.severity),h=!0,v=B(g.empathic,90),T=B(g.rational,90),S=B(g.socratic,90);t.innerHTML=`
    <h4>${d} (${e.severity}/100)</h4>
    <div class="ct-row"><span>Emotion</span><span>${x}</span></div>
    <div class="ct-row"><span>Need</span><span>${w}</span></div>
    ${h?`
      <div class="ct-suggestions">
        <div class="ct-suggestion-item" data-style="empathic">
          <div class="ct-suggestion-title">\u{1F91D} Empathic</div>
          <div class="ct-suggestion-text" data-full="${f(g.empathic)}" data-preview="${f(v)}">${f(v)}</div>
          <div class="ct-suggestion-actions">
            <button class="ct-button" data-action="preview">Preview full</button>
            <button class="ct-button ct-primary" data-action="replace" data-value="${f(g.empathic)}">Use this</button>
          </div>
        </div>
        <div class="ct-suggestion-item" data-style="rational">
          <div class="ct-suggestion-title">\u{1F9E0} Rational</div>
          <div class="ct-suggestion-text" data-full="${f(g.rational)}" data-preview="${f(T)}">${f(T)}</div>
          <div class="ct-suggestion-actions">
            <button class="ct-button" data-action="preview">Preview full</button>
            <button class="ct-button ct-primary" data-action="replace" data-value="${f(g.rational)}">Use this</button>
          </div>
        </div>
        <div class="ct-suggestion-item" data-style="socratic">
          <div class="ct-suggestion-title">\u2753 Socratic</div>
          <div class="ct-suggestion-text" data-full="${f(g.socratic)}" data-preview="${f(S)}">${f(S)}</div>
          <div class="ct-suggestion-actions">
            <button class="ct-button" data-action="preview">Preview full</button>
            <button class="ct-button ct-primary" data-action="replace" data-value="${f(g.socratic)}">Use this</button>
          </div>
        </div>
      </div>
    `:""}
    <div class="ct-actions">
      <button class="ct-button ct-secondary" data-action="details">More details</button>
      <button class="ct-button ct-secondary" data-action="dismiss">Dismiss</button>
    </div>
  `,t.querySelectorAll("button").forEach(u=>{u.addEventListener("click",()=>{let p=u.dataset.action;if(p==="replace"){let m=u.dataset.value??"";fe(n,m),me(m,e.severity,i),t.classList.add("ct-hidden")}if(p==="preview"){let l=u.closest(".ct-suggestion-item")?.querySelector(".ct-suggestion-text");if(!l)return;let y=l.dataset.expanded==="true",A=l.dataset.full??"",b=l.dataset.preview??"";l.textContent=y?b:A,l.dataset.expanded=y?"false":"true",u.textContent=y?"Preview full":"Collapse"}p==="details"&&(o.classList.add("ct-visible"),ge(o,e,s),W(o)),p==="dismiss"&&(t.classList.add("ct-hidden"),c?.(`${e.text}:${e.severity}`))})})}async function me(t,e,n){if(n){n(t,e);return}if(chrome.runtime?.sendMessage)try{let o=await _({type:"quickCheck",text:t}),s=typeof o?.severity=="number"?o.severity:e;try{await _({type:"recordReplacement",beforeSeverity:e,afterSeverity:s})}catch{await H(e,s)}}catch{if(chrome.runtime?.sendMessage)try{await _({type:"recordReplacement",beforeSeverity:e,afterSeverity:e});return}catch{await H(e,e);return}await H(e,e)}}function ge(t,e,n){let o=C(e.text),s=e.emotions.length?e.emotions.join(", "):"-",a=e.needs.length?e.needs.join(", "):"-",r=n.slice(-3).reverse();t.innerHTML=`
    <h3>Conflict Translator</h3>
    <div class="ct-tabs">
      <span class="ct-tab">Analysis</span>
      <span class="ct-tab">History</span>
      <span class="ct-tab">Settings</span>
    </div>
    <div class="ct-metrics">
      <div><strong>Severity:</strong> ${e.severity}/100</div>
      <div><strong>Emotions:</strong> ${s}</div>
      <div><strong>Needs:</strong> ${a}</div>
      <div><strong>Language:</strong> ${M(e.text)}</div>
      <div><strong>Caps ratio:</strong> ${o.capsRatio.toFixed(2)}</div>
      <div><strong>Punctuation:</strong> ${o.punctuationCount}</div>
      <div><strong>Length:</strong> ${o.length}</div>
    </div>
    <div class="ct-context">
      <div class="ct-context-title">Conversation Context</div>
      ${r.length===0?'<div class="ct-context-text">No recent messages.</div>':r.map(d=>{let g=d.severity>=70?"ct-high":d.severity>=40?"ct-mid":"",x=f(d.text).slice(0,80),w=new Date(d.timestamp).toLocaleTimeString();return`
          <div class="ct-context-row">
            <div class="ct-context-text">${x}</div>
            <div class="ct-context-meta">
              <span class="ct-context-badge ${g}">${d.severity}</span>
              <span>${w}</span>
            </div>
          </div>
        `}).join("")}
    </div>
    <div class="ct-history">
      <div class="ct-history-viewport">
        <div class="ct-history-spacer" style="height: ${n.length*I}px"></div>
        <div class="ct-history-items"></div>
      </div>
    </div>
    <button class="ct-button ct-secondary" data-action="close">Close</button>
  `;let i=t.querySelector(".ct-history-viewport");if(i){i.style.maxHeight=`${te}px`;let d=()=>pe(i,n);d(),i.addEventListener("scroll",d,{passive:!0})}let c=t.querySelector("[data-action=close]");c&&c.addEventListener("click",()=>{t.classList.remove("ct-visible"),W(t)})}function pe(t,e){let n=t.querySelector(".ct-history-items");if(!n)return;let o=t.scrollTop,s=Math.max(0,Math.floor(o/I)-2),a=Math.ceil(te/I)+4,r=Math.min(e.length,s+a),i=e.slice(s,r);n.style.transform=`translateY(${s*I}px)`,n.innerHTML=i.map(c=>{let d=new Date(c.timestamp).toLocaleTimeString(),g=f(c.text).slice(0,60);return`
      <div class="ct-history-row">
        <span class="ct-history-score">${c.severity}/100</span>
        <span class="ct-history-text">${g}</span>
        <span class="ct-history-time">${d}</span>
      </div>
    `}).join("")}function fe(t,e){let n=i=>{try{i.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"insertText",data:e}))}catch{i.dispatchEvent(new Event("input",{bubbles:!0}))}i.dispatchEvent(new Event("change",{bubbles:!0}))},o=i=>{try{if(i instanceof HTMLElement&&i.isContentEditable){let c=document.execCommand("selectAll",!1);return document.execCommand("insertText",!1,e),c}}catch{return!1}return!1},s=()=>{if(window.location.host!=="web.whatsapp.com")return!1;let i=document.querySelector('div[contenteditable="true"][role="textbox"]');if(!i)return!1;i.focus();let c=window.getSelection();if(!c)return!1;let d=document.createRange();d.selectNodeContents(i),d.collapse(!1),c.removeAllRanges(),c.addRange(d);try{return document.execCommand("insertText",!1,e),n(i),!0}catch{return!1}},a=document.activeElement,r=a&&a!==document.body&&(a instanceof HTMLInputElement||a instanceof HTMLTextAreaElement||a instanceof HTMLElement&&a.isContentEditable)?a:t;if(r instanceof HTMLInputElement||r instanceof HTMLTextAreaElement){r.focus(),r.value=e,r.setSelectionRange(e.length,e.length),n(r);return}if(r instanceof HTMLElement){if(r.focus(),o(r)){n(r);return}if(s())return;r.textContent=e;let i=window.getSelection();if(i){let c=document.createRange();c.selectNodeContents(r),c.collapse(!1),i.removeAllRanges(),i.addRange(c)}n(r)}}function he(t,e,n){let s=t.offsetWidth||60,a=t.offsetHeight||26,r=e.top,i=e.right+10;n==="above"?(r=e.top-a-10,i=e.left+e.width-s):n==="below"?(r=e.bottom+10,i=e.left+e.width-s):n==="left"&&(r=e.bottom-a,i=e.left-s-10),t.style.top=`${Math.max(8,r)}px`,t.style.left=`${Math.max(8,i)}px`}function be(t,e,n){let s=t.offsetWidth||320,a=t.offsetHeight||220,r=e.top-10,i=e.right-s;n==="above"?(r=e.top-t.offsetHeight-14,i=e.left):n==="below"?(r=e.bottom+14,i=e.left):n==="left"&&(r=e.bottom-t.offsetHeight,i=e.left-s-14);let c=Math.max(8,window.innerHeight-a-8),d=Math.max(8,window.innerWidth-s-8);t.style.top=`${Math.min(Math.max(8,r),c)}px`,t.style.left=`${Math.min(Math.max(8,i),d)}px`}function W(t){t.style.transform=t.classList.contains("ct-visible")?"translateX(0%)":"translateX(100%)"}function ve(t){return t>=70?"High conflict":t>=40?"Moderate conflict":"Low conflict"}function ye(t){return t>=70?"Frustration":t>=40?"Concern":"Neutral"}function xe(t){return t>=70?"Respect":t>=40?"Clarity":"Understanding"}function ee(t){let n=E(t)||"I want to talk this through.";return{empathic:"I feel frustrated. Can we talk about what is not working?",rational:"I noticed an issue. Lets discuss specifics and solutions.",socratic:"What part of this is most difficult for you?"}}function f(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;")}function B(t,e){let n=t.trim();return n.length<=e?n:`${n.slice(0,Math.max(0,e-1))}\u2026`}var we=8,Te=500,Se=5*60*1e3,Ee=5e3,Me=60*1e3,oe=2e3;function F(t){return new Promise((e,n)=>{if(!chrome.runtime?.sendMessage){n(new Error("runtime.sendMessage is unavailable"));return}try{chrome.runtime.sendMessage(t,o=>{let s=chrome.runtime.lastError;if(s){n(new Error(s.message));return}e(o)})}catch(o){n(o instanceof Error?o:new Error(String(o)))}})}async function R(t){try{let e=await z(t.inputSelector,{timeoutMs:Me}),n=await L(),o=u=>ne(u,{name:t.name,badgePlacement:n.badgePosition==="auto"?t.badgePlacement:n.badgePosition,minSeverity:n.minSeverity,autoSuggestThreshold:n.autoSuggestThreshold,showUnderline:n.showUnderline,animations:n.animations}),s=o(e),a=n.backendUrl,r=0,i,c=!1,d=()=>{c=!1,i!==void 0&&window.clearTimeout(i),i=window.setTimeout(()=>{c=!0},Se)},g=()=>!document.hidden&&!c&&n.autoAnalyzeOutgoing,x=(u,p)=>{p==="sync"&&(u.contextScoring||u.backendUrl||u.minSeverity||u.showUnderline||u.animations||u.badgePosition||u.autoAnalyzeOutgoing||u.autoSuggestThreshold||u.detectionSensitivity||u.categories||u.anonymousMode)&&L().then(m=>{n=m,a=m.backendUrl,s.updateSettings({minSeverity:m.minSeverity,autoSuggestThreshold:m.autoSuggestThreshold,showUnderline:m.showUnderline,animations:m.animations,badgePlacement:m.badgePosition==="auto"?t.badgePlacement:m.badgePosition})})};chrome.storage?.onChanged.addListener(x);let w=()=>{document.hidden||d()},h=()=>d();document.addEventListener("visibilitychange",w),window.addEventListener("focus",h);let v=$(()=>{if(d(),!g()){console.debug("[Conflict Translator] Skipping analysis - shouldAnalyze() returned false");return}let p=Pe(e).trim(),m=Ae(t,we);if(!p){console.debug("[Conflict Translator] Skipping analysis - empty text");return}console.log("[Conflict Translator] Analyzing text:",p.substring(0,50));let l=C(p),y=M(p);r+=1;let A=r;Le(a,p,m,l,n).then(b=>{if(console.log("[Conflict Translator] Analysis result:",b),A===r){s.update(b);let k={text:p,severity:b.severity,emotions:b.emotions??[],needs:b.needs??[],timestamp:Date.now(),messenger:t.name,language:y};console.log("[Conflict Translator] Recording history entry:",k),chrome.runtime?.sendMessage?F({type:"recordAnalysis",entry:k,anonymousMode:n.anonymousMode}).then(()=>{console.log("[Conflict Translator] History recorded via service worker")}).catch(async re=>{console.warn("[Conflict Translator] Service worker failed, using fallback:",re),await O(k,n.anonymousMode)}):(console.log("[Conflict Translator] Using direct storage recording"),O(k,n.anonymousMode))}}).catch(b=>{console.error("[Conflict Translator] Analysis failed:",b)}),console.debug(`[Conflict Translator] ${t.name} input`,{text:p,language:y,metadata:l,context:m})},Te);e.addEventListener("input",v);let T=u=>{let p=u.target;if(!(p instanceof Element))return;let m=p.closest(t.inputSelector);!m||m===e||(e.removeEventListener("input",v),s.destroy(),e=m,s=o(e),s.updateSettings({minSeverity:n.minSeverity,autoSuggestThreshold:n.autoSuggestThreshold,showUnderline:n.showUnderline,animations:n.animations,badgePlacement:n.badgePosition==="auto"?t.badgePlacement:n.badgePosition}),e.addEventListener("input",v),console.log(`[Conflict Translator] ${t.name} rebound to new input node`))};document.addEventListener("input",T,!0),d();let S=window.setInterval(()=>{e.isConnected||(e.removeEventListener("input",v),document.removeEventListener("input",T,!0),document.removeEventListener("visibilitychange",w),window.removeEventListener("focus",h),chrome.storage?.onChanged.removeListener(x),i!==void 0&&window.clearTimeout(i),window.clearInterval(S),s.destroy(),window.setTimeout(()=>{R(t)},oe))},Ee)}catch(e){console.warn(`[Conflict Translator] ${t.name} input not found.`,e),window.setTimeout(()=>{R(t)},oe)}}async function Ce(t,e,n){if(!chrome.runtime?.sendMessage)return se(t,e,n);try{let o=await F({type:"quickCheck",text:t});if(o&&typeof o.severity=="number")return o.severity}catch(o){console.warn("[Conflict Translator] Quick check failed",o)}return se(t,e,n)}function se(t,e,n){let o=t.toLowerCase(),s=0;(o.includes("always")||o.includes("never"))&&(s+=20),n.categories.insults&&(o.includes("stupid")||o.includes("idiot")||o.includes("hate"))&&(s+=40),n.categories.threats&&(o.includes("kill")||o.includes("ruin")||o.includes("destroy"))&&(s+=50),n.categories.harassment&&(o.includes("shut up")||o.includes("loser"))&&(s+=30),n.categories.profanity&&(o.includes("damn")||o.includes("hell"))&&(s+=20),e.capsRatio>.3&&(s+=15),e.punctuationCount>=3&&(s+=15);let a=n.detectionSensitivity==="high"?1.2:n.detectionSensitivity==="low"?.8:1;return Math.min(100,Math.round(s*a))}async function Le(t,e,n,o,s){let a=await Ce(e,o,s),r={text:e,severity:a};if(!chrome.runtime?.sendMessage)return console.warn("[Conflict Translator] Extension context invalidated - using fallback"),r;try{let i=await F({type:"backendAnalyze",backendUrl:t,apiKey:s.backendApiKey||void 0,payload:{text:e,context:n,ml_score:a,context_scoring:s.contextScoring}});if(!i||i.ok!==!0)return r;let c=i.data;return{text:e,severity:typeof c.escalation=="number"?c.escalation:a,emotions:c.emotions??[],needs:c.needs??[],alternatives:c.alternatives?{empathic:c.alternatives.empathic??"",rational:c.alternatives.rational??"",socratic:c.alternatives.socratic??""}:void 0}}catch(i){return console.warn("[Conflict Translator] Backend analyze failed",i),r}}function Pe(t){return t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement?t.value??"":t.textContent??""}function Ae(t,e){let n=t.messageContainerSelector?document.querySelector(t.messageContainerSelector):document;return(n?Array.from(n.querySelectorAll(t.messageSelector)):[]).slice(-e).map(a=>{let r=q(a);return{text:r,language:M(r),metadata:C(r),author:ke(a,t),timestamp:He(a)}})}function ke(t,e){if(!e.authorRules)return"unknown";let n=t.className;for(let o of e.authorRules.self)if(n.includes(o))return"self";for(let o of e.authorRules.other)if(n.includes(o))return"other";return"unknown"}function He(t){let e=t.querySelector("time");if(e)return e.getAttribute("datetime")??e.textContent;let n=t.getAttribute("data-pre-plain-text");return n||null}console.log("[Conflict Translator] Content script loaded on",window.location.href);var U=window.location.host,ie=window.location.pathname,P=[];(async()=>{console.log("[Conflict Translator] Starting initialization...");let t=await L();console.log("[Conflict Translator] Settings loaded:",{autoAnalyzeOutgoing:t.autoAnalyzeOutgoing,enableWhatsApp:t.enableWhatsApp,anonymousMode:t.anonymousMode,backendUrl:t.backendUrl}),U==="web.whatsapp.com"&&t.enableWhatsApp&&P.push({name:"WhatsApp",inputSelector:['footer div[contenteditable="true"][role="textbox"]','footer div[contenteditable="true"][data-tab]','div[contenteditable="true"][role="textbox"]'].join(", "),messageSelector:"div.message-in, div.message-out",badgePlacement:"right",authorRules:{self:["message-out"],other:["message-in"]}}),U==="web.telegram.org"&&t.enableTelegram&&P.push({name:"Telegram",inputSelector:"div.input-message-input",messageSelector:"div.message",badgePlacement:"above",authorRules:{self:["is-out","message-out","out"],other:["is-in","message-in","in"]}}),U==="vk.com"&&ie.startsWith("/im")&&t.enableVK&&P.push({name:"VK",inputSelector:"div[contenteditable].im-chat-input--text",messageSelector:"div.im-mess",badgePlacement:"right",authorRules:{self:["im-mess--out"],other:["im-mess--in"]}}),U==="discord.com"&&ie.startsWith("/channels")&&t.enableDiscord&&P.push({name:"Discord",inputSelector:'div[role="textbox"]',messageSelector:"li.messageListItem",badgePlacement:"below"}),P.forEach(e=>{R(e)})})();})();
