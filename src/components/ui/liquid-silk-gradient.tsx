import { useEffect, useRef, useState } from "react";

export interface LiquidSilkGradientProps {
  /** Additional CSS class names */
  className?: string;
  /** Whether the silk responds subtly to cursor movement (desktop only, default: true) */
  interactive?: boolean;
  /** Overall animation speed multiplier (default: 0.42 — slow, meditative 8-16s cycle) */
  speed?: number;
  /** Opacity of the canvas layer (default: 0.92) */
  canvasOpacity?: number;
  /** Custom focal offset [x, y] to position the fold field in composition space */
  focalOffset?: [number, number];
  /** Whether the background outside the folds is transparent (default: true) */
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
  uniform float u_theme;        // 0.0 = dark, 1.0 = light (lerped smoothly)
  uniform float u_transparent;  // 0.0 = solid, 1.0 = alpha transparent
  uniform float u_opacity;      // overall canvas opacity multiplier

  // Rotated coordinates for diagonal silk drape (~35 deg angle)
  const mat2 rot = mat2(0.819, -0.574, 0.574, 0.819);

  // Volumetric silk drapery heightfield (multi-ribbon cascade, deep valleys, luminous crests)
  float getSilkHeight(vec2 uv, float t, vec2 m) {
    vec2 p = rot * (uv - u_offset);
    p += m * 0.04 * u_motion_scale;

    // Multi-frequency cloth domain warping for organic fluid drapery
    float w1 = sin(p.y * 3.4 + t * 0.24) * 0.85;
    float w2 = cos(p.y * 5.2 - t * 0.16) * 0.35;
    float w3 = sin((p.x * 3.0 + p.y * 2.0) + t * 0.18) * 0.25;

    // Fold band coordinate scaled for 4-6 sweeping ribbons across viewport
    float band = p.x * 10.5 + w1 + w2 + w3;

    // Fabric fold profile: sharp shadow crease, rounded luminous ridge
    float s1 = sin(band);
    float s2 = sin(band * 2.0 + 1.35) * 0.30;
    float profile = s1 + s2;

    // Subtle undulation along the length of the silk ribbons
    float lengthMod = 0.90 + 0.10 * cos(p.y * 3.5 + t * 0.14);

    return profile * lengthMod;
  }

  // Analytical 4-tap normal for realistic cloth shading
  vec3 getSilkNormal(vec2 uv, float t, vec2 m) {
    float eps = 0.0035;
    float hL = getSilkHeight(uv - vec2(eps, 0.0), t, m);
    float hR = getSilkHeight(uv + vec2(eps, 0.0), t, m);
    float hD = getSilkHeight(uv - vec2(0.0, eps), t, m);
    float hU = getSilkHeight(uv + vec2(0.0, eps), t, m);

    return normalize(vec3((hL - hR) * 3.2, (hD - hU) * 3.2, 0.28));
  }

  void main() {
    vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.y, u_resolution.x);
    vec2 screenUV = gl_FragCoord.xy / u_resolution.xy;
    vec2 m = (u_mouse / u_resolution - 0.5) * 2.0;

    float t = u_time;
    float h = getSilkHeight(uv, t, m);
    vec3 n = getSilkNormal(uv, t, m);

    // Key light coming from upper-left
    vec3 lightDir = normalize(vec3(-0.40, 0.80, 0.55));
    float diff = max(dot(n, lightDir), 0.0);

    // Specular highlight on the ridge
    vec3 viewDir = vec3(0.0, 0.0, 1.0);
    vec3 halfDir = normalize(lightDir + viewDir);
    float spec = pow(max(dot(n, halfDir), 0.0), 22.0);

    // Anisotropic velvet silk sheen (very strong along folds)
    float sheen = pow(1.0 - abs(dot(n, viewDir)), 2.6);

    // Ridge elevation normalized 0.0 to 1.0
    float elevation = clamp(0.5 + h * 0.55, 0.0, 1.0);

    // -------------------------------------------------------------
    // HERO TEXT PROTECTION (Section 11)
    // Left 45-55% has lower luminance and calmer motion to protect
    // Ranade typography ("Design. Development. Knowledge.")
    // -------------------------------------------------------------
    float textCalm = smoothstep(0.22, 0.72, screenUV.x);

    // -------------------------------------------------------------
    // DARK THEME PALETTE (RUBIX system + restrained violet/blue)
    // -------------------------------------------------------------
    vec3 darkBase    = vec3(0.027, 0.031, 0.039); // #07080A obsidian
    vec3 darkValley  = vec3(0.040, 0.045, 0.068); // deep velvet shadow
    vec3 darkMid     = vec3(0.120, 0.135, 0.200); // charcoal graphite
    vec3 darkViolet  = vec3(0.318, 0.275, 0.784); // #5146C8 cool energy
    vec3 darkBlue    = vec3(0.420, 0.510, 0.860); // #7184D9 periwinkle silk
    vec3 darkSilver  = vec3(0.860, 0.890, 0.940); // #D8DEE8 luminous ridge
    vec3 darkOrange  = vec3(0.976, 0.451, 0.086); // #F97316 signal

