import { useEffect, useRef, useState } from "react";

export interface LiquidMercuryProps {
  /** Additional CSS class names */
  className?: string;
  /** Whether the fluid responds to cursor/pointer interaction (default: true) */
  interactive?: boolean;
  /** Overall animation speed multiplier (default: 0.65 — viscous molten metal) */
  speed?: number;
  /** Opacity of the canvas layer (default: 0.75) */
  canvasOpacity?: number;
  /** Whether to render the ambient CSS underlayer (default: true) */
  ambientGlow?: boolean;
  /** Whether to overlay the micro-grain noise to eliminate 8-bit color banding (default: true) */
  grainOverlay?: boolean;
  /** Custom focal offset [x, y] to position the mass in composition space */
  focalOffset?: [number, number];
  /** Whether the background outside the fluid shapes is transparent (default: false) */
  transparentBackground?: boolean;
}

const vsSource = `
  attribute vec2 position;
  void main() {
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fsSource = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
  uniform vec2 u_offset;
  uniform float u_time;
  uniform float u_motion_scale;
  uniform float u_theme; // 0.0 = dark, 1.0 = light
  uniform float u_transparent; // 0.0 = solid background, 1.0 = alpha transparent

  // Smooth minimum for seamless liquid melding
  float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
  }

  // Signed Distance Field (SDF) of curved metallic torus and fluid spheres
  float map(vec3 p) {
    // Subtle, viscous mouse disturbance
    vec2 m = (u_mouse / u_resolution - 0.5) * 2.0;

    // Heavy, molten metal breathing rhythm (slow shape evolution)
    float t1 = u_time * 0.14;
    float t2 = u_time * 0.10;

    // Curved organic metallic torus ring with slow breathing
    vec2 q = vec2(length(p.xz) - 1.15 + sin(t2) * 0.025 * u_motion_scale, p.y - 0.38 + cos(t1 * 0.8) * 0.02 * u_motion_scale);
    float torus = length(q) - (0.34 + sin(t1) * 0.015 * u_motion_scale);

    // Viscous fluid mass pulling gently toward cursor
    vec3 fluidPos = vec3(
      m.x * 0.22 + sin(t1 * 0.5) * 0.05 * u_motion_scale,
      -0.32 + m.y * 0.15 + cos(t2 * 0.6) * 0.04 * u_motion_scale,
      sin(t1 * 0.4) * 0.08
    );
    float sphere1 = length(p - fluidPos) - 0.72;

    // Secondary fluid crest
    vec3 crestPos = vec3(-0.50 + cos(t2 * 0.4) * 0.04, 0.22 + sin(t1 * 0.5) * 0.03, 0.12);
    float sphere2 = length(p - crestPos) - 0.58;

    float liquid = smin(torus, sphere1, 0.45);
    liquid = smin(liquid, sphere2, 0.40);
    return liquid;
  }

  vec3 calcNormal(vec3 p) {
    vec2 e = vec2(0.001, 0.0);
    return normalize(vec3(
      map(p + e.xyy) - map(p - e.xyy),
      map(p + e.yxy) - map(p - e.yxy),
      map(p + e.yyx) - map(p - e.yyx)
    ));
  }

  void main() {
    // Normalized coordinates centered and shifted by compositional offset
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
    uv -= u_offset;

    vec3 ro = vec3(0.0, 0.0, 2.5);
    vec3 rd = normalize(vec3(uv, -1.25));

    float dO = 0.0;
    float hit = 0.0;
    vec3 p;

    // Optimized raymarch budget: 34 steps for silky 60fps GPU performance
    for (int i = 0; i < 34; i++) {
      p = ro + rd * dO;
      float dS = map(p);
      if (abs(dS) < 0.003) {
        hit = 1.0;
        break;
      }
      if (dO > 5.5) break;
      dO += dS * 0.68;
    }

    // Obsidian pitch-black base (#050608) vs Warm editorial ivory (#F3F1EC)
    vec3 col = mix(vec3(0.020, 0.024, 0.031), vec3(0.953, 0.945, 0.925), u_theme);

    if (hit > 0.5) {
      vec3 n = calcNormal(p);
      vec3 viewDir = normalize(ro - p);

      // Controlled Fresnel edge
      float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 3.8);

      // Directional light for graphite / charcoal slope
      vec3 lightDir = normalize(vec3(0.35, 0.9, 0.55));
      float diff = max(dot(n, lightDir), 0.0);

      // Specular catchlight
      vec3 reflectDir = reflect(-lightDir, n);
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);

      // Dark polished metal body: deep graphite into charcoal
      vec3 darkCharcoalBody = mix(vec3(0.025, 0.028, 0.036), vec3(0.12, 0.13, 0.16), diff);
      vec3 darkSilverRim = vec3(0.92, 0.94, 0.97);

      // Light polished metal body: warm silver-gray shifting to deep graphite contour
      vec3 lightSilverBody = mix(vec3(0.85, 0.84, 0.81), vec3(0.48, 0.50, 0.54), diff);
      vec3 lightCharcoalRim = vec3(0.14, 0.15, 0.18);

      vec3 metalBody = mix(darkCharcoalBody, lightSilverBody, u_theme);
      vec3 metalRim = mix(darkSilverRim, lightCharcoalRim, u_theme);

      // Micro-hint of warm RUBIX signal reflection along glancing secondary angle
      vec3 warmLightDir = normalize(vec3(-0.8, -0.2, 0.4));
      float warmDiff = pow(max(dot(n, warmLightDir), 0.0), 16.0);
      vec3 orangeSignal = mix(vec3(0.976, 0.451, 0.086), vec3(0.910, 0.400, 0.063), u_theme);

      col = mix(metalBody, metalRim, fresnel * 0.78 + spec * 0.42);
      col += orangeSignal * warmDiff * 0.04;

      if (u_transparent < 0.5) {
        float vig = mix(0.45, 0.14, u_theme);
        col *= 1.0 - vig * length(uv);
      }

      gl_FragColor = vec4(col, 1.0);
    } else {
      if (u_transparent > 0.5) {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
      } else {
        float vig = mix(0.45, 0.14, u_theme);
        col *= 1.0 - vig * length(uv);
        gl_FragColor = vec4(col, 1.0);
      }
    }
  }
`;

