"use client";

import { useEffect, useRef, useState } from "react";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import { useMedia } from "@/lib/use-media";

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`;

// Morze widziane z góry: przepływające fale, grzbiety i piana w barwach marki (granat, turkus, cyjan).
const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;

float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  vec2 p = (gl_FragCoord.xy - 0.5 * u_res) / min(u_res.x, u_res.y);
  float t = u_time * 0.07;

  // fale płyną po przekątnej (jak kilwater), drobniejsze niż poprzednio
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  vec2 q = r * p * 4.2 + vec2(t * 1.4, t * 0.6);
  vec2 w = vec2(fbm(q * 0.8 + vec2(0.0, t * 2.0)), fbm(q * 0.8 + vec2(5.2, 1.3) - t * 1.5));
  float n = fbm(q + 0.9 * w + t);

  float ridge = 1.0 - abs(2.0 * fbm(q * 1.9 + w * 1.1 - t * 3.0) - 1.0);
  ridge = ridge * ridge * ridge;

  vec3 deep = vec3(0.010, 0.075, 0.105);
  vec3 mid  = vec3(0.016, 0.200, 0.272);
  vec3 teal = vec3(0.028, 0.486, 0.557);
  vec3 cyan = vec3(0.247, 0.729, 0.761);

  vec3 col = mix(deep, mid, smoothstep(0.18, 0.78, n));
  col = mix(col, teal, smoothstep(0.58, 0.96, n) * 0.65);
  col += cyan * ridge * smoothstep(0.42, 0.92, n) * 0.32;

  float foam = smoothstep(0.74, 1.0, ridge * n * 1.7);
  col = mix(col, vec3(0.80, 0.95, 0.97), foam * 0.2);

  // jasna smuga światła przez środek, jak odbicie od wody
  float d = dot(p - vec2(0.15, 0.05), normalize(vec2(0.6, 0.8))) * 2.2;
  float shaft = exp(-d * d);
  col += vec3(0.03, 0.16, 0.2) * shaft * (0.5 + n);

  // winieta i przyciemnienie pod tekst (lewy i dolny brzeg)
  float vig = 1.0 - smoothstep(0.15, 1.25, length(uv - vec2(0.55, 0.55)));
  col *= 0.5 + 0.5 * vig;
  col *= mix(0.55, 1.0, smoothstep(0.0, 0.7, uv.x));
  col *= mix(0.6, 1.0, smoothstep(0.0, 0.5, uv.y));

  gl_FragColor = vec4(col, 1.0);
}`;

const STILL_TIME = 18; // klatka spoczynkowa (reduced motion, brak WebGL w ruchu)

// Tło hero: shader na canvasie, pod nim zawsze gradient CSS (gdy WebGL jest niedostępny). Ruch ma przycisk pauzy.
export function OceanCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef<((t: number) => void) | null>(null);
  const reduced = useMedia("(prefers-reduced-motion: reduce)");
  const [userPaused, setUserPaused] = useState(false);
  const paused = userPaused || reduced;

  // jednorazowa inicjalizacja WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, powerPreference: "low-power", alpha: false });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        console.error("Ocean shader:", gl.getShaderInfoLog(s));
        return null;
      }
      return s;
    };
    const vs = compile(gl.VERTEX_SHADER, VERT);
    const fs = compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(program, "a");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const uRes = gl.getUniformLocation(program, "u_res");
    const uTime = gl.getUniformLocation(program, "u_time");

    let lastTime = STILL_TIME;
    const draw = (t: number) => {
      lastTime = t;
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    drawRef.current = draw;

    // niższa rozdzielczość wystarcza: woda jest miękka, a koszt GPU/CPU spada
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.75;
      canvas.width = Math.max(2, Math.round(canvas.clientWidth * dpr));
      canvas.height = Math.max(2, Math.round(canvas.clientHeight * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
      draw(lastTime);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    return () => {
      // Nie wywołujemy loseContext(): React (tryb dev) uruchamia efekt dwa razy na tym samym canvasie,
      // a drugi przebieg dostałby zgubiony kontekst. Zwalniamy tylko własne zasoby.
      ro.disconnect();
      drawRef.current = null;
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(buf);
    };
  }, []);

  // pętla ruchu: tylko gdy nie ma pauzy i karta jest widoczna
  useEffect(() => {
    if (paused) {
      drawRef.current?.(STILL_TIME);
      return;
    }
    let raf = 0;
    const start = performance.now() - STILL_TIME * 1000;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!document.hidden) drawRef.current?.((now - start) / 1000);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  return (
    <>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(70%_60%_at_65%_40%,#077c8e_0%,#08435a_45%,#032a39_100%)]"
      />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 size-full" />
      {!reduced && (
        <button
          type="button"
          onClick={() => setUserPaused((p) => !p)}
          aria-pressed={userPaused}
          aria-label={userPaused ? "Wznów animację tła" : "Wstrzymaj animację tła"}
          className="wb-glass-dark wb-press absolute bottom-6 left-6 z-20 grid size-11 place-items-center rounded-full lg:bottom-10 lg:left-12"
        >
          {userPaused ? <PlayIcon width={20} height={20} /> : <PauseIcon width={20} height={20} />}
        </button>
      )}
    </>
  );
}
