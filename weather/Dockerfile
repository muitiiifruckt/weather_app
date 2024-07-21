# Используем базовый образ Python
FROM python:3.12-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы требований
COPY requirements.txt requirements.txt

# Устанавливаем зависимости
RUN pip install -r requirements.txt

# Копируем весь проект в контейнер
COPY . .

# Открываем порт для приложения
EXPOSE 5000

# Команда для запуска приложения
CMD ["python", "run.py"]
