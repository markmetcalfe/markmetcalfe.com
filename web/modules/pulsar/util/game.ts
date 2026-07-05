import * as THREE from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";

export const TRACK_X = [-4, 0, 4] as const;

export const FULL_H = 6.0;
export const LOW_H = 2.0;

const POOL_SIZE = 20;
const LINE_WIDTH = 3;
const PLAYER_Z = 5; // visual z position of player cube (camera is at z=10)

export interface ObstacleData {
  trackIndex: 0 | 1 | 2;
  z: number;
  height: "low" | "full";
  active: boolean;
}

function makeEdgesGeo(box: THREE.BoxGeometry): LineSegmentsGeometry {
  return new LineSegmentsGeometry().fromEdgesGeometry(
    new THREE.EdgesGeometry(box),
  );
}

export class PulsarRenderer {
  private container: HTMLElement;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;

  private player!: LineSegments2;
  private playerMat!: LineMaterial;

  private obstaclePool: LineSegments2[] = [];
  private lineMaterials: LineMaterial[] = [];

  private crashTimer = 0;

  constructor(container: HTMLElement) {
    this.container = container;
  }

  private get w() {
    return this.container.clientWidth;
  }
  private get h() {
    return this.container.clientHeight;
  }

  private makeMat(): LineMaterial {
    const mat = new LineMaterial({
      color: 0x00ff00,
      linewidth: LINE_WIDTH,
    });
    mat.resolution.set(this.w, this.h);
    this.lineMaterials.push(mat);
    return mat;
  }

  initialise(): void {
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(
      60,
      this.w / this.h,
      0.1,
      300,
    );
    this.camera.position.set(0, 6, 14);
    this.camera.lookAt(0, 1, -10);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    this.renderer.setSize(this.w, this.h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.buildPlayer();
    this.buildObstaclePool();

    window.addEventListener("resize", this.onResize);
  }

  private buildPlayer(): void {
    const geo = makeEdgesGeo(new THREE.BoxGeometry(2, 2, 2));
    this.playerMat = this.makeMat();
    this.player = new LineSegments2(geo, this.playerMat);
    this.player.position.y = 1;
    this.scene.add(this.player);
  }

  private buildObstaclePool(): void {
    const geo = makeEdgesGeo(new THREE.BoxGeometry(2, FULL_H, 2));
    for (let i = 0; i < POOL_SIZE; i++) {
      const lines = new LineSegments2(geo, this.makeMat());
      lines.visible = false;
      this.obstaclePool.push(lines);
      this.scene.add(lines);
    }
  }

  render(
    playerX: number,
    playerY: number,
    obstacles: ObstacleData[],
    delta: number,
  ): void {
    if (!this.renderer) {
      return;
    }

    this.player.position.set(playerX, playerY + 1, PLAYER_Z);

    if (this.crashTimer > 0) {
      this.crashTimer -= delta;
      this.playerMat.color.setHex(
        this.crashTimer > 0 ? 0xffffff : 0x00ff00,
      );
    }

    const activeObs = obstacles.filter(
      o => o.active && o.z > -85 && o.z < 12,
    );
    this.obstaclePool.forEach((lines, i) => {
      const obs = activeObs[i];
      if (obs) {
        const obsHeight = obs.height === "full" ? FULL_H : LOW_H;
        lines.scale.y = obsHeight / FULL_H;
        lines.position.set(
          TRACK_X[obs.trackIndex],
          obsHeight / 2,
          obs.z + PLAYER_Z,
        );
        lines.visible = true;
      } else {
        lines.visible = false;
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  flashCrash(): void {
    this.crashTimer = 0.6;
    this.playerMat.color.setHex(0xffffff);
  }

  private onResize = (): void => {
    if (!this.renderer || !this.camera) {
      return;
    }
    this.camera.aspect = this.w / this.h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(this.w, this.h);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.lineMaterials.forEach(m => m.resolution.set(this.w, this.h));
  };

  cleanUp(): void {
    window.removeEventListener("resize", this.onResize);
    this.renderer?.domElement.remove();
    this.renderer?.dispose();
    this.scene?.clear();
  }
}
