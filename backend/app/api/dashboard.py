from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, extract, and_, or_
from typing import List, Dict
from datetime import datetime, date
from ..db.database import get_db
from ..models.employee import Employee, Skill, Availability, OneOnOne, AvailabilityStatus, OneOnOneStatus

router = APIRouter()

@router.get("/stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    total_employees = db.query(Employee).count()

    next_month_available = db.query(Availability).filter(
        or_(
            Availability.status == AvailabilityStatus.AVAILABLE_NEXT_MONTH,
            Availability.status == AvailabilityStatus.IMMEDIATELY_AVAILABLE
        )
    ).count()

    current_date = date.today()
    one_on_one_completion = db.query(OneOnOne.employee_id.distinct()).filter(
        extract('year', OneOnOne.date) == current_date.year,
        extract('month', OneOnOne.date) == current_date.month
    ).count()

    completion_rate = (one_on_one_completion / total_employees * 100) if total_employees > 0 else 0

    attention_count = db.query(OneOnOne).filter(
        OneOnOne.status == OneOnOneStatus.ATTENTION,
        extract('year', OneOnOne.date) == current_date.year,
        extract('month', OneOnOne.date) == current_date.month
    ).count()

    return {
        "total_employees": total_employees,
        "next_month_available": next_month_available,
        "one_on_one_completion_rate": round(completion_rate, 2),
        "attention_employees": attention_count
    }

@router.get("/skill-distribution")
def get_skill_distribution(db: Session = Depends(get_db)):
    skill_counts = db.query(
        Skill.category,
        func.count(Employee.id).label('count')
    ).join(
        Employee.skills
    ).group_by(Skill.category).all()

    return [{"category": category, "count": count} for category, count in skill_counts]

@router.get("/skill-distribution/{category}")
def get_detailed_skill_distribution(category: str, db: Session = Depends(get_db)):
    skill_details = db.query(
        Skill.name,
        func.count(Employee.id).label('count')
    ).join(
        Employee.skills
    ).filter(
        Skill.category == category
    ).group_by(Skill.name).all()

    return [{"name": name, "count": count} for name, count in skill_details]

@router.get("/availability-status")
def get_availability_status(db: Session = Depends(get_db)):
    availability_counts = db.query(
        Availability.status,
        func.count(Availability.id).label('count')
    ).group_by(Availability.status).all()

    total_with_availability = sum([count for _, count in availability_counts])
    total_employees = db.query(Employee).count()
    no_status_count = total_employees - total_with_availability

    result = [{"status": status.value, "count": count} for status, count in availability_counts]
    if no_status_count > 0:
        result.append({"status": "no_status", "count": no_status_count})

    return result

@router.get("/recent-one-on-ones")
def get_recent_one_on_ones(limit: int = 10, db: Session = Depends(get_db)):
    recent_one_on_ones = db.query(OneOnOne).options(
        joinedload(OneOnOne.employee)
    ).order_by(OneOnOne.date.desc()).limit(limit).all()

    return [
        {
            "id": ono.id,
            "employee_name": ono.employee.name,
            "date": ono.date,
            "status": ono.status.value,
            "memo": ono.memo
        }
        for ono in recent_one_on_ones
    ]