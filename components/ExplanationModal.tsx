
import React from 'react';
import { CloseIcon, InfoIcon, LightBulbIcon, ShareIcon, DocumentTextIcon, AcademicCapIcon, CpuChipIcon, FilmIcon, EyeIcon as EyeScanIcon, ChartPieIcon, TableCellsIcon, DownloadIcon as ArrowDownTrayIcon, UploadIcon as CloudArrowUpIcon, CodeBracketIcon } from './Icons'; // Ensured relative path

interface ExplanationModalProps {
  onClose: () => void;
}
// Using accent-blue as the primary interactive color from the new theme
const MODAL_PRIMARY_ACCENT = "text-accent-blue"; 
const MODAL_INFO_ACCENT = "text-accent-teal";


const SectionTitle: React.FC<{ icon?: React.ElementType, title: string, color?: string }> = ({ icon: IconComponent, title, color = MODAL_PRIMARY_ACCENT }) => (
  <h3 className={`text-xl font-semibold mb-3 mt-5 flex items-center ${color} tracking-wider border-b border-border-ui-default/50 pb-2`}>
    {IconComponent && <IconComponent className="w-6 h-6 mr-3" />}
    {title}
  </h3>
);

const SubSection: React.FC<{ title: string, children: React.ReactNode, titleColor?: string }> = ({ title, children, titleColor = MODAL_PRIMARY_ACCENT }) => (
  <div className="mb-4 p-3 bg-background-panel rounded-md border border-border-ui-default/70">
    <h4 className={`text-md font-semibold mb-2 ${titleColor}`}>{title}</h4>
    <div className="text-sm text-content-secondary space-y-1">{children}</div>
  </div>
);

const ListItem: React.FC<{ children: React.ReactNode, strong?: boolean }> = ({ children, strong }) => (
  <li className={`ml-4 list-disc list-outside ${strong ? 'font-semibold text-content-primary' : ''}`}>{children}</li>
);

const OrderedListItem: React.FC<{ step: string; title: string; children: React.ReactNode; subSteps?: string[] }> = ({ step, title, children, subSteps }) => (
    <li className="mb-3">
        <div className={`flex items-start`}>
            <span className={`mr-3 ${MODAL_PRIMARY_ACCENT} font-bold text-lg leading-tight flex-shrink-0 w-8 text-center`}>{step}</span>
            <div className="flex-grow">
                <strong className={`block ${MODAL_PRIMARY_ACCENT} text-md`}>{title}</strong>
                <div className="text-sm text-content-secondary mt-0.5">{children}</div>
                {subSteps && subSteps.length > 0 && (
                    <ul className="list-disc list-inside ml-4 mt-1 text-xs text-content-muted space-y-0.5">
                        {subSteps.map((sub, index) => <li key={index}>{sub}</li>)}
                    </ul>
                )}
            </div>
        </div>
    </li>
);


