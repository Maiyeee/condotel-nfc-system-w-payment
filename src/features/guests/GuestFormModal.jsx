import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { emptyGuest } from './guestsData'

const guestSchema = z.object({
  name: z.string().trim().min(2, 'Name is required.'),
  email: z.string().trim().email('Enter a valid email.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number.'),
  idNumber: z.string().trim().optional(),
  status: z.enum(['active', 'inactive']),
})

export default function GuestFormModal({ open, onClose, onSave, guest }) {
  const isEditing = Boolean(guest)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(guestSchema),
    defaultValues: emptyGuest,
  })

  // Reset the form whenever the modal opens, either with the guest
  // being edited or a blank slate for "Add Guest".
  useEffect(() => {
    if (open) reset(guest ?? emptyGuest)
  }, [open, guest, reset])

  const onSubmit = async (data) => {
    await onSave(data)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? 'Edit Guest' : 'Add Guest'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button type="submit" form="guest-form" isLoading={isSubmitting}>
            {isEditing ? 'Save Changes' : 'Add Guest'}
          </Button>
        </>
      }
    >
      <form id="guest-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Full Name" placeholder="Juan Dela Cruz" error={errors.name?.message} {...register('name')} />
        <Input
          label="Email"
          type="email"
          placeholder="juan.delacruz@gmail.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Phone Number"
          placeholder="0917 123 4567"
          error={errors.phone?.message}
          {...register('phone')}
        />
        <Input
          label="ID Number (optional)"
          placeholder="PSA-0012345"
          error={errors.idNumber?.message}
          {...register('idNumber')}
        />
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-700">Status</span>
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 focus:border-navy-700 focus:outline-none focus:ring-2 focus:ring-navy-700/30"
            {...register('status')}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </label>
      </form>
    </Modal>
  )
}
