import * as BABYLON from "@babylonjs/core";
import { debounce } from "lodash-es";

export class Render {
	engine: BABYLON.Engine;
  scene: BABYLON.Scene;
  camera: BABYLON.ArcRotateCamera;
  light!: BABYLON.Light;

	constructor(canvas: HTMLCanvasElement) {
		this.engine = new BABYLON.Engine(canvas, true, {}, true);
    this.scene = new BABYLON.Scene(this.engine);
    const scene = this.scene;
		scene.clearColor = BABYLON.Color4.FromHexString("#000");
    this.camera = new BABYLON.ArcRotateCamera(
      "camera",
      -Math.PI / 2,
      Math.PI / 2,
      50,
      BABYLON.Vector3.Zero(),
      scene
    );
    this.camera.lowerRadiusLimit = 1;

    this.camera.attachControl(canvas, false);
		this.light = new BABYLON.HemisphericLight(
			"light",
			new BABYLON.Vector3(0, 1, 0),
			scene
		);
		this.light.intensity = 2;

    this.engine.runRenderLoop(() => {
      this.scene.render();
    });

    // for debug
		if (import.meta.env.DEV) {
			// this.syncArcRotateCameraWithHash();
		}
    (window as any).scene = this.scene;
	}

	async showDebugLayer() {
		if (import.meta.env.DEV) {
			await import("@babylonjs/inspector");
			return this.scene.debugLayer.show({
				embedMode: true,
			});
		}
		return null;
	}

	syncArcRotateCameraWithHash() {
		const { camera } = this;
		try {
			const { position, target } = JSON.parse(
				decodeURIComponent(window.location.hash.slice(1))
			);
			camera.position = BABYLON.Vector3.FromArray(position);
			camera.target = BABYLON.Vector3.FromArray(target);
		} catch (e) {}
	
		camera.onViewMatrixChangedObservable.add(
			debounce(function () {
				const position = camera.position.asArray();
				const target = camera.target.asArray();
				const serialization = JSON.stringify({
					position,
					target,
				});
				window.history.replaceState("", "", "#" + serialization);
			}, 500)
		);
	}
}
