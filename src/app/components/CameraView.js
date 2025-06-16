const CameraView = ({ videoRef, canvasRef, isCameraActive }) => {
    return (
      <div className="relative mb-6">
        <div className="relative rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-80 object-cover"
          />
          <canvas
            ref={canvasRef}
            className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
          />
          
          {!isCameraActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 text-gray-500">
              <p className="text-lg font-medium">Camera Inactive</p>
              <p className="text-sm text-gray-400 mt-2">Click Activate Camera to begin</p>
            </div>
          )}
        </div>
      </div>
    )
  }
  
  export default CameraView