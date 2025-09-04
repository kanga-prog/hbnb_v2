from flask import request,jsonify
from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.utils import save_file
from datetime import datetime, timedelta

from app.models import Place, Amenity, Review, PlaceImage, db,Reservation
from app.routes.reviews import review_model as review_input
from app.facades.place_facade import PlaceFacade

api = Namespace("places", description="Endpoints pour la gestion des lieux")

# =================== MODELS RESTX ===================

amenity_model = api.model("Amenity", {
    "id": fields.Integer(readOnly=True),
    "name": fields.String(required=True)
})

review_model = api.model("Review", {
    "id": fields.Integer(readOnly=True),
    "comment": fields.String(required=True, description="Review text"),
    "rating": fields.Integer(required=True, description="Rating (1–5)"),
    "user_id": fields.Integer(readOnly=True),
    "place_id": fields.Integer(readOnly=True),
})

image_output_model = api.model("Image", {
    "id": fields.Integer(readOnly=True),
    "url": fields.String(required=True)
})

image_input_model = api.model("ImageInput", {
    "url": fields.String(required=True)
})

place_model = api.model("Place", {
    "id": fields.Integer(readOnly=True),
    "name": fields.String(required=True),
    "description": fields.String,
    "price_by_night": fields.Integer(required=True),
    "location": fields.String,
    "country": fields.String,
    "town": fields.String,
    "latitude": fields.Float,
    "longitude": fields.Float,
    "owner_id": fields.Integer,
    "amenities": fields.List(fields.Nested(amenity_model)),
    "reviews": fields.List(fields.Nested(review_model)),
    "images": fields.List(fields.Nested(image_output_model))
})

place_input_model = api.model("PlaceInput", {
    "name": fields.String(required=True),
    "description": fields.String,
    "price_by_night": fields.Integer(required=True),
    "location": fields.String,
    "country": fields.String,
    "town": fields.String,
    "latitude": fields.Float,
    "longitude": fields.Float,
    "amenity_ids": fields.List(fields.Integer)
})

# =================== ROUTES ===================

# ---------- PLACES ----------
@api.route("/", strict_slashes=False)
class PlaceList(Resource):
    @api.marshal_list_with(place_model)
    def get(self):
        """Lister toutes les places (PUBLIC)"""
        return Place.query.all(), 200

    @api.expect(place_input_model, validate=True)
    @api.marshal_with(place_model, code=201)
    @jwt_required()
    def post(self):
        """Créer une nouvelle place (AUTH)"""
        data = request.get_json()
        user_id = int(get_jwt_identity())

        new_place = Place(
            name=data["name"],
            description=data.get("description"),
            price_by_night=data["price_by_night"],
            location=data.get("location"),
            country=data.get("country"),
            town=data.get("town"),
            latitude=data.get("latitude"),
            longitude=data.get("longitude"),
            owner_id=user_id
        )

        if "amenity_ids" in data:
            new_place.amenities = Amenity.query.filter(
                Amenity.id.in_(data["amenity_ids"])
            ).all()

        db.session.add(new_place)
        db.session.commit()
        return new_place, 201

@api.route("/<string:identifier>", strict_slashes=False)
class PlaceResource(Resource):
    @api.marshal_with(place_model)
    def get(self, identifier):
        """Récupérer une place par ID (PUBLIC)"""
        try:
            place_id = int(identifier)
        except ValueError:
            return {"message": "Invalid identifier (only ID supported)"}, 400

        place = Place.query.get(place_id)
        if not place:
            return {"message": "Place not found"}, 404
        return place, 200

    @api.expect(place_input_model)
    @api.marshal_with(place_model)
    @jwt_required()
    def put(self, identifier):
        """Mettre à jour une place (AUTH + OWNER)"""
        try:
            place_id = int(identifier)
        except ValueError:
            return {"message": "Invalid identifier (only ID supported)"}, 400

        place = Place.query.get(place_id)
        if not place:
            return {"message": "Place not found"}, 404

        user_id = int(get_jwt_identity())
        if place.owner_id != user_id:
            return {"message": "Unauthorized"}, 403

        data = request.get_json()
        if not isinstance(data, dict):
            return {"message": "Expected JSON object"}, 400

        # Champs à mettre à jour
        updatable_fields = [
            "name",
            "description",
            "price_by_night",
            "location",
            "country",
            "town",
            "latitude",
            "longitude",
        ]
        for field in updatable_fields:
            if field in data:
                setattr(place, field, data[field])

        # Mettre à jour les amenities si fournis
        if "amenity_ids" in data and isinstance(data["amenity_ids"], list):
            amenities = Amenity.query.filter(Amenity.id.in_(data["amenity_ids"])).all()
            place.amenities = amenities

        db.session.commit()
        return place, 200

    @jwt_required()
    def delete(self, identifier):
        """Supprimer une place (AUTH + OWNER)"""
        try:
            place_id = int(identifier)
        except ValueError:
            return {"message": "Invalid identifier (only ID supported)"}, 400

        place = Place.query.get(place_id)
        if not place:
            return {"message": "Place not found"}, 404

        user_id = int(get_jwt_identity())
        if place.owner_id != user_id:
            return {"message": "Unauthorized"}, 403

        db.session.delete(place)
        db.session.commit()
        return {"message": "Place deleted"}, 200

