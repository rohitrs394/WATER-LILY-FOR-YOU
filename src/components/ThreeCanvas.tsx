import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface ThreeCanvasProps {
  type: "massage-table" | "floating-icons";
}

export const ThreeCanvas: React.FC<ThreeCanvasProps> = ({ type }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth || 300;
    const height = mountRef.current.clientHeight || 300;

    // Create scene
    const scene = new THREE.Scene();
    
    // Transparent background
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 2.5, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    mountRef.current.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0xc9a84c, 2.5, 10);
    pointLight.position.set(2, 4, 3);
    scene.add(pointLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(-3, 5, 2);
    scene.add(dirLight);

    // Create group to hold model
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    let animationFrameId: number;

    // Build model based on type
    if (type === "massage-table") {
      // 3D MASSAGE TABLE MODEL (Cylinders & Cubes in Gold / Soft Rose / Mahogany)
      
      // Mahogany Wood Legs (4 legs)
      const legGeo = new THREE.CylinderGeometry(0.06, 0.04, 1.4, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x3d2010, roughness: 0.5 });
      
      const leg1 = new THREE.Mesh(legGeo, legMat);
      leg1.position.set(-1.2, -0.2, -0.4);
      modelGroup.add(leg1);

      const leg2 = new THREE.Mesh(legGeo, legMat);
      leg2.position.set(1.2, -0.2, -0.4);
      modelGroup.add(leg2);

      const leg3 = new THREE.Mesh(legGeo, legMat);
      leg3.position.set(-1.2, -0.2, 0.4);
      modelGroup.add(leg3);

      const leg4 = new THREE.Mesh(legGeo, legMat);
      leg4.position.set(1.2, -0.2, 0.4);
      modelGroup.add(leg4);

      // Gold frame support
      const frameGeo = new THREE.BoxGeometry(2.6, 0.1, 1.0);
      const goldMat = new THREE.MeshStandardMaterial({ 
        color: 0xc9a84c, 
        metalness: 0.9, 
        roughness: 0.15 
      });
      const frame = new THREE.Mesh(frameGeo, goldMat);
      frame.position.set(0, 0.5, 0);
      modelGroup.add(frame);

      // Soft Rose Leather Mattress
      const matGeo = new THREE.BoxGeometry(2.7, 0.25, 1.15);
      const leatherMat = new THREE.MeshStandardMaterial({ 
        color: 0x092617, // Deep forest green luxury leather
        roughness: 0.6,
        bumpScale: 0.05
      });
      const mattress = new THREE.Mesh(matGeo, leatherMat);
      mattress.position.set(0, 0.65, 0);
      modelGroup.add(mattress);

      // Gold sheet/runner on center
      const sheetGeo = new THREE.BoxGeometry(0.8, 0.26, 1.16);
      const sheetMat = new THREE.MeshStandardMaterial({
        color: 0xc9a84c,
        roughness: 0.3
      });
      const sheet = new THREE.Mesh(sheetGeo, sheetMat);
      sheet.position.set(0.1, 0.65, 0);
      modelGroup.add(sheet);

      // Cozy Pillow
      const pillowGeo = new THREE.BoxGeometry(0.4, 0.1, 0.7);
      const pillowMat = new THREE.MeshStandardMaterial({ color: 0xfff8f0, roughness: 0.8 }); // Cream White pillow
      const pillow = new THREE.Mesh(pillowGeo, pillowMat);
      pillow.position.set(-1.0, 0.8, 0);
      modelGroup.add(pillow);

      // Small rolled towel
      const towelGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 16);
      towelGeo.rotateX(Math.PI / 2);
      const towel = new THREE.Mesh(towelGeo, pillowMat);
      towel.position.set(0.5, 0.8, 0.2);
      modelGroup.add(towel);

      // Adjust camera specifically for table
      camera.position.set(0, 2.2, 4.2);
      camera.lookAt(0, 0.3, 0);

    } else if (type === "floating-icons") {
      // FLOATING 3D SPA COMPONENTS (Candle, Basalt Stones, Lotus)
      
      // 1. Glowing Candle
      const candleGroup = new THREE.Group();
      candleGroup.position.set(-1.4, 0.4, 0);

      const waxGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.5, 16);
      const waxMat = new THREE.MeshStandardMaterial({ 
        color: 0xfff8f0, 
        roughness: 0.6,
        transparent: true,
        opacity: 0.95
      });
      const wax = new THREE.Mesh(waxGeo, waxMat);
      candleGroup.add(wax);

      // Candle Flame
      const flameGeo = new THREE.ConeGeometry(0.06, 0.18, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(0, 0.35, 0);
      candleGroup.add(flame);

      // Candle Gold Base Tray
      const trayGeo = new THREE.CylinderGeometry(0.35, 0.38, 0.04, 16);
      const tray = new THREE.Mesh(trayGeo, goldMat() as THREE.Material);
      tray.position.set(0, -0.27, 0);
      candleGroup.add(tray);

      modelGroup.add(candleGroup);

      // 2. Basalt Spa Stones (Stacked smooth pebbles)
      const stoneGroup = new THREE.Group();
      stoneGroup.position.set(0, -0.2, 0.2);

      const stoneMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.2 });

      // Large stone
      const stone1Geo = new THREE.SphereGeometry(0.4, 16, 16);
      stone1Geo.scale(1.2, 0.3, 1.0);
      const stone1 = new THREE.Mesh(stone1Geo, stoneMat);
      stoneGroup.add(stone1);

      // Medium stone
      const stone2Geo = new THREE.SphereGeometry(0.3, 16, 16);
      stone2Geo.scale(1.1, 0.3, 0.9);
      const stone2 = new THREE.Mesh(stone2Geo, stoneMat);
      stone2.position.set(-0.05, 0.2, 0);
      stone2.rotation.y = 0.5;
      stoneGroup.add(stone2);

      // Small top stone
      const stone3Geo = new THREE.SphereGeometry(0.2, 16, 16);
      stone3Geo.scale(1.0, 0.3, 0.8);
      const stone3 = new THREE.Mesh(stone3Geo, stoneMat);
      stone3.position.set(0.05, 0.38, 0);
      stone3.rotation.y = -0.3;
      stoneGroup.add(stone3);

      modelGroup.add(stoneGroup);

      // 3. Golden Lotus flower
      const lotusGroup = new THREE.Group();
      lotusGroup.position.set(1.4, 0.3, -0.2);

      const centerGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const centerMat = new THREE.MeshStandardMaterial({ color: 0xc9a84c, roughness: 0.1 });
      const center = new THREE.Mesh(centerGeo, centerMat);
      lotusGroup.add(center);

      // Let's model a stylized lotus with 8 wireframe/golden petals
      const petalGeo = new THREE.SphereGeometry(0.2, 8, 8);
      petalGeo.scale(0.5, 0.1, 1.5);
      const petalMat = new THREE.MeshStandardMaterial({ 
        color: 0xc9a84c, 
        metalness: 0.8, 
        roughness: 0.2,
        side: THREE.DoubleSide
      });

      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const petal = new THREE.Mesh(petalGeo, petalMat);
        petal.position.set(Math.sin(angle) * 0.2, 0.05, Math.cos(angle) * 0.2);
        petal.rotation.y = angle;
        petal.rotation.x = 0.35; // flare outward
        lotusGroup.add(petal);
      }

      modelGroup.add(lotusGroup);

      // Adjust camera for floating icons
      camera.position.set(0, 1.2, 3.6);
      camera.lookAt(0, 0.2, 0);
    }

    // Helper helper to generate gold material on demand
    function goldMat() {
      return new THREE.MeshStandardMaterial({ 
        color: 0xc9a84c, 
        metalness: 0.8, 
        roughness: 0.15 
      });
    }

    // Animation Loop
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1;
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", handleMouseMove);

    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth auto rotation
      if (type === "massage-table") {
        targetRotationY = elapsedTime * 0.3 + mouseX * 0.5;
        targetRotationX = Math.sin(elapsedTime * 0.2) * 0.1 + mouseY * 0.2;
        modelGroup.rotation.y = targetRotationY;
        modelGroup.rotation.x = targetRotationX;
      } else if (type === "floating-icons") {
        // Individual float and gentle rotation
        // Candle float
        const candle = modelGroup.children[0];
        if (candle) {
          candle.position.y = 0.4 + Math.sin(elapsedTime * 1.5) * 0.12;
          candle.rotation.y = elapsedTime * 0.2;
          // flicker flame
          const flame = candle.children[1];
          if (flame) {
            flame.scale.setScalar(1 + Math.sin(elapsedTime * 18) * 0.15);
          }
        }

        // Stones float
        const stones = modelGroup.children[1];
        if (stones) {
          stones.position.y = -0.2 + Math.cos(elapsedTime * 1.2) * 0.08;
          stones.rotation.y = elapsedTime * -0.15;
        }

        // Lotus float
        const lotus = modelGroup.children[2];
        if (lotus) {
          lotus.position.y = 0.3 + Math.sin(elapsedTime * 1.8 + 2) * 0.1;
          lotus.rotation.y = elapsedTime * 0.4;
          lotus.rotation.z = Math.sin(elapsedTime) * 0.05;
        }
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    // Create a simple ResizeObserver to prevent canvas scaling issues
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(mountRef.current);

    // Cleanup
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [type]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center overflow-hidden"
      style={{ minHeight: "220px" }}
    />
  );
};
