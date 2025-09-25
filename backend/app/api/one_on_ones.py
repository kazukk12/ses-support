from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, extract
from typing import List
from datetime import datetime, date
from ..db.database import get_db
from ..models.employee import OneOnOne, Employee
from ..schemas.employee import OneOnOne as OneOnOneSchema, OneOnOneCreate, OneOnOneUpdate

router = APIRouter()

@router.get("/")
def get_one_on_ones(
    skip: int = 0,
    limit: int = 100,
    employee_id: int = None,
    year: int = None,
    month: int = None,
    db: Session = Depends(get_db)
):
    query = db.query(OneOnOne).options(joinedload(OneOnOne.employee))

    if employee_id:
        query = query.filter(OneOnOne.employee_id == employee_id)

    if year:
        query = query.filter(extract('year', OneOnOne.date) == year)

    if month:
        query = query.filter(extract('month', OneOnOne.date) == month)

    one_on_ones = query.order_by(OneOnOne.date.desc()).offset(skip).limit(limit).all()

    # 各1on1記録に社員名を追加
    result = []
    for one_on_one in one_on_ones:
        result.append({
            "id": one_on_one.id,
            "employee_id": one_on_one.employee_id,
            "employee_name": one_on_one.employee.name if one_on_one.employee else '',
            "date": one_on_one.date,
            "memo": one_on_one.memo,
            "status": one_on_one.status,
            "created_at": one_on_one.created_at,
            "updated_at": one_on_one.updated_at
        })

    return result

@router.get("/{one_on_one_id}", response_model=OneOnOneSchema)
def get_one_on_one(one_on_one_id: int, db: Session = Depends(get_db)):
    one_on_one = db.query(OneOnOne).filter(OneOnOne.id == one_on_one_id).first()
    if one_on_one is None:
        raise HTTPException(status_code=404, detail="One-on-one record not found")
    return one_on_one

@router.post("/", response_model=OneOnOneSchema)
def create_one_on_one(one_on_one: OneOnOneCreate, db: Session = Depends(get_db)):
    employee = db.query(Employee).filter(Employee.id == one_on_one.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    db_one_on_one = OneOnOne(**one_on_one.model_dump())
    db.add(db_one_on_one)
    db.commit()
    db.refresh(db_one_on_one)
    return db_one_on_one

@router.put("/{one_on_one_id}", response_model=OneOnOneSchema)
def update_one_on_one(
    one_on_one_id: int,
    one_on_one_update: OneOnOneUpdate,
    db: Session = Depends(get_db)
):
    db_one_on_one = db.query(OneOnOne).filter(OneOnOne.id == one_on_one_id).first()
    if db_one_on_one is None:
        raise HTTPException(status_code=404, detail="One-on-one record not found")

    for field, value in one_on_one_update.model_dump(exclude_unset=True).items():
        setattr(db_one_on_one, field, value)

    db.commit()
    db.refresh(db_one_on_one)
    return db_one_on_one

@router.delete("/{one_on_one_id}")
def delete_one_on_one(one_on_one_id: int, db: Session = Depends(get_db)):
    db_one_on_one = db.query(OneOnOne).filter(OneOnOne.id == one_on_one_id).first()
    if db_one_on_one is None:
        raise HTTPException(status_code=404, detail="One-on-one record not found")

    db.delete(db_one_on_one)
    db.commit()
    return {"message": "One-on-one record deleted successfully"}

@router.get("/stats/completion-rate")
def get_completion_rate(
    year: int = None,
    month: int = None,
    db: Session = Depends(get_db)
):
    current_date = date.today()
    target_year = year or current_date.year
    target_month = month or current_date.month

    total_employees = db.query(Employee).count()

    completed_one_on_ones = db.query(OneOnOne.employee_id.distinct()).filter(
        extract('year', OneOnOne.date) == target_year,
        extract('month', OneOnOne.date) == target_month
    ).count()

    completion_rate = (completed_one_on_ones / total_employees * 100) if total_employees > 0 else 0

    return {
        "year": target_year,
        "month": target_month,
        "total_employees": total_employees,
        "completed_one_on_ones": completed_one_on_ones,
        "completion_rate": round(completion_rate, 2)
    }