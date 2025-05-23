
// COCO_CLASSES from the original prompt. COCO-SSD model will output class names directly.
// We will filter detected objects if their class name is among the vehicle types.
export const COCO_CLASSES_LIST: string[] = [ // Renamed to avoid conflict if COCO_CLASSES is used as an object elsewhere.
  'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck', 'boat',
  'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench', 'bird', 'cat', 'dog',
  'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe', 'backpack', 'umbrella',
  'handbag', 'tie', 'suitcase', 'frisbee', 'skis', 'snowboard', 'sports ball', 'kite',
  'baseball bat', 'baseball glove', 'skateboard', 'surfboard', 'tennis racket', 'bottle',
  'wine glass', 'cup', 'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich',
  'orange', 'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
  'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse', 'remote',
  'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink', 'refrigerator',
  'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier', 'toothbrush'
];

// We will filter by class NAMES now, as COCO-SSD returns names.
export const VEHICLE_CLASS_NAMES: string[] = ['bicycle', 'car', 'motorcycle', 'bus', 'truck', 'train', 'boat', 'airplane']; // Added train, boat, airplane as potential vehicles
export const HUMAN_CLASS_NAMES: string[] = ['person'];
export const ANIMAL_CLASS_NAMES: string[] = ['bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra', 'giraffe'];

// VEHICLE_CLASS_IDS is kept for conceptual mapping but direct name filtering is primary.
// It might be useful if a model *only* returned IDs. For COCO-SSD, names are fine.
export const VEHICLE_CLASS_IDS: number[] = VEHICLE_CLASS_NAMES.map(name => COCO_CLASSES_LIST.indexOf(name)).filter(id => id !== -1);
export const HUMAN_CLASS_IDS: number[] = HUMAN_CLASS_NAMES.map(name => COCO_CLASSES_LIST.indexOf(name)).filter(id => id !== -1);
export const ANIMAL_CLASS_IDS: number[] = ANIMAL_CLASS_NAMES.map(name => COCO_CLASSES_LIST.indexOf(name)).filter(id => id !== -1);


export const SIMULATION_CONFIG = {
  CONGESTION_THRESHOLD_HIGH: 10, // Vehicles for High congestion
  CONGESTION_THRESHOLD_MEDIUM: 6, // Vehicles for Medium congestion
  INCIDENT_WINDOW_SIZE: 5, // Rolling window for incident detection (based on vehicle counts)
  INCIDENT_DEVIATION_THRESHOLD: 4, // Deviation from window average to flag incident
  LOG_PREVIEW_COUNT: 5,
};
