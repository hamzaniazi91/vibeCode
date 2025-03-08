// src/components/HouseScene.tsx
import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HouseSceneProps {
  setHovered: (hovered: boolean) => void; // Prop to update hover state in parent
}

const HouseScene: React.FC<HouseSceneProps> = ({ setHovered }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    if (mountRef.current) {
      mountRef.current.appendChild(renderer.domElement);
    }

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // House Group
    const house = new THREE.Group();

    // House Body
    const bodyGeometry = new THREE.BoxGeometry(4, 2, 3);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: 0xFFD700 });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    house.add(body);

    // Roof
    const roofGeometry = new THREE.ConeGeometry(3, 1.5, 4);
    const roofMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
    const roof = new THREE.Mesh(roofGeometry, roofMaterial);
    roof.position.y = 1.75;
    roof.rotation.y = Math.PI / 4;
    house.add(roof);

    // Chimney
    const chimneyGeometry = new THREE.BoxGeometry(0.5, 1, 0.5);
    const chimneyMaterial = new THREE.MeshPhongMaterial({ color: 0x8B0000 });
    const chimney = new THREE.Mesh(chimneyGeometry, chimneyMaterial);
    chimney.position.set(1, 2, 0);
    house.add(chimney);

    // Door
    const doorGeometry = new THREE.BoxGeometry(1, 1.5, 0.1);
    const doorMaterial = new THREE.MeshPhongMaterial({ color: 0x4A2F1A });
    const door = new THREE.Mesh(doorGeometry, doorMaterial);
    door.position.set(0, -0.25, 1.55);
    house.add(door);

    // Window
    const windowGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.1);
    const windowMaterial = new THREE.MeshPhongMaterial({ color: 0x87CEEB });
    const window1 = new THREE.Mesh(windowGeometry, windowMaterial);
    window1.position.set(-1, 0, 1.55);
    house.add(window1);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshPhongMaterial({ color: 0x8B4513 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -1;
    scene.add(ground);

    // Add house to scene
    scene.add(house);

    // Camera position
    camera.position.z = 7;
    camera.position.y = 5;
    camera.lookAt(0, 0, 0);

    // Raycaster for interactivity
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let isHovered = false;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      house.rotation.y += 0.01; // Rotate house
      if (isHovered) {
        house.scale.lerp(new THREE.Vector3(1.2, 1.2, 1.2), 0.1);
      } else {
        house.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
      renderer.render(scene, camera);
    };
    animate();

    // Mouse move handler
    const onMouseMove = (event: MouseEvent) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(house, true);
      isHovered = intersects.length > 0;
      setHovered(isHovered); // Update parent state
    };

    // Resize handler
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, [setHovered]); // Dependency array includes setHovered

  return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
};

export default HouseScene;