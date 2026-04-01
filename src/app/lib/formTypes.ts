/** Material catalog and shared form types */

export interface MaterialItem {
  key: string;
  name: string;
  hasSpanish: boolean;
}

export interface MaterialCategory {
  id: string;
  label: string;
  items: MaterialItem[];
}

export const MATERIAL_CATALOG: MaterialCategory[] = [
  {
    id: "vehicle_driveway",
    label: "Vehicle & Driveway",
    items: [
      { key: "car_seat_cards", name: "Car seat safety cards", hasSpanish: false },
      { key: "spot_tot_cards", name: "Spot the Tot / Forget Me Not cards", hasSpanish: true },
      { key: "spot_tot_clings", name: "Spot the Tot / Forget Me Not window clings", hasSpanish: true },
      { key: "atv_cards", name: "ATV safety cards", hasSpanish: false },
    ],
  },
  {
    id: "home_safety",
    label: "Home Safety",
    items: [
      { key: "window_falls_cards", name: "Window falls safety cards", hasSpanish: false },
      { key: "window_falls_clings", name: "Window falls window clings", hasSpanish: false },
      { key: "firearm_cards", name: "Firearm safety cards", hasSpanish: false },
    ],
  },
  {
    id: "active_outdoor",
    label: "Active & Outdoor",
    items: [
      { key: "helmet_cards", name: "Wear Your Helmet cards", hasSpanish: false },
      { key: "water_safety_cards", name: "Water safety cards", hasSpanish: false },
      { key: "water_watcher_card", name: "Water watcher card", hasSpanish: false },
      { key: "pedestrian_cards", name: "Pedestrian safety cards", hasSpanish: false },
    ],
  },
  {
    id: "emotional_wellbeing",
    label: "Emotional Wellbeing",
    items: [
      { key: "ew_cards", name: "Emotional wellbeing cards", hasSpanish: true },
      { key: "ew_magnets", name: "Feelings wheel magnets", hasSpanish: true },
      { key: "ew_workbooks", name: "Emotional wellbeing workbooks", hasSpanish: true },
    ],
  },
  {
    id: "prevention",
    label: "Prevention",
    items: [
      { key: "vaping_cards", name: "Vaping prevention cards", hasSpanish: false },
    ],
  },
  {
    id: "other",
    label: "Other",
    items: [
      { key: "other", name: "Custom request", hasSpanish: false },
    ],
  },
];

export interface MaterialSelection {
  [materialKey: string]: { selected: boolean; quantity: number; customText?: string };
}

export type RequestPath = "mailing" | "event";

export interface FormData {
  requestType: RequestPath | null;
  // Contact
  firstName: string;
  lastName: string;
  organization: string;
  email: string;
  phone: string;
  // Materials
  materials: MaterialSelection;
  // Shipping (mailing path)
  shippingState: string;
  shippingCounty: string;
  shippingAddress1: string;
  shippingAddress2: string;
  shippingCity: string;
  shippingZip: string;
  // Timing
  preferredDate: string;
  notes: string;
  // Event path
  wantPresentation: boolean;
  wantMaterials: boolean;
  presentationFormat: "in_person" | "virtual" | "";
  eventDate: string;
  eventStartTime: string;
  eventEndTime: string;
  estimatedAttendance: string;
  requesterAttending: boolean;
  // Audience
  audienceTypes: string[];
  topics: string[];
  // Location (in-person)
  eventAddress1: string;
  eventAddress2: string;
  eventCity: string;
  eventState: string;
  eventZip: string;
  indoorOutdoor: "indoor" | "outdoor" | "both" | "";
  parkingInstructions: string;
  mapsLink: string;
  // Virtual
  meetingLink: string;
  meetingPlatform: "zoom" | "teams" | "other" | "";
}

export const EMPTY_FORM: FormData = {
  requestType: null,
  firstName: "",
  lastName: "",
  organization: "",
  email: "",
  phone: "",
  materials: {},
  shippingState: "",
  shippingCounty: "",
  shippingAddress1: "",
  shippingAddress2: "",
  shippingCity: "",
  shippingZip: "",
  preferredDate: "",
  notes: "",
  wantPresentation: false,
  wantMaterials: false,
  presentationFormat: "",
  eventDate: "",
  eventStartTime: "",
  eventEndTime: "",
  estimatedAttendance: "",
  requesterAttending: false,
  audienceTypes: [],
  topics: [],
  eventAddress1: "",
  eventAddress2: "",
  eventCity: "",
  eventState: "",
  eventZip: "",
  indoorOutdoor: "",
  parkingInstructions: "",
  mapsLink: "",
  meetingLink: "",
  meetingPlatform: "",
};

export const AUDIENCE_OPTIONS = [
  "Early education (3-5)",
  "Children (K-8)",
  "Teens (9-12)",
  "Families",
  "Adults",
  "Mixed community",
  "Low income",
  "New parents",
  "Professionals",
  "Underserved",
  "Other",
];

export const TOPIC_OPTIONS = [
  "Car seats",
  "Spot the Tot",
  "Window falls",
  "Helmet safety",
  "ATV safety",
  "Water safety",
  "Pedestrian safety",
  "Emotional wellbeing",
  "Other",
];

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

/** Extracted data from AI parsing of uploads/paste/chat */
export interface ExtractedFormData {
  requestType?: "mailing" | "event" | "both";
  firstName?: string;
  lastName?: string;
  organization?: string;
  email?: string;
  phone?: string;
  materials?: { key: string; quantity: number }[];
  eventDate?: string;
  eventStartTime?: string;
  eventEndTime?: string;
  estimatedAttendance?: string;
  audienceTypes?: string[];
  topics?: string[];
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  notes?: string;
  confidence?: Record<string, number>;
}
