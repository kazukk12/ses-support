from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from ..models.employee import AvailabilityStatus, OneOnOneStatus

class SkillBase(BaseModel):
    name: str
    category: str

class SkillCreate(SkillBase):
    pass

class Skill(SkillBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class EmployeeSkill(BaseModel):
    skill_id: int
    skill_name: str
    skill_category: str
    level: int
    years_experience: int

    class Config:
        from_attributes = True

class ProjectBase(BaseModel):
    title: str
    role: str
    start_date: datetime
    end_date: Optional[datetime] = None
    description: Optional[str] = None
    tech_tags: Optional[str] = None
    phase_requirements: Optional[str] = None
    phase_design: Optional[str] = None
    phase_implementation: Optional[str] = None
    phase_testing: Optional[str] = None

class ProjectCreate(ProjectBase):
    employee_id: int

class ProjectUpdate(ProjectBase):
    title: Optional[str] = None
    role: Optional[str] = None
    start_date: Optional[datetime] = None

class Project(ProjectBase):
    id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AvailabilityBase(BaseModel):
    status: AvailabilityStatus
    available_from: Optional[datetime] = None
    memo: Optional[str] = None

class AvailabilityCreate(AvailabilityBase):
    employee_id: int

class AvailabilityUpdate(AvailabilityBase):
    status: Optional[AvailabilityStatus] = None

class Availability(AvailabilityBase):
    id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class OneOnOneBase(BaseModel):
    date: datetime
    memo: Optional[str] = None
    status: OneOnOneStatus = OneOnOneStatus.NORMAL

class OneOnOneCreate(OneOnOneBase):
    employee_id: int

class OneOnOneUpdate(OneOnOneBase):
    date: Optional[datetime] = None
    status: Optional[OneOnOneStatus] = None

class OneOnOne(OneOnOneBase):
    id: int
    employee_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class EmployeeBase(BaseModel):
    name: str
    years_experience: int
    main_role: str
    unit_price_min: Optional[int] = None
    unit_price_max: Optional[int] = None
    desired_career: Optional[str] = None

class EmployeeCreate(EmployeeBase):
    skills: Optional[List[dict]] = []

class EmployeeUpdate(EmployeeBase):
    name: Optional[str] = None
    years_experience: Optional[int] = None
    main_role: Optional[str] = None

class Employee(EmployeeBase):
    id: int
    created_at: datetime
    updated_at: datetime
    skills: List[EmployeeSkill] = []
    projects: List[Project] = []
    availability: Optional[Availability] = None
    one_on_ones: List[OneOnOne] = []

    class Config:
        from_attributes = True

class EmployeeList(BaseModel):
    id: int
    name: str
    years_experience: int
    main_role: str
    unit_price_min: Optional[int] = None
    unit_price_max: Optional[int] = None
    availability_status: Optional[AvailabilityStatus] = None
    main_skills: List[str] = []

    class Config:
        from_attributes = True

class EmployeeSearchFilters(BaseModel):
    skill_tags: Optional[List[str]] = None
    years_experience_min: Optional[int] = None
    years_experience_max: Optional[int] = None
    availability_status: Optional[List[AvailabilityStatus]] = None
    unit_price_min: Optional[int] = None
    unit_price_max: Optional[int] = None
    available_from: Optional[datetime] = None

class ProjectMatchingRequest(BaseModel):
    required_skills: List[str]
    preferred_skills: Optional[List[str]] = []
    required_phases: Optional[List[str]] = []
    start_date: Optional[datetime] = None
    unit_price_min: Optional[int] = None
    unit_price_max: Optional[int] = None

class ProjectMatchingResult(BaseModel):
    employee: EmployeeList
    score: float
    matching_skills: List[str] = []
    recent_projects: List[str] = []

    class Config:
        from_attributes = True