import * as BABYLON from "@babylonjs/core";
import { Render } from "./render";
import "./style.css";

const app = document.getElementById("app")!;
const canvas = app.appendChild(document.createElement("canvas")) as HTMLCanvasElement;
canvas.id = "canvas";

const RandomPhotoURL1 = `https://source.unsplash.com/random/900x900/?abstract`;
const RandomPhotoURL2 = `https://source.unsplash.com/random/900x900/?abstract,colorful`;

function getPathArray() {
	const positions = [
		[0, 0],
		[1, -1], [2, 0],
		[3, -1], [4, 0],
		[5, -1], [6, 0],
		[7, -1], [8, 0],
		[9, -1], [10, 0],
		[11, -1], [12, 0],
		[13, -1], [14, 0],
		[15, -1], [16, 0],
		[17, -1], [18, 0],
	];

	const height = 10;

	const side1 = positions.map(([x, z]) => new BABYLON.Vector3(x, 0, z));
	const side2 = positions.map(([x, z]) => new BABYLON.Vector3(x, height, z));
	return [side1, side2];
}

function loadImage(src: string) {
	return new Promise<HTMLImageElement>((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = "anonymous";
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
		img.src = src;
	});
}

async function getMergedPhotoTexture(scene: BABYLON.Scene) {
	const canvas = document.createElement("canvas");
	canvas.width = 900 * 2;
	canvas.height = 900;
	const ctx = canvas.getContext("2d")!;

	const colWidth = 900 / 9;

	const [image1, image2] = await Promise.all([RandomPhotoURL1, RandomPhotoURL2].map(url => loadImage(url)));

	// drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
	for (let i = 0; i < 9; ++i) {
		ctx.drawImage(image1,
			i * colWidth, 0, colWidth, 900,
			2 * i * colWidth, 0, colWidth, 900
		);
		ctx.drawImage(image2,
			i * colWidth, 0, colWidth, 900,
			(2 * i + 1) * colWidth, 0, colWidth, 900
		);
	}

	// document.body.appendChild(canvas);
	// canvas.style.position = "fixed";
	// canvas.style.top = "0";
	// canvas.style.left = "0";

	const tex = new BABYLON.HtmlElementTexture("photo", canvas, { engine: scene.getEngine(), scene });
	return tex;
}

async function main() {
	const render = new Render(canvas);
	render.showDebugLayer();
	const { scene, camera } = render;
	camera.radius = 40;
	camera.lowerAlphaLimit = (180 + 38 - 360) / 180 * Math.PI;
	camera.upperAlphaLimit = (- 38) / 180 * Math.PI;
	camera.lowerBetaLimit = Math.PI / 6;
	camera.upperBetaLimit = Math.PI / 2;

	// const uvMat = new BABYLON.StandardMaterial("uv", scene);
  // uvMat.diffuseTexture = new BABYLON.Texture("uv_debug.png", scene);

	const pathArray = getPathArray();

	const polymorph = BABYLON.MeshBuilder.CreateRibbon("polymorph", { pathArray, sideOrientation: BABYLON.Mesh.DOUBLESIDE }, scene);
	const bInfo = polymorph.getBoundingInfo();
	polymorph.position.x = -(bInfo.minimum.x + bInfo.maximum.x) / 2;
	polymorph.position.y = -(bInfo.minimum.y + bInfo.maximum.y) / 2;
	// polymorph.material = uvMat;

	const mat = new BABYLON.StandardMaterial("mat", scene);
	polymorph.material = mat;
	mat.diffuseTexture = await getMergedPhotoTexture(scene);
}

main();
