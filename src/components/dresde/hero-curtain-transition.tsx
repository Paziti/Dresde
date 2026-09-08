"use client";

import { useRef } from "react";

/**
 * TEMP DIAGNOSTIC BUILD — no clip-path, no useScroll, no lazy mounting.
 * Plain always-mounted, always-visible <video> right after the hero, to
 * isolate whether the file/codec/CSS itself renders before reintroducing
 * any scroll-linked animation. Every lifecycle event is logged so the
 * exact failure point (never loads vs. loads but never paints vs. plays
 * fine and something else covers it) shows up in the console instead of
 * being guessed at.
 */
export function HeroCurtainTransition() {
  const videoRef = useRef<HTMLVideoElement>(null);

  return (
    <div className="relative h-svh w-full overflow-hidden bg-dresde-black">
      <video
        ref={videoRef}
        src="/video/clipper-curtain.mp4"
        muted
        autoPlay
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        onLoadStart={() => console.log("[curtain-video] loadstart")}
        onLoadedMetadata={(e) => {
          const v = e.currentTarget;
          console.log("[curtain-video] loadedmetadata", {
            readyState: v.readyState,
            videoWidth: v.videoWidth,
            videoHeight: v.videoHeight,
            duration: v.duration,
          });
        }}
        onLoadedData={() => console.log("[curtain-video] loadeddata")}
        onCanPlay={(e) => console.log("[curtain-video] canplay, readyState=", e.currentTarget.readyState)}
        onCanPlayThrough={() => console.log("[curtain-video] canplaythrough")}
        onPlay={() => console.log("[curtain-video] play event")}
        onPlaying={() => console.log("[curtain-video] playing event")}
        onPause={() => console.log("[curtain-video] pause event")}
        onWaiting={() => console.log("[curtain-video] waiting (buffering stall)")}
        onStalled={() => console.log("[curtain-video] stalled")}
        onSuspend={() => console.log("[curtain-video] suspend")}
        onTimeUpdate={(e) => {
          const t = e.currentTarget.currentTime;
          if (t > 0 && t < 0.2) console.log("[curtain-video] timeupdate, currentTime=", t);
        }}
        onError={(e) => {
          const err = e.currentTarget.error;
          console.log("[curtain-video] ERROR", { code: err?.code, message: err?.message });
        }}
      />
    </div>
  );
}
