"use client";

import { useEffect, type RefObject } from "react";
import { usePrefersReducedMotion } from "@/lib/use-prefers-reduced-motion";

/** 이만큼(px) 스크롤해야 다음 사람으로 넘어갑니다. 덜 움직이면 지금 사람 자리에 그대로 둡니다 */
const THRESHOLD = 120;
/** 휠 입력이 이 시간(ms) 동안 없으면 모아 둔 스크롤 양을 버립니다 */
const IDLE_RESET_MS = 800;
/** 다음 사람으로 옮기는 동안(ms)과 그 뒤 트랙패드 관성 입력은 무시합니다 */
const MOVE_LOCK_MS = 600;
const MOMENTUM_GAP_MS = 120;
/**
 * 휠을 계속 굴리는 입력(값이 줄어들지 않음)은 옮긴 뒤 이 시간(ms)이 지나면 다시 받습니다.
 * 이 한도가 없으면 휠을 쉬지 않고 굴릴 때 첫 이동 뒤의 입력이 모두 막혀 "스크롤이 먹히는" 것처럼 보입니다.
 */
const MOVE_CAP_MS = 900;
/** 마우스 휠 한 칸(앞 입력과 간격이 있는 입력)은 값이 아주 작아도(맥 마우스 4px 등) 최소 이만큼으로 셉니다 */
const MIN_NOTCH = 40;
const NOTCH_GAP_MS = 40;
/** 맨 위·바닥글에서 들어올 때, 그 방향 첫 사람이 이 범위(보이는 높이 대비) 안에 있어야 붙잡습니다 */
const ENTER_RATIO = 0.9;

/**
 * People: 일정 거리(THRESHOLD) 이상 스크롤하면 그 방향 다음 사람 줄의 세로 가운데로 한 번에 옮깁니다.
 *
 * - 휠·트랙패드: 페이지가 한 칸씩 움직이지 않습니다. 스크롤 양을 모았다가 기준을 넘으면 다음 사람으로 부드럽게 옮깁니다.
 * - 터치·키보드·스크롤바: 평소처럼 움직이고, 멈췄을 때 기준보다 덜 움직였으면 지금 사람으로 되돌리고, 넘었으면 다음 사람으로 맞춥니다.
 * - 첫 사람 위(We are)·마지막 사람 아래(바닥글)로는 붙잡지 않고 평소처럼 스크롤합니다.
 * - 움직임 줄이기 설정을 켠 사람에게는 동작하지 않습니다(평소 스크롤).
 */
