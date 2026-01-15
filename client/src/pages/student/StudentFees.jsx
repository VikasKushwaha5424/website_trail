import React, { useState, useEffect } from "react";
import api from "../../utils/api";
import { CreditCard, DollarSign, CheckCircle, AlertCircle, Clock } from "lucide-react";

const StudentFees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payingId, setPayingId] = useState(null); // Track which fee is being paid

  useEffect(() => {
    fetchFees();
  }, []);

  const fetchFees = async () => {
    try {
      const { data } = await api.get("/fees/my-dues");
      setFees(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load fee details");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (feeId, amountDue, amountPaid) => {
    const remaining = amountDue - amountPaid;
    
    // Simple confirmation (In a real app, this would be a Payment Gateway Modal)
    if (!window.confirm(`Proceed to pay remaining balance of $${remaining}?`)) return;

    setPayingId(feeId);

    try {
      // 模擬 Payment Gateway Logic
      const payload = {
        feeId,
        amount: remaining,
        method: "ONLINE",
        transactionId: `TXN-${Date.now()}` // Mock Transaction ID
      };

      await api.post("/fees/pay", payload);
      
      alert("Payment Successful!");
      fetchFees(); // Refresh data to show updated status
    } catch (err) {
      alert(err.response?.data?.error || "Payment Failed");
    } finally {
      setPayingId(null);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Fees...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Fee & Payments</h1>
        <button 
            onClick={fetchFees} 
            className="text-sm text-blue-600 hover:underline"
        >
            Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {fees.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow border border-gray-100">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">No Dues Found</h3>
            <p className="text-gray-500">You are all caught up!</p>
          </div>
        ) : (
          fees.map((fee) => {
            const isPaid = fee.status === "PAID";
            const balance = fee.amountDue - fee.amountPaid;

            return (
              <div 
                key={fee._id} 
                className={`bg-white border rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row 
                ${isPaid ? 'border-green-200' : 'border-red-200'}`}
              >
                {/* Status Strip */}
                <div className={`w-full md:w-4 ${isPaid ? 'bg-green-500' : 'bg-red-500'}`}></div>

                <div className="p-6 flex-1 flex flex-col md:flex-row justify-between items-center gap-6">
                  {/* Info Section */}
                  <div className="flex-1 space-y-2 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <h3 className="text-lg font-bold text-gray-800">{fee.type} FEE</h3>
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full 
                        ${isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {fee.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Semester: {fee.semesterId?.name || "Current"}
                    </p>
                    <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>Due: {new Date(fee.dueDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Financials */}
                  <div className="flex gap-8 text-center">
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">Total Amount</p>
                      <p className="text-lg font-bold text-gray-800">${fee.amountDue}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">Paid</p>
                      <p className="text-lg font-bold text-green-600">${fee.amountPaid}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase font-semibold">Balance</p>
                      <p className="text-lg font-bold text-red-600">${balance}</p>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="w-full md:w-auto">
                    {isPaid ? (
                      <button disabled className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-400 font-bold py-2 px-6 rounded-lg cursor-not-allowed">
                        <CheckCircle size={18} />
                        PAID
                      </button>
                    ) : (
                      <button
                        onClick={() => handlePayment(fee._id, fee.amountDue, fee.amountPaid)}
                        disabled={payingId === fee._id}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        {payingId === fee._id ? (
                          <span>Processing...</span>
                        ) : (
                          <>
                            <CreditCard size={18} />
                            PAY NOW
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default StudentFees;