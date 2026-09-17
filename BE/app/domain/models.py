from datetime import datetime
from .. import db

class User(db.Model):
    __tablename__='users'; id=db.Column(db.Integer,primary_key=True); username=db.Column(db.String(120),unique=True,nullable=False); password_hash=db.Column(db.String(255),nullable=False); is_active=db.Column(db.Boolean,nullable=False,default=True); roles=db.relationship('Role',secondary='user_roles',backref='users')
class Role(db.Model):
    __tablename__='roles'; id=db.Column(db.Integer,primary_key=True); name=db.Column(db.String(80),unique=True,nullable=False)
class Permission(db.Model):
    __tablename__='permissions'; id=db.Column(db.Integer,primary_key=True); name=db.Column(db.String(120),unique=True,nullable=False)
class UserRole(db.Model):
    __tablename__='user_roles'; user_id=db.Column(db.Integer,db.ForeignKey('users.id'),primary_key=True); role_id=db.Column(db.Integer,db.ForeignKey('roles.id'),primary_key=True)
class IdentityCredential(db.Model):
    __tablename__='identity_credentials'; id=db.Column(db.Integer,primary_key=True); passenger_id=db.Column(db.Integer,db.ForeignKey('passengers.id'),nullable=False); credential_type=db.Column(db.String(20),nullable=False); credential_hash=db.Column(db.String(255),unique=True,nullable=False); active=db.Column(db.Boolean,default=True)
class PassengerCard(db.Model):
    __tablename__='passenger_cards'; id=db.Column(db.Integer,primary_key=True); passenger_id=db.Column(db.Integer,db.ForeignKey('passengers.id'),nullable=False); card_number=db.Column(db.String(120),unique=True,nullable=False); status=db.Column(db.String(30),default='active')
class PassengerDevice(db.Model):
    __tablename__='passenger_devices'; id=db.Column(db.Integer,primary_key=True); device_id=db.Column(db.String(120),unique=True,nullable=False); device_type=db.Column(db.String(40),nullable=False); last_seen_at=db.Column(db.DateTime)
class Port(db.Model):
    __tablename__='ports'; id=db.Column(db.Integer,primary_key=True); code=db.Column(db.String(20),unique=True,nullable=False); name=db.Column(db.String(160),nullable=False); country=db.Column(db.String(100))
class Itinerary(db.Model):
    __tablename__='itineraries'; id=db.Column(db.Integer,primary_key=True); cruise_tour_id=db.Column(db.Integer,db.ForeignKey('cruise_tours.id'),nullable=False); name=db.Column(db.String(160),nullable=False); tour=db.relationship('CruiseTour')
class ItineraryDay(db.Model):
    __tablename__='itinerary_days'; id=db.Column(db.Integer,primary_key=True); itinerary_id=db.Column(db.Integer,db.ForeignKey('itineraries.id'),nullable=False); day_number=db.Column(db.Integer,nullable=False); service_date=db.Column(db.Date,nullable=False); itinerary=db.relationship('Itinerary')
class CruiseStop(db.Model):
    __tablename__='cruise_stops'; id=db.Column(db.Integer,primary_key=True); itinerary_day_id=db.Column(db.Integer,db.ForeignKey('itinerary_days.id'),nullable=False); port_id=db.Column(db.Integer,db.ForeignKey('ports.id'),nullable=False); arrival_at=db.Column(db.DateTime); departure_at=db.Column(db.DateTime); day=db.relationship('ItineraryDay'); port=db.relationship('Port')
class Cabin(db.Model):
    __tablename__='cabins'; id=db.Column(db.Integer,primary_key=True); number=db.Column(db.String(30),unique=True,nullable=False); deck=db.Column(db.String(30))
class Booking(db.Model):
    __tablename__='bookings'; id=db.Column(db.Integer,primary_key=True); reference=db.Column(db.String(60),unique=True,nullable=False); passenger_id=db.Column(db.Integer,db.ForeignKey('passengers.id'),nullable=False); cruise_tour_id=db.Column(db.Integer,db.ForeignKey('cruise_tours.id'),nullable=False); cabin_id=db.Column(db.Integer,db.ForeignKey('cabins.id')); status=db.Column(db.String(30),default='confirmed'); passenger=db.relationship('Passenger'); tour=db.relationship('CruiseTour'); cabin=db.relationship('Cabin')
class OnboardAccount(db.Model):
    __tablename__='onboard_accounts'; id=db.Column(db.Integer,primary_key=True); passenger_id=db.Column(db.Integer,db.ForeignKey('passengers.id'),nullable=False); booking_id=db.Column(db.Integer,db.ForeignKey('bookings.id')); currency=db.Column(db.String(3),default='USD'); balance=db.Column(db.Numeric(12,2),default=0); status=db.Column(db.String(30),default='open')
