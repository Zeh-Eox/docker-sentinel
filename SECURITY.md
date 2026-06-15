# Security Policy

## Reporting a vulnerability

Please do not open public issues for security vulnerabilities.

Report sensitive findings by contacting the maintainer directly or by opening a private security advisory on GitHub.

## Operational security notes

Docker Sentinel mounts `/var/run/docker.sock` so it can inspect running containers and stream logs. Access to this socket is highly privileged and should be limited to trusted hosts.

Never commit `.env`, webhook URLs, bot tokens, SMTP credentials, or Gemini API keys. Use `.env.example` as a template only.
