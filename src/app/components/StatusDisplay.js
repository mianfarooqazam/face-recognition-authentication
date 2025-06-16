const StatusDisplay = ({ status }) => {
    const getStatusClasses = (type) => {
      switch (type) {
        case 'success':
          return 'bg-green-50 text-green-700 border-green-200'
        case 'error':
          return 'bg-red-50 text-red-700 border-red-200'
        case 'loading':
          return 'bg-blue-50 text-blue-700 border-blue-200'
        default:
          return 'bg-gray-50 text-gray-700 border-gray-200'
      }
    }
  
    return (
      <div className={`p-4 rounded-md border ${getStatusClasses(status.type)}`}>
        {status.message}
      </div>
    )
  }
  
  export default StatusDisplay
