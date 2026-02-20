"use client";

import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth";

export default function GroupPhotosTab({
  groupId,
}: {
  groupId: string;
}) {

  const [photos, setPhotos] =
    useState<any[]>([]);

  const [loading, setLoading] =
    useState(true);

  const token = getToken();

  async function loadPhotos() {

    const res = await fetch(
      `/api/photos/group?groupId=${groupId}`,
      {
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      }
    );

    const data =
      await res.json();

    setPhotos(data.photos || []);

    setLoading(false);

  }

  useEffect(() => {
    loadPhotos();
  }, []);

  if (loading)
    return (
      <div>
        Loading photos...
      </div>
    );

  if (photos.length === 0)
    return (
      <div className="bg-white border rounded-lg p-6 text-center text-gray-500">
        No photos yet
      </div>
    );

  return (
    <div>

      <h2 className="text-xl font-bold text-black mb-4">
        Group Photos
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">

        {photos.map(
          (photo) => (

            <div
              key={
                photo._id
              }
              className="bg-white border rounded-lg overflow-hidden shadow-sm hover:shadow-md"
            >

              <img
                src={
                  photo.photoUrl
                }
                className="w-full h-48 object-cover"
              />

              <div className="p-2 text-xs text-gray-500">

                {new Date(
                  photo.createdAt
                ).toLocaleDateString()}

              </div>

            </div>

          )
        )}

      </div>

    </div>
  );
}
