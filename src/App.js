import { WebGLRenderer, PerspectiveCamera, Scene, Clock } from "three";
import Stats from "stats-gl";
import { GlVideoSlider } from "./GlVideoSlider";
import { Cursor } from "./Cursor";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Inspiration: https://whenwewerekids.fr/

export class App {
  constructor({ canvas }) {
    this.canvas = canvas;

    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.rafId = 0;

    this.clock = new Clock();

    this.stats = new Stats({ minimal: true });
    document.body.appendChild(this.stats.dom);

    // sleep(import.meta.env.DEV ? 10 : 1000).then(() => {
    this.initCursors();
    this.initGl();
    this.initGlVideoSlider();
    this.initSliderControls();
    this.onResize();
    this.addEventListeners();
    this.render();
    // });
  }

  initCursors() {
    this.cursors = {
      sm: new Cursor(document.querySelector(".cursor--sm"), 0.3),
      lg: new Cursor(document.querySelector(".cursor--lg"), 0.12),
    };
  }

  initGl() {
    this.renderer = new WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
    });
    // this.renderer.setClearColor(0xffffff, 1);

    this.camera = new PerspectiveCamera(45, this.screen.width / this.screen.height, 0.1, 1000);
    this.camera.position.z = 10;

    this.scene = new Scene();
  }

  initGlVideoSlider() {
    this.videoSlider = new GlVideoSlider({
      scene: this.scene,
      screen: this.screen,
      viewport: this.viewport,
    });
  }

  initSliderControls() {
    this.videoSliderControls = {
      prev: document.querySelector(".btn--prev"),
      next: document.querySelector(".btn--next"),
    };
  }

  render() {
    this.stats.init(this.renderer);

    const raf = () => {
      this.rafId = requestAnimationFrame(raf);

      this.videoSlider.update({
        time: this.clock.getElapsedTime(),
      });

      this.cursors.sm.update();
      this.cursors.lg.update();

      this.stats.update();
      this.renderer.render(this.scene, this.camera);
    };

    this.rafId = requestAnimationFrame(raf);
  }

  onResize() {
    this.screen = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    this.renderer.setSize(this.screen.width, this.screen.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.aspect = this.screen.width / this.screen.height;
    this.camera.updateProjectionMatrix();

    this.calculateViewport();

    if (this.videoSlider) {
      this.videoSlider.onResize({
        screen: this.screen,
        viewport: this.viewport,
      });
    }
  }

  onMouseMove(e) {
    const x = e.clientX;
    const y = e.clientY;

    this.cursors.sm.updateTargetPosition(x, y);
    this.cursors.lg.updateTargetPosition(x, y);
  }

  onMouseEnter() {
    this.cursors.sm.updateTargetOpacity(1);
    this.cursors.lg.updateTargetOpacity(1);
  }

  onMouseLeave() {
    this.cursors.sm.updateTargetOpacity(0);
    this.cursors.lg.updateTargetOpacity(0);
  }

  onConrolsClick(e) {
    if (e.target.classList.contains("btn--next")) {
      this.videoSlider.nextSlide();
    } else {
      this.videoSlider.prevSlide();
    }
  }

  onConrolsMouseEnter(e) {
    this.cursors.sm.updateTargetScale(4);
    this.cursors.lg.updateTargetScale(1.5);
    this.cursors.lg.updateTargetOpacity(0);

    if (e.target.classList.contains("btn--next")) {
      this.videoSlider.showNextSlide();
    } else {
      this.videoSlider.showPrevSlide();
    }
  }

  onConrolsMouseLeave(e) {
    this.cursors.sm.updateTargetScale(1);
    this.cursors.lg.updateTargetScale(1);
    this.cursors.lg.updateTargetOpacity(1);

    if (e.target.classList.contains("btn--next")) {
      this.videoSlider.hideNextSlide();
    } else {
      this.videoSlider.hidePrevSlide();
    }
  }

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
    window.addEventListener("mousemove", this.onMouseMove.bind(this));
    document.addEventListener("mouseenter", this.onMouseEnter.bind(this));
    document.addEventListener("mouseleave", this.onMouseLeave.bind(this));

    // controls
    this.videoSliderControls.prev.addEventListener("click", this.onConrolsClick.bind(this));
    this.videoSliderControls.next.addEventListener("click", this.onConrolsClick.bind(this));

    this.videoSliderControls.prev.addEventListener(
      "mouseenter",
      this.onConrolsMouseEnter.bind(this)
    );
    this.videoSliderControls.next.addEventListener(
      "mouseenter",
      this.onConrolsMouseEnter.bind(this)
    );
    this.videoSliderControls.prev.addEventListener(
      "mouseleave",
      this.onConrolsMouseLeave.bind(this)
    );
    this.videoSliderControls.next.addEventListener(
      "mouseleave",
      this.onConrolsMouseLeave.bind(this)
    );
  }

  calculateViewport() {
    const fov = this.camera.fov * (Math.PI / 180);
    const height = 2 * Math.tan(fov / 2) * this.camera.position.z;
    const width = height * this.camera.aspect;

    this.viewport = {
      height,
      width,
    };
  }
}