# ---------- AMENITIES ----------
@api.route("/<int:place_id>/amenities", strict_slashes=False)
class PlaceAmenities(Resource):
    @api.marshal_list_with(amenity_model)
    def get(self, place_id):
        """Lister les amenities d'une place (PUBLIC)"""
        place = Place.query.get(place_id)
        if not place:
            return {"message": "Place not found"}, 404
        return place.amenities, 200

    @api.expect(fields.Nested(amenity_model), validate=True)
    @api.marshal_list_with(amenity_model)
    @jwt_required()
    def post(self, place_id):
        """Associer un nouvel amenity à une place (AUTH + OWNER)"""
        place = Place.query.get(place_id)
        if not place:
            return {"message": "Place not found"}, 404

        user_id = int(get_jwt_identity())
        if place.owner_id != user_id:
            return {"message": "Unauthorized"}, 403

        data = request.get_json()
        if not isinstance(data, dict) or "name" not in data:
            return {"message": "Expected JSON object with a name"}, 400

        amenity = Amenity.query.filter_by(name=data["name"]).first()
        if not amenity:
            amenity = Amenity(name=data["name"])
            db.session.add(amenity)
            db.session.commit()

        if amenity not in place.amenities:
            place.amenities.append(amenity)
            db.session.commit()

        return place.amenities, 200

# ---------- IMAGES ----------
@api.route('/<int:place_id>/images', strict_slashes=False)
class PlaceImages(Resource):
    @api.marshal_list_with(image_output_model)
    def get(self, place_id):
        place = Place.query.get(place_id)
        if not place:
            return {'message': 'Place not found'}, 404
        return place.images, 200

    @jwt_required()
    @api.marshal_with(image_output_model, code=201)
    def post(self, place_id):
        try:
            place = Place.query.get(place_id)
            if not place:
                return {'message': 'Place not found'}, 404

            user_id = int(get_jwt_identity())
            if place.owner_id != user_id:
                return {'message': 'Unauthorized'}, 403

            # 1️⃣ Cas fichier upload
            if request.content_type and request.content_type.startswith("multipart/form-data"):
                if "file" not in request.files:
                    return {"message": "Missing file field"}, 400
                file = request.files["file"]
                url = save_file(file)  # ta fonction qui stocke le fichier
                image = PlaceImage(url=url, place=place)
                db.session.add(image)
                db.session.commit()
                return image, 201

            # 2️⃣ Cas JSON (URL fournie)
            elif request.is_json:
                data = request.get_json(silent=True)  # safe parse
                if not data or "url" not in data:
                    return {"message": "Missing URL"}, 400
                image = PlaceImage(url=data["url"], place=place)
                db.session.add(image)
                db.session.commit()
                return image, 201

            # 3️⃣ Format non supporté
            else:
                return {"message": "Unsupported Media Type"}, 415

        except Exception as e:
            db.session.rollback()
            print(f"[ERROR upload image] {e}")  # log côté serveur
            return {
                "message": "Internal Server Error",
                "details": str(e)
            }, 500

    @api.expect(image_input_model)
    @api.marshal_with(image_output_model)
    @jwt_required()
    def put(self, place_id, image_id):
        image = PlaceImage.query.filter_by(id=image_id, place_id=place_id).first()
        if not image:
            return {'message': 'Image not found'}, 404

        user_id = int(get_jwt_identity())
        if image.place.owner_id != user_id:
            return {'message': 'Unauthorized'}, 403

        data = request.get_json()
        image.url = data.get('url', image.url)
        db.session.commit()
        return image, 200

    @jwt_required()
    def delete(self, place_id, image_id):
        image = PlaceImage.query.filter_by(id=image_id, place_id=place_id).first()
        if not image:
            return {'message': 'Image not found'}, 404

        user_id = int(get_jwt_identity())
        if image.place.owner_id != user_id:
            return {'message': 'Unauthorized'}, 403

        db.session.delete(image)
        db.session.commit()
        return {'message': 'Image deleted'}, 200

