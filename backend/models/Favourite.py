from models.Base import Base
from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint

class Favourite(Base):
    __tablename__ = 'favourite'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    movie_id = Column(Integer, ForeignKey('data_movies.id'), nullable=False)
    __table_args__ = (UniqueConstraint('user_id', 'movie_id', name='_user_movie_uc'),)