"use client";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
export function CountUp({ value, suffix = "" }: { value: number; suffix?: string }) { const ref = useRef<HTMLSpanElement>(null); const [display,setDisplay]=useState(0); const reduce=useReducedMotion(); useEffect(()=>{const node=ref.current;if(!node)return;const observer=new IntersectionObserver(([entry])=>{if(!entry?.isIntersecting)return; observer.disconnect(); if(reduce){setDisplay(value);return;} let frame=0; const total=45; const timer=window.setInterval(()=>{frame++;setDisplay(Math.min(value,Math.round(value*frame/total)));if(frame>=total)window.clearInterval(timer)},24);return ()=>window.clearInterval(timer);},{threshold:.5});observer.observe(node);return()=>observer.disconnect()},[value,reduce]);return <span ref={ref}>{display}{suffix}</span>; }