export function LiquidMercury({
  className = "",
  interactive = true,
  speed = 0.65,
  canvasOpacity = 0.75,
  ambientGlow = true,
  grainOverlay = true,
  focalOffset,
  transparentBackground = false,
}: LiquidMercuryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // Detect touch device to disable pointer tracking (preserves smooth touch scrolling)
    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    // Initialize WebGL
    let gl: WebGLRenderingContext | null = null;
    try {
      gl =
        canvas.getContext("webgl", {
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }) ||
        (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    } catch {
      setHasWebGL(false);
      return;
    }

    if (!gl) {
      setHasWebGL(false);
      return;
    }

    // Shader compilation helper
    function buildShader(
      ctx: WebGLRenderingContext,
      type: number,
      src: string
    ): WebGLShader | null {
      const shader = ctx.createShader(type);
      if (!shader) return null;
      ctx.shaderSource(shader, src);
      ctx.compileShader(shader);
      if (!ctx.getShaderParameter(shader, ctx.COMPILE_STATUS)) {
        console.warn("[LiquidMercury] Shader compile error:", ctx.getShaderInfoLog(shader));
        ctx.deleteShader(shader);
        return null;
      }
      return shader;
    }

    const vs = buildShader(gl, gl.VERTEX_SHADER, vsSource);
    const fs = buildShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) {
      setHasWebGL(false);
      return;
    }

    const prog = gl.createProgram();
    if (!prog) {
      setHasWebGL(false);
      return;
    }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("[LiquidMercury] Program link error:", gl.getProgramInfoLog(prog));
      setHasWebGL(false);
      return;
    }
    gl.useProgram(prog);

    // Fullscreen quad buffer
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 1, -1, -1, 1,
        -1, 1, 1, -1, 1, 1,
      ]),
      gl.STATIC_DRAW
    );

    const pos = gl.getAttribLocation(prog, "position");
    gl.enableVertexAttribArray(pos);
    gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "u_resolution");
    const uMouse = gl.getUniformLocation(prog, "u_mouse");
    const uOffset = gl.getUniformLocation(prog, "u_offset");
    const uTime = gl.getUniformLocation(prog, "u_time");
    const uMotionScale = gl.getUniformLocation(prog, "u_motion_scale");
    const uTheme = gl.getUniformLocation(prog, "u_theme");
    const uTransparent = gl.getUniformLocation(prog, "u_transparent");

    let currentTheme = 0.0;
    const updateThemeUniform = () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      currentTheme = isLight ? 1.0 : 0.0;
      if (gl && uTheme) {
        gl.uniform1f(uTheme, currentTheme);
      }
    };
    updateThemeUniform();

    const themeObserver = new MutationObserver(() => {
      updateThemeUniform();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const handleThemeEvent = () => updateThemeUniform();
    window.addEventListener("theme-changed", handleThemeEvent);

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const setInitialCenter = () => {
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      targetMouseX = w * 0.5;
      targetMouseY = h * 0.5;
      mouseX = targetMouseX;
      mouseY = targetMouseY;
    };
    setInitialCenter();

    // Smooth viscous pointer handling with lerp interpolation
    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      if (!interactive || isTouchDevice) return;
      const rect = container.getBoundingClientRect();
      targetMouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      targetMouseY = Math.max(0, Math.min(rect.height - (e.clientY - rect.top), rect.height));
    };

    if (interactive && !isTouchDevice) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
    }

    // Adaptive DPR and composition offset based on viewport
    const getAdaptiveSettings = () => {
      const w = container.clientWidth || window.innerWidth;
      const isMobile = w <= 767;
      const isTablet = w > 767 && w <= 1024;

      let dpr = 1.5;
      if (isMobile) dpr = 1.0;
      else if (isTablet) dpr = 1.25;
      else dpr = Math.min(window.devicePixelRatio || 1, 1.75);

      // Default composition focal offset (places mass on right side)
      let offset: [number, number] = [0.38, 0.02];
      if (focalOffset) {
        offset = focalOffset;
      } else if (isMobile) {
        offset = [0.15, 0.22]; // Upper-right on mobile away from headline
      }

      const motionScale = isMobile ? 0.6 : 1.0;

      return { dpr, offset, motionScale };
    };

    const updateSize = () => {
      if (!canvas || !gl || !container) return;
      const { dpr, offset, motionScale } = getAdaptiveSettings();
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;

      const newWidth = Math.floor(w * dpr);
      const newHeight = Math.floor(h * dpr);

      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        canvas.width = newWidth;
        canvas.height = newHeight;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }

      gl.uniform2f(uOffset, offset[0], offset[1]);
      gl.uniform1f(uMotionScale, motionScale);
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);
    updateSize();

    // IntersectionObserver to pause rendering when offscreen (consumes 0% GPU when scrolled away)
    let isVisible = true;
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible = entry.isIntersecting;
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    let animationFrameId: number | null = null;
    const startTime = performance.now();

    // Render loop
    const render = (time: number) => {
      if (prefersReducedMotion) {
        // Render single calm static frame and stop
        const { offset, motionScale } = getAdaptiveSettings();
        gl?.uniform2f(uRes, canvas.width, canvas.height);
        gl?.uniform2f(uMouse, canvas.width * 0.5, canvas.height * 0.5);
        gl?.uniform2f(uOffset, offset[0], offset[1]);
        gl?.uniform1f(uMotionScale, motionScale);
        gl?.uniform1f(uTheme, currentTheme);
        gl?.uniform1f(uTransparent, transparentBackground ? 1.0 : 0.0);
        gl?.uniform1f(uTime, 1.25);
        gl?.drawArrays(gl.TRIANGLES, 0, 6);
        return;
      }

      if (isVisible && gl) {
        // Slow viscous lerp
        const lerpFactor = 0.025;
        mouseX += (targetMouseX - mouseX) * lerpFactor;
        mouseY += (targetMouseY - mouseY) * lerpFactor;

        const { dpr, offset, motionScale } = getAdaptiveSettings();
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform2f(uMouse, mouseX * dpr, mouseY * dpr);
        gl.uniform2f(uOffset, offset[0], offset[1]);
        gl.uniform1f(uMotionScale, motionScale);
        gl.uniform1f(uTheme, currentTheme);
        gl.uniform1f(uTransparent, transparentBackground ? 1.0 : 0.0);
        gl.uniform1f(uTime, (time - startTime) * 0.001 * speed);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    // Teardown and GPU cleanup
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      themeObserver.disconnect();
      window.removeEventListener("theme-changed", handleThemeEvent);
      if (interactive && !isTouchDevice) {
        window.removeEventListener("pointermove", handlePointerMove);
      }
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      if (gl) {
        gl.deleteBuffer(buf);
        gl.deleteProgram(prog);
        gl.deleteShader(vs);
        gl.deleteShader(fs);
        const loseCtx = gl.getExtension("WEBGL_lose_context");
        if (loseCtx) loseCtx.loseContext();
      }
    };
  }, [interactive, speed, focalOffset, transparentBackground]);

  return (
    <div
      ref={containerRef}
      data-slot="liquid-mercury-background"
      className={`relative w-full h-full overflow-hidden ${transparentBackground ? "bg-transparent" : "bg-[var(--bg-canvas)]"} select-none ${className}`}
      aria-hidden="true"
    >
      {/* Pure CSS Ambient Underlayer (biased to right 35-45%) */}
      {ambientGlow && !transparentBackground && (
        <div
          className="absolute -inset-[20%] pointer-events-none opacity-30 filter blur-[48px] z-[1] transition-opacity duration-300"
          style={{
            background: `
              radial-gradient(ellipse 55% 35% at 70% 25%, rgba(235, 242, 250, 0.4) 0%, rgba(255, 255, 255, 0) 70%),
              radial-gradient(ellipse 60% 45% at 65% 85%, rgba(180, 195, 215, 0.12) 0%, rgba(5, 6, 8, 0) 80%),
              radial-gradient(circle at 60% 50%, var(--bg-surface) 0%, var(--bg-canvas) 100%)
            `,
          }}
        />
      )}

      {/* Live Interactive WebGL Shader Canvas */}
      {hasWebGL ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-[2] block pointer-events-none"
          style={{ opacity: canvasOpacity }}
        />
      ) : (
        /* Controlled CSS Fallback if WebGL is unavailable */
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background: `
              radial-gradient(
                ellipse at 75% 30%,
                var(--text-tertiary),
                var(--bg-surface) 35%,
                transparent 68%
              ),
              var(--bg-canvas)
            `,
          }}
        />
      )}

      {/* SVG Micro-Grain Noise Overlay (nearly invisible, banding control only) */}
      {grainOverlay && !transparentBackground && (
        <svg
          className="absolute inset-0 w-full h-full z-[3] pointer-events-none opacity-[0.015] mix-blend-overlay"
          xmlns="http://www.w3.org/2000/svg"
        >
          <filter id="liquidMercuryNoise">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.8"
              numOctaves={3}
              stitchTiles="stitch"
            />
          </filter>
          <rect width="100%" height="100%" filter="url(#liquidMercuryNoise)" />
        </svg>
      )}
    </div>
  );
}
