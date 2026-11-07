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
body{background:var(--page);color:var(--bg-dark);font-family:var(--f-body);font-size:var(--s0);line-height:1.75;-webkit-font-smoothing:antialiased}
body::before{content:"";position:fixed;inset:0 0 auto;height:env(safe-area-inset-top,0px);z-index:10;background:var(--white)}
.wrap{max-width:var(--wrap);margin-inline:auto;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
@media (min-width:720px){.wrap{padding-left:max(32px,env(safe-area-inset-left,0px));padding-right:max(32px,env(safe-area-inset-right,0px))}}
h1,h2,h3{margin:0;line-height:1.35;text-wrap:balance;font-weight:700}
p{margin:0}
img{max-width:100%;height:auto;display:block}
a{color:var(--primary-darker)}
:focus-visible{outline:2px solid var(--primary-base);outline-offset:3px;border-radius:8px}
.mono{font-family:var(--f-mono);font-variant-numeric:tabular-nums}
.eyebrow{display:inline-flex;align-items:center;gap:8px;font-size:var(--s-1);font-weight:600;color:var(--primary-base);letter-spacing:.06em}
.lede{color:var(--text-muted);font-size:var(--s1);max-width:34em}
.h2{font-size:var(--s3);color:var(--primary-darker)}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:.4em;min-height:48px;padding:0 1.6em;border-radius:999px;font:600 var(--s0)/1 var(--f-body);text-decoration:none;cursor:pointer;border:2px solid transparent;transition:background .2s,color .2s,box-shadow .2s}
.btn-orange{background:var(--tips);border-color:var(--tips);color:var(--white);box-shadow:0 8px 10px 0 rgba(255,161,11,.2)}
.btn-orange:hover{background:var(--white);color:var(--tips-text);box-shadow:0 12px 20px 0 rgba(255,161,11,.3)}
.btn-outline{background:var(--white);border:1px solid var(--bg-gray);color:var(--text-dark)}
.btn-outline:hover{border-color:var(--primary-base);color:var(--primary-darker)}
.btn-sm{min-height:40px;padding:0 1.1em;font-size:var(--s-1)}
.btn-huge{min-height:56px;padding:0 2.2em;font-size:var(--s1)}
.nav{position:sticky;top:env(safe-area-inset-top,0px);z-index:5;background:rgba(255,255,255,.86);backdrop-filter:blur(10px);border-bottom:1px solid var(--bg-gray)}
.nav .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:68px}
.nav-logo img{width:150px}
.nav-links{display:none;gap:28px;font-size:var(--s-1)}
.nav-links a{color:var(--text-dark);text-decoration:none;font-weight:500}
.nav-links a:hover,.nav-links a[aria-current="page"]{color:var(--primary-base)}
.nav-links a[aria-current="page"]{font-weight:600}
.nav-right{display:flex;align-items:center;gap:14px}
@media (min-width:1100px){.nav-links{display:flex}}
.hero{position:relative;overflow:hidden;padding-block:clamp(48px,7vw,96px) clamp(56px,7vw,104px);background:linear-gradient(145deg,var(--page) 0%,#E8F7F5 60%,#D4F0F5 100%)}
.hero .wrap{position:relative;z-index:1;display:grid;gap:48px;align-items:center}
@media (min-width:980px){.hero .wrap{grid-template-columns:1fr 1.05fr}}
.hero-copy{position:relative}
.hero h1{font-size:var(--s4);color:var(--primary-darker);margin-block:16px 20px}
.hero h1 span{color:var(--primary-base);display:block}
.cta-row{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
.hero-shapes{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
.hero-shapes svg{position:absolute;opacity:.18}
@keyframes floatA{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-22px) rotate(18deg)}}
@keyframes floatB{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(16px) rotate(-12deg)}}
@keyframes floatC{0%,100%{transform:translate(0,0) rotate(0deg)}50%{transform:translate(-14px,12px) rotate(25deg)}}
@keyframes floatD{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(10px,-8px) scale(1.1)}}
.hero-visual{position:relative}
.frame{background:var(--white);border:1px solid var(--bg-gray);border-radius:20px;box-shadow:0 30px 60px -30px rgba(13,48,54,.28);overflow:hidden;min-width:0}
.frame-top{display:flex;align-items:center;gap:10px;padding:14px 18px;border-bottom:1px solid var(--bg-gray)}
.frame-top .back{font-size:.75rem;color:var(--text-muted)}
.frame-top strong{font-size:var(--s-1);color:var(--bg-dark)}
.tabs{display:flex;gap:6px;padding:12px 18px 0;flex-wrap:wrap}
.tab{font-size:.78rem;padding:5px 12px;border-radius:999px;color:var(--text-muted);background:var(--very-light-gray)}
.tab.on{background:var(--bg-dark);color:var(--white)}
.focus-label{font-size:.72rem;font-weight:700;color:var(--text-muted);padding:0 14px;padding-bottom:6px}
.focus-preview{display:grid;gap:8px;padding:14px 18px}
.focus-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;border:1px solid var(--bg-gray);border-radius:12px;background:var(--page);font-size:.8rem}
.focus-row .name{font-weight:600;color:var(--bg-dark)}
.focus-row .days{font-size:.72rem;color:var(--tips-text);font-weight:600}
.focus-row .act{font-size:.72rem;padding:4px 10px;border-radius:999px;background:var(--primary-base);color:var(--white);font-weight:600}
@keyframes rowSlideIn{from{opacity:0;transform:translateX(14px)}to{opacity:1;transform:translateX(0)}}
.fr-anim-1{opacity:0;animation:rowSlideIn .5s .3s ease forwards}
.fr-anim-2{opacity:0;animation:rowSlideIn .5s .9s ease forwards}
.fr-anim-3{opacity:0;animation:rowSlideIn .5s 1.5s ease forwards}
.hv-avatars{display:none;position:absolute;inset:0;pointer-events:none}
@media (min-width:980px){.hv-avatars{display:block}}
@keyframes avatarPop{from{opacity:0;transform:scale(.6)}60%{transform:scale(1.1)}to{opacity:1;transform:scale(1)}}
.hv-av{position:absolute;display:flex;flex-direction:column;align-items:center;gap:5px;opacity:0}
.hv-av.student{left:-36px;top:28%;animation:avatarPop .5s 2.2s cubic-bezier(.34,1.56,.64,1) forwards}
.hv-av.teacher{right:-36px;bottom:22%;animation:avatarPop .5s 2.7s cubic-bezier(.34,1.56,.64,1) forwards}
.av-ring{width:50px;height:50px;border-radius:50%;display:flex;align-items:center;justify-content:center;font:700 1.1rem var(--f-body);box-shadow:0 4px 14px rgba(0,0,0,.18)}
.av-ring.s{background:var(--primary-pale);color:var(--primary-darker);border:2.5px solid var(--primary-base)}
.av-ring.t{background:var(--bg-dark);color:var(--white);border:2.5px solid var(--primary-base)}
.av-label{font-size:.68rem;font-weight:600;color:var(--text-muted)}
section{padding-block:clamp(64px,8vw,112px)}
.sec-head{display:grid;gap:12px;max-width:46em;margin-bottom:48px}
.sec-head.center{margin-inline:auto;text-align:center;justify-items:center}
.white-band{background:var(--white)}
.pillars{padding-block:clamp(48px,6vw,88px)}
.pillar-grid{display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(min(100%,240px),1fr))}
.pillar{background:var(--white);border:1px solid var(--bg-gray);border-radius:24px;padding:28px 26px;display:grid;gap:12px;align-content:start;box-shadow:0 24px 50px -38px rgba(13,48,54,.3);transition:transform .4s ease,box-shadow .4s ease}
.pillar .ic{width:48px;height:48px;border-radius:14px;background:var(--primary-palest);display:grid;place-items:center;color:var(--primary-darker)}
.pillar h3{font-size:var(--s2);color:var(--primary-darker)}
.pillar p{color:var(--text-muted)}
@media (min-width:760px){
  .pillar-grid{display:flex;justify-content:center;align-items:flex-end;min-height:380px;padding-bottom:24px;gap:0}
  .pillar{flex:0 0 min(290px,34%);transform-origin:bottom center}
  .pillar:nth-child(1){transform:rotate(-9deg) translateY(20px);margin-right:-28px;z-index:0}
  .pillar:nth-child(2){z-index:2}
  .pillar:nth-child(3){transform:rotate(9deg) translateY(20px);margin-left:-28px;z-index:0}
  .pillar-grid:has(:hover) .pillar:nth-child(1){transform:rotate(-13deg) translateY(28px)}
  .pillar-grid:has(:hover) .pillar:nth-child(3){transform:rotate(13deg) translateY(28px)}
  .pillar:hover{transform:rotate(0deg) translateY(-12px) !important;z-index:3 !important;box-shadow:0 48px 72px -30px rgba(13,48,54,.35)}
}
.daily-intro{background:var(--bg-dark);padding-block:clamp(44px,6vw,76px)}
.daily-intro h2{font-size:clamp(1.9rem,3.8vw,3.2rem);color:var(--white);text-align:center;line-height:1.3;text-wrap:balance}
.daily-intro h2 em{color:var(--primary-lighter);font-style:normal}
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
.pains .ic{width:44px;height:44px;border-radius:14px;background:var(--primary-palest);display:grid;place-items:center;color:var(--primary-darker)}
.pains h3{font-size:var(--s1);color:var(--bg-dark)}
.pains p{color:var(--text-muted)}
.quote{margin-top:30px;padding:20px 22px;border-radius:18px;background:var(--primary-palest);font-size:var(--s1);color:var(--primary-darker);font-weight:500}
.quote cite{display:block;margin-top:8px;font:400 var(--s-1) var(--f-body);color:var(--text-muted)}
.quote-note{display:block;margin-top:6px;font:400 .72rem/1.5 var(--f-body);color:var(--light-gray)}
.case-band{background:var(--primary-palest)}
.case-panel{display:grid;gap:32px;background:var(--white);border-radius:24px;padding:clamp(20px,4vw,44px);box-shadow:0 24px 50px -34px rgba(13,48,54,.3)}
@media (min-width:940px){.case-panel{grid-template-columns:1.1fr 1fr;gap:56px}}
.case-story{display:grid;gap:14px;align-content:start;min-width:0}
.case-for{font-size:var(--s-1);color:var(--primary-darker);font-weight:600}
.case-story h3{font-size:var(--s2);color:var(--primary-darker)}
.case-story>p:not(.case-for){color:var(--text-muted)}
.case-ex{display:grid;gap:4px;padding:16px 18px;border-radius:16px;border:1px dashed var(--primary-lighter);background:var(--page)}
.case-ex-label{font-size:.72rem;font-weight:600;letter-spacing:.06em;color:var(--tips-text)}
.case-ex strong{font-size:var(--s0);color:var(--bg-dark)}
.case-ex small{font-size:.8rem;color:var(--text-dark)}
.case-ex p{font-size:.85rem;color:var(--text-muted)}
.ticks{list-style:none;margin:4px 0 0;padding:0;display:grid;gap:8px}
.ticks li{display:flex;gap:10px;align-items:baseline;color:var(--bg-dark)}
.ticks li::before{content:"";flex:none;width:16px;height:16px;border-radius:50%;background:var(--primary-base) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath d='M4.5 8.2l2.3 2.3 4.7-4.8' stroke='white' stroke-width='1.8' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/contain no-repeat;transform:translateY(3px)}
.case-run{list-style:none;margin:0;padding:0;display:grid;min-width:0;position:relative}
.case-run li{position:relative;display:grid;gap:6px;padding:0 0 26px 30px}
.case-run li:last-child{padding-bottom:0}
.case-run li::before{content:"";position:absolute;left:5px;top:8px;width:12px;height:12px;border-radius:50%;background:var(--white);border:3px solid var(--primary-base)}
.case-run li:not(:last-child)::after{content:"";position:absolute;left:10px;top:24px;bottom:2px;width:2px;background:var(--primary-lightest)}
.case-run .when{font-size:var(--s-1);font-weight:700;color:var(--primary-darker)}
.case-run p{color:var(--bg-dark);font-size:.95rem}
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
footer{background:var(--bg-dark);color:#B9CDD0;padding-block:36px;font-size:var(--s-1)}
footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:16px}
footer img{width:130px}
.version-badge{position:fixed;bottom:max(16px,env(safe-area-inset-bottom,0px));right:16px;z-index:100;font:600 .72rem var(--f-mono);padding:4px 10px;border-radius:999px;background:var(--bg-dark);color:var(--primary-lighter);opacity:.75}
@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
</head>
<body>
<span class="version-badge">v2 · 2026-11-07</span>
<header class="nav">
  <div class="wrap">
    <a class="nav-logo" href="#" data-goto="home" aria-label="島島阿學 首頁"><img src="https://daodao.tw/images/logo.svg" onerror="this.style.display='none'" alt="島島阿學" width="200" height="44"></a>
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
      <svg style="left:3%;top:12%;animation:floatA 9s ease-in-out infinite" width="72" height="72" viewBox="0 0 72 72" fill="none"><polygon points="36,4 66,20 66,52 36,68 6,52 6,20" stroke="#16B9B3" stroke-width="2" fill="#16B9B3" fill-opacity=".25"/></svg>
      <svg style="right:6%;top:8%;animation:floatB 12s ease-in-out infinite" width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="26" stroke="#FFA10B" stroke-width="2" fill="#FFA10B" fill-opacity=".2"/></svg>
      <svg style="right:2%;top:50%;animation:floatC 10s ease-in-out infinite" width="48" height="48" viewBox="0 0 48 48"><polygon points="24,4 46,44 2,44" stroke="#16B9B3" stroke-width="2" fill="#B3E8E6" fill-opacity=".5"/></svg>
      <svg style="left:1%;bottom:15%;animation:floatD 14s ease-in-out infinite" width="44" height="44" viewBox="0 0 44 44"><polygon points="22,2 40,12 40,32 22,42 4,32 4,12" stroke="#0D7A77" stroke-width="2" fill="#D9F3F5" fill-opacity=".6"/></svg>
      <svg style="left:14%;top:55%;animation:floatB 7s 2s ease-in-out infinite" width="32" height="32" viewBox="0 0 32 32"><circle cx="16" cy="16" r="14" stroke="#66D4CF" stroke-width="1.5" fill="#66D4CF" fill-opacity=".2"/></svg>
      <svg style="left:46%;top:5%;animation:floatA 11s 1s ease-in-out infinite" width="36" height="36" viewBox="0 0 36 36"><rect x="8" y="8" width="20" height="20" stroke="#FFA10B" stroke-width="1.5" fill="#FFA10B" fill-opacity=".15" transform="rotate(45 18 18)"/></svg>
      <svg style="right:18%;bottom:30%;animation:floatC 8s 3s ease-in-out infinite" width="28" height="28" viewBox="0 0 28 28"><polygon points="14,2 25,8 25,20 14,26 3,20 3,8" stroke="#16B9B3" stroke-width="1.5" fill="#E6F7F9" fill-opacity=".8"/></svg>
    </div>
    <div class="wrap">
      <div class="hero-copy">
        <p class="eyebrow">給每一位用心陪伴學員的導師</p>
        <h1>讓每一次陪伴，<span>都成為成長的延續。</span></h1>
        <p class="lede">從學員的實踐紀錄、回饋到參與進度，讓每一段成長都有跡可循，每一次引導都能接續前進。</p>
        <div class="cta-row">
          <a class="btn btn-outline btn-huge" href="#tutorial">探索陪跑新方式 →</a>
        </div>
      </div>
      <div class="hero-visual">
        <div class="hv-avatars" aria-hidden="true">
          <div class="hv-av student"><div class="av-ring s">學</div><span class="av-label">學員</span></div>
          <div class="hv-av teacher"><div class="av-ring t">師</div><span class="av-label">你</span></div>
        </div>
        <div class="frame" role="img" aria-label="燈塔今日焦點示意">
          <div class="frame-top"><span class="back">← 系列與場次</span><strong>信念改寫陪跑營 · 第 3 梯</strong></div>
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
  <section class="pillars" aria-labelledby="v-title">
    <div class="wrap">
      <div class="sec-head center"><p class="eyebrow">為每一段用心的陪跑，提供剛剛好的支持</p><h2 id="v-title" class="h2">從看見進展，到持續陪伴</h2></div>
      <div class="pillar-grid">
        <div class="pillar"><span class="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="6" y="3" width="13" height="18" rx="2"/><path d="M4 7h3M4 12h3M4 17h3M10 8h5M10 12h5"/></svg></span><h3>找得到紀錄</h3><p>學員的每一次實踐，都留下清楚的足跡。</p></div>
        <div class="pillar"><span class="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 4h10v7H8l-4 3z"/><path d="M14 8h6v8l-3-2h-6v-3"/></svg></span><h3>接得上回饋</h3><p>延續上一次的對話，讓引導更有脈絡。</p></div>
        <div class="pillar"><span class="ic"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 19v-4M12 19V10M18 19V5"/></svg></span><h3>看得見參與</h3><p>了解學員的投入情況，適時給予支持。</p></div>
      </div>
    </div>
  </section>
  <div class="daily-intro"><div class="wrap"><h2>這是你的<em>帶班日常</em>嗎？</h2></div></div>
  <section class="white-band" aria-labelledby="p-title">
    <div class="wrap chat-grid">
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
        <blockquote class="quote">「課程結束後大家都回 LINE 群了，我一直鼓勵他們分享，但我其實不知道誰還在練。」<cite>一位帶高敏內耗陪跑營的生命教練<span class="quote-note">情境示例</span></cite></blockquote>
      </div>
    </div>
  </section>
  <section class="case-band" aria-labelledby="uc-title">
    <div class="wrap">
      <div class="sec-head"><p class="eyebrow">使用案例</p><h2 id="uc-title" class="h2">下次會談前，先查看近期打卡脈絡</h2><p class="lede">燈塔把參與者的打卡、你的回饋與群組交流放在同一個地方。對話有了脈絡，陪伴不再靠記憶。</p></div>
      <div class="case-panel">
        <div class="case-story">
          <p class="case-for">適合　生命教練、職涯諮詢師、帶主管或轉職者的導師與教練</p>
          <h3>開營之後，你不用再靠 LINE 追每位參與者的進度</h3>
          <p>一組參與者一起設定目標、定期小組會談，平日帶著行動任務在生活裡練習。燈塔每天幫你整理好近期紀錄，你打開就知道今天可以從哪裡接話。</p>
          <div class="case-ex"><span class="case-ex-label">情境示例</span><strong>8 週轉職陪跑營</strong><small>8 週 · 每梯 12 人 · 每週一次線上小組會談</small><p>週二晚上的小組會談前，教練查看小安近期的打卡心得，接續上次討論到的職場界線。</p></div>
          <ul class="ticks"><li>打卡紀錄留在每位參與者名下，回饋有脈絡</li><li>下次對話前，更容易知道從哪裡接話</li><li>下一梯沿用同一個系列，不用重新搭一次</li></ul>
        </div>
        <ol class="case-run">
          <li><span class="when">開營前</span><p>建立系列與場次，設定日期，加入這一梯要練的行動任務。島島團隊在試用期間協助設定。</p></li>
          <li><span class="when">每週</span><p>小組會談的時間和題目置頂在群組聊天，參與者加入場次就自動在聊天室裡。</p></li>
          <li><span class="when">平日</span><p>參與者在島島記錄心得。你打開今日焦點，查看近期紀錄，決定是否主動關心。</p></li>
          <li><span class="when">會談前</span><p>打開燈塔，看這位參與者近期的打卡脈絡，帶著這些進入對話。</p></li>
          <li><span class="when">結業</span><p>回顧整梯的打卡紀錄、常見標籤與心情，帶著這些去設計下一梯。</p></li>
        </ol>
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
      <div class="sec-head center"><p class="eyebrow">常見問題</p><h2 id="q-title" class="h2">帶領人實際問過我們的</h2></div>
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
<footer><div class="wrap"><span style="color:#B9CDD0;font-size:.875rem">頁面中的參與者、課程與數字皆為使用情境示意</span></div></footer>
<script>
(()=>{
  function showPage(page){
    document.querySelectorAll('[data-page]').forEach(el=>{el.hidden=el.dataset.page!==page});
    document.querySelectorAll('.nav-links a[data-page-link]').forEach(a=>{a.setAttribute('aria-current',a.dataset.pageLink===page?'page':'false')});
    window.scrollTo({top:0,behavior:'instant'});
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
