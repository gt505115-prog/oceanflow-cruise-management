from datetime import date, datetime, timezone, timedelta
from decimal import Decimal
from functools import wraps

from flask import Blueprint, jsonify, request, current_app
from sqlalchemy.exc import IntegrityError
from werkzeug.security import generate_password_hash, check_password_hash

import jwt

from .. import db
from ..domain.models import *


api = Blueprint('api', __name__)

# Mutating operational endpoints are restricted to staff/admin accounts.
@api.before_request
def protect_operational_writes():
    if request.method not in {'POST', 'PUT', 'PATCH', 'DELETE'}:
        return None
    if '/auth/' in request.path:
        return None
    if request.path.startswith('/api/v1/activity-registrations') or any(request.path.endswith(path) for path in ('/activity-registrations', '/excursion-registrations', '/feedback')):
        return None
    token = request.headers.get('Authorization', '').removeprefix('Bearer ').strip()
    if not token:
        return jsonify(error='authentication required'), 401
    try:
        claims = jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256'],
            options={'require': ['sub', 'roles', 'exp']}
        )
        if 'sub' in claims:
            claims['sub'] = str(claims['sub'])
        claims.setdefault('roles', [])
    except jwt.PyJWTError:
        return jsonify(error='invalid or expired token'), 401
    roles = {str(role).strip().lower() for role in claims.get('roles', [])}
    if request.path.endswith('/bookings'):
        if roles.intersection({'admin', 'staff', 'manager'}):
            return None
        if 'passenger' not in roles:
            return jsonify(error='permission denied'), 403
        try:
            user_id = int(claims.get('sub'))
            passenger_id = int(data().get('passenger_id'))
        except (TypeError, ValueError):
            return jsonify(error='valid passenger_id and cruise_tour_id are required'), 400
        passenger = Passenger.query.filter_by(user_id=user_id).first()
        if not passenger or passenger.id != passenger_id:
            return jsonify(error='passenger can only create a booking for their own profile'), 403
        return None
    if not roles.intersection({'admin', 'staff', 'manager'}):
        return jsonify(error='permission denied'), 403
    return None


def serialize(item):
    return {
        c.name: (
            getattr(item, c.name).isoformat()
            if hasattr(getattr(item, c.name), 'isoformat')
            else getattr(item, c.name)
        )
        for c in item.__table__.columns
    }


def data():
    value = request.get_json(silent=True)
    return value if isinstance(value, dict) else {}


def collection(model):
    return jsonify([
        serialize(x)
        for x in model.query.order_by(model.id.desc()).all()
    ])


# =========================================================
# CRUISE TOURS
# =========================================================

@api.get('/cruise-tours')
def tours():
    return collection(CruiseTour)


