import { useState, useEffect, useRef } from "react";
import api from "../../utils/api";
import Barcode from "react-barcode";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, Loader } from "lucide-react";

const IDCardGenerator = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const cardRef = useRef();

  useEffect(() => {
    api.get("/student/id-card")
      .then(res => {
        setData(res.data);
        setLoading(false);
      })
      .catch(err => console.error(err));
  }, []);

  const downloadPDF = async () => {
    const element = cardRef.current;
    
    // High-quality canvas capture
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL("image/png");
    
    // Create PDF (Portrait, Millimeters, A4 size roughly)
    // We adjust the PDF size to match the ID card aspect ratio (standard CR80 size: 85.6mm x 54mm)
    // But here we keep it simple: A4 page with the image centered.
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, "PNG", 0, 10, pdfWidth, pdfHeight);
    pdf.save(`${data.rollNumber}_ID_Card.pdf`);
  };

  if (loading) return <div className="p-10 flex justify-center"><Loader className="animate-spin"/></div>;

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Student Identity Card</h2>

      {/* 🆔 THE VISUAL ID CARD WRAPPER */}
      <div className="mb-8 shadow-2xl rounded-xl overflow-hidden" style={{ width: "350px", height: "550px" }}>
        
        {/* === CARD CONTENT (This gets captured) === */}
        <div ref={cardRef} className="w-full h-full bg-white border border-gray-200 relative flex flex-col">
          
          {/* Header */}
          <div className="bg-blue-900 text-white p-4 text-center">
            <h1 className="text-lg font-bold uppercase tracking-wider">Mythic University</h1>
            <p className="text-xs opacity-80">Excellence in Technology</p>
          </div>

          {/* Photo Section */}
          <div className="mt-6 flex justify-center">
            <div className="w-32 h-32 rounded-full border-4 border-blue-900 overflow-hidden shadow-md">
              <img 
                src={data.photo} 
                alt="Profile" 
                className="w-full h-full object-cover"
                crossOrigin="anonymous" // Crucial for html2canvas
              />
            </div>
          </div>

          {/* Details */}
          <div className="text-center mt-4 px-6 flex-1">
            <h2 className="text-xl font-bold text-gray-900 uppercase">{data.name}</h2>
            <p className="text-blue-700 font-semibold mb-4">{data.rollNumber}</p>

            <div className="text-left text-sm space-y-2 text-gray-700">
              <div className="flex justify-between border-b pb-1">
                <span className="font-bold">Dept:</span>
                <span>{data.department}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="font-bold">DOB:</span>
                <span>{new Date(data.dob).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="font-bold">Valid Upto:</span>
                <span className="text-red-600 font-semibold">{new Date(data.validUpto).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="font-bold">Blood Group:</span>
                <span>{data.bloodGroup}</span>
              </div>
            </div>
          </div>

          {/* Footer / Barcode */}
          <div className="mt-auto pb-4 pt-2 flex flex-col items-center bg-gray-50 border-t">
            <Barcode value={data.rollNumber} width={1.5} height={40} fontSize={12} background="#f9fafb" />
            <p className="text-[10px] text-gray-400 mt-1">Property of {data.universityName}</p>
          </div>

          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-full border-[10px] border-blue-900/10 pointer-events-none"></div>

        </div>
      </div>

      {/* Download Button */}
      <button 
        onClick={downloadPDF}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-700 flex items-center gap-2 font-bold transition-transform hover:scale-105 active:scale-95"
      >
        <Download size={20} /> Download Official ID
      </button>

      <p className="text-xs text-gray-500 mt-4 max-w-sm text-center">
        * Please print this card on high-quality paper or save it to your mobile device for campus entry.
      </p>
    </div>
  );
};

export default IDCardGenerator;