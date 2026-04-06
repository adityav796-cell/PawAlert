# PawAlert Admin Panel

## Overview
The admin panel is a hidden management interface for PawAlert administrators only. It is not linked to anywhere in the main app and is accessed by directly navigating to `/admin/login`.

## Access

### Admin Credentials
- **Email**: admin@pawalert.app
- **Password**: PawAlert@2024

### Admin Routes
- `/admin/login` - Hidden login page (not linked from anywhere)
- `/admin/dashboard` - Main admin dashboard (requires login)

## Features

### 1. Admin Login (`/admin/login`)
- Simple email and password login form
- Hardcoded credentials for one admin account
- Session stored in localStorage upon successful login
- Redirect to `/admin/login` if credentials are invalid
- Error message displayed for invalid credentials

### 2. Admin Dashboard (`/admin/dashboard`)
- **Automatic Protection**: Redirects non-logged-in users to `/admin/login`
- **Logout Button**: Available in the sidebar of all admin pages

#### Stats Section
Four stat cards showing today's metrics:
- Total Reports Today
- Rescue Pending count
- Volunteer Notified count
- Rescued count

#### Reports Table
Full database view with sortable, searchable data:
- **Columns**: Report ID, Animal Type, Location, Reporter, NGO Assigned, Status, Time Reported, Actions
- **Search**: Filter by city, animal type, or reporter name
- **Sort**: By Status or Time Reported
- **Selectable Rows**: Checkboxes for bulk operations

### 3. Admin Actions

#### Per-Report Actions
- **Edit (✏️)**: Opens modal to edit:
  - Animal type
  - Location
  - Area
  - Status
  - Notes
  - Saves instantly to Supabase
  
- **Delete (🗑️)**: Shows confirmation popup before permanent deletion
  
- **View Reporter (📞)**: Click reporter name to see contact details and call button

#### Bulk Actions
When multiple rows are selected, a bulk action bar appears with:
- **Bulk Delete**: Delete all selected reports
- **Bulk Mark as Rescued**: Mark all selected reports as rescued
- **Bulk Reassign NGO**: Assign all selected reports to a different NGO

### 4. Design
- **Sidebar**: Dark navy background with admin branding
- **Main Content**: Clean white background with light gray accents
- **Color Scheme**: 
  - Primary: Dark navy (slate-900)
  - Accents: Blue, green, red, purple, amber
  - Background: Light slate
- **Responsive**: Works on desktop and tablet, optimized for management

## File Structure

```
app/
  admin/
    login/page.tsx                 # Login page
    dashboard/page.tsx             # Dashboard page
    actions.ts                     # Server actions for admin operations
    layout.tsx                     # Admin section layout

components/admin/
  admin-layout.tsx                 # Sidebar and main layout
  admin-stats.tsx                  # Stats cards component
  admin-reports-table.tsx          # Reports table with actions
  admin-edit-modal.tsx             # Edit report modal
  admin-delete-modal.tsx           # Delete confirmation modal
  admin-bulk-actions.tsx           # Bulk action bar and modals
  admin-protected-route.tsx        # Route protection component

lib/
  admin-auth.ts                    # Admin authentication utilities
```

## Authentication Flow
1. User navigates to `/admin/login`
2. Enters email and password
3. Credentials validated against hardcoded values
4. If valid: Session created and stored in localStorage, redirect to `/admin/dashboard`
5. If invalid: Error message displayed, user remains on login page
6. On admin pages: Check localStorage for valid session on component mount
7. If no valid session: Redirect to `/admin/login`
8. Logout: Clear session from localStorage and redirect to login

## Security Notes
- Credentials are hardcoded (suitable for single admin)
- Session stored in localStorage (browser-based, cleared on logout)
- No auth tokens or complex session management needed
- Admin pages perform client-side redirect check on mount
- All Supabase operations use standard server actions with no special permissions needed

## Future Enhancements
- Supabase-based authentication instead of hardcoded credentials
- Admin user management (multiple admin accounts)
- Role-based access control
- Audit logs for all admin actions
- Advanced filtering and reporting
- Export data to CSV
- Bulk photo uploads for rescued animals
