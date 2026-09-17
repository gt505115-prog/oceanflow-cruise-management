import pathlib, subprocess, json, urllib.request as U, urllib.error as E, re
M=pathlib.Path(r"D:\Flask-CleanArchitecture-main\Flask-CleanArchitecture-main")
R=next(x for x in M.glob("H*") if x.is_dir())
f=R/"frontend/src/pages/passenger/PassengerPortal.jsx"
t=f.read_text(encoding="utf-8-sig")
# Verify patch inserted
for token in ["function Itinerary({ data, passenger }", "data = { ...data, days:", "function Excursions({ data, passenger }", "data = { ...data, excursions"]:
    print(token, token in t)
# Build
r=subprocess.run(["npm","run","build"],cwd=str(R/"frontend"),capture_output=True,text=True,timeout=90)
print("BUILD rc",r.returncode)
print(r.stdout[-1500:])
print(r.stderr[-1500:])
# Excursion list rendering: check that list card now filters and has button
print("--- card has reg handler? ---")
print("apiClient.post" in t and "excursion-registrations" in t)
