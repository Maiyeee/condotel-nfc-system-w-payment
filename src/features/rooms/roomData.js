export const ROOM_STATUSES = [
  "Available",
  "Occupied",
  "Maintenance",
];

export const ROOM_TYPES = [
  "Deluxe Room",
  "Superior Room",
  "Suite",
  "Studio",
  "Family Room",
];

export const DEFAULT_ROOMS = [
  {
    id: "room-101",
    name: "Room 101",
    type: "Deluxe Room",
    rate: 2500,
    floor: 1,
    status: "Available",
    description: "Comfortable room with a modern interior and pool access.",
    photo:
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "room-102",
    name: "Room 102",
    type: "Deluxe Room",
    rate: 2500,
    floor: 1,
    status: "Available",
    description: "Bright deluxe unit suitable for short and extended stays.",
    photo:
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "room-103",
    name: "Room 103",
    type: "Superior Room",
    rate: 3000,
    floor: 1,
    status: "Occupied",
    description: "Spacious superior room with upgraded furnishings.",
    photo:
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "room-104",
    name: "Room 104",
    type: "Superior Room",
    rate: 3000,
    floor: 1,
    status: "Available",
    description: "Quiet superior room with a clean, contemporary finish.",
    photo:
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "room-105",
    name: "Room 105",
    type: "Suite",
    rate: 4500,
    floor: 1,
    status: "Available",
    description: "Large suite with additional living space for longer stays.",
    photo:
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1000&q=80",
  },
  {
    id: "room-106",
    name: "Room 106",
    type: "Suite",
    rate: 4500,
    floor: 1,
    status: "Maintenance",
    description: "Suite temporarily unavailable for maintenance work.",
    photo:
      "https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=1000&q=80",
  },
];