const ExplanationModal: React.FC<ExplanationModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out" onClick={onClose}>
      <div 
        className={`bg-background-card text-content-primary w-full max-w-3xl h-[90vh] rounded-lg shadow-elevation-high border ${MODAL_PRIMARY_ACCENT.replace('text-', 'border-')}/50 flex flex-col overflow-hidden transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-fadeInScaleUp`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={`flex items-center justify-between p-5 border-b border-border-ui-default bg-background-panel rounded-t-lg`}>
          <div className="flex items-center space-x-3">
            <AcademicCapIcon className={`w-8 h-8 ${MODAL_PRIMARY_ACCENT}`} />
            <h2 className={`text-2xl font-semibold tracking-wider ${MODAL_PRIMARY_ACCENT}`}>SYSTEM DEBRIEFING</h2>
          </div>
          <button 
            onClick={onClose} 
            className={`text-content-muted hover:text-accent-red transition-colors p-1 rounded-full hover:bg-accent-red/10 focus:outline-none focus:ring-2 focus:ring-accent-red`}
            aria-label="Close modal"
          >
            <CloseIcon className="w-7 h-7" />
          </button>
        </header>

        <div className="p-6 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-border-ui-default scrollbar-track-background-panel flex-grow">
          <SectionTitle icon={InfoIcon} title="I. System Genesis & Purpose" />
          <p className="text-sm text-content-secondary leading-relaxed">
            This Traffic Intelligence Platform represents a client-side, real-time video analysis system. Leveraging browser-native technologies, it processes video feeds directly on the user's device to detect, classify, and quantify vehicular, pedestrian, and faunal activity. The dashboard provides dynamic telemetry, congestion assessment, anomaly flagging, and comprehensive post-analysis reporting, all without server-side processing for the core video analysis.
          </p>

          <SectionTitle icon={CpuChipIcon} title="II. Core Architectural Blueprint" />
          <SubSection title="Technology Stack:" titleColor={MODAL_INFO_ACCENT}>
            <ul className="space-y-1">
              <ListItem strong>React (v19):</ListItem>
              <p className="ml-4 text-xs">A declarative JavaScript library for building dynamic and interactive user interfaces. Manages the application's component structure, state, and rendering pipeline.</p>
              <ListItem strong>TypeScript:</ListItem>
              <p className="ml-4 text-xs">A superset of JavaScript that adds static typing, enhancing code quality, maintainability, and developer productivity by catching errors during development.</p>
              <ListItem strong>TensorFlow.js (TF.js):</ListItem>
              <p className="ml-4 text-xs">An open-source hardware-accelerated JavaScript library for training and deploying machine learning models directly in the browser or in Node.js.</p>
              <ListItem strong>COCO-SSD Model (via TensorFlow.js Models):</ListItem>
              <p className="ml-4 text-xs">A pre-trained object detection model optimized for speed and efficiency, capable of identifying 80 common object classes from the COCO dataset.</p>
              <ListItem strong>Recharts:</ListItem>
              <p className="ml-4 text-xs">A composable charting library built on React components, used for visualizing analytical data through various chart types (line, pie, area).</p>
              <ListItem strong>Tailwind CSS:</ListItem>
              <p className="ml-4 text-xs">A utility-first CSS framework for rapidly building custom user interfaces. Provides low-level utility classes to construct designs directly in the markup.</p>
            </ul>
          </SubSection>
          
          <SubSection title="Primary Libraries & Functions:" titleColor={MODAL_INFO_ACCENT}>
            <ul className="space-y-2">
                <li><strong>@tensorflow/tfjs:</strong>
                    <ul className="ml-4 text-xs list-disc list-inside space-y-0.5">
                        <li><code>tf.ready()</code>: Ensures the TensorFlow.js backend is initialized and ready for operations. Critical for GPU acceleration.</li>
                        <li>Core API: Provides low-level operations (tensors, mathematical functions) which, while not directly used extensively in this app's main logic (as COCO-SSD abstracts much of it), form the foundation of TF.js.</li>
                    </ul>
                </li>
                <li><strong>@tensorflow-models/coco-ssd:</strong>
                    <ul className="ml-4 text-xs list-disc list-inside space-y-0.5">
                        <li><code>cocoSsd.load()</code>: Asynchronously loads the pre-trained COCO-SSD model weights and graph definition, making it ready for inference.</li>
                        <li><code>model.detect(videoElement)</code>: The core inference function. Takes an HTML video, image, or canvas element as input and returns an array of detected objects, each with a class name, confidence score, and bounding box coordinates.</li>
                    </ul>
                </li>
                <li><strong>React (react, react-dom):</strong>
                    <ul className="ml-4 text-xs list-disc list-inside space-y-0.5">
                        <li><code>useState</code>, <code>useEffect</code>, <code>useCallback</code>, <code>useRef</code>: Fundamental React Hooks for managing component state, side effects, memoizing functions, and referencing DOM elements/persistent values respectively.</li>
                        <li>JSX: Syntactic sugar for <code>React.createElement</code>, allowing HTML-like syntax within JavaScript for defining UI structure.</li>
                        <li>Component Model: Enables modular UI development by breaking down the interface into reusable pieces (e.g., `Sidebar`, `TrafficCharts`).</li>
                    </ul>
                </li>
                 <li><strong>Recharts:</strong>
                    <ul className="ml-4 text-xs list-disc list-inside space-y-0.5">
                        <li><code>ResponsiveContainer</code>: Allows charts to adapt to the size of their parent container.</li>
                        <li>Specific chart components (<code>LineChart</code>, <code>PieChart</code>, <code>AreaChart</code>) and their sub-components (<code>Line</code>, <code>Pie</code>, <code>Area</code>, <code>XAxis</code>, <code>YAxis</code>, <code>Tooltip</code>, <code>Legend</code>, <code>Cell</code>): Used declaratively to construct various data visualizations based on the processed log data.</li>
                    </ul>
                </li>
            </ul>
          </SubSection>

          <SectionTitle icon={ShareIcon} title="III. Operational Dataflow Matrix (System Flowchart)" />
            <ol className="space-y-1">
              <OrderedListItem step="1" title="Initiation: Video Upload & Model Priming">
                User uploads a video file (MP4, AVI, MOV, WebM) via the sidebar interface. 
                Simultaneously, on application load, the COCO-SSD model is fetched and initialized by TensorFlow.js, preparing the AI core for inference.
              </OrderedListItem>
              <OrderedListItem step="2" title="Configuration & Engagement">
                User adjusts detection parameters: Confidence Threshold (minimum score for a detection to be valid) and Frame Skip interval (process every Nth frame for performance tuning).
                User clicks "Engage Analysis" to start processing.
              </OrderedListItem>
              <OrderedListItem step="3" title="Video Playback & Frame Loop">
                The uploaded video begins playing in a hidden HTML5 <code>&lt;video&gt;</code> element.
                A <code>requestAnimationFrame</code> loop is initiated, synchronizing processing with the browser's rendering cycle.
              </OrderedListItem>
              <OrderedListItem step="4" title="Frame Capture & Preprocessing (Conditional)">
                Inside the loop, if not paused and video is active:
                The current frame from the <code>&lt;video&gt;</code> element is captured.
                If the current frame number modulo <code>frameSkip</code> is zero, it's selected for full processing. Otherwise, it's only drawn to the canvas.
              </OrderedListItem>
              <OrderedListItem step="5" title="AI Inference & Detection">
                 For frames selected for processing:
                 The frame is passed to <code>model.detect(videoFrame)</code>.
                 COCO-SSD performs inference, returning an array of <code>DetectedObject</code> (class, score, bbox).
              </OrderedListItem>
              <OrderedListItem step="6" title="Filtering & Augmentation">
                Detections are filtered:
                <ul className="list-[circle] list-inside ml-4 text-xs">
                    <li>By score against the user-set Confidence Threshold.</li>
                    <li>By class name against predefined lists (<code>VEHICLE_CLASS_NAMES</code>, etc.).</li>
                </ul>
                Valid detections' bounding boxes and labels (class, score) are drawn onto a visible <code>&lt;canvas&gt;</code> element, which mirrors the video frame.
              </OrderedListItem>
               <OrderedListItem step="7" title="Telemetry & Statistical Synthesis">
                 Counts for each category (Vehicles, Humans, Animals) are tallied.
                 Congestion level is derived from vehicle counts using <code>SIMULATION_CONFIG</code> thresholds.
                 Incidents are flagged if vehicle counts deviate significantly from a rolling average (<code>INCIDENT_WINDOW_SIZE</code>, <code>INCIDENT_DEVIATION_THRESHOLD</code>).
                 A new <code>LogEntry</code> is created (frame info, timestamp, object counts, congestion, incident status, relative video time).
               </OrderedListItem>
              <OrderedListItem step="8" title="State Update & Interface Synchronization">
                The new <code>LogEntry</code> is added to the <code>logData</code> state array.
                <code>currentFrameStats</code> state is updated for the live telemetry display.
                Dashboard charts (Line, Pie, etc.) consuming <code>logData</code> are re-rendered by Recharts.
              </OrderedListItem>
              <OrderedListItem step="9" title="Loop Continuation / Termination">
                The <code>requestAnimationFrame</code> loop continues to the next frame.
                If the video ends or processing is stopped, <code>calculateFinalStats</code> is triggered:
                <ul className="list-[circle] list-inside ml-4 text-xs">
                    <li>Averages, totals, and final distributions are calculated from <code>logData</code>.</li>
                    <li><code>summaryStats</code> and distribution states are updated.</li>
                    <li>"Detailed Reporting" section becomes fully populated.</li>
                </ul>
              </OrderedListItem>
               <OrderedListItem step="10" title="Data Archival (User Action)">
                User can click "Download Log" to save the complete <code>logData</code> array as a JSON file.
              </OrderedListItem>
            </ol>


          <SectionTitle icon={LightBulbIcon} title="IV. Project Singularity (Novelty)" />
            <ul className="list-disc list-inside space-y-1 text-sm text-content-secondary">
              <li><strong className={MODAL_PRIMARY_ACCENT}>On-Device Real-Time Processing:</strong> Core video analysis occurs entirely within the user's browser using TensorFlow.js, ensuring data privacy and eliminating server-side processing costs/latency for inference.</li>
              <li><strong className={MODAL_PRIMARY_ACCENT}>Multi-Categorical Analysis:</strong> Simultaneously detects and quantifies vehicles, humans, and animals, offering a broader environmental understanding.</li>
              <li><strong className={MODAL_PRIMARY_ACCENT}>Interactive Parameterization & Feedback:</strong> Users can dynamically adjust detection parameters (confidence, frame skip) and observe immediate impacts on the analysis.</li>
              <li><strong className={MODAL_PRIMARY_ACCENT}>Client-Side Efficiency & Accessibility:</strong> Demonstrates the power of modern web technologies to perform complex AI tasks directly on client hardware, making sophisticated analysis more accessible.</li>
              <li><strong className={MODAL_PRIMARY_ACCENT}>Educational & Demonstrative Value:</strong> Serves as a practical example of implementing an end-to-end AI application using cutting-edge JavaScript libraries and pre-trained models, highlighting possibilities for web-based AI.</li>
            </ul>

          <SectionTitle icon={CodeBracketIcon} title="V. Genesis Protocol (Source Code Access)" />
          <p className="text-sm text-content-secondary">
            The foundational logic and a Python-based precursor to this project, which inspired aspects of the processing pipeline, can be explored via the following neural link:
          </p>
          <a 
            href="https://colab.research.google.com/drive/1kP7daFJR9kir6ABn6OcRrjJ2JiWtY-wy#scrollTo=0zTRYsAptADb&line=499&uniqifier=1" 
            target="_blank" 
            rel="noopener noreferrer" 
            className={`block mt-2 text-accent-link hover:text-teal-400 underline truncate break-all p-2 bg-background-panel rounded-md border border-border-ui-default hover:border-${MODAL_PRIMARY_ACCENT.replace('text-','')} transition-colors text-xs`}
          >
            https://colab.research.google.com/drive/1kP7daFJR9kir6ABn6OcRrjJ2JiWtY-wy#scrollTo=0zTRYsAptADb&amp;line=499&amp;uniqifier=1
          </a>
          <p className="text-xs text-content-muted mt-1">Note: The linked Colab notebook is Python-based and illustrates server-side processing concepts. This web application adapts similar analytical goals for client-side execution with TensorFlow.js.</p>

          <SectionTitle icon={DocumentTextIcon} title="VI. Strategic Debrief (Overall Summary)" />
          <p className="text-sm text-content-secondary leading-relaxed">
            This dashboard effectively demonstrates a full-cycle, on-device AI workflow: from data ingestion (video upload) and model-driven inference (object detection) to real-time statistical analysis, dynamic visualization, and data archival. It showcases the capabilities of modern web platforms to handle computationally intensive tasks traditionally reserved for dedicated backend systems. The focus on client-side processing ensures user data privacy, reduces infrastructure dependency, and provides an interactive, responsive analytical experience.
          </p>
        </div>

        <footer className={`p-4 border-t border-border-ui-default bg-background-panel rounded-b-lg text-right`}>
            <button 
              onClick={onClose} 
              className={`py-2 px-5 bg-accent-blue hover:bg-blue-500 text-white font-semibold rounded-md transition-all duration-150 shadow-md hover:shadow-elevation-medium active:translate-y-px text-sm`}
            >
              DISMISS BRIEFING
            </button>
        </footer>
      </div>
    </div>
  );
};

export default ExplanationModal;
