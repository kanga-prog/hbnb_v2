from flask_restx import Namespace, Resource, fields
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta

from app.models import Review, Reservation
from app.extensions import db

api = Namespace('reviews', description='Endpoints related to reviews')

# --- Review model ---
review_model = api.model('Review', {
    'id': fields.Integer(readOnly=True),
    'comment': fields.String(required=True, description='Review text'),
    'rating': fields.Integer(required=True, description='Rating score, 1 to 5'),
    'user_id': fields.Integer(readOnly=True),
    'place_id': fields.Integer(readOnly=True),
})

# ========================
# /api/places/<place_id>/reviews
# ========================
@api.route('/places/<int:place_id>/reviews', strict_slashes=False)
@api.doc(params={'place_id': 'ID of the place'})
class PlaceReviews(Resource):
    @api.marshal_list_with(review_model)
    def get(self, place_id):
        """List all reviews for a given place"""
        return Review.query.filter_by(place_id=place_id).all()

    @jwt_required()
    @api.expect(review_model, validate=True)
    @api.marshal_with(review_model, code=201)
    def post(self, place_id):
        """Create a new review for a place"""
        user_id = get_jwt_identity()
        data = request.get_json()

        rating = data.get('rating')
        comment = data.get('comment')

        if rating is None or not (1 <= rating <= 5):
            api.abort(400, "Rating must be between 1 and 5.")

        # Un seul review par user & place
        existing = Review.query.filter_by(user_id=user_id, place_id=place_id).first()
        if existing:
            api.abort(400, "You have already reviewed this place.")

        # Vérif réservation terminée depuis 15 min
        now = datetime.utcnow()
        fifteen_minutes_ago = now - timedelta(minutes=15)
        reservation = Reservation.query.filter_by(user_id=user_id, place_id=place_id) \
            .filter(Reservation.end_datetime <= fifteen_minutes_ago).first()

        if not reservation:
            api.abort(403, "You must complete a reservation before reviewing.")

        review = Review(
            user_id=user_id,
            place_id=place_id,
            rating=rating,
            comment=comment
        )
        db.session.add(review)
        db.session.commit()
        return review, 201

# ========================
# /api/reviews/<id>
# ========================
@api.route('/<int:id>', strict_slashes=False)
@api.response(404, 'Review not found')
class ReviewDetail(Resource):
    @api.marshal_with(review_model)
    def get(self, id):
        """Get a review by ID"""
        return Review.query.get_or_404(id)

    @jwt_required()
    @api.expect(review_model)
    @api.marshal_with(review_model)
    def put(self, id):
        """Update a review (only by the author)"""
        review = Review.query.get_or_404(id)
        user_id = get_jwt_identity()

        if review.user_id != user_id:
            api.abort(403, "You are not authorized to update this review.")

        data = request.get_json()
        comment = data.get('comment', review.comment)
        rating = data.get('rating', review.rating)

        if rating is not None and not (1 <= rating <= 5):
            api.abort(400, "Rating must be between 1 and 5.")

        review.comment = comment
        review.rating = rating
        db.session.commit()
        return review

    @jwt_required()
    @api.response(204, 'Review deleted')
    def delete(self, id):
        """Delete a review (only by the author)"""
        review = Review.query.get_or_404(id)
        user_id = get_jwt_identity()

        if review.user_id != user_id:
            api.abort(403, "You are not authorized to delete this review.")

        db.session.delete(review)
        db.session.commit()
        return '', 204

# ========================
# /api/reviews/user/<user_id>
# ========================
@api.route('/user/<int:user_id>', strict_slashes=False)
class ReviewsByUser(Resource):
    @api.marshal_list_with(review_model)
    def get(self, user_id):
        """Get all reviews made by a specific user"""
        reviews = Review.query.filter_by(user_id=user_id).all()
        return reviews or []

