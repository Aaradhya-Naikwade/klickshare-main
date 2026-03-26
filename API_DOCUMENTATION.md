# Klickshare API Documentation (for React Native)

## 1) Base Info

- Base URL (local): `http://localhost:3000`
- API prefix: `/api`
- Auth header (protected routes):
  - `Authorization: Bearer <token>`
- Content types:
  - JSON endpoints: `Content-Type: application/json`
  - File upload endpoints: `multipart/form-data`

## 2) Authentication Rules (Token-Based)

- OTP is dynamically generated and sent via SMS.
- Login/signup returns a JWT token.
- Logout is client-side (discard token). No server-side session exists.
- Protected routes return `401 Unauthorized` when token is missing/invalid/expired.

---

## 3) Auth APIs

### Flow Summary (Login vs Signup)
- Step 1 (both): `POST /api/auth/send-otp` sends OTP and returns `{ exists: true | false }`.
- Existing user (login):
  - Step 2: `POST /api/auth/verify-otp` validates OTP and returns `{ token, user }`.
- New user (signup):
  - Step 2: User selects role and fills signup form.
  - Step 3: `POST /api/auth/complete-signup` validates OTP, creates user, and returns `{ token, user }`.

### 3.1 Send OTP
- Method: `POST`
- Path: `/api/auth/send-otp`
- Auth: No
- Body:
```json
{ "phone": "9876543210" }
```
- Notes:
  - OTP is always sent for a valid phone number.
  - Response includes `exists` so client can branch to login or signup.
- Success `200`:
```json
{ "success": true, "exists": true }
```
- Success `200` (user does not exist):
```json
{ "success": true, "exists": false }
```
- Error cases:
  - `400`: `{ "error": "Phone required" }`

### 3.2 Verify OTP (login)
- Method: `POST`
- Path: `/api/auth/verify-otp`
- Auth: No
- Body:
```json
{ "phone": "9876543210", "otp": "0000" }
```
- Case A: Existing user (`200`)
```json
{ "exists": true, "token": "<jwt>", "user": { "...": "..." } }
```
- Case B: New user (`200`)
```json
{ "exists": false }
```
- Error cases:
  - `400`: `{ "error": "Invalid OTP" }`
  - `500`: `{ "error": "Server error" }`

### 3.3 Complete Signup
- Method: `POST`
- Path: `/api/auth/complete-signup`
- Auth: No
- Body:
```json
{
  "phone": "9876543210",
  "role": "viewer",
  "name": "John",
  "companyName": "Studio X",
  "otp": "0000"
}
```
- Notes:
  - `companyName` is stored only when `role = photographer`.
- Success `200`:
```json
{ "token": "<jwt>", "user": { "...": "..." } }
```
- Error cases:
  - `400`: `{ "error": "Invalid OTP" }`
  - `409`: `{ "error": "User already exists" }`
  - `500`: `{ "error": "Signup failed" }`

### 3.4 Logout
- Method: `POST`
- Path: `/api/auth/logout`
- Auth: Yes
- Success `200`:
```json
{ "success": true }
```
- Error cases:
  - `401`: `{ "error": "Unauthorized" }`
  - `500`: `{ "error": "Logout failed" }`

---

## 4) User APIs

### 4.1 Get Current User
- Method: `GET`
- Path: `/api/user/me`
- Auth: Yes
- Success `200`:
```json
{
  "_id": "...",
  "name": "John",
  "phone": "9876543210",
  "role": "viewer",
  "companyName": "",
  "profilePhoto": "",
  "createdAt": "...",
  "lastLoginAt": "..."
}
```
- Error cases:
  - `401`: Unauthorized
  - `404`: User not found
  - `500`: Server error

### 4.2 Update Profile
- Method: `PUT`
- Path: `/api/user/update-profile`
- Auth: Yes
- Body (partial update):
```json
{ "name": "New Name", "companyName": "New Studio" }
```
- Notes:
  - `companyName` updates only for photographer role.
- Success `200`:
```json
{ "success": true, "user": { "...": "..." } }
```
- Error cases:
  - `401`, `404`, `500`

### 4.3 Upload Profile Photo
- Method: `POST`
- Path: `/api/user/upload-photo`
- Auth: Yes
- Body: `multipart/form-data`
  - `file` (required)
- Success `200`:
```json
{ "success": true, "url": "https://..." }
```
- Background behavior:
  - Uploads to S3
  - Updates `user.profilePhoto`
  - Calls face service `/register-face` (failure does not fail upload response)
- Error cases:
  - `400`: `{ "error": "File missing" }`
  - `401`: Unauthorized
  - `500`: `{ "error": "Upload failed" }`

