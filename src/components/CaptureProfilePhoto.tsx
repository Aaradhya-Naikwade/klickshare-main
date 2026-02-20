
"use client";

import { useRef, useState } from "react";
import { getToken } from "@/lib/auth";
import { toast } from "sonner";

import {
  Camera,
  Upload,
  X,
  Loader2,
} from "lucide-react";

export default function CaptureProfilePhoto({
  onClose,
  onSuccess,
}: any) {

  const videoRef =
    useRef<HTMLVideoElement>(null);

  const canvasRef =
    useRef<HTMLCanvasElement>(null);

  const [loading, setLoading] =
    useState(false);

  const [cameraStarted,
    setCameraStarted] =
    useState(false);

  // START CAMERA
  async function startCamera() {

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({
          video: true,
        });

      if (videoRef.current) {

        videoRef.current.srcObject =
          stream;

      }

      setCameraStarted(true);

    }
    catch {

      toast.error(
        "Camera access denied"
      );

    }

  }

  // CAPTURE PHOTO
  async function capture() {

    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;

    if (!video || !canvas)
      return;

    const ctx =
      canvas.getContext("2d");

    canvas.width =
      video.videoWidth;

    canvas.height =
      video.videoHeight;

    ctx?.drawImage(
      video,
      0,
      0
    );

    const blob =
      await new Promise<Blob>(
        (resolve) =>
          canvas.toBlob(
            (b) =>
              resolve(b!),
            "image/jpeg",
            0.95
          )
      );

    upload(blob);

  }

  // UPLOAD
  // async function upload(blob: Blob) {

  //   try {

  //     setLoading(true);

  //     const token =
  //       getToken();

  //     const formData =
  //       new FormData();

  //     formData.append(
  //       "file",
  //       blob,
  //       "profile.jpg"
  //     );

  //     formData.append(
  //       "token",
  //       token!
  //     );

  //     const res =
  //       await fetch(
  //         "/api/user/upload-photo",
  //         {
  //           method: "POST",
  //           body: formData,
  //         }
  //       );

  //     const data =
  //       await res.json();

  //     if (!res.ok) {

  //       throw new Error(
  //         data.error ||
  //         "Upload failed"
  //       );

  //     }

  //     toast.success(
  //       "Profile photo updated"
  //     );

  //     onSuccess(data.url);

  //     onClose();

  //   }
  //   catch (err: any) {

  //     toast.error(
  //       err.message
  //     );

  //   }
  //   finally {

  //     setLoading(false);

  //   }

  // }
  async function upload(blob: Blob) {
    try {
      setLoading(true);

      const token = getToken();

      if (!token) {
        throw new Error("Not logged in");
      }

      const formData = new FormData();

      formData.append(
        "file",
        blob,
        "profile.jpg"
      );

      const res = await fetch(
        "/api/user/upload-photo",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // ✅ FIX
          },
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Upload failed"
        );
      }

      toast.success("Profile photo updated");

      onSuccess(data.url);
      onClose();

    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }


  return (

    <div className="
      fixed inset-0 z-50
      bg-black/70 backdrop-blur-sm
      flex items-center justify-center
      p-4
    ">

      {/* MODAL */}
      <div className="
        bg-white
        border border-[#b2dfdb]
        rounded-xl
        shadow-lg
        max-w-lg
        w-full
        p-6
      ">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">

          <div className="flex items-center gap-2">

            <Camera className="text-[#0f766e]" />

            <h2 className="font-semibold text-[#111827]">
              Capture Profile Photo
            </h2>

          </div>

          <button
            onClick={onClose}
            className="
              p-2
              rounded-lg
              hover:bg-gray-100
              text-gray-500
            "
          >
            <X size={18} />
          </button>

        </div>

        {/* CAMERA VIEW */}
        <div className="
          bg-black
          rounded-lg
          overflow-hidden
          border border-[#b2dfdb]
        ">

          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="
              w-full
              aspect-video
              object-cover
            "
          />

        </div>

        <canvas
          ref={canvasRef}
          className="hidden"
        />

        {/* ACTIONS */}
        <div className="
          flex flex-wrap gap-3
          mt-5
        ">

          {/* START CAMERA */}
          <button
            onClick={startCamera}
            className="
              flex-1
              bg-[#e0f2f1]
              hover:bg-[#ccebea]
              text-[#0f766e]
              py-2
              rounded-lg
              flex items-center justify-center gap-2
              border border-[#b2dfdb]
            "
          >

            <Camera size={16} />

            Start Camera

          </button>

          {/* CAPTURE */}
          <button
            onClick={capture}
            disabled={
              loading ||
              !cameraStarted
            }
            className="
              flex-1
              bg-[#0f766e]
              hover:bg-[#0b5e58]
              text-white
              py-2
              rounded-lg
              flex items-center justify-center gap-2
              disabled:opacity-50
            "
          >
            
            {loading
              ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Uploading...
                </>
              )
              : (
                <>
                  <Upload size={16} />
                  Capture & Upload
                </>
              )
            }

          </button>

        </div>

      </div>

    </div>

  );

}
