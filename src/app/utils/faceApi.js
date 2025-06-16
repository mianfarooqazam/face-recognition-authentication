import * as faceapi from '@vladmandic/face-api'

export const loadFaceApiModels = async () => {
  const modelPath = 'https://vladmandic.github.io/face-api/model/'
  
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(modelPath),
    faceapi.nets.faceLandmark68Net.loadFromUri(modelPath),
    faceapi.nets.faceRecognitionNet.loadFromUri(modelPath)
  ])
}

export const detectFaceInVideo = async (video, canvas) => {
  if (!video || video.videoWidth === 0) return

  try {
    const detections = await faceapi
      .detectAllFaces(video)
      .withFaceLandmarks()

    const ctx = canvas.getContext('2d')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (detections.length > 0) {
      const detection = detections[0]
      const { x, y, width, height } = detection.detection.box

      // Draw main detection box
      ctx.strokeStyle = '#10b981'
      ctx.lineWidth = 3
      ctx.strokeRect(x, y, width, height)

      // Draw corner indicators
      const cornerLength = 20
      ctx.strokeStyle = '#3b82f6'
      ctx.lineWidth = 4

      // Top-left corner
      ctx.beginPath()
      ctx.moveTo(x, y + cornerLength)
      ctx.lineTo(x, y)
      ctx.lineTo(x + cornerLength, y)
      ctx.stroke()

      // Top-right corner
      ctx.beginPath()
      ctx.moveTo(x + width - cornerLength, y)
      ctx.lineTo(x + width, y)
      ctx.lineTo(x + width, y + cornerLength)
      ctx.stroke()

      // Bottom-left corner
      ctx.beginPath()
      ctx.moveTo(x, y + height - cornerLength)
      ctx.lineTo(x, y + height)
      ctx.lineTo(x + cornerLength, y + height)
      ctx.stroke()

      // Bottom-right corner
      ctx.beginPath()
      ctx.moveTo(x + width - cornerLength, y + height)
      ctx.lineTo(x + width, y + height)
      ctx.lineTo(x + width, y + height - cornerLength)
      ctx.stroke()

      // Draw key facial landmarks
      ctx.fillStyle = '#ef4444'
      const keyPoints = [
        detection.landmarks.getNose()[3], // nose tip
        detection.landmarks.getLeftEye()[0], // left eye outer corner
        detection.landmarks.getRightEye()[3], // right eye outer corner
        detection.landmarks.getMouth()[0], // left mouth corner
        detection.landmarks.getMouth()[6], // right mouth corner
      ]

      keyPoints.forEach(point => {
        ctx.beginPath()
        ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI)
        ctx.fill()
      })
    }
  } catch (error) {
    console.debug('Detection error:', error)
  }
}

export const captureFaceDescriptor = async (video) => {
  try {
    const detections = await faceapi
      .detectAllFaces(video)
      .withFaceLandmarks()
      .withFaceDescriptors()

    if (detections.length === 0) {
      return {
        success: false,
        message: '👤 No face detected. Please position your face clearly in the frame.'
      }
    }

    if (detections.length > 1) {
      return {
        success: false,
        message: '👥 Multiple faces detected. Please ensure only one face is visible.'
      }
    }

    return {
      success: true,
      descriptor: detections[0].descriptor,
      message: 'Face captured successfully!'
    }
  } catch (error) {
    console.error('Error capturing face descriptor:', error)
    return {
      success: false,
      message: '❌ Error analyzing face. Please try again.'
    }
  }
}