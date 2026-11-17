"use client";

import Image from "next/image";
import { useEffect, useRef, type ReactNode } from "react";
import { HeroCopy } from "./hero-copy";

type Star = {
  x: number;
  y: number;
  r: number;
  base: number;
  speed: number;
  phase: number;
};

type ShootingStar = { x: number; y: number; vx: number; vy: number; born: number };

const SHOOT_LIFE = 900;

/** 별똥별이 지나갈 때 함께 반짝이는 별(2~3개). 커졌다 사라지는 십자 빛입니다 */
type Flare = { x: number; y: number; born: number; life: number; size: number };

/**
 * 반짝임 자리: 제목("Joshua Tree WORKS") 위쪽, 가운데에서 조금 오른쪽.
 * 제목 위치를 기준으로 잡아 화면 크기가 바뀌어도 같은 자리에 나옵니다.
 */
function flareAnchor(canvas: HTMLCanvasElement) {
  const title = document.getElementById("hero-title");
  const box = canvas.getBoundingClientRect();
  if (!title) return { x: box.width * 0.58, y: box.height * 0.18 };
  const t = title.getBoundingClientRect();
  return {
    x: t.left - box.left + t.width * 0.77,
    y: Math.max(28, t.top - box.top - Math.min(110, (t.top - box.top) * 0.45)),
  };
}

/**
 * 히어로 2안: 은하수가 보이는 밤하늘과 검은 조슈아 트리 실루엣 사진 위에 반짝이는 별(캔버스)을 겹칩니다.
 * 사진은 아주 느리게 다가오고(hero-drift), 가끔 별똥별이 지나가며 그때 제목 위쪽에서 별 2~3개가 반짝입니다.
 * 움직임을 줄이도록 설정한 사용자에게는 정지한 별만 그립니다.
 * children: 히어로 안에 함께 띄울 요소(1·2안 전환 버튼)
 */
