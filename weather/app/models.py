from . import db
from datetime import datetime

class SearchHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(255))
    city = db.Column(db.String(255))
    search_count = db.Column(db.Integer, default=1)
    last_searched = db.Column(db.DateTime, default=datetime.utcnow)
