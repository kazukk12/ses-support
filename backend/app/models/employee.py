from sqlalchemy import Column, Integer, String, Text, DateTime, Enum, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..db.database import Base

class AvailabilityStatus(enum.Enum):
    WORKING = "working"
    AVAILABLE_NEXT_MONTH = "available_next_month"
    IMMEDIATELY_AVAILABLE = "immediately_available"

class OneOnOneStatus(enum.Enum):
    GOOD = "good"
    NORMAL = "normal"
    ATTENTION = "attention"

employee_skills = Table(
    'employee_skills',
    Base.metadata,
    Column('employee_id', Integer, ForeignKey('employees.id')),
    Column('skill_id', Integer, ForeignKey('skills.id')),
    Column('level', Integer),
    Column('years_experience', Integer)
)

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    years_experience = Column(Integer, nullable=False)
    main_role = Column(String(100), nullable=False)
    unit_price_min = Column(Integer, nullable=True)
    unit_price_max = Column(Integer, nullable=True)
    desired_career = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    skills = relationship("Skill", secondary=employee_skills, back_populates="employees")
    projects = relationship("Project", back_populates="employee")
    availability = relationship("Availability", back_populates="employee", uselist=False)
    one_on_ones = relationship("OneOnOne", back_populates="employee")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False, index=True)
    category = Column(String(50), nullable=False, index=True)
    created_at = Column(DateTime, server_default=func.now())

    employees = relationship("Employee", secondary=employee_skills, back_populates="skills")

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    title = Column(String(200), nullable=False)
    role = Column(String(100), nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=True)
    description = Column(Text, nullable=True)
    tech_tags = Column(Text, nullable=True)
    phase_requirements = Column(String(50), nullable=True)
    phase_design = Column(String(50), nullable=True)
    phase_implementation = Column(String(50), nullable=True)
    phase_testing = Column(String(50), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", back_populates="projects")

class Availability(Base):
    __tablename__ = "availability"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), unique=True, nullable=False)
    status = Column(Enum(AvailabilityStatus), nullable=False, default=AvailabilityStatus.WORKING)
    available_from = Column(DateTime, nullable=True)
    memo = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", back_populates="availability")

class OneOnOne(Base):
    __tablename__ = "one_on_ones"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id"), nullable=False)
    date = Column(DateTime, nullable=False)
    memo = Column(Text, nullable=True)
    status = Column(Enum(OneOnOneStatus), nullable=False, default=OneOnOneStatus.NORMAL)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    employee = relationship("Employee", back_populates="one_on_ones")