class TourProvider(db.Model):
    __tablename__='tour_providers'; id=db.Column(db.Integer,primary_key=True); name=db.Column(db.String(160),nullable=False); contact=db.Column(db.String(160))
class ShoreExcursion(db.Model):
    __tablename__='shore_excursions'; id=db.Column(db.Integer,primary_key=True); cruise_stop_id=db.Column(db.Integer,db.ForeignKey('cruise_stops.id'),nullable=False); provider_id=db.Column(db.Integer,db.ForeignKey('tour_providers.id'),nullable=False); name=db.Column(db.String(160),nullable=False); capacity=db.Column(db.Integer,nullable=False); price=db.Column(db.Numeric(12,2),nullable=False); status=db.Column(db.String(30),default='scheduled'); stop=db.relationship('CruiseStop'); provider=db.relationship('TourProvider')
class ExcursionRegistration(db.Model):
    __tablename__='excursion_registrations'; id=db.Column(db.Integer,primary_key=True); excursion_id=db.Column(db.Integer,db.ForeignKey('shore_excursions.id'),nullable=False); passenger_id=db.Column(db.Integer,db.ForeignKey('passengers.id'),nullable=False); status=db.Column(db.String(30),default='registered'); excursion=db.relationship('ShoreExcursion')
class OnboardService(db.Model):
    __tablename__='onboard_services'; id=db.Column(db.Integer,primary_key=True); name=db.Column(db.String(160),nullable=False); description=db.Column(db.Text); price=db.Column(db.Numeric(12,2),nullable=False); included=db.Column(db.Boolean,default=False); status=db.Column(db.String(30),default='available')
class Product(db.Model):
    __tablename__='products'; id=db.Column(db.Integer,primary_key=True); sku=db.Column(db.String(80),unique=True,nullable=False); name=db.Column(db.String(160),nullable=False); price=db.Column(db.Numeric(12,2),nullable=False); active=db.Column(db.Boolean,default=True)
class ServiceOrder(db.Model):
    __tablename__='service_orders'; id=db.Column(db.Integer,primary_key=True); passenger_id=db.Column(db.Integer,db.ForeignKey('passengers.id'),nullable=False); account_id=db.Column(db.Integer,db.ForeignKey('onboard_accounts.id'),nullable=False); status=db.Column(db.String(30),default='requested'); total=db.Column(db.Numeric(12,2),default=0)
class ServiceOrderItem(db.Model):
    __tablename__='service_order_items'; id=db.Column(db.Integer,primary_key=True); order_id=db.Column(db.Integer,db.ForeignKey('service_orders.id'),nullable=False); service_id=db.Column(db.Integer,db.ForeignKey('onboard_services.id')); product_id=db.Column(db.Integer,db.ForeignKey('products.id')); quantity=db.Column(db.Integer,nullable=False); unit_price=db.Column(db.Numeric(12,2),nullable=False)
class PosTransaction(db.Model):
    __tablename__='pos_transactions'; id=db.Column(db.Integer,primary_key=True); idempotency_key=db.Column(db.String(120),unique=True,nullable=False); device_id=db.Column(db.String(120),nullable=False); account_id=db.Column(db.Integer,db.ForeignKey('onboard_accounts.id'),nullable=False); total=db.Column(db.Numeric(12,2),nullable=False); status=db.Column(db.String(30),default='posted'); created_at=db.Column(db.DateTime,default=datetime.utcnow)
class PosTransactionItem(db.Model):
    __tablename__='pos_transaction_items'; id=db.Column(db.Integer,primary_key=True); transaction_id=db.Column(db.Integer,db.ForeignKey('pos_transactions.id'),nullable=False); product_id=db.Column(db.Integer,db.ForeignKey('products.id')); service_id=db.Column(db.Integer,db.ForeignKey('onboard_services.id')); quantity=db.Column(db.Integer,nullable=False); unit_price=db.Column(db.Numeric(12,2),nullable=False)
class AccountEntry(db.Model):
    __tablename__='account_entries'; id=db.Column(db.Integer,primary_key=True); account_id=db.Column(db.Integer,db.ForeignKey('onboard_accounts.id'),nullable=False); entry_type=db.Column(db.String(30),nullable=False); amount=db.Column(db.Numeric(12,2),nullable=False); reference_type=db.Column(db.String(40)); reference_id=db.Column(db.Integer); created_at=db.Column(db.DateTime,default=datetime.utcnow)
