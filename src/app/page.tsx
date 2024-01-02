"use client";
import { Alert, Snackbar } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export default function Home() {
    const [camera, setCamera] = useState<THREE.PerspectiveCamera | null>(null);
    const [renderer, setRenderer] = useState<THREE.WebGLRenderer | null>(null);
    const [error, setError] = useState<string>("");

    // It is laggy to resize the window, especially in a 3D scene. Use throttling to optimize. More info:
    // https://web.archive.org/web/20220714020647/https://bencentra.com/code/2015/02/27/optimizing-window-resize.html
    let throttledResize = useRef<boolean>(false);
    const throttleResizeDelay: number = 250;

    const handleErrorClose = () => {
        console.log("closing error");
        setError("");
    };

    // Handle page load
    useEffect(() => {
        const cameraStart = new THREE.Vector3(0, 0, 5);
        // Create a Three.js camera
        let _camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        setCamera(_camera);
        _camera.position.set(cameraStart.x, cameraStart.y, cameraStart.z);

        // Create a Three.js renderer
        const canvas: HTMLElement = document.getElementById(
            "threeCanvas"
        ) as HTMLElement;
        try {
            const _renderer = new THREE.WebGLRenderer({
                canvas,
                antialias: true,
            });
            _renderer.setSize(window.innerWidth, window.innerHeight);
            document.body.appendChild(_renderer.domElement);
            setRenderer(_renderer);
        } catch (err) {
            let errorMsg: string =
                "Failed to render WebGL scene. This could be due to hardware acceleration being turned off in your browser settings.";
            console.error(errorMsg);
            setError(errorMsg);
        }
    }, []);

    // Initialize scene
    useEffect(() => {
        const resizeCanvas = () => {
            if (!camera || !renderer) return;

            if (!throttledResize.current) {
                // we're throttled!
                throttledResize.current = true;
                // set a timeout to un-throttle
                setTimeout(function () {
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    renderer.setSize(window.innerWidth, window.innerHeight);
                    throttledResize.current = false;
                }, throttleResizeDelay);
            }
        };

        if (!camera || !renderer) return;

        // Create a Three.js scene
        const scene = new THREE.Scene();

        // Create a cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        //add light
        const light = new THREE.PointLight(0xffffff, 1, 100);
        light.position.set(0, 0, 0);
        scene.add(light);

        // Add animation and update the scene
        const animate = () => {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01;
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        };

        animate();

        // Add event listener to handle resizing
        window.addEventListener("resize", resizeCanvas);

        // Return a cleanup function to dispose of Three.js resources
        return () => {
            renderer.dispose();
            document.body.removeChild(renderer.domElement);
            window.removeEventListener("resize", resizeCanvas);
        };
    }, [camera, renderer]);

    return (
        <div>
            <div className="fixed bg-tertiary h-screen w-full z-10">
                <canvas
                    id="threeCanvas"
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                    }}
                />
            </div>
            <Snackbar
                open={error !== ""}
                autoHideDuration={60000}
                onClose={handleErrorClose}
                className="z-10"
            >
                <Alert severity="error" sx={{ width: "100%" }}>
                    {error}
                </Alert>
            </Snackbar>
        </div>
    );
}
