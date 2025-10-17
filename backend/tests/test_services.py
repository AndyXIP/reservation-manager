from datetime import datetime, timedelta

from app.schemas.organization import OrganizationCreate
from app.schemas.reservation import ReservationCreate
from app.schemas.resource import ResourceCreate, ResourceUpdate
from app.services import organization_service, reservation_service, resource_service


def test_service_crud_and_conflict(db_session):
    # Create org
    org = organization_service.create_organization(db_session, OrganizationCreate(name="Test Org"))
    assert org.id is not None

    # Create resource
    res = resource_service.create_resource(
        db_session,
        ResourceCreate(organization_id=org.id, name="Room 1", type="room", capacity=10),
    )
    assert res.id is not None

    # Create reservation
    now = datetime.now()
    rev = reservation_service.create_reservation(
        db_session,
        ReservationCreate(
            resource_id=res.id,
            start_time=now + timedelta(hours=1),
            end_time=now + timedelta(hours=2),
            guest_last_name="Smith",
            guest_first_name="Jane",
            guest_contact="jane@example.com",
        ),
    )
    assert rev.id is not None

    # Conflict attempt
    try:
        reservation_service.create_reservation(
            db_session,
            ReservationCreate(
                resource_id=res.id,
                start_time=now + timedelta(hours=1, minutes=30),
                end_time=now + timedelta(hours=2, minutes=30),
                guest_last_name="Jones",
            ),
        )
        assert False, "Expected conflict ValueError"
    except ValueError:
        pass

    # Update resource
    updated = resource_service.update_resource(db_session, res, ResourceUpdate(capacity=12))
    assert updated.capacity == 12

    # Cancel reservation
    cancelled = reservation_service.cancel_reservation(db_session, rev)
    assert cancelled.status == "cancelled"
