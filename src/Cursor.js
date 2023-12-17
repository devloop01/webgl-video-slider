import { lerp } from "three/src/math/MathUtils";

export class Cursor {
  constructor(el, lerpAmount = 0.1) {
    this.dom = { el };

    this.position = {
      current: { x: 0, y: 0 },
      target: { x: 0, y: 0 },
      lerpAmount,
    };

    this.scale = {
      current: 1,
      target: 1,
      lerpAmount: 0.1,
    };

    this.opacity = {
      current: 1,
      target: 1,
      lerpAmount: 0.1,
    };
  }

  updateTargetPosition(x, y) {
    this.position.target.x = x;
    this.position.target.y = y;
  }

  updateTargetScale(scale) {
    this.scale.target = scale;
  }

  updateTargetOpacity(opacity) {
    this.opacity.target = opacity;
  }

  update() {
    this.position.current.x = lerp(
      this.position.current.x,
      this.position.target.x,
      this.position.lerpAmount
    );
    this.position.current.y = lerp(
      this.position.current.y,
      this.position.target.y,
      this.position.lerpAmount
    );

    this.scale.current = lerp(this.scale.current, this.scale.target, this.scale.lerpAmount);

    this.opacity.current = lerp(this.opacity.current, this.opacity.target, this.opacity.lerpAmount);

    this.dom.el.style.setProperty("--cursor-x", `${this.position.current.x}px`);
    this.dom.el.style.setProperty("--cursor-y", `${this.position.current.y}px`);
    this.dom.el.style.setProperty("--cursor-scale", this.scale.current);
    this.dom.el.style.setProperty("--cursor-opacity", this.opacity.current);
  }
}
