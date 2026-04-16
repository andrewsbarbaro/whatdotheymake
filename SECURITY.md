# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, **please do not open a public GitHub issue**.

Report it privately by emailing **tellus@whatdotheymake.com** with:

- A clear description of the vulnerability
- Steps to reproduce
- Potential impact

We will acknowledge receipt within 48 hours and aim to ship a fix or mitigation within 7 days for critical issues.

## Scope

This project handles user-submitted salary data. Privacy of submissions is a core design constraint:

- No user accounts or sessions are stored
- No IP addresses are logged
- Submissions are identified only by a random delete token, which the submitter controls
- The optional anonymization feature fuzzes the salary value before storage — the original is never persisted

Vulnerabilities that could expose or de-anonymize submission data are treated as high priority.

## Out of Scope

- Issues in third-party dependencies (report those upstream)
- Denial-of-service without a realistic exploitation path
- Social engineering
