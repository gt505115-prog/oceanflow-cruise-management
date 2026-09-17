from dataclasses import dataclass
from typing import Optional
from ..domain.models import CruiseTour

@dataclass
class CruiseTourRepository:
    session: object
    def list(self):
        return CruiseTour.query.order_by(CruiseTour.start_date.asc(), CruiseTour.id.asc()).all()
    def get(self, tour_id: int) -> Optional[CruiseTour]:
        return CruiseTour.query.get(tour_id)
