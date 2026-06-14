AUTH:
POST   /login          -> { email, password }
POST   /register       -> { name, email, password, password_confirmation }
POST   /logout         -> (butuh token)
GET    /me             -> (butuh token)

TEAMS:
GET    /teams               -> list semua tim
POST   /teams               -> { name, category, status }
GET    /teams/{id}          -> detail tim
PUT    /teams/{id}          -> update tim
DELETE /teams/{id}          -> hapus tim
POST   /teams/{id}/members  -> { user_id, role }

TASKS:
GET    /tasks          -> list tugas
POST   /tasks          -> { team_id, user_id, title, due_date, priority, status, progress }
GET    /tasks/{id}     -> detail tugas
PUT    /tasks/{id}     -> update tugas
DELETE /tasks/{id}     -> hapus tugas

ATTENDANCES:
GET    /attendances         -> list absensi
POST   /attendances         -> { date, clock_in, status, location_lat, location_long }
PUT    /attendances/{id}    -> update absensi

NOTIFICATIONS:
GET    /notifications               -> list notifikasi
PATCH  /notifications/{id}/read     -> tandai dibaca
PATCH  /notifications/read-all      -> tandai semua dibaca
DELETE /notifications/{id}          -> hapus

INSIGHTS:
GET    /insights/user          -> insight milik user
GET    /insights/team/{id}     -> insight milik tim
POST   /insights               -> { target_type, target_id, content, type }