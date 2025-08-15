import { useState, useEffect } from 'react';
import { Upload, Camera, CheckCircle, AlertCircle, ArrowRight, Monitor, Settings} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/App';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL;

interface ScanResult {
  plate: string;
  confidence: number;
  parkingId: string;
  timeIn: string;
  blockId: string;
}

export default function LicensePlateScanner() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [showDemo, setShowDemo] = useState(true);

  // Demo images for first-time users
  const demoImages = [
    { src: '/demo-images/1.jpg', alt: 'Demo License Plate 1', plate: 'DEMO-001' },
    { src: '/demo-images/2.jpeg', alt: 'Demo License Plate 2', plate: 'DEMO-002' },
  ];

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processImage = async (file: File) => {
    setIsLoading(true);
    setError(null);
    setScanResult(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      // const response = await fetch('https://parkease-21u2.onrender.com/api/scan-license-plate', {
      // const response = await fetch('http://localhost:8080/api/scan-license-plate', {
      const response = await fetch(`${API_BASE}/scan-license-plate`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process image');
      }

      const data = await response.json();
      
      if (data.success) {
        setScanResult(data.data);
        // Refresh recent scans
        fetchRecentScans();
      } else {
        setError(data.message || 'No license plate detected');
      }
    } catch (err: any) {
      setError(err.message || 'Error processing image');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentScans = async () => {
    try {
      // const response = await fetch('http://localhost:8080/api/scan-license-plate');
      // const response = await fetch('https://parkease-21u2.onrender.com/api/scan-license-plate');
      const response = await fetch(`${API_BASE}/scan-license-plate`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setRecentScans(data.data);
        }
      }
    } catch (error) {
      console.error('Error fetching recent scans:', error);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploadedImage(URL.createObjectURL(file));
    await processImage(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleImageUpload(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setUploadedImage(null);
    setScanResult(null);
    setError(null);
  };

  const handleDemoImageClick = (demoImage: typeof demoImages[0]) => {
    setShowDemo(false);
    setUploadedImage(demoImage.src);
    // Simulate a successful scan for demo purposes
    setScanResult({
      plate: demoImage.plate,
      confidence: 0.95,
      parkingId: 'demo-' + Date.now(),
      timeIn: new Date().toLocaleTimeString(),
      blockId: '0x' + Math.random().toString(16).slice(2, 10)
    });
    // Show a brief success message
    setTimeout(() => {
      setError(null);
    }, 100);
  };

  const goToDashboard = () => {
    navigate('/');
  };

  // Load recent scans on component mount
  useEffect(() => {
    fetchRecentScans();
  }, []);

  return (
    <div className="h-screen w-full overflow-hidden p-4 bg-background">
      <div className="container mx-auto p-0 h-full flex flex-col gap-3">
        {/* Header */}
        <div className="text-center flex-none">
          <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-black'}`}>License Plate Scanner</h1>
          <p className={`${isDark ? 'text-white' : 'text-black'}`}>Upload an image to automatically detect and register license plates</p>
        </div>

        <div className="grid grid-cols-7 gap-4 flex-1 min-h-0 items-stretch">
          {/* Left Side - Scan Section (70%) */}
          <div className="col-span-5 h-full min-h-0">
            {/* Upload Section */}
            <Card className="flex flex-col h-full">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Camera className="h-5 w-5" />
                  Scan License Plate
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div
                  className={`relative flex h-[400px] w-full items-center justify-center rounded-lg border-2 border-dashed ${
                    dragActive 
                      ? (isDark ? 'border-white bg-black/20' : 'border-black bg-gray-50')
                      : (isDark ? 'border-[#333]' : 'border-[#e5e5e5]')
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {uploadedImage ? (
                    <div className="relative w-full h-full">
                      <img
                        src={uploadedImage}
                        alt="Uploaded license plate"
                        className="h-full w-full object-cover rounded-lg blur-sm"
                      />

                      {/* Processing overlay centered */}
                      {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="bg-white/95 dark:bg-black/90 border ${isDark ? 'border-[#333]' : 'border-[#e5e5e5]'} rounded-xl px-6 py-4 shadow-2xl flex items-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-black dark:border-white border-t-transparent" style={{animation: 'spinner-spin 1s linear infinite'}}></div>
                            <p className="text-sm font-medium ${isDark ? 'text-white' : 'text-black'}">Processing image...</p>
                          </div>
                        </div>
                      )}

                      {/* Detected badge using dashboard palette */}
                      {scanResult && !isLoading && (
                        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs flex items-center gap-1 shadow ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>
                          <CheckCircle className="h-3 w-3" />
                          Detected
                        </div>
                      )}

                      {/* Fixed-size results overlay using shadcn card */}
                      {scanResult && !isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center p-4">
                          <Card className={`rounded-2xl shadow-2xl border ${isDark ? 'bg-black border-[#333]' : 'bg-white border-[#e5e5e5]'} w-[520px] max-w-[90%] min-h-[240px]`}>
                            <CardHeader className="pb-2">
                              <CardTitle className={`text-center text-lg ${isDark ? 'text-white' : 'text-black'}`}>License Plate Detected</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                              <div className="space-y-3 text-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Plate Number</span>
                                  <span className={`font-mono font-bold text-xl px-3 py-1 rounded ${isDark ? 'bg-[#333] text-white' : 'bg-[#e5e5e5] text-black'}`}>{scanResult.plate}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Confidence</span>
                                  <span className={`font-semibold px-3 py-1 rounded ${isDark ? 'bg-[#333] text-white' : 'bg-[#e5e5e5] text-black'}`}>{(scanResult.confidence * 100).toFixed(1)}%</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Time In</span>
                                  <span className={`font-semibold px-3 py-1 rounded ${isDark ? 'bg-[#333] text-white' : 'bg-[#e5e5e5] text-black'}`}>{scanResult.timeIn}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Block ID</span>
                                  <span className={`font-mono text-xs px-3 py-1 rounded ${isDark ? 'bg-[#333] text-white' : 'bg-[#e5e5e5] text-black'}`}>{scanResult.blockId}</span>
                                </div>
                              </div>
                              <div className="flex gap-2 pt-2">
                                <Button
                                  onClick={resetForm}
                                  variant="outline"
                                  className={`${isDark ? 'bg-black text-white border-[#333]' : 'bg-white text-black border-[#e5e5e5]'} hover:opacity-90 flex-1`}
                                >
                                  Scan Another Image
                                </Button>
                                <Button
                                  onClick={goToDashboard}
                                  className={`${isDark ? 'bg-white text-black' : 'bg-black text-white'} hover:opacity-90 flex-1`}
                                >
                                  <Monitor className="h-4 w-4 mr-2" />
                                  Dashboard
                                  <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Upload className={`mb-4 h-12 w-12 ${isDark ? 'text-white/60' : 'text-black/60'}`} />
                      <p className="text-sm text-center text-muted-foreground mb-2">
                      &nbsp;&nbsp;Drag and drop license plate image or click to upload
                      </p>
                      <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileInput} accept="image/*" />
                    </>
                  )}
                </div>

                {/* Remove bottom processing block; keep errors below for clarity */}
                {error && (
                  <div className="mt-3 text-center">
                    <div className={`inline-flex items-center gap-2 ${isDark ? 'text-white' : 'text-black'}`}>
                      <AlertCircle className="h-4 w-4" />
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

{/* Right Side - Demo Guide (30%) */}
          <div className="col-span-2 h-full min-h-0">
                         {/* Step-by-Step Guide */}
             <Card className={`h-full border ${isDark ? 'border-[#333]' : 'bg-white border-[#e5e5e5]'}`}>
               <CardHeader className="pb-3">
                 <CardTitle className={`text-lg mb-3 text-center ${isDark ? 'text-white' : 'text-black'}`}>Getting Started</CardTitle>
               </CardHeader>
                <CardContent className="h-full mt-1">
               {/* Step 1 */}
<div className="flex items-start gap-3 mb-8">
  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mt-0.5 font-bold flex-shrink-0 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>1</div>
  <div className="min-w-0">
    <h3 className={`font-semibold mb-1 flex items-center gap-2 text-base ${isDark ? 'text-white' : 'text-black'}`}>
      <Settings className="h-4 w-4" />
      Setup Scanner
    </h3>
    <p className="text-sm text-muted-foreground">Scan license plates from images using our virtual scanner or set up an IoT camera</p>
  </div>
</div>

{/* Step 2 */}
<div className="flex items-start gap-3 mb-6">
  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mt-0.5 font-bold flex-shrink-0 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>2</div>
  <div className="min-w-0">
    <h3 className={`font-semibold mb-1 flex items-center gap-2 text-base ${isDark ? 'text-white' : 'text-black'}`}>
      <Monitor className="h-4 w-4" />
      Try Sample Images
    </h3>
    <p className="text-sm text-muted-foreground">Drag any sample image below to try the license plate recognition</p>
    {/* Sample Images Grid - Only 2 side by side */}
    <div className="grid grid-cols-2 gap-2 mt-2">
      {demoImages.slice(0, 2).map((demoImage, index) => (
                                 <div 
                           key={index}
                           className={`cursor-pointer rounded-lg border-2 border-dashed mt-2 transition-all hover:scale-105 hover:shadow-md w-20 h-16 ${isDark ? 'border-[#333] bg-black/50 h-20 w-32' : 'border-[#e5e5e5] bg-white h-20 w-15'}`}
                           onClick={() => handleDemoImageClick(demoImage)}
                         >
                           <img 
                             src={demoImage.src} 
                             alt={demoImage.alt}
                             className="w-full h-full object-cover rounded-lg"
                           />
                         </div>
      ))}
    </div>
  </div>
</div>

{/* Step 3 */}
<div className="flex items-start gap-3 mb-6">
  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mt-0.5 font-bold flex-shrink-0 mt-3 ${isDark ? 'bg-white text-black' : 'bg-black text-white'}`}>3</div>
  <div className="min-w-0">
    <h3 className={`font-semibold mb-1 flex items-center gap-2 mt-3 text-base ${isDark ? 'text-white' : 'text-black'}`}>
      <Monitor className="h-4 w-4" />
      Monitor Dashboard
    </h3>
    <p className="text-sm text-muted-foreground">View live feed of parking data and real-time updates</p>
  </div>
</div>



               </CardContent>
             </Card>

            

            {/* Recent Scans (when not in demo mode) */}
            {!showDemo && (
              <Card className={`${isDark ? 'bg-black border-[#333]' : 'bg-white border-[#e5e5e5]'} mt-3 border`}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Scans</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentScans.length > 0 ? (
                    <div className="space-y-2">
                      {recentScans.slice(0, 2).map((scan, index) => (
                        <div 
                          key={scan._id || index}
                          className={`p-2 rounded-lg border text-xs ${isDark ? 'border-[#333] bg-black/50' : 'border-[#e5e5e5] bg-white'}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-mono font-bold">{scan.noPlate}</p>
                              <p className="text-muted-foreground">{scan.timeIn}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-muted-foreground">Block</p>
                              <p className="font-mono text-xs">{scan.blockId}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-3">
                      <Upload className="h-5 w-5 mx-auto mb-1 opacity-50" />
                      <p className="text-xs">No recent scans</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