---

## 5) Event APIs

### 5.1 Create Event
- Method: `POST`
- Path: `/api/events/create`
- Auth: Yes
- Body:
```json
{ "title": "Wedding 2026", "description": "Evening event" }
```
- Success `200`:
```json
{
  "success": true,
  "event": {
    "_id": "...",
    "title": "Wedding 2026",
    "description": "Evening event",
    "ownerId": "...",
    "createdAt": "..."
  }
}
```
- Error cases:
  - `400`: Title required
  - `401`: Unauthorized
  - `403`: Only photographers can create events
  - `404`: User not found
  - `500`: Server error

### 5.2 Get My Events
- Method: `GET`
- Path: `/api/events/my-events`
- Auth: Yes
- Success `200`:
```json
{
  "success": true,
  "count": 1,
  "events": [
    {
      "_id": "...",
      "title": "Wedding 2026",
      "description": "",
      "ownerId": "...",
      "createdAt": "...",
      "groupCount": 2
    }
  ]
}
```
- Error cases:
  - `401`, `403`, `404`, `500`

### 5.3 Delete Event
- Method: `DELETE`
- Path: `/api/events/delete`
- Auth: Yes
- Body:
```json
{ "eventId": "..." }
```
- Success `200`:
```json
{ "success": true, "message": "Event and all related data deleted successfully" }
```
- Cascade delete behavior:
  - Deletes photos in all event groups
  - Deletes group memberships
  - Deletes groups
  - Deletes event
- Error cases:
  - `400`: Event ID required
  - `401`: Unauthorized
  - `403`: Not authorized
  - `404`: User/Event not found
  - `500`: Server error

---

## 6) Group APIs

### 6.1 Create Group
- Method: `POST`
- Path: `/api/groups/create`
- Auth: Yes
- Body:
```json
{
  "eventId": "...",
  "name": "Bride Side",
  "description": "Optional",
  "visibility": "private"
}
```
- Success `200`:
```json
{
  "success": true,
  "group": {
    "_id": "...",
    "name": "Bride Side",
    "description": "",
    "visibility": "private",
    "inviteCode": "AB12CD34",
    "qrCodeUrl": "INVITE:AB12CD34",
    "eventId": "...",
    "createdAt": "..."
  }
}
```
- Behavior:
  - Only photographer can create.
  - Photographer must own event.
  - Creator is auto-added as group member (`owner`, `full`, `approved`).
- Error cases:
  - `400`: Missing required fields
  - `401`, `403`, `404`, `500`

### 6.2 Get Public Groups
- Method: `GET`
- Path: `/api/groups/public`
- Auth: No
- Success `200`:
```json
{ "success": true, "count": 1, "groups": [ { "...": "..." } ] }
```
- Error cases:
  - `500`: Server error

### 6.3 Get Groups by Event
- Method: `GET`
- Path: `/api/groups/by-event?eventId=<id>`
- Auth: Yes
- Success `200`:
```json
{ "success": true, "count": 1, "groups": [ { "_id": "...", "name": "...", "eventId": "...", "createdAt": "..." } ] }
```
- Error cases:
  - `400`: Event ID required
  - `401`: Unauthorized
  - `500`: Server error

### 6.4 Get Group Details + Members
- Method: `GET`
- Path: `/api/groups/details?groupId=<id>`
- Auth: Yes
- Success `200`:
```json
{
  "success": true,
  "group": { "...": "..." },
  "members": [ { "_id": "...", "role": "viewer", "accessLevel": "partial", "status": "approved", "joinedAt": "...", "user": { "_id": "...", "name": "...", "phone": "...", "profilePhoto": "" } } ],
  "count": 1
}
```
- Includes member statuses: `approved`, `blocked`, `pending`.
- Error cases:
  - `400`: Group ID required
  - `401`, `404`, `500`

### 6.5 Get My Groups
- Method: `GET`
- Path: `/api/groups/my-groups`
- Auth: Yes
- Returns only memberships with `status = approved`.
- Success `200`:
```json
{ "success": true, "count": 1, "groups": [ { "membershipId": "...", "role": "viewer", "accessLevel": "partial", "joinedAt": "...", "group": { "...": "..." } } ] }
```
- Error cases:
  - `401`, `404`, `500`

### 6.6 Join Group
- Method: `POST`
- Path: `/api/groups/join`
- Auth: Yes
- Body (at least one required):
```json
{ "inviteCode": "AB12CD34" }
```
or
```json
{ "groupId": "..." }
```
- Behavior cases:
  - Public group -> auto `approved`
  - Private group -> `pending`
  - Existing `pending` -> `{ "message": "Join request already pending" }`
  - Existing `approved` -> `{ "message": "Already joined" }`
  - Existing `blocked` -> `403`
  - Existing `rejected` -> `403`
