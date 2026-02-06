
# Admin User Guide

This guide provides a comprehensive overview of the administrative roles and permissions system used in the Onchainweb platform. Proper management of these permissions is critical to the security and integrity of the application.

## 1. Admin Roles

There are two primary roles for administrators:

-   **Master Admin**: The highest level of authority, with unrestricted access to all administrative features. This role is intended for system owners and lead developers.
-   **Admin**: A standard administrator with a specific set of permissions. This role is intended for operational staff who manage day-to-day tasks.

### 1.1 Role Assignment

Roles are automatically assigned based on the email address used for login:

-   Emails starting with `master@` (e.g., `master@onchainweb.com`) are granted the **Master Admin** role.
-   All other authorized emails are granted the **Admin** role.

## 2. Permissions System

Permissions are granular and assigned to roles to control access to specific features.

### 2.1 Master Admin Permissions

Master Admins have a single, all-encompassing permission flag:

-   `all`: Grants access to every administrative function, including the ability to create and manage other administrators.

### 2.2 Default Admin Permissions

Standard Admins are granted the following permissions by default:

-   `manageUsers`: View and manage user profiles.
-   `manageBalances`: Adjust user balances (for correctional purposes).
-   `manageKYC`: Review, approve, and reject KYC submissions.
-   `manageTrades`: View and manage user trades.
-   `viewReports`: Access and generate financial and operational reports.

Custom permissions can be configured by a Master Admin.

## 3. Managing Admin Access

Access to the admin panel is strictly controlled by an allowlist in the project's environment configuration.

### 3.1 The Admin Allowlist

To grant a user admin access, their email address must be added to the `VITE_ADMIN_ALLOWLIST` variable in the `Onchainweb/.env` file.

```env
# Onchainweb/.env

VITE_ADMIN_ALLOWLIST=master@onchainweb.com,admin1@onchainweb.com,admin2@onchainweb.com
```

-   The list is a comma-separated string of email addresses.
-   Only users whose emails are on this list can log in to the admin panel.

### 3.2 Adding a New Administrator

To add a new administrator, follow these steps:

1.  **Add the email** to the `VITE_ADMIN_ALLOWLIST` in the `.env` file.
2.  **Create the user account** in the Firebase Authentication console. The email used for the Firebase account must match the email in the allowlist.
3.  **Provide the login credentials** to the new administrator.

### 3.3 Security Best Practices

-   Only grant `Master Admin` privileges to a minimal number of trusted individuals.
-   Regularly review the admin allowlist to ensure it is up-to-date.
-   Ensure that all admin accounts are protected with strong, unique passwords.

By adhering to these guidelines, we can maintain a secure and efficient administrative system.
