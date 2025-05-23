import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from './components/Sidebar';
import { TrafficMultiLineChart, ObjectTypePieChart, StackedAreaChartComponent, CongestionIncidentTimeline } from './components/TrafficCharts';
import ExplanationModal from './components/ExplanationModal';
import { LogEntry, CongestionLevel, CurrentFrameStats, SummaryStats, ObjectTypeDistribution, ObjectCount, OverallDetectionDistribution } from './types';
import { VEHICLE_CLASS_NAMES, HUMAN_CLASS_NAMES, ANIMAL_CLASS_NAMES, SIMULATION_CONFIG } from './constants';
import { PlayIcon, PauseIcon, RestartIcon, UploadIcon, CarIcon, PersonIcon, AnimalIcon, RoadIcon, ExclamationTriangleIcon, SpinnerIcon, DownloadIcon as DownloadLogIcon, ViewfinderCircleIcon, UserGroupIcon, CubeTransparentIcon, ArrowTrendingUpIcon } from './components/Icons'; // Added more icons for telemetry
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import './App.css';
import { Button, Upload, message, Card, Typography, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import Metrics from './components/Metrics';
import type { UploadFile } from 'antd/es/upload/interface';

// Chart colors aligned with the new Tailwind theme
const CHART_COLORS_IMG_THEME = {
  Vehicles: '#3B82F6',    // chart-line-blue
  Humans: '#EF4444',      // accent-red (example for humans if they are an 'alert' or distinct category)
  Animals: '#F59E0B',     // accent-orange
  vehicleTypes: ['#3B82F6', '#2563EB', '#60A5FA', '#14B8A6', '#0D9488'], // Shades of blue/teal
};

interface Detection {
  bbox: [number, number, number, number];
  class: string;
  score: number;
}

interface AnalysisResult {
  video_path: string;
  total_frames: number;
  total_objects: number;
  class_counts: { [key: string]: number };
  tracking_data: Array<{
    track_id: number;
    class: string;
    first_seen: number;
    last_seen: number;
    centroid: [number, number];
  }>;
}

const App: React.FC = () => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0.5);
  const [iou, setIou] = useState(0.45);
  const [frameSkip, setFrameSkip] = useState(3);

  const [isProcessing, setIsProcessing] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);
  const [hasProcessed, setHasProcessed] = useState(false);
  const [logData, setLogData] = useState<LogEntry[]>([]);
  const [currentFrameStats, setCurrentFrameStats] = useState<CurrentFrameStats>({
    vehicleCount: 0, humanCount: 0, animalCount: 0,
    congestion: CongestionLevel.Low, incident: false, frameNumber: 0,
  });
  const [summaryStats, setSummaryStats] = useState<SummaryStats>({
    averageVehicleCount: 0, averageHumanCount: 0, averageAnimalCount: 0,
    totalIncidents: 0, finalCongestionLevel: CongestionLevel.Low,
  });
  
  const [vehicleTypeDistribution, setVehicleTypeDistribution] = useState<ObjectTypeDistribution[]>([]);
  const [overallDetectionDistribution, setOverallDetectionDistribution] = useState<OverallDetectionDistribution[]>([]);
  
  const [recentVehicleCounts, setRecentVehicleCounts] = useState<number[]>([]);
  const [processedFrameCounter, setProcessedFrameCounter] = useState(0);
  const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
  const [modelLoading, setModelLoading] = useState(true);
  const [showExplanationModal, setShowExplanationModal] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  useEffect(() => {
    const loadModel = async () => {
      try {
        setModelLoading(true);
        await tf.ready();
        const loadedModel = await cocoSsd.load();
        setModel(loadedModel);
        console.log("COCO-SSD Model loaded successfully");
      } catch (error) {
        console.error("Failed to load COCO-SSD model:", error);
      } finally {
        setModelLoading(false);
      }
    };
    loadModel();
  }, []);

  const resetStateForNewProcessing = useCallback(() => {
    setLogData([]);
    setCurrentFrameStats({ vehicleCount: 0, humanCount: 0, animalCount: 0, congestion: CongestionLevel.Low, incident: false, frameNumber: 0 });
    setSummaryStats({ averageVehicleCount: 0, averageHumanCount: 0, averageAnimalCount: 0, totalIncidents: 0, finalCongestionLevel: CongestionLevel.Low });
    setVehicleTypeDistribution([]);
    setOverallDetectionDistribution([]);
    setRecentVehicleCounts([]);
    setProcessedFrameCounter(0);
    setHasProcessed(false);
    setIsVideoPaused(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.pause();
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, []);

  useEffect(() => {
    if (videoFile) {
      setFileName(videoFile.name);
      resetStateForNewProcessing();
      if (videoRef.current) {
        videoRef.current.src = URL.createObjectURL(videoFile);
        videoRef.current.onloadedmetadata = () => {
          if (videoRef.current && canvasRef.current) {
            canvasRef.current.width = videoRef.current.videoWidth;
            canvasRef.current.height = videoRef.current.videoHeight;
            const ctx = canvasRef.current.getContext('2d');
            if(ctx) ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        };
      }
    } else {
      setFileName(null);
      if (videoRef.current) videoRef.current.src = "";
    }
  }, [videoFile, resetStateForNewProcessing]);

  const calculateFinalStats = useCallback(() => {
    if (logData.length === 0 && !isProcessing) return;

    const totalVehicles = logData.reduce((sum, entry) => sum + entry.vehicles.total, 0);
    const totalHumans = logData.reduce((sum, entry) => sum + entry.humans.total, 0);
    const totalAnimals = logData.reduce((sum, entry) => sum + entry.animals.total, 0);

    const avgVehicles = logData.length > 0 ? totalVehicles / logData.length : 0;
    const avgHumans = logData.length > 0 ? totalHumans / logData.length : 0;
    const avgAnimals = logData.length > 0 ? totalAnimals / logData.length : 0;

    const totalIncidents = logData.filter(entry => entry.incident).length;
    const finalCongestion = logData.length > 0 ? logData[logData.length - 1].congestion : CongestionLevel.Low;
    
    setSummaryStats({
      averageVehicleCount: parseFloat(avgVehicles.toFixed(2)),
      averageHumanCount: parseFloat(avgHumans.toFixed(2)),
      averageAnimalCount: parseFloat(avgAnimals.toFixed(2)),
      totalIncidents: totalIncidents,
      finalCongestionLevel: finalCongestion,
    });

    const vehicleDist: { [key: string]: number } = {};
    logData.forEach(entry => Object.entries(entry.vehicles.types).forEach(([type, count]) => vehicleDist[type] = (vehicleDist[type] || 0) + count));
    setVehicleTypeDistribution(Object.entries(vehicleDist).map(([name, value]) => ({ name, value })));

    setOverallDetectionDistribution([
        { name: 'Vehicles', value: totalVehicles },
        { name: 'Humans', value: totalHumans },
        { name: 'Animals', value: totalAnimals }
    ]);

    setHasProcessed(true);
    setIsProcessing(false);
    setIsVideoPaused(false);
  }, [logData, isProcessing]);

  const drawDetections = useCallback((predictions: cocoSsd.DetectedObject[]) => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
    ctx.font = "bold 10px Inter, sans-serif"; 

    predictions.forEach(prediction => {
      let borderColor = '#64748B'; // content-muted
      let textColor = '#0A0F1E'; // background-primary (for text on light backgrounds)
      let objectCategory = '';
      let labelBgColor = 'rgba(100, 116, 139, 0.7)'; // content-muted with opacity

      if (VEHICLE_CLASS_NAMES.includes(prediction.class) && prediction.score >= confidence) {
        borderColor = CHART_COLORS_IMG_THEME.Vehicles; 
        labelBgColor = `${CHART_COLORS_IMG_THEME.Vehicles}B3`; 
        textColor = '#FFFFFF'; objectCategory = 'V: ';
      } else if (HUMAN_CLASS_NAMES.includes(prediction.class) && prediction.score >= confidence) {
        borderColor = CHART_COLORS_IMG_THEME.Humans; 
        labelBgColor = `${CHART_COLORS_IMG_THEME.Humans}B3`;
        textColor = '#FFFFFF'; objectCategory = 'H: '; 
      } else if (ANIMAL_CLASS_NAMES.includes(prediction.class) && prediction.score >= confidence) {
        borderColor = CHART_COLORS_IMG_THEME.Animals;
        labelBgColor = `${CHART_COLORS_IMG_THEME.Animals}B3`;
        textColor = '#FFFFFF'; objectCategory = 'A: '; // Text color on orange can be white
      } else return; 

      const [x, y, width, height] = prediction.bbox;
      
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 1.5; 
      ctx.strokeRect(x, y, width, height);
      
      const text = `${objectCategory}${prediction.class} (${Math.round(prediction.score * 100)}%)`;
      const textMetrics = ctx.measureText(text);
      const textBgPadding = 3;
      const textHeight = 12; // Adjusted for 10px font
      
      ctx.fillStyle = labelBgColor;
      ctx.fillRect(x, y - textHeight - textBgPadding, textMetrics.width + textBgPadding * 2, textHeight + textBgPadding);
      
      ctx.fillStyle = textColor;
      ctx.fillText(text, x + textBgPadding, y - textBgPadding);
    });
  }, [confidence, HUMAN_CLASS_NAMES, ANIMAL_CLASS_NAMES, VEHICLE_CLASS_NAMES]);

  const processVideoFrame = useCallback(async () => {
    if (!isProcessing || !model || !videoRef.current || videoRef.current.paused || videoRef.current.ended || isVideoPaused) {
      if (isProcessing && videoRef.current && videoRef.current.ended) {
        calculateFinalStats();
      }
      if(isProcessing && !isVideoPaused && videoRef.current && !videoRef.current.ended) {
         animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
      }
      return;
    }
    
    const currentVideoTime = videoRef.current.currentTime;
    setProcessedFrameCounter(prev => prev + 1);

    if (processedFrameCounter % frameSkip === 0) {
      const predictions = await model.detect(videoRef.current);
      drawDetections(predictions);

      const detectedVehicles = predictions.filter(p => VEHICLE_CLASS_NAMES.includes(p.class) && p.score >= confidence);
      const detectedHumans = predictions.filter(p => HUMAN_CLASS_NAMES.includes(p.class) && p.score >= confidence);
      const detectedAnimals = predictions.filter(p => ANIMAL_CLASS_NAMES.includes(p.class) && p.score >= confidence);

      const createObjectCount = (preds: cocoSsd.DetectedObject[]): ObjectCount => {
        const types: { [key: string]: number } = {};
        preds.forEach(p => types[p.class] = (types[p.class] || 0) + 1);
        return { total: preds.length, types };
      };

      const vehicleCountsData = createObjectCount(detectedVehicles);
      const humanCountsData = createObjectCount(detectedHumans);
      const animalCountsData = createObjectCount(detectedAnimals);
      
      const numVehicles = vehicleCountsData.total;
      const updatedRecentCounts = [...recentVehicleCounts, numVehicles]; 
      if (updatedRecentCounts.length > SIMULATION_CONFIG.INCIDENT_WINDOW_SIZE) updatedRecentCounts.shift();
      setRecentVehicleCounts(updatedRecentCounts);
      
      let congestionLevel = CongestionLevel.Low;
      if (numVehicles > SIMULATION_CONFIG.CONGESTION_THRESHOLD_HIGH) congestionLevel = CongestionLevel.High;
      else if (numVehicles > SIMULATION_CONFIG.CONGESTION_THRESHOLD_MEDIUM) congestionLevel = CongestionLevel.Medium;

      let incidentDetected = false;
      if (updatedRecentCounts.length === SIMULATION_CONFIG.INCIDENT_WINDOW_SIZE) {
        const windowSum = updatedRecentCounts.slice(0, -1).reduce((sum, count) => sum + count, 0);
        const windowAvg = (SIMULATION_CONFIG.INCIDENT_WINDOW_SIZE -1 > 0) ? windowSum / (SIMULATION_CONFIG.INCIDENT_WINDOW_SIZE -1) : numVehicles;
        if (Math.abs(numVehicles - windowAvg) >= SIMULATION_CONFIG.INCIDENT_DEVIATION_THRESHOLD && (SIMULATION_CONFIG.INCIDENT_WINDOW_SIZE -1 > 0)) {
          incidentDetected = true;
        }
      }
      
      const newLogEntry: LogEntry = {
        frame: Math.floor(currentVideoTime * (videoRef.current.playbackRate || 1) * 30), 
        timestamp: Date.now(),
        vehicles: vehicleCountsData,
        humans: humanCountsData,
        animals: animalCountsData,
        congestion: congestionLevel,
        incident: incidentDetected,
        relativeTime: currentVideoTime,
      };
      setLogData(prev => [...prev, newLogEntry]);
      setCurrentFrameStats({
        vehicleCount: numVehicles, humanCount: humanCountsData.total, animalCount: animalCountsData.total,
        congestion: congestionLevel, incident: incidentDetected, frameNumber: newLogEntry.frame,
      });
    } else {
        if (canvasRef.current && videoRef.current) { 
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
    }
    animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
  }, [isProcessing, model, frameSkip, processedFrameCounter, confidence, recentVehicleCounts, drawDetections, calculateFinalStats, isVideoPaused, HUMAN_CLASS_NAMES, ANIMAL_CLASS_NAMES, VEHICLE_CLASS_NAMES]);

  useEffect(() => {
    if (isProcessing && !isVideoPaused && videoRef.current && !videoRef.current.ended) {
      animationFrameIdRef.current = requestAnimationFrame(processVideoFrame);
    } else {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
      if (isProcessing && videoRef.current && videoRef.current.ended) { 
        calculateFinalStats();
      }
    }
    return () => {
      if (animationFrameIdRef.current) cancelAnimationFrame(animationFrameIdRef.current);
    };
  }, [isProcessing, isVideoPaused, processVideoFrame, calculateFinalStats]);
  
  const handleStartProcessing = useCallback(() => {
    if (!videoFile) { alert("Awaiting video feed. Please upload."); return; }
    if (modelLoading) { alert("Cognitive matrix still loading. Please standby."); return; }
    if (!model) { alert("AI core offline. Cannot initiate analysis."); return; }
    
    if (hasProcessed) {
      resetStateForNewProcessing(); 
      setTimeout(() => {
        setIsProcessing(true);
        setIsVideoPaused(false);
        videoRef.current?.play().catch(e => console.error("Video playback malfunction:", e));
      }, 100);
    } else {
      setIsProcessing(true);
      setIsVideoPaused(false);
      videoRef.current?.play().catch(e => console.error("Video playback malfunction:", e));
    }
  }, [videoFile, modelLoading, model, resetStateForNewProcessing, hasProcessed]);

  const handleDownloadLog = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(logData, null, 2))}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `traffic_analysis_log_${fileName?.split('.')[0].replace(/[^a-z0-9]/gi, '_') || 'data'}.json`;
    link.click();
  };
  
  const handleVideoPlay = () => {
    if (videoRef.current && videoFile) {
      videoRef.current.play();
      setIsVideoPaused(false);
    }
  };
  const handleVideoPause = () => {
    videoRef.current?.pause();
    setIsVideoPaused(true);
  };
  const handleVideoRestart = () => {
    if(videoRef.current && videoFile) {
        resetStateForNewProcessing(); 
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            videoRef.current.onseeked = () => { 
                if(ctx && videoRef.current && videoRef.current.videoWidth > 0) {
                     canvasRef.current.width = videoRef.current.videoWidth;
                     canvasRef.current.height = videoRef.current.videoHeight;
                     ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
                }
                videoRef.current.onseeked = null; 
            }
            videoRef.current.currentTime = 0;
        } else {
            videoRef.current.currentTime = 0;
        }
    }
  };

  useEffect(() => {
    const videoElement = videoRef.current;
    const handleVideoEnd = () => { 
      if(isProcessing) {
        calculateFinalStats(); 
      }
    };
    videoElement?.addEventListener('ended', handleVideoEnd);
    return () => videoElement?.removeEventListener('ended', handleVideoEnd);
  }, [isProcessing, calculateFinalStats]);

  const CongestionBadge: React.FC<{level: CongestionLevel}> = ({level}) => {
    let bgColor = 'bg-accent-green/20 text-accent-green'; // Low
    let borderColor = 'border-accent-green/50';
    if (level === CongestionLevel.Medium) {
        bgColor = 'bg-accent-orange/20 text-accent-orange';
        borderColor = 'border-accent-orange/50';
    } else if (level === CongestionLevel.High) {
        bgColor = 'bg-accent-red/20 text-accent-red';
        borderColor = 'border-accent-red/50';
    }
    return <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${bgColor} ${borderColor} shadow-sm`}>{level.toUpperCase()}</span>;
  };

  const IncidentBadge: React.FC<{detected: boolean}> = ({detected}) => {
    const bgColor = detected ? 'bg-accent-red/20 text-accent-red' : 'bg-accent-green/20 text-accent-green'; 
    const borderColor = detected ? 'border-accent-red/50' : 'border-accent-green/50';
    const Icon = detected ? ExclamationTriangleIcon : RoadIcon; // RoadIcon might be too complex, Checkmark?
    const textColor = detected ? 'text-accent-red' : 'text-accent-green';
    return <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${bgColor} ${borderColor} shadow-sm`}>
      <Icon className={`w-3 h-3 mr-1 ${textColor}`}/>
      {detected ? 'ALERT' : 'NOMINAL'}
    </span>;
  };

  // Telemetry card component matching the image style
  interface TelemetryCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    bgColorClass: string; // e.g., 'bg-accent-blue'
  }
  const TelemetryCard: React.FC<TelemetryCardProps> = ({ title, value, icon, bgColorClass }) => (
    <div className="bg-background-card p-4 rounded-lg shadow-elevation-medium flex items-center space-x-4 border border-border-ui-default">
      <div className={`p-3 rounded-lg ${bgColorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-content-display">{value}</p>
        <p className="text-sm text-content-secondary">{title}</p>
      </div>
    </div>
  );

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const result = await response.json();
      setAnalysisResult(result);
    } catch (err) {
      setError('Failed to analyze video');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const renderAnalysisResults = () => {
    if (!analysisResult) return null;

    const chartData = Object.entries(analysisResult.class_counts).map(([name, count]) => ({
      name,
      count,
    }));

    return (
      <div className="analysis-results">
        <h2>Analysis Results</h2>
        <div className="stats">
          <p>Total Frames: {analysisResult.total_frames}</p>
          <p>Total Objects: {analysisResult.total_objects}</p>
        </div>
        <div className="chart">
          <LineChart width={600} height={300} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </div>
      </div>
    );
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Real-Time Traffic Monitoring</h1>
      </header>
      
      <main className="app-main">
        <Metrics />
        
        <Card title="Video Upload" style={{ marginBottom: '20px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Upload
              accept="video/*"
              beforeUpload={handleFileUpload}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>Upload Video</Button>
            </Upload>
            {videoFile && (
              <Typography.Text>
                Selected file: {videoFile.name}
              </Typography.Text>
            )}
          </Space>
        </Card>

        {modelLoading && <div className="mb-4 flex items-center text-accent-orange text-sm p-2.5 bg-background-card border border-accent-orange/50 rounded-md shadow-elevation-low"><SpinnerIcon className="w-4 h-4 mr-2"/>AI CORE INITIALIZING...</div>}
        {!model && !modelLoading && <div className="mb-4 text-accent-red text-sm p-2.5 bg-background-card border border-accent-red/50 rounded-md shadow-elevation-low">CRITICAL ERROR: AI CORE OFFLINE.</div>}

        {/* Telemetry Cards - mimicking the image's top row */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          <TelemetryCard title="Vehicles Detected" value={currentFrameStats.vehicleCount} icon={<CarIcon className="w-6 h-6 text-white"/>} bgColorClass="bg-accent-blue" />
          <TelemetryCard title="Pedestrians" value={currentFrameStats.humanCount} icon={<UserGroupIcon className="w-6 h-6 text-white"/>} bgColorClass="bg-accent-red" /> {/* Example mapping, green in image */}
          <TelemetryCard title="Fauna Count" value={currentFrameStats.animalCount} icon={<CubeTransparentIcon className="w-6 h-6 text-white"/>} bgColorClass="bg-accent-orange" /> {/* Example mapping */}
          <TelemetryCard title="Anomaly Status" value={currentFrameStats.incident ? "ALERT" : "NOMINAL"} icon={<ExclamationTriangleIcon className="w-6 h-6 text-white"/>} bgColorClass={currentFrameStats.incident ? "bg-accent-red" : "bg-accent-green"} />
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-8">
          <div className="lg:col-span-3 bg-black/50 p-1 rounded-lg shadow-elevation-high border border-border-ui-default flex flex-col items-center justify-center relative min-h-[300px] aspect-video">
            <video ref={videoRef} className="hidden" playsInline muted />
            <canvas ref={canvasRef} className="w-full h-full object-contain rounded-md bg-black" />
            
            {!videoFile && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-content-muted bg-black/70 rounded-md p-4 border-2 border-dashed border-border-ui-default/50">
                <UploadIcon className="w-16 h-16 mb-4 text-border-ui-default"/>
                <p className="text-lg font-medium text-content-secondary">Awaiting Video Feed...</p>
                <p className="text-sm">Supported: .mp4, .avi, .mov, .webm</p>
              </div>
            )}
            {videoFile && !isProcessing && !hasProcessed && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 text-accent-link bg-black/60 px-3 py-1.5 rounded-md text-xs tracking-wider shadow-md">
                    SYSTEM READY. INITIATE ANALYSIS.
                </div>
            )}
            
             <div className="w-full p-2 mt-0 flex justify-center space-x-2 bg-black/40 backdrop-blur-sm rounded-b-md absolute bottom-0 left-0 border-t border-border-ui-default/30">
                <button onClick={handleVideoPlay} disabled={!videoFile || (isProcessing && !isVideoPaused)} className="flex items-center px-3 py-1.5 text-xs bg-accent-green hover:bg-emerald-400 text-white font-semibold rounded-md disabled:bg-gray-600 disabled:text-gray-400 transition-colors shadow-sm hover:shadow-elevation-medium active:translate-y-px">
                    <PlayIcon className="w-3.5 h-3.5 mr-1.5"/> PLAY
                </button>
                <button onClick={handleVideoPause} disabled={!videoFile || (!isProcessing && !hasProcessed) || isVideoPaused} className="flex items-center px-3 py-1.5 text-xs bg-accent-orange hover:bg-amber-400 text-background-primary font-semibold rounded-md disabled:bg-gray-600 disabled:text-gray-400 transition-colors shadow-sm hover:shadow-elevation-medium active:translate-y-px">
                    <PauseIcon className="w-3.5 h-3.5 mr-1.5"/> PAUSE
                </button>
                <button onClick={handleVideoRestart} disabled={!videoFile} className="flex items-center px-3 py-1.5 text-xs bg-accent-blue hover:bg-blue-400 text-white font-semibold rounded-md disabled:bg-gray-600 disabled:text-gray-400 transition-colors shadow-sm hover:shadow-elevation-medium active:translate-y-px">
                    <RestartIcon className="w-3.5 h-3.5 mr-1.5"/> RESET
                </button>
            </div>
          </div>
          
          <div className="lg:col-span-2 bg-background-card p-5 rounded-lg shadow-elevation-high border border-border-ui-default flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-center mb-4 pb-2 border-b border-border-ui-default">
                    <h3 className="text-lg font-semibold text-content-display tracking-wider">LIVE STATISTICS</h3>
                    <div className={`text-xs px-2 py-1 bg-background-panel text-accent-link font-medium rounded-md border border-accent-link/50`}> 
                        F#: {currentFrameStats.frameNumber}
                    </div>
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between p-2.5 bg-background-panel rounded-md border border-border-ui-default/70">
                    <span className="flex items-center text-content-secondary"><ViewfinderCircleIcon className="w-4 h-4 mr-2 text-accent-blue"/>Vehicles:</span>
                    <strong className="text-content-display text-base">{currentFrameStats.vehicleCount}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-background-panel rounded-md border border-border-ui-default/70">
                    <span className="flex items-center text-content-secondary"><UserGroupIcon className="w-4 h-4 mr-2 text-accent-red"/>Pedestrians:</span> 
                    <strong className="text-content-display text-base">{currentFrameStats.humanCount}</strong>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-background-panel rounded-md border border-border-ui-default/70">
                    <span className="flex items-center text-content-secondary"><CubeTransparentIcon className="w-4 h-4 mr-2 text-accent-orange"/>Fauna:</span>
                    <strong className="text-content-display text-base">{currentFrameStats.animalCount}</strong>
                  </div>
                  <div className="pt-2.5 mt-2.5 border-t border-border-ui-default"></div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-content-secondary"><ArrowTrendingUpIcon className="w-4 h-4 mr-2 text-content-muted"/>Density:</span>
                    <CongestionBadge level={currentFrameStats.congestion} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-content-secondary"><ExclamationTriangleIcon className="w-4 h-4 mr-2 text-content-muted"/>Anomaly:</span>
                    <IncidentBadge detected={currentFrameStats.incident} />
                  </div>
                </div>
            </div>
             {hasProcessed && (
                <div className="mt-4 pt-3 border-t border-border-ui-default">
                    <h3 className="text-sm font-semibold mb-1.5 text-content-display tracking-wider">ANALYSIS COMPLETE</h3>
                    <div className="text-xs space-y-1 text-content-secondary">
                        <p>Avg Vehicles: <strong className="text-content-primary">{summaryStats.averageVehicleCount}</strong></p>
                        <p>Total Anomalies: <strong className="text-content-primary">{summaryStats.totalIncidents}</strong></p>
                        <p>Final Density: <CongestionBadge level={summaryStats.finalCongestionLevel} /></p>
                    </div>
                </div>
            )}
          </div>
        </section>
        
        <section className="mb-8">
          <TrafficMultiLineChart data={logData} title="Detection Overview" /> {/* Title from image */}
        </section>

        {hasProcessed && (
          <section className="mt-10 pt-6 border-t-2 border-accent-blue/30">
            <h2 className="text-2xl lg:text-3xl font-bold mb-6 text-content-display tracking-wider">DETAILED REPORTING</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <StackedAreaChartComponent data={logData} title="Object Composition" />
              <CongestionIncidentTimeline data={logData} title="Density & Anomaly Events" />
              <ObjectTypePieChart data={vehicleTypeDistribution} title="Vehicular Distribution" colors={CHART_COLORS_IMG_THEME.vehicleTypes} />
              <ObjectTypePieChart data={overallDetectionDistribution} title="Overall Categorization" colors={{'Vehicles': CHART_COLORS_IMG_THEME.Vehicles, 'Humans': CHART_COLORS_IMG_THEME.Humans, 'Animals': CHART_COLORS_IMG_THEME.Animals}}/>
            </div>
            <div className="bg-background-card p-5 rounded-lg shadow-elevation-medium border border-border-ui-default overflow-x-auto mb-6">
                <h3 className="text-base font-semibold mb-3 text-content-display tracking-wider">DATA LOG PREVIEW (HEAD/TAIL: {SIMULATION_CONFIG.LOG_PREVIEW_COUNT})</h3>
                {logData.length > 0 ? (
                  <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border-ui-default scrollbar-track-background-card">
                    <table className="min-w-full text-xs table-fixed">
                        <thead className="bg-background-panel">
                        <tr>
                            {['F#', 'T(s)', 'Veh', 'Ped', 'Fau', 'Density', 'Anomaly'].map(header => (
                            <th key={header} className="px-3 py-2 text-left font-medium text-content-secondary uppercase tracking-wider">{header}</th>
                            ))}
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-border-ui-default">
                        {logData.slice(0, SIMULATION_CONFIG.LOG_PREVIEW_COUNT).map(e => (<tr key={`f-${e.frame}-${e.timestamp}`} className="hover:bg-background-panel transition-colors"><td className="px-3 py-2 whitespace-nowrap">{e.frame}</td><td className="px-3 py-2 whitespace-nowrap">{e.relativeTime.toFixed(1)}</td><td className="px-3 py-2 whitespace-nowrap">{e.vehicles.total}</td><td className="px-3 py-2 whitespace-nowrap">{e.humans.total}</td><td className="px-3 py-2 whitespace-nowrap">{e.animals.total}</td><td className="px-3 py-2 whitespace-nowrap"><CongestionBadge level={e.congestion}/></td><td className="px-3 py-2 whitespace-nowrap"><IncidentBadge detected={e.incident}/></td></tr>))}
                        {logData.length > SIMULATION_CONFIG.LOG_PREVIEW_COUNT * 2 && (<tr><td colSpan={7} className="text-center py-2 text-content-muted italic tracking-widest">... ({logData.length - SIMULATION_CONFIG.LOG_PREVIEW_COUNT*2} more entries) ...</td></tr>)}
                        {logData.slice(Math.max(SIMULATION_CONFIG.LOG_PREVIEW_COUNT, logData.length - SIMULATION_CONFIG.LOG_PREVIEW_COUNT)).map((e) => (<tr key={`l-${e.frame}-${e.timestamp}`} className="hover:bg-background-panel transition-colors"><td className="px-3 py-2 whitespace-nowrap">{e.frame}</td><td className="px-3 py-2 whitespace-nowrap">{e.relativeTime.toFixed(1)}</td><td className="px-3 py-2 whitespace-nowrap">{e.vehicles.total}</td><td className="px-3 py-2 whitespace-nowrap">{e.humans.total}</td><td className="px-3 py-2 whitespace-nowrap">{e.animals.total}</td><td className="px-3 py-2 whitespace-nowrap"><CongestionBadge level={e.congestion}/></td><td className="px-3 py-2 whitespace-nowrap"><IncidentBadge detected={e.incident}/></td></tr> ))}
                        </tbody>
                    </table>
                  </div>
                ) : <p className="text-content-muted p-4 text-center">No log data available for preview.</p>}
              </div>
            <button onClick={handleDownloadLog} className="mt-4 py-2.5 px-6 bg-accent-green hover:bg-emerald-400 text-white font-semibold rounded-md transition-colors shadow-md hover:shadow-elevation-medium active:translate-y-px flex items-center">
                <DownloadLogIcon className="w-5 h-5 mr-2"/>
                EXTRACT FULL DATA LOG
            </button>
          </section>
        )}
        <footer className="text-center text-xs text-content-muted py-8 mt-10 border-t border-border-ui-default/70">
            TRAFFIC ANALYSIS SYSTEM v3.0 // &copy; {new Date().getFullYear()} // TF.js CORE
        </footer>
      </main>
      {showExplanationModal && <ExplanationModal onClose={() => setShowExplanationModal(false)} />}
      {renderAnalysisResults()}
    </div>
  );
};

export default App;
