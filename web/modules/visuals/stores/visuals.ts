import { defineStore } from "pinia";
import { isMobile } from "is-mobile";
import { Vector3 } from "three";
import {
  Octahedron,
  type GeometryAttributes,
  mapGeometryAttributes,
} from "@visuals/util/geometry";
import type { Renderer } from "@visuals/util/renderer";
import {
  getRandomBool,
  getRandomGeometry,
  getRandomInt,
  getRandomNum,
  getRandomValue,
} from "@visuals/util/random";
import { getRandomColor } from "@visuals/util/color";

export enum AutoZoomMode {
  DISABLED = "Disabled",
  SMOOTH = "Smooth",
  JUMP = "4/4 Jump",
  RANDOM = "Random",
}

export interface VisualStore {
  renderer: Renderer | undefined;
  geometryConfig: GeometryAttributes[];
  followCursor: boolean;
  edgeBounce: {
    enabled: boolean;
    target: Vector3 | undefined;
    velocity: {
      x: number;
      y: number;
    };
    speed: number;
  };
  zoom: {
    min: number;
    max: number;
    current: number;
  };
  autoZoom: {
    mode: AutoZoomMode;
    speed: number;
    direction: "in" | "out";
    beat: number;
  };
  scrollToZoom: boolean;
  rotationSpeed: {
    x: number;
    y: number;
  };
  beatMatch: {
    enabled: boolean;
    randomizeColors: boolean;
    syncToBar: boolean;
  };
  listeners: {
    onRandomise: (() => void) | undefined;
  };
}

export const defaultGeometry: GeometryAttributes[] = [
  {
    type: Octahedron.getName(),
    color: "rgb(0, 255, 0)",
    solid: false,
    radius: 1,
    detail: 10,
    reverseRotation: false,
  },
];

const initialState: VisualStore = {
  renderer: undefined,
  geometryConfig: defaultGeometry,
  followCursor: false,
  edgeBounce: {
    enabled: true,
    target: undefined,
    velocity: {
      x: 1,
      y: 0.7,
    },
    speed: 0.02,
  },
  zoom: {
    min: 6,
    max: 10,
    current: 10,
  },
  autoZoom: {
    mode: AutoZoomMode.DISABLED,
    speed: 20,
    direction: "in",
    beat: 0,
  },
  scrollToZoom: false,
  rotationSpeed: {
    x: 100,
    y: 100,
  },
  beatMatch: {
    enabled: false,
    randomizeColors: false,
    syncToBar: false,
  },
  listeners: {
    onRandomise: undefined,
  },
};

