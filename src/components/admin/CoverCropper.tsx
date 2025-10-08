"use client"
import Cropper from "react-easy-crop"
import { useCallback, useMemo, useState } from "react"

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener("load", () => resolve(image))
    image.addEventListener("error", error => reject(error))
    image.setAttribute("crossOrigin", "anonymous") // evita problemas em preview
    image.src = url
  })
}

async function getCroppedBlob(imageSrc: string, crop: { x: number; y: number; width: number; height: number }): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")!

  // queremos 800x600
  const outW = 800
  const outH = 600
  canvas.width = outW
  canvas.height = outH

  // desenha recorte redimensionando para 800x600
  ctx.drawImage(
    image,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, outW, outH
  )

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((b) => resolve(b as Blob), "image/jpeg", 0.9)
  })
}

export default function CoverCropper({
  file,
  onDone,
  onCancel
}: {
  file: File
  onDone: (blob: Blob) => void
  onCancel: () => void
}) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [area, setArea] = useState<{ x: number; y: number; width: number; height: number } | null>(null)

  const url = useMemo(() => URL.createObjectURL(file), [file])

  const onCropComplete = useCallback((_croppedArea, croppedPixels) => {
    setArea(croppedPixels)
  }, [])

  const handleDone = async () => {
    if (!area) return
    const blob = await getCroppedBlob(url, area)
    onDone(blob)
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden">
        <div className="relative w-full h-[60vh] bg-black">
          <Cropper
            image={url}
            crop={crop}
            zoom={zoom}
            aspect={4/3} // 800x600
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
          />
        </div>
        <div className="p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full">
            <label className="text-sm">Zoom</label>
            <input type="range" min={1} max={3} step={0.01} value={zoom} onChange={e => setZoom(Number(e.target.value))} className="w-full" />
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel} className="px-4 py-2 border rounded-xl">Cancelar</button>
            <button onClick={handleDone} className="px-4 py-2 rounded-xl bg-black text-white">Usar recorte 800x600</button>
          </div>
        </div>
      </div>
    </div>
  )
}