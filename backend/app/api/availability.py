from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db.database import get_db
from ..models.employee import Availability
from ..schemas.employee import Availability as AvailabilitySchema, AvailabilityCreate, AvailabilityUpdate

router = APIRouter()

@router.get("/", response_model=List[AvailabilitySchema])
def get_availability(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    availability = db.query(Availability).offset(skip).limit(limit).all()
    return availability

@router.get("/{employee_id}", response_model=AvailabilitySchema)
def get_employee_availability(employee_id: int, db: Session = Depends(get_db)):
    availability = db.query(Availability).filter(Availability.employee_id == employee_id).first()
    if availability is None:
        raise HTTPException(status_code=404, detail="Availability not found")
    return availability

@router.post("/", response_model=AvailabilitySchema)
def create_availability(availability: AvailabilityCreate, db: Session = Depends(get_db)):
    existing = db.query(Availability).filter(Availability.employee_id == availability.employee_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Availability already exists for this employee")

    db_availability = Availability(**availability.model_dump())
    db.add(db_availability)
    db.commit()
    db.refresh(db_availability)
    return db_availability

@router.put("/{employee_id}", response_model=AvailabilitySchema)
def update_availability(
    employee_id: int,
    availability_update: AvailabilityUpdate,
    db: Session = Depends(get_db)
):
    db_availability = db.query(Availability).filter(Availability.employee_id == employee_id).first()
    if db_availability is None:
        raise HTTPException(status_code=404, detail="Availability not found")

    for field, value in availability_update.model_dump(exclude_unset=True).items():
        setattr(db_availability, field, value)

    db.commit()
    db.refresh(db_availability)
    return db_availability

@router.delete("/{employee_id}")
def delete_availability(employee_id: int, db: Session = Depends(get_db)):
    db_availability = db.query(Availability).filter(Availability.employee_id == employee_id).first()
    if db_availability is None:
        raise HTTPException(status_code=404, detail="Availability not found")

    db.delete(db_availability)
    db.commit()
    return {"message": "Availability deleted successfully"}