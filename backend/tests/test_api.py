"""Backend API tests for মানিকগঞ্জ অনলাইন সেবা."""
import pytest
import requests

PUBLIC_COLLECTIONS = [
    "notices", "sliders", "services", "ads", "hospitals", "police",
    "fire_service", "doctors", "blood_banks", "ambulances", "rent_a_car",
    "restaurants", "upazilas", "schools", "colleges", "madrasas",
    "blood_donors", "tourist_places", "e_services",
]


# -------- Health --------
class TestHealth:
    def test_root(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/")
        assert r.status_code == 200
        body = r.json()
        assert body.get("status") == "ok"


# -------- Auth --------
class TestAuth:
    def test_login_success(self, api_client, base_url):
        r = api_client.post(
            f"{base_url}/api/auth/login",
            json={"email": "admin@manikganj.com", "password": "Admin@123"},
        )
        assert r.status_code == 200
        data = r.json()
        assert "access_token" in data and data["access_token"]
        assert data.get("token_type") == "bearer"
        assert data["admin"]["email"] == "admin@manikganj.com"

    def test_login_wrong_password(self, api_client, base_url):
        r = api_client.post(
            f"{base_url}/api/auth/login",
            json={"email": "admin@manikganj.com", "password": "wrong"},
        )
        assert r.status_code == 401

    def test_me_with_token(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/auth/me", headers=auth_headers)
        assert r.status_code == 200
        assert r.json()["email"] == "admin@manikganj.com"

    def test_me_without_token(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/auth/me")
        assert r.status_code == 401


# -------- Public collections --------
class TestPublicCollections:
    @pytest.mark.parametrize("col", PUBLIC_COLLECTIONS)
    def test_list_collection(self, api_client, base_url, col):
        r = api_client.get(f"{base_url}/api/public/{col}")
        assert r.status_code == 200, f"{col} -> {r.status_code} {r.text}"
        data = r.json()
        assert isinstance(data, list)
        for item in data:
            assert "_id" not in item, f"{col} contains _id"
            assert item.get("is_active", True) is True

    def test_seed_counts(self, api_client, base_url):
        services = api_client.get(f"{base_url}/api/public/services").json()
        upazilas = api_client.get(f"{base_url}/api/public/upazilas").json()
        e_services = api_client.get(f"{base_url}/api/public/e_services").json()
        assert len(services) >= 9, f"services has {len(services)}"
        assert len(upazilas) >= 7, f"upazilas has {len(upazilas)}"
        assert len(e_services) >= 5

    def test_dc_single(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/public/district_commissioner/single")
        assert r.status_code == 200
        data = r.json()
        assert "_id" not in data
        assert data.get("name")
        assert data.get("designation")

    def test_filter_by_upazila(self, api_client, base_url):
        r = api_client.get(
            f"{base_url}/api/public/police", params={"upazila": "শিবালয়"}
        )
        assert r.status_code == 200
        items = r.json()
        assert len(items) >= 1
        for it in items:
            assert it["upazila"] == "শিবালয়"

    def test_unknown_collection_404(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/public/unknown_xyz")
        assert r.status_code == 404


# -------- Public form submit --------
class TestPublicForms:
    def test_submit_complaint(self, api_client, base_url):
        r = api_client.post(
            f"{base_url}/api/public/complaints",
            json={
                "name": "TEST_complainer",
                "phone": "+8801711000999",
                "message": "TEST complaint",
                "type": "complaint",
            },
        )
        assert r.status_code == 200
        body = r.json()
        assert body["success"] is True
        assert body["id"]

    def test_submit_join_request(self, api_client, base_url):
        r = api_client.post(
            f"{base_url}/api/public/join_requests",
            json={
                "name": "TEST_partner",
                "phone": "+8801711000888",
                "category": "doctor",
                "address": "Manikganj",
                "note": "TEST",
            },
        )
        assert r.status_code == 200
        assert r.json()["success"] is True


# -------- Admin CRUD --------
class TestAdminCRUD:
    def test_admin_list_requires_auth(self, api_client, base_url):
        r = api_client.get(f"{base_url}/api/admin/notices")
        assert r.status_code == 401

    def test_admin_create_requires_auth(self, api_client, base_url):
        r = api_client.post(
            f"{base_url}/api/admin/notices",
            json={"text": "x", "is_active": True},
        )
        assert r.status_code == 401

    def test_admin_list_with_auth(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/admin/notices", headers=auth_headers)
        assert r.status_code == 200
        for it in r.json():
            assert "_id" not in it

    def test_full_crud_cycle(self, api_client, base_url, auth_headers):
        # CREATE
        c = api_client.post(
            f"{base_url}/api/admin/notices",
            json={"text": "TEST_notice_cycle", "order": 99, "is_active": True},
            headers=auth_headers,
        )
        assert c.status_code == 200, c.text
        item = c.json()
        assert item["id"] and "_id" not in item
        item_id = item["id"]

        # READ via public list (since is_active=True)
        listed = api_client.get(f"{base_url}/api/public/notices").json()
        assert any(n["id"] == item_id for n in listed)

        # UPDATE
        u = api_client.put(
            f"{base_url}/api/admin/notices/{item_id}",
            json={"text": "TEST_notice_updated", "is_active": True},
            headers=auth_headers,
        )
        assert u.status_code == 200
        assert u.json()["text"] == "TEST_notice_updated"

        # DELETE
        d = api_client.delete(
            f"{base_url}/api/admin/notices/{item_id}", headers=auth_headers
        )
        assert d.status_code == 200

        # Verify gone
        listed2 = api_client.get(f"{base_url}/api/public/notices").json()
        assert not any(n["id"] == item_id for n in listed2)

    def test_dc_upsert(self, api_client, base_url, auth_headers):
        # Get existing
        before = api_client.get(
            f"{base_url}/api/public/district_commissioner/single"
        ).json()
        original_name = before.get("name")

        new_payload = {
            "name": "TEST_DC_NAME",
            "designation": before.get("designation", "জেলা প্রশাসক"),
            "phone": before.get("phone", "+880170"),
            "image": before.get("image", ""),
            "is_active": True,
        }
        r = api_client.post(
            f"{base_url}/api/admin/district_commissioner/upsert",
            json=new_payload,
            headers=auth_headers,
        )
        assert r.status_code == 200
        assert r.json()["name"] == "TEST_DC_NAME"

        # Restore original
        if original_name:
            api_client.post(
                f"{base_url}/api/admin/district_commissioner/upsert",
                json={**new_payload, "name": original_name},
                headers=auth_headers,
            )

    def test_admin_unknown_collection(self, api_client, base_url, auth_headers):
        r = api_client.get(f"{base_url}/api/admin/unknown_xyz", headers=auth_headers)
        assert r.status_code == 404
