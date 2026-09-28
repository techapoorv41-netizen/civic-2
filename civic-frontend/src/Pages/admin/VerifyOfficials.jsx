import { useState, useEffect } from "react";
import { getAllOfficials, verifyOfficial } from "../../api/userApi";

function VerifyOfficials() {
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOfficials = async () => {
      const res = await getAllOfficials({ isVerified: false });
      if (res.success) {
        setOfficials(res.data);
      }
      setLoading(false);
    };
    fetchOfficials();
  }, []);

  const handleVerify = async (officialId) => {
    const res = await verifyOfficial(officialId);
    if (res.success) {
      setOfficials((prev) => prev.filter((o) => o.id !== officialId));
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading officials...</p>;
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Verify Officials</h2>

      {officials.length === 0 ? (
        <p className="text-gray-500">No pending officials to verify.</p>
      ) : (
        <div className="space-y-3">
          {officials.map((official) => (
            <div
              key={official.id}
              className="flex justify-between items-center border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div>
                <p className="font-medium text-gray-800">{official.name}</p>
                <p className="text-sm text-gray-500">{official.email}</p>
              </div>
              <button
                onClick={() => handleVerify(official.id)}
                className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700"
              >
                Verify
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default VerifyOfficials;