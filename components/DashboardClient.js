"use client";
import {useEffect,useState} from "react";
import Link from "next/link";

const groups=[
 {title:"MARKET PRICES",keys:["gold","dxy","spx","us10y"]},
 {title:"INFLATION & POLICY",keys:["cpi","pce","corepce","fedfunds","real10y"]},
 {title:"LABOUR",keys:["unemployment"]}
];

function fmt(v){return v==null?"—":Number(v).toLocaleString("en-US",{maximumFractionDigits:2})}
function cardClass(k){return k==="gold"?"gold-accent":k==="dxy"?"blue-accent":k==="real10y"?"real-accent":""}

export default function DashboardClient(){
 const [data,setData]=useState(null),[loading,setLoading]=useState(true),[error,setError]=useState("");
 async function load(){
  try{setLoading(true);setError("");const r=await fetch("/api/market",{cache:"no-store"});if(!r.ok)throw new Error("Market data unavailable");setData(await r.json())}
  catch(e){setError("Some live feeds are temporarily unavailable. The dashboard will retry.");}
  finally{setLoading(false)}
 }
 useEffect(()=>{load();const id=setInterval(load,300000);return()=>clearInterval(id)},[]);
 const byKey=Object.fromEntries((data?.indicators||[]).map(x=>[x.key,x]));
 return <main className="dashboard-page">
  <section className="dashboard-hero">
   <div className="dashboard-gridlines"/><div className="dashboard-orb"/>
   <div className="dashboard-hero-inner">
    <div><span className="section-kicker light">MARKET INTELLIGENCE</span><h1>Global Macro Dashboard</h1><p>A live research view of the prices, rates and economic indicators shaping the market narrative.</p></div>
    <div className="dashboard-status"><span className="status-dot"/><span>{loading?"UPDATING":"LIVE DATA"} </span><small>{data?.updatedAt?new Date(data.updatedAt).toLocaleTimeString():"—"}</small></div>
   </div>
  </section>
  <section className="dashboard-body">
   {error&&<div className="feed-warning">{error}</div>}
   {groups.map(group=><section className="indicator-group" key={group.title}><div className="dashboard-section-head"><div><span className="section-kicker">{group.title}</span><h2>{group.title==="MARKET PRICES"?"Market Pulse":group.title==="INFLATION & POLICY"?"Inflation, Rates & Policy":"Labour Conditions"}</h2></div><span className="source-note">FRED + MARKET FEEDS</span></div>
    <div className="indicator-grid">{group.keys.map(k=>{const x=byKey[k];return <article className={"indicator-card "+cardClass(k)} key={k}><div className="indicator-top"><span>{x?.label||k}</span><span>{x?.source||"—"}</span></div><div className="indicator-value">{loading&&!x?"…":fmt(x?.value)}</div><div className="indicator-bottom"><span>{x?.unit||""}</span>{x?.pct!=null?<span className={x.pct>=0?"positive":"negative"}>{x.pct>=0?"+":""}{x.pct.toFixed(2)}%</span>:<span>{x?.date||"Latest available"}</span>}</div><div className="micro-chart"><i/><i/><i/><i/><i/></div></article>})}</div>
   </section>)}
   <section className="dashboard-note"><div><span className="section-kicker">ANALYTICAL CONTEXT</span><h2>Use data to frame the question—not replace the analysis.</h2></div><p>These indicators are designed as a research starting point. Prices update more frequently than official macroeconomic releases, so each series carries its own publication cadence. Always verify the release date and source before using a figure in published research.</p></section>
   <div className="dashboard-links"><Link href="/research">RESEARCH ARCHIVE →</Link><Link href="/search">SEARCH RESEARCH →</Link><Link href="/about">ABOUT THE PLATFORM →</Link></div>
  </section>
 </main>
}