@api.post('/cruise-tours')
def create_tour():
    d = data()
    name = str(d.get('name', '')).strip()

    if not name:
        return jsonify(error='name is required'), 400

    try:
        start = (
            date.fromisoformat(d['start_date'])
            if d.get('start_date')
            else None
        )

        end = (
            date.fromisoformat(d['end_date'])
            if d.get('end_date')
            else None
        )

    except ValueError:
        return jsonify(
            error='dates must use ISO format YYYY-MM-DD'
        ), 400

    if start and end and end < start:
        return jsonify(
            error='end_date cannot be before start_date'
        ), 400

    x = CruiseTour(
        name=name,
        ship=d.get('ship'),
        start_date=start,
        end_date=end,
        status=d.get('status', 'planned')
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201

@api.put('/cruise-tours/<int:tour_id>')
def update_tour(tour_id):
    tour = CruiseTour.query.get(tour_id)
    if not tour:
        return jsonify(error='cruise tour was not found'), 404

    d = data()
    name = str(d.get('name', tour.name)).strip()
    if not name:
        return jsonify(error='name is required'), 400

    try:
        start = date.fromisoformat(d['start_date']) if d.get('start_date') else None
        end = date.fromisoformat(d['end_date']) if d.get('end_date') else None
    except (TypeError, ValueError):
        return jsonify(error='dates must use ISO format YYYY-MM-DD'), 400

    if start and end and end < start:
        return jsonify(error='end_date cannot be before start_date'), 400

    tour.name = name
    tour.ship = d.get('ship')
    tour.start_date = start
    tour.end_date = end
    if 'status' in d:
        tour.status = d.get('status')
    db.session.commit()
    return jsonify(serialize(tour))

def _delete_itinerary_tree(itinerary):
    """
    XÃ³a toÃ n bá»™ dá»¯ liá»‡u con cá»§a má»™t itinerary:
    itinerary days -> cruise stops -> shore excursions
    vÃ  cÃ¡c registration/group/assignment liÃªn quan.
    """

    days = ItineraryDay.query.filter_by(
        itinerary_id=itinerary.id
    ).all()

    for day in days:
        stops = CruiseStop.query.filter_by(
            itinerary_day_id=day.id
        ).all()

        for stop in stops:
            excursions = ShoreExcursion.query.filter_by(
                cruise_stop_id=stop.id
            ).all()

            for excursion in excursions:
                ExcursionRegistration.query.filter_by(
                    excursion_id=excursion.id
                ).delete(
                    synchronize_session=False
                )

                ExcursionAssignment.query.filter_by(
                    excursion_id=excursion.id
                ).delete(
                    synchronize_session=False
                )

                ExcursionGroup.query.filter_by(
                    excursion_id=excursion.id
                ).delete(
                    synchronize_session=False
                )

                db.session.delete(excursion)

            db.session.delete(stop)

        db.session.delete(day)

    db.session.delete(itinerary)

@api.delete('/itineraries/<int:itinerary_id>')
def delete_itinerary(itinerary_id):
    itinerary = Itinerary.query.get(itinerary_id)

    if not itinerary:
        return jsonify(
            error='itinerary was not found'
        ), 404

    _delete_itinerary_tree(itinerary)

    db.session.commit()

    return jsonify(
        message='itinerary deleted',
        id=itinerary_id
    ), 200


@api.delete('/cruise-tours/<int:tour_id>')
def delete_tour(tour_id):
    tour = CruiseTour.query.get(tour_id)

    if not tour:
        return jsonify(
            error='cruise tour was not found'
        ), 404

    if Booking.query.filter_by(
        cruise_tour_id=tour.id
    ).first():
        return jsonify(
            error='cannot delete a cruise tour that has bookings'
        ), 409

    itineraries = Itinerary.query.filter_by(
        cruise_tour_id=tour.id
    ).all()

    for itinerary in itineraries:
        _delete_itinerary_tree(itinerary)

    db.session.delete(tour)
    db.session.commit()

    return jsonify(
        message='cruise tour deleted',
        id=tour_id
    ), 200

# =========================================================
# ACTIVITIES
# =========================================================

@api.get('/activities')
def activities():
    return collection(Activity)


@api.get('/activity-schedules')
def schedules():
    result = []

    for x in ActivitySchedule.query.order_by(
        ActivitySchedule.starts_at
    ).all():

        item = serialize(x)

        item.update(
            activity_name=x.activity.name,
            activity_status=x.activity.status,
            registered_count=ActivityRegistration.query.filter_by(
                schedule_id=x.id,
                status='registered'
            ).count(),
            checked_in_count=ActivityCheckin.query.join(
                ActivityRegistration
            ).filter(
                ActivityRegistration.schedule_id == x.id
            ).count()
        )

        result.append(item)

    return jsonify(result)


@api.post('/activity-registrations')
def register():
    d = data()

    sid = d.get('schedule_id')
    pid = d.get('passenger_id')

    s = ActivitySchedule.query.get(sid) if sid else None

    if not s or not pid:
        return jsonify(
            error='valid schedule_id and passenger_id are required'
        ), 400

    if not Passenger.query.get(pid):
        return jsonify(error='passenger was not found'), 404

    if s.activity.status != 'active':
        return jsonify(
            error='cancelled activity cannot be registered'
        ), 409

    if ActivityRegistration.query.filter_by(
        schedule_id=sid,
        passenger_id=pid
    ).first():

        return jsonify(error='duplicate registration'), 409

    if ActivityRegistration.query.filter_by(
        schedule_id=sid,
        status='registered'
    ).count() >= s.capacity:

        return jsonify(error='activity capacity reached'), 409

    x = ActivityRegistration(
        schedule_id=sid,
        passenger_id=pid
    )

    db.session.add(x)

    try:
        db.session.commit()

    except IntegrityError:
        db.session.rollback()
        return jsonify(error='duplicate registration'), 409

    return jsonify(serialize(x)), 201


@api.post('/activity-checkins')
def checkin():
    d = data()

    rid = d.get('registration_id')
    r = ActivityRegistration.query.get(rid) if rid else None

    if not r:
        return jsonify(error='registration was not found'), 404

    if r.status != 'registered':
        return jsonify(
            error='passenger registration is not active'
        ), 409

    if ActivityCheckin.query.filter_by(
        registration_id=rid
    ).first():

        return jsonify(error='duplicate check-in'), 409

    x = ActivityCheckin(
        registration_id=rid,
        checked_in_at=datetime.now(timezone.utc)
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# AUTHENTICATION AND AUTHORIZATION
# =========================================================

def require_roles(*allowed):
    def decorator(view):
        @wraps(view)
        def wrapped(*args, **kwargs):
            token = request.headers.get(
                'Authorization',
                ''
            ).removeprefix('Bearer ').strip()

            if not token:
                return jsonify(
                    error='authentication required'
                ), 401

            try:
                claims = jwt.decode(
                    token,
                    current_app.config['SECRET_KEY'],
                    algorithms=['HS256']
                )

            except jwt.PyJWTError:
                return jsonify(
                    error='invalid or expired token'
                ), 401

            if allowed and not set(
                claims.get('roles', [])
            ).intersection(allowed):

                return jsonify(
                    error='permission denied'
                ), 403

            return view(*args, **kwargs)

        return wrapped

    return decorator


@api.post('/auth/register')
def register_user():
    d = data()

    username = str(
        d.get('username', d.get('email', ''))
    ).strip()

    password = d.get('password')

    # Frontend Ä‘ang gá»­i full_name
    full_name = str(
        d.get('full_name', '')
    ).strip()

    # Náº¿u frontend gá»­i riÃªng first_name / last_name thÃ¬ váº«n há»— trá»£
    first_name = str(
        d.get('first_name', '')
    ).strip()

    last_name = str(
        d.get('last_name', '')
    ).strip()

    # Tá»± tÃ¡ch há» tÃªn Ä‘áº§y Ä‘á»§ thÃ nh first_name vÃ  last_name
    if not first_name or not last_name:
        if full_name:
            name_parts = full_name.split(maxsplit=1)

            first_name = name_parts[0]

            if len(name_parts) > 1:
                last_name = name_parts[1]
            else:
                last_name = name_parts[0]

    # Kiá»ƒm tra dá»¯ liá»‡u tÃ i khoáº£n
    if (
        len(username) < 3
        or not isinstance(password, str)
        or len(password) < 8
    ):
        return jsonify(
            error=(
                'username or email and password '
                '(minimum 8 characters) are required'
            )
        ), 400

    if not first_name or not last_name:
        return jsonify(
            error='full_name or first_name and last_name are required'
        ), 400

    # Kiá»ƒm tra username Ä‘Ã£ tá»“n táº¡i
    if User.query.filter_by(
        username=username
    ).first():

        return jsonify(
            error='gmail already exists'
        ), 409

    # Máº·c Ä‘á»‹nh tÃ i khoáº£n Ä‘Äƒng kÃ½ lÃ  Passenger
    # Public registration must never allow privilege escalation.
    role_name = 'Passenger'

    role = Role.query.filter_by(
        name=role_name
    ).first()

    if not role:
        role = Role(
            name=role_name
        )

        db.session.add(role)
        db.session.flush()

    # Táº¡o User
    user = User(
        username=username,
        password_hash=generate_password_hash(password),
        roles=[role]
    )

    db.session.add(user)
    db.session.flush()

    # Táº¡o há»“ sÆ¡ Passenger liÃªn káº¿t vá»›i User
    passenger = Passenger(
        user_id=user.id,
        first_name=first_name,
        last_name=last_name,
        cabin=None,
        status='booked'
    )

    db.session.add(passenger)

    try:
        db.session.commit()

    except IntegrityError:
        db.session.rollback()

        return jsonify(
            error='could not create account'
        ), 409

    return jsonify(
        id=user.id,
        username=user.username,
        roles=[
            r.name
            for r in user.roles
        ],
        passenger_id=passenger.id
    ), 201


@api.post('/auth/login')
def login_user():
    d = data()

    username = str(
        d.get('username', '')
    ).strip()

    password = d.get('password', '')

    user = User.query.filter_by(
        username=username
    ).first()

    if not user or not check_password_hash(
        user.password_hash,
        password
    ):
        return jsonify(
            error='invalid credentials'
        ), 401

    passenger = Passenger.query.filter_by(
        user_id=user.id
    ).first()

    token = jwt.encode(
        {
            'sub': str(user.id),
            'exp': datetime.now(timezone.utc) + timedelta(hours=24),
            'roles': [
                r.name
                for r in user.roles
            ]
        },
        current_app.config['SECRET_KEY'],
        algorithm='HS256'
    )

    response_user = {
        'id': user.id,
        'username': user.username,
        'roles': [
            r.name
            for r in user.roles
        ]
    }

    if passenger:
        response_user['passenger_id'] = passenger.id
        response_user['first_name'] = passenger.first_name
        response_user['last_name'] = passenger.last_name

    return jsonify(
        token=token,
        user=response_user
    ), 200


# =========================================================
# CURRENT PASSENGER
# =========================================================

@api.get('/passengers/me')
@require_roles('Passenger')
def get_current_passenger():
    token = request.headers.get(
        'Authorization',
        ''
    ).removeprefix('Bearer ').strip()

    try:
        claims = jwt.decode(
            token,
            current_app.config['SECRET_KEY'],
            algorithms=['HS256']
        )

    except jwt.PyJWTError:
        return jsonify(
            error='invalid or expired token'
        ), 401

    try:
        user_id = int(claims.get('sub'))
    except (TypeError, ValueError):
        return jsonify(error='invalid token subject'), 401
    passenger = Passenger.query.filter_by(user_id=user_id).first()

    if not passenger:
        return jsonify(
            error='passenger profile was not found'
        ), 404

    return jsonify(serialize(passenger))

def _current_passenger_id():
    token = request.headers.get('Authorization', '').removeprefix('Bearer ').strip()
    claims = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=['HS256'])
    return int(claims['sub'])

@api.get('/passengers/me/activity-registrations')
@require_roles('Passenger')
def my_activity_registrations():
    pid = _current_passenger_id()
    return jsonify([serialize(x) for x in ActivityRegistration.query.filter_by(passenger_id=pid).order_by(ActivityRegistration.id.desc()).all()])

@api.delete('/activity-registrations/<int:registration_id>')
def cancel_activity_registration(registration_id):
    pid = _current_passenger_id()
    registration = db.session.get(ActivityRegistration, registration_id)
    if not registration:
        return jsonify(error='registration was not found'), 404
    if registration.passenger_id != pid:
        return jsonify(error='passenger can only cancel their own registration'), 403
    if registration.status != 'registered':
        return jsonify(error='passenger registration is not active'), 409
    db.session.delete(registration)
    db.session.commit()
    return jsonify(message='activity registration cancelled', id=registration_id)


@api.get('/passengers/me/excursion-registrations')
@require_roles('Passenger')
def my_excursion_registrations():
    pid = _current_passenger_id()
    return jsonify([serialize(x) for x in ExcursionRegistration.query.filter_by(passenger_id=pid).order_by(ExcursionRegistration.id.desc()).all()])


# =========================================================
# SIMPLE COLLECTION APIs
# =========================================================

def simple_collection(name, model):
    def list_items():
        return collection(model)

    list_items.__name__ = f'list_{name}'

    api.add_url_rule(
        f'/{name}',
        view_func=list_items,
        methods=['GET']
    )


for _name, _model in [
    ('ports', Port),
    ('itineraries', Itinerary),
    ('itinerary-days', ItineraryDay),
    ('cruise-stops', CruiseStop),
    ('cabins', Cabin),
    ('bookings', Booking),
    ('tour-providers', TourProvider),
    ('shore-excursions', ShoreExcursion),
    ('onboard-services', OnboardService),
    ('products', Product),
    ('onboard-accounts', OnboardAccount),
    ('expenses', Expense),
    ('notifications', Notification),
    ('feedback', Feedback),
    ('audit-logs', AuditLog),
    ('system-logs', SystemLog),
    ('offline-operations', OfflineOperation),
    ('sync-batches', SyncBatch)
]:
    simple_collection(_name, _model)


for _name, _model in [
    ('service-orders', ServiceOrder),
    ('pos-transactions', PosTransaction),
    ('account-entries', AccountEntry),
    ('refunds', Refund),
    ('voids', Void),
    ('settlements', Settlement),
    ('payments', Payment),
    ('invoices', Invoice),
    ('transaction-reconciliations', TransactionReconciliation)
]:
    simple_collection(_name, _model)


# =========================================================
# PASSENGERS
# =========================================================

@api.get('/passengers')
def passengers():
    return collection(Passenger)


@api.post('/passengers')
def create_passenger():
    d = data()

    first = str(
        d.get('first_name', '')
    ).strip()

    last = str(
        d.get('last_name', '')
    ).strip()

    if not first or not last:
        return jsonify(
            error='first_name and last_name are required'
        ), 400

    x = Passenger(
        first_name=first,
        last_name=last,
        cabin=d.get('cabin'),
        status=d.get('status', 'booked')
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# ACTIVITIES MANAGEMENT
# =========================================================

@api.post('/activities')
def create_activity():
    d = data()

    name = str(
        d.get('name', '')
    ).strip()

    if not name:
        return jsonify(
            error='name is required'
        ), 400

    x = Activity(
        name=name,
        description=d.get('description'),
        status=d.get('status', 'active')
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201

@api.put('/activities/<int:activity_id>')
@require_roles('Admin', 'Staff', 'Manager')
def update_activity(activity_id):
    x = db.session.get(Activity, activity_id)
    if not x:
        return jsonify(error='activity was not found'), 404
    d = data()
    if 'name' in d:
        name = str(d['name']).strip()
        if not name:
            return jsonify(error='name is required'), 400
        x.name = name
    if 'description' in d: x.description = d['description']
    if 'status' in d: x.status = d['status']
    db.session.commit()
    return jsonify(serialize(x))

@api.delete('/activities/<int:activity_id>')
@require_roles('Admin', 'Staff', 'Manager')
def delete_activity(activity_id):
    x = db.session.get(Activity, activity_id)
    if not x:
        return jsonify(error='activity was not found'), 404
    if ActivitySchedule.query.filter_by(activity_id=activity_id).first():
        return jsonify(error='cannot delete activity with schedules'), 409
    db.session.delete(x); db.session.commit()
    return jsonify(message='activity deleted', id=activity_id)


@api.post('/activity-schedules')
def create_schedule():
    d = data()

    activity = Activity.query.get(
        d.get('activity_id')
    )

    if not activity:
        return jsonify(
            error='activity was not found'
        ), 404

    try:
        starts = datetime.fromisoformat(
            d['starts_at'].replace('Z', '+00:00')
        )

        capacity = int(
            d['capacity']
        )

    except (
        KeyError,
        TypeError,
        ValueError
    ):
        return jsonify(
            error='starts_at and positive capacity are required'
        ), 400

    if capacity <= 0:
        return jsonify(
            error='capacity must be positive'
        ), 400

    x = ActivitySchedule(
        activity_id=activity.id,
        starts_at=starts,
        location=str(d.get('location', '')).strip() or None,
        capacity=capacity
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


@api.post('/excursion-registrations')
def register_excursion():
    d = data()

    e = ShoreExcursion.query.get(
        d.get('excursion_id')
    )

    pid = d.get('passenger_id')

    if not e or not Passenger.query.get(pid):
        return jsonify(
            error='valid excursion and passenger are required'
        ), 400

    # A passenger may only register for an excursion belonging to a cruise
    # tour they have a confirmed booking on. Ownership is derived through
    # excursion -> cruise_stop -> itinerary_day -> itinerary -> cruise_tour.
    stop = e.stop
    cruise_tour_id = None
    if stop and stop.day and stop.day.itinerary:
        cruise_tour_id = stop.day.itinerary.cruise_tour_id
    if cruise_tour_id is not None:
        owns_tour = Booking.query.filter_by(
            passenger_id=pid,
            cruise_tour_id=cruise_tour_id,
            status='confirmed'
        ).first()
        if not owns_tour:
            return jsonify(
                error='passenger has no confirmed booking for this excursion tour'
            ), 403
    else:
        return jsonify(
            error='excursion is not linked to a cruise tour'
        ), 409

    if e.status in (
        'cancelled',
        'completed'
    ):
        return jsonify(
            error='excursion is not accepting registrations'
        ), 409

    if ExcursionRegistration.query.filter_by(
        excursion_id=e.id,
        passenger_id=pid
    ).first():

        return jsonify(
            error='duplicate registration'
        ), 409

    if ExcursionRegistration.query.filter_by(
        excursion_id=e.id,
        status='registered'
    ).count() >= e.capacity:

        return jsonify(
            error='excursion capacity reached'
        ), 409

    x = ExcursionRegistration(
        excursion_id=e.id,
        passenger_id=pid
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201

@api.put('/excursions/<int:excursion_id>')
@require_roles('Admin', 'Staff', 'Manager')
def update_excursion(excursion_id):
    x = db.session.get(ShoreExcursion, excursion_id)
    if not x: return jsonify(error='excursion was not found'), 404
    d = data()
    for field in ('name', 'status'):
        if field in d:
            value = str(d[field]).strip()
            if field == 'name' and not value: return jsonify(error='name is required'), 400
            setattr(x, field, value)
    if 'capacity' in d:
        try: x.capacity = int(d['capacity'])
        except (TypeError, ValueError): return jsonify(error='capacity must be positive'), 400
        if x.capacity <= 0: return jsonify(error='capacity must be positive'), 400
    if 'price' in d: x.price = Decimal(str(d['price']))
    db.session.commit(); return jsonify(serialize(x))

@api.delete('/excursions/<int:excursion_id>')
@require_roles('Admin', 'Staff', 'Manager')
def delete_excursion(excursion_id):
    x = db.session.get(ShoreExcursion, excursion_id)
    if not x: return jsonify(error='excursion was not found'), 404
    if ExcursionRegistration.query.filter_by(excursion_id=excursion_id).first():
        return jsonify(error='cannot delete excursion with registrations'), 409
    db.session.delete(x); db.session.commit(); return jsonify(message='excursion deleted', id=excursion_id)


# =========================================================
# OFFLINE SYNC
# =========================================================

@api.post('/offline/sync')
def sync_operations():
    d = data()

    device = str(
        d.get('device_id', '')
    ).strip()

    operations = d.get(
        'operations',
        []
    )

    if not device or not isinstance(
        operations,
        list
    ):
        return jsonify(
            error='device_id and operations are required'
        ), 400

    results = []

    for op in operations:
        key = str(
            op.get('idempotency_key', '')
        ).strip()

        if not key or not op.get(
            'operation_type'
        ):
            results.append({
                'status': 'rejected',
                'error': (
                    'idempotency_key and '
                    'operation_type required'
                )
            })

            continue

        existing = OfflineOperation.query.filter_by(
            device_id=device,
            idempotency_key=key
        ).first()

        if existing:
            results.append({
                'id': existing.id,
                'status': 'duplicate',
                'operation_id': existing.id
            })

            continue

        x = OfflineOperation(
            device_id=device,
            idempotency_key=key,
            operation_type=op['operation_type'],
            payload=op.get('payload', {}),
            status='accepted'
        )

        db.session.add(x)
        db.session.flush()

        results.append({
            'id': x.id,
            'status': 'accepted'
        })

    db.session.commit()

    return jsonify(
        device_id=device,
        results=results
    ), 200


# =========================================================
# SERVICE ORDERS
# =========================================================

@api.post('/service-orders')
def create_service_order():
    d = data()

    pid = d.get('passenger_id')
    aid = d.get('account_id')

    # If an onboard account is provided, ensure it belongs to a confirmed
    # booking of this passenger and to the tour being ordered against.
    if pid is not None and aid is not None:
        acct = OnboardAccount.query.get(aid)
        if acct is not None and acct.passenger_id != pid:
            return jsonify(error='account does not belong to this passenger'), 403
        booking_id = acct.booking_id if acct else None
        if booking_id:
            b = Booking.query.get(booking_id)
            if b and b.passenger_id != pid:
                return jsonify(error='account does not belong to this passenger'), 403

    items = d.get('items', [])

    if (
        not pid
        or not aid
        or not isinstance(items, list)
        or not items
    ):
        return jsonify(
            error=(
                'passenger_id, account_id '
                'and items are required'
            )
        ), 400

    if (
        not Passenger.query.get(pid)
        or not OnboardAccount.query.get(aid)
    ):
        return jsonify(
            error='passenger or account not found'
        ), 404

    total = Decimal('0')

    order = ServiceOrder(
        passenger_id=pid,
        account_id=aid,
        status='requested',
        total=0
    )

    db.session.add(order)
    db.session.flush()

    for item in items:
        product = (
            Product.query.get(item.get('product_id'))
            if item.get('product_id')
            else None
        )

        service = (
            OnboardService.query.get(item.get('service_id'))
            if item.get('service_id')
            else None
        )

        obj = product or service

        if not obj:
            db.session.rollback()
            return jsonify(
                error=(
                    'each item must reference '
                    'a valid product or service'
                )
            ), 404

        qty = int(
            item.get('quantity', 1)
        )

        if qty <= 0:
            db.session.rollback()
            return jsonify(
                error='quantity must be positive'
            ), 400

        price = Decimal(
            str(
                item.get(
                    'unit_price',
                    obj.price or 0
                )
            )
        )

        total += price * qty

        db.session.add(
            ServiceOrderItem(
                order_id=order.id,
                product_id=product.id if product else None,
                service_id=service.id if service else None,
                quantity=qty,
                unit_price=price
            )
        )

    order.total = total

    db.session.commit()

    return jsonify(serialize(order)), 201


# =========================================================
# POS TRANSACTIONS
# =========================================================

@api.post('/pos-transactions')
def create_pos_transaction():
    d = data()

    device = str(
        d.get('device_id', '')
    ).strip()

    key = str(
        d.get('idempotency_key', '')
    ).strip()

    aid = d.get('account_id')
    items = d.get('items', [])

    if not device or not key or not aid or not items:
        return jsonify(
            error=(
                'device_id, idempotency_key, '
                'account_id and items are required'
            )
        ), 400

    existing = PosTransaction.query.filter_by(
        idempotency_key=key
    ).first()

    if existing:
        return jsonify(serialize(existing)), 200

    account = OnboardAccount.query.get(aid)

    if not account:
        return jsonify(
            error='account was not found'
        ), 404

    total = Decimal('0')

    tx = PosTransaction(
        device_id=device,
        idempotency_key=key,
        account_id=aid,
        total=0
    )

    db.session.add(tx)
    db.session.flush()

    for item in items:
        product = (
            Product.query.get(item.get('product_id'))
            if item.get('product_id')
            else None
        )

        service = (
            OnboardService.query.get(item.get('service_id'))
            if item.get('service_id')
            else None
        )

        obj = product or service

        if not obj:
            db.session.rollback()
            return jsonify(
                error='item not found'
            ), 404

        qty = int(
            item.get('quantity', 1)
        )

        price = Decimal(
            str(obj.price or 0)
        )

        total += price * qty

        db.session.add(
            PosTransactionItem(
                transaction_id=tx.id,
                product_id=product.id if product else None,
                service_id=service.id if service else None,
                quantity=qty,
                unit_price=price
            )
        )

    tx.total = total

    if total > 0:
        account.balance = (
            Decimal(str(account.balance or 0))
            + total
        )

        db.session.add(
            AccountEntry(
                account_id=aid,
                entry_type='charge',
                amount=total,
                reference_type='pos_transaction',
                reference_id=tx.id
            )
        )

    db.session.commit()

    return jsonify(serialize(tx)), 201


# =========================================================
# SETTLEMENTS
# =========================================================

@api.post('/settlements')
def settle_account():
    d = data()

    aid = d.get('account_id')

    account = (
        OnboardAccount.query.get(aid)
        if aid
        else None
    )

    if not account:
        return jsonify(
            error='account was not found'
        ), 404

    amount = Decimal(
        str(
            d.get(
                'amount',
                account.balance or 0
            )
        )
    )

    if (
        amount <= 0
        or amount > Decimal(
            str(account.balance or 0)
        )
    ):
        return jsonify(
            error='settlement amount exceeds outstanding balance'
        ), 409

    account.balance = (
        Decimal(str(account.balance))
        - amount
    )

    x = Settlement(
        account_id=aid,
        amount=amount,
        status='finalized'
    )

    db.session.add(x)

    db.session.add(
        AccountEntry(
            account_id=aid,
            entry_type='payment',
            amount=amount,
            reference_type='settlement'
        )
    )

    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# FEEDBACK
# =========================================================

@api.post('/feedback')
def create_feedback():
    d = data()

    pid = d.get('passenger_id')
    rating = int(
        d.get('rating', 0)
    )

    if (
        not Passenger.query.get(pid)
        or rating not in range(1, 6)
    ):
        return jsonify(
            error=(
                'passenger_id and rating '
                'from 1 to 5 are required'
            )
        ), 400

    x = Feedback(
        passenger_id=pid,
        subject_type=d.get(
            'subject_type',
            'cruise'
        ),
        subject_id=d.get('subject_id'),
        rating=rating,
        comment=d.get('comment')
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# ITINERARIES
# =========================================================

@api.post('/itineraries')
def create_itinerary():
    d = data()

    tour = CruiseTour.query.get(
        d.get('cruise_tour_id')
    )

    name = str(
        d.get('name', '')
    ).strip()

    if not tour or not name:
        return jsonify(
            error='cruise_tour_id and name are required'
        ), 400

    x = Itinerary(
        cruise_tour_id=tour.id,
        name=name
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


@api.post('/itinerary-days')
def create_itinerary_day():
    d = data()

    itinerary = Itinerary.query.get(
        d.get('itinerary_id')
    )

    if not itinerary:
        return jsonify(
            error='itinerary was not found'
        ), 404

    try:
        day_number = int(
            d['day_number']
        )

        service_date = date.fromisoformat(
            d['service_date']
        )

    except (
        KeyError,
        TypeError,
        ValueError
    ):
        return jsonify(
            error=(
                'day_number and ISO '
                'service_date are required'
            )
        ), 400

    if day_number < 1:
        return jsonify(
            error='day_number must be positive'
        ), 400

    if ItineraryDay.query.filter_by(
        itinerary_id=itinerary.id,
        day_number=day_number
    ).first():

        return jsonify(
            error='duplicate itinerary day'
        ), 409

    x = ItineraryDay(
        itinerary_id=itinerary.id,
        day_number=day_number,
        service_date=service_date
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# PORTS
# =========================================================

@api.post('/ports')
def create_port():
    d = data()

    code = str(
        d.get('code', '')
    ).strip()

    name = str(
        d.get('name', '')
    ).strip()

    if not code or not name:
        return jsonify(
            error='code and name are required'
        ), 400

    if Port.query.filter_by(
        code=code
    ).first():

        return jsonify(
            error='port code already exists'
        ), 409

    x = Port(
        code=code,
        name=name,
        country=d.get('country')
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# CRUISE STOPS
# =========================================================

@api.post('/cruise-stops')
def create_stop():
    d = data()

    day = ItineraryDay.query.get(
        d.get('itinerary_day_id')
    )

    port = Port.query.get(
        d.get('port_id')
    )

    if not day or not port:
        return jsonify(
            error=(
                'valid itinerary_day_id '
                'and port_id are required'
            )
        ), 400

    try:
        arrival = (
            datetime.fromisoformat(
                d['arrival_at'].replace('Z', '+00:00')
            )
            if d.get('arrival_at')
            else None
        )

        departure = (
            datetime.fromisoformat(
                d['departure_at'].replace('Z', '+00:00')
            )
            if d.get('departure_at')
            else None
        )

    except ValueError:
        return jsonify(
            error='times must use ISO format'
        ), 400

    if arrival and departure and departure < arrival:
        return jsonify(
            error='departure cannot precede arrival'
        ), 400

    x = CruiseStop(
        itinerary_day_id=day.id,
        port_id=port.id,
        arrival_at=arrival,
        departure_at=departure
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# BOOKINGS
# =========================================================

@api.post('/bookings')
def create_booking():
    d = data()

    pid = d.get('passenger_id')
    tid = d.get('cruise_tour_id')

    passenger = Passenger.query.get(pid)
    tour = CruiseTour.query.get(tid)

    if not passenger or not tour:
        return jsonify(
            error=(
                'valid passenger_id '
                'and cruise_tour_id are required'
            )
        ), 400

    if Booking.query.filter_by(
        passenger_id=pid,
        cruise_tour_id=tid,
        status='confirmed'
    ).first():

        return jsonify(
            error=(
                'passenger already has a '
                'confirmed booking for this tour'
            )
        ), 409

    cabin_id = d.get('cabin_id')

    if cabin_id and not Cabin.query.get(cabin_id):
        return jsonify(
            error='cabin was not found'
        ), 404

    year = datetime.now(
        timezone.utc
    ).year

    prefix = f'OF-{year}-'

    for _ in range(5):
        existing = Booking.query.filter(
            Booking.reference.like(
                f'{prefix}%'
            )
        ).all()

        sequence = max([
            int(
                item.reference[len(prefix):]
            )
            for item in existing
            if (
                item.reference.startswith(prefix)
                and item.reference[len(prefix):].isdigit()
            )
        ] or [0]) + 1

        reference = f'{prefix}{sequence:04d}'

        x = Booking(
            reference=reference,
            passenger_id=pid,
            cruise_tour_id=tid,
            cabin_id=cabin_id,
            status='confirmed'
        )

        db.session.add(x)

        try:
            db.session.commit()
            return jsonify(serialize(x)), 201

        except IntegrityError:
            db.session.rollback()

    return jsonify(
        error='could not generate a unique booking reference'
    ), 409


@api.put('/bookings/<int:booking_id>')
def update_booking_status(booking_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        return jsonify(error='booking was not found'), 404

    requested_status = data().get('status')
    allowed_statuses = {'confirmed', 'cancelled', 'completed'}
    if requested_status not in allowed_statuses:
        return jsonify(error='status must be confirmed, cancelled, or completed'), 400

    booking.status = requested_status
    db.session.commit()
    return jsonify(serialize(booking))
# =========================================================
# SHORE EXCURSIONS
# =========================================================

@api.post('/shore-excursions')
def create_excursion():
    d = data()

    stop = CruiseStop.query.get(
        d.get('cruise_stop_id')
    )

    provider = TourProvider.query.get(
        d.get('provider_id')
    )

    name = str(
        d.get('name', '')
    ).strip()

    try:
        capacity = int(
            d.get('capacity')
        )

        price = Decimal(
            str(
                d.get('price', 0)
            )
        )

    except (
        TypeError,
        ValueError
    ):
        return jsonify(
            error='capacity and price are required'
        ), 400

    if (
        not stop
        or not provider
        or not name
        or capacity <= 0
        or price < 0
    ):
        return jsonify(
            error=(
                'valid stop, provider, name, '
                'capacity and price are required'
            )
        ), 400

    x = ShoreExcursion(
        cruise_stop_id=stop.id,
        provider_id=provider.id,
        name=name,
        capacity=capacity,
        price=price,
        status=d.get(
            'status',
            'scheduled'
        )
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# REFUNDS
# =========================================================

@api.post('/refunds')
def refund_transaction():
    d = data()

    tx = PosTransaction.query.get(
        d.get('transaction_id')
    )

    if not tx:
        return jsonify(
            error='transaction was not found'
        ), 404

    amount = Decimal(
        str(
            d.get(
                'amount',
                tx.total
            )
        )
    )

    already = sum(
        (
            r.amount
            for r in Refund.query.filter_by(
                transaction_id=tx.id
            ).all()
        ),
        Decimal('0')
    )

    if (
        amount <= 0
        or already + amount > Decimal(
            str(tx.total)
        )
    ):
        return jsonify(
            error='refund exceeds transaction total'
        ), 409

    account = OnboardAccount.query.get(
        tx.account_id
    )

    account.balance = (
        Decimal(str(account.balance))
        - amount
    )

    x = Refund(
        transaction_id=tx.id,
        amount=amount,
        reason=str(
            d.get(
                'reason',
                'Customer refund'
            )
        )
    )

    db.session.add(x)

    db.session.add(
        AccountEntry(
            account_id=account.id,
            entry_type='refund',
            amount=amount,
            reference_type='refund'
        )
    )

    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# VOID TRANSACTIONS
# =========================================================

@api.post('/voids')
def void_transaction():
    d = data()

    tx = PosTransaction.query.get(
        d.get('transaction_id')
    )

    if not tx:
        return jsonify(
            error='transaction was not found'
        ), 404

    if Void.query.filter_by(
        transaction_id=tx.id
    ).first():

        return jsonify(
            error='transaction already voided'
        ), 409

    tx.status = 'voided'

    account = OnboardAccount.query.get(
        tx.account_id
    )

    account.balance = (
        Decimal(str(account.balance))
        - Decimal(str(tx.total))
    )

    x = Void(
        transaction_id=tx.id,
        reason=str(
            d.get(
                'reason',
                'Void requested'
            )
        )
    )

    db.session.add(x)

    db.session.add(
        AccountEntry(
            account_id=account.id,
            entry_type='void',
            amount=tx.total,
            reference_type='void'
        )
    )

    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# PAYMENTS
# =========================================================

@api.post('/payments')
def create_payment():
    d = data()

    account = OnboardAccount.query.get(
        d.get('account_id')
    )

    try:
        amount = Decimal(
            str(
                d.get('amount')
            )
        )

    except (
        TypeError,
        ValueError
    ):
        amount = Decimal('0')

    if not account or amount <= 0:
        return jsonify(
            error=(
                'valid account_id '
                'and positive amount are required'
            )
        ), 400

    account.balance = max(
        Decimal('0'),
        Decimal(str(account.balance))
        - amount
    )

    x = Payment(
        account_id=account.id,
        amount=amount,
        method=str(
            d.get(
                'method',
                'unspecified'
            )
        ),
        reference=d.get('reference')
    )

    db.session.add(x)

    db.session.add(
        AccountEntry(
            account_id=account.id,
            entry_type='payment',
            amount=amount,
            reference_type='payment'
        )
    )

    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# INVOICES
# =========================================================

@api.post('/invoices')
def create_invoice():
    d = data()

    account = OnboardAccount.query.get(
        d.get('account_id')
    )

    number = str(
        d.get('number', '')
    ).strip()

    if not account or not number:
        return jsonify(
            error='account_id and number are required'
        ), 400

    if Invoice.query.filter_by(
        number=number
    ).first():

        return jsonify(
            error='invoice number already exists'
        ), 409

    x = Invoice(
        account_id=account.id,
        number=number,
        total=Decimal(
            str(
                account.balance or 0
            )
        )
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# TRANSACTION RECONCILIATIONS
# =========================================================

@api.post('/transaction-reconciliations')
def reconcile_transaction():
    d = data()

    tx = PosTransaction.query.get(
        d.get('transaction_id')
    )

    if not tx:
        return jsonify(
            error='transaction was not found'
        ), 404

    x = TransactionReconciliation(
        transaction_id=tx.id,
        status=d.get(
            'status',
            'reconciled'
        ),
        notes=d.get('notes'),
        reconciled_at=datetime.utcnow()
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# CABINS
# =========================================================

@api.post('/cabins')
def create_cabin():
    d = data()

    number = str(
        d.get('number', '')
    ).strip()

    if not number:
        return jsonify(
            error='number is required'
        ), 400

    if Cabin.query.filter_by(
        number=number
    ).first():

        return jsonify(
            error='cabin already exists'
        ), 409

    x = Cabin(
        number=number,
        deck=d.get('deck')
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# TOUR PROVIDERS
# =========================================================

@api.post('/tour-providers')
def create_provider():
    d = data()

    name = str(
        d.get('name', '')
    ).strip()

    if not name:
        return jsonify(
            error='name is required'
        ), 400

    x = TourProvider(
        name=name,
        contact=d.get('contact')
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# ONBOARD SERVICES
# =========================================================

@api.post('/onboard-services')
def create_service():
    d = data()

    name = str(
        d.get('name', '')
    ).strip()

    if not name:
        return jsonify(
            error='name is required'
        ), 400

    x = OnboardService(
        name=name,
        description=d.get('description'),
        price=Decimal(
            str(
                d.get(
                    'price',
                    0
                )
            )
        ),
        included=bool(
            d.get(
                'included',
                False
            )
        )
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# PRODUCTS
# =========================================================

@api.post('/products')
def create_product():
    d = data()

    sku = str(
        d.get('sku', '')
    ).strip()

    name = str(
        d.get('name', '')
    ).strip()

    if not sku or not name:
        return jsonify(
            error='sku and name are required'
        ), 400

    if Product.query.filter_by(
        sku=sku
    ).first():

        return jsonify(
            error='sku already exists'
        ), 409

    x = Product(
        sku=sku,
        name=name,
        price=Decimal(
            str(
                d.get(
                    'price',
                    0
                )
            )
        ),
        active=True
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# ONBOARD ACCOUNTS
# =========================================================

@api.post('/onboard-accounts')
def create_account():
    d = data()

    pid = d.get(
        'passenger_id'
    )

    if not Passenger.query.get(pid):
        return jsonify(
            error='passenger was not found'
        ), 404

    x = OnboardAccount(
        passenger_id=pid,
        booking_id=d.get('booking_id'),
        currency=d.get(
            'currency',
            'USD'
        ),
        balance=0,
        status='open'
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# NOTIFICATIONS
# =========================================================

@api.post('/notifications')
def create_notification():
    d = data()

    title = str(
        d.get('title', '')
    ).strip()

    message = str(
        d.get('message', '')
    ).strip()

    if not title or not message:
        return jsonify(
            error='title and message are required'
        ), 400

    x = Notification(
        passenger_id=d.get('passenger_id'),
        title=title,
        message=message
    )

    db.session.add(x)
    db.session.commit()

    return jsonify(serialize(x)), 201


# =========================================================
# =========================================================
# ADMIN CRUD COMPLETION
# =========================================================
def _decimal_field(value, field, minimum=Decimal('0')):
    try:
        result = Decimal(str(value))
    except (TypeError, ValueError, ArithmeticError):
        return None, f'{field} must be a number'
    if result < minimum:
        return None, f'{field} must be at least {minimum}'
    return result, None

@api.put('/ports/<int:port_id>')
@require_roles('Admin', 'Staff', 'Manager')
def update_port(port_id):
    item = db.session.get(Port, port_id)
    if not item:
        return jsonify(error='port was not found'), 404
    d = data()
    code = str(d.get('code', item.code)).strip()
    name = str(d.get('name', item.name)).strip()
    if not code or not name:
        return jsonify(error='code and name are required'), 400
    duplicate = Port.query.filter(Port.code == code, Port.id != port_id).first()
    if duplicate:
        return jsonify(error='port code already exists'), 409
    item.code, item.name = code, name
    if 'country' in d:
        item.country = d['country']
    db.session.commit()
    return jsonify(serialize(item))

@api.delete('/ports/<int:port_id>')
@require_roles('Admin', 'Staff', 'Manager')
def delete_port(port_id):
    item = db.session.get(Port, port_id)
    if not item:
        return jsonify(error='port was not found'), 404
    if CruiseStop.query.filter_by(port_id=port_id).first():
        return jsonify(error='cannot delete a port referenced by cruise stops'), 409
    db.session.delete(item)
    db.session.commit()
    return jsonify(message='port deleted', id=port_id)

@api.put('/onboard-services/<int:service_id>')
@require_roles('Admin', 'Staff', 'Manager')
def update_service(service_id):
    item = db.session.get(OnboardService, service_id)
    if not item:
        return jsonify(error='service was not found'), 404
    d = data()
    if 'name' in d:
        item.name = str(d['name']).strip()
        if not item.name:
            return jsonify(error='name is required'), 400
    if 'description' in d: item.description = d['description']
    if 'included' in d: item.included = bool(d['included'])
    if 'status' in d: item.status = str(d['status']).strip()
    if 'price' in d:
        price, error = _decimal_field(d['price'], 'price')
        if error: return jsonify(error=error), 400
        item.price = price
    db.session.commit()
    return jsonify(serialize(item))

@api.delete('/onboard-services/<int:service_id>')
@require_roles('Admin', 'Staff', 'Manager')
def delete_service(service_id):
    item = db.session.get(OnboardService, service_id)
    if not item:
        return jsonify(error='service was not found'), 404
    if ServiceOrderItem.query.filter_by(service_id=service_id).first() or PosTransactionItem.query.filter_by(service_id=service_id).first():
        return jsonify(error='cannot delete a service referenced by orders or transactions'), 409
    db.session.delete(item)
    db.session.commit()
    return jsonify(message='service deleted', id=service_id)

# Keep the canonical shore-excursions resource consistent for all methods.
@api.put('/shore-excursions/<int:excursion_id>')
@require_roles('Admin', 'Staff', 'Manager')
def update_shore_excursion(excursion_id):
    return update_excursion(excursion_id)

@api.delete('/shore-excursions/<int:excursion_id>')
@require_roles('Admin', 'Staff', 'Manager')
def delete_shore_excursion(excursion_id):
    return delete_excursion(excursion_id)

# OPERATIONS SUMMARY
# =========================================================

@api.get('/operations/summary')
def operations_summary():
    return jsonify({
        'tours': CruiseTour.query.count(),
        'passengers': Passenger.query.count(),
        'bookings': Booking.query.count(),
        'activities': Activity.query.count(),
        'schedules': ActivitySchedule.query.count(),
        'registrations': ActivityRegistration.query.filter_by(
            status='registered'
        ).count(),
        'checkins': ActivityCheckin.query.count(),
        'excursions': ShoreExcursion.query.count(),
        'excursion_registrations': ExcursionRegistration.query.filter_by(
            status='registered'
        ).count(),
        'service_orders': ServiceOrder.query.count(),
        'pos_transactions': PosTransaction.query.count(),
        'outstanding_balance': str(
            sum(
                (
                    a.balance or 0
                    for a in OnboardAccount.query.all()
                ),
                Decimal('0')
            )
        )
    })



