import MapView from '../MapView';

export default function MapViewExample() {
  const mockListings = [
    {
      id: "1",
      title: "Organic Kitchen Waste",
      category: "Organic",
      latitude: 15.4909,
      longitude: 73.8278,
      businessName: "Sunset Shack",
      distance: 0,
    },
    {
      id: "2",
      title: "Glass Bottles",
      category: "Glass",
      latitude: 15.5100,
      longitude: 73.8200,
      businessName: "Beach Resort",
      distance: 2.3,
    },
    {
      id: "3",
      title: "Cardboard Boxes",
      category: "Paper",
      latitude: 15.4800,
      longitude: 73.8400,
      businessName: "Art Gallery",
      distance: 1.5,
    },
  ];

  return (
    <div className="p-8 bg-background">
      <h2 className="text-2xl font-semibold mb-4">Map View Component</h2>
      <div className="h-[500px] rounded-lg overflow-hidden">
        <MapView
          listings={mockListings}
          center={[15.4909, 73.8278]}
          onListingClick={(id) => console.log('Clicked listing:', id)}
        />
      </div>
    </div>
  );
}