export const useVisualsStore = defineStore("visuals", {
  state: () => initialState,
  actions: {
    generateGeometry() {
      const geometry = this.geometryConfig.map(mapGeometryAttributes);
      this.renderer!.placeGeometry(geometry);
      this.syncRotationSpeed();
    },
    addRandomGeometryConfig() {
      this.geometryConfig.push(getRandomGeometry());
    },
    deleteGeometryConfig(index: number) {
      this.geometryConfig.splice(index, 1);
    },
    randomiseGeometry() {
      this.geometryConfig = [];
      for (let i = 0; i < getRandomInt(1, 4); i++) {
        this.addRandomGeometryConfig();
      }
      this.generateGeometry();
    },

    randomise() {
      const siteStore = useSiteStore();

      this.randomiseZoom();

      this.setBeatMatchEnabled(getRandomBool());
      if (this.beatMatch.enabled) {
        siteStore.updateBpm(getRandomInt(90, 190));
      }
      this.beatMatch.syncToBar = this.beatMatch.enabled
        ? getRandomBool()
        : false;
      this.beatMatch.randomizeColors = this.beatMatch.enabled;

      this.randomiseGeometry();
      this.setRotationSpeed(
        getRandomNum(10, 25),
        getRandomNum(10, 25),
      );

      this.listeners.onRandomise?.();
    },

    zoomIn() {
      this.zoom.current += 0.1;
    },
    zoomOut() {
      this.zoom.current -= 0.1;
    },
    randomiseZoom() {
      if (isMobile() && this.edgeBounce.enabled) {
        return;
      }

      this.setCurrentZoom(getRandomInt(this.zoom.min, this.zoom.max));

      this.autoZoom.mode = getRandomValue([
        AutoZoomMode.SMOOTH,
        AutoZoomMode.RANDOM,
        AutoZoomMode.JUMP,
      ]);

      if (this.autoZoom.mode === AutoZoomMode.SMOOTH) {
        this.autoZoom.speed = getRandomNum(1, 50);
      }

      this.setMinZoom(getRandomInt(-2, 2));
      this.setMaxZoom(getRandomInt(4, 8));
      this.autoZoom.direction =
        this.autoZoom.direction === "in" ? "out" : "in";
    },

    tick(positionData: {
      mousePosition: Vector3 | undefined;
      startingPosition: Vector3 | undefined;
      viewportBounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
      };
    }) {
      this.movementTick(positionData);
      this.autoZoomTick();
      this.beatMatchTick();
    },

    movementTick({
      mousePosition,
      startingPosition,
      viewportBounds,
    }: {
      mousePosition: Vector3 | undefined;
      startingPosition: Vector3 | undefined;
      viewportBounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
      };
    }) {
      if (
        !isMobile() &&
        this.edgeBounce.enabled &&
        !this.followCursor &&
        this.renderer?.hasUserMoved()
      ) {
        // Switch from edge bounce to follow cursor on first mouse move
        this.edgeBounce.enabled = false;
        this.followCursor = true;
      }

      const mobile = isMobile();
      const objectScale = mobile ? 0.9 : 1;
      const bounceTarget = this.getNextBounceTarget(
        viewportBounds,
        startingPosition,
      );

      this.renderer?.getGeometry()!.forEach(object => {
        object.rotate();
        object.setSize(objectScale);
        if (this.followCursor && mousePosition) {
          object.moveTowardPosition(mousePosition, mobile);
        } else if (this.edgeBounce.enabled) {
          object.moveTowardPosition(bounceTarget, mobile);
        } else {
          object.moveTowardPosition(
            startingPosition ?? new Vector3(0, 0, 0),
            mobile,
          );
        }
      });
    },

    getNextBounceTarget(
      viewportBounds: {
        minX: number;
        maxX: number;
        minY: number;
        maxY: number;
      },
      startingPosition: Vector3 | undefined,
    ) {
      if (!this.edgeBounce.target) {
        this.edgeBounce.target =
          startingPosition?.clone() ?? new Vector3(0, 0, 0);
      }

      const boundsPadding = 0.3;
      const minX = viewportBounds.minX + boundsPadding;
      const maxX = viewportBounds.maxX - boundsPadding;
      const minY = viewportBounds.minY + boundsPadding;
      const maxY = viewportBounds.maxY - boundsPadding;

      const nextX =
        this.edgeBounce.target.x +
        this.edgeBounce.velocity.x * this.edgeBounce.speed;
      const nextY =
        this.edgeBounce.target.y +
        this.edgeBounce.velocity.y * this.edgeBounce.speed;

      if (nextX <= minX || nextX >= maxX) {
        this.edgeBounce.velocity.x *= -1;
      }
      if (nextY <= minY || nextY >= maxY) {
        this.edgeBounce.velocity.y *= -1;
      }

      const targetX =
        this.edgeBounce.target.x +
        this.edgeBounce.velocity.x * this.edgeBounce.speed;
      const targetY =
        this.edgeBounce.target.y +
        this.edgeBounce.velocity.y * this.edgeBounce.speed;

      this.edgeBounce.target.x = Math.min(
        maxX,
        Math.max(minX, targetX),
      );
      this.edgeBounce.target.y = Math.min(
        maxY,
        Math.max(minY, targetY),
      );

      return this.edgeBounce.target;
    },

    autoZoomTick() {
      if (this.autoZoom.mode !== AutoZoomMode.SMOOTH) {
        return;
      }

      if (this.zoom.current >= this.zoom.max) {
        this.autoZoom.direction = "out";
      } else if (this.zoom.current <= this.zoom.min) {
        this.autoZoom.direction = "in";
      }

      if (this.autoZoom.direction === "in") {
        this.zoom.current += this.autoZoom.speed / 1000;
      } else {
        this.zoom.current -= this.autoZoom.speed / 1000;
      }
    },

    beatMatchTick(force = false) {
      const siteStore = useSiteStore();

      if (!force) {
        if (!this.beatMatch.enabled) {
          return;
        }

        const bpm = this.beatMatch.syncToBar
          ? siteStore.beatMatch.bpm / siteStore.beatMatch.beatsPerBar
          : siteStore.beatMatch.bpm;
        const intervalMs = (60 / bpm) * 1000;
        if (
          new Date().getTime() <=
          siteStore.beatMatch.lastTime.getTime() + intervalMs
        ) {
          return;
        }
      }

      this.renderer?.getGeometry()!.forEach((geometry, index) => {
        const randomRotationPosition = getRandomNum(0, 100);
        geometry.setRotation(randomRotationPosition);

        if (this.beatMatch.randomizeColors) {
          const randomColor = getRandomColor();
          const config = this.geometryConfig[index];
          if (config) {
            config.color = `rgb(${randomColor.join(", ")})`;
          }
          geometry.setColor(...randomColor);
        }
      });

      if (this.autoZoom.mode === AutoZoomMode.RANDOM) {
        this.zoom.current = getRandomNum(
          this.zoom.min,
          this.zoom.max,
        );
      } else if (this.autoZoom.mode === AutoZoomMode.JUMP) {
        const zoomIncrement = (this.zoom.max - this.zoom.min) / 3;
        this.zoom.current =
          this.zoom.max - zoomIncrement * this.autoZoom.beat;
        this.autoZoom.beat++;
        if (this.autoZoom.beat >= siteStore.beatMatch.beatsPerBar) {
          this.autoZoom.beat = 0;
        }
      }

      siteStore.updateLastBeatTime();
    },
    setBeatMatchEnabled(enabled: boolean | null) {
      const siteStore = useSiteStore();

      this.beatMatch.enabled = enabled ?? false;
      if (
        !enabled &&
        ![AutoZoomMode.DISABLED, AutoZoomMode.SMOOTH].includes(
          this.autoZoom.mode,
        )
      ) {
        this.autoZoom.mode = AutoZoomMode.SMOOTH;
      }

      if (enabled) {
        siteStore.addBpmListener({
          consumer: "visuals",
          onTap: () => {
            if (!this.beatMatch.enabled) {
              this.beatMatch.enabled = true;
            }
          },
          onUpdate: () => {
            if (this.autoZoom.mode === AutoZoomMode.JUMP) {
              this.autoZoom.beat = 0;
              this.zoom.current = this.zoom.max;
            }
          },
        });
      }
    },

    setMinZoom(zoom: number) {
      this.zoom.min = zoom;
      if (this.zoom.max < zoom) {
        this.zoom.max = zoom;
      }
    },

    setMaxZoom(zoom: number) {
      this.zoom.max = zoom;
      if (this.zoom.min > zoom) {
        this.zoom.min = zoom;
      }
    },

    setCurrentZoom(zoom: number) {
      this.zoom.current = zoom;
      if (this.zoom.min > zoom) {
        this.zoom.min = zoom;
      }
      if (this.zoom.max < zoom) {
        this.zoom.max = zoom;
      }
    },

    syncRotationSpeed() {
      this.renderer!.getGeometry()!.forEach(geometry => {
        geometry.setRotationSpeed(this.rotationSpeed);
      });
    },
    setRotationSpeed(x: number, y: number) {
      this.rotationSpeed = { x, y };
      this.syncRotationSpeed();
    },
    setXRotationSpeed(speed: number) {
      this.rotationSpeed.x = speed;
      this.syncRotationSpeed();
    },
    setYRotationSpeed(speed: number) {
      this.rotationSpeed.y = speed;
      this.syncRotationSpeed();
    },
    setFollowCursor(followCursor: boolean) {
      this.followCursor = followCursor;
    },

    setAllRotation(x: number, y: number, z: number) {
      this.renderer!.getGeometry()!.forEach(geometry => {
        geometry.setRotation(x, y, z);
      });
    },

    setRenderer(renderer: Renderer) {
      const siteStore = useSiteStore();
      this.renderer = renderer;
      this.renderer
        .setGetZoom(() => this.zoom.current)
        .setOnRenderTick((_, positionData) => {
          this.tick(positionData);
        })
        .setOnInit(() => this.syncRotationSpeed())
        .setOnClick(() => this.randomise())
        .setOnKeyDown((renderer, event) => {
          if (event.code === "Space") {
            siteStore.tapBpm();
          } else if (event.key === "Shift") {
            renderer.randomiseColors();
          } else if (event.key === "Control") {
            renderer.randomiseRotations();
          }
        })
        .setOnScroll((_renderer, event) => {
          if (!this.scrollToZoom) {
            return;
          }
          if (event.deltaY > 0) {
            this.zoomOut();
          } else if (event.deltaY < 0) {
            this.zoomIn();
          }
        })
        .setGetDefaultGeometry(() => this.geometryConfig);
    },

    setListener(
      name: keyof VisualStore["listeners"],
      closure: () => void,
    ) {
      this.listeners[name] = closure;
    },
    removeListener(name: keyof VisualStore["listeners"]) {
      this.listeners[name] = undefined;
    },
  },
});