class Expense(db.Model):
    __tablename__='expenses'; id=db.Column(db.Integer,primary_key=True); description=db.Column(db.String(255),nullable=False); amount=db.Column(db.Numeric(12,2),nullable=False); status=db.Column(db.String(30),default='pending')
class Refund(db.Model):
    __tablename__='refunds'; id=db.Column(db.Integer,primary_key=True); transaction_id=db.Column(db.Integer,db.ForeignKey('pos_transactions.id'),nullable=False); amount=db.Column(db.Numeric(12,2),nullable=False); reason=db.Column(db.String(255),nullable=False); created_at=db.Column(db.DateTime,default=datetime.utcnow)
class Void(db.Model):
    __tablename__='voids'; id=db.Column(db.Integer,primary_key=True); transaction_id=db.Column(db.Integer,db.ForeignKey('pos_transactions.id'),nullable=False); reason=db.Column(db.String(255),nullable=False); created_at=db.Column(db.DateTime,default=datetime.utcnow)
class Settlement(db.Model):
    __tablename__='settlements'; id=db.Column(db.Integer,primary_key=True); account_id=db.Column(db.Integer,db.ForeignKey('onboard_accounts.id'),nullable=False); amount=db.Column(db.Numeric(12,2),nullable=False); status=db.Column(db.String(30),default='finalized'); created_at=db.Column(db.DateTime,default=datetime.utcnow)
class Notification(db.Model):
    __tablename__='notifications'; id=db.Column(db.Integer,primary_key=True); passenger_id=db.Column(db.Integer,db.ForeignKey('passengers.id')); title=db.Column(db.String(160),nullable=False); message=db.Column(db.Text,nullable=False); read_at=db.Column(db.DateTime)
class Feedback(db.Model):
    __tablename__='feedback'; id=db.Column(db.Integer,primary_key=True); passenger_id=db.Column(db.Integer,db.ForeignKey('passengers.id'),nullable=False); subject_type=db.Column(db.String(40),nullable=False); subject_id=db.Column(db.Integer); rating=db.Column(db.Integer,nullable=False); comment=db.Column(db.Text)
class AuditLog(db.Model):
    __tablename__='audit_logs'; id=db.Column(db.Integer,primary_key=True); actor_user_id=db.Column(db.Integer,db.ForeignKey('users.id')); action=db.Column(db.String(120),nullable=False); entity_type=db.Column(db.String(80),nullable=False); entity_id=db.Column(db.Integer); created_at=db.Column(db.DateTime,default=datetime.utcnow)
class OfflineOperation(db.Model):
    __tablename__='offline_operations'; id=db.Column(db.Integer,primary_key=True); device_id=db.Column(db.String(120),nullable=False); idempotency_key=db.Column(db.String(120),nullable=False); operation_type=db.Column(db.String(80),nullable=False); payload=db.Column(db.JSON,nullable=False); status=db.Column(db.String(30),default='pending'); error=db.Column(db.Text); created_at=db.Column(db.DateTime,default=datetime.utcnow); __table_args__=(db.UniqueConstraint('device_id','idempotency_key',name='uq_offline_device_key'),)
class SyncBatch(db.Model):
    __tablename__='sync_batches'; id=db.Column(db.Integer,primary_key=True); device_id=db.Column(db.String(120),nullable=False); status=db.Column(db.String(30),default='received'); created_at=db.Column(db.DateTime,default=datetime.utcnow)
class SystemLog(db.Model):
    __tablename__='system_logs'; id=db.Column(db.Integer,primary_key=True); level=db.Column(db.String(20),nullable=False); message=db.Column(db.String(255),nullable=False); created_at=db.Column(db.DateTime,default=datetime.utcnow)

class CruiseTour(db.Model):
    __tablename__='cruise_tours'
    id=db.Column(db.Integer,primary_key=True); name=db.Column(db.String(160),nullable=False); ship=db.Column(db.String(120)); start_date=db.Column(db.Date); end_date=db.Column(db.Date); status=db.Column(db.String(30),default='planned')
class Activity(db.Model):
    __tablename__='activities'
    id=db.Column(db.Integer,primary_key=True); name=db.Column(db.String(160),nullable=False); description=db.Column(db.Text); status=db.Column(db.String(30),default='active')
class ActivitySchedule(db.Model):
    __tablename__='activity_schedules'
    id=db.Column(db.Integer,primary_key=True); activity_id=db.Column(db.Integer,db.ForeignKey('activities.id'),nullable=False); starts_at=db.Column(db.DateTime,nullable=False); ends_at=db.Column(db.DateTime); location=db.Column(db.String(160)); capacity=db.Column(db.Integer,nullable=False); fee=db.Column(db.Numeric(12,2),default=0); activity=db.relationship('Activity')
