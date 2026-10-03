#!/usr/bin/env python3
"""Insert synthetic local records through the same API as the registration form."""
import json
import urllib.request

BASE = "http://127.0.0.1:8080/api/v1"
with urllib.request.urlopen(BASE + "/workspace", timeout=10) as response:
    if json.load(response)["mode"] != "local-demo":
        raise SystemExit("Demo fixtures are allowed only in the local profile.")

fixtures = [
    ("00000000-0000-0000-0000-000000000101", "Sample: Meera Devi", "Sample Bishanpur", "Paddy", "Growing", 1.25, "One pump, two seed bags"),
    ("00000000-0000-0000-0000-000000000102", "Sample: Ram Kumar", "Sample Rampur", "Maize", "Ready to harvest", 0.8, "Hand tools, stored seed"),
    ("00000000-0000-0000-0000-000000000103", "Sample: Sita Kumari", "Sample Bishanpur", "Vegetables", "Growing", 0.45, "One irrigation pump"),
]
for index, (request_id, name, village, crop, stage, area, assets) in enumerate(fixtures):
    longitude = 86.1 + index * 0.01
    boundary = [
        {"longitude": longitude, "latitude": 25.9},
        {"longitude": longitude + 0.002, "latitude": 25.9},
        {"longitude": longitude + 0.002, "latitude": 25.902},
        {"longitude": longitude, "latitude": 25.902},
        {"longitude": longitude, "latitude": 25.9},
    ]
    payload = {"requestId": request_id, "farmerName": name, "village": village,
               "district": "Sample Bihar district", "crop": crop, "stage": stage,
               "areaHectares": area, "assets": assets, "boundary": boundary,
               "consent": True, "consentVersion": "registry-v1-en"}
    request = urllib.request.Request(BASE + "/farms", data=json.dumps(payload).encode(),
                                     headers={"Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(request, timeout=10) as response:
        farm = json.load(response)
        print("Saved synthetic record:", farm["farmerName"], farm["id"])