- Success (new membership) `200`:
```json
{ "success": true, "status": "pending", "membership": { "...": "..." } }
```
- Error cases:
  - `400`: Invite code or groupId required
  - `401`, `403`, `404`, `500`

### 6.7 Get Join Requests (owner inbox)
- Method: `GET`
- Path: `/api/groups/join-requests`
- Auth: Yes
- Returns pending requests for groups owned by current user.
- Success `200`:
```json
{ "success": true, "count": 1, "requests": [ { "_id": "...", "status": "pending", "joinedAt": "...", "user": { "...": "..." }, "group": { "...": "..." } } ] }
```
- Error cases:
  - `401`, `404`, `500`

### 6.8 Update Member (approve/reject/role/access/block)
- Method: `PUT`
- Path: `/api/groups/update-member`
- Auth: Yes (must be group owner)
- Body:
```json
{ "groupId": "...", "memberId": "...", "action": "approve" }
```
- Valid `action` values:
  - `approve`
  - `reject`
  - `upgradeAccess`
  - `downgradeAccess`
  - `makeContributor`
  - `makeViewer`
  - `block`
  - `unblock`
- Success `200`:
```json
{ "success": true, "member": { "_id": "...", "groupId": "...", "userId": "...", "role": "viewer", "accessLevel": "partial", "status": "approved", "updatedAt": "..." } }
```
- Error cases:
  - `400`: Missing data or Invalid action
  - `401`: Unauthorized
  - `403`: Only owner can manage members
  - `404`: Group/member/user not found
  - `500`: Server error

### 6.9 Leave Group
- Method: `DELETE`
- Path: `/api/groups/leave`
- Auth: Yes
- Body:
```json
{ "groupId": "..." }
```
- Success `200`:
```json
{ "success": true }
```
- Error cases:
  - `400`: Group ID required
  - `401`: Unauthorized
  - `403`: Owner cannot leave group
  - `404`: Not a member
  - `500`: Server error

### 6.10 Delete Group
- Method: `DELETE`
- Path: `/api/groups/delete`
- Auth: Yes (owner only)
- Body:
```json
{ "groupId": "..." }
```
- Success `200`:
```json
{ "success": true, "message": "Group deleted successfully" }
```
- Cascade delete behavior:
  - Deletes group photos
  - Deletes group members
  - Deletes group
- Error cases:
  - `400`: Group ID required
  - `401`, `403`, `404`, `500`

---

## 7) Photo APIs

### 7.1 Upload Group Photo
- Method: `POST`
- Path: `/api/photos/upload`
- Auth: Yes
- Body: `multipart/form-data`
  - `file` (required)
  - `groupId` (required)
- Permission:
  - Must be approved member
  - Role must be `owner` or `contributor`
- Success `200`:
```json
{ "success": true, "photo": { "_id": "...", "photoUrl": "...", "groupId": "...", "uploadedBy": "...", "createdAt": "...", "facesIndexed": false } }
```
- Background behavior:
  - Uploads to S3
  - Saves photo record
  - Calls face service `/index-group-photo`
  - On successful face API call, DB `facesIndexed` is updated to true (response may still show original value from created object)
- Error cases:
  - `400`: Missing data
  - `401`: Unauthorized
  - `403`: Not a group member / Upload not allowed
  - `404`: Group not found
  - `500`: Upload failed

### 7.2 Upload Folder (auto-create groups)
- Method: `POST`
- Path: `/api/photos/upload-folder`
- Auth: Yes (photographer only, must own event)
- Body: `multipart/form-data`
  - `eventId` (required)
  - `visibility` (optional, default `private`)
  - `file` (required, multiple; each filename should include relative path like `Wedding2026/Haldi/img1.jpg`)
- Behavior:
  - Creates a new group for each unique subfolder inside the uploaded folder
  - Root-level files go to a new `General` group
  - Does not reuse existing groups
  - Uploads each photo into its mapped group
  - Calls face service `/index-group-photo` per photo
- Success `200`:
```json
{
  "success": true,
  "groupCount": 3,
  "groups": [
    { "_id": "...", "name": "Haldi", "inviteCode": "...", "qrCodeUrl": "INVITE:..." }
  ],
  "count": 20,
  "photos": [
    { "_id": "...", "photoUrl": "...", "groupId": "...", "uploadedBy": "...", "createdAt": "...", "facesIndexed": false }
  ]
}
```
- Error cases:
  - `400`: Missing data
  - `401`: Unauthorized
  - `403`: Not allowed or not event owner
  - `404`: User/Event not found
  - `500`: Upload failed

