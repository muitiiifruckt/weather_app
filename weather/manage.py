from app import create_app, db
from app.models import SearchHistory

app = create_app()


def get_city_search_counts():
    try:
        with app.app_context():
            # Запрос к базе данных для подсчета количества запросов для каждого города
            results = db.session.query(SearchHistory.city, db.func.sum(SearchHistory.search_count).label('total_count')) \
                .group_by(SearchHistory.city) \
                .all()

            city_counts = {city: count for city, count in results}

            return city_counts
    except Exception as e:
        print(f"Error retrieving city search counts: {e}")
        return {}


def print_search_history():
    try:
        with app.app_context():
            # Запрос всех данных из таблицы search_history
            results = SearchHistory.query.all()

            for record in results:
                print(
                    f"ID: {record.id}, User ID: {record.user_id}, City: {record.city}, Search Count: {record.search_count}, Last Searched: {record.last_searched}")

    except Exception as e:
        print(f"Error retrieving search history: {e}")


if __name__ == '__main__':
    # Получение и вывод количества запросов по городам
    city_counts = get_city_search_counts()
    print("City Search Counts:")
    for city, count in city_counts.items():
        print(f"{city}: {count}")

    # Вывод истории поиска
    print("\nSearch History:")
    print_search_history()
