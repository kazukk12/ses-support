from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from ..db.database import get_db, engine
from ..db.database import Base
from ..models.employee import Employee, Skill, Availability, OneOnOne, AvailabilityStatus, OneOnOneStatus

router = APIRouter()

@router.get("/init-db")
def init_database():
    """
    データベーステーブルを作成するAPI
    """
    try:
        # テーブル作成
        Base.metadata.create_all(bind=engine)
        return {
            "message": "🗄️ データベーステーブルが作成されました！",
            "status": "success"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"テーブル作成エラー: {str(e)}")


@router.get("/demo-data")
def create_demo_data(db: Session = Depends(get_db)):
    """
    デモ用テストデータを投入するAPI
    """
    try:
        # テーブル作成（存在しない場合）
        Base.metadata.create_all(bind=engine)

        # 既存データをクリア
        db.query(OneOnOne).delete()
        db.query(Availability).delete()
        db.query(Employee).delete()
        db.query(Skill).delete()
        db.commit()

        # スキルデータ
        skills_data = [
            # フロントエンド
            {"name": "React", "category": "フロントエンド"},
            {"name": "Vue.js", "category": "フロントエンド"},
            {"name": "Angular", "category": "フロントエンド"},
            {"name": "TypeScript", "category": "フロントエンド"},
            {"name": "JavaScript", "category": "フロントエンド"},

            # バックエンド
            {"name": "Python", "category": "バックエンド"},
            {"name": "Java", "category": "バックエンド"},
            {"name": "C#", "category": "バックエンド"},
            {"name": "Node.js", "category": "バックエンド"},
            {"name": "PHP", "category": "バックエンド"},
            {"name": "Ruby", "category": "バックエンド"},

            # データベース
            {"name": "PostgreSQL", "category": "データベース"},
            {"name": "MySQL", "category": "データベース"},
            {"name": "MongoDB", "category": "データベース"},
            {"name": "Redis", "category": "データベース"},

            # インフラ
            {"name": "AWS", "category": "インフラ"},
            {"name": "Docker", "category": "インフラ"},
            {"name": "Kubernetes", "category": "インフラ"},
            {"name": "Terraform", "category": "インフラ"},

            # その他
            {"name": "Git", "category": "その他"},
            {"name": "Figma", "category": "その他"},
            {"name": "Slack", "category": "その他"},
        ]

        skills = []
        for skill_data in skills_data:
            skill = Skill(**skill_data)
            skills.append(skill)
            db.add(skill)

        db.commit()

        # 社員データ
        employees_data = [
            {
                "name": "田中太郎",
                "main_role": "フロントエンドエンジニア",
                "years_experience": 5,
                "unit_price_min": 600000,
                "unit_price_max": 800000,
                "main_skills": ["React", "TypeScript", "JavaScript", "AWS"]
            },
            {
                "name": "佐藤花子",
                "main_role": "バックエンドエンジニア",
                "years_experience": 7,
                "unit_price_min": 700000,
                "unit_price_max": 900000,
                "main_skills": ["Python", "PostgreSQL", "Docker", "AWS"]
            },
            {
                "name": "鈴木一郎",
                "main_role": "フルスタックエンジニア",
                "years_experience": 3,
                "unit_price_min": 500000,
                "unit_price_max": 700000,
                "main_skills": ["Vue.js", "Node.js", "MySQL", "Git"]
            },
            {
                "name": "高橋美咲",
                "main_role": "インフラエンジニア",
                "years_experience": 6,
                "unit_price_min": 650000,
                "unit_price_max": 850000,
                "main_skills": ["AWS", "Docker", "Kubernetes", "Terraform"]
            },
            {
                "name": "伊藤健太",
                "main_role": "バックエンドエンジニア",
                "years_experience": 4,
                "unit_price_min": 550000,
                "unit_price_max": 750000,
                "main_skills": ["Java", "PostgreSQL", "Redis", "Git"]
            },
            {
                "name": "渡辺由美",
                "main_role": "フロントエンドエンジニア",
                "years_experience": 2,
                "unit_price_min": 450000,
                "unit_price_max": 600000,
                "main_skills": ["Angular", "TypeScript", "Figma"]
            },
            {
                "name": "山田慎也",
                "main_role": "フルスタックエンジニア",
                "years_experience": 8,
                "unit_price_min": 800000,
                "unit_price_max": 1000000,
                "main_skills": ["React", "Python", "PostgreSQL", "AWS", "Docker"]
            },
            {
                "name": "中村麻衣",
                "main_role": "バックエンドエンジニア",
                "years_experience": 5,
                "unit_price_min": 600000,
                "unit_price_max": 800000,
                "main_skills": ["C#", "MongoDB", "Redis"]
            },
            {
                "name": "小林拓也",
                "main_role": "フロントエンドエンジニア",
                "years_experience": 3,
                "unit_price_min": 500000,
                "unit_price_max": 650000,
                "main_skills": ["Vue.js", "JavaScript", "Figma"]
            },
            {
                "name": "加藤理恵",
                "main_role": "インフラエンジニア",
                "years_experience": 4,
                "unit_price_min": 550000,
                "unit_price_max": 750000,
                "main_skills": ["AWS", "Docker", "Git"]
            }
        ]

        employees = []
        for emp_data in employees_data:
            skills_names = emp_data.pop("main_skills")
            employee = Employee(**emp_data)

            # スキルを関連付け
            for skill_name in skills_names:
                skill = next((s for s in skills if s.name == skill_name), None)
                if skill:
                    employee.skills.append(skill)

            employees.append(employee)
            db.add(employee)

        db.commit()

        # アベイラビリティデータ
        availability_data = [
            {"employee_id": 1, "status": AvailabilityStatus.WORKING},
            {"employee_id": 2, "status": AvailabilityStatus.AVAILABLE_NEXT_MONTH},
            {"employee_id": 3, "status": AvailabilityStatus.IMMEDIATELY_AVAILABLE},
            {"employee_id": 4, "status": AvailabilityStatus.WORKING},
            {"employee_id": 5, "status": AvailabilityStatus.AVAILABLE_NEXT_MONTH},
            {"employee_id": 6, "status": AvailabilityStatus.IMMEDIATELY_AVAILABLE},
            {"employee_id": 7, "status": AvailabilityStatus.WORKING},
            {"employee_id": 8, "status": AvailabilityStatus.AVAILABLE_NEXT_MONTH},
        ]

        for avail_data in availability_data:
            availability = Availability(**avail_data)
            db.add(availability)

        db.commit()

        # 1on1データ
        oneonone_data = [
            {"employee_id": 1, "date": date(2025, 9, 15), "status": OneOnOneStatus.GOOD, "memo": "順調にプロジェクトを進めている"},
            {"employee_id": 2, "date": date(2025, 9, 18), "status": OneOnOneStatus.ATTENTION, "memo": "技術的な課題で悩んでいる様子"},
            {"employee_id": 3, "date": date(2025, 9, 20), "status": OneOnOneStatus.NORMAL, "memo": "特に問題なし"},
            {"employee_id": 4, "date": date(2025, 9, 22), "status": OneOnOneStatus.GOOD, "memo": "新しい技術の習得に意欲的"},
            {"employee_id": 1, "date": date(2025, 8, 15), "status": OneOnOneStatus.NORMAL, "memo": "前回の課題は解決済み"},
            {"employee_id": 2, "date": date(2025, 8, 18), "status": OneOnOneStatus.GOOD, "memo": "技術的な課題を克服し成長している"},
            {"employee_id": 5, "date": date(2025, 9, 25), "status": OneOnOneStatus.ATTENTION, "memo": "モチベーション低下気味"},
        ]

        for ono_data in oneonone_data:
            oneonone = OneOnOne(**ono_data)
            db.add(oneonone)

        db.commit()

        return {
            "message": "✅ デモデータの投入が完了しました！",
            "data": {
                "employees": len(employees),
                "skills": len(skills),
                "availability": len(availability_data),
                "one_on_ones": len(oneonone_data)
            }
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"データ投入エラー: {str(e)}")


@router.get("/reset-data")
def reset_data(db: Session = Depends(get_db)):
    """
    全データをクリアするAPI
    """
    try:
        db.query(OneOnOne).delete()
        db.query(Availability).delete()
        db.query(Employee).delete()
        db.query(Skill).delete()
        db.commit()

        return {
            "message": "🗑️ 全データがクリアされました！",
            "status": "success"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"データクリアエラー: {str(e)}")


@router.get("/status")
def get_seed_status(db: Session = Depends(get_db)):
    """
    現在のデータ状況を確認
    """
    try:
        employee_count = db.query(Employee).count()
        skill_count = db.query(Skill).count()
        availability_count = db.query(Availability).count()
        oneonone_count = db.query(OneOnOne).count()

        return {
            "employees": employee_count,
            "skills": skill_count,
            "availability": availability_count,
            "one_on_ones": oneonone_count,
            "has_data": employee_count > 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"データ確認エラー: {str(e)}")