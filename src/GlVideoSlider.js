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

    this.videos = [...document.querySelectorAll("video")];
    this.currentSlideIndex = 0;

    this.videoTextures = [];

    this.isAnimating = false;

    this.divs = 5;

    this.init();
    this.onResize();
  }

  init() {
    this.initVideos();
    this.initVideoTextures();

    this.offsets = new Array(this.divs).fill(null).map(() => ({ value: 0 }));

    this.currentTexture = this.currentVideoTexture();
    this.nextTexture = this.nextVideoTexture();

    this.planeGeometry = planeGeo.clone();
    this.planeMaterial = planeMat.clone();

    this.planeMaterial.uniforms = {
      uTexture0: { value: this.currentTexture },
      uTextureSize0: {
        value: [this.currentVideo().videoWidth, this.currentVideo().videoHeight],
      },
      uTexture1: { value: this.nextTexture },
      uTextureSize1: { value: [this.nextVideo().videoWidth, this.nextVideo().videoHeight] },
      uPlaneSize: { value: [0, 0] },
      uDivs: { value: this.divs },
      uOffsets: { value: this.offsets.map((o) => o.value) },
      uChromaticStrength: { value: 0 },
    };

    this.mesh = new Mesh(this.planeGeometry, this.planeMaterial);
    this.scene.add(this.mesh);
  }

  initVideos() {
    this.videos.forEach((video, index) => {
      video.play();

      video.addEventListener("ended", () => {
        if (this.currentSlideIndex === index) this.nextSlide();
      });
    });
  }

  initVideoTextures() {
    this.videoTextures = this.videos.map((video) => {
      const texture = new VideoTexture(video);
      texture.colorSpace = SRGBColorSpace;
      texture.generateMipmaps = false;
      return texture;
    });
  }

  onResize({ viewport } = {}) {
    if (viewport) {
      this.viewport = viewport;
      this.mesh.scale.x = this.viewport.width;
      this.mesh.scale.y = this.viewport.height;
    }

    this.planeMaterial.uniforms.uPlaneSize.value = [this.mesh.scale.x, this.mesh.scale.y];
  }

  update() {
    this.planeMaterial.uniforms.uOffsets.value = this.offsets.map((o) => o.value);
  }

  resetOffsets() {
    this.offsets.forEach((offset) => {
      gsap.set(offset, { value: 0 });
    });
  }

  nextSlide() {
    if (this.isAnimating) return;

    this.staggerOffsetsTo(
      -1,
      {},
      {
        onStart: () => {
          this.isAnimating = true;
          this.nextVideo().play();
        },
        onComplete: () => {
          this.isAnimating = false;

          this.currentSlideIndex = this.nextIndex();
          this.currentTexture = this.currentVideoTexture();
          this.nextTexture = this.nextVideoTexture();

          this.planeMaterial.uniforms.uTexture0.value = this.currentTexture;
          this.planeMaterial.uniforms.uTexture1.value = this.nextTexture;

          this.planeMaterial.uniforms.uTextureSize0.value = [
            this.currentVideo().videoWidth,
            this.currentVideo().videoHeight,
          ];
          this.planeMaterial.uniforms.uTextureSize1.value = [
            this.nextVideo().videoWidth,
            this.nextVideo().videoHeight,
          ];

          this.resetOffsets();
        },
      }
    );
  }

  showNextSlide() {
    if (this.isAnimating) return;

    this.staggerOffsetsTo(
      -0.15,
      { duration: 0.5 },
      {
        onStart: () => {
          this.nextVideo().currentTime = 0;
          this.nextVideo().play();
        },
      }
    );
  }

  hideNextSlide() {
    if (this.isAnimating) return;

    this.staggerOffsetsTo(
      0,
      { duration: 0.5, stagger: 0.05 },
      {
        onStart: () => {},
      }
    );
  }

  prevSlide() {
    if (this.isAnimating) return;

    this.staggerOffsetsTo(
      -1,
      { stagger: 0.05 },
      {
        onStart: () => {
          this.isAnimating = true;
          this.prevVideo().play();
        },
        onComplete: () => {
          this.isAnimating = false;

          this.currentSlideIndex = this.prevIndex();

          this.currentTexture = this.currentVideoTexture();
          this.nextTexture = this.prevVideoTexture();

          this.planeMaterial.uniforms.uTexture0.value = this.currentTexture;
          this.planeMaterial.uniforms.uTexture1.value = this.nextTexture;

          this.planeMaterial.uniforms.uTextureSize0.value = [
            this.currentVideo().videoWidth,
            this.currentVideo().videoHeight,
          ];
          this.planeMaterial.uniforms.uTextureSize1.value = [
            this.prevVideo().videoWidth,
            this.prevVideo().videoHeight,
          ];

          this.resetOffsets();
        },
      }
    );
  }

  showPrevSlide() {
    if (this.isAnimating) return;

    this.staggerOffsetsTo(
      -0.15,
      { duration: 0.5, stagger: 0.05 },
      {
        onStart: () => {
          this.prevVideo().currentTime = 0;
          this.prevVideo().play();
        },
      }
    );
  }

  hidePrevSlide() {
    if (this.isAnimating) return;

    this.staggerOffsetsTo(
      0,
      { duration: 0.5, stagger: -0.05 },
      {
        onStart: () => {},
      }
    );
  }

  staggerOffsetsTo(value, options = {}, tlOptions = {}) {
    const tl = gsap.timeline({ paused: true, ...tlOptions });

    const duration = options.duration || 0.7;

    tl.to(this.offsets, {
      value,
      duration,
      ease: options.ease || "power4.inOut",
      stagger: options.stagger || -0.05,
      overwrite: true,
    });

    tl.to(
      this.planeMaterial.uniforms.uChromaticStrength,
      {
        value: 1,
        duration: 0.5,
        ease: "power2.inOut",
      },
      0.1
    );

    tl.to(
      this.planeMaterial.uniforms.uChromaticStrength,
      {
        value: 0,
        duration: 0.5,
        ease: "power2.inOut",
      },
      duration - 0.1
    );

    tl.play();
  }

  nextIndex() {
    return (this.currentSlideIndex + 1) % this.videos.length;
  }

  prevIndex() {
    return (this.currentSlideIndex - 1 + this.videos.length) % this.videos.length;
  }

  currentVideo() {
    return this.videos[this.currentSlideIndex];
  }

  currentVideoTexture() {
    return this.videoTextures[this.currentSlideIndex];
  }

  nextVideoTexture() {
    return this.videoTextures[this.nextIndex()];
  }

  prevVideoTexture() {
    return this.videoTextures[this.prevIndex()];
  }

  nextVideo() {
    return this.videos[this.nextIndex()];
  }

  prevVideo() {
    return this.videos[this.prevIndex()];
  }
}
