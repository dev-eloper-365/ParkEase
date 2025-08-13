import { useState, useEffect } from 'react';
import { Upload, Camera, CheckCircle, AlertCircle, ArrowRight, Monitor, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/App';
import { useNavigate } from 'react-router-dom';

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
      const response = await fetch('http://localhost:8080/api/scan-license-plate', {
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
      const response = await fetch('http://localhost:8080/api/scan-license-plate');
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
          <h1 className="text-3xl font-bold mb-2">
            License Plate Scanner
          </h1>
          <p className="text-muted-foreground">
            Upload an image to automatically detect and register license plates
          </p>
        </div>

        <div className="grid grid-cols-7 gap-4 flex-1 min-h-0 items-stretch">
          {/* Left Side - Scan Section (70%) */}
          <div className="col-span-5 h-full min-h-0">
            {/* Upload Section */}
            <Card className="flex flex-col h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Scan License Plate
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1">
                <div
                  className={`relative flex h-[400px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                    dragActive 
                      ? 'border-primary bg-secondary/50' 
                      : isDark 
                        ? 'border-gray-600 hover:border-gray-500' 
                        : 'border-gray-300 hover:border-gray-400'
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
                        className="h-full w-full object-cover rounded-lg"
                      />
                      {scanResult && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Detected
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <Upload className={`mb-4 h-12 w-12 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <p className="text-sm text-center text-muted-foreground mb-2">
                        {showDemo ? 'Try demo images on the right or upload your own' : 'Drag and drop license plate image or click to upload'}
                      </p>
                      <p className="text-xs text-center text-muted-foreground">
                        Supports JPG, PNG, GIF up to 5MB
                      </p>
                      {showDemo && (
                        <p className="text-xs text-center text-blue-600 dark:text-blue-400 mt-2">
                          💡 Click demo images to see how it works!
                        </p>
                      )}
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleFileInput}
                        accept="image/*"
                      />
                    </>
                  )}
                </div>

                {/* Loading and Error States */}
                {isLoading && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      <p>Processing image...</p>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-4 text-center">
                    <div className="inline-flex items-center gap-2 text-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <p>{error}</p>
                    </div>
                  </div>
                )}

                {/* Scan Results */}
                {scanResult && (
                  <div className="mt-4 space-y-3">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-800 dark:text-green-200 mb-2">
                        License Plate Detected!
                      </h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Plate Number:</span>
                          <span className="font-mono font-bold text-lg">{scanResult.plate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Confidence:</span>
                          <span>{(scanResult.confidence * 100).toFixed(1)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Time In:</span>
                          <span>{scanResult.timeIn}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Block ID:</span>
                          <span className="font-mono text-xs">{scanResult.blockId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {uploadedImage && (
                  <div className="mt-4 flex justify-center gap-3">
                    <Button 
                      onClick={resetForm}
                      variant="outline"
                      className={`${isDark ? 'bg-black text-white border-[#333] hover:bg-black/90' : 'bg-white text-black border-[#e5e5e5] hover:bg-gray-50'}`}
                    >
                      Scan Another Image
                    </Button>
                    {scanResult && (
                      <Button 
                        onClick={goToDashboard}
                        className={`${isDark ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-500 hover:bg-blue-600'} text-white`}
                      >
                        <Monitor className="h-4 w-4 mr-2" />
                        Go to Dashboard
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

{/* Right Side - Demo Guide (30%) */}
          <div className="col-span-2 h-full min-h-0">
                         {/* Step-by-Step Guide */}
             <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-800 h-full">
               <CardHeader className="pb-3">
                 <CardTitle className="text-lg mb-3 text-center text-blue-800 dark:text-blue-200">
                   🚀 Getting Started
                 </CardTitle>
               </CardHeader>
                <CardContent className="h-full mt-1">
               {/* Step 1 */}
<div className="flex items-start gap-3 mb-8">
  <div
    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mt-0.5 font-bold flex-shrink-0 ${
      isDark
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/50'
        : 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
    }`}
  >
    1
  </div>
  <div className="min-w-0">
    <h3 className="font-semibold mb-1 flex items-center gap-2 text-blue-800 dark:text-blue-200 text-lg">
      <Settings className="h-4 w-4" />
      Setup Scanner
    </h3>
    <p className="text-sm text-muted-foreground">
      Scan license plates from images using our virtual scanner or set up an IoT camera
    </p>
  </div>
</div>

{/* Step 2 */}
<div className="flex items-start gap-3 mb-8">
  <div
    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mt-0.5 font-bold flex-shrink-0 ${
      isDark
        ? 'bg-green-600 text-white shadow-lg shadow-green-500/50'
        : 'bg-green-500 text-white shadow-lg shadow-green-500/30'
    }`}
  >
    2
  </div>
  <div className="min-w-0">
    <h3 className="font-semibold mb-1 flex items-center gap-2 text-green-800 dark:text-green-200 text-lg">
      <Monitor className="h-4 w-4" />
      Try Sample Images
    </h3>
    <p className="text-sm text-muted-foreground">
      Click any sample image below to see the scanner in action
    </p>
    {/* Sample Images Grid - Only 2 side by side */}
    <div className="grid grid-cols-2 gap-2 mt-2">
      {demoImages.slice(0, 2).map((demoImage, index) => (
                                 <div 
                           key={index}
                           className={`cursor-pointer rounded-lg border-2 border-dashed mt-2 transition-all hover:scale-105 hover:shadow-md w-20 h-16 ${
                             isDark 
                               ? 'border-gray-600 hover:border-blue-500 bg-gray-800/50 h-20 w-32' 
                               : 'border-gray-300 hover:border-blue-500 bg-gray-50 h-20 w-15'
                           }`}
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
<div className="flex items-start gap-3 mb-8">
  <div
    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs mt-0.5 font-bold flex-shrink-0 ${
      isDark
        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/50'
        : 'bg-purple-500 text-white shadow-lg shadow-purple-500/30'
    }`}
  >
    3
  </div>
  <div className="min-w-0">
    <h3 className="font-semibold mb-1 flex items-center gap-2 text-purple-800 dark:text-purple-200 text-lg">
      <Monitor className="h-4 w-4" />
      Monitor Dashboard
    </h3>
    <p className="text-sm text-muted-foreground">
      View live feed of parking data and real-time updates
    </p>
  </div>
</div>



               </CardContent>
             </Card>

            

            {/* Recent Scans (when not in demo mode) */}
            {!showDemo && (
              <Card className="mt-3">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Recent Scans</CardTitle>
                </CardHeader>
                <CardContent>
                  {recentScans.length > 0 ? (
                    <div className="space-y-2">
                      {recentScans.slice(0, 2).map((scan, index) => (
                        <div 
                          key={scan._id || index}
                          className={`p-2 rounded-lg border text-xs ${isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}
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
