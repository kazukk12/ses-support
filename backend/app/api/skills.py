from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db.database import get_db
from ..models.employee import Skill
from ..schemas.employee import Skill as SkillSchema, SkillCreate

router = APIRouter()

@router.get("/", response_model=List[SkillSchema])
def get_skills(
    skip: int = 0,
    limit: int = 100,
    category: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(Skill)
    if category:
        query = query.filter(Skill.category == category)

    skills = query.offset(skip).limit(limit).all()
    return skills

@router.get("/categories")
def get_skill_categories(db: Session = Depends(get_db)):
    categories = db.query(Skill.category).distinct().all()
    return [cat[0] for cat in categories]

@router.post("/", response_model=SkillSchema)
def create_skill(skill: SkillCreate, db: Session = Depends(get_db)):
    existing_skill = db.query(Skill).filter(Skill.name == skill.name).first()
    if existing_skill:
        raise HTTPException(status_code=400, detail="Skill already exists")

    db_skill = Skill(name=skill.name, category=skill.category)
    db.add(db_skill)
    db.commit()
    db.refresh(db_skill)
    return db_skill

@router.delete("/{skill_id}")
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    db_skill = db.query(Skill).filter(Skill.id == skill_id).first()
    if db_skill is None:
        raise HTTPException(status_code=404, detail="Skill not found")

    db.delete(db_skill)
    db.commit()
    return {"message": "Skill deleted successfully"}