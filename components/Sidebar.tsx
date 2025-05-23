
import React from 'react';
import { RocketIcon, DownloadIcon, EyeIcon, UploadIcon, CogIcon, InfoIcon, SpinnerIcon } from './Icons';

interface SidebarProps {
  confidence: number;
  setConfidence: (value: number) => void;
  iou: number;
  setIou: (value: number) => void;
  frameSkip: number;
  setFrameSkip: (value: number) => void;
  onStartProcessing: () => void;
  onDownloadLog: () => void;
  isProcessing: boolean;
  hasProcessed: boolean;
  setVideoFile: (file: File | null) => void;
  fileName: string | null;
  isModelLoading: boolean;
  onShowExplanation: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  confidence, setConfidence, iou, setIou, frameSkip, setFrameSkip,
  onStartProcessing, onDownloadLog, isProcessing, hasProcessed, setVideoFile, fileName,
  isModelLoading, onShowExplanation
}) => {
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setVideoFile(event.target.files[0]);
    } else {
      setVideoFile(null);
    }
  };

  const startButtonDisabled = isProcessing || !fileName || isModelLoading;
  const primaryAccent = 'accent-blue'; // Using accent-blue as the main interactive color from the new palette

  return (
    <div className={`w-80 bg-background-card text-content-primary p-5 space-y-6 fixed top-0 left-0 h-full shadow-elevation-medium overflow-y-auto scrollbar-thin scrollbar-thumb-${primaryAccent} scrollbar-track-background-card border-r border-border-ui-default`}>
      <div className="flex items-center space-x-3 pb-4 border-b border-border-ui-default">
        <CogIcon className={`w-8 h-8 text-${primaryAccent}`} />
        <h1 className="text-2xl font-semibold tracking-wider text-content-display">CONTROLS</h1>
      </div>

      {isModelLoading && (
        <div className={`flex items-center space-x-2 text-sm text-accent-orange bg-background-panel p-3 rounded-md shadow-sm border border-accent-orange/30`}>
          <SpinnerIcon className={`w-5 h-5 text-accent-orange`} />
          <span>AI Model Loading... Standby.</span>
        </div>
      )}

      {/* Video Upload Section */}
      <div className="space-y-3 pt-2">
        <label htmlFor="videoUpload" className={`flex items-center space-x-2 text-md font-medium mb-1 cursor-pointer hover:text-${primaryAccent} transition-colors`}>
          <UploadIcon className={`w-5 h-5 text-${primaryAccent}`}/> 
          <span>UPLOAD VIDEO FEED</span>
        </label>
        <input
          type="file"
          id="videoUpload"
          accept=".mp4,.avi,.mov,.webm"
          onChange={handleFileChange}
          disabled={isProcessing || isModelLoading}
          className={`block w-full text-sm text-content-secondary file:mr-3 file:py-2 file:px-3 file:rounded-md file:border file:border-${primaryAccent}/50 file:text-xs file:font-semibold file:bg-background-panel file:text-${primaryAccent} hover:file:bg-${primaryAccent} hover:file:text-background-primary transition-colors duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-${primaryAccent}`}
        />
        {fileName && <p className="text-xs mt-1 text-content-muted truncate" title={fileName}>TARGET: {fileName}</p>}
      </div>

      {/* Detection Parameters Section */}
      <div className="space-y-4 pt-4 border-t border-border-ui-default/50">
        <h3 className="text-sm font-semibold text-content-secondary uppercase tracking-widest">PARAMETERS</h3>
        <div>
          <label htmlFor="confidence" className="block text-sm font-medium mb-1">CONFIDENCE: {confidence.toFixed(2)}</label>
          <input
            type="range" id="confidence" min="0.1" max="0.9" step="0.05" value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            disabled={isProcessing || isModelLoading}
            className={`w-full h-2 bg-border-ui-default rounded-lg appearance-none cursor-pointer accent-${primaryAccent} focus:outline-none focus:ring-2 focus:ring-${primaryAccent}/70 disabled:opacity-50`}
          />
        </div>

        <div>
          <label htmlFor="iou" className="block text-sm font-medium mb-1">IOU (NMS): {iou.toFixed(2)}</label>
          <input
            type="range" id="iou" min="0" max="1" step="0.05" value={iou}
            onChange={(e) => setIou(parseFloat(e.target.value))}
            disabled={isProcessing || isModelLoading}
            className={`w-full h-2 bg-border-ui-default rounded-lg appearance-none cursor-pointer accent-${primaryAccent} focus:outline-none focus:ring-2 focus:ring-${primaryAccent}/70 disabled:opacity-50`}
          />
          <p className="flex items-center text-xs text-content-muted mt-1">
            <InfoIcon className="w-3 h-3 mr-1 flex-shrink-0 text-accent-teal" /> 
            COCO-SSD uses internal NMS.
          </p>
        </div>

        <div>
          <label htmlFor="frameSkip" className="block text-sm font-medium mb-1">FRAME SKIP: {frameSkip}</label>
          <input
            type="number" id="frameSkip" min="1" max="10" value={frameSkip}
            onChange={(e) => setFrameSkip(Math.max(1, parseInt(e.target.value)))}
            disabled={isProcessing || isModelLoading}
            className={`w-full p-2 bg-background-panel border border-border-ui-default rounded-md focus:ring-1 focus:ring-${primaryAccent} focus:border-${primaryAccent} text-sm placeholder-content-muted text-content-primary disabled:opacity-50`}
          />
        </div>
      </div>

      {/* Action Buttons Section */}
      <div className="space-y-3 pt-4 border-t border-border-ui-default/50">
        <button
          onClick={onStartProcessing}
          disabled={startButtonDisabled}
          className={`w-full flex items-center justify-center py-2.5 px-4 bg-${primaryAccent} hover:bg-blue-500 text-white font-semibold rounded-md disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all duration-150 shadow-md hover:shadow-elevation-medium active:translate-y-px`}
          aria-live="polite"
        >
          {isModelLoading ? <SpinnerIcon className="w-5 h-5 mr-2" /> : <RocketIcon className="w-5 h-5 mr-2" />}
          {isModelLoading ? 'MODEL INIT...' : isProcessing ? 'PROCESSING...' : 'ENGAGE ANALYSIS'}
        </button>

        {hasProcessed && (
           <button
            onClick={onDownloadLog}
            className="w-full flex items-center justify-center py-2.5 px-4 bg-accent-green hover:bg-emerald-400 text-white font-semibold rounded-md transition-all duration-150 shadow-md hover:shadow-elevation-medium active:translate-y-px"
          >
            <DownloadIcon className="w-5 h-5 mr-2" />
            DOWNLOAD LOG
          </button>
        )}
        
        <button
          onClick={onShowExplanation}
          className={`w-full flex items-center justify-center mt-2 py-2.5 px-4 bg-accent-teal hover:bg-teal-400 text-white font-semibold rounded-md transition-all duration-150 shadow-md hover:shadow-elevation-medium active:translate-y-px`}
        >
          <EyeIcon className="w-5 h-5 mr-2" />
          SYSTEM BRIEFING
        </button>
      </div>

      <div className="text-xs text-content-muted pt-4 border-t border-border-ui-default/50 mt-auto">
        <p className={`font-semibold mb-1 text-${primaryAccent}`}>TensorFlow.js // COCO-SSD</p>
        <p>On-device neural inference. Performance subject to local hardware capabilities.</p>
      </div>
    </div>
  );
};

export default Sidebar;
