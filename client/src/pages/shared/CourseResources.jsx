import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import api from "../../utils/api";
import { AuthContext } from "../../context/AuthContext";
import { FileText, Download, Trash2, UploadCloud, File } from "lucide-react";

const CourseResources = () => {
  const { offeringId } = useParams();
  const { user } = useContext(AuthContext);
  const [resources, setResources] = useState([]);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  // Fetch Resources
  useEffect(() => {
    api.get(`/resources/${offeringId}`)
      .then(res => setResources(res.data))
      .catch(err => console.error("Failed to load resources"));
  }, [offeringId]);

  // Handle File Upload
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return alert("Please select a file and enter a title");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("courseOfferingId", offeringId);

    setUploading(true);
    try {
      const res = await api.post("/resources/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResources([res.data, ...resources]); // Add new file to list
      setTitle("");
      setFile(null);
      alert("File Uploaded Successfully!");
    } catch (err) {
      alert("Upload Failed");
    } finally {
      setUploading(false);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await api.delete(`/resources/${id}`);
      setResources(resources.filter(r => r._id !== id));
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <FileText className="text-blue-600" /> Study Materials
      </h2>

      {/* 📤 UPLOAD SECTION (Faculty Only) */}
      {user.role === "faculty" && (
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8">
          <h3 className="font-bold text-gray-700 mb-4">Upload New Material</h3>
          <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm text-gray-500 mb-1">Document Title</label>
              <input 
                type="text" 
                className="w-full border p-2 rounded"
                placeholder="e.g. Unit 1 Lecture Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="flex-1 w-full">
              <label className="block text-sm text-gray-500 mb-1">Select File (PDF, PPT, DOC)</label>
              <input 
                type="file" 
                className="w-full border p-1.5 rounded bg-gray-50"
                onChange={(e) => setFile(e.target.files[0])}
              />
            </div>
            <button 
              type="submit" 
              disabled={uploading}
              className="bg-blue-600 text-white px-6 py-2.5 rounded font-bold hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {uploading ? "Uploading..." : <><UploadCloud size={18} /> Upload</>}
            </button>
          </form>
        </div>
      )}

      {/* 📄 FILE LIST */}
      <div className="grid gap-4">
        {resources.length === 0 ? (
          <p className="text-gray-500 italic">No resources uploaded yet.</p>
        ) : (
          resources.map((res) => (
            <div key={res._id} className="bg-white p-4 rounded-lg shadow-sm border flex justify-between items-center hover:shadow-md transition">
              <div className="flex items-center gap-4">
                <div className="bg-blue-50 p-3 rounded text-blue-600">
                  <File size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800">{res.title}</h4>
                  <p className="text-xs text-gray-500 uppercase">
                    {res.fileType} • Uploaded by {res.uploadedBy?.name} • {new Date(res.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <a 
                  href={res.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm bg-gray-100 px-3 py-1.5 rounded hover:bg-gray-200 text-gray-700 font-medium"
                >
                  <Download size={16} /> Download
                </a>
                
                {user.role === "faculty" && (
                  <button 
                    onClick={() => handleDelete(res._id)}
                    className="text-red-500 hover:bg-red-50 p-2 rounded transition"
                    title="Delete File"
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CourseResources;