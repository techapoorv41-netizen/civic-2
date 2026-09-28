function IssueMap({ location }) {
  if (!location || !location.lat || !location.lng) {
    return (
      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-sm">
        Location not available
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}&z=15&output=embed`;

  return (
    <div className="w-full h-48 rounded-lg overflow-hidden border border-gray-200">
      <iframe
        title="Issue Location"
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        loading="lazy"
      ></iframe>
    </div>
  );
}

export default IssueMap;