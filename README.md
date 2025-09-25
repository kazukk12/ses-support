# SES Support - キャリア支援ツール

SES企業向けの社内用キャリア支援ツール（MVP版）

## 機能概要

- エンジニア情報管理（スキル、経歴、稼働状況）
- 検索・フィルタ機能
- 案件マッチング
- 1on1記録・管理
- ダッシュボード

## 技術スタック

### フロントエンド
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS + shadcn/ui
- TanStack Query
- React Hook Form

### バックエンド
- FastAPI
- Pydantic
- SQLAlchemy + Alembic
- PostgreSQL

### インフラ
- Docker Compose

## 開発環境セットアップ

1. リポジトリをクローン
```bash
git clone [repository-url]
cd ses-support
```

2. 環境変数をコピー
```bash
cp .env.example .env
```

3. Docker Composeでサービスを起動
```bash
docker-compose up -d
```

4. データベースマイグレーション実行
```bash
docker-compose exec backend alembic upgrade head
```

## アクセス情報

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:8000
- API ドキュメント: http://localhost:8000/docs

## 開発コマンド

### バックエンド
```bash
# テスト実行
docker-compose exec backend pytest

# マイグレーション作成
docker-compose exec backend alembic revision --autogenerate -m "description"

# マイグレーション実行
docker-compose exec backend alembic upgrade head
```

### フロントエンド
```bash
# 型チェック
docker-compose exec frontend npm run type-check

# リント
docker-compose exec frontend npm run lint
```