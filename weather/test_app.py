import pytest
from app import create_app, db
from app.models import SearchHistory
from manage import get_city_search_counts



@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.drop_all()


def test_save_search(client):
    # Тестирование сохранения поиска
    response = client.post('/api/search', json={'city': 'New York'})
    assert response.status_code == 200

    with client.application.app_context():
        search = SearchHistory.query.filter_by(city='New York').first()
        assert search is not None
        assert search.search_count == 1


def test_get_suggestions(client):
    # Сначала добавим несколько поисков
    client.post('/api/search', json={'city': 'New York'})
    client.post('/api/search', json={'city': 'Los Angeles'})

    response = client.get('/api/recent-searches')
    assert response.status_code == 200

    data = response.json
    assert 'recent_searches' in data
    assert 'New York' in data['recent_searches']
    assert 'Los Angeles' in data['recent_searches']


def test_city_search_counts(client):
    # Тестирование подсчета количества запросов для каждого города
    client.post('/api/search', json={'city': 'New York'})
    client.post('/api/search', json={'city': 'Los Angeles'})
    client.post('/api/search', json={'city': 'New York'})

    with client.application.app_context():
        city_counts = get_city_search_counts()  # Функция из  manage.py
        assert city_counts['New York'] == 2
        assert city_counts['Los Angeles'] == 1

