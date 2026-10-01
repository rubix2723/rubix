import { useEffect, useRef, useState } from "react";
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";

export interface ShaderLinesProps {
  /** Speed multiplier (default: 0.2 — controlled architectural motion) */
  speed?: number;
  /** Intensity multiplier for line brightness (default: 1.0) */
  intensity?: number;
  /** Signal accent mix 0.0 - 1.0 (default: 0.15 — subtle orange energy) */
  signalMix?: number;
  /** Active capability index (0-3) to smoothly modulate line frequency */
  activeState?: number;
  /** Additional CSS class names */
  className?: string;
}

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = `
uniform float uTime;
uniform vec2 uResolution;
uniform float uIntensity;
uniform float uSignalMix;
uniform float uSpeed;
uniform float uStateFreq;
uniform float uTheme; // 0.0 = dark, 1.0 = light
varying vec2 vUv;

void main() {
  // Normalized aspect-corrected coordinates centered at (0, 0)
  vec2 st = (vUv - 0.5) * vec2(uResolution.x / max(uResolution.y, 1.0), 1.0);
  float r = length(st);
  float a = atan(st.y, st.x);

  // Concentric architectural contour waves - controlled restrained frequency
  float wave1 = sin(r * (18.0 + uStateFreq * 4.5) - uTime * uSpeed * 1.3);
  // Orthogonal structural guide field
  float wave2 = cos(st.x * 12.0 + sin(st.y * 9.0 + uTime * uSpeed * 0.35));
  // Harmonic signal pulse
  float wave3 = sin(r * 24.0 + a * 3.0 - uTime * uSpeed * 1.5);

  // Razor-sharp architectural contour lines using smoothstep
  float line1 = smoothstep(0.965, 0.996, wave1);
  float line2 = smoothstep(0.975, 0.998, wave2) * 0.35;
  float line3 = smoothstep(0.97, 0.996, wave3);

  float compositeLines = max(line1, max(line2, line3 * 0.5));

  // Seamless radial vignette fading to transparent edge
  float vignette = smoothstep(0.85, 0.15, r);
  compositeLines *= vignette * uIntensity;

  // RUBIX Palettes:
  // Dark:  Base #07080A (0.027, 0.031, 0.039), Line1 #F4F4F6 (0.957), Line2 #7A7F8E (0.478, 0.498, 0.557), Signal #F97316
  // Light: Base #F3F1EC (0.953, 0.945, 0.925), Line1 #111214 (0.067), Line2 #767A85 (0.463, 0.478, 0.522), Signal #E86610 (0.910, 0.400, 0.063)
  vec3 bgDark = vec3(0.027, 0.031, 0.039);
  vec3 bgLight = vec3(0.953, 0.945, 0.925);
  vec3 line1Dark = vec3(0.957, 0.957, 0.965);
  vec3 line1Light = vec3(0.067, 0.071, 0.078);
  vec3 line2Dark = vec3(0.478, 0.498, 0.557);
  vec3 line2Light = vec3(0.463, 0.478, 0.522);
  vec3 signalDark = vec3(0.976, 0.451, 0.086);
  vec3 signalLight = vec3(0.910, 0.400, 0.063);

  vec3 bgColor = mix(bgDark, bgLight, uTheme);
  vec3 line1Color = mix(line1Dark, line1Light, uTheme);
  vec3 line2Color = mix(line2Dark, line2Light, uTheme);
  vec3 signalColor = mix(signalDark, signalLight, uTheme);

  vec3 lineColor = mix(line2Color, line1Color, line1);
  lineColor = mix(lineColor, signalColor, clamp(line3 * uSignalMix * 2.0, 0.0, 1.0));

  vec3 finalColor = mix(bgColor, lineColor, compositeLines);

  // Restrained contour opacity (soft architectural aura, 0.08-0.12 baseline)
  gl_FragColor = vec4(finalColor, compositeLines * vignette * 0.38);
}
`;