export function HeroNightSky({ children }: { children?: ReactNode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const motionOk = window.matchMedia(
      "(prefers-reduced-motion: no-preference)",
    ).matches;

    let stars: Star[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let inView = true;
    let shooting: ShootingStar | null = null;
    let nextShoot = performance.now() + 3500;
    let flares: Flare[] = [];

    const draw = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const s of stars) {
        const twinkle = motionOk
          ? 0.55 + 0.45 * Math.sin((time / 1000) * s.speed + s.phase)
          : 1;
        // 지평선(아래)으로 갈수록 별을 흐리게
        const fade = Math.max(0, 1 - s.y / (height * 0.78));
        ctx.globalAlpha = Math.min(1, s.base * twinkle * (0.35 + 0.65 * fade));
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();

        if (s.r > 1.25) {
          // 밝은 별에 짧은 십자 빛
          ctx.globalAlpha *= 0.45;
          ctx.fillRect(s.x - s.r * 3, s.y - 0.25, s.r * 6, 0.5);
          ctx.fillRect(s.x - 0.25, s.y - s.r * 3, 0.5, s.r * 6);
        }
      }

      if (motionOk) {
        if (!shooting && time > nextShoot) {
          shooting = {
            x: width * (0.35 + Math.random() * 0.55),
            y: height * (0.04 + Math.random() * 0.22),
            vx: -(width * 0.45) / SHOOT_LIFE,
            vy: (height * 0.22) / SHOOT_LIFE,
            born: time,
          };
          // 별똥별이 떨어지는 동안 제목 위쪽에서 별 2~3개가 차례로 반짝입니다
          const anchor = flareAnchor(canvas);
          const count = 2 + Math.round(Math.random());
          flares = Array.from({ length: count }, (_, i) => ({
            x: anchor.x + (i === 0 ? 0 : (Math.random() - 0.5) * 90),
            y: anchor.y + (i === 0 ? 0 : (Math.random() - 0.5) * 60),
            born: time + 150 + i * 260 + Math.random() * 120,
            life: 1100 + Math.random() * 500,
            size: i === 0 ? 1.15 : 0.7 + Math.random() * 0.3,
          }));
        }
        if (shooting) {
          const age = time - shooting.born;
          if (age > SHOOT_LIFE) {
            shooting = null;
            nextShoot = time + 6000 + Math.random() * 7000;
          } else {
            const t = age / SHOOT_LIFE;
            const hx = shooting.x + shooting.vx * age;
            const hy = shooting.y + shooting.vy * age;
            const tail = 90;
            const len = Math.hypot(shooting.vx, shooting.vy);
            const grad = ctx.createLinearGradient(
              hx,
              hy,
              hx - (shooting.vx / len) * tail,
              hy - (shooting.vy / len) * tail,
            );
            grad.addColorStop(0, "rgba(255,255,255,0.9)");
            grad.addColorStop(1, "rgba(255,255,255,0)");
            ctx.globalAlpha = Math.sin(Math.PI * t);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(hx, hy);
            ctx.lineTo(
              hx - (shooting.vx / len) * tail,
              hy - (shooting.vy / len) * tail,
            );
            ctx.stroke();
          }
        }

        flares = flares.filter((f) => time < f.born + f.life);
        for (const f of flares) {
          const t = (time - f.born) / f.life;
          if (t < 0) continue;
          // 빠르게 밝아졌다가 천천히 사라집니다
          const glow = Math.pow(Math.sin(Math.PI * Math.pow(t, 0.6)), 1.4);
          const ray = 16 * f.size * (0.6 + 0.4 * glow);
          ctx.globalAlpha = glow;
          const halo = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, ray * 0.9);
          halo.addColorStop(0, "rgba(255,255,255,0.85)");
          halo.addColorStop(0.25, "rgba(210,235,255,0.35)");
          halo.addColorStop(1, "rgba(210,235,255,0)");
          ctx.fillStyle = halo;
          ctx.beginPath();
          ctx.arc(f.x, f.y, ray * 0.9, 0, Math.PI * 2);
          ctx.fill();
          // 십자 빛: 가운데가 가장 밝고 끝으로 갈수록 가늘게
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.moveTo(f.x - ray, f.y);
          ctx.lineTo(f.x, f.y - 0.9 * f.size);
          ctx.lineTo(f.x + ray, f.y);
          ctx.lineTo(f.x, f.y + 0.9 * f.size);
          ctx.closePath();
          ctx.moveTo(f.x, f.y - ray);
          ctx.lineTo(f.x + 0.9 * f.size, f.y);
          ctx.lineTo(f.x, f.y + ray);
          ctx.lineTo(f.x - 0.9 * f.size, f.y);
          ctx.closePath();
          ctx.fill();
          ctx.beginPath();
          ctx.arc(f.x, f.y, 1.6 * f.size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.round((width * height) / 3600);
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height * 0.75,
        r: Math.random() < 0.06 ? 1.3 + Math.random() * 0.6 : 0.35 + Math.random() * 0.8,
        base: 0.4 + Math.random() * 0.6,
        speed: 0.6 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2,
      }));
      draw(performance.now());
    };

    const loop = (time: number) => {
      if (inView && !document.hidden) draw(time);
      frame = requestAnimationFrame(loop);
    };

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
    });
    io.observe(canvas);

    if (motionOk) frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      io.disconnect();
    };
  }, []);

  return (
    <section
      aria-labelledby="hero-title"
      // 투명 헤더 밑으로 헤더 높이만큼 끌어올려 화면 높이를 정확히 채웁니다. 첫 화면에는 히어로만 보입니다.
      // 가로로 눕힌 휴대폰처럼 아주 낮은 화면에서는 문구가 잘리지 않게 최소 높이를 둡니다.
      className="relative isolate -mt-[var(--header-height)] h-svh min-h-80 overflow-hidden bg-night text-night-foreground"
    >
      <Image
        src="/images/hero/joshua-tree-night-silhouette.jpg"
        alt="은하수가 보이는 밤하늘 아래 조슈아 트리 실루엣"
        fill
        priority
        sizes="100vw"
        className="hero-drift object-cover object-bottom"
      />
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full"
      />

      {/* 문구는 사진의 빈 밤하늘에만 둡니다 */}
      {/* 헤더가 겹치는 높이만큼 위쪽 여백을 더해 문구 위치는 그대로 둡니다 */}
      <div className="relative flex h-full flex-col items-center px-6 pt-[calc(var(--header-height)+6rem)] text-center md:pt-[calc(var(--header-height)+16vh)]">
        <HeroCopy />
      </div>
      {children}
    </section>
  );
}
