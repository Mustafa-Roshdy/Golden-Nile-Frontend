
import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from "react-router-dom";

// Helper component for map logic
const ProgramMap = ({ activities, selectedIndex }: { activities: any[]; selectedIndex: number }) => {
  const map = useMap();
  const selectedActivity = activities[selectedIndex];
  const coords = selectedActivity ? (() => {
    const lat = Number(selectedActivity.latitude || selectedActivity.lat);
    const lng = Number(selectedActivity.longitude || selectedActivity.lng);
    if (!isNaN(lat) && !isNaN(lng)) return [[lat, lng] as [number, number]];
    return [];
  })() : [];

  useEffect(() => {
    if (coords.length === 0) return;
    try {
      map.invalidateSize();
      map.setView(coords[0], 13);
    } catch (e) {
      // ignore
    }
  }, [selectedIndex, activities, map, coords]);

  return (
    <>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
      {coords.map((c, i) => (
        <Marker key={selectedIndex} position={c as [number, number]}>
          <Popup>{selectedActivity?.name}</Popup>
        </Marker>
      ))}
    </>
  );
};

interface ProgramDetailsModalProps {
  program: any;
  isOpen: boolean;
  onClose: () => void;
  onDelete?: () => void;
  showDeleteButton?: boolean;
  selectedActivityIndex: number;
  setSelectedActivityIndex: (index: number) => void;
}

const ProgramDetailsModal = ({
  program,
  isOpen,
  onClose,
  onDelete,
  showDeleteButton = true,
  selectedActivityIndex,
  setSelectedActivityIndex
}: ProgramDetailsModalProps) => {
  const navigate = useNavigate();

  if (!program) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{program.name || 'Program Details'}</DialogTitle>
          <DialogDescription>
            {program.destination} • {program.checkInDate} to {program.checkOutDate}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h4 className="text-lg font-semibold mb-3">Activities</h4>
              <div className="space-y-3">
                {program.activities?.map((act: any, idx: number) => (
                  <Card key={idx} className={`p-3 ${selectedActivityIndex === idx ? 'border-primary border-2' : ''}`}>
                    <CardContent className="flex items-center gap-3">
                      {act.image ? (
                        <img src={act.image} alt={act.name} className="w-20 h-16 object-cover rounded-md" />
                      ) : (
                        <div className="w-20 h-16 bg-muted rounded-md flex items-center justify-center text-sm text-muted-foreground">No Image</div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h5 className="font-semibold">{act.name}</h5>
                          <span className="text-xs text-muted-foreground">{act.startTime || act.time || ''}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{act.description || ''}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedActivityIndex(idx)}>Show on Map</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            <div className="md:col-span-1">
              <h4 className="text-lg font-semibold mb-3">Map</h4>
              <div className="w-full h-[320px] bg-muted rounded-xl overflow-hidden">
                {program.activities && program.activities.length > 0 ? (
                  <MapContainer
                    center={[
                      Number(program.activities[selectedActivityIndex]?.latitude) || 30.0444,
                      Number(program.activities[selectedActivityIndex]?.longitude) || 31.2357,
                    ]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={false}
                  >
                    <ProgramMap activities={program.activities} selectedIndex={selectedActivityIndex} />
                  </MapContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">No coordinates available for this program</div>
                )}
              </div>

              {program.suggest?.guestHouses && program.suggest.guestHouses.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-lg font-semibold mb-2">Suggested Guest Houses</h4>
                  <div className="space-y-2">
                    {program.suggest.guestHouses.map((house: any, i: number) => (
                      <Card key={house.id || i} className="p-3">
                        <CardContent className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">{house.name}</div>
                            <div className="text-xs text-muted-foreground">${house.price} per night</div>
                          </div>
                          <Button size="sm" onClick={() => navigate(`/booking/${house.id}`)}>Book</Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>Close</Button>
            {showDeleteButton && onDelete && (
              <Button variant="destructive" onClick={onDelete}>Delete Program</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProgramDetailsModal;
