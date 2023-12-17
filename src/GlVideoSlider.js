import { Mesh, PlaneGeometry, SRGBColorSpace, ShaderMaterial, VideoTexture } from "three";
import gsap from "gsap";

import vertexShader from "./shaders/slider.vert";
import fragmentShader from "./shaders/slider.frag";

const planeGeo = new PlaneGeometry(1, 1);
const planeMat = new ShaderMaterial({
  vertexShader,
  fragmentShader,
});

export class GlVideoSlider {
  constructor({ scene, screen, viewport }) {
    this.scene = scene;
    this.screen = screen;
    this.viewport = viewport;

    this.currentTime = 0;

    this.videos = [...document.querySelectorAll("video")];
    this.currentIndex = 0;

    this.videoTextures = [];

    this.isAnimating = false;

    this.init();
    this.onResize();
  }

  init() {
    this.videos.forEach((video) => {
      video.play();
      video.addEventListener("play", () => {
        video.currentTime = 3;
      });
    });

    this.videoTextures = this.videos.map((video) => {
      const texture = new VideoTexture(video);
      texture.colorSpace = SRGBColorSpace;
      return texture;
    });

    this.currentTex = this.videoTextures[this.currentIndex];
    this.nextTex = this.videoTextures[this.currentIndex + 1];

    this.divs = 5;
    this.offsets = new Array(this.divs).fill(null).map(() => ({ value: 0 }));

    const mat = planeMat.clone();
    mat.uniforms = {
      uTexture0: { value: this.currentTex },
      uTextureSize0: {
        value: [this.currentVideo().videoWidth, this.currentVideo().videoHeight],
      },
      uTexture1: { value: this.nextTex },
      uTextureSize1: { value: [0, 0] },
      uPlaneSize: { value: [0, 0] },
      uDivs: { value: this.divs },
      uOffsets: { value: [] },
    };

    this.mesh = new Mesh(planeGeo, mat);
    this.scene.add(this.mesh);
  }

  onResize({ viewport } = {}) {
    if (viewport) {
      this.viewport = viewport;
      this.mesh.scale.x = this.viewport.width;
      this.mesh.scale.y = this.viewport.height;
    }

    this.mesh.material.uniforms.uPlaneSize.value = [this.mesh.scale.x, this.mesh.scale.y];
  }

  update({ time } = {}) {
    if (time) this.currentTime = time;
    // this.mesh.material.uniforms.uTime.value = this.currentTime;

    this.mesh.material.uniforms.uOffsets.value = this.offsets.map((o) => o.value);
  }

  next() {
    if (this.isAnimating) return;

    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        this.isAnimating = true;
      },
      onComplete: () => {
        this.isAnimating = false;
        this.currentIndex = this.nextIndex();

        this.currentTex = this.videoTextures[this.currentIndex];
        this.nextTex = this.videoTextures[this.nextIndex()];

        this.mesh.material.uniforms.uTexture0.value = this.currentTex;
        this.mesh.material.uniforms.uTexture1.value = this.nextTex;

        this.mesh.material.uniforms.uTextureSize0.value = [
          this.currentVideo().videoWidth,
          this.currentVideo().videoHeight,
        ];
        this.mesh.material.uniforms.uTextureSize1.value = [
          this.nextVideo().videoWidth,
          this.nextVideo().videoHeight,
        ];

        this.offsets.forEach((offset) => {
          gsap.set(offset, { value: 0 });
        });
      },
    });

    tl.to(this.offsets, {
      value: -1,
      duration: 1,
      ease: "power4.inOut",
      stagger: -0.05,
    });

    tl.play();
  }

  prev() {
    if (this.isAnimating) return;

    const tl = gsap.timeline({
      paused: true,
      onStart: () => {
        this.isAnimating = true;
      },
      onComplete: () => {
        this.isAnimating = false;
        this.currentIndex = this.prevIndex();

        this.currentTex = this.videoTextures[this.currentIndex];
        this.nextTex = this.videoTextures[this.prevIndex()];

        this.mesh.material.uniforms.uTexture0.value = this.currentTex;
        this.mesh.material.uniforms.uTexture1.value = this.nextTex;

        this.mesh.material.uniforms.uTextureSize0.value = [
          this.currentVideo().videoWidth,
          this.currentVideo().videoHeight,
        ];
        this.mesh.material.uniforms.uTextureSize1.value = [
          this.prevVideo().videoWidth,
          this.prevVideo().videoHeight,
        ];

        this.offsets.forEach((offset) => {
          gsap.set(offset, { value: 0 });
        });
      },
    });

    tl.to(this.offsets, {
      value: -1,
      duration: 1,
      ease: "power4.inOut",
      stagger: 0.05,
    });

    tl.play();
  }

  staggerOffsetsTo(v, options) {
    const tl = gsap.timeline({ paused: true, ...options });
    tl.play();
  }

  nextIndex() {
    return (this.currentIndex + 1) % this.videos.length;
  }

  prevIndex() {
    return (this.currentIndex - 1 + this.videos.length) % this.videos.length;
  }

  currentVideo() {
    return this.videos[this.currentIndex];
  }

  currentVideoTexture() {
    return this.videoTextures[this.currentIndex];
  }

  nextVideo() {
    return this.videos[this.nextIndex()];
  }

  prevVideo() {
    return this.videos[this.prevIndex()];
  }
}
