{/* Inside your map function */}
{notices.map((notice) => (
  <div 
    key={notice._id} 
    className={`p-5 rounded-xl border-l-4 shadow-sm bg-white mb-4 ${
      notice.isImportant ? "border-red-500 bg-red-50" : // Handle 'isImportant'
      notice.courseOfferingId ? "border-orange-500" : "border-blue-500"
    }`}
  >
    <div className="flex justify-between items-start mb-2">
      <div>
        {/* Badge Logic */}
        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${
          notice.courseOfferingId ? "bg-orange-100 text-orange-700" : "bg-blue-100 text-blue-700"
        }`}>
          {notice.courseOfferingId 
            ? `${notice.courseOfferingId.courseId?.code} Class` // Class Notice
            : "Official Notice" // Admin Notice
          }
        </span>
        <h3 className="text-lg font-bold mt-2 text-gray-800">{notice.title}</h3>
      </div>
      <span className="text-xs text-gray-400">
        {new Date(notice.createdAt).toLocaleDateString()}
      </span>
    </div>
    <p className="text-gray-600 leading-relaxed">{notice.message}</p>
    
    {/* Optional: Show who posted it */}
    <div className="mt-3 text-xs text-gray-400 text-right">
      Posted by: {notice.createdBy?.name || "Admin"}
    </div>
  </div>
))}