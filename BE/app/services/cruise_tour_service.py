from ..repositories.cruise_tour_repository import CruiseTourRepository

class CruiseTourService:
    def __init__(self, repository: CruiseTourRepository):
        self.repository = repository
    def list_tours(self):
        return self.repository.list()
