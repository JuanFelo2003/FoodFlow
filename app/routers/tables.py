from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.permissions import require_role
from app.db.session import get_db
from app.models.table import TableStatus
from app.services.table_service import TableService


router = APIRouter(
    prefix="/tables",
    tags=["Mesas"],
)


@router.get("/")
def get_tables(
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = TableService(db)

    return service.get_all_tables()


@router.get("/status/{table_status}")
def get_tables_by_status(
    table_status: TableStatus,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter", "cashier", "kitchen")
    ),
):
    service = TableService(db)

    return service.get_tables_by_status(table_status)


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_table(
    number: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    service = TableService(db)

    try:
        return service.create_table(number)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(error),
        )


@router.put("/{table_id}/status")
def update_table_status(
    table_id: int,
    table_status: TableStatus,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(
        require_role("admin", "waiter")
    ),
):
    service = TableService(db)

    try:
        return service.update_table_status(
            table_id=table_id,
            status=table_status,
        )
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )


@router.delete("/{table_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_table(
    table_id: int,
    db: Session = Depends(get_db),
    current_employee: dict = Depends(require_role("admin")),
):
    service = TableService(db)

    try:
        service.delete_table(table_id)
    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        )