# ---------- REVIEWS ----------
@api.route("/<int:place_id>/reviews")
class PlaceReviews(Resource):
    @api.marshal_list_with(review_model)
    def get(self, place_id):
        place = Place.query.get(place_id)
        if not place:
            return {"message": "Place not found"}, 404

        reviews = []
        for r in place.reviews:
            reviews.append({
                "id": r.id,
                "comment": r.comment,
                "rating": r.rating,
                "user_id": r.user_id,
                "user_name": getattr(r.user, "username", "Anonyme"),
                "user_photo": getattr(r.user, "photo_url", "/uploads/default-avatar.png"),
                "place_id": r.place_id,
                "created_at": r.created_at.isoformat() if r.created_at else None
            })
        return reviews, 200

    @api.expect(review_input)
    @jwt_required()
    def post(self, place_id):
        user_id = int(get_jwt_identity())
        place = Place.query.get(place_id)
        if not place:
            return {"message": "Place not found"}, 404

        data = request.get_json()
        review = Review(
            comment=data["comment"],
            rating=data["rating"],
            user_id=user_id,
            place_id=place_id
        )
        db.session.add(review)
        db.session.commit()

        return {
            "id": review.id,
            "comment": review.comment,
            "rating": review.rating,
            "user_id": review.user_id,
            "user_name": getattr(review.user, "username", "Anonyme"),
            "user_photo": getattr(review.user, "photo_url", "/uploads/default-avatar.png"),
            "place_id": review.place_id,
            "created_at": review.created_at.isoformat() if review.created_at else None
        }, 201


@api.route("/<int:place_id>/reviews/<int:review_id>")
class ReviewResource(Resource):
    @api.marshal_with(review_model)
    def get(self, place_id, review_id):
        review = Review.query.filter_by(id=review_id, place_id=place_id).first()
        if not review:
            return {"message": "Review not found"}, 404

        return {
            "id": review.id,
            "comment": review.comment,
            "rating": review.rating,
            "user_id": review.user_id,
            "user_name": getattr(review.user, "username", "Anonyme"),
            "user_photo": getattr(review.user, "photo_url", "/uploads/default-avatar.png"),
            "place_id": review.place_id,
            "created_at": review.created_at.isoformat() if review.created_at else None
        }, 200

    @api.expect(review_input)
    @jwt_required()
    def put(self, place_id, review_id):
        user_id = int(get_jwt_identity())
        review = Review.query.filter_by(id=review_id, place_id=place_id).first()
        if not review:
            return {"message": "Review not found"}, 404
        if review.user_id != user_id:
            return {"message": "Unauthorized"}, 403

        data = request.get_json()
        review.comment = data.get("comment", review.comment)
        review.rating = data.get("rating", review.rating)
        db.session.commit()

        return {
            "id": review.id,
            "comment": review.comment,
            "rating": review.rating,
            "user_id": review.user_id,
            "user_name": getattr(review.user, "username", "Anonyme"),
            "user_photo": getattr(review.user, "photo_url", "/uploads/default-avatar.png"),
            "place_id": review.place_id,
            "created_at": review.created_at.isoformat() if review.created_at else None
        }, 200

    @jwt_required()
    def delete(self, place_id, review_id):
        user_id = int(get_jwt_identity())
        review = Review.query.filter_by(id=review_id, place_id=place_id).first()
        if not review:
            return {"message": "Review not found"}, 404
        if review.user_id != user_id:
            return {"message": "Unauthorized"}, 403

        db.session.delete(review)
        db.session.commit()
        return {"message": "Review deleted", "id": review_id}, 200

