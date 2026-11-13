"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

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

/**
 * 메인 히어로: 조슈아 트리 밤하늘 사진 위에 반짝이는 별(캔버스)을 겹칩니다.
 * 움직임을 줄이도록 설정한 사용자에게는 정지한 별만 그립니다.
 */
export function HeroNightSky() {
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
        src="/images/hero-joshua-tree.jpg"
        alt="밤하늘 아래 조슈아 트리"
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
        <h1
          id="hero-title"
          className="m-0 flex flex-col items-center gap-4 md:gap-5"
        >
          <Image
            src="/images/k-ganada-logo.svg"
            alt="K-GANADA™"
            width={320}
            height={40}
            unoptimized
            priority
            className="block h-auto w-60 md:w-80"
          />
          <span className="text-xl leading-tight font-medium md:text-[1.75rem]">
            K-IP Commerce Platform
          </span>
        </h1>
      </div>
    </section>
  );
}
