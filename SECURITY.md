# Security Policy

We take the security of this project seriously. Thank you for helping to protect our users and collaborators.

## Supported Versions

Only the latest release (on the `main` branch) is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## Reporting a Vulnerability

If you discover a security vulnerability within this project, please report it immediately. **Do not open a public GitHub issue.** Instead, follow the process below:

### 1. Submission Method
Email your findings directly to **shauryatiwari.code@gmail.com** (or your preferred security contact email) with the subject line `[SECURITY VULNERABILITY] <Brief Description>`.

### 2. Required Details
Please include as much detail as possible to help us reproduce and address the issue quickly:
* **Description**: A summary of the vulnerability type and its potential impact.
* **Steps to Reproduce**: A step-by-step guide (including any payload code or HTTP requests) to demonstrate the exploit.
* **Environment**: OS details, Node.js version, browser details, etc.
* **Mitigation (Optional)**: Any suggested fixes or temporary workarounds.

### 3. Response & Resolution Process
* **Acknowledgment**: We will acknowledge receipt of your report within **48 hours** and confirm if we can reproduce it.
* **Remediation**: If valid, we will work on a patch immediately. During this time, we ask that you maintain strict confidentiality regarding the report.
* **Disclosure**: Once a patch is merged and deployed, we will release a public advisory on GitHub and attribute the discovery to you (unless you prefer to remain anonymous).

---

## Security Practices in AgileSpace

To ensure the safety of project data, this tool implements:
* **Password Hashing**: Secure password hashing using `bcryptjs` before storage in SQLite.
* **JWT Authentication**: Stateless, signature-verified JSON Web Tokens (JWT) for all private endpoints.
* **Static File Isolation**: Express only exposes the client build (`dist/`) and specific avatar uploads, preventing arbitrary server file reads.
