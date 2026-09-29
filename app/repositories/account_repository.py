from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.account import Account


class AccountRepository:

    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, account_id: int) -> Account | None:
        statement = select(Account).where(Account.id == account_id)
        return self.db.scalar(statement)

    def get_by_order(self, order_id: int) -> Account | None:
        statement = select(Account).where(Account.order_id == order_id)
        return self.db.scalar(statement)

    def create(self, account: Account) -> Account:
        self.db.add(account)
        self.db.commit()
        self.db.refresh(account)
        return account

    def update(self, account: Account) -> Account:
        self.db.commit()
        self.db.refresh(account)
        return account