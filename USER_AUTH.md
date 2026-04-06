# PawAlert User Authentication System

## Overview

PawAlert now includes two authentication systems:

1. **User Authentication** - Free OTP-based login for regular users
2. **Admin Authentication** - Hardcoded credentials for admin panel access

## User Authentication (OTP)

### How It Works

1. User taps "Account" tab in bottom navigation
2. User enters their 10-digit phone number
3. System generates a random 6-digit OTP
4. User receives OTP (logged to console in development)
5. User enters OTP to verify
6. User is logged in and can:
   - View their profile
   - Edit name and email
   - View their own reports
   - Track report status

### Technical Details

**Signup/Login Flow:**
- Phone number is validated (10-digit Indian format)
- OTP is stored in `otp_sessions` table with expiration (10 minutes)
- OTP has max 5 attempt limit
- User is created in `users` table on first login
- Session stored in localStorage with key: `pawalert_user_session`

**Database Tables:**

```sql
-- users table
- id (UUID)
- phone_number (TEXT, UNIQUE)
- name (TEXT)
- email (TEXT, optional)
- is_admin (BOOLEAN, default FALSE)
- created_at, updated_at (TIMESTAMPTZ)

-- otp_sessions table
- id (UUID)
- phone_number (TEXT)
- otp_code (TEXT)
- is_verified (BOOLEAN)
- attempts (INTEGER)
- created_at, expires_at (TIMESTAMPTZ)
- verified_at (TIMESTAMPTZ)
```

**OTP Testing (Development):**
- Check browser console for log: `[OTP] Phone: +91XXXXXXXXXX | OTP Code: XXXXXX`
- Enter the 6-digit code shown in console
- OTP is valid for 10 minutes

**Production Setup (Twilio Integration):**
```typescript
// In lib/whatsapp.ts, replace the mock implementation with:
const twilio = require('twilio');
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send OTP via SMS
await client.messages.create({
  body: `Your PawAlert verification code is: ${otpCode}`,
  from: process.env.TWILIO_PHONE_NUMBER,
  to: phoneNumber
});
```

## Admin Authentication

### Credentials

```
Email: admin@pawalert.app
Password: PawAlert@2024
```

**Access:** `/admin/login`

### Admin Capabilities

1. **Dashboard** - View all reports with statistics
2. **Search & Filter** - Find reports by city, animal type, reporter
3. **Edit Reports** - Modify animal type, location, area, status, notes
4. **Delete Reports** - Remove reports with confirmation
5. **Bulk Actions** - Edit/delete multiple reports at once
6. **View Details** - See reporter contact info, assigned NGO, rescue status

### Admin Session

- Stored in localStorage with key: `pawalert_admin_session`
- Contains: email, session_id, login_time
- Automatically checked on admin routes
- Logout clears session

## User Permissions

| Action | Non-logged User | Logged User | Admin |
|--------|-----------------|-------------|-------|
| View Reports | ✅ | ✅ | ✅ |
| Report Animal | ✅ | ✅ | ✅ |
| View Profile | ❌ | ✅ | ✅ |
| View Own Reports | ❌ | ✅ | ✅ |
| Edit Own Reports | ❌ | ❌ | ✅ |
| Delete Reports | ❌ | ❌ | ✅ |
| Assign NGO | ❌ | ❌ | ✅ |

## File Structure

```
lib/
├── user-auth.ts          # User auth utilities & session management
├── admin-auth.ts         # Admin auth utilities & session management

app/
├── user/
│   └── actions.ts        # Server actions: sendOTP, verifyOTP, etc.
├── admin/
│   ├── login/page.tsx    # Admin login page
│   └── dashboard/page.tsx # Admin dashboard
└── page.tsx              # Main app with user auth integration

components/
├── screens/
│   ├── user-login-screen.tsx    # OTP login UI
│   └── user-profile-screen.tsx  # User profile & reports
└── bottom-navigation.tsx        # Updated with Account tab
```

## Key Features

✅ **Free Authentication** - No external auth providers needed
✅ **OTP Security** - 6-digit codes with 10-minute expiration
✅ **Rate Limiting** - Max 5 OTP verification attempts
✅ **Phone Validation** - Only accepts valid Indian 10-digit numbers
✅ **User Reports** - Users can see all their submitted reports
✅ **Session Management** - Persistent login with localStorage
✅ **Role-based Access** - Admin and user roles with different permissions
✅ **Responsive Design** - Mobile-first UI matching app design

## Testing Checklist

- [ ] User can sign up with phone number
- [ ] OTP is generated and shown in console
- [ ] User can verify OTP with 6-digit code
- [ ] User can view profile after login
- [ ] User can edit name and email
- [ ] User can see their reports
- [ ] Admin can login with hardcoded credentials
- [ ] Admin can view all reports
- [ ] Admin can edit and delete reports
- [ ] Session persists after page reload
- [ ] Logout clears session

## Future Enhancements

1. **Twilio SMS Integration** - Send OTP via actual SMS
2. **Email Verification** - Optional email confirmation
3. **User Roles** - Support for NGO staff accounts
4. **Report History** - Track changes to each report
5. **Advanced Analytics** - Dashboard statistics for admins
6. **Push Notifications** - Real-time report alerts