    // Color ramp along fold:
    vec3 dCol = mix(darkValley, darkMid, smoothstep(0.18, 0.48, elevation));
    // Violet/blue sheen on the rising slope of the fold
    dCol = mix(dCol, darkViolet, smoothstep(0.38, 0.72, elevation) * 0.55 + sheen * 0.35);
    dCol = mix(dCol, darkBlue, smoothstep(0.62, 0.88, elevation) * 0.45);
    // Silver luminous highlight on the ridge crest
    dCol = mix(dCol, darkSilver, smoothstep(0.75, 1.0, elevation) * 0.72 + spec * 0.52);

    // Micro hint of warm orange rim on glancing angles
    vec3 warmLight = normalize(vec3(0.6, -0.4, 0.5));
    float warmRim = pow(max(dot(n, warmLight), 0.0), 14.0);
    dCol += darkOrange * warmRim * 0.04;

    // Dim down on the left side to protect Ranade typography
    dCol = mix(darkBase, dCol, textCalm);

    // -------------------------------------------------------------
    // LIGHT THEME (Pearl, Frosted Silk, Ivory)
    // -------------------------------------------------------------
    vec3 lightBase   = vec3(0.953, 0.945, 0.925); // #F3F1EC ivory
    vec3 lightValley = vec3(0.770, 0.765, 0.755); // #C8C9CD pearl shadow
    vec3 lightMid    = vec3(0.900, 0.895, 0.880); // soft body
    vec3 lightLavender = vec3(0.840, 0.850, 0.910); // restrained cool lavender-gray
    vec3 lightSilver = vec3(0.980, 0.978, 0.972); // #F8F7F4 frosted silk
    vec3 lightOrange = vec3(0.910, 0.400, 0.063); // #E86610

    vec3 lCol = mix(lightValley, lightMid, smoothstep(0.15, 0.58, elevation));
    lCol = mix(lCol, lightLavender, smoothstep(0.42, 0.78, elevation) * 0.32 + sheen * 0.28);
    lCol = mix(lCol, lightSilver, smoothstep(0.72, 1.0, elevation) * 0.58 + spec * 0.42);
    lCol += lightOrange * warmRim * 0.025;
    lCol = mix(lightBase, lCol, textCalm);

    vec3 finalCol = mix(dCol, lCol, u_theme);

    // -------------------------------------------------------------
    // ORGANIC BOUNDARY ATTENUATION (Zero Box / Zero Rectangular Bounds)
    // -------------------------------------------------------------
    // Guaranteed to drop smoothly to absolute 0.0 before reaching any canvas border:
    float fadeL = smoothstep(0.01, 0.32, screenUV.x);
    float fadeR = smoothstep(0.99, 0.76, screenUV.x);
    float fadeB = smoothstep(0.01, 0.24, screenUV.y);
    float fadeT = smoothstep(0.99, 0.78, screenUV.y);
    float boundaryFade = fadeL * fadeR * fadeB * fadeT;

    // Base fold alpha
    float foldAlpha = smoothstep(0.04, 0.48, elevation) * 0.88 + sheen * 0.32 + spec * 0.44;
    foldAlpha = clamp(foldAlpha, 0.0, 1.0);

    // Apply text protection, boundary attenuation, and user opacity
    float finalAlpha = foldAlpha * mix(0.12, 1.0, textCalm) * boundaryFade * u_opacity;
    finalAlpha = clamp(finalAlpha, 0.0, 1.0);

    // Seamlessly blend RGB color towards the active page background as it approaches boundaries
    vec3 activeBase = mix(darkBase, lightBase, u_theme);
    vec3 outCol = mix(activeBase, finalCol, boundaryFade);

    if (u_transparent > 0.5) {
      // Premultiplied alpha output ensures mathematically flawless blending over DOM background
      gl_FragColor = vec4(outCol * finalAlpha, finalAlpha);
    } else {
      gl_FragColor = vec4(outCol, 1.0);
    }
  }
