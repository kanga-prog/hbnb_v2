# routes/user.py
from flask_restx import Namespace, Resource, fields
from flask import request
from app.facades.user_facade import UserFacade
from flask_jwt_extended import jwt_required, get_jwt_identity

api = Namespace('users', description='Endpoints related to users')

user_model = api.model('User', {
    'id': fields.Integer(readOnly=True),
    'username': fields.String(required=True),
    'email': fields.String(required=True),
    'phone_number': fields.String(required=True),
    'is_admin': fields.Boolean()
})

user_post_model = api.model('UserInput', {
    'username': fields.String(required=True),
    'email': fields.String(required=True),
    'password': fields.String(required=True),
    'phone_number': fields.String(required=True),
    'is_admin': fields.Boolean()
})

reset_request_model = api.model('ResetRequest', {
    'email': fields.String(required=True)
})

reset_password_model = api.model('ResetPassword', {
    'token': fields.String(required=True),
    'new_password': fields.String(required=True)
})

@api.route('/')
class UserList(Resource):
    @jwt_required()
    @api.marshal_list_with(user_model)
    def get(self):
        current_user_id = get_jwt_identity()
        current_user = UserFacade.get_user_or_404(current_user_id)
        if not current_user.is_admin:
            return {"message": "Admins only"}, 403
        return UserFacade.get_all_users()

    @api.expect(user_post_model)
    @api.marshal_with(user_model, code=201)
    def post(self):
        data = api.payload
        user = UserFacade.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            phone_number=data['phone_number'],
            is_admin=data.get('is_admin', False)
        )
        return user, 201

@api.route('/me')
class UserMe(Resource):
    @jwt_required()
    @api.marshal_with(user_model)
    def get(self):
        user_id = get_jwt_identity()
        return UserFacade.get_user_or_404(user_id)

    @jwt_required()
    @api.expect(user_post_model)
    @api.marshal_with(user_model)
    def put(self):
        user_id = get_jwt_identity()
        return UserFacade.update_user(user_id, **api.payload)

@api.route('/<int:id>')
@api.response(404, 'User not found')
class UserDetail(Resource):
    @jwt_required()
    @api.marshal_with(user_model)
    def get(self, id):
        current_user_id = get_jwt_identity()
        current_user = UserFacade.get_user_or_404(current_user_id)
        if not current_user.is_admin:
            return {"message": "Admins only"}, 403
        return UserFacade.get_user_or

@api.route("/<int:user_id>/avatar")
class UserAvatar(Resource):
    @jwt_required()
    def post(self, user_id):
        user = User.query.get(user_id)
        if not user:
            return {"message": "User not found"}, 404
        
        if 'file' not in request.files:
            return {"message": "No file part"}, 400
        
        file = request.files['file']
        if file.filename == '':
            return {"message": "No selected file"}, 400
        
        filename = secure_filename(file.filename)
        upload_folder = os.path.join(current_app.root_path, "uploads/avatars")
        os.makedirs(upload_folder, exist_ok=True)
        file.save(os.path.join(upload_folder, filename))
        
        user.avatar = f"/uploads/avatars/{filename}"
        db.session.commit()
        return {"avatar": user.avatar}, 200

