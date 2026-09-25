import { useEffect, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ImagePlus, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ROOM_STATUSES, ROOM_TYPES } from "./roomData";

const roomSchema = z.object({
  name: z.string().trim().min(1, "Room name is required."),
  type: z.string().min(1, "Room type is required."),
  rate: z.coerce.number().positive("Rate must be greater than 0."),
  floor: z.coerce.number().int().min(1, "Floor must be at least 1."),
  status: z.enum(ROOM_STATUSES),
  description: z
    .string()
    .max(240, "Description must be 240 characters or less.")
    .optional(),
  photo: z.string().optional(),
});

const EMPTY_VALUES = {
  name: "",
  type: "Deluxe Room",
  rate: 2500,
  floor: 1,
  status: "Available",
  description: "",
  photo: "",
};

export default function RoomFormModal({ room, onClose, onSave }) {
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(room?.photo ?? "");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(roomSchema),
    defaultValues: room ?? EMPTY_VALUES,
  });

  useEffect(() => {
    const values = room ?? EMPTY_VALUES;
    reset(values);
    setImagePreview(values.photo ?? "");
  }, [room, reset]);

  function handleImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      window.alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = String(reader.result ?? "");
      setImagePreview(result);
      setValue("photo", result, { shouldDirty: true });
    };

    reader.readAsDataURL(file);
  }

  function submit(values) {
    onSave({
      ...values,
      rate: Number(values.rate),
      floor: Number(values.floor),
      description: values.description?.trim() ?? "",
      photo: values.photo || "",
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="room-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div>
            <h2
              id="room-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              {room ? "Edit Room" : "Add Room"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              {room
                ? "Update this room's information."
                : "Create a new room or condotel unit."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="space-y-5 p-5">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-700">
              Room Photo
            </label>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex h-48 w-full overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 text-left transition hover:border-[#0b4f8a] hover:bg-blue-50/30"
            >
              {imagePreview ? (
                <>
                  <img
                    src={imagePreview}
                    alt="Selected room preview"
                    className="h-full w-full object-cover"
                  />
                  <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-lg bg-slate-950/75 px-3 py-2 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
                    Change photo
                  </span>
                </>
              ) : (
                <span className="m-auto flex flex-col items-center gap-2 text-slate-400">
                  <ImagePlus size={30} />
                  <span className="text-xs font-semibold">
                    Upload room photo
                  </span>
                  <span className="text-[11px]">
                    PNG, JPG, WEBP · stored locally for this prototype
                  </span>
                </span>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Room Name" error={errors.name?.message}>
              <input
                {...register("name")}
                placeholder="Room 107"
                className="form-input"
              />
            </Field>

            <Field label="Room Type" error={errors.type?.message}>
              <select {...register("type")} className="form-input">
                {ROOM_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Nightly Rate (₱)" error={errors.rate?.message}>
              <input
                {...register("rate")}
                type="number"
                min="1"
                step="50"
                className="form-input"
              />
            </Field>

            <Field label="Floor" error={errors.floor?.message}>
              <input
                {...register("floor")}
                type="number"
                min="1"
                className="form-input"
              />
            </Field>

            <Field label="Status" error={errors.status?.message}>
              <select {...register("status")} className="form-input">
                {ROOM_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Photo URL (optional)" error={errors.photo?.message}>
              <input
                {...register("photo")}
                placeholder="https://..."
                className="form-input"
                onChange={(event) => {
                  register("photo").onChange(event);
                  setImagePreview(event.target.value);
                }}
              />
            </Field>
          </div>

          <Field
            label="Description"
            error={errors.description?.message}
            hint="Optional · maximum 240 characters"
          >
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Short description of the room, amenities, or view..."
              className="form-input resize-none"
            />
          </Field>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b4f8a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#083d6c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={16} />
              {room ? "Save Changes" : "Create Room"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {hint && !error && (
        <p className="mt-1 text-[11px] text-slate-400">{hint}</p>
      )}
      {error && <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>}
    </div>
  );
}
