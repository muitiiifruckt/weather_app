from flask import Blueprint, render_template, request, jsonify, session
from .models import SearchHistory
from . import db
from datetime import datetime

main = Blueprint('main', __name__)


@main.route('/')
def index():
    last_city = session.get('last_city', None)
    return render_template('index.html', last_city=last_city)

@main.route('/api/recent-searches', methods=['GET'])
def recent_searches():
    user_id = request.cookies.get('user_id', 'guest')
    recent_searches = db.session.query(SearchHistory.city).filter_by(user_id=user_id).order_by(
        SearchHistory.last_searched.desc()).limit(10).all()
    cities = [search.city for search in recent_searches]
    return jsonify({'recent_searches': cities}), 200

@main.route('/api/search', methods=['POST'])
def save_search():
    data = request.json
    user_id = request.cookies.get('user_id', 'guest')  # Чтение user_id из cookies
    city = data['city']

    history = SearchHistory.query.filter_by(user_id=user_id, city=city).first()
    if history:
        history.search_count += 1
        history.last_searched = datetime.utcnow()
    else:
        history = SearchHistory(user_id=user_id, city=city)
        db.session.add(history)

    db.session.commit()

    return jsonify({'status': 'success'}), 200


@main.route('/api/suggestions', methods=['GET'])
def get_suggestions():
    user_id = request.cookies.get('user_id', 'guest')
    suggestions = db.session.query(SearchHistory.city, SearchHistory.search_count).filter_by(user_id=user_id).order_by(
        SearchHistory.search_count.desc()).limit(10).all()
    return jsonify({'suggestions': [s.city for s in suggestions]}), 200


def print_search_history():
    try:
        # Запрос всех данных из таблицы search_history
        results = SearchHistory.query.all()

        for record in results:
            print(
                f"ID: {record.id}, User ID: {record.user_id}, City: {record.city}, Search Count: {record.search_count}, Last Searched: {record.last_searched}")

    except Exception as e:
        print(f"Error retrieving search history: {e}")


def get_city_search_counts():
    try:
        # Запрос к базе данных для подсчета количества запросов для каждого города
        results = db.session.query(SearchHistory.city, db.func.sum(SearchHistory.search_count).label('total_count')) \
            .group_by(SearchHistory.city) \
            .all()

        city_counts = {city: count for city, count in results}

        return city_counts
    except Exception as e:
        print(f"Error retrieving city search counts: {e}")
        return {}
print(get_city_search_counts())
print_search_history()
