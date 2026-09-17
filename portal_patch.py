import pathlib
M = pathlib.Path(r"D:\Flask-CleanArchitecture-main\Flask-CleanArchitecture-main")
R = next(x for x in M.glob("H*") if x.is_dir())
f = R / "frontend/src/pages/passenger/PassengerPortal.jsx"
t = f.read_text(encoding="utf-8-sig")

# 1) Pass passenger into Itinerary and filter to confirmed booking days
old_it = "function Itinerary({ data }) {"
new_it = "function Itinerary({ data, passenger }) { const confirmedTours=(data.bookings||[]).filter(b=>passenger?.id&&Number(b.passenger_id)===Number(passenger.id)&&String(b.status).toLowerCase()===\"confirmed\").map(b=>Number(b.cruise_tour_id)); const itinIds=(data.itineraries||[]).filter(i=>confirmedTours.includes(Number(i.cruise_tour_id))).map(i=>Number(i.id)); data = { ...data, days:(data.days||[]).filter(d=>itinIds.includes(Number(d.itinerary_id))) };"
assert old_it in t, "itinerary anchor"
t = t.replace(old_it, new_it)

# 2) Pass passenger into Excursions + add register button (registration endpoint /passengers/me is auth-scoped; use passenger_id)
old_ex = "function Excursions({ data }) {"
new_ex = "function Excursions({ data, passenger }) { const confirmedTours=(data.bookings||[]).filter(b=>passenger?.id&&Number(b.passenger_id)===Number(passenger.id)&&String(b.status).toLowerCase()===\"confirmed\").map(b=>Number(b.cruise_tour_id)); const itinIds=(data.itineraries||[]).filter(i=>confirmedTours.includes(Number(i.cruise_tour_id))).map(i=>Number(i.id)); const dayIds=(data.days||[]).filter(d=>itinIds.includes(Number(d.itinerary_id))).map(d=>Number(d.id)); const stopIds=(data.stops||[]).filter(s=>dayIds.includes(Number(s.itinerary_day_id))).map(s=>Number(s.id)); data = { ...data, excursions:(data.excursions||[]).filter(x=>stopIds.includes(Number(x.cruise_stop_id))) }; const reg=(x)=>{ if(!passenger?.id)return; apiClient.post(\"/api/v1/excursion-registrations\",{excursion_id:x.id,passenger_id:passenger.id}).then(()=>window.location.reload()).catch(()=>{}); };"
assert old_ex in t, "excursions anchor"
t = t.replace(old_ex, new_ex)

# 3) Route calls: pass passenger
for anchor, repl in [
  ("<Itinerary data={data} />", "<Itinerary data={data} passenger={passenger} />"),
  ("<Excursions data={data} />", "<Excursions data={data} passenger={passenger} />"),
]:
    t = t.replace(anchor, repl)

f.write_text(t, encoding="utf-8")
print("patched portal OK")