`;

export function LiquidSilkGradient({
  className = "",
  interactive = true,
  speed = 0.42,
  canvasOpacity = 0.92,
  focalOffset,
  transparentBackground = true,
}: LiquidSilkGradientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const isTouchDevice =
      typeof window !== "undefined" &&
      ("ontouchstart" in window || navigator.maxTouchPoints > 0);

    let gl: WebGLRenderingContext | null = null;
    try {
      const glAttribs: WebGLContextAttributes = {
        antialias: true,
        alpha: true,
        premultipliedAlpha: true,
        powerPreference: "high-performance",
      };
      gl =
        (canvas.getContext("webgl", glAttribs) as WebGLRenderingContext | null) ||
        (canvas.getContext("experimental-webgl", glAttribs) as WebGLRenderingContext | null);
    } catch {
      setHasWebGL(false);
      return;
    }

    if (!gl) {
      setHasWebGL(false);
      return;
    }

    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

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
        console.warn("[LiquidSilk] Shader compile error:", ctx.getShaderInfoLog(shader));
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
      console.warn("[LiquidSilk] Program link error:", gl.getProgramInfoLog(prog));
      setHasWebGL(false);
      return;
    }
    gl.useProgram(prog);

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
    const uOpacity = gl.getUniformLocation(prog, "u_opacity");

    let currentTheme = document.documentElement.getAttribute("data-theme") === "light" ? 1.0 : 0.0;
    let targetTheme = currentTheme;

    const updateTargetTheme = () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      targetTheme = isLight ? 1.0 : 0.0;
    };

    const themeObserver = new MutationObserver(() => {
      updateTargetTheme();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const handleThemeEvent = () => updateTargetTheme();
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

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
      if (!interactive || isTouchDevice) return;
      const rect = container.getBoundingClientRect();
      targetMouseX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      targetMouseY = Math.max(0, Math.min(rect.height - (e.clientY - rect.top), rect.height));
    };

    if (interactive && !isTouchDevice) {
      window.addEventListener("pointermove", handlePointerMove, { passive: true });
    }

    const getAdaptiveSettings = () => {
      const w = container.clientWidth || window.innerWidth;
      const isMobile = w <= 767;
      const isTablet = w > 767 && w <= 1024;

      let dpr = 1.5;
      if (isMobile) dpr = 1.0;
      else if (isTablet) dpr = 1.25;
      else dpr = Math.min(window.devicePixelRatio || 1, 1.75);

      let offset: [number, number] = [0.22, 0.0];
      if (focalOffset) {
        offset = [
          focalOffset[0] + (isMobile ? 0.12 : isTablet ? 0.08 : 0.0),
          focalOffset[1] + (isMobile ? 0.05 : 0.0),
        ];
      } else if (isMobile) {
        offset = [0.30, 0.06];
      } else if (isTablet) {
        offset = [0.26, 0.03];
      }

      const motionScale = isMobile ? 0.55 : 1.0;
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

    const render = (time: number) => {
      if (prefersReducedMotion) {
        const { offset, motionScale } = getAdaptiveSettings();
        gl?.clearColor(0.0, 0.0, 0.0, 0.0);
        gl?.clear(gl.COLOR_BUFFER_BIT);
        gl?.uniform2f(uRes, canvas.width, canvas.height);
        gl?.uniform2f(uMouse, canvas.width * 0.5, canvas.height * 0.5);
        gl?.uniform2f(uOffset, offset[0], offset[1]);
        gl?.uniform1f(uMotionScale, motionScale);
        gl?.uniform1f(uTheme, targetTheme);
        gl?.uniform1f(uTransparent, transparentBackground ? 1.0 : 0.0);
        gl?.uniform1f(uOpacity, canvasOpacity);
        gl?.uniform1f(uTime, 2.4);
        gl?.drawArrays(gl.TRIANGLES, 0, 6);
        return;
      }

      if (isVisible && gl) {
        const lerpFactor = 0.03;
        mouseX += (targetMouseX - mouseX) * lerpFactor;
        mouseY += (targetMouseY - mouseY) * lerpFactor;

        const themeLerp = 0.08;
        if (Math.abs(targetTheme - currentTheme) > 0.002) {
          currentTheme += (targetTheme - currentTheme) * themeLerp;
        } else {
          currentTheme = targetTheme;
        }

        const { dpr, offset, motionScale } = getAdaptiveSettings();
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform2f(uMouse, mouseX * dpr, mouseY * dpr);
        gl.uniform2f(uOffset, offset[0], offset[1]);
        gl.uniform1f(uMotionScale, motionScale);
        gl.uniform1f(uTheme, currentTheme);
        gl.uniform1f(uTransparent, transparentBackground ? 1.0 : 0.0);
        gl.uniform1f(uOpacity, canvasOpacity);
        gl.uniform1f(uTime, (time - startTime) * 0.001 * speed);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

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
  }, [interactive, speed, focalOffset, transparentBackground, canvasOpacity]);

  return (
    <div
      ref={containerRef}
      data-slot="liquid-silk-gradient"
      className={`relative w-full h-full overflow-hidden ${transparentBackground ? "bg-transparent" : "bg-[var(--bg-canvas)]"} select-none ${className}`}
      aria-hidden="true"
    >
      {hasWebGL ? (
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full z-[2] block pointer-events-none"
        />
      ) : (
        <div
          className="absolute inset-0 z-[2] pointer-events-none"
          style={{
            background: `
              radial-gradient(
                ellipse at 75% 35%,
                var(--text-tertiary),
                var(--bg-surface) 40%,
                transparent 72%
              ),
              var(--bg-canvas)
            `,
          }}
        />
      )}
    </div>
  );
}