export function useStepToRow(listRef: RefObject<HTMLElement | null>) {
  const reduceMotion = usePrefersReducedMotion();

  useEffect(() => {
    const list = listRef.current;
    if (!list || reduceMotion) return;

    /** 지금 가운데에 맞춰 둔 사람(없으면 null: 맨 위·바닥글 쪽) */
    let current: number | null = null;
    let acc = 0;
    let lastWheel = 0;
    let lockUntil = 0;
    let moveAt = 0;
    let lastAbs = 0;
    /** 터치·키보드·스크롤바 스크롤: 시작 위치와 마지막 입력 시각 */
    let gesture = false;
    let gestureStartY = 0;
    let inputAt = 0;
    let timer = 0;

    function geometry() {
      // 상단 고정 머리글(문서의 첫 header) 아래쪽 끝 = 보이는 영역의 위 끝
      const top = Math.max(0, document.querySelector("header")?.getBoundingClientRect().bottom ?? 0);
      const visible = window.innerHeight - top;
      const centers = Array.from(list!.children).map((row) => {
        const box = row.getBoundingClientRect();
        return box.top + box.height / 2;
      });
      return { mid: top + visible / 2, visible, centers };
    }

    /** 지금 사람이 화면 가운데에서 많이 벗어났으면(스크롤바로 멀리 옮긴 경우 등) 놓아줍니다 */
    function verifyCurrent() {
      if (current === null) return;
      const { mid, visible, centers } = geometry();
      if (Math.abs(centers[current] - mid) > visible / 2) current = null;
    }

    function targetFor(dir: number): number | null {
      const { mid, visible, centers } = geometry();
      if (current !== null) {
        const next = current + dir;
        return next >= 0 && next < centers.length ? next : null;
      }
      // 맨 위·바닥글에서 들어올 때: 스크롤하는 방향 앞쪽에 있는 첫 사람(반대쪽으로 끌어당기지 않습니다)
      let i = -1;
      if (dir > 0) i = centers.findIndex((c) => c > mid + 2);
      else {
        for (let k = centers.length - 1; k >= 0; k--) {
          if (centers[k] < mid - 2) {
            i = k;
            break;
          }
        }
      }
      if (i < 0 || Math.abs(centers[i] - mid) > visible * ENTER_RATIO) return null;
      return i;
    }

    /** 터치·키보드로 이미 움직인 뒤(맞춘 사람이 없을 때): 화면 가운데 가까이 온 사람이 있으면 그 사람 */
    function nearestAfterMove(): number | null {
      const { mid, visible, centers } = geometry();
      let best = -1;
      centers.forEach((c, i) => {
        if (best < 0 || Math.abs(c - mid) < Math.abs(centers[best] - mid)) best = i;
      });
      return best >= 0 && Math.abs(centers[best] - mid) < visible * 0.35 ? best : null;
    }

    function moveTo(index: number) {
      const { mid, centers } = geometry();
      current = index;
      moveAt = performance.now();
      lockUntil = moveAt + MOVE_LOCK_MS;
      const distance = centers[index] - mid;
      if (Math.abs(distance) >= 2) window.scrollTo({ top: window.scrollY + distance, behavior: "smooth" });
    }

    /* ── 휠·트랙패드: 스크롤 양을 모아 기준을 넘으면 한 번에 ── */
    const onWheel = (event: WheelEvent) => {
      if (event.ctrlKey) return; // 확대·축소
      const dy = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaMode === 2 ? event.deltaY * window.innerHeight : event.deltaY;
      if (Math.abs(dy) < Math.abs(event.deltaX)) return; // 가로 스크롤
      const dir = Math.sign(dy);
      if (!dir) return;
      const now = performance.now();
      const gap = now - lastWheel;
      const size = Math.abs(dy);
      // 휠은 여기서만 처리합니다. 앞서 클릭(pointerdown)으로 남은 "터치·스크롤바 스크롤" 기록이
      // 휠 이동 뒤에 한 번 더 옮기지 않게(한 사람을 건너뛰지 않게) 지웁니다.
      gesture = false;
      window.clearTimeout(timer);

      // 옮기는 중이거나 바로 이어지는 관성 입력: 페이지를 붙잡아 둡니다.
      // 관성(트랙패드)은 값이 점점 줄어들고, 계속 굴리는 휠은 줄지 않으므로 MOVE_CAP_MS 뒤에는 다시 받습니다.
      if (current !== null && lockUntil > 0) {
        const momentum = gap < MOMENTUM_GAP_MS && (size < lastAbs || now - moveAt < MOVE_CAP_MS);
        if (now < lockUntil || momentum) {
          event.preventDefault();
          lastWheel = now;
          lastAbs = size;
          return;
        }
        lockUntil = 0;
      }

      verifyCurrent();
      const target = targetFor(dir);
      if (target === null) {
        // 첫 사람 위·마지막 사람 아래: 평소 스크롤
        current = null;
        acc = 0;
        return;
      }
      event.preventDefault();
      if (gap > IDLE_RESET_MS || Math.sign(acc) !== dir) acc = 0;
      lastWheel = now;
      lastAbs = size;
      // 마우스 휠 한 칸은 최소 MIN_NOTCH 로 셉니다(맥 마우스처럼 한 칸 값이 아주 작아도 서너 칸이면 넘어감).
      // 트랙패드처럼 촘촘히 이어지는 입력은 실제 값 그대로 더합니다.
      acc += gap > NOTCH_GAP_MS ? dir * Math.max(size, MIN_NOTCH) : dy;
      if (Math.abs(acc) >= THRESHOLD) {
        acc = 0;
        moveTo(target);
      }
    };

    /* ── 터치·키보드·스크롤바: 멈춘 뒤 움직인 거리로 판단 ── */
    function finishGesture() {
      if (!gesture) return;
      const wait = 180 - (performance.now() - inputAt);
      if (wait > 0) {
        window.clearTimeout(timer);
        timer = window.setTimeout(finishGesture, wait);
        return;
      }
      gesture = false;
      const moved = window.scrollY - gestureStartY;
      const dir = Math.sign(moved);
      if (!dir) return;
      if (current !== null && Math.abs(moved) < THRESHOLD) {
        // 기준보다 덜 움직임: 지금 사람으로 되돌립니다
        moveTo(current);
        return;
      }
      if (current !== null) {
        // 기준을 넘음: 그 방향에 있는 사람 중 지금 화면 가운데에 가장 가까운 사람(여러 사람을 지나쳤어도)
        const { mid, centers } = geometry();
        let candidate = -1;
        centers.forEach((c, i) => {
          if ((dir > 0 ? i > current! : i < current!) && (candidate < 0 || Math.abs(c - mid) < Math.abs(centers[candidate] - mid))) {
            candidate = i;
          }
        });
        if (candidate < 0) {
          // 첫 사람 위·마지막 사람 아래로 나감: 평소 스크롤
          current = null;
          return;
        }
        moveTo(candidate);
        return;
      }
      const target = nearestAfterMove();
      if (target !== null) moveTo(target);
    }
    const onGestureInput = (event: Event) => {
      if (event.type === "keydown") {
        const key = (event as KeyboardEvent).key;
        if (!["ArrowDown", "ArrowUp", "PageDown", "PageUp", " ", "Home", "End"].includes(key)) return;
      }
      if (!gesture) {
        gesture = true;
        gestureStartY = window.scrollY;
      }
      inputAt = performance.now();
    };
    // 클릭만 하고 스크롤하지 않았으면(스크롤바를 끌지 않음) 기록을 지웁니다
    const onPointerUp = () => {
      if (gesture && Math.abs(window.scrollY - gestureStartY) < 2) gesture = false;
    };
    const onScrollEnd = () => finishGesture();
    const onScroll = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(finishGesture, 180);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    const inputs = ["touchstart", "keydown", "pointerdown"] as const;
    inputs.forEach((type) => window.addEventListener(type, onGestureInput, { passive: true }));
    window.addEventListener("pointerup", onPointerUp, { passive: true });
    const hasScrollEnd = "onscrollend" in window;
    if (hasScrollEnd) window.addEventListener("scrollend", onScrollEnd);
    else window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("wheel", onWheel);
      inputs.forEach((type) => window.removeEventListener(type, onGestureInput));
      window.removeEventListener("pointerup", onPointerUp);
      if (hasScrollEnd) window.removeEventListener("scrollend", onScrollEnd);
      else window.removeEventListener("scroll", onScroll);
    };
  }, [listRef, reduceMotion]);
}
