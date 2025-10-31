from datetime import date, datetime

from database import db


class Meal(db.Model):
  __tablename__ = "meals"

  id = db.Column(db.Integer, primary_key=True)
  name = db.Column(db.String(120), nullable=False)
  calories = db.Column(db.Integer, nullable=False)
  date = db.Column(db.Date, default=date.today, nullable=False)
  created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

  def to_dict(self):
    return {
      "id": self.id,
      "name": self.name,
      "calories": self.calories,
      "date": self.date.isoformat(),
      "created_at": self.created_at.isoformat(),
    }
