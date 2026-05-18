import { useEffect, useRef } from "react";
import { Application, Sprite, Assets, Container } from "pixi.js";
import "../sass/Map.scss";
import mapBg from "../assets/map.png";

export default function Map() {
  const pixiContainerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  useEffect(() => {
    if (!pixiContainerRef.current) return;

    let isCancelled = false;
    let mapContainer: Container | null = null;

    const initPixi = async () => {
      const app = new Application();

      await app.init({
        resizeTo: pixiContainerRef.current,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
        backgroundColor: 0x111823,
      });

      if (isCancelled) {
        app.destroy(true, { children: true, texture: true });
        return;
      }

      appRef.current = app;
      pixiContainerRef.current.appendChild(app.canvas);

      // --- 1. EINEN KARTEN-CONTAINER ERSTELLEN ---
      // Wir packen die Karte in einen eigenen Container, damit wir diesen unabhängig zoomen können
      mapContainer = new Container();
      app.stage.addChild(mapContainer);

      // Asset laden und dem Container hinzufügen
      const texture = await Assets.load(mapBg);
      const backgroundSprite = new Sprite(texture);
      mapContainer.addChild(backgroundSprite);

      // Initiale Zentrierung & Skalierung des Containers auf dem Bildschirm
      const fitBackground = () => {
        const ratio = Math.max(
          app.screen.width / texture.source.width,
          app.screen.height / texture.source.height,
        );
        mapContainer!.scale.set(ratio);
        mapContainer!.x = (app.screen.width - mapContainer!.width) / 2;
        mapContainer!.y = (app.screen.height - mapContainer!.height) / 2;
      };
      fitBackground();

      // --- 2. ZOOM-LOGIK (MAUSRAD-EVENT) ---
      const canvas = app.canvas;

      const handleWheel = (e: WheelEvent) => {
        if (!mapContainer) return;
        e.preventDefault(); // Verhindert, dass die eigentliche Webseite scrollt

        // Zoom-Konstanten
        const zoomFactor = 1.1;
        const minScale = 0.5; // Wie weit man rauszoomen kann
        const maxScale = 5.0; // Wie weit man reinzoomen kann

        // Bestimmen, ob rein- oder rausgescrollt wird
        const zoomIn = e.deltaY < 0;

        // Aktuelle Mausposition relativ zum Canvas holen
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Die Position der Maus VOR dem Zoom im Koordinatensystem des Karten-Containers berechnen
        const localX = (mouseX - mapContainer.x) / mapContainer.scale.x;
        const localY = (mouseY - mapContainer.y) / mapContainer.scale.y;

        // Neuen Skalierungswert berechnen
        let newScale = zoomIn
          ? mapContainer.scale.x * zoomFactor
          : mapContainer.scale.x / zoomFactor;

        // Zoom-Grenzen einhalten
        newScale = Math.max(minScale, Math.min(maxScale, newScale));

        // Skalierung anwenden
        mapContainer.scale.set(newScale);

        // Die Position des Containers so verschieben, dass der Punkt unter der Maus fix bleibt
        mapContainer.x = mouseX - localX * newScale;
        mapContainer.y = mouseY - localY * newScale;
      };

      // Event-Listener direkt an das Canvas hängen
      canvas.addEventListener("wheel", handleWheel, { passive: false });
      // --- 3. DRAG-LOGIK (KARTE VERSCHIEBEN) ---
      let isDragging = false;
      let dragStartPoint = { x: 0, y: 0 };
      let mapStartPoint = { x: 0, y: 0 };

      // Macht die Bühne empfänglich für Maus- und Touch-Events
      app.stage.eventMode = "static";
      // Sorgt dafür, dass Events auch außerhalb des Canvas weiterlaufen, wenn man die Maus schnell bewegt
      app.stage.hitArea = app.screen;

      app.stage.on("pointerdown", (e) => {
        // Verschieben nur erlauben, wenn man mit der linken Maustaste klickt
        if (e.button === 0) {
          isDragging = true;
          // Aktuelle Position der Maus beim Klick merken
          dragStartPoint = { x: e.clientX, y: e.clientY };
          // Aktuelle Position der Karte beim Klick merken
          mapStartPoint = { x: mapContainer!.x, y: mapContainer!.y };
        }
      });

      app.stage.on("pointermove", (e) => {
        if (!isDragging || !mapContainer) return;

        // Berechnen, wie weit die Maus seit dem Klick bewegt wurde
        const deltaX = e.clientX - dragStartPoint.x;
        const deltaY = e.clientY - dragStartPoint.y;

        // Die neue Position auf den Karten-Container anwenden
        mapContainer.x = mapStartPoint.x + deltaX;
        mapContainer.y = mapStartPoint.y + deltaY;
      });

      // Stoppt das Draggen, sobald die Maus losgelassen wird oder das Canvas verlässt
      const stopDragging = () => {
        isDragging = false;
      };
      app.stage.on("pointerup", stopDragging);
      app.stage.on("pointerupoutside", stopDragging);

      // Resize-Event auffangen
      app.renderer.on("resize", () => {
        // Bei grober Fensteränderung setzen wir die Karte zurück, um Darstellungsfehler zu vermeiden
        fitBackground();
      });

      // Cleanup-Dienst innerhalb von Pixi für das Wheel-Event merken
      (app as any)._customWheelHandler = handleWheel;
    };

    initPixi();

    return () => {
      isCancelled = true;
      if (appRef.current) {
        const canvas = appRef.current.canvas;
        const handler = (appRef.current as any)._customWheelHandler;
        if (canvas && handler) {
          canvas.removeEventListener("wheel", handler);
        }
        appRef.current.destroy(true, {
          children: true,
          texture: true,
          baseTexture: true,
        });
        appRef.current = null;
      }
    };
  }, []);

  return (
    <div className="fullscreen-map-container">
      <div ref={pixiContainerRef} className="pixi-resize-container" />
    </div>
  );
}
