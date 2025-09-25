from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_
from typing import List, Optional
from ..db.database import get_db
from ..models.employee import Employee, Skill, employee_skills, Availability
from ..schemas.employee import (
    Employee as EmployeeSchema,
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeList,
    EmployeeSearchFilters,
    ProjectMatchingRequest,
    ProjectMatchingResult
)

router = APIRouter()

@router.get("/", response_model=List[EmployeeList])
def get_employees(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    employees = db.query(Employee).options(
        joinedload(Employee.availability),
        joinedload(Employee.skills)
    ).offset(skip).limit(limit).all()

    result = []
    for emp in employees:
        main_skills = [skill.name for skill in emp.skills[:3]]
        result.append(EmployeeList(
            id=emp.id,
            name=emp.name,
            years_experience=emp.years_experience,
            main_role=emp.main_role,
            unit_price_min=emp.unit_price_min,
            unit_price_max=emp.unit_price_max,
            availability_status=emp.availability.status.value.lower() if emp.availability else None,
            main_skills=main_skills
        ))
    return result

@router.get("/search", response_model=List[EmployeeList])
def search_employees(
    skill_tags: Optional[str] = Query(None, description="Comma-separated skill names"),
    years_experience_min: Optional[int] = None,
    years_experience_max: Optional[int] = None,
    availability_status: Optional[str] = Query(None, description="Comma-separated availability status"),
    unit_price_min: Optional[int] = None,
    unit_price_max: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Employee).options(
        joinedload(Employee.availability),
        joinedload(Employee.skills)
    )

    if skill_tags:
        skill_list = [s.strip() for s in skill_tags.split(',')]
        query = query.join(Employee.skills).filter(Skill.name.in_(skill_list))

    if years_experience_min:
        query = query.filter(Employee.years_experience >= years_experience_min)

    if years_experience_max:
        query = query.filter(Employee.years_experience <= years_experience_max)

    if unit_price_min:
        query = query.filter(Employee.unit_price_min >= unit_price_min)

    if unit_price_max:
        query = query.filter(Employee.unit_price_max <= unit_price_max)

    if availability_status:
        status_list = [s.strip() for s in availability_status.split(',')]
        query = query.join(Employee.availability).filter(Availability.status.in_(status_list))

    employees = query.distinct().all()

    result = []
    for emp in employees:
        main_skills = [skill.name for skill in emp.skills[:3]]
        result.append(EmployeeList(
            id=emp.id,
            name=emp.name,
            years_experience=emp.years_experience,
            main_role=emp.main_role,
            unit_price_min=emp.unit_price_min,
            unit_price_max=emp.unit_price_max,
            availability_status=emp.availability.status.value.lower() if emp.availability else None,
            main_skills=main_skills
        ))
    return result

@router.get("/{employee_id}", response_model=EmployeeSchema)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    employee = db.query(Employee).options(
        joinedload(Employee.projects),
        joinedload(Employee.availability),
        joinedload(Employee.one_on_ones)
    ).filter(Employee.id == employee_id).first()

    if employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    # スキル情報を取得（level と years_experience を含む）
    from ..models.employee import employee_skills, Skill
    skills_data = db.query(
        employee_skills.c.skill_id,
        Skill.name.label('skill_name'),
        Skill.category.label('skill_category'),
        employee_skills.c.level,
        employee_skills.c.years_experience
    ).join(
        Skill, employee_skills.c.skill_id == Skill.id
    ).filter(
        employee_skills.c.employee_id == employee_id
    ).all()

    # EmployeeSkillの形式でスキルデータを作成
    skills = []
    for skill_data in skills_data:
        skills.append({
            'skill_id': skill_data.skill_id,
            'skill_name': skill_data.skill_name,
            'skill_category': skill_data.skill_category,
            'level': skill_data.level,
            'years_experience': skill_data.years_experience
        })

    # レスポンス用の辞書を作成
    response_data = {
        'id': employee.id,
        'name': employee.name,
        'years_experience': employee.years_experience,
        'main_role': employee.main_role,
        'unit_price_min': employee.unit_price_min,
        'unit_price_max': employee.unit_price_max,
        'desired_career': employee.desired_career,
        'created_at': employee.created_at,
        'updated_at': employee.updated_at,
        'skills': skills,
        'projects': employee.projects,
        'availability': employee.availability,
        'one_on_ones': employee.one_on_ones
    }

    return response_data

@router.post("/", response_model=EmployeeSchema)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    db_employee = Employee(
        name=employee.name,
        years_experience=employee.years_experience,
        main_role=employee.main_role,
        unit_price_min=employee.unit_price_min,
        unit_price_max=employee.unit_price_max,
        desired_career=employee.desired_career
    )
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.put("/{employee_id}", response_model=EmployeeSchema)
def update_employee(
    employee_id: int,
    employee_update: EmployeeUpdate,
    db: Session = Depends(get_db)
):
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    for field, value in employee_update.model_dump(exclude_unset=True).items():
        setattr(db_employee, field, value)

    db.commit()
    db.refresh(db_employee)
    return db_employee

@router.delete("/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if db_employee is None:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(db_employee)
    db.commit()
    return {"message": "Employee deleted successfully"}

@router.post("/matching", response_model=List[ProjectMatchingResult])
def project_matching(
    request: ProjectMatchingRequest,
    db: Session = Depends(get_db)
):
    employees = db.query(Employee).options(
        joinedload(Employee.skills),
        joinedload(Employee.projects),
        joinedload(Employee.availability)
    ).all()

    results = []
    for emp in employees:
        score = 0.0
        matching_skills = []

        employee_skills = [skill.name for skill in emp.skills]

        for required_skill in request.required_skills:
            if required_skill in employee_skills:
                score += 3.0
                matching_skills.append(required_skill)

        if request.preferred_skills:
            for preferred_skill in request.preferred_skills:
                if preferred_skill in employee_skills:
                    score += 1.0
                    matching_skills.append(preferred_skill)

        if request.unit_price_min and emp.unit_price_min:
            if emp.unit_price_min >= request.unit_price_min:
                score += 0.5

        if request.unit_price_max and emp.unit_price_max:
            if emp.unit_price_max <= request.unit_price_max:
                score += 0.5

        if score > 0:
            recent_projects = [proj.title for proj in emp.projects[-2:]]

            employee_list = EmployeeList(
                id=emp.id,
                name=emp.name,
                years_experience=emp.years_experience,
                main_role=emp.main_role,
                unit_price_min=emp.unit_price_min,
                unit_price_max=emp.unit_price_max,
                availability_status=emp.availability.status.value.lower() if emp.availability else None,
                main_skills=[skill.name for skill in emp.skills[:3]]
            )

            results.append(ProjectMatchingResult(
                employee=employee_list,
                score=score,
                matching_skills=matching_skills,
                recent_projects=recent_projects
            ))

    return sorted(results, key=lambda x: x.score, reverse=True)[:10]