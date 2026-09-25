import { useEffect } from "react";
import { CalendarDays, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { RESERVATION_STATUSES } from "./reservationData";

const schema = z
  .object({
    guestId: z.string().min(1, "Guest is required."),
    roomId: z.string().min(1, "Room is required."),
    checkIn: z.string().min(1, "Check-in date is required."),
    checkOut: z.string().min(1, "Check-out date is required."),
    status: z.enum(RESERVATION_STATUSES),
  })
  .refine((value) => value.checkOut > value.checkIn, {
    path: ["checkOut"],
    message: "Check-out must be after check-in.",
  });

export default function ReservationFormModal({
  reservation,
  guests,
  rooms,
  reservations,
  onClose,
  onSave,
}) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: reservation ?? {
      guestId: "",
      roomId: "",
      checkIn: "",
      checkOut: "",
      status: "Pending",
    },
  });

  useEffect(() => {
    reset(
      reservation ?? {
        guestId: "",
        roomId: "",
        checkIn: "",
        checkOut: "",
        status: "Pending",
      },
    );
  }, [reservation, reset]);

  function hasConflict(values) {
    return reservations.some((item) => {
      if (reservation && item.id === reservation.id) return false;
      if (item.roomId !== values.roomId) return false;
      if (item.status === "Checked-out") return false;

      // Date ranges overlap when:
      // existing check-in < new check-out AND existing check-out > new check-in.
      return item.checkIn < values.checkOut && item.checkOut > values.checkIn;
    });
  }

  function submit(values) {
    if (hasConflict(values)) {
      setError("roomId", {
        type: "manual",
        message: "This room already has an overlapping reservation.",
      });
      return;
    }

    onSave({
      ...values,
      referenceNo:
        reservation?.referenceNo ??
        `RES-${String(Date.now()).slice(-6)}`,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reservation-modal-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
          <div>
            <h2
              id="reservation-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              {reservation ? "Edit Reservation" : "New Reservation"}
            </h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Create or update a guest room reservation.
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
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Guest" error={errors.guestId?.message}>
              <select {...register("guestId")} className="form-input">
                <option value="">Select guest</option>
                {guests.map((guest) => (
                  <option key={guest.id} value={guest.id}>
                    {guest.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Room" error={errors.roomId?.message}>
              <select {...register("roomId")} className="form-input">
                <option value="">Select room</option>
                {rooms.map((room) => (
                  <option key={room.id} value={room.id}>
                    {room.name} — ₱{Number(room.rate).toLocaleString()}/night
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Check-in" error={errors.checkIn?.message}>
              <div className="relative">
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  {...register("checkIn")}
                  type="date"
                  className="form-input pl-9"
                />
              </div>
            </Field>

            <Field label="Check-out" error={errors.checkOut?.message}>
              <div className="relative">
                <CalendarDays
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  {...register("checkOut")}
                  type="date"
                  className="form-input pl-9"
                />
              </div>
            </Field>

            <Field label="Reservation Status" error={errors.status?.message}>
              <select {...register("status")} className="form-input">
                {RESERVATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-xs leading-5 text-slate-600">
            <strong className="text-slate-800">Date conflict protection:</strong>{" "}
            the form prevents two active reservations from overlapping on the
            same room.
          </div>

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
              className="rounded-lg bg-[#0b4f8a] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#083d6c] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reservation ? "Save Changes" : "Create Reservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-[11px] font-medium text-red-600">{error}</p>
      )}
    </div>
  );
}
