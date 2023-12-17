import { WebGLRenderer, PerspectiveCamera, Scene, Clock } from "three";
import Stats from "stats-gl";
import { GlVideoSlider } from "./GlVideoSlider";

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
    this.initGl();
    this.initGlVideoSlider();
    this.onResize();
    this.addEventListeners();
    this.render();
    // });
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

    this.videoSliderControls = {
      prev: document.querySelector(".btn--prev"),
      next: document.querySelector(".btn--next"),
    };

    this.videoSliderControls.prev.addEventListener("click", () => {
      this.videoSlider.prev();
    });

    this.videoSliderControls.next.addEventListener("click", () => {
      this.videoSlider.next();
    });
  }

  render() {
    this.stats.init(this.renderer);

    const raf = () => {
      this.rafId = requestAnimationFrame(raf);

      this.videoSlider.update({
        time: this.clock.getElapsedTime(),
      });

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

  addEventListeners() {
    window.addEventListener("resize", this.onResize.bind(this));
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
