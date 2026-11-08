import { NextResponse } from "next/server";

const html = /* html */ `<!doctype html><html lang="zh-TW"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>島島阿學 燈塔 v2</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;600;700&family=Anonymous+Pro:wght@400;700&display=swap">
<style>
:root{
  color-scheme:light;
  --primary-base:#16B9B3; --primary-darker:#0D7A77; --primary-lighter:#66D4CF; --primary-lightest:#B3E8E6; --primary-pale:#D9F3F5; --primary-palest:#E6F7F9;
  --bg-dark:#0D3036; --text-dark:#2E6865; --text-muted:#5E7378; --light-gray:#9FB5B8; --bg-gray:#E4EAE9; --very-light-gray:#F4F6F6;
  --page:#F7FDFB; --white:#FFFFFF; --mint-chip:#E7FAF7; --mint-chip-text:#0D5B59; --heat-empty:#EDF8F6;
  --tips:#FFA10B; --tips-text:#A95D00;
  --f-body:"Noto Sans TC","PingFang TC","Microsoft JhengHei",system-ui,sans-serif;
  --f-mono:"Anonymous Pro",ui-monospace,Menlo,monospace;
  --s-1:.875rem; --s0:1rem; --s1:1.125rem; --s2:clamp(1.3rem,1.15rem + .6vw,1.5rem); --s3:clamp(1.75rem,1.4rem + 1.2vw,2.25rem); --s4:clamp(2rem,1.5rem + 2.2vw,3.1rem);
  --wrap:1160px;
}
html{scroll-behavior:smooth}
*{box-sizing:border-box}
body{margin:0;background:var(--page);color:var(--bg-dark);font-family:var(--f-body);font-size:var(--s0);line-height:1.75;-webkit-font-smoothing:antialiased}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--white)}
.wrap{max-width:var(--wrap);margin-inline:auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
@media (min-width:720px){.wrap{padding-left:max(32px,env(safe-area-inset-left,0px));padding-right:max(32px,env(safe-area-inset-right,0px))}}
h1,h2,h3{margin:0;line-height:1.35;text-wrap:balance;font-weight:700}
p{margin:0}
img{max-width:100%;height:auto;display:block}
a{color:var(--primary-darker)}
:focus-visible{outline:2px solid var(--primary-base);outline-offset:3px;border-radius:8px}
.mono{font-family:var(--f-mono);font-variant-numeric:tabular-nums}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:var(--s-1);font-weight:600;color:var(--bg-dark);letter-spacing:.06em}
.lede{color:var(--text-muted);font-size:var(--s1);max-width:34em}
.h2{font-size:var(--s3);color:var(--primary-darker)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.4em;min-height:48px;padding:0 1.6em;border-radius:999px;font:600 var(--s0)/1 var(--f-body);text-decoration:none;cursor:pointer;border:2px solid transparent;transition:background .2s,color .2s,box-shadow .2s}
.btn-orange{background:var(--tips);border-color:var(--tips);color:var(--white);box-shadow:0 8px 10px 0 rgba(255,161,11,.2)}
.btn-orange:hover{background:var(--white);color:var(--tips-text);box-shadow:0 12px 20px 0 rgba(255,161,11,.3)}
.btn-outline{background:var(--white);border:1px solid var(--bg-gray);color:var(--text-dark)}
.btn-outline:hover{border-color:var(--primary-base);color:var(--primary-darker)}
.btn-sm{min-height:40px;padding:0 1.1em;font-size:var(--s-1)}
.btn-huge{min-height:56px;padding:0 2.2em;font-size:var(--s1)}
.nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:rgba(255,255,255,.86);backdrop-filter:blur(10px);border-bottom:1px solid var(--bg-gray);transition:background .4s,border-color .4s}
html.dark-nav .nav{background:rgba(13,48,54,.92);border-color:rgba(255,255,255,.08)}
html.dark-nav .nav .logo-text{color:var(--white)}
html.dark-nav .nav .nav-links a{color:rgba(255,255,255,.8)}
html.dark-nav .nav .nav-links a:hover{color:var(--white)}
html.dark-nav .btn-cta{background:var(--primary-lighter);color:var(--bg-dark)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:68px}
.nav-logo img{width:150px}
.nav-links{display:none;gap:28px;font-size:var(--s-1)}
.nav-links a{color:var(--text-dark);text-decoration:none;font-weight:500}
.nav-links a:hover,.nav-links a[aria-current="page"]{color:var(--primary-base)}
.nav-links a[aria-current="page"]{font-weight:600}
.nav-right{display:flex;align-items:center;gap:14px}
@media (min-width:480px){.nav-links{display:flex}}
.hero{position:relative;overflow:visible;min-height:100svh;display:flex;flex-direction:column;justify-content:center;padding-block:clamp(48px,7vw,96px) clamp(56px,7vw,104px);background:linear-gradient(145deg,var(--page) 0%,#E8F7F5 60%,#D4F0F5 100%)}
@media(min-width:600px){.hero{min-height:700px}}
.hero .wrap{position:relative;z-index:1;display:grid;gap:48px;align-items:center}
@media (min-width:980px){.hero .wrap{grid-template-columns:1fr 1.05fr}}
.hero-copy{position:relative}
.hero h1{font-size:var(--s4);color:var(--bg-dark);margin-block:16px 20px}
.hero h1 span{color:var(--primary-darker);display:block}
.cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
.hero-shapes{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.hero-shapes img{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover;object-position:left top;opacity:.85;pointer-events:none}
.hero-visual{position:relative;overflow:visible}
.frame{background:var(--white);border:1px solid var(--bg-gray);border-radius:20px;box-shadow:0 30px 60px -30px rgba(13,48,54,.28);overflow:hidden;min-width:0}
.frame-top{display:flex;align-items:center;gap:10px;padding:14px 32px;border-bottom:1px solid var(--bg-gray)}
.frame-top .back{font-size:.75rem;color:var(--text-muted)}
.frame-top strong{font-size:var(--s-1);color:var(--bg-dark)}
.tabs{display:flex;gap:6px;padding:12px 32px 0;flex-wrap:wrap}
.tab{font-size:.78rem;padding:5px 12px;border-radius:999px;color:var(--text-muted);background:var(--very-light-gray)}
.tab.on{background:var(--white);color:var(--bg-dark);border:1.5px solid var(--bg-dark)}
.focus-label{font-size:.72rem;font-weight:700;color:var(--text-muted);padding:0 32px;padding-bottom:6px}
.focus-preview{display:grid;gap:8px;padding:14px 32px}
.focus-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border:1px solid var(--bg-gray);border-radius:12px;background:var(--page);font-size:.8rem}
.focus-row .name{font-weight:600;color:var(--bg-dark)}
.focus-row .days{font-size:.72rem;color:var(--tips-text);font-weight:600}
.focus-row .act{font-size:.72rem;padding:4px 10px;border-radius:999px;background:var(--primary-base);color:var(--white);font-weight:600}
@keyframes rowSlideIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
.fr-anim-1{opacity:0;animation:rowSlideIn .5s .3s ease forwards}
.fr-anim-2{opacity:0;animation:rowSlideIn .5s .9s ease forwards}
.fr-anim-3{opacity:0;animation:rowSlideIn .5s 1.5s ease forwards}
/* mobile: 靜態排在 frame 下方 */
.hv-avatars{display:flex;align-items:flex-end;gap:12px;padding-top:16px;pointer-events:none;z-index:2}
.hv-av{opacity:0;position:relative}
/* desktop: 絕對定位覆蓋在 hero-visual 上 */
@media (min-width:980px){
  .hv-avatars{position:absolute;inset:0;display:block;padding:0}
  .hv-av{position:absolute}
}
@keyframes avatarPop{from{opacity:0;transform:scale(.5)}65%{transform:scale(1.08)}to{opacity:1;transform:scale(1)}}
@keyframes avFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.hv-av img{border-radius:50%;object-fit:cover;object-position:top;box-shadow:0 6px 20px rgba(0,0,0,.2);border:3px solid var(--white);display:block}
/* mobile: 老師最大，學生依序縮小，左→右排列 */
.hv-teacher img{width:80px;height:80px;border-width:4px}
.hv-s1 img,.hv-s2 img,.hv-s3 img{width:60px;height:60px}
/* pop-in 結束後接浮動循環（delay = pop delay + pop duration） */
.hv-teacher{animation:avatarPop .6s 1.6s cubic-bezier(.34,1.56,.64,1) forwards,avFloat 3.2s 2.2s ease-in-out infinite}
.hv-teacher-bubble{position:absolute;top:50%;right:calc(100% + 14px);transform:translateY(-50%);background:var(--white);border-radius:14px;padding:10px 14px;font-size:.9rem;line-height:1.6;color:var(--text-body);box-shadow:0 4px 16px rgba(0,0,0,.14);white-space:nowrap;opacity:0;animation:bubblePop .4s 2.8s cubic-bezier(.34,1.56,.64,1) forwards}
.hv-teacher-bubble::after{content:'';position:absolute;top:50%;right:-8px;transform:translateY(-50%);border:8px solid transparent;border-left-color:var(--white);border-right:none}
@keyframes bubblePop{from{opacity:0;transform:scale(.7) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}
.hv-s1{animation:avatarPop .5s 2.2s cubic-bezier(.34,1.56,.64,1) forwards,avFloat 3.6s 2.7s ease-in-out infinite}
.hv-s2{animation:avatarPop .5s 2.6s cubic-bezier(.34,1.56,.64,1) forwards,avFloat 2.8s 3.1s ease-in-out infinite}
.hv-s3{animation:avatarPop .5s 3.0s cubic-bezier(.34,1.56,.64,1) forwards,avFloat 3.4s 3.5s ease-in-out infinite}
/* desktop: 絕對定位覆寫 */
@media (min-width:980px){
  .hv-teacher img{width:130px;height:130px}
  .hv-s1 img,.hv-s2 img,.hv-s3 img{width:80px;height:80px}
  .hv-teacher{right:-24px;bottom:-48px}
  .hv-s1{left:-52px;top:-8px}
  .hv-s2{left:-18px;top:52px}
  .hv-s3{left:-56px;top:106px}
}
section{padding-block:clamp(64px,8vw,112px)}
.sec-head{display:grid;gap:12px;max-width:46em;margin-bottom:48px}
.sec-head.center{margin-inline:auto;text-align:center;justify-items:center}
.white-band{background:var(--white)}
.pillars{padding-block:clamp(120px,14vw,200px);position:relative;overflow-x:clip;overflow-y:visible}
.pillar-grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr));position:relative;z-index:1}
.pillars .sec-head{position:relative;z-index:1;margin-bottom:48px}
.shape-bg{position:absolute;inset:0;pointer-events:none;z-index:0;overflow:visible}
.sh{position:absolute}
.sh svg{width:100%;height:100%;display:block}
@keyframes shFloat1{0%,100%{transform:rotate(-8deg) translateY(0)}50%{transform:rotate(-8deg) translateY(-14px)}}
@keyframes shFloat2{0%,100%{transform:rotate(5deg) translateY(0)}50%{transform:rotate(5deg) translateY(12px)}}
@keyframes shFloat3{0%,100%{transform:rotate(-3deg) translateY(0)}50%{transform:rotate(-3deg) translateY(-10px)}}
@keyframes shFloat4{0%,100%{transform:rotate(10deg) translateY(0)}50%{transform:rotate(10deg) translateY(16px)}}
@keyframes shFloat5{0%,100%{transform:rotate(-12deg) translateY(0)}50%{transform:rotate(-12deg) translateY(-8px)}}
.pillar{background:var(--white);border:1px solid var(--bg-gray);border-radius:24px;padding:28px 26px;display:grid;gap:12px;align-content:start;box-shadow:0 24px 50px -38px rgba(13,48,54,.3);transition:transform .4s ease,box-shadow .4s ease}
.pillar .ic{width:48px;height:48px;border-radius:14px;background:var(--primary-palest);display:grid;place-items:center;color:var(--primary-darker)}
.pillar h3{font-size:var(--s2);color:var(--primary-darker)}
.pillar p{color:var(--text-muted)}
@media (min-width:760px){
  .pillar-grid{grid-template-columns:repeat(3,1fr);gap:24px}
}
.pain-section{background:var(--bg-dark);padding-block:clamp(80px,10vw,140px);position:relative;z-index:4}
body::after{content:'';position:fixed;inset:0;background:var(--bg-dark);opacity:0;pointer-events:none;transition:opacity .5s ease;z-index:3}
html.dark-nav body::after{opacity:1}
.pain-intro{text-align:center;margin-bottom:clamp(48px,7vw,88px)}
.pain-intro h2{font-size:clamp(2rem,4.2vw,3.6rem);color:var(--white);line-height:1.25;text-wrap:balance}
.pain-intro h2 em{color:var(--primary-lighter);font-style:normal}
.chat-grid{display:grid;gap:40px}
@media (min-width:900px){.chat-grid{grid-template-columns:1fr 1fr;align-items:center}}
.line-thread{background:#E9EEF1;border-radius:24px;padding:20px;display:grid;gap:10px;font-size:var(--s-1)}
.bubble{background:var(--white);border-radius:16px 16px 16px 4px;padding:10px 14px;max-width:88%}
.bubble small{display:block;color:var(--text-muted);font-size:.72rem}
.bubble.me{justify-self:end;background:#C9F2D0;border-radius:16px 16px 4px 16px}
.bubble.fade{opacity:.45}
@keyframes bubbleIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
@keyframes bubblePop{0%{opacity:0;transform:scale(.82) translateY(10px)}65%{transform:scale(1.07) translateY(0)}100%{opacity:1;transform:scale(1) translateY(0)}}
.line-thread.chat-anim .bubble{opacity:0}
.line-thread.chat-anim.started .bubble:nth-child(1){animation:bubbleIn .4s .1s ease forwards}
.line-thread.chat-anim.started .bubble:nth-child(2){animation:bubbleIn .4s .6s ease forwards}
.line-thread.chat-anim.started .bubble:nth-child(3){animation:bubbleIn .4s 1.1s ease forwards}
.line-thread.chat-anim.started .bubble:nth-child(4){animation:bubbleIn .4s 1.6s ease forwards}
.line-thread.chat-anim.started .bubble.me{animation:bubblePop .55s 2.2s cubic-bezier(.34,1.56,.64,1) forwards}
.pains{list-style:none;margin:0;padding:0;display:grid;gap:22px}
.pains li{display:grid;grid-template-columns:44px 1fr;gap:14px;align-items:start}
.pains .ic{width:44px;height:44px;border-radius:14px;background:rgba(255,255,255,.1);display:grid;place-items:center;color:var(--primary-lighter)}
.pains h3{font-size:var(--s1);color:var(--white)}
.pains p{color:rgba(255,255,255,.65)}
.quote{margin-top:30px;padding:20px 22px;border-radius:18px;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.12);font-size:var(--s1);color:rgba(255,255,255,.9);font-weight:500}
.quote cite{display:block;margin-top:8px;font:400 var(--s-1) var(--f-body);color:rgba(255,255,255,.45)}
.quote-note{display:block;margin-top:6px;font:400 .72rem/1.5 var(--f-body);color:rgba(255,255,255,.3)}
/* sec-head inside pain-section */
.pain-section .sec-head .eyebrow{color:var(--primary-lighter)}
.pain-section .sec-head .h2{color:var(--white)}
.case-band{background:var(--primary-palest)}
.uc-tabs-wrap{margin-bottom:28px;overflow-x:auto;-ms-overflow-style:none;scrollbar-width:none;display:flex;justify-content:center}
.uc-tabs-wrap::-webkit-scrollbar{display:none}
.uc-tabs-nav{display:inline-flex;gap:6px;padding:4px;border-radius:999px;background:var(--mint-chip);white-space:nowrap}
.uc-tab-btn{padding:8px 20px;border:0;border-radius:999px;background:var(--white);color:var(--primary-darker);font:600 var(--s-1) var(--f-body);cursor:pointer;white-space:nowrap;transition:background .15s,color .15s;min-height:36px}
.uc-tab-btn[aria-selected="true"]{background:var(--bg-dark);color:var(--white)}
.uc-tab-btn:focus-visible{outline:2px solid var(--primary-base);outline-offset:2px}
.case-panel{display:grid;gap:32px;background:var(--white);border-radius:24px;padding:clamp(20px,4vw,44px);box-shadow:0 24px 50px -34px rgba(13,48,54,.3)}.case-panel[hidden]{display:none}
@media (min-width:940px){.case-panel{grid-template-columns:1.1fr 1fr;gap:56px}}
.case-story{display:grid;gap:14px;align-content:start;min-width:0}
.case-for{font-size:var(--s-1);color:var(--primary-darker);font-weight:600}
.case-story h3{font-size:var(--s2);color:var(--primary-darker)}
.case-story>p:not(.case-for):not(.case-value){color:var(--text-muted)}
.case-ex{display:grid;gap:4px;padding:16px 18px;border-radius:16px;border:1px dashed var(--primary-lighter);background:var(--page)}
.case-ex-label{font-size:.72rem;font-weight:600;letter-spacing:.06em;color:var(--tips-text)}
.case-ex strong{font-size:var(--s0);color:var(--bg-dark)}
.case-ex small{font-size:.8rem;color:var(--text-dark)}
.case-ex p{font-size:.85rem;color:var(--text-muted)}
.case-value{font-size:var(--s-1);font-weight:600;color:var(--primary-darker);border-left:3px solid var(--primary-base);padding-left:12px;margin-top:4px}
.ticks{list-style:none;margin:4px 0 0;padding:0;display:grid;gap:10px}
.ticks li{display:grid;grid-template-columns:auto 1fr;gap:10px;align-items:start;color:var(--bg-dark)}
.ticks li::before{content:"";flex:none;width:16px;height:16px;border-radius:50%;background:var(--primary-base) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 8.2l2.3 2.3 4.7-4.8' stroke='white' stroke-width='1.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/contain no-repeat;margin-top:3px}
.ticks li strong{display:block;font-size:var(--s-1);margin-bottom:1px}
.ticks li small{display:block;font-size:.8rem;color:var(--text-muted);font-weight:400}
.uc-visual{background:var(--white);border:1px solid var(--bg-gray);border-radius:20px;padding:18px;min-width:0;box-shadow:0 12px 32px -12px rgba(13,48,54,.18);align-self:start}
.uc-mock-bar{display:flex;align-items:center;gap:8px;padding-bottom:12px;border-bottom:1px solid var(--bg-gray);margin-bottom:14px}
.uc-mock-bar .dot{width:8px;height:8px;border-radius:50%;background:var(--bg-gray)}
.uc-mock-title{font-size:.82rem;font-weight:700;color:var(--bg-dark);flex:1}
.uc-mock-badge{font-size:.68rem;padding:2px 10px;border-radius:999px;background:var(--primary-palest);color:var(--primary-darker);font-weight:600}
.uc-task-row{display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid var(--bg-gray)}
.uc-task-row:last-child{border-bottom:0;padding-bottom:0}
.uc-task-num{width:20px;height:20px;border-radius:50%;background:var(--primary-palest);color:var(--primary-darker);font-size:.68rem;font-weight:700;display:grid;place-items:center;flex:none;margin-top:1px}
.uc-task-label{font-size:.8rem;color:var(--bg-dark);flex:1}
.uc-task-label small{display:block;color:var(--text-muted);font-size:.7rem;margin-top:2px}
.uc-task-prog{font-size:.7rem;color:var(--text-muted);white-space:nowrap;text-align:right}
.uc-task-prog b{color:var(--primary-darker);display:block;font-size:.8rem}
.uc-checkin-card{border:1px solid var(--bg-gray);border-radius:12px;padding:12px;margin-bottom:8px}
.uc-checkin-card:last-child{margin-bottom:0}
.uc-checkin-meta{display:flex;align-items:center;gap:8px;margin-bottom:6px}
.uc-avatar{width:26px;height:26px;border-radius:50%;background:var(--primary-palest);display:grid;place-items:center;font:700 .68rem var(--f-body);color:var(--primary-darker);flex:none}
.uc-checkin-name{font-size:.78rem;font-weight:600;color:var(--bg-dark)}
.uc-checkin-date{font-size:.68rem;color:var(--text-muted);margin-left:auto}
.uc-checkin-text{font-size:.76rem;color:var(--text-dark);overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;line-height:1.5}
.uc-checkin-tag{display:inline-block;font-size:.66rem;padding:2px 8px;border-radius:999px;background:var(--mint-chip);color:var(--mint-chip-text);margin-top:5px}
.uc-stage-row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--bg-gray)}
.uc-stage-row:last-child{border-bottom:0;padding-bottom:0}
.uc-stage-dot{width:10px;height:10px;border-radius:50%;flex:none}
.uc-stage-dot.done{background:var(--primary-base)}
.uc-stage-dot.now{background:var(--logo-orange,#FF6E0B)}
.uc-stage-dot.pending{background:var(--bg-gray)}
.uc-stage-label{font-size:.8rem;color:var(--bg-dark);flex:1}
.uc-stage-label small{display:block;color:var(--text-muted);font-size:.7rem}
.uc-stage-status{font-size:.7rem;font-weight:600}
.uc-stage-status.done{color:var(--primary-darker)}
.uc-stage-status.now{color:#FF6E0B}
.uc-stage-status.pending{color:var(--text-muted)}
.steps{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr))}
.step{background:var(--white);border:1px solid var(--bg-gray);border-radius:20px;padding:24px;display:grid;gap:10px;align-content:start}
.step .n{width:36px;height:36px;border-radius:50%;background:var(--primary-base);color:var(--white);display:grid;place-items:center;font:700 1rem var(--f-mono)}
.step h3{font-size:var(--s1)}
.step p{color:var(--text-muted);font-size:var(--s-1)}
.features{display:grid;gap:clamp(72px,8vw,112px)}
.feature{display:grid;gap:32px;align-items:center}
@media (min-width:940px){.feature{grid-template-columns:1fr 1.1fr;gap:72px}.feature.flip .copy{order:2}}
.feature .copy{display:grid;gap:14px;min-width:0}
.feature h3{font-size:var(--s2);color:var(--primary-darker)}
.feature .copy>p{color:var(--text-muted);max-width:32em}
.q-tag{display:inline-block;width:fit-content;font-size:var(--s-1);padding:4px 14px;border-radius:999px;background:var(--mint-chip);color:var(--mint-chip-text);font-weight:600}
.mock{background:var(--white);border:1px solid var(--bg-gray);border-radius:20px;padding:20px;min-width:0;box-shadow:0 24px 50px -34px rgba(13,48,54,.3)}
.mood{display:grid;gap:8px}
.mood div{display:grid;grid-template-columns:4.5em 2em 1fr;gap:8px;align-items:center;font-size:.8rem}
.mood span.bar{height:8px;border-radius:8px;background:var(--heat-empty);overflow:hidden}
.mood span.bar i{display:block;height:100%;background:var(--primary-base);border-radius:8px}
.hours{display:flex;align-items:flex-end;gap:8px;height:110px;padding-top:16px}
.hours div{flex:1;display:grid;justify-items:center;gap:4px;font-size:.68rem;color:var(--text-muted)}
.hours i{width:100%;max-width:28px;background:var(--primary-base);border-radius:6px 6px 2px 2px}
.tags{display:flex;flex-wrap:wrap;gap:6px}
.tags span{font-size:.75rem;padding:3px 10px;border-radius:999px;background:var(--mint-chip);color:var(--mint-chip-text)}
.split{display:grid;gap:14px}
@media (min-width:520px){.split{grid-template-columns:1.25fr 1fr}}
.card-lite{border:1px solid var(--bg-gray);border-radius:14px;padding:14px;min-width:0}
.card-lite h4{margin:0 0 2px;font-size:.85rem}
.card-lite small{display:block;font-size:.72rem;color:var(--text-muted);margin-bottom:10px}
.pill-tabs{display:inline-flex;padding:4px;border-radius:999px;background:var(--mint-chip);gap:4px}
.pill-tabs button{min-height:36px;padding:0 18px;border:0;border-radius:999px;background:transparent;color:var(--mint-chip-text);font:600 var(--s-1) var(--f-body);cursor:pointer}
.pill-tabs button[aria-selected="true"]{background:var(--bg-dark);color:var(--white)}
.focus-hint{font-size:.8rem;color:var(--text-muted);margin:12px 0}
.tbl-wrap{overflow-x:auto;border:1px solid var(--bg-gray);border-radius:14px}
.tbl{border-collapse:collapse;width:100%;min-width:520px;font-size:.8rem}
.tbl th,.tbl td{padding:10px 12px;text-align:left;border-bottom:1px solid var(--bg-gray);white-space:nowrap}
.tbl tr:last-child td{border-bottom:0}
.tbl th{font-weight:500;color:var(--text-muted);background:var(--very-light-gray)}
.tbl .link{color:var(--primary-darker);text-decoration:underline;text-underline-offset:3px}
.tbl .days{color:var(--tips-text);font-weight:600}
.tbl .moment{white-space:normal;min-width:180px}
.mini-btn{font:600 .72rem var(--f-body);padding:5px 12px;border-radius:999px;border:1px solid var(--primary-base);background:var(--white);color:var(--primary-darker)}
.mini-btn.solid{background:var(--primary-base);color:var(--white)}
.compose{margin-top:14px;border:1px solid var(--bg-gray);border-radius:14px;padding:14px;background:var(--page);display:grid;gap:8px}
.compose .to{font-size:.82rem;font-weight:600}
.compose .tpl{display:flex;gap:6px;flex-wrap:wrap;font-size:.72rem}
.compose .tpl span{padding:3px 10px;border-radius:999px;border:1px solid var(--bg-gray);background:var(--white);color:var(--text-muted)}
.compose .tpl span.on{border-color:var(--primary-base);color:var(--primary-darker)}
.compose p{font-size:.82rem;background:var(--white);border:1px solid var(--bg-gray);border-radius:10px;padding:10px 12px}
.stance{background:var(--bg-dark);color:var(--white);border-radius:32px;padding:clamp(32px,5vw,64px);display:grid;gap:36px}
@media (min-width:900px){.stance{grid-template-columns:1fr 1.1fr;align-items:center}}
.stance .h2{color:var(--white)}
.stance p{color:#C4D6D8}
.stance .eyebrow{color:var(--primary-lighter)}
.nots{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(min(100%,200px),1fr))}
.nots div{border:1px solid rgba(255,255,255,.16);border-radius:16px;padding:14px 16px;font-size:var(--s-1)}
.nots s{color:#8FA8AB;text-decoration-thickness:1.5px}
.nots b{display:block;color:var(--white);font-weight:600;margin-top:4px}
.pilot{display:grid;gap:40px}
@media (min-width:920px){.pilot{grid-template-columns:1fr 1fr;align-items:start}}
.plist{list-style:none;padding:0;margin:24px 0 0;display:grid;gap:18px}
.plist li{display:grid;grid-template-columns:64px 1fr;gap:14px;align-items:baseline}
.plist .k{font-size:.8rem;font-weight:700;color:var(--primary-base)}
form{background:var(--white);border:1px solid var(--bg-gray);border-radius:24px;padding:clamp(20px,3vw,32px);display:grid;gap:16px;box-shadow:0 24px 50px -34px rgba(13,48,54,.3)}
label{display:grid;gap:6px;font-size:var(--s-1);font-weight:500;color:var(--bg-dark)}
input,select,textarea{font:400 var(--s0) var(--f-body);color:var(--bg-dark);background:var(--white);border:1px solid var(--bg-gray);border-radius:12px;padding:10px 14px;min-height:48px;width:100%}
textarea{min-height:96px;resize:vertical}
input:focus,select:focus,textarea:focus{outline:2px solid var(--primary-base);outline-offset:0;border-color:var(--primary-base)}
.hint{font-weight:400;color:var(--text-muted);font-size:.78rem}
.form-msg{font-size:var(--s-1);padding:12px 14px;border-radius:12px;background:var(--primary-palest);color:var(--primary-darker)}
.faq{display:grid;gap:10px;max-width:54em;margin-inline:auto}
details{background:var(--white);border:1px solid var(--bg-gray);border-radius:16px;padding:0 22px}
details[open]{border-color:var(--primary-lightest)}
summary{cursor:pointer;list-style:none;padding:18px 0;font-weight:600;color:var(--bg-dark);display:flex;justify-content:space-between;gap:16px;align-items:center;min-height:52px}
summary::-webkit-details-marker{display:none}
summary::after{content:"";flex:none;width:24px;height:24px;border-radius:50%;background:var(--primary-palest) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M8 10l4 4 4-4' stroke='%230D7A77' stroke-width='2' fill='none' stroke-linecap='round'/%3E%3C/svg%3E") center/18px no-repeat;transition:transform .2s}
details[open] summary::after{transform:rotate(180deg)}
details p{padding-bottom:20px;color:var(--text-muted)}
.closing{position:relative;overflow:hidden;background:linear-gradient(180deg,var(--page),#DDF3F6)}
.closing .wrap{display:grid;gap:22px;justify-items:center;text-align:center}
.closing h2{font-size:var(--s3);color:var(--primary-darker);max-width:18em}
.page-cta{background:var(--white);text-align:center}
.page-cta .wrap{display:grid;gap:16px;justify-items:center;padding-block:clamp(56px,7vw,96px)}
footer{background:#1A3A40;color:rgba(255,255,255,.7);padding-block:48px 80px;font-size:var(--s-1)}
@media(min-width:760px){footer{padding-bottom:48px}}
footer .wrap{max-width:1200px;margin-inline:auto;padding-inline:clamp(16px,5vw,48px)}
.ft-top{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:32px}
.ft-logo{width:142px;display:block;margin-bottom:8px}
.ft-tagline{color:rgba(255,255,255,.8);font-size:.875rem}
.ft-cols{display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px}
@media(min-width:760px){.ft-cols{grid-template-columns:1fr 1fr 1fr}}
.ft-col-title{color:#7DD3CA;font-size:1rem;margin-bottom:12px}
.ft-col a{display:block;color:rgba(255,255,255,.7);text-decoration:none;margin-bottom:8px;transition:color .2s}
.ft-col a:hover{color:#16B9B3}
.ft-newsletter input{width:100%;box-sizing:border-box;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:8px 14px;color:#fff;font-size:.875rem;margin-bottom:10px;outline:none}
.ft-newsletter input::placeholder{color:rgba(255,255,255,.5)}
.ft-newsletter button{width:100%;background:#FFA10B;color:#fff;border:none;border-radius:8px;padding:10px;font-size:.875rem;font-weight:600;cursor:pointer}
.ft-social{margin-bottom:32px}
.ft-social-title{color:#7DD3CA;font-size:1rem;margin-bottom:12px}
.ft-social-links{display:flex;gap:16px}
.ft-social-links img{width:36px;height:35px}
.ft-copy{text-align:center;color:#8AA8AD;font-size:.8rem}
.version-badge{position:fixed;bottom:max(16px,env(safe-area-inset-bottom,0px));right:16px;z-index:100;font:600 .72rem var(--f-mono);padding:4px 10px;border-radius:999px;background:var(--bg-dark);color:var(--primary-lighter);opacity:.75}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
@keyframes fadeUp{from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)}}
.reveal{opacity:0;transform:translateY(32px)}
.reveal.visible{animation:fadeUp .6s cubic-bezier(.22,.61,.36,1) forwards}
</style>
</head>
<body>
<span class="version-badge">v2 · 2026-11-07</span>
<header class="nav">
  <div class="wrap">
    <a class="nav-logo" href="#" data-goto="home" aria-label="島島阿學 首頁"><img src="/assets/landing-page/logo-simple.svg" alt="島島阿學" width="150" height="44"></a>
    <nav class="nav-links" aria-label="頁面導覽">
      <a href="#" data-page-link="home" data-goto="home">解決方案</a>
      <a href="#tutorial" data-page-link="tutorial">使用教學</a>
    </nav>
    <div class="nav-right">
      <a class="btn btn-orange btn-sm" data-goto="home#pilot" href="#">申請免費試用</a>
    </div>
  </div>
</header>
<div data-page="home">
<main>
  <div class="hero">
    <div class="hero-shapes" aria-hidden="true">
      <img src="/assets/landing-page/bg-desktop.svg" alt="" width="1440" height="640">
    </div>
    <div class="wrap">
      <div class="hero-copy">
        <p class="eyebrow">給每一位用心陪伴學員的導師</p>
        <h1>讓每一次陪伴，<span>都成為成長的延續。</span></h1>
        <p class="lede">從學員的實踐紀錄、回饋到參與進度，讓每一段成長都有跡可循，每一次引導都能接續前進。</p>
        <div class="cta-row">
          <a class="btn btn-orange btn-huge" href="#tutorial">申請免費試用 →</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hv-avatars" aria-hidden="true">
          <div class="hv-av hv-teacher"><img src="/assets/landing-page/teacher.webp" alt="帶班老師" width="92" height="92"><div class="hv-teacher-bubble"><span style="display:block;font-size:.65rem;color:var(--text-muted);margin-bottom:3px">導師</span>不用一直翻訊息，也能清楚看見<br>每位學員的進度和近況！</div></div>
          <div class="hv-av hv-s1"><img src="/assets/landing-page/person-1.webp" alt="學員" width="60" height="60"></div>
          <div class="hv-av hv-s2"><img src="/assets/landing-page/person-2.webp" alt="學員" width="60" height="60"></div>
          <div class="hv-av hv-s3"><img src="/assets/landing-page/person-3.webp" alt="學員" width="60" height="60"></div>
        </div>
        <div class="frame" role="img" aria-label="燈塔今日焦點示意">
          <div class="frame-top"><strong>信念改寫陪跑營 · 第 3 梯</strong></div>
          <div class="tabs" aria-hidden="true"><span class="tab">儀表板</span><span class="tab">名單</span><span class="tab on">今日焦點</span><span class="tab">動態</span></div>
          <span class="focus-label" aria-hidden="true">查看近期紀錄，決定是否主動關心</span>
          <div class="focus-preview" aria-hidden="true">
            <div class="focus-row fr-anim-1"><div><div class="name">晴</div><div style="font-size:.72rem;color:var(--text-muted)">每日覺察 21 天</div></div><div style="display:flex;align-items:center;gap:8px"><span class="days">4 天前打卡</span><span class="act">查看紀錄</span></div></div>
            <div class="focus-row fr-anim-2"><div><div class="name">庭</div><div style="font-size:.72rem;color:var(--text-muted)">信念改寫練習</div></div><div style="display:flex;align-items:center;gap:8px"><span class="days">6 天前打卡</span><span class="act">查看紀錄</span></div></div>
            <div class="focus-row fr-anim-3" style="border-color:var(--primary-lightest);background:var(--primary-palest)"><div><div class="name">小安</div><div style="font-size:.72rem;color:var(--text-muted)">信念改寫練習 · 今天打卡了</div></div><div style="display:flex;align-items:center;gap:8px"><span style="font-size:.72rem;font-weight:600;color:var(--mint-chip-text)">值得慶祝</span><span class="act" style="background:var(--bg-dark)">送出訊息</span></div></div>
          </div>
          <div style="padding:0 18px 16px;font-size:.72rem;color:var(--light-gray)">使用情境示意</div>
        </div>
      </div>
    </div>
  </div>
  <section id="pain-section" class="pain-section" aria-labelledby="p-title">
    <div class="wrap">
      <div class="pain-intro"><h2>這是你的<em>帶班日常</em>嗎？</h2></div>
    <div class="chat-grid">
      <div>
        <div class="sec-head"><p class="eyebrow">現在的陪跑日常</p><h2 id="p-title" class="h2">打卡其實有在寫，只是找不到</h2></div>
        <div class="line-thread chat-anim" aria-label="LINE 群組對話示意">
          <div class="bubble fade"><small>小安 · 週一 22:41</small>Day 3 覺察：今天注意到我在會議裡又先道歉了…</div>
          <div class="bubble fade"><small>宇 · 週一 23:02</small>（貼圖）</div>
          <div class="bubble fade"><small>婷 · 週二 07:15</small>早安大家！今天也要加油</div>
          <div class="bubble"><small>涵 · 週二 12:30</small>老師，我昨天的覺察有傳在上面，不知道你有沒有看到？</div>
          <div class="bubble me"><small>你 · 週二 21:10</small>有！我往上滑找一下</div>
        </div>
      </div>
      <div>
        <ul class="pains">
          <li><span class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h10M4 18h6"/></svg></span><div><h3>打卡紀錄難找</h3><p>對話一多，上週誰寫了什麼、你回了什麼，就只能往上滑。重要的打卡被聊天沖掉，回饋也難接續。</p></div></li>
          <li><span class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><div><h3>回饋難接續</h3><p>每次對話前，你想了解參與者的近況，卻要在不同地方翻找：LINE 群、自己的筆記，有時直接問對方。</p></div></li>
          <li><span class="ic"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M3 12h4l3-8 4 16 3-8h4"/></svg></span><div><h3>近況不易掌握</h3><p>好一陣子沒有動靜的參與者，你不確定他是怎麼了。打卡量看不出全貌，但也沒有其他依據。</p></div></li>
        </ul>
        <blockquote class="quote">「課程結束後大家都回 LINE 群了，我一直鼓勵他們分享，但我其實不知道誰還在練習。」<cite>一位帶高敏內耗陪跑營的生命教練<span class="quote-note">情境示例</span></cite></blockquote>
      </div>
    </div>
    <div style="margin-top:48px;padding-top:40px;border-top:1px solid rgba(255,255,255,.12);text-align:center">
      <p style="font-size:clamp(2rem,4.2vw,3.6rem);font-weight:700;color:var(--white);line-height:1.25;margin:0 0 12px">完整關注一整梯每個參與者的行動</p>
      <p style="font-size:1.1rem;color:rgba(255,255,255,.55);line-height:1.6;margin:0">不只看見誰完成了任務，也能留意誰暫時停下腳步</p>
    </div>
    </div>
  </section>
  <section class="pillars" aria-labelledby="v-title">
    <div class="shape-bg" aria-hidden="true">
      <!-- circle teal — left edge -->
      <div class="sh" style="width:280px;height:280px;left:-60px;top:50%;transform:translateY(-50%);animation:shFloat1 8s ease-in-out infinite">
        <svg viewBox="0 0 212 212" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="106" cy="106" r="106" fill="#16B9B3"/></svg>
      </div>
      <!-- clipped-circle orange — right edge, lower -->
      <div class="sh" style="width:260px;height:258px;right:-80px;bottom:10%;opacity:0.2;animation:shFloat2 10s ease-in-out infinite">
        <svg viewBox="0 0 212 211" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M202.036 211H106C47.4583 211 0 163.766 0 105.5C0 47.2344 47.4583 0 106 0C164.542 0 212 47.2344 212 105.5V201.083C212 206.56 207.539 211 202.036 211Z" fill="#FF6E0B"/></svg>
      </div>
      <!-- speech-bubble — right of title -->
      <div class="sh" style="width:180px;height:121px;right:12%;top:22%;animation:shFloat3 9s 1s ease-in-out infinite">
        <svg viewBox="0 0 260 175" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M193.53 0C230.215 4.05998e-06 259.999 29.8999 259.999 66.7295C259.999 103.558 230.215 133.457 193.53 133.457H108.513C108.335 133.726 108.12 133.983 107.863 134.221C96.0973 145.105 73.7555 165.774 65.2812 173.615C64.695 174.159 63.844 174.302 63.1084 173.979C62.3845 173.658 61.9025 172.932 61.9023 172.131V133.3C27.3436 130.941 8.38303e-05 102.017 0 66.7295C0 29.9 29.7829 0.000263456 66.4678 0H193.53Z" fill="#FFA10B"/></svg>
      </div>
      <!-- hexagon cyan — right edge bottom -->
      <div class="sh" style="width:200px;height:228px;right:-60px;bottom:-40px;animation:shFloat4 11s 0.5s ease-in-out infinite">
        <svg viewBox="0 0 197 225" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M94.513 1.06805C96.985 -0.356045 100.028 -0.355954 102.5 1.06828L192.994 53.2075C195.473 54.6356 197 57.2786 197 60.1392V164.393C197 167.254 195.473 169.896 192.994 171.325L102.5 223.466C100.028 224.891 96.9849 224.891 94.5128 223.466L4.00643 171.324C1.5276 169.896 0 167.253 0 164.393V60.1396C0 57.2787 1.52766 54.6356 4.00657 53.2076L94.513 1.06805Z" fill="#4BE8FF"/></svg>
      </div>
      <!-- semi-circle yellow — bottom left -->
      <div class="sh" style="width:260px;height:134px;left:8%;bottom:-50px;animation:shFloat5 12s 2s ease-in-out infinite">
        <svg viewBox="0 0 268 138" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clip-rule="evenodd" d="M267.262 129.973C267.507 134.384 263.901 137.973 259.483 137.973H7.79054C3.37226 137.973 -0.232875 134.384 0.0118151 129.973C4.03177 57.4971 62.3189 0 133.637 0C204.955 0 263.242 57.4971 267.262 129.973Z" fill="#F9E41C"/></svg>
      </div>
    </div>
    <div class="wrap">
      <div class="sec-head center"><p class="eyebrow">為每一段用心的陪跑，提供剛剛好的支持</p><h2 id="v-title" class="h2">從看見進展，到持續陪伴</h2></div>
      <div class="pillar-grid">
        <div class="pillar"><span class="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="3" width="13" height="18" rx="2"/><path d="M4 7h3M4 12h3M4 17h3M10 8h5M10 12h5"/></svg></span><h3>找得到紀錄</h3><p>學員的打卡與實踐心得集中保存，不再被 LINE 訊息淹沒。誰做了什麼、遇到哪些困難，都有跡可循。</p></div>
        <div class="pillar"><span class="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h10v7H8l-4 3z"/><path d="M14 8h6v8l-3-2h-6v-3"/></svg></span><h3>接得上回饋</h3><p>隨時回顧學員先前的實踐與心得，不必每次交流都重新了解近況，讓每一次回饋都能接續上一次的成長。</p></div>
        <div class="pillar"><span class="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 19v-4M12 19V10M18 19V5"/></svg></span><h3>看得見參與</h3><p>透過打卡紀錄與實踐進度，掌握學員的投入情況。留意誰持續前進、誰暫時停下腳步，讓支持更有方向。</p></div>
      </div>
    </div>
  </section>
  <section class="case-band" aria-labelledby="uc-title">
    <div class="wrap">
      <div class="sec-head center"><h2 id="uc-title" class="h2">不只帶領學習，更陪伴實踐發生</h2><p class="lede">從實作課程、團體陪跑到工作坊後續行動，讓每一種學習活動，都能延續課堂之外的成長。</p></div>
      <div class="uc-tabs-wrap">
        <div class="uc-tabs-nav" role="tablist" aria-label="使用案例頁籤">
          <button class="uc-tab-btn" id="uc-tab-1" role="tab" aria-selected="true" aria-controls="uc-panel-1">班制實作課程</button>
          <button class="uc-tab-btn" id="uc-tab-2" role="tab" aria-selected="false" aria-controls="uc-panel-2">團體教練與陪跑計畫</button>
          <button class="uc-tab-btn" id="uc-tab-3" role="tab" aria-selected="false" aria-controls="uc-panel-3">工作坊後續實踐計畫</button>
        </div>
      </div>
      <!-- Panel 1 -->
      <div class="case-panel" id="uc-panel-1" role="tabpanel" aria-labelledby="uc-tab-1">
        <div class="case-story">
          <p class="case-for">實作班・訓練營・企業包班</p>
          <h3>讓每一堂課的學習，都能累積成看得見的成果</h3>
          <ul class="ticks">
            <li><div><strong>安排實作任務</strong><small>依照課程節奏安排每階段的練習，讓學員知道下一步可以做什麼。</small></div></li>
            <li><div><strong>掌握學員進度</strong><small>透過學員的實踐紀錄，了解參與情形與遇到的困難。</small></div></li>
            <li><div><strong>累積成果與回饋</strong><small>整理每次練習的發現，作為導師回饋及成果分享的依據。</small></div></li>
          </ul>
        </div>
        <div class="uc-visual" aria-hidden="true">
          <div class="case-ex" style="margin-bottom:14px"><span class="case-ex-label">情境範例</span><strong>21 天 AI 工作應用實作班</strong></div>
          <div class="uc-mock-bar"><span class="dot"></span><span class="dot"></span><span class="uc-mock-title">課程任務進度</span><span class="uc-mock-badge">第 2 週 / 共 3 週</span></div>
          <div class="uc-task-row"><span class="uc-task-num">1</span><div class="uc-task-label"><strong style="font-size:.82rem">用 AI 工具整理一份工作筆記</strong><small>截止 11/10・第一週任務</small></div><div class="uc-task-prog"><b style="color:var(--primary-darker)">18 / 20</b><span>已完成</span></div></div>
          <div class="uc-task-row"><span class="uc-task-num" style="background:var(--logo-orange,#FF6E0B);color:white">2</span><div class="uc-task-label"><strong style="font-size:.82rem">設計一個 AI 輔助的工作流程</strong><small>截止 11/17・進行中</small></div><div class="uc-task-prog"><b style="color:#FF6E0B">9 / 20</b><span>進行中</span></div></div>
          <div class="uc-task-row"><span class="uc-task-num" style="background:var(--bg-gray);color:var(--text-muted)">3</span><div class="uc-task-label"><strong style="font-size:.82rem;color:var(--text-muted)">分享一個實際應用的案例</strong><small>截止 11/24・尚未開始</small></div><div class="uc-task-prog"><b style="color:var(--text-muted)">─</b><span>待開始</span></div></div>
        </div>
      </div>
      <!-- Panel 2 -->
      <div class="case-panel" id="uc-panel-2" role="tabpanel" aria-labelledby="uc-tab-2" hidden>
        <div class="case-story">
          <p class="case-for">團體教練・學習陪跑・成長計畫</p>
          <h3>每一次會談之間，也能持續陪伴學員前進</h3>
          <p>陪跑的價值，不只在定期會談的那一小時。透過實踐紀錄與反思分享，你可以持續了解學員的行動與變化，在下一次會談前掌握需要討論的重點，讓支持更貼近每個人的真實需求。</p>
          <ul class="ticks">
            <li><div><strong>建立行動節奏</strong><small>將每週討論的方向轉化成可實踐的小任務，協助學員持續嘗試。</small></div></li>
            <li><div><strong>看見過程中的變化</strong><small>從實踐回報與心得，了解學員的進展、卡關與新發現。</small></div></li>
            <li><div><strong>讓會談更有焦點</strong><small>運用累積的紀錄進行回顧與討論，給予更有脈絡的支持。</small></div></li>
          </ul>
        </div>
        <div class="uc-visual" aria-hidden="true">
          <div class="case-ex" style="margin-bottom:14px"><span class="case-ex-label">情境範例</span><strong>8 週專業成長陪跑計畫</strong></div>
          <div class="uc-mock-bar"><span class="dot"></span><span class="dot"></span><span class="uc-mock-title">近期打卡心得</span><span class="uc-mock-badge">本週 5 人打卡</span></div>
          <div class="uc-checkin-card"><div class="uc-checkin-meta"><span class="uc-avatar">明</span><span class="uc-checkin-name">明宇</span><span class="uc-checkin-date">2 天前</span></div><p class="uc-checkin-text">這週終於開口跟主管說了，沒想到比預期順利。還是很緊張，但說完感覺鬆了一口氣。</p><span class="uc-checkin-tag">#職場溝通</span></div>
          <div class="uc-checkin-card"><div class="uc-checkin-meta"><span class="uc-avatar">雅</span><span class="uc-checkin-name">雅婷</span><span class="uc-checkin-date">3 天前</span></div><p class="uc-checkin-text">卡在要不要換工作這個問題上，試著把想法寫下來，發現自己其實還有很多沒釐清的地方。</p><span class="uc-checkin-tag">#轉職思考</span></div>
        </div>
      </div>
      <!-- Panel 3 -->
      <div class="case-panel" id="uc-panel-3" role="tabpanel" aria-labelledby="uc-tab-3" hidden>
        <div class="case-story">
          <p class="case-for">企業內訓・主題工作坊・培訓活動</p>
          <h3>工作坊結束後，才是學習真正開始的地方</h3>
          <p>一場精彩的工作坊，未必能讓學員回到生活或職場後持續應用。將課堂上的收穫轉化為後續實踐任務，透過定期回報與階段回顧，幫助學員把當下的啟發，逐步帶回真實情境。</p>
          <ul class="ticks">
            <li><div><strong>延伸課後行動</strong><small>將工作坊中的練習延伸為課後任務，讓學員有機會實際應用。</small></div></li>
            <li><div><strong>追蹤實際應用情形</strong><small>透過打卡與心得紀錄，了解學員如何嘗試，以及遇到了哪些問題。</small></div></li>
            <li><div><strong>回顧學習收穫</strong><small>整理實踐過程中的成果與反思，作為後續交流與課程優化的參考。</small></div></li>
          </ul>
        </div>
        <div class="uc-visual" aria-hidden="true">
          <div class="case-ex" style="margin-bottom:14px"><span class="case-ex-label">情境範例</span><strong>AI 工具應用工作坊 ＋ 4 週實踐</strong></div>
          <div class="uc-mock-bar"><span class="dot"></span><span class="dot"></span><span class="uc-mock-title">課後實踐階段</span><span class="uc-mock-badge">AI 工具應用工作坊</span></div>
          <div class="uc-stage-row"><span class="uc-stage-dot done"></span><div class="uc-stage-label"><strong style="font-size:.8rem">工作坊當日</strong><small>11/1・課程與實作練習</small></div><span class="uc-stage-status done">✓ 完成</span></div>
          <div class="uc-stage-row"><span class="uc-stage-dot done"></span><div class="uc-stage-label"><strong style="font-size:.8rem">第 1 週任務</strong><small>11/2–11/8・職場實際應用一次</small></div><span class="uc-stage-status done">22 人完成</span></div>
          <div class="uc-stage-row"><span class="uc-stage-dot now"></span><div class="uc-stage-label"><strong style="font-size:.8rem">第 2 週任務</strong><small>11/9–11/15・分享遇到的問題</small></div><span class="uc-stage-status now">進行中</span></div>
          <div class="uc-stage-row"><span class="uc-stage-dot pending"></span><div class="uc-stage-label"><strong style="font-size:.8rem;color:var(--text-muted)">第 3 週任務</strong><small>11/16–11/22・整理個人應用心得</small></div><span class="uc-stage-status pending">待開始</span></div>
          <div class="uc-stage-row"><span class="uc-stage-dot pending"></span><div class="uc-stage-label"><strong style="font-size:.8rem;color:var(--text-muted)">成果回顧</strong><small>11/23・線上分享會</small></div><span class="uc-stage-status pending">待開始</span></div>
        </div>
      </div>
    </div>
  </section>
  <section aria-labelledby="s-title">
    <div class="wrap"><div class="stance"><div style="display:grid;gap:14px"><p class="eyebrow">我們的堅持</p><h2 id="s-title" class="h2">見證，而不是比較</h2><p>陪跑談的是很私密的改變。我們刻意不把參與者變成分數，因為被比較的人，最先停下來的就是那些最需要被陪伴的人。燈塔只告訴你事實，怎麼陪，由你決定。</p></div><div class="nots"><div><s>排行榜</s><b>每個人照自己的節奏走</b></div><div><s>連續天數</s><b>斷了不用重來</b></div><div><s>掉隊、風險標籤</s><b>只寫「距離上次打卡 4 天」</b></div><div><s>活躍度分數</s><b>只顯示人數，不顯示百分比</b></div></div></div></div>
  </section>
  <section id="pilot" class="white-band" aria-labelledby="pi-title">
    <div class="wrap pilot">
      <div>
        <div class="sec-head" style="margin-bottom:0"><p class="eyebrow">免費試用方案</p><h2 id="pi-title" class="h2">免費試用一整梯，島島陪你一起帶</h2><p class="lede">適合正在籌備下一梯團體陪跑的導師與教練。本季名額有限，試用期間不收費；正式收費前會提前通知。</p></div>
        <ul class="plist"><li><span class="k">開始前</span><div>由島島團隊協助設定系列、場次與行動任務，你專心準備課程內容。</div></li><li><span class="k">陪跑中</span><div>整梯免費使用燈塔、群組聊天與今日焦點。遇到卡關，直接找島島團隊。</div></li><li><span class="k">結業後</span><div>一起回顧儀表板，聽你說哪裡要改。你的意見會直接影響島島接下來做什麼。</div></li></ul>
        <img src="/assets/landing-page/staircase.svg" alt="" aria-hidden="true" style="width:min(280px,100%);margin-top:16px;display:block">
      </div>
      <form id="pilot-form" novalidate>
        <label for="f-name">你的名字或品牌<input id="f-name" name="name" autocomplete="name" required></label>
        <label for="f-contact">Email 或 Threads / IG 帳號<input id="f-contact" name="contact" required></label>
        <label for="f-type">你帶的是<select id="f-type" name="type"><option>團體陪跑營 / 教練課程</option><option>心理或覺察工作坊</option><option>小班實作課程</option><option>其他</option></select></label>
        <label for="f-when">下一梯預計什麼時候開始？<select id="f-when" name="when"><option>一個月內</option><option>1–2 個月內</option><option>3 個月以後</option><option>還沒決定</option></select></label>
        <label for="f-note">想先讓我們知道的事 <span class="hint">選填</span><textarea id="f-note" name="note"></textarea></label>
        <button class="btn btn-orange btn-huge" type="submit">申請免費試用</button>
        <p class="form-msg" id="form-msg" hidden role="status"></p>
      </form>
    </div>
  </section>
  <section aria-labelledby="q-title">
    <div class="wrap">
      <div class="sec-head center"><h2 id="q-title" class="h2">常見問題</h2></div>
      <div class="faq">
        <details><summary>參與者的打卡，誰看得到？</summary><p>打卡只在這個場次裡流通，導師與教練、以及共同管理者可以在燈塔看到全部打卡紀錄。場次要不要出現在探索頁面、要不要開放邀請連結，都由你決定。</p></details>
        <details><summary>島島會幫我替參與者打分數或排名嗎？</summary><p>不會。燈塔只顯示人數與事實，例如「本週有打卡的人數」「距離上次打卡 4 天」。</p></details>
        <details><summary>他們還能繼續用 LINE 嗎？</summary><p>完全沒問題。很多導師在開始時讓 LINE 群繼續放公告，打卡和回饋放進燈塔，慢慢熟悉之後再調整。</p></details>
        <details><summary>課程結束後，聊天室和紀錄會怎樣？</summary><p>群組聊天在課程結束後仍然可以繼續聊，參與者的打卡紀錄也會留著。下一梯是新的場次。</p></details>
        <details><summary>參與者需要另外註冊嗎？</summary><p>需要一個島島帳號。收到邀請信或點邀請連結就能加入，加入後自動進到聊天室。</p></details>
        <details><summary>怎麼收費？</summary><p>試用期間整梯免費，由島島團隊協助設定。正式方案確定後會在開始收費前先通知你。</p></details>
      </div>
    </div>
  </section>
  <section class="closing" aria-labelledby="end-title">
    <div class="wrap">
      <h2 id="end-title">下一梯開始前，先點亮你的燈塔</h2>
      <p class="lede">讓每次對話，都能接得上參與者留下的紀錄。</p>
      <div class="cta-row" style="margin-top:4px;justify-content:center">
        <a class="btn btn-orange btn-huge" data-goto="home#pilot" href="#">申請免費試用</a>
        <a class="btn btn-outline btn-huge" href="#tutorial">看看使用方式</a>
      </div>
    </div>
  </section>
</main>
</div>
<div data-page="tutorial" hidden>
<main>
  <section aria-labelledby="h-title">
    <div class="wrap">
      <div class="sec-head center"><p class="eyebrow">怎麼開始</p><h2 id="h-title" class="h2">三步驟，把下一梯搬進燈塔</h2></div>
      <div class="steps">
        <div class="step"><span class="n">1</span><h3>設定活動與行動任務</h3><p>建立系列與場次，設定日期和互動方式，加入這一梯要練的行動任務。</p></div>
        <div class="step"><span class="n">2</span><h3>邀請參與者加入</h3><p>貼上 Email 名單或上傳 CSV 寄出邀請，參與者加入後自動進到群組聊天。</p></div>
        <div class="step"><span class="n">3</span><h3>查看紀錄，接續回饋</h3><p>儀表板看整體，今日焦點看個人近期紀錄，對話前查看打卡脈絡。</p></div>
      </div>
    </div>
  </section>
  <section aria-labelledby="feat-title">
    <div class="wrap">
      <div class="sec-head"><p class="eyebrow">燈塔管理</p><h2 id="feat-title" class="h2">看見一群人如何持續往前</h2><p class="lede" style="max-width:36em">燈塔是帶領人的後台。它不是用來監控誰的，而是回答你在陪跑時最常想問的幾件事。</p></div>
      <div class="features">
        <!-- 儀表板 -->
        <div class="feature">
          <div class="copy">
            <p class="q-tag">這群人整體狀態如何？</p>
            <h3>儀表板：看學習容器有沒有在運作</h3>
            <p>打卡量、節奏、島民常寫的標籤和心情，都整理成看得懂的圖。可以看全部實踐，也可以只看其中一個。</p>
            <ul class="ticks">
              <li>已加入、已開始、本週持續行動中的人數</li>
              <li>打卡熱度圖、近兩週走勢、偏好的打卡時段</li>
              <li>打卡標籤與情緒分佈</li>
              <li>參與者明細：打卡、留言、瀏覽、迴響</li>
            </ul>
          </div>
          <div class="mock" aria-hidden="true">
            <div class="split">
              <div class="card-lite">
                <h4>情緒分佈</h4><small>打卡時情緒分佈</small>
                <div class="mood">
                  <div><span>平靜</span><span>24</span><span class="bar"><i style="width:78%"></i></span></div>
                  <div><span>有點累</span><span>17</span><span class="bar"><i style="width:55%"></i></span></div>
                  <div><span>開心</span><span>14</span><span class="bar"><i style="width:45%"></i></span></div>
                  <div><span>焦慮</span><span>9</span><span class="bar"><i style="width:29%"></i></span></div>
                </div>
              </div>
              <div class="card-lite">
                <h4>打卡標籤分佈</h4><small>打卡中最常出現的標籤</small>
                <div class="tags" style="margin-top:8px">
                  <span>界線</span><span>不敢拒絕</span><span>原生家庭</span><span>身體感受</span><span>職場</span><span>自我對話</span>
                </div>
              </div>
            </div>
            <div style="margin-top:16px">
              <div style="font-size:.78rem;color:var(--text-muted);margin-bottom:4px">打卡時段　偏好在哪些時段打卡（24 小時制）</div>
              <div class="hours">
                <div><i style="height:26%"></i><span>06–09</span></div>
                <div><i style="height:39%"></i><span>09–12</span></div>
                <div><i style="height:30%"></i><span>12–15</span></div>
                <div><i style="height:22%"></i><span>15–18</span></div>
                <div><i style="height:61%"></i><span>18–21</span></div>
                <div><i style="height:100%"></i><span>21–24</span></div>
              </div>
            </div>
          </div>
        </div>
        <!-- 群組聊天 -->
        <div class="feature flip">
          <div class="copy">
            <p class="q-tag">大家還能在同一個地方聊天嗎？</p>
            <h3>群組聊天：每個活動課程都有自己的聊天室</h3>
            <p>建立活動課程時，聊天室就自動開好；島民加入課程後自動進來，不用另外拉群。重要的事情置頂，大家都看得到。</p>
            <ul class="ticks">
              <li>發起人訊息有專屬標記，可以置頂、整理訊息</li>
              <li>回覆引用、按讚，看見彼此的回應</li>
              <li>搜尋過去的對話，重要內容不會被沖掉</li>
              <li>課程結束後，聊天室仍可繼續交流</li>
            </ul>
          </div>
          <div class="mock" aria-hidden="true" style="padding:0;overflow:hidden">
            <div style="display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--bg-gray)">
              <div style="width:32px;height:32px;border-radius:8px;background:var(--primary-palest);display:grid;place-items:center;font:700 .75rem var(--f-body);color:var(--primary-darker)">信</div>
              <div style="flex:1;min-width:0"><div style="font-size:.85rem;font-weight:700;color:var(--bg-dark)">信念改寫陪跑營・第 3 梯</div></div>
              <div style="display:flex;gap:-4px"><span style="width:22px;height:22px;border-radius:50%;background:var(--primary-palest);border:2px solid white;font-size:.6rem;display:grid;place-items:center;color:var(--primary-darker);font-weight:700">安</span><span style="width:22px;height:22px;border-radius:50%;background:#FFF3E0;border:2px solid white;font-size:.6rem;display:grid;place-items:center;color:#E65100;font-weight:700;margin-left:-6px">涵</span><span style="width:22px;height:22px;border-radius:50%;background:#E8F5E9;border:2px solid white;font-size:.6rem;display:grid;place-items:center;color:#2E7D32;font-weight:700;margin-left:-6px">宇</span><span style="width:22px;height:22px;border-radius:50%;background:#EDE7F6;border:2px solid white;font-size:.6rem;display:grid;place-items:center;color:#4527A0;font-weight:700;margin-left:-6px">18</span></div>
            </div>
            <div style="padding:12px 14px;background:#F9F5E8;border-bottom:1px solid var(--bg-gray);display:flex;align-items:center;gap:8px"><span style="color:#E65100;font-size:.75rem">📌</span><span style="font-size:.75rem;color:var(--bg-dark)"><b>依婷</b>　週四晚上 8 點直播，主題是「說不的練習」</span></div>
            <div style="padding:14px;display:grid;gap:10px">
              <div style="text-align:center;font-size:.7rem;color:var(--text-muted)">10 月 22 日 週四</div>
              <div style="text-align:center;font-size:.7rem;color:var(--text-muted)">岑 加入了聊天室</div>
              <div>
                <div style="font-size:.72rem;color:var(--text-muted);margin-bottom:4px">小安</div>
                <div style="background:var(--white);border:1px solid var(--bg-gray);border-radius:12px 12px 12px 4px;padding:9px 12px;font-size:.8rem;color:var(--bg-dark);display:inline-block;max-width:88%">今天主管問我意見，我第一次沒先說「不好意思」</div>
                <div style="margin-top:4px"><span style="font-size:.7rem;background:var(--white);border:1px solid var(--bg-gray);border-radius:999px;padding:2px 8px;color:var(--text-muted)">♥ 6</span></div>
              </div>
              <div style="display:flex;justify-content:flex-end">
                <div style="background:#16B9B3;border-radius:12px 12px 4px 12px;padding:9px 12px;font-size:.8rem;color:white;max-width:88%"><div style="font-size:.7rem;opacity:.8;margin-bottom:3px">小安：今天主管問我意見…</div>這一步很不容易！記得那時身體的感覺嗎？</div>
              </div>
            </div>
            <div style="padding:10px 14px;border-top:1px solid var(--bg-gray);display:flex;align-items:center;gap:8px"><span style="flex:1;font-size:.8rem;color:var(--text-muted)">說點什麼，島民都在</span><div style="width:30px;height:30px;border-radius:50%;background:var(--primary-palest);display:grid;place-items:center"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="#16B9B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></div></div>
          </div>
        </div>
        <!-- 名單 -->
        <div class="feature">
          <div class="copy">
            <p class="q-tag">誰在這裡、怎麼進來的？</p>
            <h3>名單：邀請、加入、維護，都在一頁</h3>
            <p>把報名名單貼進來就能寄出邀請，系統會先告訴你哪些是新邀請、哪些已經在名單上。想收人時開放邀請連結，人滿了就暫停加入。</p>
            <ul class="ticks">
              <li>Email 名單或 CSV 上傳，寄出前先預覽</li>
              <li>邀請連結與 QR Code，可重置、可暫停</li>
              <li>已加入、待確認、已邀請狀態一目了然</li>
            </ul>
          </div>
          <div class="mock" aria-hidden="true">
            <div class="split">
              <div class="card-lite">
                <h4>邀請成員</h4>
                <div style="background:var(--page);border:1px solid var(--bg-gray);border-radius:10px;padding:10px;font-size:.72rem;color:var(--text-muted);margin-bottom:10px;line-height:1.9">an.chen@example.com<br>yuting.w@example.com<br>sya.lin@example.com</div>
                <div style="font-size:.7rem;color:var(--text-muted);margin-bottom:8px">上傳名單前請確認已取得當事人同意，邀請信只用於本場次。</div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border:1px solid var(--bg-gray);border-radius:8px;margin-bottom:6px"><span style="font-size:.78rem;color:var(--bg-dark)">小安・10/02 加入</span><span style="font-size:.7rem;font-weight:600;color:var(--primary-darker);background:var(--primary-palest);padding:2px 8px;border-radius:999px">已加入</span></div>
                <div style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;border:1px solid var(--bg-gray);border-radius:8px"><span style="font-size:.78rem;color:var(--bg-dark)">yuting.w@…</span><span style="font-size:.7rem;font-weight:600;color:#E65100;background:#FFF3E0;padding:2px 8px;border-radius:999px">待確認</span></div>
              </div>
              <div class="card-lite" style="background:var(--primary-palest)">
                <h4>邀請連結</h4>
                <div style="border:2px dashed #c0d6d5;border-radius:10px;padding:16px;margin:8px 0;display:grid;place-items:center;gap:6px;background:#f7fbfb">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#6aacaa" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h.01M14 17h3M17 14v3M20 17v3M20 14h.01"/></svg>
                  <span style="font-size:.7rem;color:#6aacaa;font-weight:500">QR Code</span>
                </div>
                <button type="button" style="width:100%;padding:8px;border:2px solid var(--primary-base);border-radius:999px;background:transparent;color:var(--primary-darker);font:600 .78rem var(--f-body);cursor:pointer">複製連結</button>
                <div style="text-align:center;margin-top:8px;font-size:.7rem;color:var(--text-muted)">暫停加入・重置加入連結</div>
              </div>
            </div>
          </div>
        </div>
        <!-- 探索活動課程 -->
        <div class="feature flip">
          <div class="copy">
            <p class="q-tag">探索活動課程</p>
            <h3>讓下一梯，被對的人找到</h3>
            <p>想公開招生的場次，可以列在島島的「探索活動課程」頁面。這裡是島民自己發起的活動與課程目錄，訪客不用登入就能瀏覽，先認識你，再決定要不要報名。</p>
          </div>
          <div class="mock" aria-hidden="true" style="padding:0;overflow:hidden">
            <div style="padding:14px 16px;border-bottom:1px solid var(--bg-gray);display:flex;align-items:center;justify-content:space-between"><span style="font-size:.85rem;font-weight:700;color:var(--bg-dark)">探索活動課程</span><span style="font-size:.72rem;color:var(--text-muted)">訪客也能瀏覽</span></div>
            <div style="padding:12px 14px">
              <div style="display:flex;align-items:center;gap:8px;padding:7px 12px;border:1px solid var(--bg-gray);border-radius:999px;margin-bottom:10px"><svg width="12" height="12" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#A0AEC0" stroke-width="2"/><path d="M21 21l-4.35-4.35" stroke="#A0AEC0" stroke-width="2" stroke-linecap="round"/></svg><span style="font-size:.78rem;color:var(--text-muted)">搜尋活動名稱、介紹或發起人</span></div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px"><span style="padding:4px 12px;border-radius:999px;background:var(--primary-base);color:white;font-size:.72rem;font-weight:600">全部</span><span style="padding:4px 12px;border-radius:999px;background:var(--bg-gray);color:var(--text-muted);font-size:.72rem">開放報名</span><span style="padding:4px 12px;border-radius:999px;background:var(--bg-gray);color:var(--text-muted);font-size:.72rem">進行中</span><span style="padding:4px 12px;border-radius:999px;background:var(--bg-gray);color:var(--text-muted);font-size:.72rem">免費</span></div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
                <div style="border:1px solid var(--bg-gray);border-radius:12px;overflow:hidden">
                  <div style="background:repeating-linear-gradient(45deg,#E0F5F4,#E0F5F4 4px,#C5EBE9 4px,#C5EBE9 8px);padding:8px 10px;display:flex;align-items:center;justify-content:space-between"><span style="font-size:.66rem;font-weight:700;color:var(--primary-darker);background:white;padding:2px 7px;border-radius:999px">開放報名</span><span style="font-size:.66rem;color:var(--primary-darker)">3 個主題實踐</span></div>
                  <div style="padding:10px"><div style="font-size:.8rem;font-weight:700;color:var(--bg-dark);margin-bottom:3px">信念改寫陪跑營・第 4 梯</div><div style="font-size:.7rem;color:var(--text-muted);margin-bottom:6px">21 天，每天一個小練習</div><div style="display:flex;align-items:center;justify-content:space-between"><span style="display:flex;align-items:center;gap:4px"><span style="width:14px;height:14px;border-radius:50%;background:#FFF3E0;display:inline-block"></span><span style="font-size:.7rem;color:var(--text-muted)">依婷</span></span><span style="font-size:.75rem;font-weight:700;color:var(--primary-darker)">NT$1,800</span></div></div>
                </div>
                <div style="border:1px solid var(--bg-gray);border-radius:12px;overflow:hidden">
                  <div style="background:repeating-linear-gradient(45deg,#FFF9E0,#FFF9E0 4px,#FFF0B3 4px,#FFF0B3 8px);padding:8px 10px;display:flex;align-items:center;justify-content:space-between"><span style="font-size:.66rem;font-weight:700;color:#92680A;background:white;padding:2px 7px;border-radius:999px">進行中</span><span style="font-size:.66rem;color:#92680A">1 個主題實踐</span></div>
                  <div style="padding:10px"><div style="font-size:.8rem;font-weight:700;color:var(--bg-dark);margin-bottom:3px">7 日自我覺察打卡</div><div style="font-size:.7rem;color:var(--text-muted);margin-bottom:6px">每天花五分鐘，寫下一個讓你停下來的瞬間。</div><div style="display:flex;align-items:center;justify-content:space-between"><span style="font-size:.7rem;color:var(--text-muted)">家睿・24 位島民</span><span style="font-size:.75rem;font-weight:600;color:var(--primary-darker)">免費</span></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="page-cta">
    <div class="wrap">
      <h2 class="h2" style="margin-bottom:12px">準備好了嗎？</h2>
      <p class="lede" style="margin-inline:auto;text-align:center">免費試用一整梯，由島島團隊協助設定。</p>
      <div class="cta-row" style="justify-content:center;margin-top:28px">
        <a class="btn btn-orange btn-huge" data-goto="home#pilot" href="#">申請免費試用</a>
        <a class="btn btn-outline btn-huge" data-goto="home" href="#">回首頁了解更多</a>
      </div>
    </div>
  </section>
</main>
</div>
<footer>
    <div class="wrap">
      <div class="ft-top">
        <div>
          <img class="ft-logo" src="/assets/landing-page/logo-simple-white.svg" alt="島島阿學 Logo">
          <p class="ft-tagline">Where personal growth meets collective wisdom!</p>
        </div>
      </div>
      <div class="ft-cols">
        <div class="ft-col">
          <p class="ft-col-title">關於我們</p>
          <a href="#">關於島島</a>
          <a href="#">願景</a>
          <a href="#">使命</a>
        </div>
        <div class="ft-col">
          <p class="ft-col-title">資源</p>
          <a href="#">學習資源</a>
          <a href="#">學習馬拉松</a>
          <a href="#">隱私政策</a>
          <a href="#">服務條款</a>
          <a href="#">智慧財產權</a>
        </div>
        <div class="ft-col ft-newsletter">
          <p class="ft-col-title">訂閱電子報</p>
          <input type="text" placeholder="輸入您的名稱">
          <input type="email" placeholder="輸入您的Email">
          <button type="button">訂閱 →</button>
        </div>
      </div>
      <div class="ft-social">
        <p class="ft-social-title">追蹤島島</p>
        <div class="ft-social-links">
          <a href="#"><img src="/assets/landing-page/icon-Instagram.svg" alt="Instagram"></a>
          <a href="#"><img src="/assets/landing-page/icon-Facebook.svg" alt="Facebook"></a>
        </div>
      </div>
      <p class="ft-copy">島島阿學 © 2022 - 2026</p>
    </div>
  </footer>
<script>
(()=>{
  function showPage(page){
    document.querySelectorAll('[data-page]').forEach(el=>{el.hidden=el.dataset.page!==page});
    document.querySelectorAll('.nav-links a[data-page-link]').forEach(a=>{a.setAttribute('aria-current',a.dataset.pageLink===page?'page':'false')});
    window.scrollTo({top:0,behavior:'instant'});
    setTimeout(initReveal,30);
  }
  function getPage(){return location.hash.slice(1)==='tutorial'?'tutorial':'home'}
  window.addEventListener('hashchange',()=>showPage(getPage()));
  showPage(getPage());
  document.addEventListener('click',e=>{
    const el=e.target.closest('[data-goto]');
    if(!el) return;
    e.preventDefault();
    const [page,anchor]=el.dataset.goto.split('#');
    const p=page||'home';
    location.hash=p==='home'?'':p;
    showPage(p);
    if(anchor) setTimeout(()=>document.getElementById(anchor)?.scrollIntoView({behavior:'smooth'}),60);
  });
  const tabs=[document.getElementById('t-enc'),document.getElementById('t-cel')];
  tabs.forEach(t=>t?.addEventListener('click',()=>{tabs.forEach(o=>{if(!o)return;const on=o===t;o.setAttribute('aria-selected',String(on));const p=document.getElementById(o.getAttribute('aria-controls'));if(p)p.hidden=!on})}));
  const ucTabs=document.querySelectorAll('.uc-tab-btn');
  ucTabs.forEach(btn=>btn.addEventListener('click',()=>{ucTabs.forEach(b=>{const on=b===btn;b.setAttribute('aria-selected',String(on));const panel=document.getElementById(b.getAttribute('aria-controls'));if(panel)panel.hidden=!on})}));
  document.querySelectorAll('.uc-tabs-nav').forEach(nav=>{nav.addEventListener('keydown',e=>{const btns=[...nav.querySelectorAll('.uc-tab-btn')];const idx=btns.indexOf(document.activeElement);if(e.key==='ArrowRight'&&idx<btns.length-1)btns[idx+1].focus();else if(e.key==='ArrowLeft'&&idx>0)btns[idx-1].focus()})});
  // scroll reveal
  function initReveal(){
    const revealTargets=[
      '.hero .hero-copy','.hero .hero-visual',
      '.pillars .sec-head','.pillars .pillar',
      '.pain-intro',
      '.daily-band .daily-col',
      '.case-band .sec-head','.case-band .uc-tabs-wrap','.case-band .case-panel:not([hidden])',
      '.stance',
      '#pilot .wrap > *',
      '.faq',
      '.features .feature',
      '.tutorial-hero','.tutorial-steps','.tutorial-steps .step',
      '.page-cta','.closing .cta-wrap',
      'section[aria-labelledby="feat-title"] .sec-head','section[aria-labelledby="feat-title"] .feature',
      'section[aria-labelledby="q-title"] .faq',
      'footer'
    ];
    const els=[];
    revealTargets.forEach(sel=>{document.querySelectorAll(sel).forEach(el=>{if(!el.classList.contains('reveal')&&!el.closest('[hidden]')){el.classList.add('reveal');els.push(el)}})});
    if(!('IntersectionObserver' in window)){els.forEach(el=>{el.classList.add('visible')});return}
    const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}})},{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
    els.forEach((el,i)=>{el.style.animationDelay=(i*0.04)+'s';io.observe(el)});
  }
  initReveal();
  // dark navbar when pain section is visible
  const painEl=document.getElementById('pain-section');
  if(painEl&&'IntersectionObserver' in window){
    const darkIO=new IntersectionObserver(entries=>{entries.forEach(e=>{document.documentElement.classList.toggle('dark-nav',e.isIntersecting)})},{threshold:0.15});
    darkIO.observe(painEl);
  }
  const chatEl=document.querySelector('.chat-anim');
  if(chatEl&&'IntersectionObserver' in window){
    const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('started');io.unobserve(e.target)}})},{threshold:0.35});
    io.observe(chatEl);
  } else if(chatEl) chatEl.classList.add('started');
  const form=document.getElementById('pilot-form'),msg=document.getElementById('form-msg');
  if(form) form.addEventListener('submit',e=>{
    e.preventDefault();
    const n=document.getElementById('f-name'),c=document.getElementById('f-contact');
    if(!n.value.trim()||!c.value.trim()){msg.textContent='請填寫名字和聯絡方式。';msg.hidden=false;(n.value.trim()?c:n).focus();return}
    msg.textContent='這是原型頁面，表單尚未串接。';msg.hidden=false;
  });
})();
</script>
</body></html>`;

export function GET() {
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