export function ShaderLines({
  speed = 0.2,
  intensity = 1.0,
  signalMix = 0.15,
  activeState = 0,
  className = "",
}: ShaderLinesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<WebGLRenderer | null>(null);
  const uniformsRef = useRef<{
    uTime: { value: number };
    uResolution: { value: Vector2 };
    uIntensity: { value: number };
    uSignalMix: { value: number };
    uSpeed: { value: number };
    uStateFreq: { value: number };
    uTheme: { value: number };
  }>({
    uTime: { value: 0 },
    uResolution: { value: new Vector2(1, 1) },
    uIntensity: { value: intensity },
    uSignalMix: { value: signalMix },
    uSpeed: { value: speed },
    uStateFreq: { value: activeState },
    uTheme: { value: 0 },
  });

  const [hasWebGL, setHasWebGL] = useState<boolean>(true);

  // Update dynamic uniform targets smoothly
  useEffect(() => {
    if (uniformsRef.current) {
      uniformsRef.current.uIntensity.value = intensity;
      uniformsRef.current.uSignalMix.value = signalMix;
      uniformsRef.current.uSpeed.value = speed;
      uniformsRef.current.uStateFreq.value = activeState;
    }
  }, [intensity, signalMix, speed, activeState]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Theme synchronization
    const updateThemeUniform = () => {
      const isLight = document.documentElement.getAttribute("data-theme") === "light";
      if (uniformsRef.current) {
        uniformsRef.current.uTheme.value = isLight ? 1.0 : 0.0;
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

    // Check user reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Test WebGL support
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) {
        setHasWebGL(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      return;
    }

    let isVisible = true;
    let animationFrameId: number | null = null;
    let lastTime = performance.now();

    // Scene & Camera
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new PlaneGeometry(2, 2);

    // Initial size
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;
    uniformsRef.current.uResolution.value.set(width, height);

    // Shader Material
    const material = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: uniformsRef.current,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    // WebGL Renderer (Capped DPR <= 2)
    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({
        antialias: false,
        alpha: true,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(width, height);
      renderer.domElement.style.display = "block";
      renderer.domElement.style.width = "100%";
      renderer.domElement.style.height = "100%";
      renderer.domElement.setAttribute("aria-hidden", "true");
      container.appendChild(renderer.domElement);
      rendererRef.current = renderer;
    } catch {
      setHasWebGL(false);
      return;
    }

    // Animation Loop (Pauses when offscreen or when reduced motion is preferred)
    const animate = () => {
      if (prefersReducedMotion) {
        // Render a single static architectural frame
        uniformsRef.current.uTime.value = 1.0;
        renderer.render(scene, camera);
        return;
      }

      if (isVisible) {
        const now = performance.now();
        const delta = Math.min((now - lastTime) * 0.001, 0.1);
        lastTime = now;
        uniformsRef.current.uTime.value += delta;
        renderer.render(scene, camera);
      } else {
        lastTime = performance.now();
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // ResizeObserver: Update renderer size and resolution uniform on container resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width: newWidth, height: newHeight } = entry.contentRect;
        if (newWidth > 0 && newHeight > 0 && renderer) {
          renderer.setSize(newWidth, newHeight);
          uniformsRef.current.uResolution.value.set(newWidth, newHeight);
          if (prefersReducedMotion) {
            renderer.render(scene, camera);
          }
        }
      }
    });
    resizeObserver.observe(container);

    // IntersectionObserver: Pause animation loop when off-screen to preserve GPU
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          isVisible = entry.isIntersecting;
        }
      },
      { threshold: 0.05 }
    );
    intersectionObserver.observe(container);

    // Complete cleanup on unmount
    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      themeObserver.disconnect();
      window.removeEventListener("theme-changed", handleThemeEvent);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();

      scene.remove(mesh);
      geometry.dispose();
      material.dispose();

      if (renderer) {
        renderer.dispose();
        if (renderer.domElement && renderer.domElement.parentNode) {
          renderer.domElement.parentNode.removeChild(renderer.domElement);
        }
      }
      rendererRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {!hasWebGL && (
        // High-end static architectural SVG/CSS fallback if WebGL is disabled or unsupported
        <div className="absolute inset-0 flex items-center justify-center opacity-30 architectural-grid pointer-events-none">
          <svg className="w-full h-full" viewBox="0 0 100 100" fill="none" preserveAspectRatio="none">
            <circle cx="50" cy="50" r="30" stroke="var(--text-tertiary)" strokeWidth="0.5" strokeDasharray="2 2" />
            <circle cx="50" cy="50" r="42" stroke="var(--text-primary)" strokeWidth="0.5" />
            <line x1="10" y1="50" x2="90" y2="50" stroke="var(--text-tertiary)" strokeWidth="0.5" />
            <line x1="50" y1="10" x2="50" y2="90" stroke="var(--text-tertiary)" strokeWidth="0.5" />
          </svg>
        </div>
      )}
    </div>
  );
}
