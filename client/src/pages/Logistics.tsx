import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const providers = [
  {
    name: "Sandeep's Transport",
    phone: "+91 98765 43210",
    vehicle: "Tata Ace",
    areas: "South Goa: Margao, Colva, Benaulim",
    rates: "₹300-500 per trip (approx)",
  },
  {
    name: "Panjim Cargo",
    phone: "+91 98220 11111",
    vehicle: "3-Wheeler Rickshaw",
    areas: "North Goa: Panjim, Mapusa, Porvorim",
    rates: "On request",
  },
  {
    name: "Green Movers",
    phone: "+91 98900 22222",
    vehicle: "Pickup Van",
    areas: "Statewide",
    rates: "₹25/km (approx)",
  },
  {
    name: "Madgaon Mini-Loads",
    phone: "+91 98817 33333",
    vehicle: "Mini Truck",
    areas: "Madgaon, Navelim, Fatorda",
    rates: "On request",
  },
  {
    name: "Panjim QuickHaul",
    phone: "+91 98123 44444",
    vehicle: "Tempo",
    areas: "Panjim, Dona Paula, Porvorim",
    rates: "On request",
  },
];

export default function Logistics() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-2">Local Logistics Partners</h1>
        <p className="text-sm text-muted-foreground mb-6">
          CircularGoa provides this list as a helpful resource. All arrangements and payments are made directly between you and the transport provider. We are not responsible for their services.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map((p) => (
            <Card key={p.name} className="p-4 space-y-1">
              <h3 className="font-semibold text-lg">{p.name}</h3>
              <div className="text-sm"><span className="text-muted-foreground">Phone:</span> {p.phone}</div>
              <div className="text-sm"><span className="text-muted-foreground">Vehicle:</span> {p.vehicle}</div>
              <div className="text-sm"><span className="text-muted-foreground">Areas:</span> {p.areas}</div>
              {p.rates && <div className="text-sm"><span className="text-muted-foreground">Rates:</span> {p.rates}</div>}
              <div className="pt-2">
                <Button asChild className="rounded-full">
                  <a href={`tel:${p.phone.replace(/\s|\+/g, '')}`}>Call</a>
                </Button>
                <Button asChild variant="outline" className="rounded-full ml-2">
                  <a target="_blank" rel="noreferrer" href={`https://wa.me/${p.phone.replace(/\s|\+/g, '')}`}>WhatsApp</a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}