class Passenger(db.Model):
    __tablename__ = 'passengers'

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    user_id = db.Column(
        db.Integer,
        db.ForeignKey('users.id'),
        unique=True,
        nullable=True
    )

    first_name = db.Column(
        db.String(100),
        nullable=False
    )

    last_name = db.Column(
        db.String(100),
        nullable=False
    )

    cabin = db.Column(
        db.String(30)
    )

    status = db.Column(
        db.String(30),
        default='booked'
    )

    user = db.relationship(
        'User',
        backref=db.backref(
            'passenger_profile',
            uselist=False
        )
    )
class ActivityRegistration(db.Model):
    __tablename__='activity_registrations'
    id=db.Column(db.Integer,primary_key=True); schedule_id=db.Column(db.Integer,db.ForeignKey('activity_schedules.id'),nullable=False); passenger_id=db.Column(db.Integer,db.ForeignKey('passengers.id'),nullable=False); status=db.Column(db.String(30),default='registered'); registered_at=db.Column(db.DateTime,default=datetime.utcnow); __table_args__=(db.UniqueConstraint('schedule_id','passenger_id',name='uq_activity_registration'),)
class ActivityCheckin(db.Model):
    __tablename__='activity_checkins'
    id=db.Column(db.Integer,primary_key=True); registration_id=db.Column(db.Integer,db.ForeignKey('activity_registrations.id'),nullable=False,unique=True); checked_in_at=db.Column(db.DateTime,default=datetime.utcnow); method=db.Column(db.String(30),default='manual')

class ExcursionGroup(db.Model):
    __tablename__='excursion_groups'; id=db.Column(db.Integer,primary_key=True); excursion_id=db.Column(db.Integer,db.ForeignKey('shore_excursions.id'),nullable=False); name=db.Column(db.String(120),nullable=False); capacity=db.Column(db.Integer,nullable=False,default=1); status=db.Column(db.String(30),default='planned')
class Vehicle(db.Model):
    __tablename__='vehicles'; id=db.Column(db.Integer,primary_key=True); registration=db.Column(db.String(80),unique=True,nullable=False); capacity=db.Column(db.Integer,nullable=False); status=db.Column(db.String(30),default='available')
class TourGuide(db.Model):
    __tablename__='tour_guides'; id=db.Column(db.Integer,primary_key=True); name=db.Column(db.String(160),nullable=False); language=db.Column(db.String(80)); phone=db.Column(db.String(50))
class ExcursionAssignment(db.Model):
    __tablename__='excursion_assignments'; id=db.Column(db.Integer,primary_key=True); excursion_id=db.Column(db.Integer,db.ForeignKey('shore_excursions.id'),nullable=False); group_id=db.Column(db.Integer,db.ForeignKey('excursion_groups.id')); vehicle_id=db.Column(db.Integer,db.ForeignKey('vehicles.id')); guide_id=db.Column(db.Integer,db.ForeignKey('tour_guides.id')); status=db.Column(db.String(30),default='assigned')
class TransactionReconciliation(db.Model):
    __tablename__='transaction_reconciliations'; id=db.Column(db.Integer,primary_key=True); transaction_id=db.Column(db.Integer,db.ForeignKey('pos_transactions.id'),nullable=False); status=db.Column(db.String(30),default='pending'); notes=db.Column(db.Text); reconciled_at=db.Column(db.DateTime)
class Payment(db.Model):
    __tablename__='payments'; id=db.Column(db.Integer,primary_key=True); account_id=db.Column(db.Integer,db.ForeignKey('onboard_accounts.id'),nullable=False); amount=db.Column(db.Numeric(12,2),nullable=False); method=db.Column(db.String(40),nullable=False); reference=db.Column(db.String(120)); created_at=db.Column(db.DateTime,default=datetime.utcnow)
class Invoice(db.Model):
    __tablename__='invoices'; id=db.Column(db.Integer,primary_key=True); account_id=db.Column(db.Integer,db.ForeignKey('onboard_accounts.id'),nullable=False); number=db.Column(db.String(80),unique=True,nullable=False); total=db.Column(db.Numeric(12,2),nullable=False); status=db.Column(db.String(30),default='issued'); issued_at=db.Column(db.DateTime,default=datetime.utcnow)
class PassengerLocation(db.Model):
    __tablename__='passenger_locations'; id=db.Column(db.Integer,primary_key=True); passenger_id=db.Column(db.Integer,db.ForeignKey('passengers.id'),nullable=False); area=db.Column(db.String(120),nullable=False); recorded_at=db.Column(db.DateTime,default=datetime.utcnow)
