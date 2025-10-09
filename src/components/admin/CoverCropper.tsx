"use client";
import { useCallback, useMemo, useState } from "react";
import Cropper, { Area, Point } from "react-easy-crop";

type Props = {
  file: File;                  // imagem original
  onDone: (blob: Blob) => void; // imagem recortada (600x800)
  onCancel: () => void;
};

export default function CoverCropper({ file, onDone, onCancel }: Props) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);

  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [areaPixels, setAreaPixels] = useState<Area | null>(null);

  // TIPAR o callback resolve o erro:
  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedPixels: Area) => {
      setAreaPixels(croppedPixels);
    },
    []
  );

  async function handleConfirm() {
    if (!areaPixels) return;
    const blob = await cropToBlob(url, areaPixels, 600, 800); // saída 600x800
    onDone(blob);
  }

  return (
    <div className="fixed inset-0 bg-black/60 grid place-items-center p-4">
      <div className="bg-white rounded-xl w-full max-w-3xl overflow-hidden">
        <div className="relative h-[70vh]">
          <Cropper
            image={url}
            crop={crop}
            zoom={zoom}
            aspect={3 / 4}                 // 600x800
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete} // <- tipado
            restrictPosition={false}
            showGrid={true}
          />
        </div>

        <div className="flex gap-3 p-4 border-t">
          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1"
          />
          <button onClick={onCancel} className="px-4 py-2 rounded-xl border">Cancelar</button>
          <button onClick={handleConfirm} className="px-4 py-2 rounded-xl bg-black text-white">
            Confirmar recorte
          </button>
        </div>
      </div>
    </div>
  );
}

/** Recorta e redimensiona para width x height, devolve Blob JPEG */
async function cropToBlob(src: string, area: Area, width: number, height: number): Promise<Blob> {
  const img = document.createElement("img");
  img.src = src;
  await img.decode();

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  // desenha a área recortada redimensionando para 600x800
  ctx.drawImage(
    img,
    area.x, area.y, area.width, area.height, // origem
    0, 0, width, height                      // destino
  );
  return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.92));
}
