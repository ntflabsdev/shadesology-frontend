export type ReminderStatus = "scheduled" | "due-soon" | "overdue" | "completed";

export interface MaintenanceReminder {
  id: string;
  productName: string;
  productType: string;
  serviceType: string;
  dueDate: string;
  lastService: string;
  nextAction: string;
  recommendedInterval: string;
  status: ReminderStatus;
  preferredChannel: "email" | "sms" | "portal";
  summary: string;
  checklist: string[];
}

export const maintenanceReminders: MaintenanceReminder[] = [
  {
    id: "awning-spring-clean",
    productName: "South Deck Retractable Awning",
    productType: "Retractable awning",
    serviceType: "Seasonal clean + tension check",
    dueDate: "2026-10-18",
    lastService: "2026-04-11",
    nextAction: "Clean the fabric, inspect support arms, and confirm motor response before cooler months.",
    recommendedInterval: "6 months",
    status: "due-soon",
    preferredChannel: "email",
    summary: "This reminder is triggered by the seasonal cleaning cycle recommended for high-use patio awnings.",
    checklist: [
      "Inspect fabric for mildew or fading",
      "Clean with a mild solution and low-pressure rinse",
      "Check arm and motor alignment",
      "Review weather seals and hardware",
    ],
  },
  {
    id: "pergola-structure",
    productName: "Mountain View Fabric Pergola",
    productType: "Fabric pergola",
    serviceType: "Frame inspection",
    dueDate: "2026-10-12",
    lastService: "2026-03-01",
    nextAction: "Review the frame, fasteners and drainage path before the rainy season starts.",
    recommendedInterval: "12 months",
    status: "overdue",
    preferredChannel: "sms",
    summary: "A structural inspection is past due for this pergola. Early review reduces corrosion and water exposure risk.",
    checklist: [
      "Tighten hardware and review corrosion points",
      "Confirm drainage channels are clear",
      "Check support posts for movement",
      "Inspect fabric tension and pressure points",
    ],
  },
  {
    id: "screen-track",
    productName: "Pool Privacy Screen",
    productType: "Retractable screen",
    serviceType: "Track & mesh cleaning",
    dueDate: "2026-11-06",
    lastService: "2026-05-19",
    nextAction: "Clean the track and confirm smooth retraction before the holiday season and pool use peaks.",
    recommendedInterval: "9 months",
    status: "scheduled",
    preferredChannel: "portal",
    summary: "This reminder will help avoid track buildup and friction during frequent seasonal use.",
    checklist: [
      "Remove debris from the bottom rail",
      "Clean screen surface and surrounding frame",
      "Check spline and guide alignment",
      "Test smooth retraction and stopping points",
    ],
  },
  {
    id: "umbrella-care",
    productName: "Garden Umbrella System",
    productType: "Umbrella",
    serviceType: "Fabric and pole inspection",
    dueDate: "2026-12-14",
    lastService: "2026-06-07",
    nextAction: "Inspect the pole finish, fabric, and crank action before winter storage if needed.",
    recommendedInterval: "12 months",
    status: "scheduled",
    preferredChannel: "email",
    summary: "A seasonal check keeps the canopy, pole and crank assembly performing smoothly across the year.",
    checklist: [
      "Inspect canopy stitching and UV wear",
      "Check the crank or tilt assembly",
      "Verify pole finish and damping hardware",
      "Review storage guidance before winter",
    ],
  },
  {
    id: "awning-complete",
    productName: "Courtyard Motorized Awning",
    productType: "Retractable awning",
    serviceType: "Motor & weather check",
    dueDate: "2026-09-30",
    lastService: "2026-09-03",
    nextAction: "Confirm the motor is operating smoothly and that the fabric has no tears after summer use.",
    recommendedInterval: "6 months",
    status: "completed",
    preferredChannel: "portal",
    summary: "Completed service record. This reminder is included for historical tracking and future maintenance scheduling.",
    checklist: [
      "Motor test completed",
      "Fabric wear review complete",
      "Hardware check complete",
      "Customer notified of service status",
    ],
  },
];

export function getMaintenanceReminders(): MaintenanceReminder[] {
  return maintenanceReminders;
}
