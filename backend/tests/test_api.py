from datetime import datetime, timedelta


def test_api_create_and_conflict(client):
    # Create organization
    org_resp = client.post(
        "/api/organizations/",
        json={"name": "API Org"},
    )
    assert org_resp.status_code == 201, org_resp.text
    org_id = org_resp.json()["id"]

    # Create resource
    res_resp = client.post(
        "/api/resources/",
        json={"organization_id": org_id, "name": "Table 1", "type": "table", "capacity": 4},
    )
    assert res_resp.status_code == 201, res_resp.text
    res_id = res_resp.json()["id"]

    # Create reservation (happy path)
    now = datetime.now()
    r1 = client.post(
        "/api/reservations/",
        json={
            "resource_id": res_id,
            "start_time": (now + timedelta(hours=1)).isoformat(),
            "end_time": (now + timedelta(hours=2)).isoformat(),
            "guest_last_name": "Smith",
            "guest_first_name": "John",
        },
    )
    assert r1.status_code == 201, r1.text

    # Create overlapping reservation (should 400)
    r2 = client.post(
        "/api/reservations/",
        json={
            "resource_id": res_id,
            "start_time": (now + timedelta(hours=1, minutes=30)).isoformat(),
            "end_time": (now + timedelta(hours=2, minutes=30)).isoformat(),
            "guest_last_name": "Jones",
        },
    )
    assert r2.status_code == 400, r2.text

    # Query by guest_last_name
    list_resp = client.get("/api/reservations/", params={"guest_last_name": "Smith"})
    assert list_resp.status_code == 200
    data = list_resp.json()
    assert isinstance(data, list) and len(data) == 1


def test_api_get_update_delete(client):
    # Create organization and resource
    org = client.post("/api/organizations/", json={"name": "Another Org"}).json()
    res = client.post(
        "/api/resources/",
        json={"organization_id": org["id"], "name": "Room A", "type": "room", "capacity": 8},
    ).json()

    # Create reservation
    now = datetime.now()
    r = client.post(
        "/api/reservations/",
        json={
            "resource_id": res["id"],
            "start_time": (now + timedelta(hours=3)).isoformat(),
            "end_time": (now + timedelta(hours=4)).isoformat(),
            "guest_last_name": "Lee",
        },
    )
    assert r.status_code == 201
    rid = r.json()["id"]

    # Get
    g = client.get(f"/api/reservations/{rid}")
    assert g.status_code == 200

    # Update (notes)
    u = client.patch(f"/api/reservations/{rid}", json={"notes": "window seat"})
    assert u.status_code == 200
    assert u.json()["notes"] == "window seat"

    # Cancel
    c = client.post(f"/api/reservations/{rid}/cancel")
    assert c.status_code == 200
    assert c.json()["status"] == "cancelled"

    # Delete
    d = client.delete(f"/api/reservations/{rid}")
    assert d.status_code == 204

    # 404 after delete
    not_found = client.get(f"/api/reservations/{rid}")
    assert not_found.status_code == 404
