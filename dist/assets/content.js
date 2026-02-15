import{a as I,g as R,r as q}from"./storage.js";function J(t,e){let n;return(...o)=>{n!==void 0&&window.clearTimeout(n),n=window.setTimeout(()=>t(...o),e)}}function tt(t,e={}){const n=e.root??document,o=e.timeoutMs??15e3,s=n.querySelector(t);return s?Promise.resolve(s):new Promise((i,r)=>{const a=new MutationObserver(()=>{const l=n.querySelector(t);l&&(a.disconnect(),i(l))});a.observe(n,{childList:!0,subtree:!0}),window.setTimeout(()=>{a.disconnect(),r(new Error(`Timed out waiting for ${t}`))},o)})}const et=/[\u200B-\u200D\uFEFF]/g;function $(t){return t.replace(et,"").replace(/\s+/g," ").trim()}function U(t){var s,i;const e=$(t);if(!e)return"unknown";const n=((s=e.match(/[\u0400-\u04FF]/g))==null?void 0:s.length)??0,o=((i=e.match(/[A-Za-z]/g))==null?void 0:i.length)??0;return n>0&&o>0?"mixed":n>0?"ru":o>0?"en":"unknown"}function nt(t){const e=[],n=document.createTreeWalker(t,NodeFilter.SHOW_ELEMENT|NodeFilter.SHOW_TEXT);let o=n.currentNode;for(;o;){if(o.nodeType===Node.TEXT_NODE)e.push(o.textContent??"");else if(o instanceof HTMLElement){const s=o.tagName.toLowerCase();if(s==="br"&&e.push(`
`),s==="img"&&e.push(o.getAttribute("alt")??""),s==="a"){const i=o.textContent??o.getAttribute("href")??"";e.push(i)}}o=n.nextNode()}return $(e.join(" "))}function N(t){var r,a,l;const e=$(t),n=((r=e.match(/[A-Za-z\u0400-\u04FF]/g))==null?void 0:r.length)??0,o=((a=e.match(/[A-Z\u0410-\u042F]/g))==null?void 0:a.length)??0,s=((l=e.match(/[.!?…,:;]/g))==null?void 0:l.length)??0;return{capsRatio:n===0?0:o/n,punctuationCount:s,length:e.length}}const F="ct-ui-style",D=100,A=44,G=220,ot=80;function H(t){return new Promise((e,n)=>{var o;if(!((o=chrome.runtime)!=null&&o.sendMessage)){n(new Error("runtime.sendMessage is unavailable"));return}try{chrome.runtime.sendMessage(t,s=>{const i=chrome.runtime.lastError;if(i){n(new Error(i.message));return}e(s)})}catch(s){n(s instanceof Error?s:new Error(String(s)))}})}function st(t,e){it();const n=document.createElement("div");n.className="ct-root";const o=document.createElement("button");o.className="ct-badge",o.type="button",o.textContent="0/100";const s=document.createElement("div");s.className="ct-popup ct-hidden";const i=document.createElement("div");i.className="ct-sidebar",n.appendChild(o),n.appendChild(s),n.appendChild(i),document.body.appendChild(n);let r={severity:0,text:"",emotions:[],needs:[],alternatives:X("")},a=e.minSeverity??0,l=e.autoSuggestThreshold??ot,d=e.showUnderline??!0,m=e.animations??!0,y="",b="";const g=[];o.addEventListener("click",()=>{s.classList.toggle("ct-hidden"),B(s,r,t,i,g,a,l,e.onReplace)});const T=()=>h(),v=()=>h();window.addEventListener("resize",T),window.addEventListener("scroll",v,!0);function x(c){var L;r={severity:c.severity,text:c.text,emotions:c.emotions??[],needs:c.needs??[],alternatives:c.alternatives??X(c.text)},c.text&&((L=g.at(-1))==null?void 0:L.text)!==c.text&&(g.push({text:c.text,severity:c.severity,emotions:r.emotions,needs:r.needs,timestamp:Date.now()}),g.length>D&&g.splice(0,g.length-D));const E=`${c.text}:${c.severity}`;c.severity>=Math.max(a,l)&&c.text.trim().length>0&&E!==b&&E!==y&&(s.classList.remove("ct-hidden"),y=E),Y(o,c.severity,a,m),K(t,c.severity,a,d),B(s,r,t,i,g,a,l,e.onReplace,w=>{b=w}),h()}function h(){const c=t.getBoundingClientRect();dt(o,c,e.badgePlacement??"right"),ut(s,c,e.badgePlacement??"right"),_(i)}function u(){window.removeEventListener("resize",T),window.removeEventListener("scroll",v,!0),n.remove()}function p(c){typeof c.minSeverity=="number"&&(a=c.minSeverity),typeof c.showUnderline=="boolean"&&(d=c.showUnderline),typeof c.autoSuggestThreshold=="number"&&(l=c.autoSuggestThreshold),typeof c.animations=="boolean"&&(m=c.animations),c.badgePlacement&&(e.badgePlacement=c.badgePlacement),Y(o,r.severity,a,m),K(t,r.severity,a,d),h()}return{update:x,updateSettings:p,destroy:u}}function it(){if(document.getElementById(F))return;const t=document.createElement("style");t.id=F,t.textContent=`
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
`,document.head.appendChild(t)}function Y(t,e,n,o){const s=e>=n;t.style.display=s?"inline-flex":"none",t.textContent=`${e}/100`,t.classList.remove("ct-mid","ct-high","ct-pulse"),e>=70?(t.classList.add("ct-high"),o&&t.classList.add("ct-pulse")):e>=40&&t.classList.add("ct-mid")}function K(t,e,n,o){if(t instanceof HTMLElement){if(!o||e<Math.max(50,n)){t.classList.remove("ct-underline");return}e>=50?t.classList.add("ct-underline"):t.classList.remove("ct-underline")}}function B(t,e,n,o,s,i,r,a,l){if(t.classList.contains("ct-hidden"))return;if(e.severity<i){t.classList.add("ct-hidden");return}const d=mt(e.severity),m=e.alternatives,y=e.emotions[0]??pt(e.severity),b=e.needs[0]??ft(e.severity),g=P(m.empathic,90),T=P(m.rational,90),v=P(m.socratic,90);t.innerHTML=`
    <h4>${d} (${e.severity}/100)</h4>
    <div class="ct-row"><span>Emotion</span><span>${y}</span></div>
    <div class="ct-row"><span>Need</span><span>${b}</span></div>
    ${`
      <div class="ct-suggestions">
        <div class="ct-suggestion-item" data-style="empathic">
          <div class="ct-suggestion-title">🤝 Empathic</div>
          <div class="ct-suggestion-text" data-full="${f(m.empathic)}" data-preview="${f(g)}">${f(g)}</div>
          <div class="ct-suggestion-actions">
            <button class="ct-button" data-action="preview">Preview full</button>
            <button class="ct-button ct-primary" data-action="replace" data-value="${f(m.empathic)}">Use this</button>
          </div>
        </div>
        <div class="ct-suggestion-item" data-style="rational">
          <div class="ct-suggestion-title">🧠 Rational</div>
          <div class="ct-suggestion-text" data-full="${f(m.rational)}" data-preview="${f(T)}">${f(T)}</div>
          <div class="ct-suggestion-actions">
            <button class="ct-button" data-action="preview">Preview full</button>
            <button class="ct-button ct-primary" data-action="replace" data-value="${f(m.rational)}">Use this</button>
          </div>
        </div>
        <div class="ct-suggestion-item" data-style="socratic">
          <div class="ct-suggestion-title">❓ Socratic</div>
          <div class="ct-suggestion-text" data-full="${f(m.socratic)}" data-preview="${f(v)}">${f(v)}</div>
          <div class="ct-suggestion-actions">
            <button class="ct-button" data-action="preview">Preview full</button>
            <button class="ct-button ct-primary" data-action="replace" data-value="${f(m.socratic)}">Use this</button>
          </div>
        </div>
      </div>
    `}
    <div class="ct-actions">
      <button class="ct-button ct-secondary" data-action="details">More details</button>
      <button class="ct-button ct-secondary" data-action="dismiss">Dismiss</button>
    </div>
  `,t.querySelectorAll("button").forEach(x=>{x.addEventListener("click",()=>{const h=x.dataset.action;if(h==="replace"){const u=x.dataset.value??"";lt(n,u),at(u,e.severity,a),t.classList.add("ct-hidden")}if(h==="preview"){const u=x.closest(".ct-suggestion-item"),p=u==null?void 0:u.querySelector(".ct-suggestion-text");if(!p)return;const c=p.dataset.expanded==="true",E=p.dataset.full??"",S=p.dataset.preview??"";p.textContent=c?S:E,p.dataset.expanded=c?"false":"true",x.textContent=c?"Preview full":"Collapse"}h==="details"&&(o.classList.add("ct-visible"),rt(o,e,s),_(o)),h==="dismiss"&&(t.classList.add("ct-hidden"),l==null||l(`${e.text}:${e.severity}`))})})}async function at(t,e,n){var o,s;if(n){n(t,e);return}if((o=chrome.runtime)!=null&&o.sendMessage)try{const i=await H({type:"quickCheck",text:t}),r=typeof(i==null?void 0:i.severity)=="number"?i.severity:e;try{await H({type:"recordReplacement",beforeSeverity:e,afterSeverity:r})}catch{await I(e,r)}}catch{if((s=chrome.runtime)!=null&&s.sendMessage)try{await H({type:"recordReplacement",beforeSeverity:e,afterSeverity:e});return}catch{await I(e,e);return}await I(e,e)}}function rt(t,e,n){const o=N(e.text),s=e.emotions.length?e.emotions.join(", "):"-",i=e.needs.length?e.needs.join(", "):"-",r=n.slice(-3).reverse();t.innerHTML=`
    <h3>Conflict Translator</h3>
    <div class="ct-tabs">
      <span class="ct-tab">Analysis</span>
      <span class="ct-tab">History</span>
      <span class="ct-tab">Settings</span>
    </div>
    <div class="ct-metrics">
      <div><strong>Severity:</strong> ${e.severity}/100</div>
      <div><strong>Emotions:</strong> ${s}</div>
      <div><strong>Needs:</strong> ${i}</div>
      <div><strong>Language:</strong> ${U(e.text)}</div>
      <div><strong>Caps ratio:</strong> ${o.capsRatio.toFixed(2)}</div>
      <div><strong>Punctuation:</strong> ${o.punctuationCount}</div>
      <div><strong>Length:</strong> ${o.length}</div>
    </div>
    <div class="ct-context">
      <div class="ct-context-title">Conversation Context</div>
      ${r.length===0?'<div class="ct-context-text">No recent messages.</div>':r.map(d=>{const m=d.severity>=70?"ct-high":d.severity>=40?"ct-mid":"",y=f(d.text).slice(0,80),b=new Date(d.timestamp).toLocaleTimeString();return`
          <div class="ct-context-row">
            <div class="ct-context-text">${y}</div>
            <div class="ct-context-meta">
              <span class="ct-context-badge ${m}">${d.severity}</span>
              <span>${b}</span>
            </div>
          </div>
        `}).join("")}
    </div>
    <div class="ct-history">
      <div class="ct-history-viewport">
        <div class="ct-history-spacer" style="height: ${n.length*A}px"></div>
        <div class="ct-history-items"></div>
      </div>
    </div>
    <button class="ct-button ct-secondary" data-action="close">Close</button>
  `;const a=t.querySelector(".ct-history-viewport");if(a){a.style.maxHeight=`${G}px`;const d=()=>ct(a,n);d(),a.addEventListener("scroll",d,{passive:!0})}const l=t.querySelector("[data-action=close]");l&&l.addEventListener("click",()=>{t.classList.remove("ct-visible"),_(t)})}function ct(t,e){const n=t.querySelector(".ct-history-items");if(!n)return;const o=t.scrollTop,s=Math.max(0,Math.floor(o/A)-2),i=Math.ceil(G/A)+4,r=Math.min(e.length,s+i),a=e.slice(s,r);n.style.transform=`translateY(${s*A}px)`,n.innerHTML=a.map(l=>{const d=new Date(l.timestamp).toLocaleTimeString(),m=f(l.text).slice(0,60);return`
      <div class="ct-history-row">
        <span class="ct-history-score">${l.severity}/100</span>
        <span class="ct-history-text">${m}</span>
        <span class="ct-history-time">${d}</span>
      </div>
    `}).join("")}function lt(t,e){const n=a=>{try{a.dispatchEvent(new InputEvent("input",{bubbles:!0,inputType:"insertText",data:e}))}catch{a.dispatchEvent(new Event("input",{bubbles:!0}))}a.dispatchEvent(new Event("change",{bubbles:!0}))},o=a=>{try{if(a instanceof HTMLElement&&a.isContentEditable){const l=document.execCommand("selectAll",!1);return document.execCommand("insertText",!1,e),l}}catch{return!1}return!1},s=()=>{if(window.location.host!=="web.whatsapp.com")return!1;const a=document.querySelector('div[contenteditable="true"][role="textbox"]');if(!a)return!1;a.focus();const l=window.getSelection();if(!l)return!1;const d=document.createRange();d.selectNodeContents(a),d.collapse(!1),l.removeAllRanges(),l.addRange(d);try{return document.execCommand("insertText",!1,e),n(a),!0}catch{return!1}},i=document.activeElement,r=i&&i!==document.body&&(i instanceof HTMLInputElement||i instanceof HTMLTextAreaElement||i instanceof HTMLElement&&i.isContentEditable)?i:t;if(r instanceof HTMLInputElement||r instanceof HTMLTextAreaElement){r.focus(),r.value=e,r.setSelectionRange(e.length,e.length),n(r);return}if(r instanceof HTMLElement){if(r.focus(),o(r)){n(r);return}if(s())return;r.textContent=e;const a=window.getSelection();if(a){const l=document.createRange();l.selectNodeContents(r),l.collapse(!1),a.removeAllRanges(),a.addRange(l)}n(r)}}function dt(t,e,n){const s=t.offsetWidth||60,i=t.offsetHeight||26;let r=e.top,a=e.right+10;n==="above"?(r=e.top-i-10,a=e.left+e.width-s):n==="below"?(r=e.bottom+10,a=e.left+e.width-s):n==="left"&&(r=e.bottom-i,a=e.left-s-10),t.style.top=`${Math.max(8,r)}px`,t.style.left=`${Math.max(8,a)}px`}function ut(t,e,n){const s=t.offsetWidth||320,i=t.offsetHeight||220;let r=e.top-10,a=e.right-s;n==="above"?(r=e.top-t.offsetHeight-14,a=e.left):n==="below"?(r=e.bottom+14,a=e.left):n==="left"&&(r=e.bottom-t.offsetHeight,a=e.left-s-14);const l=Math.max(8,window.innerHeight-i-8),d=Math.max(8,window.innerWidth-s-8);t.style.top=`${Math.min(Math.max(8,r),l)}px`,t.style.left=`${Math.min(Math.max(8,a),d)}px`}function _(t){t.style.transform=t.classList.contains("ct-visible")?"translateX(0%)":"translateX(100%)"}function mt(t){return t>=70?"High conflict":t>=40?"Moderate conflict":"Low conflict"}function pt(t){return t>=70?"Frustration":t>=40?"Concern":"Neutral"}function ft(t){return t>=70?"Respect":t>=40?"Clarity":"Understanding"}function X(t){return $(t),{empathic:"I feel frustrated. Can we talk about what is not working?",rational:"I noticed an issue. Lets discuss specifics and solutions.",socratic:"What part of this is most difficult for you?"}}function f(t){return t.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/\"/g,"&quot;").replace(/'/g,"&#39;")}function P(t,e){const n=t.trim();return n.length<=e?n:`${n.slice(0,Math.max(0,e-1))}…`}const gt=8,ht=500,vt=5*60*1e3,xt=5e3,bt=60*1e3,V=2e3;function O(t){return new Promise((e,n)=>{var o;if(!((o=chrome.runtime)!=null&&o.sendMessage)){n(new Error("runtime.sendMessage is unavailable"));return}try{chrome.runtime.sendMessage(t,s=>{const i=chrome.runtime.lastError;if(i){n(new Error(i.message));return}e(s)})}catch(s){n(s instanceof Error?s:new Error(String(s)))}})}async function z(t){var e;try{let n=await tt(t.inputSelector,{timeoutMs:bt}),o=await R();const s=u=>st(u,{name:t.name,badgePlacement:o.badgePosition==="auto"?t.badgePlacement:o.badgePosition,minSeverity:o.minSeverity,autoSuggestThreshold:o.autoSuggestThreshold,showUnderline:o.showUnderline,animations:o.animations});let i=s(n),r=o.backendUrl,a=0,l,d=!1;const m=()=>{d=!1,l!==void 0&&window.clearTimeout(l),l=window.setTimeout(()=>{d=!0},vt)},y=()=>!document.hidden&&!d&&o.autoAnalyzeOutgoing,b=(u,p)=>{p==="sync"&&(u.contextScoring||u.backendUrl||u.minSeverity||u.showUnderline||u.animations||u.badgePosition||u.autoAnalyzeOutgoing||u.autoSuggestThreshold||u.detectionSensitivity||u.categories||u.anonymousMode)&&R().then(c=>{o=c,r=c.backendUrl,i.updateSettings({minSeverity:c.minSeverity,autoSuggestThreshold:c.autoSuggestThreshold,showUnderline:c.showUnderline,animations:c.animations,badgePlacement:c.badgePosition==="auto"?t.badgePlacement:c.badgePosition})})};(e=chrome.storage)==null||e.onChanged.addListener(b);const g=()=>{document.hidden||m()},T=()=>m();document.addEventListener("visibilitychange",g),window.addEventListener("focus",T);const v=J(()=>{if(m(),!y()){console.debug("[Conflict Translator] Skipping analysis - shouldAnalyze() returned false");return}const p=Tt(n).trim(),c=Et(t,gt);if(!p){console.debug("[Conflict Translator] Skipping analysis - empty text");return}console.log("[Conflict Translator] Analyzing text:",p.substring(0,50));const E=N(p),S=U(p);a+=1;const L=a;yt(r,p,c,E,o).then(w=>{var W;if(console.log("[Conflict Translator] Analysis result:",w),L===a){i.update(w);const M={text:p,severity:w.severity,emotions:w.emotions??[],needs:w.needs??[],timestamp:Date.now(),messenger:t.name,language:S};console.log("[Conflict Translator] Recording history entry:",M),(W=chrome.runtime)!=null&&W.sendMessage?O({type:"recordAnalysis",entry:M,anonymousMode:o.anonymousMode}).then(()=>{console.log("[Conflict Translator] History recorded via service worker")}).catch(async Q=>{console.warn("[Conflict Translator] Service worker failed, using fallback:",Q),await q(M,o.anonymousMode)}):(console.log("[Conflict Translator] Using direct storage recording"),q(M,o.anonymousMode))}}).catch(w=>{console.error("[Conflict Translator] Analysis failed:",w)}),console.debug(`[Conflict Translator] ${t.name} input`,{text:p,language:S,metadata:E,context:c})},ht);n.addEventListener("input",v);const x=u=>{const p=u.target;if(!(p instanceof Element))return;const c=p.closest(t.inputSelector);!c||c===n||(n.removeEventListener("input",v),i.destroy(),n=c,i=s(n),i.updateSettings({minSeverity:o.minSeverity,autoSuggestThreshold:o.autoSuggestThreshold,showUnderline:o.showUnderline,animations:o.animations,badgePlacement:o.badgePosition==="auto"?t.badgePlacement:o.badgePosition}),n.addEventListener("input",v),console.log(`[Conflict Translator] ${t.name} rebound to new input node`))};document.addEventListener("input",x,!0),m();const h=window.setInterval(()=>{var u;n.isConnected||(n.removeEventListener("input",v),document.removeEventListener("input",x,!0),document.removeEventListener("visibilitychange",g),window.removeEventListener("focus",T),(u=chrome.storage)==null||u.onChanged.removeListener(b),l!==void 0&&window.clearTimeout(l),window.clearInterval(h),i.destroy(),window.setTimeout(()=>{z(t)},V))},xt)}catch(n){console.warn(`[Conflict Translator] ${t.name} input not found.`,n),window.setTimeout(()=>{z(t)},V)}}async function wt(t,e,n){var o;if(!((o=chrome.runtime)!=null&&o.sendMessage))return Z(t,e,n);try{const s=await O({type:"quickCheck",text:t});if(s&&typeof s.severity=="number")return s.severity}catch(s){console.warn("[Conflict Translator] Quick check failed",s)}return Z(t,e,n)}function Z(t,e,n){const o=t.toLowerCase();let s=0;(o.includes("always")||o.includes("never"))&&(s+=20),n.categories.insults&&(o.includes("stupid")||o.includes("idiot")||o.includes("hate"))&&(s+=40),n.categories.threats&&(o.includes("kill")||o.includes("ruin")||o.includes("destroy"))&&(s+=50),n.categories.harassment&&(o.includes("shut up")||o.includes("loser"))&&(s+=30),n.categories.profanity&&(o.includes("damn")||o.includes("hell"))&&(s+=20),e.capsRatio>.3&&(s+=15),e.punctuationCount>=3&&(s+=15);const i=n.detectionSensitivity==="high"?1.2:n.detectionSensitivity==="low"?.8:1;return Math.min(100,Math.round(s*i))}async function yt(t,e,n,o,s){var a;const i=await wt(e,o,s),r={text:e,severity:i};if(!((a=chrome.runtime)!=null&&a.sendMessage))return console.warn("[Conflict Translator] Extension context invalidated - using fallback"),r;try{const l=await O({type:"backendAnalyze",backendUrl:t,apiKey:s.backendApiKey||void 0,payload:{text:e,context:n,ml_score:i,context_scoring:s.contextScoring}});if(!l||l.ok!==!0)return r;const d=l.data;return{text:e,severity:typeof d.escalation=="number"?d.escalation:i,emotions:d.emotions??[],needs:d.needs??[],alternatives:d.alternatives?{empathic:d.alternatives.empathic??"",rational:d.alternatives.rational??"",socratic:d.alternatives.socratic??""}:void 0}}catch(l){return console.warn("[Conflict Translator] Backend analyze failed",l),r}}function Tt(t){return t instanceof HTMLInputElement||t instanceof HTMLTextAreaElement?t.value??"":t.textContent??""}function Et(t,e){const n=t.messageContainerSelector?document.querySelector(t.messageContainerSelector):document;return(n?Array.from(n.querySelectorAll(t.messageSelector)):[]).slice(-8).map(i=>{const r=nt(i);return{text:r,language:U(r),metadata:N(r),author:St(i,t),timestamp:Ct(i)}})}function St(t,e){if(!e.authorRules)return"unknown";const n=t.className;for(const o of e.authorRules.self)if(n.includes(o))return"self";for(const o of e.authorRules.other)if(n.includes(o))return"other";return"unknown"}function Ct(t){const e=t.querySelector("time");if(e)return e.getAttribute("datetime")??e.textContent;const n=t.getAttribute("data-pre-plain-text");return n||null}console.log("[Conflict Translator] Content script loaded on",window.location.href);const k=window.location.host,j=window.location.pathname,C=[];(async()=>{console.log("[Conflict Translator] Starting initialization...");const t=await R();console.log("[Conflict Translator] Settings loaded:",{autoAnalyzeOutgoing:t.autoAnalyzeOutgoing,enableWhatsApp:t.enableWhatsApp,anonymousMode:t.anonymousMode,backendUrl:t.backendUrl}),k==="web.whatsapp.com"&&t.enableWhatsApp&&C.push({name:"WhatsApp",inputSelector:['footer div[contenteditable="true"][role="textbox"]','footer div[contenteditable="true"][data-tab]','div[contenteditable="true"][role="textbox"]'].join(", "),messageSelector:"div.message-in, div.message-out",badgePlacement:"right",authorRules:{self:["message-out"],other:["message-in"]}}),k==="web.telegram.org"&&t.enableTelegram&&C.push({name:"Telegram",inputSelector:"div.input-message-input",messageSelector:"div.message",badgePlacement:"above",authorRules:{self:["is-out","message-out","out"],other:["is-in","message-in","in"]}}),k==="vk.com"&&j.startsWith("/im")&&t.enableVK&&C.push({name:"VK",inputSelector:"div[contenteditable].im-chat-input--text",messageSelector:"div.im-mess",badgePlacement:"right",authorRules:{self:["im-mess--out"],other:["im-mess--in"]}}),k==="discord.com"&&j.startsWith("/channels")&&t.enableDiscord&&C.push({name:"Discord",inputSelector:'div[role="textbox"]',messageSelector:"li.messageListItem",badgePlacement:"below"}),C.forEach(e=>{z(e)})})();
