from abc import ABC, abstractmethod
class CruiseRepository(ABC):
    @abstractmethod
    def list(self): ...
