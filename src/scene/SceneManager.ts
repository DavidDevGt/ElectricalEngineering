import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

/**
 * Envuelve el renderer, cámara, luces y suelo de la escena. No contiene lógica eléctrica
 * (docs/adr/0002-separacion-modelo-dominio-render.md) — solo dibuja lo que la capa de
 * dominio expone.
 */
export class SceneManager {
  readonly scene = new THREE.Scene();
  readonly camera: THREE.PerspectiveCamera;
  readonly renderer: THREE.WebGLRenderer;
  private readonly controls: OrbitControls;

  constructor(container: HTMLElement) {
    this.scene.background = new THREE.Color(0x05070a);
    this.scene.fog = new THREE.Fog(0x05070a, 14, 45);

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      200,
    );
    this.camera.position.set(6, 4, 7);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    container.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 1, 0);
    this.controls.enableDamping = true;

    this.setupLights();
    this.setupGround();

    window.addEventListener("resize", () => this.onResize());
  }

  private setupLights(): void {
    const hemi = new THREE.HemisphereLight(0x88aacc, 0x1a1f24, 0.9);
    this.scene.add(hemi);

    const sun = new THREE.DirectionalLight(0xffffff, 1.4);
    sun.position.set(8, 12, 6);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    // Frustum explícito + bias: sin esto, la sombra por defecto del DirectionalLight queda
    // demasiado ajustada y produce "shadow acne" (artefactos triangulares) en la base de los
    // objetos — visible al verificar la primera captura de pantalla del boilerplate.
    sun.shadow.camera.near = 1;
    sun.shadow.camera.far = 40;
    sun.shadow.camera.left = -15;
    sun.shadow.camera.right = 15;
    sun.shadow.camera.top = 15;
    sun.shadow.camera.bottom = -15;
    sun.shadow.bias = -0.0015;
    sun.shadow.normalBias = 0.02;
    this.scene.add(sun);
  }

  private setupGround(): void {
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x1c232b, roughness: 1 }),
    );
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    const grid = new THREE.GridHelper(60, 60, 0x3a4550, 0x232a30);
    this.scene.add(grid);
  }

  private onResize(): void {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  update(): void {
    this.controls.update();
  }

  render(): void {
    this.renderer.render(this.scene, this.camera);
  }
}