### 7.3 Get Group Photos
- Method: `GET`
- Path: `/api/photos/group?groupId=<id>`
- Auth: Yes
- Access behavior:
  - `owner`/`contributor` or `accessLevel=full` -> all group photos
  - else (partial viewer) -> only photos uploaded by current user
- Success `200`:
```json
{ "success": true, "count": 2, "photos": [ { "_id": "...", "photoUrl": "...", "groupId": "...", "uploadedBy": "...", "createdAt": "..." } ] }
```
- Error cases:
  - `400`: Group ID required
  - `401`: Unauthorized
  - `403`: Access denied
  - `500`: Server error

### 7.4 My Face Matches
- Method: `GET`
- Path: `/api/photos/my-face`
- Auth: Yes
- Behavior:
  - Calls face service `/find-matches` with `user_id`
  - If face service fails/unreachable -> returns empty list, not error
  - Filters matched photos by groups where user has approved membership
- Success `200`:
```json
{ "success": true, "count": 1, "matches": [ { "_id": "...", "photoUrl": "...", "group": { "_id": "...", "name": "..." }, "createdAt": "..." } ] }
```
- Error cases:
  - `401`: Unauthorized
  - `500`: Server error


---

## 8) Notification APIs

### 8.1 Get Notifications
- Method: `GET`
- Path: `/api/notifications`
- Auth: Yes
- Success `200`:
```json
{ "success": true, "notifications": [ { "_id": "...", "userId": "...", "type": "join_request", "message": "...", "groupId": "...", "read": false, "createdAt": "...", "updatedAt": "..." } ] }
```
- Error cases:
  - `401`, `500`

### 8.2 Get Unread Count
- Method: `GET`
- Path: `/api/notifications/unread-count`
- Auth: Yes
- Success `200`:
```json
{ "success": true, "count": 3 }
```
- Error cases:
  - `401`, `500`

### 8.3 Mark One Read
- Method: `PUT`
- Path: `/api/notifications/read`
- Auth: Yes
- Body:
```json
{ "notificationId": "..." }
```
- Success `200`:
```json
{ "success": true }
```
- Error cases:
  - `400`: Notification ID required
  - `401`: Unauthorized
  - `404`: Notification not found
  - `500`: Server error

### 8.4 Mark All Read
- Method: `PUT`
- Path: `/api/notifications/read-all`
- Auth: Yes
- Success `200`:
```json
{ "success": true }
```
- Error cases:
  - `401`, `500`

### 8.5 Delete Notification
- Method: `DELETE`
- Path: `/api/notifications/delete`
- Auth: Yes
- Body:
```json
{ "notificationId": "..." }
```
- Success `200`:
```json
{ "success": true }
```
- Error cases:
  - `400`: Notification ID required
  - `401`: Unauthorized
  - `404`: Notification not found
  - `500`: Server error

---

## 9) Enums and Value Sets

- User role: `viewer | photographer`
- Group visibility: `public | private`
- Member role: `owner | contributor | viewer`
- Member access: `partial | full`
- Member status: `pending | approved | rejected | blocked`

---

## 10) Common Error Response Format

Most failures use:
```json
{ "error": "Some message" }
```

Some non-error business cases return `200` with `message` (example: already joined / pending join request).

---

## 11) Download APIs

### 11.1 Download Single Photo
- Method: `POST`
- Path: `/api/photos/download`
- Auth: Yes
- Body:
```json
{ "photoId": "..." }
```
- Access rules:
  - `owner` / `contributor` / `accessLevel=full` can download any photo in the group
  - partial access can download only their own uploads
  - `viewer` can download photos that appear in their **My Photos** (face match) list
- Success `200`:
```json
{ "success": true, "url": "https://signed-s3-url" }
```
- Error cases:
  - `400`: Photo ID required
  - `401`: Unauthorized
  - `403`: Access denied
  - `404`: Photo not found
  - `500`: Download failed

### 11.2 Bulk Download (ZIP)
- Method: `POST`
- Path: `/api/photos/bulk-download`
- Auth: Yes
- Body:
```json
{ "photoIds": ["...", "..."] }
```
- Behavior:
  - Returns a ZIP file (`application/zip`) containing all allowed photos.
  - Access rules are the same as single download.
- Success `200`:
  - Response is a ZIP stream with `Content-Disposition: attachment; filename="photos.zip"`
- Error cases:
  - `400`: Photo IDs required
  - `401`: Unauthorized
  - `403`: Access denied
  - `404`: Photos not found
  - `500`: Bulk download failed
